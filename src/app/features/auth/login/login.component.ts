/* eslint-disable max-len */
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, ILoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mb-5">
      <h2
        class="text-[20px] font-semibold mb-1"
        style="color: var(--text-primary); letter-spacing: -0.02em"
      >
        Welcome back
      </h2>
      <p class="text-[13px]" style="color: var(--text-muted)">Sign in to your CareTrack account</p>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Email -->
      <div>
        <label for="email" class="input-label">Email</label>
        <input
          type="email"
          id="email"
          formControlName="email"
          placeholder="name&#64;organization.com"
          class="input w-full"
          [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
          [attr.aria-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
          [attr.aria-describedby]="
            loginForm.get('email')?.invalid && loginForm.get('email')?.touched
              ? 'email-error'
              : null
          "
        />
        @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
          <div id="email-error" class="input-error-text" role="alert">
            @if (loginForm.get('email')?.errors?.['required']) {
              <span>Email is required</span>
            }
            @if (loginForm.get('email')?.errors?.['email']) {
              <span>Enter a valid email address</span>
            }
          </div>
        }
      </div>

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="password" class="input-label" style="margin-bottom: 0">Password</label>
          <a
            [routerLink]="['/auth/forgot-password']"
            class="text-[12px] font-medium"
            style="color: var(--primary-light)"
            >Forgot password?</a
          >
        </div>
        <div class="relative">
          <input
            [type]="showPassword ? 'text' : 'password'"
            id="password"
            formControlName="password"
            placeholder="Enter your password"
            class="input w-full pr-10"
            [class.input-error]="
              loginForm.get('password')?.invalid && loginForm.get('password')?.touched
            "
            [attr.aria-invalid]="
              loginForm.get('password')?.invalid && loginForm.get('password')?.touched
            "
          />
          <button
            type="button"
            (click)="showPassword = !showPassword"
            class="absolute right-2 top-1/2 -translate-y-1/2 btn-icon w-7 h-7"
            [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="stroke-width: 1.5; color: var(--text-muted)"
            >
              @if (showPassword) {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                ></path>
              } @else {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              }
            </svg>
          </button>
        </div>
        @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
          <div class="input-error-text" role="alert">
            <span>Password is required</span>
          </div>
        }
      </div>

      <!-- Remember Me -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          formControlName="rememberMe"
          class="w-4 h-4 rounded border-ct-border-strong accent-primary-light"
        />
        <span class="text-[13px]" style="color: var(--text-secondary)">Keep me signed in</span>
      </label>

      <!-- Submit -->
      <button
        type="submit"
        [disabled]="loginForm.invalid || isLoading"
        class="btn btn-primary w-full"
        style="height: 42px; font-size: 14px; font-weight: 600"
      >
        {{ isLoading ? 'Signing in...' : 'Sign In' }}
      </button>

      <!-- Register Link -->
      <p class="text-center text-[13px]" style="color: var(--text-muted)">
        Don't have an account?
        <a [routerLink]="['/auth/register']" class="font-medium" style="color: var(--primary-light)"
          >Create account</a
        >
      </p>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class LoginComponent {
  public loginForm: FormGroup;
  public showPassword = false;
  public isLoading = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);

  constructor() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  public onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;

      const payload: ILoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        isMobile: false,
        deviceId: '',
        deviceModel: '',
        osVersion: '',
        appVersion: '1.0.0',
        buildNumber: '1',
        deviceType: 'web',
        platform: 'web',
        userAgent: navigator.userAgent,
        latitude: 0,
        longitude: 0,
        country: '',
        city: ''
      };

      this._authService.login(payload).subscribe({
        next: () => {
          this._router.navigate(['/dashboard']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
