import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import SignIn from './sign-in';
import { AuthService, type LoginResponse } from '../../../services/auth.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { Router } from '@angular/router';

describe('SignIn Component - Story 1-2', () => {
  let component: SignIn;
  let fixture: ComponentFixture<SignIn>;
  let authService: AuthService;
  let translateService: TranslateService;
  let router: Router;

  beforeEach(async () => {
    const authServiceMock = {
      login: vi.fn().mockReturnValue(of({})),
      logout: vi.fn(),
      isAuthenticated: signal(false),
    } as any;

    await TestBed.configureTestingModule({
      imports: [SignIn, TranslateModule.forRoot(), RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(SignIn);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    translateService = TestBed.inject(TranslateService);
    router = TestBed.inject(Router);

    translateService.setDefaultLang('fr');
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the SignIn component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty email and password', () => {
      expect(component.loginModel().email).toBe('');
      expect(component.loginModel().password).toBe('');
    });

    it('should initialize loading state as false', () => {
      expect(component.isLoading()).toBeFalsy();
    });

    it('should initialize serverError as null', () => {
      expect(component.serverError()).toBeNull();
    });

    it('should initialize showPassword as false', () => {
      expect(component.showPassword()).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate form as invalid when fields are empty', () => {
      expect(component.loginForm().invalid()).toBeTruthy();
    });

    it('should validate form as invalid with incorrect email format', () => {
      component.loginModel.set({ email: 'invalid-email', password: 'ValidPass123' });
      expect(component.loginForm().invalid()).toBeTruthy();
    });

    it('should validate form as invalid with short password (< 8 chars)', () => {
      component.loginModel.set({ email: 'user@example.mg', password: 'short' });
      expect(component.loginForm().invalid()).toBeTruthy();
    });

    it('should validate form as valid when email and password meet requirements', () => {
      component.loginModel.set({ email: 'user@example.mg', password: 'ValidPass123!' });
      expect(component.loginForm().valid()).toBeTruthy();
    });
  });

  describe('Login Submission - AC1: Successful Login', () => {
    beforeEach(() => {
      component.loginModel.set({ email: 'user@example.mg', password: 'ValidPass123!' });
    });

    it('should call authService.login with email and password', () => {
      const loginResponse: LoginResponse = {
        token: 'jwt-token-here',
        refreshToken: 'refresh-token-here',
        user: { userId: 'uuid', email: 'user@example.mg', role: 'student' },
        expiresIn: 86400,
      };
      (authService.login as any).mockReturnValue(of(loginResponse));

      component.onSubmit(new Event('submit'));

      expect(authService.login).toHaveBeenCalledWith('user@example.mg', 'ValidPass123!');
    });

    it('should clear server error on new submission', () => {
      component.serverError.set('Previous error');
      const loginResponse: LoginResponse = {
        token: 'jwt',
        refreshToken: 'refresh',
        user: { userId: 'uuid', email: 'user@example.mg', role: 'student' },
        expiresIn: 86400,
      };
      (authService.login as any).mockReturnValue(of(loginResponse));

      component.onSubmit(new Event('submit'));

      expect(component.serverError()).toBeNull();
    });

    it('should navigate to dashboard on successful login', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const loginResponse: LoginResponse = {
        token: 'jwt',
        refreshToken: 'refresh',
        user: { userId: 'uuid', email: 'user@example.mg', role: 'student' },
        expiresIn: 86400,
      };
      (authService.login as any).mockReturnValue(of(loginResponse));

      component.onSubmit(new Event('submit'));

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Login Submission - AC2: Rate Limiting', () => {
    it('should display rate limit error message (AC2)', () => {
      component.loginModel.set({ email: 'user@example.mg', password: 'ValidPass123!' });

      const errorResponse = {
        code: 'RATE_LIMITED',
        message: 'Too many failed login attempts. Please try again in 15 minutes.',
        retryAfter: 900,
      };
      (authService.login as any).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit(new Event('submit'));

      expect(component.serverError()).toBeTruthy();
    });
  });

  describe('Login Submission - Error Handling', () => {
    beforeEach(() => {
      component.loginModel.set({ email: 'user@example.mg', password: 'InvalidPass' });
    });

    it('should display error message on invalid credentials', () => {
      const errorResponse = { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' };
      (authService.login as any).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit(new Event('submit'));

      expect(component.serverError()).toBeTruthy();
    });

    it('should display error on server error (500)', () => {
      const errorResponse = { code: 'SERVER_ERROR', message: 'Server error occurred' };
      (authService.login as any).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit(new Event('submit'));

      expect(component.serverError()).toBeTruthy();
    });

    it('should keep form state after error', () => {
      const email = 'user@example.mg';
      const password = 'InvalidPass';
      component.loginModel.set({ email, password });

      const errorResponse = { code: 'INVALID_CREDENTIALS', message: 'Error' };
      (authService.login as any).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit(new Event('submit'));

      expect(component.loginModel().email).toBe(email);
      expect(component.loginModel().password).toBe(password);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle showPassword signal', () => {
      expect(component.showPassword()).toBeFalsy();
      component.togglePasswordVisibility();
      expect(component.showPassword()).toBeTruthy();
      component.togglePasswordVisibility();
      expect(component.showPassword()).toBeFalsy();
    });
  });
});
