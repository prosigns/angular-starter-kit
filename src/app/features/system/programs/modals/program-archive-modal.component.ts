import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IProgram } from '../program.types';

@Component({
  selector: 'app-program-archive-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Archive Program"
      subtitle="Move to archive — historical data preserved for 7-year retention"
      tone="warn"
      width="520px"
      (close)="close.emit()"
    >
      <p class="pa-warn">
        Archiving hides <strong>{{ program().name }}</strong> from all active lists but preserves
        all reports and audit trails per the 7-year retention policy.
      </p>

      <label class="pa-field">
        <span>Archival reason <em>*</em></span>
        <textarea rows="3" [(ngModel)]="reason" placeholder="Required — stored in permanent audit log…"></textarea>
      </label>

      <ng-container slot="footer">
        <button type="button" class="pa-btn pa-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="pa-btn pa-btn--warn" (click)="submit()" [disabled]="!canSubmit()">Archive Program</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .pa-warn { margin: 0 0 1rem; padding: 0.75rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-size: 0.8125rem; }
      .pa-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .pa-field > span > em { color: #dc2626; font-style: normal; }
      .pa-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .pa-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .pa-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .pa-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pa-btn--warn { background: #d97706; color: white; border-color: #d97706; }
      .pa-btn--warn:hover:not(:disabled) { background: #b45309; }
      .pa-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramArchiveModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  @Output() public close = new EventEmitter<void>();

  public reason = '';

  public canSubmit(): boolean {
    return !!this.reason.trim();
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const p = this.program();
    this.store.archive(p.id, this.reason);
    this.toast.showSuccess(`${p.name} archived.`);
    this.close.emit();
  }
}
