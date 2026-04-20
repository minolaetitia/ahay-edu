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
 * CatalogComponent
 * Browse and search published courses
 * Story 2.3: Course Catalog
 */
@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export default class CatalogComponent implements OnInit, OnDestroy {
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
  searchQuery = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(50000);

  // Computed properties
  filteredCourses = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const min = this.minPrice();
    const max = this.maxPrice();

    return this.courses().filter((course) => {
      const matchesQuery =
        query === '' ||
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query);
      const matchesPrice = course.price >= min && course.price <= max;
      return matchesQuery && matchesPrice;
    });
  });

  hasNoCourses = computed(() => this.filteredCourses().length === 0);

  ngOnInit(): void {
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load published courses
   */
  private loadCourses(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.courseService
      .getPublishedCourses()
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
   * Search courses by query
   */
  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Update price filter
   */
  onPriceChange(min: number, max: number): void {
    this.minPrice.set(min);
    this.maxPrice.set(max);
  }

  /**
   * Navigate to course enrollment
   * TODO: Implement course details page (Story 2.3+)
   */
  enrollCourse(course: Course): void {
    alert(`Enroll in: ${course.title}`);
  }

  /**
   * Format course price with currency
   */
  formatPrice(price: number): string {
    return `${price.toLocaleString('fr-FR')} MGA`;
  }
}
