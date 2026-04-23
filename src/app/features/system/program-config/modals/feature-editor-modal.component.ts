import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramConfigStoreService } from '../program-config-store.service';
import { FeatureCategory, FeatureStatus, IFeatureDef, SubscriptionTier, TIER_ORDER } from '../program-config.types';

@Component({
  selector: 'app-feature-editor-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      [title]="existing() ? 'Edit Feature' : 'Add Feature'"
      [subtitle]="existing()?.name || 'Define a new platform feature'"
      width="620px"
      (close)="close.emit()"
    >
      <div class="fe-grid">
        <label class="fe-field fe-field--full">
          <span>Feature Name <em>*</em></span>
          <input type="text" [(ngModel)]="name" maxlength="128" (ngModelChange)="onNameChange($event)" placeholder="e.g., Peer Support Sessions" />
        </label>

        <label class="fe-field fe-field--full">
          <span>Feature Key <em>*</em></span>
          <input type="text" [(ngModel)]="key" maxlength="64" placeholder="e.g., peer_sessions" [disabled]="!!existing()" />
          @if (!existing() && key && !isKeyAvailable()) {
            <small class="fe-error">Key already exists.</small>
          } @else {
            <small class="fe-help">snake_case, immutable after save</small>
          }
        </label>

        <label class="fe-field fe-field--full">
          <span>Description</span>
          <textarea rows="2" [(ngModel)]="description" maxlength="500"></textarea>
        </label>

        <label class="fe-field">
          <span>Category <em>*</em></span>
          <select [(ngModel)]="category">
            @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
          </select>
        </label>

        <label class="fe-field">
          <span>Minimum Tier</span>
          <select [(ngModel)]="minTier">
            @for (t of tiers; track t) { <option [value]="t">{{ t }}</option> }
          </select>
        </label>

        <label class="fe-field">
          <span>Status</span>
          <select [(ngModel)]="status">
            <option value="Active">Active</option>
            <option value="Beta">Beta</option>
            <option value="Deprecated">Deprecated</option>
          </select>
        </label>

        <label class="fe-field">
          <span>Icon Key</span>
          <input type="text" [(ngModel)]="iconKey" placeholder="lucide icon name" />
        </label>
      </div>

      <h4 class="fe-sub">Dependencies</h4>
      <p class="fe-help fe-help--block">Select features this depends on. Example: Lab Integration requires UA Testing.</p>
      <div class="fe-deps">
        @for (f of availableForDeps(); track f.key) {
          <label class="fe-dep">
            <input type="checkbox" [checked]="deps.includes(f.key)" (change)="toggleDep(f.key)" />
            <span>{{ f.name }} <code>{{ f.key }}</code></span>
          </label>
        }
      </div>

      <ng-container slot="footer">
        <button type="button" class="fe-btn fe-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="fe-btn fe-btn--primary" (click)="submit()" [disabled]="!canSubmit()">
          {{ existing() ? 'Save Changes' : 'Create Feature' }}
        </button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .fe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
      @media (max-width: 600px) { .fe-grid { grid-template-columns: 1fr; } }
      .fe-field { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #475569; }
      .fe-field--full { grid-column: 1 / -1; }
      .fe-field > span { font-weight: 600; color: #334155; }
      .fe-field em { color: #dc2626; font-style: normal; }
      .fe-field input, .fe-field select, .fe-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; color: #0f172a; }
      .fe-field input:focus, .fe-field select:focus, .fe-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .fe-field input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
      .fe-error { color: #dc2626; font-size: 0.6875rem; }
      .fe-help { color: #94a3b8; font-size: 0.6875rem; }
      .fe-help--block { margin: 0 0 0.375rem; }
      .fe-sub { margin: 1rem 0 0.375rem; font-size: 0.75rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
      .fe-deps { display: grid; grid-template-columns: 1fr 1fr; gap: 0.375rem; max-height: 180px; overflow-y: auto; padding: 0.375rem; border: 1px solid #e2e8f0; border-radius: 6px; }
      @media (max-width: 500px) { .fe-deps { grid-template-columns: 1fr; } }
      .fe-dep { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; border-radius: 4px; font-size: 0.8125rem; color: #334155; cursor: pointer; }
      .fe-dep:hover { background: #f8fafc; }
      .fe-dep code { font-family: ui-monospace, Menlo, monospace; font-size: 0.6875rem; color: #64748b; background: #f1f5f9; padding: 0 0.25rem; border-radius: 3px; margin-left: 0.25rem; }
      .fe-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; font-family: inherit; }
      .fe-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .fe-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .fe-btn--primary:hover:not(:disabled) { background: #1d4ed8; }
      .fe-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class FeatureEditorModalComponent {
  private readonly store = inject(ProgramConfigStoreService);
  private readonly toast = inject(ToastService);

  public readonly existing = input<IFeatureDef | null>(null);
  @Output() public close = new EventEmitter<void>();
  @Output() public saved = new EventEmitter<IFeatureDef>();

  public readonly categories: FeatureCategory[] = ['Engagement', 'Compliance', 'Clinical', 'Housing', 'Justice', 'Communication', 'Reporting', 'Administrative'];
  public readonly tiers: SubscriptionTier[] = TIER_ORDER;

  public name = '';
  public key = '';
  public description = '';
  public category: FeatureCategory = 'Engagement';
  public minTier: SubscriptionTier = 'Basic';
  public status: FeatureStatus = 'Active';
  public iconKey = 'settings';
  public deps: string[] = [];

  constructor() {
    queueMicrotask(() => {
      const e = this.existing();
      if (e) {
        this.name = e.name;
        this.key = e.key;
        this.description = e.description;
        this.category = e.category;
        this.minTier = e.minTier;
        this.status = e.status;
        this.iconKey = e.iconKey;
        this.deps = [...e.dependencies];
      }
    });
  }

  public onNameChange(v: string): void {
    this.name = v;
    if (!this.existing() && !this.key) {
      this.key = v.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }
  }

  public readonly isKeyAvailable = computed(() => {
    const k = this.key.trim();
    if (!k) return true;
    if (this.existing()?.key === k) return true;
    return this.store.isFeatureKeyAvailable(k);
  });

  public availableForDeps(): IFeatureDef[] {
    return this.store.features().filter(f => f.key !== this.key);
  }

  public toggleDep(k: string): void {
    this.deps = this.deps.includes(k) ? this.deps.filter(d => d !== k) : [...this.deps, k];
  }

  public canSubmit(): boolean {
    if (!this.name.trim()) return false;
    if (!this.key.trim() || !/^[a-z][a-z0-9_]*$/.test(this.key.trim())) return false;
    if (!this.existing() && !this.isKeyAvailable()) return false;
    return true;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const existing = this.existing();
    const payload: IFeatureDef = {
      key: existing ? existing.key : this.key.trim(),
      name: this.name.trim(),
      description: this.description.trim(),
      category: this.category,
      iconKey: this.iconKey,
      minTier: this.minTier,
      status: this.status,
      programsUsing: existing?.programsUsing ?? 0,
      dependencies: [...this.deps],
      conflicts: existing?.conflicts ?? []
    };
    if (existing) {
      this.store.updateFeature(existing.key, payload);
      this.toast.showSuccess(`Feature "${payload.name}" updated.`);
    } else {
      this.store.createFeature(payload);
      this.toast.showSuccess(`Feature "${payload.name}" created.`);
    }
    this.saved.emit(payload);
    this.close.emit();
  }
}
