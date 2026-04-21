/* eslint-disable max-len */
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mb-5">
      <h2
        class="text-[20px] font-semibold mb-1"
        style="color: var(--text-primary); letter-spacing: -0.02em"
      >
        Reset password
      </h2>
      <p class="text-[13px]" style="color: var(--text-muted)">
        Choose a new password for your account
      </p>
    </div>

    @if (!submitted && !invalidToken) {
      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- New Password -->
        <div>
          <label for="password" class="input-label">New Password</label>
          <div class="relative">
            <input
              [type]="showPassword ? 'text' : 'password'"
              id="password"
              formControlName="password"
              placeholder="Enter your new password"
              class="input w-full pr-10"
              [class.input-error]="
                resetPasswordForm.get('password')?.invalid &&
                resetPasswordForm.get('password')?.touched
              "
              [attr.aria-invalid]="
                resetPasswordForm.get('password')?.invalid &&
                resetPasswordForm.get('password')?.touched
              "
              [attr.aria-describedby]="
                resetPasswordForm.get('password')?.invalid &&
                resetPasswordForm.get('password')?.touched
                  ? 'reset-password-error'
                  : null
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
          @if (
            resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched
          ) {
            <div id="reset-password-error" class="input-error-text" role="alert">
              @if (resetPasswordForm.get('password')?.errors?.['required']) {
                <span>Password is required</span>
              }
              @if (resetPasswordForm.get('password')?.errors?.['minlength']) {
                <span>Password must be at least 8 characters</span>
              }
            </div>
          }
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="input-label">Confirm Password</label>
          <div class="relative">
            <input
              [type]="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="Confirm your new password"
              class="input w-full pr-10"
              [class.input-error]="
                resetPasswordForm.get('confirmPassword')?.invalid &&
                resetPasswordForm.get('confirmPassword')?.touched
              "
              [attr.aria-invalid]="
                resetPasswordForm.get('confirmPassword')?.invalid &&
                resetPasswordForm.get('confirmPassword')?.touched
              "
              [attr.aria-describedby]="
                resetPasswordForm.get('confirmPassword')?.invalid &&
                resetPasswordForm.get('confirmPassword')?.touched
                  ? 'reset-confirm-error'
                  : null
              "
            />
            <button
              type="button"
              (click)="showConfirmPassword = !showConfirmPassword"
              class="absolute right-2 top-1/2 -translate-y-1/2 btn-icon w-7 h-7"
              [attr.aria-label]="showConfirmPassword ? 'Hide password' : 'Show password'"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style="stroke-width: 1.5; color: var(--text-muted)"
              >
                @if (showConfirmPassword) {
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
          @if (
            resetPasswordForm.get('confirmPassword')?.invalid &&
            resetPasswordForm.get('confirmPassword')?.touched
          ) {
            <div id="reset-confirm-error" class="input-error-text" role="alert">
              @if (resetPasswordForm.get('confirmPassword')?.errors?.['required']) {
                <span>Password confirmation is required</span>
              }
            </div>
          }
          @if (
            resetPasswordForm.errors?.['passwordMismatch'] &&
            resetPasswordForm.get('confirmPassword')?.touched
          ) {
            <div id="reset-confirm-error" class="input-error-text" role="alert">
              Passwords do not match
            </div>
          }
        </div>

        <!-- Submit -->
        <button
          type="submit"
          [disabled]="resetPasswordForm.invalid"
          class="btn btn-primary w-full"
          style="height: 42px; font-size: 14px; font-weight: 600"
        >
          Reset Password
        </button>
      </form>
    }

    @if (submitted) {
      <div
        class="mt-2 p-4 rounded-btn border"
        style="background: var(--success-50); border-color: var(--success-200)"
      >
        <p class="text-body text-center" style="color: var(--success-700)">
          Your password has been successfully reset!
        </p>
        <p class="text-caption text-center mt-1" style="color: var(--success-700)">
          You can now
          <a
            [routerLink]="['/auth/login']"
            class="font-medium underline"
            style="color: var(--success-700)"
            >log in</a
          >
          with your new password.
        </p>
      </div>
    }

    @if (invalidToken) {
      <div
        class="mt-2 p-4 rounded-btn border"
        style="background: var(--danger-50); border-color: var(--danger-200)"
      >
        <p class="text-body text-center" style="color: var(--danger-700)">
          The password reset link is invalid or has expired.
        </p>
        <p class="text-caption text-center mt-1" style="color: var(--danger-700)">
          Please request a new
          <a
            [routerLink]="['/auth/forgot-password']"
            class="font-medium underline"
            style="color: var(--danger-700)"
            >password reset link</a
          >.
        </p>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm: FormGroup;
  public submitted = false;
  public invalidToken = false;
  public resetToken = '';
  public showPassword = false;
  public showConfirmPassword = false;
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  constructor() {
    this.resetPasswordForm = this._fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this._passwordMatchValidator }
    );
  }

  public ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';

      if (!this.resetToken || this.resetToken.length < 10) {
        this.invalidToken = true;
      }
    });
  }

  public onSubmit(): void {
    if (this.resetPasswordForm.valid && !this.invalidToken) {
      this.submitted = true;

      setTimeout(() => {
        this._router.navigate(['/auth/login']);
      }, 5000);
    }
  }

  private _passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
