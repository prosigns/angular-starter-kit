import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ITenant } from '../tenant.types';
import { TenantStoreService } from '../tenant-store.service';
import { ModalShellComponent } from './modal-shell.component';

@Component({
  selector: 'app-tenant-delete-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Delete Tenant"
      subtitle="Archives the tenant — data retained per policy"
      tone="danger"
      width="460px"
      (close)="close.emit()"
    >
      <p class="tdel-warn">
        Archives <strong>{{ tenant().name }}</strong>. Record is soft-deleted and retained per HIPAA retention.
        This cannot be undone from the UI.
      </p>

      @if (canDeleteAllowed()) {
        <label class="tdel-field">
          <span>Reason <em>*</em></span>
          <textarea rows="3" [(ngModel)]="reason" placeholder="Required for audit log…"></textarea>
        </label>
        <label class="tdel-field">
          <span>Type tenant slug <code>{{ tenant().slug }}</code> to confirm</span>
          <input type="text" [(ngModel)]="confirmSlug" />
        </label>
      } @else {
        <p class="tdel-block">
          Only tenants in <strong>Pending Activation</strong> or <strong>Deactivated</strong> status can be deleted.
          Current status: <strong>{{ tenant().status }}</strong>.
        </p>
      }

      <ng-container slot="footer">
        <button type="button" class="tdel-btn tdel-btn--ghost" (click)="close.emit()">Cancel</button>
        <button
          type="button"
          class="tdel-btn tdel-btn--danger"
          (click)="submit()"
          [disabled]="!canSubmit()"
        >Delete Tenant</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .tdel-warn { margin: 0 0 1rem; padding: 0.75rem 0.875rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.8125rem; line-height: 1.5; }
      .tdel-block { padding: 0.75rem 0.875rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #475569; font-size: 0.8125rem; }
      .tdel-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .tdel-field > span > em { color: #dc2626; font-style: normal; }
      .tdel-field code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f1f5f9; padding: 0.05rem 0.3rem; border-radius: 3px; color: #dc2626; font-size: 0.75rem; }
      .tdel-field input, .tdel-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #0f172a; outline: none; font-family: inherit; }
      .tdel-field input:focus, .tdel-field textarea:focus { border-color: #dc2626; box-shadow: 0 0 0 3px #fee2e2; }
      .tdel-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .tdel-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .tdel-btn--danger { background: #dc2626; color: white; border-color: #dc2626; }
      .tdel-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    `
  ]
})
export class TenantDeleteModalComponent {
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly tenant = input.required<ITenant>();
  @Output() public close = new EventEmitter<void>();

  public reason = '';
  public confirmSlug = '';

  public canDeleteAllowed(): boolean {
    const s = this.tenant().status;
    return s === 'PendingActivation' || s === 'Deactivated';
  }

  public canSubmit(): boolean {
    return this.canDeleteAllowed() && !!this.reason.trim() && this.confirmSlug === this.tenant().slug;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const t = this.tenant();
    this.store.softDelete(t.id, this.reason);
    this.toast.showSuccess(`${t.name} archived.`);
    this.close.emit();
  }
}
