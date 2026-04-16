import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  token: string;
  role: string;
}

export interface AuthError {
  code: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Signal to track authentication state
  isAuthenticated = signal(false);
  currentUser = signal<{ userId: string; email: string; role: string } | null>(null);
  authToken = signal<string | null>(null);

  constructor() {
    // Check if token exists in localStorage on service initialization
    const storedToken = this.getStorageToken();
    if (storedToken) {
      this.authToken.set(storedToken);
      this.isAuthenticated.set(true);
      this.loadUserFromToken(storedToken);
    }
  }

  /**
   * Safely retrieve token from localStorage (handles private mode, quota exceeded, etc.)
   */
  private getStorageToken(): string | null {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    } catch {
      // Private mode, quota exceeded, or other storage errors
      return null;
    }
  }

  /**
   * Safely store token in localStorage (handles private mode, quota exceeded, etc.)
   */
  private setStorageToken(token: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
    } catch {
      // Private mode or quota exceeded - fail silently but log
      console.error('Failed to store token in localStorage');
    }
  }

  /**
   * Safely remove token from localStorage
   */
  private removeStorageToken(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    } catch {
      // Fail silently
    }
  }

  /**
   * Register a new user with email and password
   * Calls .NET Core backend endpoint: POST /api/auth/register
   */
  register(email: string, password: string): Observable<RegisterResponse> {
    // Validate input
    if (!email?.trim() || !password?.trim()) {
      return throwError(() => ({
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required',
      }));
    }

    const request: RegisterRequest = { email, password };

    return this.http
      .post<RegisterResponse>('/api/auth/register', request)
      .pipe(
        timeout(30000), // 30 second timeout
        tap((response) => this.handleAuthSuccess(response)),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /**
   * Store token and update authentication state
   */
  private handleAuthSuccess(response: RegisterResponse): void {
    // Validate response
    if (!response.token || typeof response.token !== 'string') {
      throw new Error('Invalid token in response');
    }

    this.authToken.set(response.token);
    this.isAuthenticated.set(true);
    this.currentUser.set({
      userId: response.userId,
      email: response.email,
      role: response.role,
    });

    // Store token in localStorage for persistence
    this.setStorageToken(response.token);
  }

  /**
   * Handle authentication errors and convert to AuthError
   */
  private handleAuthError(error: any): Observable<never> {
    let authError: AuthError;

    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      authError = {
        code: 'TIMEOUT_ERROR',
        message: 'Request timeout. Please try again.',
      };
      return throwError(() => authError);
    }

    // Handle HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          // Could be weak password or invalid email
          authError = {
            code: 'VALIDATION_ERROR',
            message: error.error?.message || 'Invalid input',
          };
          break;
        case 409:
          // Email already exists
          authError = {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          };
          break;
        case 500:
          // Server error
          authError = {
            code: 'SERVER_ERROR',
            message: 'Server error occurred',
          };
          break;
        case 0:
          // Network error
          authError = {
            code: 'NETWORK_ERROR',
            message: 'Network error. Please check your connection.',
          };
          break;
        default:
          authError = {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
          };
      }
    } else {
      authError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }

    return throwError(() => authError);
  }

  /**
   * Parse JWT token to extract user info
   * Simple extraction without verification (verification happens on backend)
   */
  private loadUserFromToken(token: string): void {
    try {
      const payload = this.parseJwt(token);
      if (payload && payload.userId && payload.email) {
        this.currentUser.set({
          userId: payload.userId,
          email: payload.email,
          role: payload.role || 'student',
        });
        this.isAuthenticated.set(true);
      }
    } catch {
      // Token parsing failed, clear auth state
      this.logout();
    }
  }

  /**
   * Decode JWT payload (without verification)
   * Validates token structure (must have 3 parts: header.payload.signature)
   */
  private parseJwt(token: string): any {
    // CRITICAL: Validate token has 3 parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid token format: expected 3 parts, got ${parts.length}`);
    }

    const base64Url = parts[1];
    let base64: string;
    try {
      // Replace URL-safe Base64 characters
      base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    } catch (e) {
      throw new Error('Invalid Base64 encoding in token');
    }

    let decoded: string;
    try {
      // Decode Base64
      decoded = atob(base64);
    } catch (e) {
      throw new Error('Failed to decode Base64 payload');
    }

    let jsonPayload: string;
    try {
      // URL decode the payload
      jsonPayload = decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
    } catch (e) {
      throw new Error('Failed to decode payload string');
    }

    try {
      // Parse JSON
      const payload = JSON.parse(jsonPayload);
      return payload;
    } catch (e) {
      throw new Error('Invalid JSON in token payload');
    }
  }

  /**
   * Logout user and clear authentication state
   */
  logout(): void {
    this.authToken.set(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.removeStorageToken();
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.authToken();
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
