import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ITenant } from '../tenant.types';
import { TenantStoreService } from '../tenant-store.service';
import { ModalShellComponent } from './modal-shell.component';

@Component({
  selector: 'app-tenant-deactivate-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Deactivate Tenant"
      subtitle="Permanent disable — users lose access, billing stops"
      tone="danger"
      width="560px"
      (close)="close.emit()"
    >
      <p class="td-warn">
        <strong>CRITICAL:</strong> Deactivation permanently disables this tenant. Users lose access immediately and billing stops.
        Data is retained for <strong>90 days</strong>, then permanently purged per retention policy.
      </p>

      <dl class="td-impact">
        <div><dt>Tenant</dt><dd class="td-impact__name">{{ tenant().name }}</dd></div>
        <div><dt>Users Affected</dt><dd>{{ tenant().users }}</dd></div>
        <div><dt>Enrolled Clients</dt><dd>{{ tenant().clients }}</dd></div>
        <div><dt>Active Programs</dt><dd>{{ tenant().programs }}</dd></div>
      </dl>

      <label class="td-field">
        <span>Reason <em>*</em></span>
        <select [(ngModel)]="reasonCode">
          <option value="">Select a reason…</option>
          <option>Contract Ended</option>
          <option>Contract Cancelled</option>
          <option>Non-Payment</option>
          <option>Compliance Violation</option>
          <option>Customer Request</option>
          <option>Other</option>
        </select>
      </label>

      <label class="td-field">
        <span>Detailed reason <em>*</em></span>
        <textarea rows="3" [(ngModel)]="reasonDetail" placeholder="Required for audit log…"></textarea>
      </label>

      <fieldset class="td-checklist">
        <legend>Exit checklist — all required</legend>
        <label><input type="checkbox" [(ngModel)]="chk1" /> Tenant admin has been notified</label>
        <label><input type="checkbox" [(ngModel)]="chk2" /> Data export has been offered or completed</label>
        <label><input type="checkbox" [(ngModel)]="chk3" /> Outstanding invoices have been addressed</label>
        <label><input type="checkbox" [(ngModel)]="chk4" /> All active programs have been reviewed</label>
        <label><input type="checkbox" [(ngModel)]="chk5" /> I understand this deactivates all users</label>
      </fieldset>

      <label class="td-field">
        <span>Type <code>DEACTIVATE {{ tenant().slug }}</code> to confirm</span>
        <input type="text" [(ngModel)]="confirmText" />
      </label>

      <ng-container slot="footer">
        <button type="button" class="td-btn td-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="td-btn td-btn--danger" (click)="submit()" [disabled]="!canSubmit()">Deactivate Tenant</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .td-warn { margin: 0 0 1rem; padding: 0.75rem 0.875rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.8125rem; line-height: 1.5; }
      .td-impact { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem 0.875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .td-impact div { display: flex; flex-direction: column; }
      .td-impact dt { font-size: 0.625rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .td-impact dd { margin: 0.125rem 0 0; font-size: 0.875rem; font-weight: 600; color: #0f172a; }
      .td-impact__name { color: #dc2626 !important; }

      .td-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .td-field > span > em { color: #dc2626; font-style: normal; }
      .td-field code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f1f5f9; padding: 0.05rem 0.3rem; border-radius: 3px; font-size: 0.75rem; color: #dc2626; }
      .td-field select, .td-field textarea, .td-field input { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #0f172a; outline: none; font-family: inherit; }
      .td-field select:focus, .td-field textarea:focus, .td-field input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px #fee2e2; }

      .td-checklist { border: 1px solid #fecaca; border-radius: 8px; padding: 0.625rem 0.875rem; margin: 0 0 0.875rem; background: #fef2f2; }
      .td-checklist legend { padding: 0 0.375rem; font-size: 0.75rem; color: #991b1b; font-weight: 600; }
      .td-checklist label { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; font-size: 0.8125rem; color: #0f172a; cursor: pointer; }

      .td-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .td-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .td-btn--danger { background: #dc2626; color: white; border-color: #dc2626; }
      .td-btn--danger:hover:not(:disabled) { background: #b91c1c; }
      .td-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    `
  ]
})
export class TenantDeactivateModalComponent {
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly tenant = input.required<ITenant>();
  @Output() public close = new EventEmitter<void>();

  public reasonCode = '';
  public reasonDetail = '';
  public chk1 = false;
  public chk2 = false;
  public chk3 = false;
  public chk4 = false;
  public chk5 = false;
  public confirmText = '';

  public canSubmit(): boolean {
    return (
      !!this.reasonCode &&
      !!this.reasonDetail.trim() &&
      this.chk1 && this.chk2 && this.chk3 && this.chk4 && this.chk5 &&
      this.confirmText.trim() === `DEACTIVATE ${this.tenant().slug}`
    );
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const t = this.tenant();
    this.store.deactivate(t.id, `${this.reasonCode}: ${this.reasonDetail}`);
    this.toast.showSuccess(`${t.name} deactivated.`);
    this.close.emit();
  }
}
