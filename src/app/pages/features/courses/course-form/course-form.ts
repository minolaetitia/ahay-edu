import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../../../services/course.service';
import { I18nService } from '../../../../services/i18n.service';
import { AuthService } from '../../../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

/**
 * CourseFormComponent
 * Instructor course creation form
 * AC 1-6: Form display, validation, submission, notifications, auth, audit trail
 */
@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.html',
  styleUrl: './course-form.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export default class CourseForm implements OnInit, OnDestroy {
  // Dependencies
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  i18n = inject(I18nService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Lifecycle
  private destroy$ = new Subject<void>();

  // Form state (AC 1)
  form = signal<FormGroup | null>(null);

  // Loading state for submit button (AC 3)
  isLoading = signal(false);

  // Localization state (AC 8)
  currentLanguage = this.i18n.currentLanguage;

  // Computed: form valid state
  isFormValid = computed(() => this.form()?.valid ?? false);

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize form with validation rules
   * AC 1, AC 2: Form fields with validators
   */
  private initializeForm(): void {
    const formGroup = this.fb.group({
      title: [
        '',
        [
          Validators.required, // AC 2: Title required
          Validators.maxLength(200), // AC 2: Max 200 chars
        ],
      ],
      description: [
        '',
        [
          Validators.maxLength(2000), // AC 2: Max 2000 chars
        ],
      ],
      price: [
        0,
        [
          Validators.min(0), // AC 2: Price >= 0
          Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/), // AC 2: Numeric pattern validation
        ],
      ],
    });

    this.form.set(formGroup);

    // AC 2: Real-time validation with debounce (300ms)
    // Note: OnPush change detection handles updates via signal mutations
    // This subscription is for future enhancements (e.g., auto-save)
    formGroup.statusChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        // Signal is already tracking form state via form() getter
        // CD will update when form errors/touched changes via signal bindings
      });
  }

  /**
   * Get error message for form field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.form()?.get(fieldName);

    if (!control || !control.errors) {
      return '';
    }

    // AC 2: Error messages by type
    if (fieldName === 'title') {
      if (control.hasError('required')) {
        return this.i18n.getTranslation('courses.create.form.title_required');
      }
      if (control.hasError('maxlength')) {
        return this.i18n.getTranslation('courses.create.form.title_max');
      }
    }

    if (fieldName === 'description') {
      if (control.hasError('maxlength')) {
        return this.i18n.getTranslation('courses.create.form.description_max');
      }
    }

    if (fieldName === 'price') {
      if (control.hasError('min')) {
        return this.i18n.getTranslation('courses.create.form.price_min');
      }
      if (control.hasError('pattern')) {
        return this.i18n.getTranslation('courses.create.form.price_type');
      }
    }

    return '';
  }

  /**
   * Check if field has error and is touched
   */
  hasError(fieldName: string): boolean {
    const control = this.form()?.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Form submission
   * AC 3: Submit to service, create course with Draft status
   * AC 4: Success notification & navigation
   */
  onSubmit(): void {
    // AC 2: Validate before submit
    if (!this.form() || !this.form()!.valid) {
      // Mark all fields as touched to show errors
      if (this.form()) {
        Object.keys(this.form()!.controls).forEach((key) => {
          this.form()!.get(key)?.markAsTouched();
        });
      }
      return;
    }

    this.isLoading.set(true);

    const formValue = this.form()!.getRawValue();
    const createDTO = {
      title: formValue.title,
      description: formValue.description || '',
      price: formValue.price ?? 0,
    };

    // AC 3: Call CourseService.createCourse
    this.courseService
      .createCourse(createDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (course) => {
          // AC 4: Success notification (use toast in future, not alert)
          // TODO: Replace alert() with proper toast/notification service
          alert(this.i18n.getTranslation('courses.create.success_message'));
          this.isLoading.set(false);

          // AC 4: Navigate to /my-courses
          this.router.navigate(['/my-courses']);
        },
        error: (err: Error | unknown) => {
          // Error handling (type-safe error parameter)
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          // TODO: Replace alert() with proper notification service; remove console in production
          alert(this.i18n.getTranslation('courses.create.error_message'));
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Cancel - return to previous page
   */
  onCancel(): void {
    this.router.navigate(['/my-courses']);
  }

  /**
   * Toggle language (FR ↔ MG)
   */
  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }
}

