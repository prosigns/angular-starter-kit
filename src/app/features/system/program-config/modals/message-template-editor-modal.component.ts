import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramConfigStoreService } from '../program-config-store.service';
import { IMessageTemplate } from '../program-config.types';

const AVAILABLE_VARS = [
  '{{client.first_name}}', '{{client.full_name}}', '{{program.name}}', '{{staff.name}}',
  '{{appointment.date}}', '{{appointment.time}}', '{{appointment.type}}',
  '{{checkin.deadline}}', '{{streak.count}}', '{{milestone.name}}',
  '{{tenant.name}}', '{{support.phone}}', '{{crisis.hotline}}'
];

@Component({
  selector: 'app-message-template-editor-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      [title]="'Edit ' + template().channel + ' Template'"
      [subtitle]="template().notification"
      width="620px"
      (close)="close.emit()"
    >
      <div class="mte-row">
        <label class="mte-field">
          <span>Message body</span>
          <textarea
            rows="6"
            [ngModel]="body()"
            (ngModelChange)="body.set($event)"
            [placeholder]="placeholder()"
          ></textarea>
          <small class="mte-count" [class.mte-count--warn]="overLimit()">
            {{ body().length }} chars{{ limit() ? ' / ' + limit() : '' }}
            @if (overLimit()) { — will send as {{ segments() }} segments }
          </small>
        </label>
      </div>

      <h4 class="mte-sub">Available variables</h4>
      <div class="mte-vars">
        @for (v of vars; track v) {
          <button type="button" class="mte-var" (click)="insertVar(v)">{{ v }}</button>
        }
      </div>

      <div class="mte-preview">
        <strong>Preview</strong>
        <p>{{ renderPreview() }}</p>
      </div>

      <ng-container slot="footer">
        <button type="button" class="mte-btn mte-btn--ghost" (click)="reset()">Reset to default</button>
        <button type="button" class="mte-btn mte-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="mte-btn mte-btn--primary" (click)="submit()" [disabled]="!canSubmit()">Save Template</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .mte-row { margin-bottom: 0.75rem; }
      .mte-field { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #475569; }
      .mte-field > span { font-weight: 600; color: #334155; }
      .mte-field textarea { padding: 0.625rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: ui-monospace, Menlo, monospace; outline: none; color: #0f172a; resize: vertical; min-height: 96px; line-height: 1.5; }
      .mte-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .mte-count { color: #64748b; font-size: 0.6875rem; }
      .mte-count--warn { color: #d97706; font-weight: 600; }
      .mte-sub { margin: 0.5rem 0 0.375rem; font-size: 0.75rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
      .mte-vars { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.75rem; }
      .mte-var { padding: 0.25rem 0.5rem; background: #f1f5f9; color: #3730a3; border: 1px solid #e0e7ff; border-radius: 4px; font-size: 0.6875rem; font-family: ui-monospace, Menlo, monospace; cursor: pointer; }
      .mte-var:hover { background: #e0e7ff; }
      .mte-preview { margin: 0.5rem 0; padding: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; }
      .mte-preview strong { display: block; font-size: 0.6875rem; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
      .mte-preview p { margin: 0; font-size: 0.8125rem; color: #1f2937; line-height: 1.5; }
      .mte-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; font-family: inherit; }
      .mte-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .mte-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .mte-btn--primary:hover:not(:disabled) { background: #1d4ed8; }
      .mte-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class MessageTemplateEditorModalComponent {
  private readonly store = inject(ProgramConfigStoreService);
  private readonly toast = inject(ToastService);

  public readonly template = input.required<IMessageTemplate>();
  @Output() public close = new EventEmitter<void>();

  public readonly body = signal('');
  public readonly vars = AVAILABLE_VARS;

  constructor() {
    queueMicrotask(() => this.body.set(this.template().body));
  }

  public readonly limit = computed(() => this.template().channel === 'SMS' ? 160 : 0);
  public readonly overLimit = computed(() => this.limit() > 0 && this.body().length > this.limit());
  public readonly segments = computed(() => Math.ceil(this.body().length / 153));

  public placeholder(): string {
    return this.template().channel === 'SMS' ? 'Max ~160 chars per segment…' : 'Enter body content…';
  }

  public insertVar(v: string): void {
    this.body.update(b => (b ? b + ' ' + v : v));
  }

  public renderPreview(): string {
    const sample: Record<string, string> = {
      '{{client.first_name}}': 'John',
      '{{client.full_name}}': 'John Smith',
      '{{program.name}}': 'Grafton Drug Court',
      '{{staff.name}}': 'Sarah Chen',
      '{{appointment.date}}': 'Apr 25, 2026',
      '{{appointment.time}}': '2:00 PM',
      '{{appointment.type}}': 'Case Management',
      '{{checkin.deadline}}': '10:00 PM',
      '{{streak.count}}': '30',
      '{{milestone.name}}': '30-Day Streak',
      '{{tenant.name}}': 'Grafton County Services',
      '{{support.phone}}': '(603) 555-0100',
      '{{crisis.hotline}}': '988'
    };
    let out = this.body();
    for (const [k, v] of Object.entries(sample)) out = out.replaceAll(k, v);
    return out || '(empty)';
  }

  public canSubmit(): boolean {
    return this.body().trim().length > 0;
  }

  public reset(): void {
    this.body.set('');
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    this.store.updateMessageTemplate(this.template().id, this.body());
    this.toast.showSuccess(`${this.template().channel} template updated.`);
    this.close.emit();
  }
}
