import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-slide-over',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/30 z-modal-backdrop transition-opacity"
        (click)="closePanel.emit()"
      ></div>

      <!-- Panel -->
      <div
        [class]="
          'fixed top-0 right-0 h-full z-modal bg-white ' +
          'border-l border-ct-border shadow-lg ' +
          'flex flex-col slide-over-panel ' +
          (size() === 'lg' ? 'w-slide-over-lg' : 'w-slide-over')
        "
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'slide-over-title'"
      >
        <!-- Header — 48px -->
        <div
          class="flex items-center justify-between px-4 border-b border-ct-border"
          style="height: var(--header-height); min-height: var(--header-height)"
        >
          <h2
            id="slide-over-title"
            class="text-card-title font-semibold"
            style="color: var(--text-primary); text-transform: none; letter-spacing: normal"
          >
            {{ title() }}
          </h2>
          <button (click)="closePanel.emit()" class="btn-icon" aria-label="Close panel">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="stroke-width: 1.5; color: var(--text-muted)"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <ng-content></ng-content>
        </div>

        <!-- Footer — sticky -->
        <div
          class="flex items-center justify-end gap-3 px-4 border-t border-ct-border"
          style="height: 56px; min-height: 56px"
        >
          <ng-content select="[slideOverFooter]"></ng-content>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .slide-over-panel {
        animation: slideInRight 0.25s ease-out;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .slide-over-panel {
          animation: none;
        }
      }
    `
  ]
})
export class SlideOverComponent {
  public readonly isOpen = input<boolean>(false);
  public readonly title = input<string>('');
  public readonly size = input<'default' | 'lg'>('default');
  public readonly closePanel = output<void>();
}
