import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IProgram } from '../program.types';

@Component({
  selector: 'app-program-enroll-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Enroll Client"
      [subtitle]="'Add client to ' + program().name"
      width="540px"
      (close)="close.emit()"
    >
      @if (atCapacity()) {
        <div class="pe-warn">
          <strong>Program at capacity</strong> ({{ program().currentEnrollment }} / {{ program().capacity }}).
          You cannot enroll additional clients until capacity is increased or a client is discharged.
        </div>
      }

      <label class="pe-field">
        <span>Client name <em>*</em></span>
        <input type="text" [(ngModel)]="clientName" placeholder="e.g., J. Hernandez" />
      </label>

      @if (phases().length > 0) {
        <label class="pe-field">
          <span>Starting phase</span>
          <select [(ngModel)]="phaseId">
            <option value="">— Auto-assign first phase —</option>
            @for (ph of phases(); track ph.id) { <option [value]="ph.id">{{ ph.name }}</option> }
          </select>
        </label>
      }

      <label class="pe-field">
        <span>Primary staff (case manager / counselor)</span>
        <select [(ngModel)]="primaryStaffId">
          <option value="">— None —</option>
          @for (s of primaryEligibleStaff(); track s.id) { <option [value]="s.id">{{ s.name }} ({{ s.role }})</option> }
        </select>
      </label>

      <label class="pe-field pe-field--toggle">
        <input type="checkbox" [(ngModel)]="consentSigned" />
        <span>42 CFR Part 2 consent has been signed</span>
      </label>

      <label class="pe-field pe-field--toggle">
        <input type="checkbox" [(ngModel)]="notifyClient" />
        <span>Send enrollment welcome SMS + email</span>
      </label>

      <ng-container slot="footer">
        <button type="button" class="pe-btn pe-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="pe-btn pe-btn--primary" (click)="submit()" [disabled]="!canSubmit()">Enroll Client</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .pe-warn { margin: 0 0 1rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.8125rem; }
      .pe-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .pe-field > span > em { color: #dc2626; font-style: normal; }
      .pe-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
      .pe-field input[type="text"], .pe-field select { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .pe-field input:focus, .pe-field select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .pe-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .pe-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pe-btn--primary { background: #1e40af; color: white; border-color: #1e40af; }
      .pe-btn--primary:hover:not(:disabled) { background: #1e3a8a; }
      .pe-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramEnrollModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  @Output() public close = new EventEmitter<void>();

  public clientName = '';
  public phaseId = '';
  public primaryStaffId = '';
  public consentSigned = false;
  public notifyClient = true;

  public atCapacity(): boolean {
    return this.program().currentEnrollment >= this.program().capacity;
  }

  public phases() {
    return this.program().phases;
  }

  public primaryEligibleStaff() {
    return this.program().staff.filter(s => s.role === 'CaseManager' || s.role === 'Counselor' || s.role === 'PeerSupport');
  }

  public canSubmit(): boolean {
    return !this.atCapacity() && !!this.clientName.trim() && this.consentSigned;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const p = this.program();
    const firstPhase = p.phases.length > 0 ? p.phases.slice().sort((a, b) => a.orderIndex - b.orderIndex)[0].id : undefined;
    this.store.enrollClient(p.id, {
      clientId: 'c-' + Date.now().toString(36),
      clientName: this.clientName.trim(),
      phaseId: this.phaseId || firstPhase,
      status: 'Active',
      primaryStaffId: this.primaryStaffId || undefined
    });
    this.toast.showSuccess(`${this.clientName.trim()} enrolled in ${p.name}.`);
    this.close.emit();
  }
}
