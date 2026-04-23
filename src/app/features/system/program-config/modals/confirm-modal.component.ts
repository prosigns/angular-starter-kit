import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ModalShellComponent],
  template: `
    <app-modal-shell
      [title]="title()"
      [subtitle]="subtitle()"
      [tone]="tone()"
      width="480px"
      (close)="close.emit()"
    >
      <p class="cfm-body">{{ body() }}</p>
      @if (detail()) { <p class="cfm-detail">{{ detail() }}</p> }

      <ng-container slot="footer">
        <button type="button" class="cfm-btn cfm-btn--ghost" (click)="close.emit()">{{ cancelLabel() }}</button>
        <button
          type="button"
          class="cfm-btn"
          [class.cfm-btn--primary]="tone() !== 'danger' && tone() !== 'warn'"
          [class.cfm-btn--warn]="tone() === 'warn'"
          [class.cfm-btn--danger]="tone() === 'danger'"
          (click)="confirm.emit(); close.emit()"
        >
          {{ confirmLabel() }}
        </button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .cfm-body { margin: 0 0 0.625rem; font-size: 0.875rem; color: #334155; line-height: 1.5; }
      .cfm-detail { margin: 0 0 0.25rem; padding: 0.625rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #64748b; }
      .cfm-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; font-family: inherit; }
      .cfm-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .cfm-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .cfm-btn--primary:hover { background: #1d4ed8; }
      .cfm-btn--warn { background: #d97706; color: white; border-color: #d97706; }
      .cfm-btn--warn:hover { background: #b45309; }
      .cfm-btn--danger { background: #dc2626; color: white; border-color: #dc2626; }
      .cfm-btn--danger:hover { background: #b91c1c; }
    `
  ]
})
export class ConfirmModalComponent {
  public readonly title = input<string>('Confirm');
  public readonly subtitle = input<string>('');
  public readonly body = input<string>('Are you sure?');
  public readonly detail = input<string>('');
  public readonly confirmLabel = input<string>('Confirm');
  public readonly cancelLabel = input<string>('Cancel');
  public readonly tone = input<'default' | 'warn' | 'danger'>('default');

  @Output() public close = new EventEmitter<void>();
  @Output() public confirm = new EventEmitter<void>();
}
