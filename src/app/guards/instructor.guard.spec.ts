import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, beforeEach, expect } from 'vitest';
import { instructorGuard } from './instructor.guard';
import { AuthService } from '../services/auth.service';

describe('InstructorGuard (Story 2.1 - AC 5)', () => {
  let authService: AuthService;
  let router: any;

  beforeEach(() => {
    const routerSpy = {
      navigate: (path: string[]) => true,
    };

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router) as any;
  });

  it('should allow instructor access', () => {
    // Setup: current user is instructor
    authService.currentUser.set({
      id: 'user-001',
      email: 'instructor@test.com',
      role: 'Instructor',
    });

    const result = TestBed.runInInjectionContext(() =>
      instructorGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('should block student access', () => {
    // Setup: current user is student
    authService.currentUser.set({
      id: 'user-002',
      email: 'student@test.com',
      role: 'Student',
    });

    const result = TestBed.runInInjectionContext(() =>
      instructorGuard({} as any, {} as any)
    );

    expect(result).toBe(false);
  });

  it('should redirect unauthenticated users to login', () => {
    // Setup: no user
    authService.currentUser.set(null);

    const result = TestBed.runInInjectionContext(() =>
      instructorGuard({} as any, {} as any)
    );

    expect(result).toBe(false);
  });

  it('should allow access for instructor role only', () => {
    const roles = ['Instructor', 'Student', 'Admin', 'Moderator'];

    roles.forEach((role) => {
      authService.currentUser.set({
        id: 'user-' + role,
        email: `${role}@test.com`,
        role,
      });

      const result = TestBed.runInInjectionContext(() =>
        instructorGuard({} as any, {} as any)
      );

      if (role === 'Instructor') {
        expect(result).toBe(true);
      } else {
        expect(result).toBe(false);
      }
    });
  });
});
