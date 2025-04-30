import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="not-found-code">404</div>
        <h1 class="not-found-title">{{ 'notFound.title' | translate }}</h1>
        <p class="not-found-message">{{ 'notFound.message' | translate }}</p>
        
        <div class="not-found-actions">
          <a routerLink="/" class="btn btn-primary">{{ 'notFound.backToHome' | translate }}</a>
          <a routerLink="/contact" class="btn btn-outline">{{ 'notFound.contactSupport' | translate }}</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background-color: #f9fafb;
    }
    
    .not-found-content {
      text-align: center;
      max-width: 600px;
    }
    
    .not-found-code {
      font-size: 10rem;
      font-weight: 700;
      line-height: 1;
      color: #4f46e5;
      margin-bottom: 1rem;
    }
    
    .not-found-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .not-found-message {
      font-size: 1.125rem;
      margin-bottom: 2rem;
      color: #6b7280;
    }
    
    .not-found-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }
    
    .btn-primary {
      background-color: #4f46e5;
      color: white;
      border: none;
    }
    
    .btn-primary:hover {
      background-color: #4338ca;
      transform: translateY(-2px);
    }
    
    .btn-outline {
      background-color: transparent;
      color: #4f46e5;
      border: 1px solid #4f46e5;
    }
    
    .btn-outline:hover {
      background-color: rgba(79, 70, 229, 0.1);
      transform: translateY(-2px);
    }
    
    /* Dark mode styles */
    :host-context(.dark) .not-found-container {
      background-color: #1f2937;
      color: #e5e7eb;
    }
    
    :host-context(.dark) .not-found-message {
      color: #9ca3af;
    }
    
    :host-context(.dark) .btn-outline {
      color: #6366f1;
      border-color: #6366f1;
    }
    
    :host-context(.dark) .btn-outline:hover {
      background-color: rgba(99, 102, 241, 0.1);
    }
  `]
})
export class NotFoundComponent {} 