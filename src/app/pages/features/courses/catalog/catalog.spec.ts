import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import CatalogComponent from './catalog';
import { CourseService } from '../../../../services/course.service';
import { I18nService } from '../../../../services/i18n.service';
import { AuthService } from '../../../../services/auth.service';
import { Course } from '../types/course.model';

describe('CatalogComponent (Story 2.3 - Course Catalog)', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let courseService: any;
  let i18nService: I18nService;
  let router: any;

  const mockPublishedCourse: Course = {
    id: 'course-001',
    instructorId: 'user-001',
    title: 'Angular Advanced',
    description: 'Learn advanced Angular patterns',
    price: 5000,
    status: 'Published',
    createdAt: new Date('2026-04-16'),
    updatedAt: new Date('2026-04-16'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const courseServiceMock = {
      getPublishedCourses: vi.fn().mockReturnValue(of([mockPublishedCourse])),
    };

    const routerMock = {
      navigate: vi.fn().mockReturnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        { provide: CourseService, useValue: courseServiceMock },
        I18nService,
        AuthService,
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    courseService = TestBed.inject(CourseService);
    i18nService = TestBed.inject(I18nService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load published courses on init', () => {
      expect(courseService.getPublishedCourses).toHaveBeenCalled();
    });
  });

  describe('Course Display', () => {
    it('should display course cards', () => {
      const cards = fixture.nativeElement.querySelectorAll('.course-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should show course title', () => {
      const title = fixture.nativeElement.querySelector('.course-card h3');
      expect(title?.textContent).toContain('Angular Advanced');
    });

    it('should show course price', () => {
      const price = fixture.nativeElement.querySelector('.price');
      expect(price?.textContent).toContain('5000');
    });
  });

  describe('Search Functionality', () => {
    it('should filter courses by search query', () => {
      component.onSearch('Angular');
      expect(component.filteredCourses().length).toBeGreaterThan(0);
    });

    it('should return empty results for non-matching query', () => {
      component.onSearch('NonExistentCourse');
      expect(component.filteredCourses().length).toBe(0);
    });
  });

  describe('Price Filtering', () => {
    it('should filter courses by price range', () => {
      component.onPriceChange(1000, 10000);
      expect(component.filteredCourses().length).toBeGreaterThan(0);
    });

    it('should return empty results for out-of-range prices', () => {
      component.onPriceChange(10000, 50000);
      expect(component.filteredCourses().length).toBe(0);
    });
  });

  describe('Utilities', () => {
    it('should format price with MGA currency', () => {
      const formatted = component.formatPrice(5000);
      expect(formatted).toContain('MGA');
    });
  });

  describe('Error Handling', () => {
    it('should handle load error', () => {
      courseService.getPublishedCourses.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.error()).toBeTruthy();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should clean up subscriptions on destroy', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
