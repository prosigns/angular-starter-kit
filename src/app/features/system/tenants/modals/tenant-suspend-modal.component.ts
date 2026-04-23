import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ITenant } from '../tenant.types';
import { TenantStoreService } from '../tenant-store.service';
import { ModalShellComponent } from './modal-shell.component';

@Component({
  selector: 'app-tenant-suspend-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Suspend Tenant"
      subtitle="Immediately blocks all users from accessing the platform"
      tone="danger"
      width="540px"
      (close)="close.emit()"
    >
      <p class="ts-warn">
        Suspending will immediately block all <strong>{{ tenant().users }} users</strong> from accessing the platform.
        Data is preserved and can be restored on reactivation.
      </p>

      <dl class="ts-impact">
        <div><dt>Tenant</dt><dd>{{ tenant().name }}</dd></div>
        <div><dt>Active Users</dt><dd>{{ tenant().users }}</dd></div>
        <div><dt>Enrolled Clients</dt><dd>{{ tenant().clients }}</dd></div>
        <div><dt>Active Programs</dt><dd>{{ tenant().programs }}</dd></div>
      </dl>

      <fieldset class="ts-field">
        <legend>Suspension type <em>*</em></legend>
        <label class="ts-radio">
          <input type="radio" name="type" value="Temporary" [(ngModel)]="type" />
          <span>Temporary (reinstate on date)</span>
        </label>
        <label class="ts-radio">
          <input type="radio" name="type" value="Indefinite" [(ngModel)]="type" />
          <span>Indefinite</span>
        </label>
      </fieldset>

      @if (type === 'Temporary') {
        <label class="ts-field">
          <span>Reinstatement date <em>*</em></span>
          <input type="date" [(ngModel)]="reinstateDate" [min]="minDate" />
        </label>
      }

      <label class="ts-field">
        <span>Reason <em>*</em></span>
        <select [(ngModel)]="reason">
          <option value="">Select a reason…</option>
          <option>Non-Payment</option>
          <option>Contract Violation</option>
          <option>Security Concern</option>
          <option>State Request</option>
          <option>Investigation</option>
          <option>Other</option>
        </select>
      </label>

      <label class="ts-field">
        <span>Detailed reason <em>*</em></span>
        <textarea rows="3" [(ngModel)]="details" placeholder="Provide context for the audit log…"></textarea>
      </label>

      <label class="ts-field ts-field--toggle">
        <input type="checkbox" [(ngModel)]="notify" />
        <span>Notify tenant admin via email</span>
      </label>

      <label class="ts-field">
        <span>Confirm by typing tenant slug <code>{{ tenant().slug }}</code></span>
        <input type="text" [(ngModel)]="confirmSlug" />
      </label>

      <ng-container slot="footer">
        <button type="button" class="ts-btn ts-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="ts-btn ts-btn--danger" (click)="submit()" [disabled]="!canSubmitNow()">Suspend Tenant</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .ts-warn { margin: 0 0 1rem; padding: 0.75rem 0.875rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.8125rem; }
      .ts-impact { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem 0.875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .ts-impact div { display: flex; flex-direction: column; }
      .ts-impact dt { margin: 0; font-size: 0.6875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      .ts-impact dd { margin: 0.125rem 0 0; font-size: 0.875rem; font-weight: 600; color: #0f172a; }
      .ts-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; border: 0; padding: 0; }
      .ts-field > legend { padding: 0; font-size: 0.75rem; color: #475569; margin-bottom: 0.375rem; }
      .ts-field > span > em, .ts-field > legend > em { color: #dc2626; font-style: normal; }
      .ts-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; }
      .ts-field input[type="text"], .ts-field input[type="date"], .ts-field select, .ts-field textarea {
        padding: 0.5rem 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.8125rem;
        color: #0f172a;
        outline: none;
        font-family: inherit;
      }
      .ts-field input:focus, .ts-field select:focus, .ts-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .ts-radio { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; font-size: 0.8125rem; color: #0f172a; cursor: pointer; }
      .ts-field code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f1f5f9; padding: 0.05rem 0.3rem; border-radius: 3px; font-size: 0.75rem; }
      .ts-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .ts-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .ts-btn--danger { background: #dc2626; color: white; border-color: #dc2626; }
      .ts-btn--danger:hover:not(:disabled) { background: #b91c1c; }
      .ts-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class TenantSuspendModalComponent {
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly tenant = input.required<ITenant>();
  @Output() public close = new EventEmitter<void>();

  public type: 'Temporary' | 'Indefinite' = 'Temporary';
  public reinstateDate = '';
  public reason = '';
  public details = '';
  public notify = true;
  public confirmSlug = '';

  public readonly minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  public canSubmitNow(): boolean {
    return (
      !!this.reason &&
      !!this.details.trim() &&
      this.confirmSlug === this.tenant().slug &&
      (this.type === 'Indefinite' || !!this.reinstateDate)
    );
  }

  public submit(): void {
    if (!this.canSubmitNow()) return;
    const t = this.tenant();
    const fullReason = this.details + (this.reason ? ` (${this.reason})` : '');
    this.store.suspend(t.id, fullReason, this.type, this.reinstateDate || undefined);
    this.toast.showSuccess(`${t.name} suspended.`);
    this.close.emit();
  }
}
