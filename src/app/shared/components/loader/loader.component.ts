import { Component, inject } from '@angular/core';

import { LoaderService } from '../../../core/services/loader.service';

@Component({
    selector: 'app-loader',
    imports: [],
    template: `
    @if (loaderService.isLoading()) {
      <div class="loader-container">
        <div class="loader-backdrop"></div>
        <div class="loader-spinner">
          <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="8" />
            <path
              d="M 50 5 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="currentColor"
              stroke-width="8"
              stroke-linecap="round"
              class="loader-spinner-path"
              />
            </svg>
            <div class="loader-text">{{ loaderService.loadingMessage() }}</div>
          </div>
        </div>
      }
    `,
    styles: [`
    .loader-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .loader-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(2px);
    }
    
    .loader-spinner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      color: #3b82f6;
      z-index: 1;
    }
    
    :host-context(.dark) .loader-spinner {
      background-color: #1f2937;
      color: #60a5fa;
    }
    
    .loader-spinner-path {
      animation: loader-spin 1s linear infinite;
      transform-origin: center;
    }
    
    .loader-text {
      margin-top: 1rem;
      font-size: 0.875rem;
      text-align: center;
    }
    
    @keyframes loader-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoaderComponent {
  loaderService = inject(LoaderService);
} 