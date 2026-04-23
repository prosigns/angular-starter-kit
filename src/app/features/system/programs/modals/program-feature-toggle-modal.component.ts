import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramStoreService } from '../program-store.service';
import { FEATURE_LABEL, FeatureKey, IProgram } from '../program.types';

@Component({
  selector: 'app-program-feature-toggle-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      [title]="enabling() ? 'Enable Feature' : 'Disable Feature'"
      [subtitle]="featureLabel[feature()] + ' for ' + program().name"
      [tone]="enabling() ? 'default' : 'warn'"
      width="500px"
      (close)="close.emit()"
    >
      @if (enabling()) {
        <p class="ft-info">
          Enabling <strong>{{ featureLabel[feature()] }}</strong> will activate related UI, background jobs,
          and notification rules for this program. Default configuration will be applied — you can refine it afterwards.
        </p>
      } @else {
        <div class="ft-warn">
          <strong>Disabling {{ featureLabel[feature()] }} will:</strong>
          <ul>
            <li>Hide the feature from the program UI</li>
            <li>Pause related background jobs and reminders</li>
            <li>Preserve existing data — re-enabling restores visibility</li>
          </ul>
        </div>
      }

      <label class="ft-field">
        <span>Reason (stored in audit log)</span>
        <textarea rows="3" [(ngModel)]="reason" placeholder="Optional context…"></textarea>
      </label>

      <ng-container slot="footer">
        <button type="button" class="ft-btn ft-btn--ghost" (click)="close.emit()">Cancel</button>
        <button
          type="button"
          class="ft-btn"
          [class.ft-btn--primary]="enabling()"
          [class.ft-btn--warn]="!enabling()"
          (click)="submit()"
        >
          {{ enabling() ? 'Enable' : 'Disable' }} Feature
        </button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .ft-info { margin: 0 0 1rem; font-size: 0.8125rem; color: #334155; }
      .ft-warn { margin: 0 0 1rem; padding: 0.75rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-size: 0.8125rem; }
      .ft-warn ul { margin: 0.375rem 0 0 1rem; padding: 0; font-size: 0.8125rem; }
      .ft-warn li { margin: 0.125rem 0; }
      .ft-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .ft-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; }
      .ft-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .ft-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .ft-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .ft-btn--primary { background: #1e40af; color: white; border-color: #1e40af; }
      .ft-btn--primary:hover { background: #1e3a8a; }
      .ft-btn--warn { background: #d97706; color: white; border-color: #d97706; }
      .ft-btn--warn:hover { background: #b45309; }
    `
  ]
})
export class ProgramFeatureToggleModalComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly toast = inject(ToastService);

  public readonly program = input.required<IProgram>();
  public readonly feature = input.required<FeatureKey>();
  public readonly enabling = input.required<boolean>();
  @Output() public close = new EventEmitter<void>();

  public reason = '';
  public readonly featureLabel = FEATURE_LABEL;

  public submit(): void {
    this.store.setFeature(this.program().id, this.feature(), this.enabling(), this.reason || undefined);
    this.toast.showSuccess(`${FEATURE_LABEL[this.feature()]} ${this.enabling() ? 'enabled' : 'disabled'}.`);
    this.close.emit();
  }
}
