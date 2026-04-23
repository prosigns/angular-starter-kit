import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { IProgram } from '../program.types';

@Component({
  selector: 'app-program-activate-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Activate Program"
      subtitle="Move program out of Draft — enrollments and notifications will begin"
      width="520px"
      (close)="close.emit()"
    >
      <p class="pa-info">
        Activating <strong>{{ program().name }}</strong> enables client enrollment, check-in reminders,
        and all configured notifications. A Program Director must be assigned before activation.
      </p>

      <dl class="pa-impact">
        <div><dt>Director</dt><dd>{{ program().directorName || '—' }}</dd></div>
        <div><dt>Capacity</dt><dd>{{ program().capacity }}</dd></div>
        <div><dt>Staff</dt><dd>{{ program().staff.length }}</dd></div>
        <div><dt>Features</dt><dd>{{ enabledFeatureCount() }} enabled</dd></div>
      </dl>

      @if (!hasDirector()) {
        <div class="pa-warn">
          <strong>Cannot activate:</strong> program requires at least one Director before activation.
          Assign a Director from the Staff tab first.
        </div>
      }

      <label class="pa-field">
        <span>Activation notes (optional)</span>
        <textarea rows="3" [(ngModel)]="notes" placeholder="Optional context for the audit log…"></textarea>
      </label>

      <label class="pa-field pa-field--toggle">
        <input type="checkbox" [(ngModel)]="notifyStaff" />
        <span>Notify assigned staff via email</span>
      </label>

      <ng-container slot="footer">
        <button type="button" class="pa-btn pa-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="pa-btn pa-btn--primary" (click)="submit()" [disabled]="!hasDirector()">Activate Program</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .pa-info { margin: 0 0 1rem; font-size: 0.8125rem; color: #334155; }
      .pa-impact { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 0 1rem; }
      .pa-impact div { display: flex; flex-direction: column; }
      .pa-impact dt { margin: 0; font-size: 0.6875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      .pa-impact dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .pa-warn { margin: 0 0 1rem; padding: 0.75rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.8125rem; }
      .pa-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .pa-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
      .pa-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .pa-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .pa-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .pa-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pa-btn--primary { background: #15803d; color: white; border-color: #15803d; }
      .pa-btn--primary:hover:not(:disabled) { background: #166534; }
      .pa-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramActivateModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  @Output() public close = new EventEmitter<void>();

  public notes = '';
  public notifyStaff = true;

  public hasDirector(): boolean {
    return this.program().staff.some(s => s.role === 'Director');
  }

  public enabledFeatureCount(): number {
    return Object.values(this.program().features).filter(Boolean).length;
  }

  public submit(): void {
    if (!this.hasDirector()) return;
    const p = this.program();
    this.store.activate(p.id, this.notes || undefined);
    this.toast.showSuccess(`${p.name} activated.`);
    this.close.emit();
  }
}
