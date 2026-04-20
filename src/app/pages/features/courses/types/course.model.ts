/**
 * Course Domain Models
 * Types for course creation, publication, enrollment
 */

export interface CourseModel {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string; // e.g., "10 hours"
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailUrl: string;
}

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  description?: string;
  price: number; // MGA
  status: 'Draft' | 'Published';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null | Date;
}

export interface CreateCourseDTO {
  title: string;
  description?: string;
  price: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: Date;
  status: 'active' | 'revoked';
}

export interface AuditLog {
  action: string;
  userId: string;
  courseId?: string;
  timestamp: Date;
  oldStatus?: string;
  newStatus?: string;
  details?: Record<string, unknown>;
}
