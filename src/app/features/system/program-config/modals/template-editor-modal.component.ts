import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramConfigStoreService } from '../program-config-store.service';
import { ITemplateSummary } from '../program-config.types';

type TemplateKind = 'checkin' | 'compliance' | 'phase';

const KIND_META: Record<TemplateKind, { label: string; itemLabel: string; defaultName: string }> = {
  checkin:    { label: 'Check-In Template',   itemLabel: 'questions', defaultName: 'New Check-In Template' },
  compliance: { label: 'Compliance Template', itemLabel: 'rules',     defaultName: 'New Compliance Template' },
  phase:      { label: 'Phase Template',      itemLabel: 'phases',    defaultName: 'New Phase Template' }
};

@Component({
  selector: 'app-template-editor-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      [title]="existing() ? 'Edit ' + meta().label : 'Create ' + meta().label"
      [subtitle]="existing()?.name || 'Reusable template that can be assigned to program types'"
      width="540px"
      (close)="close.emit()"
    >
      <label class="te-field">
        <span>Template Name <em>*</em></span>
        <input type="text" [(ngModel)]="name" maxlength="128" />
      </label>

      <label class="te-field">
        <span>Description</span>
        <textarea rows="3" [(ngModel)]="description" maxlength="500"></textarea>
      </label>

      <label class="te-field">
        <span>Initial {{ meta().itemLabel }} count</span>
        <input type="number" [(ngModel)]="itemCount" min="0" max="50" />
        <small class="te-help">Items are authored after creation in the template builder.</small>
      </label>

      <ng-container slot="footer">
        <button type="button" class="te-btn te-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="te-btn te-btn--primary" (click)="submit()" [disabled]="!canSubmit()">
          {{ existing() ? 'Save Changes' : 'Create Template' }}
        </button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .te-field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #475569; }
      .te-field > span { font-weight: 600; color: #334155; }
      .te-field em { color: #dc2626; font-style: normal; }
      .te-field input, .te-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; color: #0f172a; }
      .te-field input:focus, .te-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .te-help { color: #94a3b8; font-size: 0.6875rem; }
      .te-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; font-family: inherit; }
      .te-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .te-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .te-btn--primary:hover:not(:disabled) { background: #1d4ed8; }
      .te-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class TemplateEditorModalComponent {
  private readonly store = inject(ProgramConfigStoreService);
  private readonly toast = inject(ToastService);

  public readonly kind = input.required<TemplateKind>();
  public readonly existing = input<ITemplateSummary | null>(null);
  @Output() public close = new EventEmitter<void>();
  @Output() public saved = new EventEmitter<ITemplateSummary>();

  public name = '';
  public description = '';
  public itemCount = 0;

  constructor() {
    queueMicrotask(() => {
      const e = this.existing();
      if (e) {
        this.name = e.name;
        this.description = e.description;
        this.itemCount = e.itemCount;
      }
    });
  }

  public meta() {
    return KIND_META[this.kind()];
  }

  public canSubmit(): boolean {
    return this.name.trim().length >= 3;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const existing = this.existing();
    if (existing) {
      this.store.updateTemplate(this.kind(), existing.id, {
        name: this.name.trim(),
        description: this.description.trim(),
        itemCount: this.itemCount
      });
      this.toast.showSuccess(`"${this.name.trim()}" updated.`);
    } else {
      const created = this.store.createTemplate(this.kind(), {
        name: this.name.trim(),
        description: this.description.trim(),
        itemCount: this.itemCount,
        itemLabel: KIND_META[this.kind()].itemLabel
      });
      this.toast.showSuccess(`Template "${created.name}" created.`);
      this.saved.emit(created);
    }
    this.close.emit();
  }
}
