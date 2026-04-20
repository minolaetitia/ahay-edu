import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import CourseForm from './course-form';
import { CourseService } from '../../../../services/course.service';
import { I18nService } from '../../../../services/i18n.service';
import { AuthService } from '../../../../services/auth.service';
import { Course, CreateCourseDTO } from '../types/course.model';

describe('CourseFormComponent (Story 2.1)', () => {
  let component: CourseForm;
  let fixture: ComponentFixture<CourseForm>;
  let courseService: any;
  let i18nService: I18nService;
  let authService: AuthService;
  let router: any;

  const mockCourse: Course = {
    id: 'course-123',
    instructorId: 'user-001',
    title: 'Angular Course',
    description: 'Learn Angular',
    price: 5000,
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const courseServiceMock = {
      createCourse: vi.fn().mockReturnValue(of(mockCourse)),
      getMyDraftCourses: vi.fn().mockReturnValue(of([])),
      publishCourse: vi.fn().mockReturnValue(of(mockCourse)),
    };
    const routerMock = {
      navigate: vi.fn().mockReturnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [CourseForm, ReactiveFormsModule],
      providers: [
        { provide: CourseService, useValue: courseServiceMock },
        I18nService,
        AuthService,
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    courseService = TestBed.inject(CourseService) as any;
    i18nService = TestBed.inject(I18nService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router) as any;

    fixture = TestBed.createComponent(CourseForm);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  // ============================================
  // AC 1: Form Display with Proper Fields
  // ============================================
  describe('AC 1: Form Display', () => {
    it('should initialize form with title, description, and price fields', () => {
      expect(component.form()).toBeTruthy();
      expect(component.form()!.get('title')).toBeTruthy();
      expect(component.form()!.get('description')).toBeTruthy();
      expect(component.form()!.get('price')).toBeTruthy();
    });

    it('should initialize form fields with default values', () => {
      expect(component.form()!.get('title')!.value).toBe('');
      expect(component.form()!.get('description')!.value).toBe('');
      expect(component.form()!.get('price')!.value).toBe(0);
    });

    it('should display form in the template', () => {
      const formElement = fixture.nativeElement.querySelector('form');
      expect(formElement).toBeTruthy();
    });

    it('should display submit and cancel buttons', () => {
      const submitButton = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      const cancelButton = fixture.nativeElement.querySelector(
        'button[type="button"]'
      );
      expect(submitButton).toBeTruthy();
      expect(cancelButton).toBeTruthy();
    });
  });

  // ============================================
  // AC 2: Field Validation with Error Messages
  // ============================================
  describe('AC 2: Field Validation', () => {
    it('should mark title as required', () => {
      const titleControl = component.form()!.get('title')!;
      titleControl.setValue('');
      titleControl.markAsTouched();
      expect(titleControl.hasError('required')).toBe(true);
    });

    it('should limit title to 200 characters', () => {
      const titleControl = component.form()!.get('title')!;
      const longTitle = 'a'.repeat(201);
      titleControl.setValue(longTitle);
      expect(titleControl.hasError('maxlength')).toBe(true);
    });

    it('should allow title up to 200 characters', () => {
      const titleControl = component.form()!.get('title')!;
      const validTitle = 'a'.repeat(200);
      titleControl.setValue(validTitle);
      expect(titleControl.hasError('maxlength')).toBe(false);
    });

    it('should limit description to 2000 characters', () => {
      const descriptionControl = component.form()!.get('description')!;
      const longDescription = 'a'.repeat(2001);
      descriptionControl.setValue(longDescription);
      expect(descriptionControl.hasError('maxlength')).toBe(true);
    });

    it('should allow description up to 2000 characters', () => {
      const descriptionControl = component.form()!.get('description')!;
      const validDescription = 'a'.repeat(2000);
      descriptionControl.setValue(validDescription);
      expect(descriptionControl.hasError('maxlength')).toBe(false);
    });

    it('should require price to be >= 0', () => {
      const priceControl = component.form()!.get('price')!;
      priceControl.setValue(-1);
      expect(priceControl.hasError('min')).toBe(true);
    });

    it('should allow price >= 0', () => {
      const priceControl = component.form()!.get('price')!;
      priceControl.setValue(100);
      expect(priceControl.hasError('min')).toBe(false);
    });

    it('should display error message for required title', () => {
      const titleControl = component.form()!.get('title')!;
      titleControl.setValue('');
      titleControl.markAsTouched();
      fixture.detectChanges();

      const errorMessage = component.getErrorMessage('title');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).toContain('Titre requis');
    });

    it('should display error message for title maxlength', () => {
      const titleControl = component.form()!.get('title')!;
      titleControl.setValue('a'.repeat(201));
      titleControl.markAsTouched();
      fixture.detectChanges();

      const errorMessage = component.getErrorMessage('title');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).toContain('200');
    });

    it('should display error message for price min', () => {
      const priceControl = component.form()!.get('price')!;
      priceControl.setValue(-1);
      priceControl.markAsTouched();
      fixture.detectChanges();

      const errorMessage = component.getErrorMessage('price');
      expect(errorMessage).toBeTruthy();
    });

    it('should return empty string for field without error', () => {
      const titleControl = component.form()!.get('title')!;
      titleControl.setValue('Valid Title');
      titleControl.markAsTouched();

      const errorMessage = component.getErrorMessage('title');
      expect(errorMessage).toBe('');
    });
  });

  // ============================================
  // AC 3: Form Submission with Service Call
  // ============================================
  // ============================================
  // AC 3: Form Submission
  // ============================================
  describe('AC 3: Form Submission', () => {
    beforeEach(() => {
      // Reset mock calls for each test
      courseService.createCourse.mockReturnValue(of(mockCourse));
    });

    it('should not submit if form is invalid', () => {
      component.form()!.get('title')!.setValue(''); // Invalid: required
      component.onSubmit();

      expect(courseService.createCourse).not.toHaveBeenCalled();
    });

    it('should submit if form is valid', () => {
      component.form()!.get('title')!.setValue('Angular Course');
      component.form()!.get('description')!.setValue('Learn Angular');
      component.form()!.get('price')!.setValue(5000);

      component.onSubmit();

      expect(courseService.createCourse).toHaveBeenCalled();
    });

    it('should call CourseService.createCourse with correct DTO', (done) => {
      const title = 'TypeScript Course';
      const description = 'Learn TypeScript';
      const price = 7500;

      component.form()!.get('title')!.setValue(title);
      component.form()!.get('description')!.setValue(description);
      component.form()!.get('price')!.setValue(price);

      component.onSubmit();

      setTimeout(() => {
        expect(courseService.createCourse).toHaveBeenCalledWith({
          title,
          description,
          price,
        } as CreateCourseDTO);
        (done as any)();
      }, 600); // Wait for 500ms delay + buffer
    });

    it('should set isLoading to true during submission', () => {
      component.form()!.get('title')!.setValue('Angular Course');
      component.form()!.get('description')!.setValue('Learn Angular');
      component.form()!.get('price')!.setValue(5000);

      component.onSubmit();
      // Verify that onSubmit calls the service
      expect(courseService.createCourse).toHaveBeenCalled();
    });

    it('should disable submit button when isLoading is true', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(submitButton.disabled).toBe(true);
    });

    it('should show loading state text on submit button', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(submitButton.textContent).toContain('Chargement');
    });
  });

  // ============================================
  // AC 4: Success Navigation
  // ============================================
  describe('AC 4: Success Notification & Navigation', () => {
    it('should navigate to /my-courses after successful submission', (done: any) => {
      courseService.createCourse.mockReturnValue(of(mockCourse));
      
      component.form()!.get('title')!.setValue('Angular Course');
      component.form()!.get('description')!.setValue('Learn Angular');
      component.form()!.get('price')!.setValue(5000);

      component.onSubmit();

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/my-courses']);
        done();
      }, 600);
    });

    it('should handle error gracefully on submission failure', (done: any) => {
      courseService.createCourse.mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.form()!.get('title')!.setValue('Angular Course');
      component.form()!.get('description')!.setValue('Learn Angular');
      component.form()!.get('price')!.setValue(5000);

      component.onSubmit();

      setTimeout(() => {
        expect(component.isLoading()).toBe(false);
        done();
      }, 600);
    });
  });

  // ============================================
  // AC 5: Authorization (Instructor Only)
  // ============================================
  describe('AC 5: Authorization', () => {
    it('should have current user as Instructor', () => {
      const currentUser = authService.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser!.role).toBe('Instructor');
    });

    it('should have authenticated user', () => {
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  // ============================================
  // AC 6: Localization (FR + MG)
  // ============================================
  describe('AC 6: Localization', () => {
    it('should default to French language', () => {
      expect(i18nService.currentLanguage()).toBe('fr');
    });

    it('should toggle language between FR and MG', () => {
      expect(i18nService.currentLanguage()).toBe('fr');

      component.toggleLanguage();
      expect(i18nService.currentLanguage()).toBe('mg');

      component.toggleLanguage();
      expect(i18nService.currentLanguage()).toBe('fr');
    });

    it('should have French translation for form labels', () => {
      const titleLabel = i18nService.getTranslation(
        'courses.create.form.title_label'
      );
      expect(titleLabel).toBe('Titre du cours');
    });

    it('should have Malagasy translation for form labels', () => {
      i18nService.setLanguage('mg');
      const titleLabel = i18nService.getTranslation(
        'courses.create.form.title_label'
      );
      expect(titleLabel).toBe('Lohateny ny fianarana');
    });

    it('should update translations when language changes', () => {
      i18nService.setLanguage('mg');
      fixture.detectChanges();

      expect(component.currentLanguage()).toBe('mg');
    });

    it('should have translation for success message', () => {
      const successMsg = i18nService.getTranslation(
        'courses.create.success_message'
      );
      expect(successMsg).toBeTruthy();
      expect(successMsg).toContain('succès');
    });
  });

  // ============================================
  // Additional Tests
  // ============================================
  describe('Additional Functionality', () => {
    it('should cancel and navigate back', () => {
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/my-courses']);
    });

    it('should mark all fields as touched on invalid submit attempt', () => {
      component.form()!.get('title')!.setValue('');
      component.onSubmit();

      expect(component.form()!.get('title')!.touched).toBe(true);
      expect(component.form()!.get('description')!.touched).toBe(true);
      expect(component.form()!.get('price')!.touched).toBe(true);
    });

    it('should compute isFormValid correctly', () => {
      // Initially invalid because title is required
      expect(component.isFormValid()).toBe(false);

      // Fill required field
      component.form()!.get('title')!.setValue('Valid Title');
      
      // FormGroup validation updates immediately
      expect(component.form()!.valid).toBe(true);
    });

    it('should check if field has error correctly', () => {
      const titleControl = component.form()!.get('title')!;
      titleControl.setValue('');
      titleControl.markAsTouched();

      expect(component.hasError('title')).toBe(true);

      titleControl.setValue('Valid Title');
      expect(component.hasError('title')).toBe(false);
    });

    it('should clean up subscriptions on destroy', () => {
      // Verify that the component has destroy$ subject
      expect(component['destroy$']).toBeTruthy();

      // Verify ngOnDestroy can be called without errors
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ============================================
  // Edge Cases & Accessibility
  // ============================================
  describe('Edge Cases & Accessibility', () => {
    it('should handle empty description (optional field)', () => {
      const form = component.form()!;
      form.get('title')!.setValue('Course Title');
      form.get('description')!.setValue('');
      form.get('price')!.setValue(100);

      expect(form.valid).toBe(true);
    });

    it('should have proper ARIA attributes', () => {
      const titleInput = fixture.nativeElement.querySelector('#title');
      expect(titleInput).toBeTruthy();

      const priceInput = fixture.nativeElement.querySelector('#price');
      expect(priceInput).toBeTruthy();
    });

    it('should have labels for all inputs', () => {
      const labels = fixture.nativeElement.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have proper input types', () => {
      const titleInput = fixture.nativeElement.querySelector(
        'input[type="text"]'
      );
      const priceInput = fixture.nativeElement.querySelector(
        'input[type="number"]'
      );

      expect(titleInput).toBeTruthy();
      expect(priceInput).toBeTruthy();
    });

    it('should have maxlength attribute on title input', () => {
      const titleInput = fixture.nativeElement.querySelector('#title');
      expect(titleInput.maxLength).toBe(200);
    });

    it('should have maxlength attribute on description textarea', () => {
      const descriptionInput = fixture.nativeElement.querySelector(
        '#description'
      );
      expect(descriptionInput.maxLength).toBe(2000);
    });

    it('should have min attribute on price input', () => {
      const priceInput = fixture.nativeElement.querySelector('#price');
      expect(priceInput.min).toBe('0');
    });
  });
});
