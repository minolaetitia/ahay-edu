import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/sign-in', pathMatch: 'full' },

  { path: 'auth/sign-in', loadComponent: () => import('./pages/auth/sign-in/sign-in') },
  { path: 'features/courses', loadComponent: () => import('./pages/features/courses/course') },
];
