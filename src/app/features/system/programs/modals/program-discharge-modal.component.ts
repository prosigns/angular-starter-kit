import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IEnrollment, IProgram } from '../program.types';

@Component({
  selector: 'app-program-discharge-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Discharge Client"
      [subtitle]="'Ending enrollment for ' + enrollment().clientName"
      tone="warn"
      width="520px"
      (close)="close.emit()"
    >
      <dl class="pd-impact">
        <div><dt>Client</dt><dd>{{ enrollment().clientName }}</dd></div>
        <div><dt>Enrolled</dt><dd>{{ enrollment().enrolledAt }}</dd></div>
        <div><dt>Compliance</dt><dd>{{ enrollment().complianceRate }}%</dd></div>
        <div><dt>Check-In</dt><dd>{{ enrollment().checkInRate }}%</dd></div>
      </dl>

      <label class="pd-field">
        <span>Discharge type <em>*</em></span>
        <select [(ngModel)]="type">
          <option value="">Select discharge type…</option>
          <option>Successful Completion</option>
          <option>Transferred</option>
          <option>Administrative Discharge</option>
          <option>Non-Compliance</option>
          <option>Voluntary Withdrawal</option>
          <option>Incarcerated</option>
          <option>Deceased</option>
          <option>Other</option>
        </select>
      </label>

      <label class="pd-field">
        <span>Discharge summary <em>*</em></span>
        <textarea rows="3" [(ngModel)]="summary" placeholder="Required summary — 250 char min recommended…"></textarea>
      </label>

      <label class="pd-field pd-field--toggle">
        <input type="checkbox" [(ngModel)]="notifyClient" />
        <span>Send discharge notice to client (email)</span>
      </label>

      <ng-container slot="footer">
        <button type="button" class="pd-btn pd-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="pd-btn pd-btn--warn" (click)="submit()" [disabled]="!canSubmit()">Discharge Client</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .pd-impact { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .pd-impact div { display: flex; flex-direction: column; }
      .pd-impact dt { margin: 0; font-size: 0.6875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      .pd-impact dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .pd-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .pd-field > span > em { color: #dc2626; font-style: normal; }
      .pd-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
      .pd-field select, .pd-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .pd-field select:focus, .pd-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .pd-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .pd-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pd-btn--warn { background: #d97706; color: white; border-color: #d97706; }
      .pd-btn--warn:hover:not(:disabled) { background: #b45309; }
      .pd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramDischargeModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  public readonly enrollment = input.required<IEnrollment>();
  @Output() public close = new EventEmitter<void>();

  public type = '';
  public summary = '';
  public notifyClient = true;

  public canSubmit(): boolean {
    return !!this.type && !!this.summary.trim();
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const reason = `${this.type}: ${this.summary}`;
    this.store.dischargeClient(this.program().id, this.enrollment().id, reason);
    this.toast.showSuccess(`${this.enrollment().clientName} discharged.`);
    this.close.emit();
  }
}
