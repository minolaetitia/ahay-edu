import { Component, signal, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import {
  email,
  form,
  FormField,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { LoginData } from './types/login-data';
import { AuthService, type AuthError } from '../../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
  imports: [FormField, CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignIn {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  // Form state
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  // UI state
  isLoading = signal(false);
  serverError = signal<string | null>(null);
  showPassword = signal(false);

  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}$/;

  // Signal Form for sign-in
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Please enter a valid email address' });

    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
    pattern(schemaPath.password, this.passwordRegex, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    });
  });

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  /**
   * Submit login form
   */
  onSubmit(event: Event): void {
    event.preventDefault();

    // Check if form is valid first
    if (this.loginForm().invalid()) {
      return;
    }

    const { email, password } = this.loginModel();
    this.isLoading.set(true);
    this.serverError.set(null);

    // Call login service
    this.authService
      .login(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          // Navigate to dashboard on success
          this.router.navigate(['/dashboard']);
        },
        error: (error: AuthError) => {
          this.isLoading.set(false);
          // Set error message based on error code
          const errorMessage = this.getErrorMessage(error.code);
          this.serverError.set(errorMessage);
        },
      });
  }

  /**
   * Get localized error message based on error code
   */
  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      INVALID_CREDENTIALS: this.translate.instant('auth.signin.invalidCredentials'),
      EMAIL_EXISTS: this.translate.instant('auth.signin.emailExists'),
      VALIDATION_ERROR: this.translate.instant('auth.signin.validationError'),
      RATE_LIMITED: this.translate.instant('auth.signin.rateLimited'),
      SERVER_ERROR: this.translate.instant('auth.signin.serverError'),
      NETWORK_ERROR: this.translate.instant('auth.signin.networkError'),
      TIMEOUT_ERROR: this.translate.instant('auth.signin.timeoutError'),
    };
    return messages[code] || this.translate.instant('auth.signin.unknownError');
  }
}
