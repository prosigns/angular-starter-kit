import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <h1>Admin Settings</h1>

      <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h2>General Settings</h2>

          <div class="form-group">
            <label for="siteName">Site Name</label>
            <input type="text" id="siteName" formControlName="siteName" />
          </div>

          <div class="form-group">
            <label for="siteUrl">Site URL</label>
            <input type="text" id="siteUrl" formControlName="siteUrl" />
          </div>

          <div class="form-group">
            <label for="adminEmail">Admin Email</label>
            <input type="email" id="adminEmail" formControlName="adminEmail" />
          </div>
        </div>

        <div class="form-section">
          <h2>Security Settings</h2>

          <div class="form-group">
            <label for="sessionTimeout">Session Timeout (minutes)</label>
            <input type="number" id="sessionTimeout" formControlName="sessionTimeout" />
          </div>

          <div class="form-group">
            <label for="loginAttempts">Max Login Attempts</label>
            <input type="number" id="loginAttempts" formControlName="loginAttempts" />
          </div>

          <div class="form-group checkbox-group">
            <input type="checkbox" id="twoFactorAuth" formControlName="twoFactorAuth" />
            <label for="twoFactorAuth">Enable Two-Factor Authentication</label>
          </div>
        </div>

        <div class="form-actions">
          <button type="reset">Reset</button>
          <button type="submit" [disabled]="settingsForm.invalid">Save Settings</button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .settings-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .form-section {
        margin-bottom: 30px;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
      }
      h2 {
        margin-top: 0;
        color: #333;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input[type='text'],
      input[type='email'],
      input[type='number'] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .checkbox-group {
        display: flex;
        align-items: center;
      }
      .checkbox-group label {
        margin-left: 10px;
        margin-bottom: 0;
      }
      .checkbox-group input {
        width: auto;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button[type='submit'] {
        background-color: #4caf50;
        color: white;
      }
      button[type='reset'] {
        background-color: #f5f5f5;
      }
      button[disabled] {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    `
  ]
})
export class AdminSettingsComponent {
  settingsForm: FormGroup;

  constructor(private _fb: FormBuilder) {
    this.settingsForm = this._fb.group({
      siteName: ['Angular Starter Kit', Validators.required],
      siteUrl: ['https://example.com', Validators.required],
      adminEmail: ['admin@example.com', [Validators.required, Validators.email]],
      sessionTimeout: [30, [Validators.required, Validators.min(5)]],
      loginAttempts: [5, [Validators.required, Validators.min(1)]],
      twoFactorAuth: [false]
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      // Save settings - in a real app, this would be handled by a service
      console.log('Settings saved:', this.settingsForm.value);
      alert('Settings saved successfully!');
    }
  }
}
