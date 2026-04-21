import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mb-5">
      <h2
        class="text-[20px] font-semibold mb-1"
        style="color: var(--text-primary); letter-spacing: -0.02em"
      >
        Forgot password?
      </h2>
      <p class="text-[13px]" style="color: var(--text-muted)">
        Enter your email and we'll send a reset link
      </p>
    </div>

    <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
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
            forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched
          "
          [attr.aria-invalid]="
            forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched
          "
          [attr.aria-describedby]="
            forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched
              ? 'forgot-email-error'
              : null
          "
        />
        @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
          <div id="forgot-email-error" class="input-error-text" role="alert">
            @if (forgotPasswordForm.get('email')?.errors?.['required']) {
              <span>Email is required</span>
            }
            @if (forgotPasswordForm.get('email')?.errors?.['email']) {
              <span>Enter a valid email address</span>
            }
          </div>
        }
      </div>

      <!-- Submit -->
      <button
        type="submit"
        [disabled]="forgotPasswordForm.invalid"
        class="btn btn-primary w-full"
        style="height: 42px; font-size: 14px; font-weight: 600"
      >
        Send Reset Link
      </button>

      <!-- Back to Login -->
      <p class="text-center">
        <a
          [routerLink]="['/auth/login']"
          class="text-[13px] font-medium"
          style="color: var(--primary-light)"
          >Back to sign in</a
        >
      </p>
    </form>

    @if (submitted) {
      <div
        class="mt-4 p-4 rounded-btn border"
        style="background: var(--success-50); border-color: var(--success-200)"
      >
        <p class="text-body text-center" style="color: var(--success-700)">
          We've sent a password reset link to your email address.
        </p>
        <p class="text-caption text-center mt-1" style="color: var(--success-700)">
          Please check your inbox and follow the instructions.
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
export class ForgotPasswordComponent {
  public forgotPasswordForm: FormGroup;
  public submitted = false;
  private _fb = inject(FormBuilder);
  private _router = inject(Router);

  constructor() {
    this.forgotPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.submitted = true;
      this.forgotPasswordForm.disable();

      setTimeout(() => {
        this._router.navigate(['/auth/login']);
      }, 5000);
    }
  }
}
