import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, type RegisterResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register user with valid credentials', async () => {
      const mockResponse: RegisterResponse = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.mg',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        role: 'student',
      };

      return new Promise<void>((resolve) => {
        service.register('user@example.mg', 'SecurePass123!').subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            expect(service.isAuthenticated()).toBe(true);
            expect(service.authToken()).toBe(mockResponse.token);
            expect(service.currentUser()).toEqual({
              id: mockResponse.userId,
              email: mockResponse.email,
              role: mockResponse.role,
            });
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/auth/register');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          email: 'user@example.mg',
          password: 'SecurePass123!',
        });

        req.flush(mockResponse);
      });
    });

    it('should handle 409 error (email already exists)', async () => {
      return new Promise<void>((resolve, reject) => {
        service.register('existing@example.mg', 'SecurePass123!').subscribe({
          next: () => {
            reject(new Error('Should have failed'));
          },
          error: (error) => {
            expect(error.code).toBe('EMAIL_EXISTS');
            expect(error.message).toBe('Email already registered');
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/auth/register');
        req.flush({ message: 'Email already exists' }, { status: 409, statusText: 'Conflict' });
      });
    });

    it('should handle 400 error (validation error)', async () => {
      return new Promise<void>((resolve, reject) => {
        service.register('invalid@example.mg', 'weak').subscribe({
          next: () => {
            reject(new Error('Should have failed'));
          },
          error: (error) => {
            expect(error.code).toBe('VALIDATION_ERROR');
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/auth/register');
        req.flush({ message: 'Password too weak' }, { status: 400, statusText: 'Bad Request' });
      });
    });

    it('should handle 500 error (server error)', async () => {
      return new Promise<void>((resolve, reject) => {
        service.register('user@example.mg', 'SecurePass123!').subscribe({
          next: () => {
            reject(new Error('Should have failed'));
          },
          error: (error) => {
            expect(error.code).toBe('SERVER_ERROR');
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/auth/register');
        req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });

    it('should store token in localStorage on success', async () => {
      const mockResponse: RegisterResponse = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.mg',
        token: 'test-token-12345',
        role: 'student',
      };

      return new Promise<void>((resolve) => {
        service.register('user@example.mg', 'SecurePass123!').subscribe({
          next: () => {
            expect(localStorage.getItem('auth_token')).toBe(mockResponse.token);
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/auth/register');
        req.flush(mockResponse);
      });
    });
  });

  describe('logout', () => {
    it('should clear authentication state', () => {
      // Set initial state
      service.authToken.set('test-token');
      service.isAuthenticated.set(true);
      service.currentUser.set({
        id: '123',
        email: 'user@example.mg',
        role: 'student',
      });
      localStorage.setItem('auth_token', 'test-token');

      // Logout
      service.logout();

      expect(service.authToken()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return the stored token', () => {
      const token = 'test-token-value';
      service.authToken.set(token);

      expect(service.getToken()).toBe(token);
    });

    it('should return null if no token', () => {
      service.authToken.set(null);

      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if authenticated', () => {
      service.isAuthenticated.set(true);

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if not authenticated', () => {
      service.isAuthenticated.set(false);

      expect(service.isLoggedIn()).toBe(false);
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
