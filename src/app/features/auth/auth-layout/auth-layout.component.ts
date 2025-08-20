import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <h1>Angular Starter Kit</h1>
        </div>
        <div class="auth-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }
      .auth-card {
        width: 100%;
        max-width: 400px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .auth-logo {
        padding: 20px;
        text-align: center;
        background-color: #3f51b5;
        color: white;
      }
      .auth-logo h1 {
        margin: 0;
        font-size: 1.5rem;
      }
      .auth-content {
        padding: 20px;
      }
    `
  ]
})
export class AuthLayoutComponent {}
