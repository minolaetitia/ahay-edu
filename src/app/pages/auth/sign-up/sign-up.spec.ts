import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import SignUp from './sign-up';

describe('SignUp', () => {
  let component: SignUp;
  let fixture: any;
  let authService: AuthService;
  let router: Router;
  let translateService: TranslateService;
  let compiled: DebugElement;

  beforeEach(async () => {
    const authServiceMock = {
      register: vi.fn(),
      isAuthenticated: vi.fn(),
      authToken: vi.fn(),
      currentUser: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
      isLoggedIn: vi.fn(),
    };

    const routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SignUp, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    translateService = TestBed.inject(TranslateService);
    compiled = fixture.debugElement;

    // Setup translate service
    translateService.setDefaultLang('fr');
    translateService.use('fr');

    fixture.detectChanges();
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      component.email.set('');
      component.password.set('');

      fixture.detectChanges();

      expect(component.isFormValid()).toBe(false);
    });

    it('should enable submit button when form is valid', () => {
      component.email.set('user@example.mg');
      component.password.set('SecurePass123!');

      expect(component.isFormValid()).toBe(true);
    });

    it('should show email validation error for invalid email', () => {
      component.email.set('invalid-email');

      expect(component.emailError()).toBeTruthy();
    });

    it('should not show email error for valid email', () => {
      component.email.set('user@example.mg');

      expect(component.emailError()).toBe('');
    });

    it('should show password error for password < 12 chars', () => {
      component.password.set('Short123!');

      expect(component.passwordError()).toBeTruthy();
    });

    it('should not show password error for password >= 12 chars', () => {
      component.password.set('SecurePass123!');

      expect(component.passwordError()).toBe('');
    });
  });

  describe('Password Strength', () => {
    it('should calculate password strength correctly', () => {
      // Weak password
      component.password.set('password');
      expect(component.passwordStrengthPercentage()).toBeLessThan(40);

      // Fair password
      component.password.set('Pass12345678');
      expect(component.passwordStrengthPercentage()).toBeGreaterThanOrEqual(40);
      expect(component.passwordStrengthPercentage()).toBeLessThan(70);

      // Strong password
      component.password.set('SecureP@ssw0rd123!');
      expect(component.passwordStrengthPercentage()).toBeGreaterThanOrEqual(70);
    });

    it('should show correct strength text', () => {
      component.password.set('weak');
      expect(component.passwordStrengthText()).toMatch(/weak|faible/i);

      component.password.set('SecurePass123!');
      expect(component.passwordStrengthText()).toMatch(/good|good|tsara/i);
    });
  });

  describe('Form Submission', () => {
    it('should call authService.register on valid form submission', async () => {
      const registerSpy = vi.spyOn(authService, 'register').mockReturnValue(
        of({
          userId: '123',
          email: 'user@example.mg',
          token: 'test-token',
          role: 'student',
        }),
      );

      component.email.set('user@example.mg');
      component.password.set('SecurePass123!');
      component.onSubmit();

      expect(registerSpy).toHaveBeenCalledWith('user@example.mg', 'SecurePass123!');
    });

    it('should navigate to dashboard on successful registration', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const registerSpy = vi.spyOn(authService, 'register').mockReturnValue(
        of({
          userId: '123',
          email: 'user@example.mg',
          token: 'test-token',
          role: 'student',
        }),
      );

      component.email.set('user@example.mg');
      component.password.set('SecurePass123!');
      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error message on registration failure', async () => {
      vi.spyOn(authService, 'register').mockReturnValue(
        throwError(() => ({
          code: 'EMAIL_EXISTS',
          message: 'Email already exists',
        })),
      );

      component.email.set('existing@example.mg');
      component.password.set('SecurePass123!');
      component.onSubmit();

      fixture.detectChanges();

      expect(component.serverError()).toBeTruthy();
    });

    it('should set isLoading signal during submission', async () => {
      const { of: ofOperator, delay } = await import('rxjs');
      
      vi.spyOn(authService, 'register').mockReturnValue(
        ofOperator({
          userId: '123',
          email: 'user@example.mg',
          token: 'test-token',
          role: 'student',
        }).pipe(delay(50)),
      );

      component.email.set('user@example.mg');
      component.password.set('SecurePass123!');

      expect(component.isLoading()).toBe(false);
      component.onSubmit();
      expect(component.isLoading()).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword()).toBe(false);

      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(true);

      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      fixture.detectChanges();

      const emailInput = compiled.query(By.css('input[type="email"]'));
      expect(emailInput.nativeElement.getAttribute('aria-label')).toBeTruthy();

      const passwordInput = compiled.query(By.css('input[type="password"]'));
      expect(passwordInput.nativeElement.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have proper role="alert" for error messages', () => {
      component.email.set('invalid');
      fixture.detectChanges();

      const errorAlert = compiled.query(By.css('[role="alert"]'));
      expect(errorAlert).toBeTruthy();
    });

    it('should have aria-busy during form submission', () => {
      component.email.set('user@example.mg');
      component.password.set('SecurePass123!');
      component.isLoading.set(true);

      fixture.detectChanges();

      const submitButton = compiled.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.getAttribute('aria-busy')).toBe('true');
    });
  });
});
