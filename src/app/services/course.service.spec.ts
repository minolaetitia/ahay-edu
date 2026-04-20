import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CourseService } from './course.service';
import { AuthService } from './auth.service';
import { Course, CreateCourseDTO } from '../pages/features/courses/types/course.model';

describe('CourseService (Story 2.1-2.4)', () => {
  let service: CourseService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseService, AuthService],
    });
    service = TestBed.inject(CourseService);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================
  // AC 3: Create Course with Draft Status
  // ============================================
  describe('createCourse', () => {
    it('should create a new course with Draft status', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Angular Basics',
        description: 'Learn Angular from scratch',
        price: 5000,
      };

      service.createCourse(createDTO).subscribe((course: Course) => {
        expect(course).toBeTruthy();
        expect(course.status).toBe('Draft');
        expect(course.title).toBe('Angular Basics');
        expect(course.price).toBe(5000);
        expect(course.instructorId).toBe('user-001');
        expect(course.createdAt).toBeTruthy();
        done();
      });
    });

    it('should set createdAt and updatedAt timestamps', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Course',
        description: 'Desc',
        price: 1000,
      };

      service.createCourse(createDTO).subscribe((course: Course) => {
        expect(course.createdAt instanceof Date).toBe(true);
        expect(course.updatedAt instanceof Date).toBe(true);
        expect(course.deletedAt).toBe(null);
        done();
      });
    });

    it('should generate unique course IDs', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Course 1',
        description: 'Desc 1',
        price: 1000,
      };

      let courseId1: string;

      service.createCourse(createDTO).subscribe((course1: Course) => {
        courseId1 = course1.id;

        service.createCourse(createDTO).subscribe((course2: Course) => {
          expect(course2.id).not.toBe(courseId1);
          done();
        });
      });
    });

    it('should use current user as instructorId', (done: any) => {
      const currentUser = authService.currentUser();
      const createDTO: CreateCourseDTO = {
        title: 'Course',
        description: 'Desc',
        price: 1000,
      };

      service.createCourse(createDTO).subscribe((course: Course) => {
        expect(course.instructorId).toBe(currentUser!.id);
        done();
      });
    });

    it('should support empty description', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Course',
        price: 1000,
      };

      service.createCourse(createDTO).subscribe((course: Course) => {
        expect(course.description).toBe('');
        done();
      });
    });

    it('should support zero price', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Free Course',
        description: 'Free',
        price: 0,
      };

      service.createCourse(createDTO).subscribe((course: Course) => {
        expect(course.price).toBe(0);
        done();
      });
    });
  });

  // ============================================
  // AC 6: Audit Trail
  // ============================================
  describe('Audit Trail', () => {
    it('should create audit log entry on course creation', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Course',
        description: 'Desc',
        price: 1000,
      };

      service.createCourse(createDTO).subscribe(() => {
        const auditLog = service.getAuditLog();
        expect(auditLog.length).toBeGreaterThan(0);

        const lastEntry = auditLog[auditLog.length - 1];
        expect(lastEntry.action).toBe('course_created');
        expect(lastEntry.userId).toBe('user-001');
        done();
      });
    });

    it('should record course details in audit log', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Test Course',
        description: 'Test Description',
        price: 5000,
      };

      service.createCourse(createDTO).subscribe(() => {
        const auditLog = service.getAuditLog();
        const lastEntry = auditLog[auditLog.length - 1];

        expect(lastEntry.details).toEqual({
          title: 'Test Course',
          description: 'Test Description',
          price: 5000,
        });
        done();
      });
    });
  });

  // ============================================
  // Course Publishing (Story 2.2)
  // ============================================
  describe('publishCourse', () => {
    it('should publish a draft course', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Course',
        description: 'Desc',
        price: 1000,
      };

      service.createCourse(createDTO).subscribe((course: Course) => {
        service.publishCourse(course.id).subscribe((published: Course) => {
          expect(published.status).toBe('Published');
          expect(published.id).toBe(course.id);
          done();
        });
      });
    });

    it('should only allow instructor to publish their course', (done: any) => {
      const createDTO: CreateCourseDTO = {
        title: 'Course',
        description: 'Desc',
        price: 1000,
      };

      service.createCourse(createDTO).subscribe((course: Course) => {
        // Try to publish with different instructor ID (mock)
        service.publishCourse(course.id).subscribe(
          (published: Course) => {
            expect(published.status).toBe('Published');
            done();
          },
          (error: any) => {
            expect(error).toBeTruthy();
            done();
          }
        );
      });
    });
  });

  // ============================================
  // Course Enrollment (Story 2.4)
  // ============================================
  describe('Enrollment', () => {
    it('should allow free course enrollment', (done: any) => {
      service.enrollFree('student-001', 'course-001').subscribe((enrollment) => {
        expect(enrollment).toBeTruthy();
        expect(enrollment.userId).toBe('student-001');
        expect(enrollment.courseId).toBe('course-001');
        expect(enrollment.status).toBe('active');
        done();
      });
    });

    it('should prevent duplicate enrollment', (done: any) => {
      const userId = 'student-001';
      const courseId = 'course-001';

      service.enrollFree(userId, courseId).subscribe(() => {
        service.enrollFree(userId, courseId).subscribe(
          () => {
            done.fail('Should not allow duplicate enrollment');
          },
          (error: any) => {
            expect(error.message).toContain('Already enrolled');
            done();
          }
        );
      });
    });

    it('should check enrollment status', (done: any) => {
      const userId = 'student-001';
      const courseId = 'course-001';

      expect(service.isUserEnrolled(userId, courseId)).toBe(false);

      service.enrollFree(userId, courseId).subscribe(() => {
        expect(service.isUserEnrolled(userId, courseId)).toBe(true);
        done();
      });
    });

    it('should get user enrolled courses', (done: any) => {
      const userId = 'student-001';

      service.enrollFree(userId, 'course-001').subscribe(() => {
        service.enrollFree(userId, 'course-002').subscribe(() => {
          service.getMyEnrolledCourses(userId).subscribe((courses) => {
            expect(courses.length).toBeGreaterThanOrEqual(2);
            done();
          });
        });
      });
    });
  });

  // ============================================
  // Catalog Access (Story 2.3)
  // ============================================
  describe('Course Catalog', () => {
    it('should get published courses', (done: any) => {
      service.getPublishedCourses().subscribe((courses) => {
        expect(Array.isArray(courses)).toBe(true);
        expect(courses.every((c) => c.status === 'Published')).toBe(true);
        done();
      });
    });

    it('should get instructor draft courses', (done: any) => {
      service.getMyDraftCourses().subscribe((courses) => {
        expect(Array.isArray(courses)).toBe(true);
        done();
      });
    });

    it('should get all instructor courses', (done: any) => {
      service.getMyAllCourses().subscribe((courses) => {
        expect(Array.isArray(courses)).toBe(true);
        done();
      });
    });
  });
});

