import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, input } from '@angular/core';

@Component({
  selector: 'app-modal-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ms__backdrop" (click)="close.emit()" aria-hidden="true"></div>
    <div
      class="ms__panel"
      [class.ms__panel--slide]="variant() === 'slide-over'"
      [class.ms__panel--center]="variant() === 'center'"
      [style.--ms-width]="width()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()"
      (click)="$event.stopPropagation()"
    >
      <header class="ms__header" [class.ms__header--danger]="tone() === 'danger'" [class.ms__header--warn]="tone() === 'warn'">
        <div>
          <h2 class="ms__title">{{ title() }}</h2>
          @if (subtitle()) { <p class="ms__subtitle">{{ subtitle() }}</p> }
        </div>
        <button type="button" class="ms__close" aria-label="Close" (click)="close.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      <div class="ms__body">
        <ng-content />
      </div>
      <footer class="ms__footer">
        <ng-content select="[slot=footer]" />
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 60;
        display: block;
      }
      .ms__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(2px);
        animation: ms-fade 160ms ease-out;
      }
      .ms__panel {
        position: absolute;
        background: white;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
        display: flex;
        flex-direction: column;
      }
      .ms__panel--slide {
        top: 0;
        right: 0;
        bottom: 0;
        width: var(--ms-width, 640px);
        max-width: 100vw;
        animation: ms-slide 180ms ease-out;
      }
      .ms__panel--center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: var(--ms-width, 500px);
        max-width: calc(100vw - 2rem);
        max-height: calc(100vh - 2rem);
        border-radius: 12px;
        animation: ms-pop 160ms ease-out;
      }
      .ms__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e2e8f0;
      }
      .ms__header--danger { background: #fef2f2; border-bottom-color: #fecaca; }
      .ms__header--warn   { background: #fffbeb; border-bottom-color: #fde68a; }
      .ms__title { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
      .ms__subtitle { margin: 0.25rem 0 0; font-size: 0.8125rem; color: #64748b; }
      .ms__close {
        border: 0;
        background: transparent;
        padding: 0.375rem;
        border-radius: 6px;
        color: #64748b;
        cursor: pointer;
      }
      .ms__close:hover { background: #f1f5f9; color: #0f172a; }
      .ms__body {
        flex: 1;
        overflow-y: auto;
        padding: 1.125rem 1.25rem;
      }
      .ms__footer {
        padding: 0.875rem 1.25rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        background: #f8fafc;
      }
      @keyframes ms-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes ms-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes ms-pop { from { transform: translate(-50%, -50%) scale(0.95); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
    `
  ]
})
export class ModalShellComponent {
  public readonly title = input.required<string>();
  public readonly subtitle = input<string | undefined>(undefined);
  public readonly variant = input<'slide-over' | 'center'>('center');
  public readonly width = input<string>('500px');
  public readonly tone = input<'default' | 'warn' | 'danger'>('default');

  @Output() public close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  public onEsc(): void {
    this.close.emit();
  }
}
