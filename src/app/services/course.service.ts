import { Injectable, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Course, CreateCourseDTO, Enrollment, AuditLog } from '../pages/features/courses/types/course.model';

/**
 * CourseService
 * Mock implementation for course management
 * - Create, publish, unpublish courses
 * - Enrollment management
 * - Audit trail
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private authService = inject(AuthService);

  // Mock database (in-memory)
  private coursesDb = signal<Record<string, Course>>({
    'course-001': {
      id: 'course-001',
      instructorId: 'user-001',
      title: 'Introduction to Angular',
      description: 'Learn modern Angular with Signals and zoneless architecture...',
      price: 5000,
      status: 'Published',
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date('2026-03-15'),
      deletedAt: null,
    },
    'course-002': {
      id: 'course-002',
      instructorId: 'user-002',
      title: 'TypeScript Mastery',
      description: 'Master TypeScript from basics to advanced patterns...',
      price: 7500,
      status: 'Published',
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-20'),
      deletedAt: null,
    },
  });

  private enrollmentDb = signal<Enrollment[]>([]);
  private auditLog: AuditLog[] = [];

  /**
   * Create new course (Draft status)
   * AC 3: Creates course with proper timestamps and status
   */
  createCourse(data: CreateCourseDTO): Observable<Course> {
    const currentUser = this.authService.currentUser();

    return of(null).pipe(
      delay(500), // Simulate network
      map(() => {
        const newCourse: Course = {
          id: `course-${this.generateId()}`,
          instructorId: currentUser!.id,
          title: data.title,
          description: data.description || '',
          price: data.price ?? 0,
          status: 'Draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        this.coursesDb.update((db) => ({
          ...db,
          [newCourse.id]: newCourse,
        }));

        // AC 6: Create audit log
        this.auditLog.push({
          action: 'course_created',
          userId: currentUser!.id,
          courseId: newCourse.id,
          timestamp: new Date(),
          details: { title: data.title, description: data.description, price: data.price },
        });

        return newCourse;
      })
    );
  }

  /**
   * Get courses created by current instructor
   */
  getMyDraftCourses(): Observable<Course[]> {
    const currentUser = this.authService.currentUser();
    const myCourses = Object.values(this.coursesDb()).filter(
      (c) => c.instructorId === currentUser!.id && c.status === 'Draft'
    );
    return of(myCourses).pipe(delay(200));
  }

  /**
   * Get all courses by current instructor
   */
  getMyAllCourses(): Observable<Course[]> {
    const currentUser = this.authService.currentUser();
    const myCourses = Object.values(this.coursesDb()).filter((c) => c.instructorId === currentUser!.id);
    return of(myCourses).pipe(delay(200));
  }

  /**
   * Get all published courses (for catalog)
   */
  getPublishedCourses(): Observable<Course[]> {
    const published = Object.values(this.coursesDb()).filter((c) => c.status === 'Published');
    return of(published).pipe(delay(300));
  }

  /**
   * Publish course (Draft → Published)
   */
  publishCourse(courseId: string): Observable<Course> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const currentUser = this.authService.currentUser();
        const course = this.coursesDb()[courseId];

        // Authorization check
        if (course.instructorId !== currentUser!.id) {
          throw new Error('Unauthorized');
        }

        const updatedCourse = {
          ...course,
          status: 'Published' as const,
          updatedAt: new Date(),
        };

        this.coursesDb.update((db) => ({
          ...db,
          [courseId]: updatedCourse,
        }));

        // Audit log
        this.auditLog.push({
          action: 'publish_course',
          userId: currentUser!.id,
          courseId,
          timestamp: new Date(),
          oldStatus: 'Draft',
          newStatus: 'Published',
        });

        return updatedCourse;
      })
    );
  }

  /**
   * Unpublish course (Published → Draft)
   */
  unpublishCourse(courseId: string): Observable<Course> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const currentUser = this.authService.currentUser();
        const course = this.coursesDb()[courseId];

        if (course.instructorId !== currentUser!.id) {
          throw new Error('Unauthorized');
        }

        const updatedCourse = {
          ...course,
          status: 'Draft' as const,
          updatedAt: new Date(),
        };

        this.coursesDb.update((db) => ({
          ...db,
          [courseId]: updatedCourse,
        }));

        this.auditLog.push({
          action: 'unpublish_course',
          userId: currentUser!.id,
          courseId,
          timestamp: new Date(),
          oldStatus: 'Published',
          newStatus: 'Draft',
        });

        return updatedCourse;
      })
    );
  }

  /**
   * Free course enrollment
   */
  enrollFree(userId: string, courseId: string): Observable<Enrollment> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const existing = this.enrollmentDb().find((e) => e.userId === userId && e.courseId === courseId);

        if (existing) {
          throw new Error('Already enrolled');
        }

        const newEnrollment: Enrollment = {
          id: `enroll-${this.generateId()}`,
          userId,
          courseId,
          enrollmentDate: new Date(),
          status: 'active',
        };

        this.enrollmentDb.update((db) => [...db, newEnrollment]);
        return newEnrollment;
      })
    );
  }

  /**
   * Check if user enrolled in course
   */
  isUserEnrolled(userId: string, courseId: string): boolean {
    return this.enrollmentDb().some(
      (e) => e.userId === userId && e.courseId === courseId && e.status === 'active'
    );
  }

  /**
   * Get user's enrolled courses
   */
  getMyEnrolledCourses(userId: string): Observable<Course[]> {
    const enrollments = this.enrollmentDb()
      .filter((e) => e.userId === userId && e.status === 'active')
      .map((e) => e.courseId);

    const enrolledCourses = Object.values(this.coursesDb()).filter((c) => enrollments.includes(c.id));
    return of(enrolledCourses).pipe(delay(200));
  }

  /**
   * Get audit log
   */
  getAuditLog(): AuditLog[] {
    return [...this.auditLog];
  }

  // Utility
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
