/* eslint-disable max-len */
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mb-5">
      <h2
        class="text-[20px] font-semibold mb-1"
        style="color: var(--text-primary); letter-spacing: -0.02em"
      >
        Create account
      </h2>
      <p class="text-[13px]" style="color: var(--text-muted)">Get started with CareTrack</p>
    </div>

    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-3">
      <!-- Full Name -->
      <div>
        <label for="name" class="input-label">Full Name</label>
        <input
          type="text"
          id="name"
          formControlName="name"
          placeholder="Enter your full name"
          class="input w-full"
          [class.input-error]="
            registerForm.get('name')?.invalid && registerForm.get('name')?.touched
          "
          [attr.aria-invalid]="
            registerForm.get('name')?.invalid && registerForm.get('name')?.touched
          "
          [attr.aria-describedby]="
            registerForm.get('name')?.invalid && registerForm.get('name')?.touched
              ? 'name-error'
              : null
          "
        />
        @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
          <div id="name-error" class="input-error-text" role="alert">Full name is required</div>
        }
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="input-label">Email</label>
        <input
          type="email"
          id="email"
          formControlName="email"
          placeholder="Enter your email"
          class="input w-full"
          [class.input-error]="
            registerForm.get('email')?.invalid && registerForm.get('email')?.touched
          "
          [attr.aria-invalid]="
            registerForm.get('email')?.invalid && registerForm.get('email')?.touched
          "
          [attr.aria-describedby]="
            registerForm.get('email')?.invalid && registerForm.get('email')?.touched
              ? 'reg-email-error'
              : null
          "
        />
        @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
          <div id="reg-email-error" class="input-error-text" role="alert">
            @if (registerForm.get('email')?.errors?.['required']) {
              <span>Email is required</span>
            }
            @if (registerForm.get('email')?.errors?.['email']) {
              <span>Enter a valid email address</span>
            }
          </div>
        }
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="input-label">Password</label>
        <div class="relative">
          <input
            [type]="showPassword ? 'text' : 'password'"
            id="password"
            formControlName="password"
            placeholder="Create a password"
            class="input w-full pr-10"
            [class.input-error]="
              registerForm.get('password')?.invalid && registerForm.get('password')?.touched
            "
            [attr.aria-invalid]="
              registerForm.get('password')?.invalid && registerForm.get('password')?.touched
            "
            [attr.aria-describedby]="
              registerForm.get('password')?.invalid && registerForm.get('password')?.touched
                ? 'reg-password-error'
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
        @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
          <div id="reg-password-error" class="input-error-text" role="alert">
            @if (registerForm.get('password')?.errors?.['required']) {
              <span>Password is required</span>
            }
            @if (registerForm.get('password')?.errors?.['minlength']) {
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
            placeholder="Confirm your password"
            class="input w-full pr-10"
            [class.input-error]="
              registerForm.get('confirmPassword')?.invalid &&
              registerForm.get('confirmPassword')?.touched
            "
            [attr.aria-invalid]="
              registerForm.get('confirmPassword')?.invalid &&
              registerForm.get('confirmPassword')?.touched
            "
            [attr.aria-describedby]="
              registerForm.get('confirmPassword')?.invalid &&
              registerForm.get('confirmPassword')?.touched
                ? 'reg-confirm-error'
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
          registerForm.get('confirmPassword')?.invalid &&
          registerForm.get('confirmPassword')?.touched
        ) {
          <div id="reg-confirm-error" class="input-error-text" role="alert">
            @if (registerForm.get('confirmPassword')?.errors?.['required']) {
              <span>Password confirmation is required</span>
            }
          </div>
        }
        @if (
          registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched
        ) {
          <div id="reg-confirm-error" class="input-error-text" role="alert">
            Passwords do not match
          </div>
        }
      </div>

      <!-- Terms -->
      <label class="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          formControlName="terms"
          class="w-4 h-4 mt-0.5 rounded border-ct-border-strong accent-primary-light"
        />
        <span class="text-[13px]" style="color: var(--text-secondary)"
          >I agree to the Terms and Conditions</span
        >
      </label>
      @if (registerForm.get('terms')?.invalid && registerForm.get('terms')?.touched) {
        <div class="input-error-text" role="alert">You must agree to the terms and conditions</div>
      }

      <!-- Submit -->
      <button
        type="submit"
        [disabled]="registerForm.invalid"
        class="btn btn-primary w-full"
        style="height: 42px; font-size: 14px; font-weight: 600"
      >
        Create Account
      </button>

      <!-- Login Link -->
      <p class="text-center text-[13px]" style="color: var(--text-muted)">
        Already have an account?
        <a [routerLink]="['/auth/login']" class="font-medium" style="color: var(--primary-light)"
          >Sign in</a
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
export class RegisterComponent {
  public registerForm: FormGroup;
  public showPassword = false;
  public showConfirmPassword = false;
  private _fb = inject(FormBuilder);
  private _router = inject(Router);

  constructor() {
    this.registerForm = this._fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue]
      },
      { validators: this._passwordMatchValidator }
    );
  }

  public onSubmit(): void {
    if (this.registerForm.valid) {
      this._router.navigate(['/auth/login']);
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
