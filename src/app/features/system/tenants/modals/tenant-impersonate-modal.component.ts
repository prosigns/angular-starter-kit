import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ITenant } from '../tenant.types';
import { TenantStoreService } from '../tenant-store.service';
import { ModalShellComponent } from './modal-shell.component';

@Component({
  selector: 'app-tenant-impersonate-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Impersonate Tenant Admin"
      subtitle="Temporarily view the platform as this tenant"
      tone="warn"
      width="480px"
      (close)="close.emit()"
    >
      <p class="ti-warn">
        You will view the platform as if you are the Tenant Administrator. <strong>All actions will be logged under your identity</strong> with an impersonation flag.
      </p>

      <dl class="ti-summary">
        <div><dt>Tenant</dt><dd>{{ tenant().name }}</dd></div>
        <div><dt>Tenant Admin</dt><dd>{{ tenant().contactName }}<br><span class="ti-muted">{{ tenant().contactEmail }}</span></dd></div>
      </dl>

      <label class="ti-field">
        <span>Session duration</span>
        <select [(ngModel)]="duration">
          <option [ngValue]="15">15 minutes</option>
          <option [ngValue]="30">30 minutes</option>
          <option [ngValue]="60">1 hour</option>
          <option [ngValue]="120">2 hours</option>
        </select>
      </label>

      <label class="ti-field">
        <span>Reason <em>*</em></span>
        <select [(ngModel)]="reasonCode">
          <option value="">Select a reason…</option>
          <option>Support Request</option>
          <option>Configuration Review</option>
          <option>Troubleshooting</option>
          <option>Training</option>
          <option>Audit</option>
          <option>Other</option>
        </select>
      </label>

      <label class="ti-field">
        <span>Detailed reason <em>*</em></span>
        <textarea rows="3" [(ngModel)]="reasonDetail" placeholder="Required for audit log…"></textarea>
      </label>

      <label class="ti-field ti-field--toggle">
        <input type="checkbox" [(ngModel)]="acknowledged" />
        <span>I understand all actions are logged and attributed to my account</span>
      </label>

      <ng-container slot="footer">
        <button type="button" class="ti-btn ti-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="ti-btn ti-btn--warn" (click)="submit()" [disabled]="!canSubmit()">Start Impersonation</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .ti-warn { margin: 0 0 1rem; padding: 0.75rem 0.875rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-size: 0.8125rem; line-height: 1.5; }
      .ti-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; padding: 0.75rem 0.875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .ti-summary div { display: flex; flex-direction: column; }
      .ti-summary dt { font-size: 0.625rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .ti-summary dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .ti-muted { font-size: 0.75rem; color: #64748b; font-weight: 400; }

      .ti-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .ti-field--toggle { flex-direction: row; align-items: flex-start; gap: 0.5rem; }
      .ti-field > span > em { color: #dc2626; font-style: normal; }
      .ti-field select, .ti-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #0f172a; outline: none; font-family: inherit; }
      .ti-field select:focus, .ti-field textarea:focus { border-color: #d97706; box-shadow: 0 0 0 3px #fef3c7; }

      .ti-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .ti-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .ti-btn--warn { background: #d97706; color: white; border-color: #d97706; }
      .ti-btn--warn:hover:not(:disabled) { background: #b45309; }
      .ti-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class TenantImpersonateModalComponent {
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly tenant = input.required<ITenant>();
  @Output() public close = new EventEmitter<void>();

  public duration = 30;
  public reasonCode = '';
  public reasonDetail = '';
  public acknowledged = false;

  public canSubmit(): boolean {
    return !!this.reasonCode && !!this.reasonDetail.trim() && this.acknowledged;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const t = this.tenant();
    this.store.startImpersonation(t.id, this.duration, `${this.reasonCode}: ${this.reasonDetail}`);
    this.toast.showWarning(`Now impersonating ${t.name} for ${this.duration} minutes.`);
    this.close.emit();
  }
}
