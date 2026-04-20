import { Routes } from '@angular/router';
import { instructorGuard } from './guards/instructor.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/sign-in', pathMatch: 'full' },

  { path: 'auth/sign-in', loadComponent: () => import('./pages/auth/sign-in/sign-in').then(m => m.default) },
  { path: 'auth/sign-up', loadComponent: () => import('./pages/auth/sign-up/sign-up').then(m => m.default) },
  { path: 'features/courses', loadComponent: () => import('./pages/features/courses/course').then(m => m.default) },

  // Story 2.1: Course Creation (Instructor Only)
  { 
    path: 'courses/create', 
    loadComponent: () => import('./pages/features/courses/course-form/course-form').then(m => m.default),
    canActivate: [instructorGuard]
  },

  // Story 2.1: My Courses (Instructor Dashboard)
  { 
    path: 'my-courses', 
    loadComponent: () => import('./pages/features/courses/my-courses/my-courses').then(m => m.default),
    canActivate: [instructorGuard]
  },

  // Story 2.3: Course Catalog (Public)
  { 
    path: 'catalog', 
    loadComponent: () => import('./pages/features/courses/catalog/catalog').then(m => m.default)
  },

  // Wildcard - 404
  { path: '**', redirectTo: 'auth/sign-in' }
];

