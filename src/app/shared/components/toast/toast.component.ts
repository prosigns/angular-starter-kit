import { Component, computed, inject } from '@angular/core';

import { ToastService, ToastType } from '../../../core/services/toast.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-toast',
    imports: [],
    template: `
    @if (visibleToasts().length) {
      <div class="toast-container">
        @for (toast of visibleToasts(); track toast.id) {
          <div
            class="toast-item toast-{{toast.type}}"
            [@toastAnimation]="'visible'"
            (click)="removeToast(toast.id)"
            >
            <div class="toast-icon">
              @switch (toast.type) {
                @case (toastTypes.SUCCESS) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                }
                @case (toastTypes.ERROR) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                }
                @case (toastTypes.WARNING) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                }
                @case (toastTypes.INFO) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                }
              }
            </div>
            <div class="toast-content">
              <div class="toast-message">{{ toast.message }}</div>
            </div>
            <button class="toast-close" (click)="removeToast(toast.id); $event.stopPropagation()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        }
      </div>
    }
    `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 350px;
      width: 100%;
      pointer-events: none;
    }
    
    .toast-item {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      pointer-events: auto;
      cursor: pointer;
      overflow: hidden;
    }
    
    .toast-success {
      background-color: #ecfdf5;
      border: 1px solid #10b981;
      color: #065f46;
    }
    
    .toast-error {
      background-color: #fef2f2;
      border: 1px solid #ef4444;
      color: #991b1b;
    }
    
    .toast-info {
      background-color: #eff6ff;
      border: 1px solid #3b82f6;
      color: #1e40af;
    }
    
    .toast-warning {
      background-color: #fffbeb;
      border: 1px solid #f59e0b;
      color: #92400e;
    }
    
    .toast-icon {
      flex-shrink: 0;
      margin-right: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .toast-content {
      flex: 1;
    }
    
    .toast-message {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .toast-close {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: currentColor;
      opacity: 0.7;
      margin-left: 0.5rem;
    }
    
    .toast-close:hover {
      opacity: 1;
    }
    
    :host-context(.dark) .toast-success {
      background-color: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
      color: #d1fae5;
    }
    
    :host-context(.dark) .toast-error {
      background-color: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      color: #fee2e2;
    }
    
    :host-context(.dark) .toast-info {
      background-color: rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
      color: #dbeafe;
    }
    
    :host-context(.dark) .toast-warning {
      background-color: rgba(245, 158, 11, 0.1);
      border-color: #f59e0b;
      color: #fef3c7;
    }
  `],
    animations: [
        trigger('toastAnimation', [
            state('visible', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            transition(':enter', [
                style({
                    transform: 'translateX(100%)',
                    opacity: 0
                }),
                animate('300ms ease-out')
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({
                    transform: 'translateX(100%)',
                    opacity: 0
                }))
            ])
        ])
    ]
})
export class ToastComponent {
  private toastService = inject(ToastService);
  
  // Use a computed signal to access the toasts
  readonly visibleToasts = computed(() => this.toastService.toasts());
  
  // Make toast types available in the template
  readonly toastTypes = ToastType;
  
  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }
} 