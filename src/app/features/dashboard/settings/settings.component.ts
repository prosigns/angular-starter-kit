import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <h1>Settings</h1>

      <div class="settings-content">
        <div class="settings-nav">
          <button
            class="nav-item"
            [class.active]="activeSection === 'account'"
            (click)="setActiveSection('account')"
          >
            Account Settings
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection === 'notification'"
            (click)="setActiveSection('notification')"
          >
            Notification Settings
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection === 'privacy'"
            (click)="setActiveSection('privacy')"
          >
            Privacy Settings
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection === 'appearance'"
            (click)="setActiveSection('appearance')"
          >
            Appearance
          </button>
        </div>

        <div class="settings-panel">
          <!-- Account Settings -->
          @if (activeSection === 'account') {
            <div class="settings-section">
              <h2>Account Settings</h2>
              <form [formGroup]="accountForm">
                <div class="form-group">
                  <label>
                    <input type="checkbox" formControlName="twoFactorAuth" />
                    Enable Two-Factor Authentication
                  </label>
                  <p class="help-text">
                    Enhance your account security with two-factor authentication
                  </p>
                </div>
                <div class="form-group">
                  <label for="language">Language</label>
                  <select id="language" formControlName="language">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="timezone">Timezone</label>
                  <select id="timezone" formControlName="timezone">
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC">Universal Coordinated Time (UTC)</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                    <option value="UTC+8">China Standard Time (UTC+8)</option>
                  </select>
                </div>
                <div class="form-actions">
                  <button type="button" (click)="saveSettings('account')">Save Changes</button>
                </div>
              </form>
            </div>
          }

          <!-- Notification Settings -->
          @if (activeSection === 'notification') {
            <div class="settings-section">
              <h2>Notification Settings</h2>
              <form [formGroup]="notificationForm">
                <div class="form-group">
                  <h3>Email Notifications</h3>
                  <label>
                    <input type="checkbox" formControlName="emailNews" />
                    News and Updates
                  </label>
                  <label>
                    <input type="checkbox" formControlName="emailAccount" />
                    Account Activity
                  </label>
                  <label>
                    <input type="checkbox" formControlName="emailMarketing" />
                    Marketing and Promotions
                  </label>
                </div>
                <div class="form-group">
                  <h3>Push Notifications</h3>
                  <label>
                    <input type="checkbox" formControlName="pushAccount" />
                    Account Activity
                  </label>
                  <label>
                    <input type="checkbox" formControlName="pushUpdates" />
                    System Updates
                  </label>
                </div>
                <div class="form-actions">
                  <button type="button" (click)="saveSettings('notification')">Save Changes</button>
                </div>
              </form>
            </div>
          }

          <!-- Privacy Settings -->
          @if (activeSection === 'privacy') {
            <div class="settings-section">
              <h2>Privacy Settings</h2>
              <form [formGroup]="privacyForm">
                <div class="form-group">
                  <h3>Profile Visibility</h3>
                  <label>
                    <input type="radio" formControlName="profileVisibility" value="public" />
                    Public - Anyone can view your profile
                  </label>
                  <label>
                    <input type="radio" formControlName="profileVisibility" value="contacts" />
                    Contacts Only - Only your contacts can view your profile
                  </label>
                  <label>
                    <input type="radio" formControlName="profileVisibility" value="private" />
                    Private - Only you can view your profile
                  </label>
                </div>
                <div class="form-group">
                  <h3>Data Usage</h3>
                  <label>
                    <input type="checkbox" formControlName="dataAnalytics" />
                    Allow data collection for analytics and improvements
                  </label>
                  <label>
                    <input type="checkbox" formControlName="dataMarketing" />
                    Allow data usage for marketing purposes
                  </label>
                </div>
                <div class="form-actions">
                  <button type="button" (click)="saveSettings('privacy')">Save Changes</button>
                </div>
              </form>
            </div>
          }

          <!-- Appearance Settings -->
          @if (activeSection === 'appearance') {
            <div class="settings-section">
              <h2>Appearance</h2>
              <form [formGroup]="appearanceForm">
                <div class="form-group">
                  <h3>Theme</h3>
                  <div class="theme-options">
                    <label class="theme-option">
                      <input type="radio" formControlName="theme" value="light" />
                      <div class="theme-preview light-theme">Light</div>
                    </label>
                    <label class="theme-option">
                      <input type="radio" formControlName="theme" value="dark" />
                      <div class="theme-preview dark-theme">Dark</div>
                    </label>
                    <label class="theme-option">
                      <input type="radio" formControlName="theme" value="system" />
                      <div class="theme-preview system-theme">System</div>
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <h3>Font Size</h3>
                  <div class="slider-container">
                    <input type="range" min="12" max="20" formControlName="fontSize" />
                    <span>{{ appearanceForm.get('fontSize')?.value }}px</span>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" (click)="saveSettings('appearance')">Save Changes</button>
                </div>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        padding: 20px;
      }

      h1 {
        margin-bottom: 24px;
        color: #333;
      }

      .settings-content {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 30px;
      }

      .settings-nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .nav-item {
        background: none;
        border: none;
        padding: 12px 16px;
        text-align: left;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s;
      }

      .nav-item:hover {
        background-color: #f0f0f0;
      }

      .nav-item.active {
        background-color: #3f51b5;
        color: white;
      }

      .settings-panel {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      .settings-section {
        margin-bottom: 20px;
      }

      h2 {
        border-bottom: 1px solid #eee;
        padding-bottom: 12px;
        margin-top: 0;
        margin-bottom: 24px;
        color: #333;
      }

      h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 18px;
        color: #555;
      }

      .form-group {
        margin-bottom: 24px;
      }

      label {
        display: block;
        margin-bottom: 10px;
        cursor: pointer;
      }

      input[type='checkbox'],
      input[type='radio'] {
        margin-right: 8px;
      }

      select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        margin-top: 8px;
      }

      .help-text {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
        margin-left: 24px;
      }

      .theme-options {
        display: flex;
        gap: 16px;
      }

      .theme-option {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .theme-preview {
        width: 100px;
        height: 80px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 8px;
        border: 2px solid transparent;
      }

      input[type='radio']:checked + .theme-preview {
        border-color: #3f51b5;
      }

      .light-theme {
        background-color: #ffffff;
        color: #333;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .dark-theme {
        background-color: #333;
        color: #fff;
      }

      .system-theme {
        background-image: linear-gradient(to right, #ffffff 50%, #333 50%);
        color: transparent;
        position: relative;
      }

      .system-theme::after {
        content: 'System';
        color: #000;
        background-color: rgba(255, 255, 255, 0.7);
        padding: 4px 8px;
        border-radius: 4px;
      }

      .slider-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      input[type='range'] {
        flex: 1;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }

      .form-actions button {
        background-color: #3f51b5;
        color: white;
      }

      @media (max-width: 768px) {
        .settings-content {
          grid-template-columns: 1fr;
        }

        .settings-nav {
          flex-direction: row;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .nav-item {
          white-space: nowrap;
        }
      }
    `
  ]
})
export class SettingsComponent {
  activeSection = 'account';
  accountForm: FormGroup;
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  appearanceForm: FormGroup;

  constructor(private _fb: FormBuilder) {
    this.accountForm = this._fb.group({
      twoFactorAuth: [false],
      language: ['en'],
      timezone: ['UTC-5']
    });

    this.notificationForm = this._fb.group({
      emailNews: [true],
      emailAccount: [true],
      emailMarketing: [false],
      pushAccount: [true],
      pushUpdates: [true]
    });

    this.privacyForm = this._fb.group({
      profileVisibility: ['contacts'],
      dataAnalytics: [true],
      dataMarketing: [false]
    });

    this.appearanceForm = this._fb.group({
      theme: ['light'],
      fontSize: [14]
    });
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  saveSettings(formType: string): void {
    let form: FormGroup;

    switch (formType) {
      case 'account':
        form = this.accountForm;
        break;
      case 'notification':
        form = this.notificationForm;
        break;
      case 'privacy':
        form = this.privacyForm;
        break;
      case 'appearance':
        form = this.appearanceForm;
        break;
      default:
        return;
    }

    if (form.valid) {
      // In a real app, this would call a service to save settings
      console.log(`${formType} settings saved:`, form.value);
      alert('Settings saved successfully!');
    }
  }
}
