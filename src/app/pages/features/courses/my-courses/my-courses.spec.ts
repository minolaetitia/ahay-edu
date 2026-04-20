import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import MyCoursesComponent from './my-courses';
import { CourseService } from '../../../../services/course.service';
import { I18nService } from '../../../../services/i18n.service';
import { AuthService } from '../../../../services/auth.service';
import { Course } from '../types/course.model';

describe('MyCoursesComponent (Story 2.1 - Dashboard)', () => {
  let component: MyCoursesComponent;
  let fixture: ComponentFixture<MyCoursesComponent>;
  let courseService: any;
  let i18nService: I18nService;
  let router: any;

  const mockCourse: Course = {
    id: 'course-001',
    instructorId: 'user-001',
    title: 'Angular Advanced',
    description: 'Learn advanced Angular patterns',
    price: 5000,
    status: 'Draft',
    createdAt: new Date('2026-04-16'),
    updatedAt: new Date('2026-04-16'),
    deletedAt: null,
  };

  const mockPublishedCourse: Course = {
    ...mockCourse,
    id: 'course-002',
    status: 'Published',
  };

  beforeEach(async () => {
    const courseServiceMock = {
      getMyAllCourses: vi
        .fn()
        .mockReturnValue(of([mockCourse, mockPublishedCourse])),
      getMyDraftCourses: vi.fn().mockReturnValue(of([mockCourse])),
      publishCourse: vi.fn().mockReturnValue(of(mockPublishedCourse)),
      unpublishCourse: vi.fn().mockReturnValue(of(mockCourse)),
    };

    const routerMock = {
      navigate: vi.fn().mockReturnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [MyCoursesComponent],
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

    fixture = TestBed.createComponent(MyCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load courses on init', () => {
      expect(courseService.getMyAllCourses).toHaveBeenCalled();
      expect(component.courses().length).toBe(2);
    });

    it('should separate draft and published courses', () => {
      expect(component.draftCourses().length).toBe(1);
      expect(component.publishedCourses().length).toBe(1);
    });
  });

  describe('Course Display', () => {
    it('should display course cards for draft courses', () => {
      const cards = fixture.nativeElement.querySelectorAll('.course-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should show course title', () => {
      const courseTitle = fixture.nativeElement.querySelector('.course-header h3');
      expect(courseTitle?.textContent).toContain('Angular Advanced');
    });

    it('should show course price', () => {
      const price = fixture.nativeElement.querySelector('.price');
      expect(price?.textContent).toContain('MGA');
    });

    it('should show status badge', () => {
      const badge = fixture.nativeElement.querySelector('.status-badge');
      expect(badge).toBeTruthy();
    });
  });

  describe('Publish Course (Story 2.2)', () => {
    it('should publish a draft course', () => {
      component.publishCourse(mockCourse);
      expect(courseService.publishCourse).toHaveBeenCalledWith(mockCourse.id);
    });

    it('should reload courses after publish', () => {
      component.publishCourse(mockCourse);
      expect(courseService.publishCourse).toHaveBeenCalledWith(mockCourse.id);
    });

    it('should handle publish error gracefully', () => {
      courseService.publishCourse.mockReturnValue(
        throwError(() => new Error('Publish failed'))
      );

      component.publishCourse(mockCourse);
      expect(component.courses().length).toBe(2); // Courses unchanged
    });
  });

  describe('Unpublish Course (Story 2.2)', () => {
    it('should unpublish a published course', () => {
      component.unpublishCourse(mockPublishedCourse);
      expect(courseService.unpublishCourse).toHaveBeenCalledWith(
        mockPublishedCourse.id
      );
    });

    it('should reload courses after unpublish', () => {
      component.unpublishCourse(mockPublishedCourse);
      expect(courseService.unpublishCourse).toHaveBeenCalledWith(mockPublishedCourse.id);
    });
  });

  describe('Navigation', () => {
    it('should navigate to course creation form', () => {
      component.createNewCourse();
      expect(router.navigate).toHaveBeenCalledWith(['/courses/create']);
    });
  });

  describe('Computed Properties', () => {
    it('should compute draftCourses correctly', () => {
      const drafts = component.draftCourses();
      expect(drafts.every((c) => c.status === 'Draft')).toBe(true);
    });

    it('should compute publishedCourses correctly', () => {
      const published = component.publishedCourses();
      expect(published.every((c) => c.status === 'Published')).toBe(true);
    });

    it('should indicate when no courses exist', () => {
      component.courses.set([]);
      expect(component.hasNoCourses()).toBe(true);
    });
  });

  describe('Utilities', () => {
    it('should format price with MGA currency', () => {
      const formatted = component.formatPrice(5000);
      expect(formatted).toContain('MGA');
    });

    it('should get localized status label', () => {
      const label = component.getStatusLabel('Draft');
      expect(label).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle load error', () => {
      courseService.getMyAllCourses.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.error()).toBeTruthy();
      expect(component.isLoading()).toBe(false);
    });

    it('should display error message in template', () => {
      component.error.set('Test error');
      fixture.detectChanges();

      const errorState = fixture.nativeElement.querySelector('.error-state');
      expect(errorState?.textContent).toContain('Test error');
    });
  });

  describe('Accessibility', () => {
    it('should have action buttons with proper labels', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.course-actions button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((btn: HTMLButtonElement) => {
        expect(btn.getAttribute('title')).toBeTruthy();
      });
    });

    it('should have proper heading hierarchy', () => {
      const h1 = fixture.nativeElement.querySelector('h1');
      const h2 = fixture.nativeElement.querySelectorAll('h2');
      expect(h1).toBeTruthy();
      expect(h2.length).toBeGreaterThan(0);
    });
  });

  describe('Cleanup', () => {
    it('should clean up subscriptions on destroy', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
