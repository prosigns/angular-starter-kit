import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink],
    template: `
    <h2>Create Account</h2>
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" formControlName="name" placeholder="Enter your full name" />
        @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
          <div
            class="error-message"
            >
            Full name is required
          </div>
        }
      </div>
    
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" formControlName="email" placeholder="Enter your email" />
        @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
          <div
            class="error-message"
            >
            @if (registerForm.get('email')?.errors?.['required']) {
              <span>Email is required</span>
            }
            @if (registerForm.get('email')?.errors?.['email']) {
              <span
                >Enter a valid email address</span
                >
              }
            </div>
          }
        </div>
    
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            placeholder="Create a password"
            />
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <div
                class="error-message"
                >
                @if (registerForm.get('password')?.errors?.['required']) {
                  <span
                    >Password is required</span
                    >
                }
                @if (registerForm.get('password')?.errors?.['minlength']) {
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
              placeholder="Confirm your password"
              />
              @if (
                registerForm.get('confirmPassword')?.invalid &&
                registerForm.get('confirmPassword')?.touched
                ) {
                <div
                  class="error-message"
                  >
                  @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                    <span>
                      Password confirmation is required
                    </span>
                  }
                </div>
              }
              @if (
                registerForm.errors?.['passwordMismatch'] &&
                registerForm.get('confirmPassword')?.touched
                ) {
                <div
                  class="error-message"
                  >
                  Passwords do not match
                </div>
              }
            </div>
    
            <div class="form-group terms">
              <input type="checkbox" id="terms" formControlName="terms" />
              <label for="terms">I agree to the Terms and Conditions</label>
              @if (registerForm.get('terms')?.invalid && registerForm.get('terms')?.touched) {
                <div
                  class="error-message"
                  >
                  You must agree to the terms and conditions
                </div>
              }
            </div>
    
            <button type="submit" [disabled]="registerForm.invalid">Create Account</button>
    
            <div class="auth-links">
              <p>Already have an account? <a [routerLink]="['/auth/login']">Sign In</a></p>
            </div>
          </form>
    `,
    styles: [
        `
      h2 {
        text-align: center;
        margin-bottom: 24px;
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
      input[type='text'],
      input[type='email'],
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
      .terms {
        display: flex;
        align-items: flex-start;
      }
      .terms input {
        margin-right: 8px;
        margin-top: 4px;
      }
      .terms label {
        font-weight: normal;
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
      }
      .auth-links a {
        color: #3f51b5;
        text-decoration: none;
      }
    `
    ]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _router: Router
  ) {
    this.registerForm = this._fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue]
      },
      { validators: this.passwordMatchValidator }
    );
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
    if (this.registerForm.valid) {
      // In a real app, this would call an authentication service
      console.log('Registration:', this.registerForm.value);

      // Navigate to login on successful registration
      this._router.navigate(['/auth/login']);
    }
  }
}
