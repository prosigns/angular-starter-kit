import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IProgram } from '../program.types';

@Component({
  selector: 'app-program-reactivate-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Reactivate Program"
      subtitle="Resume program operations with existing configuration"
      width="500px"
      (close)="close.emit()"
    >
      <p class="pr-info">
        Reactivating <strong>{{ program().name }}</strong> will resume all check-ins, appointments,
        and compliance tracking. Configuration is preserved from the suspension.
      </p>

      <dl class="pr-impact">
        <div><dt>Enrolled</dt><dd>{{ program().currentEnrollment }}</dd></div>
        <div><dt>Staff</dt><dd>{{ program().staff.length }}</dd></div>
        <div><dt>Suspended Since</dt><dd>{{ program().suspendedAt || '—' }}</dd></div>
      </dl>

      <label class="pr-field">
        <span>Reactivation notes</span>
        <textarea rows="3" [(ngModel)]="notes" placeholder="Context for the audit log…"></textarea>
      </label>

      <label class="pr-field pr-field--toggle">
        <input type="checkbox" [(ngModel)]="notifyClients" />
        <span>Notify enrolled clients that program is active again</span>
      </label>

      <ng-container slot="footer">
        <button type="button" class="pr-btn pr-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="pr-btn pr-btn--primary" (click)="submit()">Reactivate Program</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .pr-info { margin: 0 0 1rem; font-size: 0.8125rem; color: #334155; }
      .pr-impact { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin: 0 0 1rem; }
      .pr-impact div { display: flex; flex-direction: column; }
      .pr-impact dt { margin: 0; font-size: 0.6875rem; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; }
      .pr-impact dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #14532d; }
      .pr-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .pr-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
      .pr-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .pr-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .pr-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .pr-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pr-btn--primary { background: #15803d; color: white; border-color: #15803d; }
      .pr-btn--primary:hover { background: #166534; }
    `
  ]
})
export class ProgramReactivateModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  @Output() public close = new EventEmitter<void>();

  public notes = '';
  public notifyClients = true;

  public submit(): void {
    const p = this.program();
    this.store.reactivate(p.id, this.notes || undefined);
    this.toast.showSuccess(`${p.name} reactivated.`);
    this.close.emit();
  }
}
