import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


@Component({
    selector: 'app-reset-password',
    imports: [ReactiveFormsModule, RouterLink],
    template: `
    <h2>Reset Password</h2>
    @if (!submitted) {
      <p class="description">Please enter your new password below.</p>
    }
    
    @if (!submitted) {
      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="password">New Password</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            placeholder="Enter your new password"
            />
            @if (
              resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched
              ) {
              <div
                class="error-message"
                >
                @if (resetPasswordForm.get('password')?.errors?.['required']) {
                  <span
                    >Password is required</span
                    >
                }
                @if (resetPasswordForm.get('password')?.errors?.['minlength']) {
                  <span>
                    Password must be at least 8 characters
                  </span>
                }
              </div>
            }
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="Confirm your new password"
              />
              @if (
                resetPasswordForm.get('confirmPassword')?.invalid &&
                resetPasswordForm.get('confirmPassword')?.touched
                ) {
                <div
                  class="error-message"
                  >
                  @if (resetPasswordForm.get('confirmPassword')?.errors?.['required']) {
                    <span>
                      Password confirmation is required
                    </span>
                  }
                </div>
              }
              @if (
                resetPasswordForm.errors?.['passwordMismatch'] &&
                resetPasswordForm.get('confirmPassword')?.touched
                ) {
                <div
                  class="error-message"
                  >
                  Passwords do not match
                </div>
              }
            </div>
            <button type="submit" [disabled]="resetPasswordForm.invalid">Reset Password</button>
          </form>
        }
    
        @if (submitted) {
          <div class="success-message">
            <p>Your password has been successfully reset!</p>
            <p>You can now <a [routerLink]="['/auth/login']">log in</a> with your new password.</p>
          </div>
        }
    
        @if (invalidToken) {
          <div class="error-box">
            <p>The password reset link is invalid or has expired.</p>
            <p>
              Please request a new <a [routerLink]="['/auth/forgot-password']">password reset link</a>.
            </p>
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
      input[type='password'] {
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
      .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 16px;
        border-radius: 4px;
        margin-top: 16px;
        text-align: center;
      }
      .error-box {
        background-color: #f8d7da;
        color: #721c24;
        padding: 16px;
        border-radius: 4px;
        margin-top: 16px;
        text-align: center;
      }
      .success-message p,
      .error-box p {
        margin: 8px 0;
      }
      a {
        color: #3f51b5;
        text-decoration: none;
      }
    `
    ]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  submitted = false;
  invalidToken = false;
  resetToken = '';

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.resetPasswordForm = this._fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Get token from URL
    this._route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';

      // Validate token (in a real app this would be a server call)
      if (!this.resetToken || this.resetToken.length < 10) {
        this.invalidToken = true;
      }
    });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && !this.invalidToken) {
      // In a real app, this would call an authentication service with the token
      console.log('Password reset:', {
        token: this.resetToken,
        ...this.resetPasswordForm.value
      });

      // Show success message
      this.submitted = true;

      // In a real app, you might redirect after a delay
      setTimeout(() => {
        this._router.navigate(['/auth/login']);
      }, 5000);
    }
  }
}
