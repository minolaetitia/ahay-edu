import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard: Protects routes that require authentication
 * Redirects to login if not authenticated
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true; // Allow access
  }

  // Not authenticated: redirect to login with return URL
  router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: state.url } });
  return false; // Block access
};
