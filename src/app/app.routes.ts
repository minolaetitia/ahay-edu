import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/sign-in', pathMatch: 'full' },

  { path: 'auth/sign-in', loadComponent: () => import('./pages/auth/sign-in/sign-in').then(m => m.default) },
  { path: 'auth/sign-up', loadComponent: () => import('./pages/auth/sign-up/sign-up').then(m => m.default) },
  { path: 'features/courses', loadComponent: () => import('./pages/features/courses/course').then(m => m.default) },
];
