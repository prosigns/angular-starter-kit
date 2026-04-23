import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IProgram, STAFF_ROLE_LABEL, StaffRole } from '../program.types';

@Component({
  selector: 'app-program-staff-assign-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Assign Staff"
      [subtitle]="'Adding staff to ' + program().name"
      width="540px"
      (close)="close.emit()"
    >
      <label class="sa-field">
        <span>Staff member name <em>*</em></span>
        <input type="text" [(ngModel)]="name" placeholder="e.g., Sarah Kim" />
      </label>

      <label class="sa-field">
        <span>Role <em>*</em></span>
        <select [(ngModel)]="role">
          @for (r of allRoles; track r) { <option [value]="r">{{ roleLabel[r] }}</option> }
        </select>
      </label>

      @if (roleHasCaseload()) {
        <div class="sa-grid">
          <label class="sa-field">
            <span>Caseload max</span>
            <input type="number" min="0" max="200" [(ngModel)]="caseloadMax" />
          </label>
          <label class="sa-field">
            <span>Current caseload</span>
            <input type="number" min="0" [(ngModel)]="caseloadCurrent" />
          </label>
        </div>
      }

      <label class="sa-field sa-field--toggle">
        <input type="checkbox" [(ngModel)]="primary" />
        <span>Primary assignment (single program focus)</span>
      </label>

      @if (role === 'Director' && hasDirector()) {
        <div class="sa-warn">
          This program already has a Director. Assigning another will create a co-director arrangement.
        </div>
      }

      <ng-container slot="footer">
        <button type="button" class="sa-btn sa-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="sa-btn sa-btn--primary" (click)="submit()" [disabled]="!canSubmit()">Assign Staff</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .sa-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .sa-field > span > em { color: #dc2626; font-style: normal; }
      .sa-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
      .sa-field input[type="text"], .sa-field input[type="number"], .sa-field select { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .sa-field input:focus, .sa-field select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .sa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
      .sa-warn { margin: 0 0 0.75rem; padding: 0.625rem 0.75rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-size: 0.8125rem; }
      .sa-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .sa-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .sa-btn--primary { background: #1e40af; color: white; border-color: #1e40af; }
      .sa-btn--primary:hover:not(:disabled) { background: #1e3a8a; }
      .sa-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramStaffAssignModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  @Output() public close = new EventEmitter<void>();

  public name = '';
  public role: StaffRole = 'CaseManager';
  public caseloadMax = 20;
  public caseloadCurrent = 0;
  public primary = false;

  public readonly allRoles: StaffRole[] = ['Director', 'CaseManager', 'Counselor', 'PeerSupport', 'HousingManager', 'MedicalStaff', 'CourtOfficer', 'Supervisor', 'Admin', 'ReadOnly'];
  public readonly roleLabel = STAFF_ROLE_LABEL;

  public roleHasCaseload(): boolean {
    return ['CaseManager', 'Counselor', 'PeerSupport', 'HousingManager'].includes(this.role);
  }

  public hasDirector(): boolean {
    return this.program().staff.some(s => s.role === 'Director');
  }

  public canSubmit(): boolean {
    return !!this.name.trim();
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    this.store.assignStaff(this.program().id, {
      userId: 'u-' + Date.now().toString(36),
      name: this.name.trim(),
      role: this.role,
      caseloadMax: this.roleHasCaseload() ? this.caseloadMax : 0,
      caseloadCurrent: this.roleHasCaseload() ? this.caseloadCurrent : 0,
      primary: this.primary
    });
    this.toast.showSuccess(`${this.name} assigned as ${STAFF_ROLE_LABEL[this.role]}.`);
    this.close.emit();
  }
}
