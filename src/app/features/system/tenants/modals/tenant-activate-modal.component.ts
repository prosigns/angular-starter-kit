import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ITenant } from '../tenant.types';
import { TenantStoreService } from '../tenant-store.service';
import { ModalShellComponent } from './modal-shell.component';

@Component({
  selector: 'app-tenant-activate-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Activate Tenant"
      subtitle="Grant access and begin billing"
      width="480px"
      (close)="close.emit()"
    >
      <dl class="ta-summary">
        <div><dt>Tenant</dt><dd>{{ tenant().name }}</dd></div>
        <div><dt>Current Status</dt><dd><span class="ta-status" [class]="'ta-status--' + tenant().status.toLowerCase()">{{ tenant().status }}</span></dd></div>
        <div><dt>Tier</dt><dd>{{ tenant().tier }}</dd></div>
      </dl>

      <h4 class="ta-title">Pre-activation checklist</h4>
      <ul class="ta-check">
        @for (c of checks(); track c.label) {
          <li [class.ta-check__item--warn]="c.warn">
            <span class="ta-check__icon" [class.ta-check__icon--ok]="!c.warn">
              @if (c.warn) {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" /></svg>
              } @else {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              }
            </span>
            {{ c.label }}
          </li>
        }
      </ul>

      <label class="ta-field ta-field--toggle">
        <input type="checkbox" [(ngModel)]="sendWelcome" />
        <span>Send welcome email to {{ tenant().contactEmail }}</span>
      </label>

      <label class="ta-field">
        <span>Notes (optional)</span>
        <textarea rows="2" [(ngModel)]="notes" placeholder="Context for the audit log…"></textarea>
      </label>

      <ng-container slot="footer">
        <button type="button" class="ta-btn ta-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="ta-btn ta-btn--primary" (click)="submit()">Activate Tenant</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .ta-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem 0.875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .ta-summary div { display: flex; flex-direction: column; }
      .ta-summary dt { margin: 0; font-size: 0.625rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .ta-summary dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .ta-status { display: inline-flex; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.625rem; font-weight: 700; }
      .ta-status--pendingactivation { background: #fef3c7; color: #92400e; }
      .ta-status--suspended { background: #fee2e2; color: #991b1b; }

      .ta-title { margin: 0 0 0.5rem; font-size: 0.8125rem; font-weight: 700; color: #0f172a; }
      .ta-check { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.375rem; }
      .ta-check li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #334155; }
      .ta-check__item--warn { color: #92400e; }
      .ta-check__icon { width: 18px; height: 18px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: #fef3c7; color: #92400e; flex: 0 0 auto; }
      .ta-check__icon--ok { background: #dcfce7; color: #166534; }

      .ta-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .ta-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; }
      .ta-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #0f172a; outline: none; font-family: inherit; }
      .ta-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }

      .ta-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .ta-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .ta-btn--primary { background: #059669; color: white; border-color: #059669; }
      .ta-btn--primary:hover { background: #047857; }
    `
  ]
})
export class TenantActivateModalComponent {
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly tenant = input.required<ITenant>();
  @Output() public close = new EventEmitter<void>();

  public sendWelcome = true;
  public notes = '';

  public readonly checks = computed(() => {
    const t = this.tenant();
    return [
      { label: 'Subscription tier configured', warn: false },
      { label: 'Primary contact verified', warn: !t.contactEmail },
      { label: 'At least one program configured', warn: t.programs === 0 },
      { label: 'Branding configured (optional)', warn: true }
    ];
  });

  public submit(): void {
    const t = this.tenant();
    this.store.activate(t.id, this.notes || undefined);
    this.toast.showSuccess(`${t.name} activated.`);
    this.close.emit();
  }
}
