import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Instructor Guard
 * Protects routes that only instructors can access
 * Redirects non-instructors to login
 */
export const instructorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (!currentUser || currentUser.role !== 'Instructor') {
    router.navigate(['/auth/sign-in']);
    return false;
  }

  return true;
};
