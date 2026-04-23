import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IProgram } from '../program.types';

@Component({
  selector: 'app-program-suspend-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Suspend Program"
      subtitle="Pauses all program activity for enrolled clients"
      tone="danger"
      width="540px"
      (close)="close.emit()"
    >
      <p class="ps-warn">
        Suspending will pause all activity for <strong>{{ program().currentEnrollment }} enrolled client{{ program().currentEnrollment === 1 ? '' : 's' }}</strong>
        — no new enrollments, check-ins, or appointments. Data is preserved.
      </p>

      <dl class="ps-impact">
        <div><dt>Program</dt><dd>{{ program().name }}</dd></div>
        <div><dt>Enrolled</dt><dd>{{ program().currentEnrollment }}</dd></div>
        <div><dt>Staff</dt><dd>{{ program().staff.length }}</dd></div>
        <div><dt>Status</dt><dd>{{ program().status }}</dd></div>
      </dl>

      <label class="ps-field">
        <span>Reason <em>*</em></span>
        <select [(ngModel)]="reason">
          <option value="">Select a reason…</option>
          <option>Compliance Review</option>
          <option>Staffing Shortage</option>
          <option>Funding Gap</option>
          <option>Investigation</option>
          <option>Regulatory Request</option>
          <option>Operational Pause</option>
          <option>Other</option>
        </select>
      </label>

      <label class="ps-field">
        <span>Details <em>*</em></span>
        <textarea rows="3" [(ngModel)]="details" placeholder="Context for the audit log and staff notification…"></textarea>
      </label>

      <label class="ps-field ps-field--toggle">
        <input type="checkbox" [(ngModel)]="notifyClients" />
        <span>Notify enrolled clients via SMS + Email</span>
      </label>
      <label class="ps-field ps-field--toggle">
        <input type="checkbox" [(ngModel)]="notifyStaff" />
        <span>Notify assigned staff via Email + In-App</span>
      </label>

      <label class="ps-field">
        <span>Confirm by typing program code <code>{{ program().code }}</code></span>
        <input type="text" [(ngModel)]="confirmCode" />
      </label>

      <ng-container slot="footer">
        <button type="button" class="ps-btn ps-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="ps-btn ps-btn--danger" (click)="submit()" [disabled]="!canSubmit()">Suspend Program</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .ps-warn { margin: 0 0 1rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.8125rem; }
      .ps-impact { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .ps-impact div { display: flex; flex-direction: column; }
      .ps-impact dt { margin: 0; font-size: 0.6875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      .ps-impact dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .ps-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .ps-field > span > em { color: #dc2626; font-style: normal; }
      .ps-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
      .ps-field input[type="text"], .ps-field select, .ps-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .ps-field input:focus, .ps-field select:focus, .ps-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .ps-field code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f1f5f9; padding: 0.05rem 0.3rem; border-radius: 3px; font-size: 0.75rem; }
      .ps-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .ps-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .ps-btn--danger { background: #dc2626; color: white; border-color: #dc2626; }
      .ps-btn--danger:hover:not(:disabled) { background: #b91c1c; }
      .ps-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramSuspendModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  @Output() public close = new EventEmitter<void>();

  public reason = '';
  public details = '';
  public notifyClients = true;
  public notifyStaff = true;
  public confirmCode = '';

  public canSubmit(): boolean {
    return !!this.reason && !!this.details.trim() && this.confirmCode === this.program().code;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const p = this.program();
    const full = `${this.details} (${this.reason})`;
    this.store.suspend(p.id, full, this.notifyClients, this.notifyStaff);
    this.toast.showSuccess(`${p.name} suspended.`);
    this.close.emit();
  }
}
