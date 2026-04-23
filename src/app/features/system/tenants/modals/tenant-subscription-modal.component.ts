import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { ITenant, TIER_DEFAULTS, TenantTier } from '../tenant.types';
import { TenantStoreService } from '../tenant-store.service';
import { ModalShellComponent } from './modal-shell.component';

type ContractTerm = 'Trial' | 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual';

interface IForm {
  tier: TenantTier;
  contractTerm: ContractTerm;
  monthlyRate: number;
  discountPct: number;
  maxUsers: number;
  maxClients: number;
  maxPrograms: number;
  subscriptionStarts: string;
  subscriptionEnds: string;
  autoRenew: boolean;
  reason: string;
}

@Component({
  selector: 'app-tenant-subscription-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalShellComponent],
  template: `
    <app-modal-shell
      title="Change Subscription"
      [subtitle]="'Update plan, term, and limits for ' + tenant().name"
      variant="slide-over"
      width="640px"
      (close)="close.emit()"
    >
      <!-- Current vs New comparison -->
      <section class="ts-compare">
        <div class="ts-compare__col">
          <p class="ts-compare__label">Current Plan</p>
          <div class="ts-compare__card ts-compare__card--current">
            <p class="ts-tier-name">{{ tenant().tier }}</p>
            <p class="ts-tier-price">\${{ (tenant().monthlyRate ?? 0) | number }}<span>/mo</span></p>
            <ul class="ts-tier-limits">
              <li>{{ tenant().maxUsers }} users</li>
              <li>{{ tenant().maxClients }} clients</li>
              <li>{{ tenant().maxPrograms ?? TIER_DEFAULTS[tenant().tier].programs }} programs</li>
            </ul>
          </div>
        </div>
        <div class="ts-compare__arrow" aria-hidden="true">→</div>
        <div class="ts-compare__col">
          <p class="ts-compare__label">New Plan</p>
          <div
            class="ts-compare__card ts-compare__card--new"
            [class.ts-compare__card--upgrade]="isUpgrade()"
            [class.ts-compare__card--downgrade]="isDowngrade()"
          >
            <p class="ts-tier-name">{{ form().tier }}</p>
            <p class="ts-tier-price">\${{ effectiveRate() | number }}<span>/mo</span></p>
            <ul class="ts-tier-limits">
              <li>{{ form().maxUsers }} users</li>
              <li>{{ form().maxClients }} clients</li>
              <li>{{ form().maxPrograms }} programs</li>
            </ul>
            @if (isUpgrade()) { <span class="ts-flag ts-flag--up">Upgrade</span> }
            @if (isDowngrade()) { <span class="ts-flag ts-flag--down">Downgrade</span> }
          </div>
        </div>
      </section>

      <!-- Downgrade warning -->
      @if (overages().length) {
        <aside class="ts-warn" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p class="ts-warn__title">Downgrade conflicts with current usage</p>
            <ul>
              @for (o of overages(); track o.label) {
                <li>{{ o.label }}: <strong>{{ o.current }}</strong> currently, new cap <strong>{{ o.limit }}</strong></li>
              }
            </ul>
            <p class="ts-warn__hint">Either increase limits manually below, or offboard resources first.</p>
          </div>
        </aside>
      }

      <!-- Tier picker -->
      <h4 class="ts-section">Plan</h4>
      <div class="ts-tiers">
        @for (t of tiers; track t) {
          <label class="ts-tier-card" [class.ts-tier-card--active]="form().tier === t">
            <input type="radio" [value]="t" [ngModel]="form().tier" (ngModelChange)="setTier($event)" name="tier" />
            <div class="ts-tier-card__body">
              <p class="ts-tier-card__name">{{ t }}</p>
              <p class="ts-tier-card__price">\${{ TIER_DEFAULTS[t].rate | number }}<span>/mo</span></p>
              <p class="ts-tier-card__hint">{{ TIER_DEFAULTS[t].users }}u · {{ TIER_DEFAULTS[t].clients }}c</p>
            </div>
          </label>
        }
      </div>

      <!-- Term and dates -->
      <h4 class="ts-section">Term &amp; Billing</h4>
      <div class="ts-grid-2">
        <label class="ts-field">
          <span>Contract term</span>
          <select [ngModel]="form().contractTerm" (ngModelChange)="patch({ contractTerm: $event })">
            <option value="Trial">Trial (30 days)</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="SemiAnnual">Semi-annual</option>
            <option value="Annual">Annual</option>
          </select>
        </label>
        <label class="ts-field ts-field--toggle">
          <input type="checkbox" [ngModel]="form().autoRenew" (ngModelChange)="patch({ autoRenew: $event })" />
          <span>Auto-renew at end of term</span>
        </label>
        <label class="ts-field">
          <span>Start date</span>
          <input type="date" [ngModel]="form().subscriptionStarts" (ngModelChange)="patch({ subscriptionStarts: $event })" />
        </label>
        <label class="ts-field">
          <span>End date</span>
          <input type="date" [ngModel]="form().subscriptionEnds" (ngModelChange)="patch({ subscriptionEnds: $event })" />
        </label>
      </div>

      <!-- Rate and discount -->
      <h4 class="ts-section">Pricing</h4>
      <div class="ts-grid-2">
        <label class="ts-field">
          <span>Monthly rate (USD)</span>
          <input type="number" min="0" step="1" [ngModel]="form().monthlyRate" (ngModelChange)="patch({ monthlyRate: +$event })" />
        </label>
        <label class="ts-field">
          <span>Discount % <em>(0–100)</em></span>
          <input type="number" min="0" max="100" step="1" [ngModel]="form().discountPct" (ngModelChange)="patch({ discountPct: +$event })" />
        </label>
      </div>
      <p class="ts-effective">
        Effective monthly charge:
        <strong>\${{ effectiveRate() | number }}</strong>
        @if (form().discountPct > 0) { <span class="ts-muted">after {{ form().discountPct }}% discount</span> }
      </p>

      <!-- Limits -->
      <h4 class="ts-section">Limits</h4>
      <p class="ts-hint">Defaults come from the selected tier — adjust if you need a custom plan.</p>
      <div class="ts-grid-3">
        <label class="ts-field">
          <span>Max users</span>
          <input type="number" min="1" [ngModel]="form().maxUsers" (ngModelChange)="patch({ maxUsers: +$event })" />
        </label>
        <label class="ts-field">
          <span>Max clients</span>
          <input type="number" min="1" [ngModel]="form().maxClients" (ngModelChange)="patch({ maxClients: +$event })" />
        </label>
        <label class="ts-field">
          <span>Max programs</span>
          <input type="number" min="1" [ngModel]="form().maxPrograms" (ngModelChange)="patch({ maxPrograms: +$event })" />
        </label>
      </div>

      <!-- Audit reason -->
      <h4 class="ts-section">Reason</h4>
      <label class="ts-field">
        <span>Reason for change <em>*</em></span>
        <textarea rows="2" [ngModel]="form().reason" (ngModelChange)="patch({ reason: $event })" placeholder="Required for audit log…"></textarea>
      </label>

      <ng-container slot="footer">
        <button type="button" class="ts-btn ts-btn--ghost" (click)="close.emit()">Cancel</button>
        <button
          type="button"
          class="ts-btn ts-btn--primary"
          [disabled]="!canSubmit()"
          (click)="submit()"
        >Apply Changes</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [
    `
      :host { display: contents; }
      .ts-compare { display: grid; grid-template-columns: 1fr auto 1fr; gap: 0.75rem; align-items: stretch; margin-bottom: 1rem; }
      .ts-compare__col { display: flex; flex-direction: column; gap: 0.25rem; }
      .ts-compare__label { margin: 0; font-size: 0.625rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .ts-compare__card { position: relative; padding: 0.875rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; min-height: 100%; }
      .ts-compare__card--current { background: #f1f5f9; }
      .ts-compare__card--upgrade { border-color: #86efac; background: #f0fdf4; }
      .ts-compare__card--downgrade { border-color: #fca5a5; background: #fef2f2; }
      .ts-compare__arrow { display: flex; align-items: center; color: #94a3b8; font-size: 1.25rem; font-weight: 300; }
      .ts-tier-name { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #0f172a; }
      .ts-tier-price { margin: 0.25rem 0 0.5rem; font-size: 1.125rem; font-weight: 800; color: #0f172a; }
      .ts-tier-price span { font-size: 0.75rem; font-weight: 500; color: #64748b; margin-left: 0.125rem; }
      .ts-tier-limits { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.125rem; font-size: 0.75rem; color: #475569; }
      .ts-flag { position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.625rem; font-weight: 700; padding: 0.1rem 0.375rem; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em; }
      .ts-flag--up { background: #dcfce7; color: #166534; }
      .ts-flag--down { background: #fee2e2; color: #991b1b; }

      .ts-warn { display: flex; gap: 0.625rem; padding: 0.75rem 0.875rem; margin-bottom: 1rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; }
      .ts-warn svg { flex: 0 0 auto; margin-top: 0.125rem; }
      .ts-warn__title { margin: 0 0 0.25rem; font-size: 0.8125rem; font-weight: 700; }
      .ts-warn ul { margin: 0; padding-left: 1.125rem; font-size: 0.75rem; line-height: 1.5; }
      .ts-warn__hint { margin: 0.375rem 0 0; font-size: 0.75rem; color: #78350f; }

      .ts-section { margin: 1rem 0 0.5rem; font-size: 0.75rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
      .ts-hint { margin: -0.25rem 0 0.5rem; font-size: 0.75rem; color: #64748b; }

      .ts-tiers { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.5rem; }
      .ts-tier-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.625rem; background: white; cursor: pointer; transition: all 0.12s; position: relative; }
      .ts-tier-card input { position: absolute; opacity: 0; pointer-events: none; }
      .ts-tier-card:hover { border-color: #cbd5e1; }
      .ts-tier-card--active { border-color: #2563eb; background: #eff6ff; box-shadow: 0 0 0 3px #dbeafe; }
      .ts-tier-card__name { margin: 0; font-size: 0.8125rem; font-weight: 700; color: #0f172a; }
      .ts-tier-card__price { margin: 0.125rem 0 0; font-size: 0.875rem; font-weight: 800; color: #0f172a; }
      .ts-tier-card__price span { font-size: 0.625rem; color: #64748b; font-weight: 500; margin-left: 0.125rem; }
      .ts-tier-card__hint { margin: 0.125rem 0 0; font-size: 0.6875rem; color: #64748b; }

      .ts-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
      .ts-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
      .ts-field { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #475569; margin-bottom: 0.5rem; }
      .ts-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; }
      .ts-field > span > em { color: #dc2626; font-style: normal; }
      .ts-field input[type="text"], .ts-field input[type="number"], .ts-field input[type="date"], .ts-field select, .ts-field textarea {
        padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #0f172a; outline: none; font-family: inherit; background: white;
      }
      .ts-field input:focus, .ts-field select:focus, .ts-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }

      .ts-effective { margin: 0.25rem 0 0.5rem; font-size: 0.8125rem; color: #0f172a; }
      .ts-muted { color: #64748b; margin-left: 0.375rem; font-size: 0.75rem; }

      .ts-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .ts-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .ts-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .ts-btn--primary:hover:not(:disabled) { background: #1d4ed8; }
      .ts-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class TenantSubscriptionModalComponent {
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly tenant = input.required<ITenant>();

  @Output() public close = new EventEmitter<void>();

  public readonly TIER_DEFAULTS = TIER_DEFAULTS;
  public readonly tiers: TenantTier[] = ['Trial', 'Basic', 'Professional', 'Enterprise', 'Government'];

  public readonly form = signal<IForm>({
    tier: 'Professional',
    contractTerm: 'Annual',
    monthlyRate: 0,
    discountPct: 0,
    maxUsers: 0,
    maxClients: 0,
    maxPrograms: 0,
    subscriptionStarts: '',
    subscriptionEnds: '',
    autoRenew: true,
    reason: ''
  });

  private readonly tierRank: Record<TenantTier, number> = {
    Trial: 0, Basic: 1, Professional: 2, Enterprise: 3, Government: 4
  };

  constructor() {
    queueMicrotask(() => this.hydrateFromTenant());
  }

  private hydrateFromTenant(): void {
    const t = this.tenant();
    const defaults = TIER_DEFAULTS[t.tier];
    this.form.set({
      tier: t.tier,
      contractTerm: t.contractTerm ?? 'Annual',
      monthlyRate: t.monthlyRate ?? defaults.rate,
      discountPct: t.discountPct ?? 0,
      maxUsers: t.maxUsers,
      maxClients: t.maxClients,
      maxPrograms: t.maxPrograms ?? defaults.programs,
      subscriptionStarts: t.subscriptionStarts ?? new Date().toISOString().slice(0, 10),
      subscriptionEnds: t.subscriptionEnds,
      autoRenew: t.autoRenew ?? true,
      reason: ''
    });
  }

  public patch(p: Partial<IForm>): void {
    this.form.update(f => ({ ...f, ...p }));
  }

  public setTier(tier: TenantTier): void {
    const d = TIER_DEFAULTS[tier];
    this.form.update(f => ({
      ...f,
      tier,
      monthlyRate: d.rate,
      maxUsers: d.users,
      maxClients: d.clients,
      maxPrograms: d.programs,
      contractTerm: tier === 'Trial' ? 'Trial' : (f.contractTerm === 'Trial' ? 'Annual' : f.contractTerm),
      autoRenew: tier === 'Trial' ? false : f.autoRenew
    }));
  }

  public readonly effectiveRate = computed(() => {
    const f = this.form();
    const discount = Math.max(0, Math.min(100, f.discountPct));
    return Math.round(f.monthlyRate * (1 - discount / 100));
  });

  public readonly isUpgrade = computed(() =>
    this.tierRank[this.form().tier] > this.tierRank[this.tenant().tier]
  );

  public readonly isDowngrade = computed(() =>
    this.tierRank[this.form().tier] < this.tierRank[this.tenant().tier]
  );

  public readonly overages = computed(() => {
    const t = this.tenant();
    const f = this.form();
    const out: { label: string; current: number; limit: number }[] = [];
    if (f.maxUsers < t.users) out.push({ label: 'Users', current: t.users, limit: f.maxUsers });
    if (f.maxClients < t.clients) out.push({ label: 'Clients', current: t.clients, limit: f.maxClients });
    if (f.maxPrograms < t.programs) out.push({ label: 'Programs', current: t.programs, limit: f.maxPrograms });
    return out;
  });

  public canSubmit(): boolean {
    const f = this.form();
    return !!f.reason.trim()
      && f.monthlyRate >= 0
      && f.discountPct >= 0 && f.discountPct <= 100
      && f.maxUsers > 0 && f.maxClients > 0 && f.maxPrograms > 0
      && !!f.subscriptionStarts && !!f.subscriptionEnds
      && f.subscriptionEnds >= f.subscriptionStarts;
  }

  public submit(): void {
    if (!this.canSubmit()) return;
    const t = this.tenant();
    const f = this.form();
    this.store.update(t.id, {
      tier: f.tier,
      contractTerm: f.contractTerm,
      monthlyRate: f.monthlyRate,
      discountPct: f.discountPct,
      maxUsers: f.maxUsers,
      maxClients: f.maxClients,
      maxPrograms: f.maxPrograms,
      subscriptionStarts: f.subscriptionStarts,
      subscriptionEnds: f.subscriptionEnds,
      autoRenew: f.autoRenew
    });
    const delta = this.isUpgrade() ? 'upgraded' : this.isDowngrade() ? 'downgraded' : 'updated';
    this.toast.showSuccess(`${t.name} subscription ${delta} to ${f.tier}.`);
    this.close.emit();
  }
}
