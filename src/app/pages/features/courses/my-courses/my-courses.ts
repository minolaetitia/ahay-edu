import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourseService } from '../../../../services/course.service';
import { I18nService } from '../../../../services/i18n.service';
import { AuthService } from '../../../../services/auth.service';
import { Course } from '../types/course.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * MyCoursesComponent
 * Display instructor's courses (draft and published)
 * Story 2.2: Publish/unpublish courses
 */
@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export default class MyCoursesComponent implements OnInit, OnDestroy {
  // Dependencies
  private courseService = inject(CourseService);
  i18n = inject(I18nService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Lifecycle
  private destroy$ = new Subject<void>();

  // State
  courses = signal<Course[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed properties
  draftCourses = computed(() =>
    this.courses().filter((c) => c.status === 'Draft')
  );
  publishedCourses = computed(() =>
    this.courses().filter((c) => c.status === 'Published')
  );
  hasNoCourses = computed(() => this.courses().length === 0);

  ngOnInit(): void {
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all courses for current user
   */
  private loadCourses(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.courseService
      .getMyAllCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          this.courses.set(courses);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load courses:', err);
          this.error.set(this.i18n.getTranslation('courses.load_error'));
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Publish a draft course (Story 2.2)
   */
  publishCourse(course: Course): void {
    if (course.status !== 'Draft') {
      alert(this.i18n.getTranslation('courses.already_published'));
      return;
    }

    this.courseService
      .publishCourse(course.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert(this.i18n.getTranslation('courses.publish.success'));
          this.loadCourses(); // Reload to refresh status
        },
        error: (err) => {
          console.error('Failed to publish course:', err);
          alert(this.i18n.getTranslation('courses.publish.error'));
        },
      });
  }

  /**
   * Unpublish a published course (Story 2.2)
   */
  unpublishCourse(course: Course): void {
    if (course.status !== 'Published') {
      alert(this.i18n.getTranslation('courses.not_published'));
      return;
    }

    this.courseService
      .unpublishCourse(course.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert(this.i18n.getTranslation('courses.unpublish.success'));
          this.loadCourses(); // Reload to refresh status
        },
        error: (err) => {
          console.error('Failed to unpublish course:', err);
          alert(this.i18n.getTranslation('courses.unpublish.error'));
        },
      });
  }

  /**
   * Navigate to course form to create new course
   */
  createNewCourse(): void {
    this.router.navigate(['/courses/create']);
  }

  /**
   * Navigate to course details
   */
  viewCourse(courseId: string): void {
    // TODO: Implement course details page (Story 2.3+)
    alert(`View course: ${courseId}`);
  }

  /**
   * Delete a course
   */
  deleteCourse(courseId: string): void {
    if (!confirm(this.i18n.getTranslation('courses.delete_confirm'))) {
      return;
    }

    // TODO: Implement course deletion in service
    alert(`Delete course: ${courseId}`);
  }

  /**
   * Format course price with currency
   */
  formatPrice(price: number): string {
    return `${price.toLocaleString('fr-FR')} MGA`;
  }

  /**
   * Format course creation date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get localized status label
   */
  getStatusLabel(status: string): string {
    const key =
      status === 'Draft'
        ? 'courses.status.draft'
        : status === 'Published'
          ? 'courses.status.published'
          : 'courses.status.unknown';
    return this.i18n.getTranslation(key);
  }
}
