import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IToast, ToastService, ToastTypeEnum } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toasts().length) {
      <div
        class="ct-toast-container"
        role="region"
        aria-label="Notifications"
      >
        @for (toast of toasts(); track toast.id) {
          <div
            class="ct-toast ct-toast--{{ toast.type }}"
            [attr.role]="ariaRole(toast)"
            [attr.aria-live]="ariaLive(toast)"
            aria-atomic="true"
            (mouseenter)="onHoverStart(toast.id)"
            (mouseleave)="onHoverEnd(toast.id)"
            (focusin)="onHoverStart(toast.id)"
            (focusout)="onHoverEnd(toast.id)"
          >
            <span class="ct-toast__accent" aria-hidden="true"></span>

            <span class="ct-toast__icon" aria-hidden="true">
              @switch (toast.type) {
                @case (TYPES.SUCCESS) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
                @case (TYPES.ERROR) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" stroke-width="2" />
                    <path
                      stroke-linecap="round"
                      stroke-width="2"
                      d="M12 8v4M12 16h.01"
                    />
                  </svg>
                }
                @case (TYPES.WARNING) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                }
                @case (TYPES.INFO) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" stroke-width="2" />
                    <path
                      stroke-linecap="round"
                      stroke-width="2"
                      d="M12 8h.01M11 12h1v4h1"
                    />
                  </svg>
                }
              }
            </span>

            <div class="ct-toast__body">
              @if (toast.title) {
                <p class="ct-toast__title">{{ toast.title }}</p>
              }
              <p class="ct-toast__message">{{ toast.message }}</p>
              @if (toast.action) {
                <button
                  type="button"
                  class="ct-toast__action"
                  (click)="runAction(toast)"
                >
                  {{ toast.action.label }}
                </button>
              }
            </div>

            @if (toast.dismissible) {
              <button
                type="button"
                class="ct-toast__close"
                aria-label="Dismiss notification"
                (click)="dismiss(toast.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            }

            <span
              class="ct-toast__progress"
              [style.animation-duration.ms]="toast.duration"
              [attr.data-paused]="pausedIds.has(toast.id) ? 'true' : null"
              aria-hidden="true"
            ></span>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .ct-toast-container {
        position: fixed;
        bottom: 1.25rem;
        right: 1rem;
        z-index: 100;
        display: flex;
        flex-direction: column-reverse;
        align-items: flex-end;
        gap: 0.5rem;
        max-width: 380px;
        width: calc(100% - 2rem);
        pointer-events: none;
      }

      .ct-toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.875rem 0.875rem 0.875rem 1rem;
        background: #ffffff;
        border: 1px solid var(--ct-border, #e5e7eb);
        border-radius: 8px;
        box-shadow:
          0 10px 15px -3px rgba(15, 23, 42, 0.08),
          0 4px 6px -4px rgba(15, 23, 42, 0.06);
        pointer-events: auto;
        overflow: hidden;
        animation: ct-toast-in 220ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes ct-toast-in {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }

      .ct-toast__accent {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
      }

      .ct-toast__icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ct-toast__icon svg {
        width: 100%;
        height: 100%;
      }

      .ct-toast__body {
        flex: 1;
        min-width: 0;
      }

      .ct-toast__title {
        margin: 0;
        font-size: 0.8125rem;
        font-weight: 600;
        line-height: 1.25;
        color: var(--text-primary, #0f172a);
      }

      .ct-toast__message {
        margin: 0.125rem 0 0;
        font-size: 0.8125rem;
        line-height: 1.4;
        color: var(--text-secondary, #475569);
        word-break: break-word;
      }

      .ct-toast__action {
        margin-top: 0.5rem;
        padding: 0;
        background: transparent;
        border: 0;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        color: var(--primary, #2563eb);
      }
      .ct-toast__action:hover {
        text-decoration: underline;
      }
      .ct-toast__action:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
        border-radius: 2px;
      }

      .ct-toast__close {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        padding: 0;
        background: transparent;
        border: 0;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: color 150ms ease, background-color 150ms ease;
      }
      .ct-toast__close:hover {
        color: var(--text-primary, #0f172a);
        background: rgba(15, 23, 42, 0.06);
      }
      .ct-toast__close:focus-visible {
        outline: 2px solid var(--primary, #2563eb);
        outline-offset: 1px;
      }
      .ct-toast__close svg {
        width: 14px;
        height: 14px;
      }

      .ct-toast__progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        width: 100%;
        transform-origin: left center;
        animation-name: ct-toast-progress;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
      }
      .ct-toast__progress[data-paused='true'] {
        animation-play-state: paused;
      }

      @keyframes ct-toast-progress {
        from {
          transform: scaleX(1);
        }
        to {
          transform: scaleX(0);
        }
      }

      /* Variant accents + icon colors + progress colors (corporate tokens) */
      .ct-toast--success .ct-toast__accent { background: #059669; }
      .ct-toast--success .ct-toast__icon   { color:      #059669; }
      .ct-toast--success .ct-toast__progress { background: #059669; }

      .ct-toast--error   .ct-toast__accent { background: #dc2626; }
      .ct-toast--error   .ct-toast__icon   { color:      #dc2626; }
      .ct-toast--error   .ct-toast__progress { background: #dc2626; }

      .ct-toast--warning .ct-toast__accent { background: #d97706; }
      .ct-toast--warning .ct-toast__icon   { color:      #d97706; }
      .ct-toast--warning .ct-toast__progress { background: #d97706; }

      .ct-toast--info    .ct-toast__accent { background: #2563eb; }
      .ct-toast--info    .ct-toast__icon   { color:      #2563eb; }
      .ct-toast--info    .ct-toast__progress { background: #2563eb; }

      @media (prefers-reduced-motion: reduce) {
        .ct-toast,
        .ct-toast__progress {
          animation: none;
        }
      }
    `
  ]
})
export class ToastComponent {
  public readonly TYPES = ToastTypeEnum;
  public readonly pausedIds = new Set<string>();

  private readonly toastService = inject(ToastService);

  public readonly toasts = computed<IToast[]>(() => this.toastService.toasts());

  public dismiss(id: string): void {
    this.toastService.removeToast(id);
    this.pausedIds.delete(id);
  }

  public runAction(toast: IToast): void {
    toast.action?.handler();
    this.dismiss(toast.id);
  }

  public onHoverStart(id: string): void {
    this.pausedIds.add(id);
    this.toastService.pause(id);
  }

  public onHoverEnd(id: string): void {
    this.pausedIds.delete(id);
    this.toastService.resume(id);
  }

  public ariaRole(toast: IToast): 'alert' | 'status' {
    return toast.type === ToastTypeEnum.ERROR || toast.type === ToastTypeEnum.WARNING
      ? 'alert'
      : 'status';
  }

  public ariaLive(toast: IToast): 'assertive' | 'polite' {
    return toast.type === ToastTypeEnum.ERROR ? 'assertive' : 'polite';
  }
}
