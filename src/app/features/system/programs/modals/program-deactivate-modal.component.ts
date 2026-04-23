import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IProgram } from '../program.types';

@Component({
  selector: 'app-program-deactivate-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Deactivate Program"
      subtitle="Permanent — program cannot be reactivated"
      tone="danger"
      width="560px"
      (close)="close.emit()"
    >
      <p class="pd-warn">
        <strong>This is permanent.</strong> Deactivation ends all staff assignments, hides the program
        from active lists, and preserves data per the 7-year retention policy. Use <em>Suspend</em> instead
        if you plan to reopen the program.
      </p>

      @if (program().currentEnrollment > 0) {
        <div class="pd-block">
          <strong>Cannot deactivate:</strong> {{ program().currentEnrollment }} client{{ program().currentEnrollment === 1 ? ' is' : 's are' }} still enrolled.
          Discharge or transfer all clients before deactivation.
        </div>
      }

      <dl class="pd-impact">
        <div><dt>Enrolled</dt><dd>{{ program().currentEnrollment }}</dd></div>
        <div><dt>Staff</dt><dd>{{ program().staff.length }}</dd></div>
        <div><dt>Created</dt><dd>{{ program().createdAt }}</dd></div>
      </dl>

      <label class="pd-field">
        <span>Reason <em>*</em></span>
        <select [(ngModel)]="reason">
          <option value="">Select a reason…</option>
          <option>Program Ended</option>
          <option>Funding Ended</option>
          <option>Consolidated Into Another Program</option>
          <option>Regulatory Requirement</option>
          <option>Replaced By New Program</option>
          <option>Other</option>
        </select>
      </label>

      <label class="pd-field">
        <span>Details <em>*</em></span>
        <textarea rows="3" [(ngModel)]="details" placeholder="Reason detail for permanent audit record…"></textarea>
      </label>

      <label class="pd-field pd-field--toggle">
        <input type="checkbox" [(ngModel)]="finalReport" />
        <span>Generate final program summary report (recommended)</span>
      </label>

      <label class="pd-field">
        <span>Confirm by typing program code <code>{{ program().code }}</code></span>
        <input type="text" [(ngModel)]="confirmCode" />
      </label>

      <ng-container slot="footer">
        <button type="button" class="pd-btn pd-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="pd-btn pd-btn--danger" (click)="submit()" [disabled]="!canSubmit()">Deactivate Permanently</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .pd-warn { margin: 0 0 1rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.8125rem; }
      .pd-warn em { font-style: italic; font-weight: 600; }
      .pd-block { margin: 0 0 1rem; padding: 0.75rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-size: 0.8125rem; }
      .pd-impact { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .pd-impact div { display: flex; flex-direction: column; }
      .pd-impact dt { margin: 0; font-size: 0.6875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      .pd-impact dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .pd-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .pd-field > span > em { color: #dc2626; font-style: normal; }
      .pd-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
      .pd-field input[type="text"], .pd-field select, .pd-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .pd-field input:focus, .pd-field select:focus, .pd-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .pd-field code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f1f5f9; padding: 0.05rem 0.3rem; border-radius: 3px; font-size: 0.75rem; }
      .pd-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .pd-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pd-btn--danger { background: #dc2626; color: white; border-color: #dc2626; }
      .pd-btn--danger:hover:not(:disabled) { background: #b91c1c; }
      .pd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramDeactivateModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  @Output() public close = new EventEmitter<void>();

  public reason = '';
  public details = '';
  public finalReport = true;
  public confirmCode = '';

  public canSubmit(): boolean {
    return (
      this.program().currentEnrollment === 0 &&
      !!this.reason &&
      !!this.details.trim() &&
      this.confirmCode === this.program().code
    );
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const p = this.program();
    const full = `${this.details} (${this.reason}) — finalReport=${this.finalReport}`;
    this.store.deactivate(p.id, full);
    this.toast.showSuccess(`${p.name} deactivated.`);
    this.close.emit();
  }
}
