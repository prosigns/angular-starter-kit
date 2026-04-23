import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ModalShellComponent } from '../../tenants/modals/modal-shell.component';
import { ProgramConfigStoreService } from '../program-config-store.service';
import { IProgramTypeDef, ProgramTypeCategory, SubscriptionTier, TIER_ORDER } from '../program-config.types';

@Component({
  selector: 'app-program-type-editor-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      [title]="existing() ? 'Edit Program Type' : 'Add Program Type'"
      [subtitle]="existing()?.name || 'Define a new program type available to all tenants'"
      width="600px"
      (close)="close.emit()"
    >
      <div class="pte-grid">
        <label class="pte-field pte-field--full">
          <span>Type Name <em>*</em></span>
          <input type="text" [(ngModel)]="name" maxlength="128" placeholder="e.g., Peer Recovery Support" />
        </label>

        <label class="pte-field">
          <span>Type Code <em>*</em></span>
          <input type="text" [(ngModel)]="code" maxlength="6" placeholder="e.g., PRS" [disabled]="!!existing()" />
          @if (!existing() && code && !isCodeAvailable()) {
            <small class="pte-error">Code already exists.</small>
          }
        </label>

        <label class="pte-field">
          <span>Category <em>*</em></span>
          <select [(ngModel)]="category">
            <option value="Treatment">Treatment</option>
            <option value="Housing">Housing</option>
            <option value="Justice">Justice</option>
            <option value="Community">Community</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label class="pte-field pte-field--full">
          <span>Description</span>
          <textarea rows="3" [(ngModel)]="description" maxlength="500" placeholder="What kind of program is this and who is it for?"></textarea>
        </label>

        <label class="pte-field">
          <span>Minimum Subscription Tier</span>
          <select [(ngModel)]="minTier">
            @for (t of tiers; track t) { <option [value]="t">{{ t }}</option> }
          </select>
        </label>

        <label class="pte-field">
          <span>Default Capacity</span>
          <input type="number" [(ngModel)]="defaultCapacity" min="1" max="2000" />
        </label>

        <label class="pte-field">
          <span>Accent Color</span>
          <div class="pte-color">
            <input type="color" [(ngModel)]="color" />
            <input type="text" [(ngModel)]="color" maxlength="7" />
          </div>
        </label>

        <label class="pte-field">
          <span>Icon Key</span>
          <select [(ngModel)]="iconKey">
            <option value="gavel">Gavel (Justice)</option>
            <option value="heart-pulse">Heart (Clinical)</option>
            <option value="home">Home (Housing)</option>
            <option value="shield-check">Shield (Supervision)</option>
            <option value="briefcase">Briefcase (Case Mgmt)</option>
            <option value="pill">Pill (MAT)</option>
            <option value="users">Users (Community)</option>
            <option value="door-open">Door (Entry)</option>
            <option value="settings">Settings (Other)</option>
          </select>
        </label>
      </div>

      <h4 class="pte-sub">Requirements</h4>
      <div class="pte-toggles">
        <label class="pte-toggle">
          <input type="checkbox" [(ngModel)]="requiresConsent" />
          <span>42 CFR Part 2 consent mandatory</span>
        </label>
        <label class="pte-toggle">
          <input type="checkbox" [(ngModel)]="requiresUA" />
          <span>UA / Drug testing auto-enabled</span>
        </label>
        <label class="pte-toggle">
          <input type="checkbox" [(ngModel)]="requiresCourtCompliance" />
          <span>Court compliance auto-enabled</span>
        </label>
        <label class="pte-toggle">
          <input type="checkbox" [(ngModel)]="requiresHousing" />
          <span>Housing module auto-enabled</span>
        </label>
        <label class="pte-toggle">
          <input type="checkbox" [(ngModel)]="isActive" />
          <span>Active (shown to Tenant Admins)</span>
        </label>
      </div>

      <ng-container slot="footer">
        <button type="button" class="pte-btn pte-btn--ghost" (click)="close.emit()">Cancel</button>
        <button type="button" class="pte-btn pte-btn--primary" (click)="submit()" [disabled]="!canSubmit()">
          {{ existing() ? 'Save Changes' : 'Create Type' }}
        </button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .pte-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .pte-field { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #475569; }
      .pte-field--full { grid-column: 1 / -1; }
      .pte-field > span { font-weight: 600; color: #334155; }
      .pte-field em { color: #dc2626; font-style: normal; }
      .pte-field input, .pte-field select, .pte-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; outline: none; color: #0f172a; }
      .pte-field input:focus, .pte-field select:focus, .pte-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .pte-field input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
      .pte-error { color: #dc2626; font-size: 0.6875rem; }
      .pte-color { display: flex; gap: 0.375rem; align-items: center; }
      .pte-color input[type="color"] { width: 40px; height: 32px; padding: 2px; cursor: pointer; }
      .pte-color input[type="text"] { flex: 1; font-family: ui-monospace, Menlo, monospace; }
      .pte-sub { margin: 1rem 0 0.5rem; font-size: 0.75rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
      .pte-toggles { display: grid; grid-template-columns: 1fr 1fr; gap: 0.375rem; }
      @media (max-width: 520px) { .pte-toggles, .pte-grid { grid-template-columns: 1fr; } }
      .pte-toggle { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.625rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #334155; cursor: pointer; }
      .pte-toggle input { accent-color: #2563eb; }
      .pte-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; font-family: inherit; }
      .pte-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pte-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .pte-btn--primary:hover:not(:disabled) { background: #1d4ed8; }
      .pte-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class ProgramTypeEditorModalComponent {
  private readonly store = inject(ProgramConfigStoreService);
  private readonly toast = inject(ToastService);

  public readonly existing = input<IProgramTypeDef | null>(null);
  @Output() public close = new EventEmitter<void>();
  @Output() public saved = new EventEmitter<IProgramTypeDef>();

  public readonly tiers: SubscriptionTier[] = TIER_ORDER;

  public name = '';
  public code = '';
  public description = '';
  public category: ProgramTypeCategory = 'Treatment';
  public minTier: SubscriptionTier = 'Basic';
  public defaultCapacity = 50;
  public color = '#2563EB';
  public iconKey = 'settings';
  public requiresConsent = true;
  public requiresUA = false;
  public requiresCourtCompliance = false;
  public requiresHousing = false;
  public isActive = true;

  constructor() {
    queueMicrotask(() => {
      const e = this.existing();
      if (e) {
        this.name = e.name;
        this.code = e.code;
        this.description = e.description;
        this.category = e.category;
        this.minTier = e.minTier;
        this.defaultCapacity = e.defaultCapacity;
        this.color = e.color;
        this.iconKey = e.iconKey;
        this.requiresConsent = e.requiresConsent;
        this.requiresUA = e.requiresUA;
        this.requiresCourtCompliance = e.requiresCourtCompliance;
        this.requiresHousing = e.requiresHousing;
        this.isActive = e.isActive;
      }
    });
  }

  public readonly isCodeAvailable = computed(() => {
    const c = this.code.trim().toUpperCase();
    if (!c) return true;
    if (this.existing()?.code === c) return true;
    return this.store.isTypeCodeAvailable(c);
  });

  public canSubmit(): boolean {
    if (!this.name.trim()) return false;
    if (!this.code.trim() || this.code.trim().length < 2) return false;
    if (!this.existing() && !this.isCodeAvailable()) return false;
    return true;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const existing = this.existing();
    if (existing) {
      this.store.updateType(existing.code, {
        name: this.name.trim(),
        description: this.description.trim(),
        category: this.category,
        minTier: this.minTier,
        defaultCapacity: this.defaultCapacity,
        color: this.color,
        iconKey: this.iconKey,
        requiresConsent: this.requiresConsent,
        requiresUA: this.requiresUA,
        requiresCourtCompliance: this.requiresCourtCompliance,
        requiresHousing: this.requiresHousing,
        isActive: this.isActive
      });
      const updated = this.store.getType(existing.code)!;
      this.toast.showSuccess(`${updated.name} updated.`);
      this.saved.emit(updated);
    } else {
      const created = this.store.createType({
        code: this.code.trim().toUpperCase(),
        name: this.name.trim(),
        description: this.description.trim(),
        iconKey: this.iconKey,
        color: this.color,
        category: this.category,
        isActive: this.isActive,
        minTier: this.minTier,
        defaultCapacity: this.defaultCapacity,
        requiresConsent: this.requiresConsent,
        requiresUA: this.requiresUA,
        requiresCourtCompliance: this.requiresCourtCompliance,
        requiresHousing: this.requiresHousing
      });
      this.toast.showSuccess(`Program type "${created.name}" created.`);
      this.saved.emit(created);
    }
    this.close.emit();
  }
}
