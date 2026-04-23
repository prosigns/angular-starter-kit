import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ITenant, TIER_DEFAULTS, TenantTier, generateSlug } from '../tenant.types';
import { TenantStoreService } from '../tenant-store.service';
import { ModalShellComponent } from './modal-shell.component';

type Step = 1 | 2 | 3 | 4;

interface IFormState {
  name: string;
  slug: string;
  slugManuallyEdited: boolean;
  federalTaxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  tier: TenantTier;
  contractTerm: 'Trial' | 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual';
  autoRenew: boolean;
  monthlyRate: number;
  discountPct: number;
  maxUsers: number;
  maxClients: number;
  maxPrograms: number;
  notes: string;
  welcomeEmail: boolean;
}

@Component({
  selector: 'app-tenant-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      [title]="isEdit() ? 'Edit Tenant' : 'Add New Tenant'"
      [subtitle]="isEdit() ? 'Update tenant profile and configuration' : 'Step ' + step() + ' of 4 — ' + stepLabel()"
      variant="slide-over"
      width="660px"
      (close)="onClose()"
    >
      <!-- Stepper -->
      @if (!isEdit()) {
        <ol class="tf-steps" aria-label="Form progress">
          @for (s of stepDefs; track s.n) {
            <li class="tf-step" [class.tf-step--active]="step() === s.n" [class.tf-step--done]="step() > s.n">
              <span class="tf-step__num">{{ s.n }}</span>
              <span class="tf-step__label">{{ s.label }}</span>
            </li>
          }
        </ol>
      }

      <!-- Step 1: Organization -->
      @if (step() === 1 || isEdit()) {
        <section class="tf-section">
          <h3 class="tf-section__title">Organization Info</h3>
          <div class="tf-grid">
            <label class="tf-field tf-field--full">
              <span>Organization Name <em>*</em></span>
              <input type="text" [(ngModel)]="form.name" (ngModelChange)="onNameChange($event)" [class.tf-input--error]="fieldError('name')" maxlength="256" />
              @if (fieldError('name')) { <small class="tf-err">{{ fieldError('name') }}</small> }
            </label>
            <label class="tf-field tf-field--full">
              <span>Slug <em>*</em></span>
              <input type="text" [(ngModel)]="form.slug" (ngModelChange)="onSlugChange($event)" [class.tf-input--error]="fieldError('slug')" />
              <small class="tf-hint">URL identifier. Auto-generated from name. Must be unique.</small>
              @if (fieldError('slug')) { <small class="tf-err">{{ fieldError('slug') }}</small> }
            </label>
            <label class="tf-field">
              <span>Federal Tax ID</span>
              <input type="text" [(ngModel)]="form.federalTaxId" placeholder="XX-XXXXXXX" />
            </label>
            <label class="tf-field">
              <span>Primary Contact Phone</span>
              <input type="tel" [(ngModel)]="form.contactPhone" placeholder="(603) 555-0100" />
            </label>
            <label class="tf-field">
              <span>Primary Contact Name <em>*</em></span>
              <input type="text" [(ngModel)]="form.contactName" [class.tf-input--error]="fieldError('contactName')" />
              @if (fieldError('contactName')) { <small class="tf-err">{{ fieldError('contactName') }}</small> }
            </label>
            <label class="tf-field">
              <span>Primary Contact Email <em>*</em></span>
              <input type="email" [(ngModel)]="form.contactEmail" [class.tf-input--error]="fieldError('contactEmail')" />
              @if (fieldError('contactEmail')) { <small class="tf-err">{{ fieldError('contactEmail') }}</small> }
            </label>
          </div>
        </section>
      }

      <!-- Step 2: Address -->
      @if (step() === 2 || isEdit()) {
        <section class="tf-section">
          <h3 class="tf-section__title">Address</h3>
          <div class="tf-grid">
            <label class="tf-field tf-field--full">
              <span>Address Line 1 <em>*</em></span>
              <input type="text" [(ngModel)]="form.addressLine1" [class.tf-input--error]="fieldError('addressLine1')" />
              @if (fieldError('addressLine1')) { <small class="tf-err">{{ fieldError('addressLine1') }}</small> }
            </label>
            <label class="tf-field tf-field--full">
              <span>Address Line 2</span>
              <input type="text" [(ngModel)]="form.addressLine2" />
            </label>
            <label class="tf-field">
              <span>City <em>*</em></span>
              <input type="text" [(ngModel)]="form.city" [class.tf-input--error]="fieldError('city')" />
              @if (fieldError('city')) { <small class="tf-err">{{ fieldError('city') }}</small> }
            </label>
            <label class="tf-field">
              <span>State <em>*</em></span>
              <select [(ngModel)]="form.state">
                <option value="NH">New Hampshire</option>
                <option value="VT">Vermont</option>
                <option value="ME">Maine</option>
                <option value="MA">Massachusetts</option>
                <option value="CT">Connecticut</option>
                <option value="RI">Rhode Island</option>
              </select>
            </label>
            <label class="tf-field">
              <span>ZIP Code <em>*</em></span>
              <input type="text" [(ngModel)]="form.zip" maxlength="10" [class.tf-input--error]="fieldError('zip')" />
              @if (fieldError('zip')) { <small class="tf-err">{{ fieldError('zip') }}</small> }
            </label>
          </div>
        </section>
      }

      <!-- Step 3: Subscription (skip on edit) -->
      @if (step() === 3 && !isEdit()) {
        <section class="tf-section">
          <h3 class="tf-section__title">Subscription</h3>
          <div class="tf-tier-grid" role="radiogroup" aria-label="Subscription tier">
            @for (t of tiers; track t) {
              <label class="tf-tier-card" [class.tf-tier-card--active]="form.tier === t">
                <input type="radio" name="tier" [value]="t" [(ngModel)]="form.tier" (ngModelChange)="onTierChange($event)" />
                <span class="tf-tier-card__name">{{ t }}</span>
                <span class="tf-tier-card__rate">
                  @if (TIER_DEFAULTS[t].rate) { \${{ TIER_DEFAULTS[t].rate }}/mo } @else { Free 30-day }
                </span>
                <span class="tf-tier-card__lim">{{ TIER_DEFAULTS[t].users }} users · {{ TIER_DEFAULTS[t].clients }} clients</span>
              </label>
            }
          </div>

          <div class="tf-grid tf-grid--m-top">
            <label class="tf-field">
              <span>Contract Term</span>
              <select [(ngModel)]="form.contractTerm">
                <option value="Trial">Trial (30 days)</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="SemiAnnual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </label>
            <label class="tf-field">
              <span>Monthly Rate (USD)</span>
              <input type="number" min="0" [(ngModel)]="form.monthlyRate" [disabled]="form.tier === 'Trial'" />
            </label>
            <label class="tf-field">
              <span>Discount %</span>
              <input type="number" min="0" max="50" [(ngModel)]="form.discountPct" />
            </label>
            <label class="tf-field tf-field--toggle">
              <input type="checkbox" [(ngModel)]="form.autoRenew" [disabled]="form.tier === 'Trial'" />
              <span>Auto-renew at term end</span>
            </label>
            <label class="tf-field">
              <span>Max Users</span>
              <input type="number" min="1" [(ngModel)]="form.maxUsers" />
            </label>
            <label class="tf-field">
              <span>Max Clients</span>
              <input type="number" min="1" [(ngModel)]="form.maxClients" />
            </label>
            <label class="tf-field">
              <span>Max Programs</span>
              <input type="number" min="1" [(ngModel)]="form.maxPrograms" />
            </label>
          </div>
        </section>
      }

      <!-- Step 4: Review (skip on edit) -->
      @if (step() === 4 && !isEdit()) {
        <section class="tf-section">
          <h3 class="tf-section__title">Review & Confirm</h3>
          <dl class="tf-review">
            <dt>Organization</dt><dd>{{ form.name }} <code>{{ form.slug }}</code></dd>
            <dt>Primary Contact</dt><dd>{{ form.contactName }} · {{ form.contactEmail }}</dd>
            <dt>Address</dt><dd>{{ form.addressLine1 }}, {{ form.city }}, {{ form.state }} {{ form.zip }}</dd>
            <dt>Tier</dt><dd>{{ form.tier }} ({{ form.contractTerm }})</dd>
            <dt>Limits</dt><dd>{{ form.maxUsers }} users · {{ form.maxClients }} clients · {{ form.maxPrograms }} programs</dd>
            <dt>Rate</dt><dd>\${{ form.monthlyRate }}/mo · auto-renew {{ form.autoRenew ? 'on' : 'off' }}</dd>
          </dl>
          <label class="tf-field tf-field--toggle">
            <input type="checkbox" [(ngModel)]="form.welcomeEmail" />
            <span>Send welcome email to primary contact</span>
          </label>
          <label class="tf-field tf-field--full">
            <span>Internal Notes (admin-only)</span>
            <textarea rows="3" [(ngModel)]="form.notes"></textarea>
          </label>
        </section>
      }

      <!-- Footer buttons -->
      <ng-container slot="footer">
        <button type="button" class="tf-btn tf-btn--ghost" (click)="onClose()">Cancel</button>
        @if (!isEdit()) {
          @if (step() > 1) {
            <button type="button" class="tf-btn tf-btn--ghost" (click)="back()">Back</button>
          }
          @if (step() < 4) {
            <button type="button" class="tf-btn tf-btn--primary" (click)="next()" [disabled]="!canAdvance()">Continue</button>
          } @else {
            <button type="button" class="tf-btn tf-btn--primary" (click)="submit()" [disabled]="!canAdvance()">Create & Activate</button>
          }
        } @else {
          <button type="button" class="tf-btn tf-btn--primary" (click)="submit()" [disabled]="!isValidAll()">Save Changes</button>
        }
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }

      /* Stepper */
      .tf-steps {
        display: flex;
        gap: 0.5rem;
        list-style: none;
        padding: 0;
        margin: 0 0 1.25rem;
      }
      .tf-step {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.625rem;
        border-radius: 6px;
        background: #f1f5f9;
        color: #64748b;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .tf-step--active { background: #dbeafe; color: #1e40af; }
      .tf-step--done { background: #dcfce7; color: #166534; }
      .tf-step__num {
        width: 20px; height: 20px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: white;
        font-size: 0.6875rem;
        font-weight: 700;
      }

      .tf-section + .tf-section { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #f1f5f9; }
      .tf-section__title { margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 700; color: #0f172a; }

      .tf-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }
      .tf-grid--m-top { margin-top: 1rem; }
      .tf-field { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #475569; }
      .tf-field--full { grid-column: 1 / -1; }
      .tf-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; }
      .tf-field > span > em { color: #dc2626; font-style: normal; }
      .tf-field input[type="text"],
      .tf-field input[type="email"],
      .tf-field input[type="tel"],
      .tf-field input[type="number"],
      .tf-field select,
      .tf-field textarea {
        padding: 0.5rem 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.8125rem;
        color: #0f172a;
        background: white;
        outline: none;
        font-family: inherit;
      }
      .tf-field input:focus,
      .tf-field select:focus,
      .tf-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .tf-input--error { border-color: #ef4444 !important; }
      .tf-hint { color: #94a3b8; font-size: 0.6875rem; }
      .tf-err { color: #dc2626; font-size: 0.6875rem; }

      .tf-tier-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.5rem;
      }
      @media (max-width: 720px) { .tf-tier-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      .tf-tier-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.625rem;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        position: relative;
        text-align: left;
      }
      .tf-tier-card input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
      .tf-tier-card--active { border-color: #2563eb; background: #eff6ff; }
      .tf-tier-card__name { font-size: 0.8125rem; font-weight: 700; color: #0f172a; }
      .tf-tier-card__rate { font-size: 0.75rem; color: #2563eb; font-weight: 600; }
      .tf-tier-card__lim { font-size: 0.6875rem; color: #64748b; }

      .tf-review {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.375rem 1rem;
        padding: 0.75rem 0.875rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.8125rem;
      }
      .tf-review dt { color: #64748b; font-weight: 600; font-size: 0.75rem; }
      .tf-review dd { margin: 0; color: #0f172a; }
      .tf-review code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.6875rem; color: #64748b; background: #e2e8f0; padding: 0.05rem 0.3rem; border-radius: 3px; }

      .tf-btn {
        padding: 0.5rem 0.875rem;
        border-radius: 6px;
        border: 1px solid transparent;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
      }
      .tf-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .tf-btn--ghost:hover { background: #f8fafc; }
      .tf-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .tf-btn--primary:hover:not(:disabled) { background: #1d4ed8; }
      .tf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class TenantFormModalComponent implements OnInit {
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly tenant = input<ITenant | null>(null);

  @Output() public close = new EventEmitter<void>();
  @Output() public saved = new EventEmitter<ITenant>();

  public readonly TIER_DEFAULTS = TIER_DEFAULTS;
  public readonly step = signal<Step>(1);
  public readonly tiers: TenantTier[] = ['Trial', 'Basic', 'Professional', 'Enterprise', 'Government'];
  public readonly stepDefs = [
    { n: 1 as Step, label: 'Organization' },
    { n: 2 as Step, label: 'Address' },
    { n: 3 as Step, label: 'Subscription' },
    { n: 4 as Step, label: 'Review' }
  ];

  public form: IFormState = {
    name: '', slug: '', slugManuallyEdited: false, federalTaxId: '', contactName: '', contactEmail: '', contactPhone: '',
    addressLine1: '', addressLine2: '', city: '', state: 'NH', zip: '',
    tier: 'Professional', contractTerm: 'Annual', autoRenew: true, monthlyRate: TIER_DEFAULTS['Professional'].rate, discountPct: 0,
    maxUsers: TIER_DEFAULTS['Professional'].users, maxClients: TIER_DEFAULTS['Professional'].clients, maxPrograms: TIER_DEFAULTS['Professional'].programs,
    notes: '', welcomeEmail: true
  };

  public readonly isEdit = computed(() => !!this.tenant());

  public ngOnInit(): void {
    const t = this.tenant();
    if (t) {
      this.form = {
        name: t.name,
        slug: t.slug,
        slugManuallyEdited: true,
        federalTaxId: t.federalTaxId ?? '',
        contactName: t.contactName,
        contactEmail: t.contactEmail,
        contactPhone: t.contactPhone ?? '',
        addressLine1: t.addressLine1 ?? '',
        addressLine2: t.addressLine2 ?? '',
        city: t.city,
        state: t.state,
        zip: t.zip ?? '',
        tier: t.tier,
        contractTerm: t.contractTerm ?? 'Annual',
        autoRenew: t.autoRenew ?? true,
        monthlyRate: t.monthlyRate ?? 0,
        discountPct: t.discountPct ?? 0,
        maxUsers: t.maxUsers,
        maxClients: t.maxClients,
        maxPrograms: t.maxPrograms ?? TIER_DEFAULTS[t.tier].programs,
        notes: t.notes ?? '',
        welcomeEmail: false
      };
    }
  }

  public stepLabel(): string {
    return this.stepDefs.find(s => s.n === this.step())?.label ?? '';
  }

  public onNameChange(value: string): void {
    this.form.name = value;
    if (!this.form.slugManuallyEdited && !this.isEdit()) {
      this.form.slug = generateSlug(value);
    }
  }

  public onSlugChange(value: string): void {
    this.form.slug = generateSlug(value);
    this.form.slugManuallyEdited = true;
  }

  public onTierChange(tier: TenantTier): void {
    const d = TIER_DEFAULTS[tier];
    this.form.monthlyRate = d.rate;
    this.form.maxUsers = d.users;
    this.form.maxClients = d.clients;
    this.form.maxPrograms = d.programs;
    if (tier === 'Trial') {
      this.form.contractTerm = 'Trial';
      this.form.autoRenew = false;
    }
  }

  public fieldError(field: keyof IFormState): string | null {
    switch (field) {
      case 'name':
        if (!this.form.name.trim()) return 'Required';
        if (this.form.name.trim().length < 3) return 'Min 3 characters';
        return null;
      case 'slug': {
        if (!this.form.slug.trim()) return 'Required';
        if (!this.store.isSlugAvailable(this.form.slug, this.tenant()?.id)) return 'Slug already in use';
        return null;
      }
      case 'contactName':
        return this.form.contactName.trim() ? null : 'Required';
      case 'contactEmail':
        if (!this.form.contactEmail.trim()) return 'Required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.contactEmail)) return 'Invalid email';
        return null;
      case 'addressLine1':
        return this.form.addressLine1.trim() ? null : 'Required';
      case 'city':
        return this.form.city.trim() ? null : 'Required';
      case 'zip':
        if (!this.form.zip.trim()) return 'Required';
        if (!/^\d{5}(-?\d{4})?$/.test(this.form.zip)) return 'Invalid ZIP';
        return null;
    }
    return null;
  }

  public isStepValid(step: Step): boolean {
    if (step === 1) return !this.fieldError('name') && !this.fieldError('slug') && !this.fieldError('contactName') && !this.fieldError('contactEmail');
    if (step === 2) return !this.fieldError('addressLine1') && !this.fieldError('city') && !this.fieldError('zip');
    if (step === 3) return this.form.maxUsers > 0 && this.form.maxClients > 0 && this.form.maxPrograms > 0;
    return true;
  }

  public isValidAll(): boolean {
    return this.isStepValid(1) && this.isStepValid(2) && this.isStepValid(3);
  }

  public canAdvance(): boolean {
    return this.isStepValid(this.step());
  }

  public next(): void {
    if (!this.canAdvance()) return;
    this.step.update(s => Math.min(4, (s + 1) as Step) as Step);
  }

  public back(): void {
    this.step.update(s => Math.max(1, (s - 1) as Step) as Step);
  }

  public submit(): void {
    if (!this.isValidAll()) return;
    const existing = this.tenant();
    if (existing) {
      this.store.update(existing.id, {
        name: this.form.name,
        slug: this.form.slug,
        federalTaxId: this.form.federalTaxId || undefined,
        contactName: this.form.contactName,
        contactEmail: this.form.contactEmail,
        contactPhone: this.form.contactPhone || undefined,
        addressLine1: this.form.addressLine1,
        addressLine2: this.form.addressLine2 || undefined,
        city: this.form.city,
        state: this.form.state,
        zip: this.form.zip,
        notes: this.form.notes || undefined
      });
      this.toast.showSuccess(`Saved changes to ${this.form.name}.`);
      const updated = this.store.tenants().find(t => t.id === existing.id);
      if (updated) this.saved.emit(updated);
    } else {
      const created = this.store.create({
        name: this.form.name,
        slug: this.form.slug,
        federalTaxId: this.form.federalTaxId || undefined,
        contactName: this.form.contactName,
        contactEmail: this.form.contactEmail,
        contactPhone: this.form.contactPhone || undefined,
        addressLine1: this.form.addressLine1,
        addressLine2: this.form.addressLine2 || undefined,
        city: this.form.city,
        state: this.form.state,
        zip: this.form.zip,
        tier: this.form.tier,
        contractTerm: this.form.contractTerm,
        autoRenew: this.form.autoRenew,
        monthlyRate: this.form.monthlyRate,
        discountPct: this.form.discountPct,
        maxUsers: this.form.maxUsers,
        maxClients: this.form.maxClients,
        maxPrograms: this.form.maxPrograms,
        notes: this.form.notes || undefined
      });
      this.toast.showSuccess(`${created.name} created. Pending activation.`);
      this.saved.emit(created);
    }
    this.close.emit();
  }

  public onClose(): void {
    this.close.emit();
  }
}
