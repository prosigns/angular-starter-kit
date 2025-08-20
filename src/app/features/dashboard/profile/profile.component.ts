import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-profile',
    imports: [ReactiveFormsModule, NgIf],
    template: `
    <div class="profile-container">
      <h1>My Profile</h1>

      <div class="profile-content">
        <div class="profile-sidebar">
          <div class="profile-avatar">
            <img src="assets/images/avatar-placeholder.jpg" alt="Profile Avatar" />
            <button class="change-avatar-btn">Change Avatar</button>
          </div>

          <div class="profile-info">
            <h3>John Doe</h3>
            <p>Administrator</p>
            <p>Member since: Jan 2023</p>
          </div>
        </div>

        <div class="profile-details">
          <h2>Personal Information</h2>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" formControlName="firstName" />
                <div
                  *ngIf="
                    profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched
                  "
                  class="error-message"
                >
                  First name is required
                </div>
              </div>

              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" formControlName="lastName" />
                <div
                  *ngIf="
                    profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched
                  "
                  class="error-message"
                >
                  Last name is required
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" formControlName="email" />
              <div
                *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                class="error-message"
              >
                <span *ngIf="profileForm.get('email')?.errors?.['required']"
                  >Email is required</span
                >
                <span *ngIf="profileForm.get('email')?.errors?.['email']"
                  >Enter a valid email address</span
                >
              </div>
            </div>

            <div class="form-group">
              <label for="phone">Phone</label>
              <input type="tel" id="phone" formControlName="phone" />
            </div>

            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea id="bio" formControlName="bio" rows="4"></textarea>
            </div>

            <div class="form-actions">
              <button type="button" (click)="resetForm()">Cancel</button>
              <button type="submit" [disabled]="profileForm.invalid || !profileForm.dirty">
                Save Changes
              </button>
            </div>
          </form>

          <h2>Change Password</h2>

          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input type="password" id="currentPassword" formControlName="currentPassword" />
              <div
                *ngIf="
                  passwordForm.get('currentPassword')?.invalid &&
                  passwordForm.get('currentPassword')?.touched
                "
                class="error-message"
              >
                Current password is required
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input type="password" id="newPassword" formControlName="newPassword" />
              <div
                *ngIf="
                  passwordForm.get('newPassword')?.invalid &&
                  passwordForm.get('newPassword')?.touched
                "
                class="error-message"
              >
                <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']"
                  >New password is required</span
                >
                <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">
                  Password must be at least 8 characters
                </span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" formControlName="confirmPassword" />
              <div
                *ngIf="
                  passwordForm.get('confirmPassword')?.invalid &&
                  passwordForm.get('confirmPassword')?.touched
                "
                class="error-message"
              >
                Confirm password is required
              </div>
              <div
                *ngIf="
                  passwordForm.errors?.['passwordMismatch'] &&
                  passwordForm.get('confirmPassword')?.touched
                "
                class="error-message"
              >
                Passwords do not match
              </div>
            </div>

            <div class="form-actions">
              <button type="button" (click)="resetPasswordForm()">Cancel</button>
              <button type="submit" [disabled]="passwordForm.invalid">Change Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [
        `
      .profile-container {
        padding: 20px;
      }

      h1 {
        margin-bottom: 24px;
        color: #333;
      }

      .profile-content {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 30px;
      }

      .profile-sidebar {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: fit-content;
      }

      .profile-avatar {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .profile-avatar img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #f5f5f5;
        margin-bottom: 12px;
      }

      .change-avatar-btn {
        padding: 8px 12px;
        background-color: #f5f5f5;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .profile-info {
        text-align: center;
      }

      .profile-info h3 {
        margin: 0 0 8px 0;
      }

      .profile-info p {
        margin: 4px 0;
        color: #666;
      }

      .profile-details {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      h2 {
        border-bottom: 1px solid #eee;
        padding-bottom: 12px;
        margin-top: 0;
        margin-bottom: 24px;
        color: #333;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }

      input[type='text'],
      input[type='email'],
      input[type='tel'],
      input[type='password'],
      textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }

      textarea {
        resize: vertical;
      }

      .error-message {
        color: #dc3545;
        font-size: 14px;
        margin-top: 4px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
        margin-bottom: 30px;
      }

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }

      button[type='submit'] {
        background-color: #3f51b5;
        color: white;
      }

      button[type='submit']:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }

      button[type='button'] {
        background-color: #f5f5f5;
      }

      @media (max-width: 768px) {
        .profile-content {
          grid-template-columns: 1fr;
        }

        .form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }
      }
    `
    ]
})
export class ProfileComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(private _fb: FormBuilder) {
    this.profileForm = this._fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', Validators.required],
      email: ['john&#64;example.com', [Validators.required, Validators.email]],
      phone: ['+1 (555) 123-4567'],
      bio: ['Full stack developer with a passion for creating efficient, scalable applications.']
    });

    this.passwordForm = this._fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      // In a real app, this would call a service to update profile
      console.log('Profile updated:', this.profileForm.value);
      alert('Profile updated successfully!');
      this.profileForm.markAsPristine();
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      // In a real app, this would call a service to change password
      console.log('Password change:', this.passwordForm.value);
      alert('Password changed successfully!');
      this.resetPasswordForm();
    }
  }

  resetForm(): void {
    this.profileForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john&#64;example.com',
      phone: '+1 (555) 123-4567',
      bio: 'Full stack developer with a passion for creating efficient, scalable applications.'
    });
    this.profileForm.markAsPristine();
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }
}
