import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, type RegisterResponse } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">{{ 'auth.signup.title' | translate }}</h1>
          <p class="text-gray-600 mt-2">{{ 'auth.signup.subtitle' | translate }}</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'auth.signup.email' | translate }}
            </label>
            <input
              type="email"
              name="email"
              maxlength="254"
              [ngModel]="email()"
              (ngModelChange)="email.set($event)"
              placeholder="user@example.mg"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [attr.aria-label]="'auth.signup.email' | translate"
            />
            @if (emailError()) {
              <p class="text-red-500 text-sm mt-2" role="alert">{{ emailError() }}</p>
            }
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'auth.signup.password' | translate }}
            </label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                name="password"
                maxlength="128"
                [ngModel]="password()"
                (ngModelChange)="password.set($event)"
                placeholder="••••••••••••"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [attr.aria-label]="'auth.signup.password' | translate"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                [attr.aria-label]="'auth.signup.togglePassword' | translate"
              >
                @if (showPassword()) {
                  <span>👁️</span>
                } @else {
                  <span>👁️‍🗨️</span>
                }
              </button>
            </div>
            @if (passwordError()) {
              <p class="text-red-500 text-sm mt-2" role="alert">{{ passwordError() }}</p>
            }
          </div>

          <!-- Password Strength Indicator -->
          @if (password()) {
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-700">{{ 'auth.signup.passwordStrength' | translate }}</span>
                <span class="font-medium" [ngClass]="passwordStrengthClass()">
                  {{ passwordStrengthText() }}
                </span>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded">
                <div
                  class="h-full rounded transition-all"
                  [ngClass]="passwordStrengthBar()"
                  [style.width.%]="passwordStrengthPercentage()"
                ></div>
              </div>
            </div>
          }

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading() || !isFormValid()"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            [attr.aria-busy]="isLoading()"
          >
            @if (isLoading()) {
              <span>{{ 'auth.signup.registering' | translate }}</span>
            } @else {
              <span>{{ 'auth.signup.submit' | translate }}</span>
            }
          </button>

          <!-- Server Error -->
          @if (serverError()) {
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p class="text-red-700 text-sm">{{ serverError() }}</p>
            </div>
          }
        </form>

        <!-- Sign In Link -->
        <p class="text-center text-gray-600 text-sm mt-6">
          {{ 'auth.signup.alreadyHave' | translate }}
          <a href="/auth/sign-in" class="text-blue-600 hover:text-blue-700 font-medium">
            {{ 'auth.signup.signIn' | translate }}
          </a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignUp {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  // Form signals
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  serverError = signal<string | null>(null);

  // Validation signals
  emailError = computed(() => {
    const email = this.email().trim();
    if (!email) return '';

    // RFC 5321 relaxed pattern - more robust than permissive regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return this.translate.instant('auth.signup.invalidEmail');
    }
    return '';
  });

  passwordError = computed(() => {
    const password = this.password().trim();
    if (!password) return '';

    if (password.length < 12) {
      return this.translate.instant('auth.signup.weakPassword');
    }
    return '';
  });

  isFormValid = computed(() => {
    return (
      this.email().trim().length > 0 &&
      this.password().trim().length >= 12 &&
      !this.emailError() &&
      !this.passwordError()
    );
  });

  // Password strength calculation
  passwordStrengthPercentage = computed(() => {
    const password = this.password();
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 12) strength += 25;
    if (password.length >= 16) strength += 25;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    return Math.min(strength, 100);
  });

  passwordStrengthText = computed(() => {
    const percentage = this.passwordStrengthPercentage();
    if (percentage < 40) return this.translate.instant('auth.signup.weak');
    if (percentage < 70) return this.translate.instant('auth.signup.fair');
    if (percentage < 85) return this.translate.instant('auth.signup.good');
    return this.translate.instant('auth.signup.strong');
  });

  passwordStrengthClass = computed(() => {
    const percentage = this.passwordStrengthPercentage();
    if (percentage < 40) return 'text-red-600';
    if (percentage < 70) return 'text-yellow-600';
    if (percentage < 85) return 'text-blue-600';
    return 'text-green-600';
  });

  passwordStrengthBar = computed(() => {
    const percentage = this.passwordStrengthPercentage();
    if (percentage < 40) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    if (percentage < 85) return 'bg-blue-500';
    return 'bg-green-500';
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    this.authService
      .register(this.email().trim(), this.password().trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: RegisterResponse) => {
          this.isLoading.set(false);
          // Navigate to dashboard or home page
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          // Handle specific error codes
          const errorMessage = this.getErrorMessage(error.code);
          this.serverError.set(errorMessage);
        },
      });
  }

  private getErrorMessage(errorCode: string): string {
    const errorMap: Record<string, string> = {
      EMAIL_EXISTS: 'auth.signup.emailExists',
      VALIDATION_ERROR: 'auth.signup.validationError',
      SERVER_ERROR: 'auth.signup.serverError',
      UNKNOWN_ERROR: 'auth.signup.unknownError',
    };

    const translationKey = errorMap[errorCode] || errorCode;
    return this.translate.instant(translationKey);
  }
}
