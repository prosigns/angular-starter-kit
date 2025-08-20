import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink, NgIf],
    template: `
    <h2>Sign In</h2>
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          formControlName="email"
          placeholder="Enter your email"
          [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
        />
        <div
          class="error-message"
          *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
        >
          <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
          <span *ngIf="loginForm.get('email')?.errors?.['email']">Enter a valid email address</span>
        </div>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          formControlName="password"
          placeholder="Enter your password"
          [class.is-invalid]="
            loginForm.get('password')?.invalid && loginForm.get('password')?.touched
          "
        />
        <div
          class="error-message"
          *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
        >
          <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
        </div>
      </div>

      <div class="form-options">
        <div class="remember-me">
          <input type="checkbox" id="remember" formControlName="rememberMe" />
          <label for="remember">Remember me</label>
        </div>
        <a [routerLink]="['/auth/forgot-password']" class="forgot-password">Forgot password?</a>
      </div>

      <button type="submit" [disabled]="loginForm.invalid">Sign In</button>

      <div class="auth-links">
        <p>Don't have an account? <a [routerLink]="['/auth/register']">Sign Up</a></p>
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
      input[type='email'],
      input[type='password'] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      input.is-invalid {
        border-color: #dc3545;
      }
      .error-message {
        color: #dc3545;
        font-size: 14px;
        margin-top: 4px;
      }
      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .remember-me {
        display: flex;
        align-items: center;
      }
      .remember-me input {
        margin-right: 8px;
      }
      .forgot-password {
        color: #3f51b5;
        text-decoration: none;
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
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _router: Router
  ) {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // In a real app, this would call an authentication service
      console.log('Login attempt:', this.loginForm.value);

      // Navigate to dashboard on successful login
      this._router.navigate(['/dashboard']);
    }
  }
}
