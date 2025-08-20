import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h2>Forgot Password</h2>
    <p class="description">
      Enter your email address and we'll send you a link to reset your password.
    </p>

    <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" formControlName="email" placeholder="Enter your email" />
        @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
          <div class="error-message">
            @if (forgotPasswordForm.get('email')?.errors?.['required']) {
              <span>Email is required</span>
            }
            @if (forgotPasswordForm.get('email')?.errors?.['email']) {
              <span>Enter a valid email address</span>
            }
          </div>
        }
      </div>

      <button type="submit" [disabled]="forgotPasswordForm.invalid">Send Reset Link</button>

      <div class="auth-links">
        <p>
          <a [routerLink]="['/auth/login']">Back to Login</a>
        </p>
      </div>
    </form>

    @if (submitted) {
      <div class="success-message">
        <p>We've sent a password reset link to your email address.</p>
        <p>Please check your inbox and follow the instructions to reset your password.</p>
      </div>
    }
  `,
  styles: [
    `
      h2 {
        text-align: center;
        margin-bottom: 16px;
      }
      .description {
        text-align: center;
        margin-bottom: 24px;
        color: #666;
      }
      form {
        display: flex;
        flex-direction: column;
      }
      .form-group {
        margin-bottom: 16px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      input[type='email'] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      .error-message {
        color: #dc3545;
        font-size: 14px;
        margin-top: 4px;
      }
      button {
        background-color: #3f51b5;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 12px;
        font-size: 16px;
        cursor: pointer;
        margin-bottom: 16px;
      }
      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      .auth-links {
        text-align: center;
        margin-bottom: 16px;
      }
      .auth-links a {
        color: #3f51b5;
        text-decoration: none;
      }
      .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 16px;
        border-radius: 4px;
        margin-top: 16px;
        text-align: center;
      }
      .success-message p {
        margin: 8px 0;
      }
    `
  ]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;

  constructor(
    private _fb: FormBuilder,
    private _router: Router
  ) {
    this.forgotPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      // In a real app, this would call an authentication service
      console.log('Forgot password request:', this.forgotPasswordForm.value);

      // Show success message
      this.submitted = true;

      // Hide the form
      this.forgotPasswordForm.disable();

      // In a real app, you might redirect after a delay
      setTimeout(() => {
        this._router.navigate(['/auth/login']);
      }, 5000);
    }
  }
}
