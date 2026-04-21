import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {
  ConfirmationService,
  IConfirmationConfig
} from '../../../core/services/confirmation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
      [@overlayAnimation]="isVisible ? 'visible' : 'hidden'"
      (click)="onOverlayClick()"
      (keydown.escape)="onCancel()"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'dialog-title'"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        tabindex="0"
        (keydown.enter)="onCancel()"
        (keydown.space)="onCancel()"
        aria-label="Close dialog"
      ></div>

      <!-- Dialog -->
      <div
        class="relative bg-white border border-gray-200 border-t-4
          rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        [ngClass]="getDialogContainerClasses()"
        [@dialogAnimation]="isVisible ? 'visible' : 'hidden'"
        (click)="$event.stopPropagation()"
        (keydown.enter)="$event.stopPropagation()"
        (keydown.space)="$event.stopPropagation()"
        tabindex="0"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <!-- Icon based on type -->
            <div class="flex-shrink-0">
              <svg
                *ngIf="config?.type === 'warning'"
                class="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0
                    2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732
                    0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
              <svg
                *ngIf="config?.type === 'danger'"
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0
                    2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732
                    0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
              <svg
                *ngIf="config?.type === 'info'"
                class="w-6 h-6 text-[#041643]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0
                    9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 id="dialog-title" class="text-lg font-semibold text-[#041643]">
              {{ config?.title }}
            </h3>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <p class="text-sm text-gray-700 leading-relaxed">
            {{ config?.message }}
          </p>
        </div>

        <!-- Actions -->
        <div
          class="px-6 py-4 bg-gray-50 border-t border-gray-200
            flex justify-end gap-3"
        >
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700
              bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 focus:outline-none focus:ring-2
              focus:ring-[#041643] focus:ring-offset-2
              focus:ring-offset-white transition-colors duration-200"
            (click)="onCancel()"
            (keydown.enter)="onCancel()"
            (keydown.space)="onCancel()"
            [attr.aria-label]="'Cancel action'"
          >
            {{ config?.cancelText || 'Cancel' }}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white
              rounded-md focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-offset-white
              transition-colors duration-200"
            [ngClass]="getConfirmButtonClasses()"
            (click)="onConfirm()"
            (keydown.enter)="onConfirm()"
            (keydown.space)="onConfirm()"
            [attr.aria-label]="'Confirm action'"
          >
            {{ config?.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('overlayAnimation', [
      state('hidden', style({ opacity: 0 })),
      state('visible', style({ opacity: 1 })),
      transition('hidden => visible', animate('200ms ease-out')),
      transition('visible => hidden', animate('150ms ease-in'))
    ]),
    trigger('dialogAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'scale(0.95) translateY(-10px)'
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'scale(1) translateY(0)'
        })
      ),
      transition('hidden => visible', animate('200ms cubic-bezier(0.34, 1.56, 0.64, 1)')),
      transition('visible => hidden', animate('150ms ease-in'))
    ])
  ]
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  public isVisible = false;
  public config: IConfirmationConfig | null = null;

  private _confirmationService = inject(ConfirmationService);
  private _subscription: Subscription = new Subscription();

  public ngOnInit(): void {
    this._subscription.add(
      this._confirmationService.confirmation$.subscribe(config => {
        // eslint-disable-next-line no-console
        console.log('[ConfirmationDialog] confirmation$ subscription triggered', {
          config,
          isVisible: config !== null
        });
        this.config = config;
        this.isVisible = config !== null;
        // eslint-disable-next-line no-console
        console.log('[ConfirmationDialog] Dialog visibility updated:', this.isVisible);
      })
    );

    // Handle escape key
    this._subscription.add(
      this._confirmationService.confirmation$.subscribe(() => {
        const handleEscape = (event: KeyboardEvent): void => {
          if (event.key === 'Escape' && this.isVisible) {
            this.onCancel();
          }
        };

        if (this.isVisible) {
          document.addEventListener('keydown', handleEscape);
        } else {
          document.removeEventListener('keydown', handleEscape);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  public onConfirm(): void {
    // eslint-disable-next-line no-console
    console.log('[ConfirmationDialog] onConfirm() called - confirm button clicked');
    this._confirmationService.confirmDialog();
  }

  public onCancel(): void {
    // eslint-disable-next-line no-console
    console.log('[ConfirmationDialog] onCancel() called - cancel button clicked');
    this._confirmationService.cancelDialog();
  }

  public onOverlayClick(): void {
    // eslint-disable-next-line no-console
    console.log('[ConfirmationDialog] onOverlayClick() called - overlay clicked');
    this.onCancel();
  }

  public getDialogContainerClasses(): string {
    switch (this.config?.type) {
      case 'danger':
        return 'border-t-red-600';
      case 'warning':
        return 'border-t-yellow-600';
      case 'info':
      default:
        return 'border-t-[#041643]';
    }
  }

  public getConfirmButtonClasses(): string {
    switch (this.config?.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info':
      default:
        return 'bg-[#041643] hover:bg-[#0a245e] focus:ring-[#041643]';
    }
  }
}
