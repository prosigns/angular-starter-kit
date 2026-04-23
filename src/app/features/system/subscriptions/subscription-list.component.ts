import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { SaStatCardComponent } from '../dashboard/sa-stat-card.component';
import { IDonutSlice, SaDonutChartComponent } from './sa-donut-chart.component';
import {
  IStackedAreaData,
  SaStackedAreaChartComponent
} from './sa-stacked-area-chart.component';

type SubTier = 'Trial' | 'Basic' | 'Professional' | 'Enterprise' | 'Government';
type SubStatus = 'Active' | 'Trial' | 'Suspended' | 'Deactivated' | 'Pending';
type BillingStatus = 'Current' | 'Overdue' | 'Grace';
type TabKey = 'all' | 'active' | 'trial' | 'expiring' | 'suspended';

interface ISubscription {
  id: string;
  tenantName: string;
  slug: string;
  tier: SubTier;
  status: SubStatus;
  startDate: string;
  endDate: string;
  monthlyRate: number;
  users: number;
  maxUsers: number;
  clients: number;
  maxClients: number;
  billingStatus: BillingStatus;
  lastPaymentDate: string | null;
}

interface IKebabAction {
  key: string;
  label: string;
  iconPath: string;
  danger?: boolean;
}

const TIER_COLORS: Record<SubTier, string> = {
  Trial: '#94A3B8',
  Basic: '#60A5FA',
  Professional: '#2563EB',
  Enterprise: '#1D4ED8',
  Government: '#1E3A5F'
};

const STATUS_PILLS: Record<SubStatus, string> = {
  Active: 'sa-pill--ok',
  Trial: 'sa-pill--info',
  Suspended: 'sa-pill--danger',
  Deactivated: 'sa-pill--muted',
  Pending: 'sa-pill--warn'
};

const KEBAB_ACTIONS: IKebabAction[] = [
  { key: 'view', label: 'View Details', iconPath: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'edit', label: 'Edit Subscription', iconPath: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z' },
  { key: 'upgrade', label: 'Upgrade Tier', iconPath: 'M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75' },
  { key: 'downgrade', label: 'Downgrade Tier', iconPath: 'M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75' },
  { key: 'extend', label: 'Extend Subscription', iconPath: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 12.75v4.5m-2.25-2.25h4.5' },
  { key: 'suspend', label: 'Suspend', iconPath: 'M15.75 5.25v13.5m-7.5-13.5v13.5', danger: true },
  { key: 'reactivate', label: 'Reactivate', iconPath: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z' },
  { key: 'cancel', label: 'Cancel Subscription', iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z', danger: true },
  { key: 'limits', label: 'Adjust Limits', iconPath: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75' },
  { key: 'reminder', label: 'Send Renewal Reminder', iconPath: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75' },
  { key: 'billing', label: 'View Billing History', iconPath: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' }
];

function actionsFor(status: SubStatus, tier: SubTier): IKebabAction[] {
  const isSuspended = status === 'Suspended';
  const isTrial = tier === 'Trial';
  return KEBAB_ACTIONS.filter(a => {
    if (a.key === 'suspend' && isSuspended) return false;
    if (a.key === 'reactivate' && !isSuspended) return false;
    if (a.key === 'upgrade' && tier === 'Government') return false;
    if (a.key === 'downgrade' && isTrial) return false;
    return true;
  });
}

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterModule,
    SaStatCardComponent,
    SaDonutChartComponent,
    SaStackedAreaChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sl">
      <!-- Header -->
      <header class="sl__header">
        <div>
          <p class="sl__eyebrow">Organization · Tenants</p>
          <h1 class="sl__title">Subscription Management</h1>
          <p class="sl__subtitle">
            View, modify, and monitor all tenant subscriptions across the platform.
          </p>
        </div>
        <div class="sl__header-actions">
          <button type="button" class="sl-btn sl-btn--ghost" (click)="onExport()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          <button type="button" class="sl-btn sl-btn--primary" (click)="onNew()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Subscription
          </button>
        </div>
      </header>

      <!-- KPI cards -->
      <section class="sl__kpi" aria-label="Subscription metrics">
        <app-sa-stat-card
          label="Total Subscriptions"
          [value]="kpi().total"
          accent="#2563eb"
          subtitle="{{ kpi().active }} active · {{ kpi().trial }} trial · {{ kpi().suspended }} suspended"
          iconPath="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
        <app-sa-stat-card
          label="Monthly Recurring Revenue"
          [value]="formatCurrency(kpi().mrr)"
          accent="#059669"
          trend="+$3,500 vs last month"
          trendDirection="up"
          subtitle="Across active subscriptions"
          iconPath="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4"
        />
        <app-sa-stat-card
          label="Annual Run Rate"
          [value]="formatCurrency(kpi().mrr * 12)"
          accent="#7c3aed"
          trend="+8.2% vs last quarter"
          trendDirection="up"
          subtitle="MRR × 12"
          iconPath="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
        <app-sa-stat-card
          label="Expiring in 30 Days"
          [value]="kpi().expiring"
          accent="#d97706"
          [trend]="formatCurrency(kpi().expiringMrr) + '/mo at risk'"
          trendDirection="down"
          subtitle="Click to filter"
          iconPath="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <app-sa-stat-card
          label="Trial → Paid Conversion"
          [value]="kpi().conversionRate + '%'"
          accent="#0891b2"
          trend="last 90 days"
          trendDirection="up"
          subtitle="{{ kpi().converted }} of {{ kpi().totalTrials }} trials converted"
          iconPath="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </section>

      <!-- Charts -->
      <section class="sl__charts" aria-label="Trends">
        <article class="sl-panel">
          <header class="sl-panel__header">
            <div>
              <h2 class="sl-panel__title">Revenue Overview</h2>
              <p class="sl-panel__subtitle">Last 12 months by tier</p>
            </div>
            <span class="sl-chip">12M</span>
          </header>
          <div class="sl-panel__body sl-panel__body--chart">
            <app-sa-stacked-area-chart [data]="revenueSeries" />
          </div>
        </article>

        <article class="sl-panel">
          <header class="sl-panel__header">
            <div>
              <h2 class="sl-panel__title">Tier Distribution</h2>
              <p class="sl-panel__subtitle">Active subscriptions by tier</p>
            </div>
          </header>
          <div class="sl-panel__body sl-panel__body--chart">
            <app-sa-donut-chart [data]="tierDistribution()" centerLabel="Active" />
          </div>
        </article>
      </section>

      <!-- Tabs + filters + table -->
      <article class="sl-panel">
        <!-- Tabs -->
        <div class="sl-tabs" role="tablist">
          @for (t of tabs; track t.key) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === t.key"
              class="sl-tab"
              [class.sl-tab--active]="activeTab() === t.key"
              (click)="setTab(t.key)"
            >
              {{ t.label }}
              <span class="sl-tab__badge sl-tab__badge--{{ t.key }}">{{ tabCounts()[t.key] }}</span>
            </button>
          }
        </div>

        <!-- Filter bar -->
        <div class="sl-filters">
          <label class="sl-filters__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
            <input
              #searchInput
              type="search"
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
              placeholder="Search tenant, slug, or email..."
              aria-label="Search subscriptions"
            />
          </label>
          <select
            class="sl-select"
            [ngModel]="tierFilter()"
            (ngModelChange)="tierFilter.set($event)"
            aria-label="Filter by tier"
          >
            <option value="">All tiers</option>
            @for (tier of tiers; track tier) {
              <option [value]="tier">{{ tier }}</option>
            }
          </select>
          <select
            class="sl-select"
            [ngModel]="statusFilter()"
            (ngModelChange)="statusFilter.set($event)"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            @for (st of statuses; track st) {
              <option [value]="st">{{ st }}</option>
            }
          </select>
          <select
            class="sl-select"
            [ngModel]="sortBy()"
            (ngModelChange)="sortBy.set($event)"
            aria-label="Sort by"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="expiring">Expiring soonest</option>
            <option value="rate-desc">Rate high to low</option>
          </select>
        </div>

        <!-- Table -->
        <div class="sl-table-wrap">
          <table class="sl-table">
            <thead>
              <tr>
                <th scope="col">Tenant</th>
                <th scope="col">Tier</th>
                <th scope="col">Status</th>
                <th scope="col">Start</th>
                <th scope="col">End</th>
                <th scope="col">Days Left</th>
                <th scope="col" class="sl-num">Rate</th>
                <th scope="col">Users</th>
                <th scope="col">Clients</th>
                <th scope="col">Billing</th>
                <th scope="col">Last Payment</th>
                <th scope="col" class="sl-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of pageRows(); track s.id) {
                <tr>
                  <td class="sl-table__primary">
                    <div class="sl-tenant">
                      <span class="sl-tenant__name">{{ s.tenantName }}</span>
                      <span class="sl-tenant__slug">{{ s.slug }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="sl-tier" [style.background]="tierBg(s.tier)" [style.color]="tierText(s.tier)">
                      {{ s.tier }}
                    </span>
                  </td>
                  <td>
                    <span class="sl-pill {{ statusClass(s.status) }}">{{ s.status }}</span>
                  </td>
                  <td class="sl-muted">{{ s.startDate | date: 'mediumDate' }}</td>
                  <td class="sl-muted">{{ s.endDate | date: 'mediumDate' }}</td>
                  <td>
                    @let info = daysLeft(s);
                    <span class="sl-days" [class]="info.cls">{{ info.label }}</span>
                  </td>
                  <td class="sl-num">{{ formatCurrency(s.monthlyRate) }}/mo</td>
                  <td>
                    @let u = usage(s.users, s.maxUsers);
                    <div class="sl-usage">
                      <span class="sl-usage__text">{{ s.users }} / {{ s.maxUsers }}</span>
                      <span class="sl-usage__bar">
                        <span
                          class="sl-usage__fill"
                          [class]="u.cls"
                          [style.width.%]="u.pct"
                        ></span>
                      </span>
                    </div>
                  </td>
                  <td>
                    @let c = usage(s.clients, s.maxClients);
                    <div class="sl-usage">
                      <span class="sl-usage__text">{{ s.clients | number }} / {{ s.maxClients | number }}</span>
                      <span class="sl-usage__bar">
                        <span
                          class="sl-usage__fill"
                          [class]="c.cls"
                          [style.width.%]="c.pct"
                        ></span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="sl-pill {{ billingClass(s.billingStatus) }}">{{ s.billingStatus }}</span>
                  </td>
                  <td class="sl-muted">{{ s.lastPaymentDate ? (s.lastPaymentDate | date: 'mediumDate') : '—' }}</td>
                  <td class="sl-actions-col">
                    <div class="sl-kebab">
                      <button
                        type="button"
                        class="sl-kebab__btn"
                        [attr.aria-haspopup]="'menu'"
                        [attr.aria-expanded]="openKebabId() === s.id"
                        (click)="toggleKebab(s.id, $event)"
                        aria-label="Row actions"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                          <circle cx="12" cy="6" r="1.2" fill="currentColor" />
                          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                          <circle cx="12" cy="18" r="1.2" fill="currentColor" />
                        </svg>
                      </button>
                      @if (openKebabId() === s.id) {
                        <div class="sl-menu" role="menu">
                          @for (a of menuActionsFor(s); track a.key) {
                            <button
                              type="button"
                              role="menuitem"
                              class="sl-menu__item"
                              [class.sl-menu__item--danger]="a.danger"
                              (click)="runAction(a.key, s)"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="a.iconPath" />
                              </svg>
                              {{ a.label }}
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="12" class="sl-empty">No subscriptions match your filters.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="sl-pager">
          <span class="sl-pager__info">
            Showing {{ pagerInfo().from }}–{{ pagerInfo().to }} of {{ pagerInfo().total }}
          </span>
          <div class="sl-pager__controls">
            <button
              type="button"
              class="sl-pager__btn"
              [disabled]="page() === 1"
              (click)="setPage(page() - 1)"
              aria-label="Previous page"
            >
              ‹
            </button>
            <span class="sl-pager__page">{{ page() }} / {{ pageCount() }}</span>
            <button
              type="button"
              class="sl-pager__btn"
              [disabled]="page() === pageCount()"
              (click)="setPage(page() + 1)"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .sl { display: flex; flex-direction: column; gap: 1.25rem; }

      /* Header */
      .sl__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .sl__eyebrow {
        margin: 0;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #64748b;
      }
      .sl__title { margin: 0.25rem 0 0; font-size: 1.375rem; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; }
      .sl__subtitle { margin: 0.375rem 0 0; font-size: 0.8125rem; color: #64748b; }

      .sl__header-actions { display: inline-flex; gap: 0.5rem; }

      .sl-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.875rem;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
      }
      .sl-btn svg { width: 16px; height: 16px; }
      .sl-btn--primary { background: #2563eb; color: #fff; border-color: #2563eb; }
      .sl-btn--primary:hover { background: #1d4ed8; border-color: #1d4ed8; }
      .sl-btn--ghost { background: #ffffff; color: #334155; border-color: #e2e8f0; }
      .sl-btn--ghost:hover { background: #f8fafc; }

      /* KPI grid */
      .sl__kpi {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.875rem;
      }

      /* Charts */
      .sl__charts {
        display: grid;
        grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
        gap: 0.875rem;
        align-items: stretch;
      }
      .sl__charts > .sl-panel { display: flex; flex-direction: column; }
      .sl__charts > .sl-panel > .sl-panel__body { flex: 1; display: flex; }
      .sl__charts > .sl-panel > .sl-panel__body > * { flex: 1; min-width: 0; }

      /* Panels */
      .sl-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: visible;
      }
      .sl-panel__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.125rem 0.75rem;
      }
      .sl-panel__title { margin: 0; font-size: 0.9375rem; font-weight: 600; color: #0f172a; }
      .sl-panel__subtitle { margin: 0.125rem 0 0; font-size: 0.75rem; color: #64748b; }
      .sl-panel__body { padding: 0.5rem 1.125rem 1.125rem; }
      .sl-panel__body--chart { min-height: 300px; }

      .sl-chip {
        display: inline-flex;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.6875rem;
        font-weight: 600;
        color: #475569;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
      }

      /* Tabs */
      .sl-tabs {
        display: flex;
        gap: 0.25rem;
        padding: 0.75rem 1.125rem 0;
        border-bottom: 1px solid #e2e8f0;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
      }
      .sl-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 0.875rem;
        border: 0;
        background: transparent;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        white-space: nowrap;
      }
      .sl-tab:hover { color: #334155; }
      .sl-tab--active { color: #2563eb; border-bottom-color: #2563eb; }
      .sl-tab__badge {
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 0.125rem 0.4rem;
        border-radius: 999px;
        background: #f1f5f9;
        color: #475569;
      }
      .sl-tab__badge--active    { background: #d1fae5; color: #065f46; }
      .sl-tab__badge--trial     { background: #dbeafe; color: #1e40af; }
      .sl-tab__badge--expiring  { background: #fef3c7; color: #92400e; }
      .sl-tab__badge--suspended { background: #fee2e2; color: #7f1d1d; }

      /* Filters */
      .sl-filters {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1.125rem;
        flex-wrap: wrap;
        border-bottom: 1px solid #f1f5f9;
      }
      .sl-filters__search {
        position: relative;
        flex: 1 1 260px;
        min-width: 200px;
      }
      .sl-filters__search svg {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: #94a3b8;
      }
      .sl-filters__search input {
        width: 100%;
        padding: 0.5rem 0.75rem 0.5rem 2rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.8125rem;
        background: #ffffff;
        color: #0f172a;
      }
      .sl-filters__search input:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 0;
        border-color: #2563eb;
      }
      .sl-select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.8125rem;
        background: #ffffff;
        color: #334155;
        min-width: 140px;
      }
      .sl-select:focus-visible { outline: 2px solid #2563eb; outline-offset: 0; border-color: #2563eb; }

      /* Table */
      .sl-table-wrap { overflow: auto; }
      .sl-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
        min-width: 1200px;
      }
      .sl-table thead th {
        position: sticky;
        top: 0;
        background: #f8fafc;
        color: #64748b;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        text-align: left;
        padding: 0.625rem 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        z-index: 1;
      }
      .sl-table tbody td {
        padding: 0.625rem 0.75rem;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        vertical-align: middle;
        white-space: nowrap;
      }
      .sl-table tbody tr:hover td { background: #f8fafc; }
      .sl-table__primary { min-width: 200px; }
      .sl-num { text-align: right; font-variant-numeric: tabular-nums; }
      .sl-muted { color: #64748b; }
      .sl-actions-col { width: 48px; text-align: right; }
      .sl-empty { text-align: center; padding: 2rem; color: #64748b; }

      .sl-tenant { display: flex; flex-direction: column; line-height: 1.25; }
      .sl-tenant__name { font-weight: 600; color: #0f172a; }
      .sl-tenant__slug { font-size: 0.6875rem; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

      .sl-tier {
        display: inline-flex;
        padding: 0.1875rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
      }

      .sl-pill {
        display: inline-flex;
        padding: 0.1875rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
      }
      .sl-pill--ok     { background: #d1fae5; color: #065f46; }
      .sl-pill--info   { background: #dbeafe; color: #1e40af; }
      .sl-pill--warn   { background: #fef3c7; color: #92400e; }
      .sl-pill--danger { background: #fee2e2; color: #7f1d1d; }
      .sl-pill--muted  { background: #f1f5f9; color: #475569; }

      .sl-days { font-weight: 600; font-variant-numeric: tabular-nums; }
      .sl-days--ok    { color: #059669; }
      .sl-days--warn  { color: #d97706; }
      .sl-days--crit  { color: #dc2626; }
      .sl-days--done  { color: #7f1d1d; }
      .sl-days--trial { color: #2563eb; }

      .sl-usage { display: flex; flex-direction: column; gap: 0.25rem; min-width: 110px; }
      .sl-usage__text { font-size: 0.75rem; color: #475569; font-variant-numeric: tabular-nums; }
      .sl-usage__bar { width: 100%; height: 4px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
      .sl-usage__fill { display: block; height: 100%; }
      .sl-usage__fill--ok   { background: #059669; }
      .sl-usage__fill--warn { background: #d97706; }
      .sl-usage__fill--hot  { background: #dc2626; }

      /* Kebab */
      .sl-kebab { position: relative; display: inline-block; }
      .sl-kebab__btn {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;
        color: #64748b;
        border-radius: 6px;
        cursor: pointer;
      }
      .sl-kebab__btn:hover { background: #f1f5f9; color: #0f172a; }
      .sl-kebab__btn svg { width: 18px; height: 18px; }

      .sl-menu {
        position: absolute;
        right: 0;
        top: calc(100% + 4px);
        min-width: 210px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        box-shadow: 0 10px 24px -12px rgba(15, 23, 42, 0.22);
        padding: 0.25rem;
        z-index: 20;
        display: flex;
        flex-direction: column;
      }
      .sl-menu__item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.625rem;
        background: transparent;
        border: 0;
        text-align: left;
        font-size: 0.8125rem;
        color: #334155;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
      }
      .sl-menu__item:hover { background: #f8fafc; color: #0f172a; }
      .sl-menu__item svg { width: 14px; height: 14px; flex-shrink: 0; color: #64748b; }
      .sl-menu__item--danger { color: #b91c1c; }
      .sl-menu__item--danger:hover { background: #fef2f2; color: #991b1b; }
      .sl-menu__item--danger svg { color: #b91c1c; }

      /* Pager */
      .sl-pager {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.125rem;
        border-top: 1px solid #f1f5f9;
        font-size: 0.8125rem;
        color: #475569;
      }
      .sl-pager__controls { display: inline-flex; align-items: center; gap: 0.5rem; }
      .sl-pager__btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #334155;
        cursor: pointer;
        font-size: 0.9rem;
      }
      .sl-pager__btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .sl-pager__page { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }

      /* Responsive */
      @media (max-width: 1439px) {
        .sl__kpi { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .sl__charts { grid-template-columns: minmax(0, 1fr); }
      }
      @media (max-width: 1023px) {
        .sl__kpi { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .sl__kpi { grid-template-columns: minmax(0, 1fr); }
      }
    `
  ]
})
export class SubscriptionListComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly toast = inject(ToastService);

  public readonly tiers: SubTier[] = ['Trial', 'Basic', 'Professional', 'Enterprise', 'Government'];
  public readonly statuses: SubStatus[] = ['Active', 'Trial', 'Suspended', 'Deactivated', 'Pending'];
  public readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'trial', label: 'Trial' },
    { key: 'expiring', label: 'Expiring Soon' },
    { key: 'suspended', label: 'Suspended' }
  ];

  public readonly activeTab = signal<TabKey>('all');
  public readonly search = signal('');
  public readonly tierFilter = signal<string>('');
  public readonly statusFilter = signal<string>('');
  public readonly sortBy = signal<string>('newest');
  public readonly page = signal(1);
  public readonly pageSize = 20;
  public readonly openKebabId = signal<string | null>(null);

  public readonly subscriptions = signal<ISubscription[]>(this.seed());

  public readonly revenueSeries: IStackedAreaData = {
    categories: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { name: 'Basic',        color: '#60A5FA', values: [3200, 3500, 3800, 4000, 4100, 4200, 4300, 4400, 4400, 4450, 4480, 4500] },
      { name: 'Professional', color: '#2563EB', values: [10500, 11000, 12000, 13500, 14500, 15500, 16200, 16800, 17200, 17600, 17850, 18000] },
      { name: 'Enterprise',   color: '#1D4ED8', values: [6000, 6500, 7000, 7500, 8200, 9000, 9800, 10500, 11000, 11400, 11700, 12000] },
      { name: 'Government',   color: '#1E3A5F', values: [2000, 2500, 3200, 4000, 4800, 5500, 6200, 6800, 7200, 7600, 7800, 8000] }
    ]
  };

  public readonly tierDistribution = computed<IDonutSlice[]>(() => {
    const counts = new Map<SubTier, number>();
    for (const s of this.subscriptions()) {
      if (s.status !== 'Active' && s.status !== 'Trial') continue;
      counts.set(s.tier, (counts.get(s.tier) ?? 0) + 1);
    }
    return this.tiers.map(t => ({
      name: t,
      value: counts.get(t) ?? 0,
      color: TIER_COLORS[t]
    }));
  });

  public readonly kpi = computed(() => {
    const all = this.subscriptions();
    const active = all.filter(s => s.status === 'Active').length;
    const trial = all.filter(s => s.status === 'Trial').length;
    const suspended = all.filter(s => s.status === 'Suspended').length;
    const mrr = all
      .filter(s => s.status === 'Active')
      .reduce((sum, s) => sum + s.monthlyRate, 0);
    const now = Date.now();
    const expiringList = all.filter(s => {
      if (s.status !== 'Active') return false;
      const diff = new Date(s.endDate).getTime() - now;
      return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    });
    const expiringMrr = expiringList.reduce((sum, s) => sum + s.monthlyRate, 0);
    const totalTrials = 12;
    const converted = 8;
    return {
      total: all.length,
      active,
      trial,
      suspended,
      mrr,
      expiring: expiringList.length,
      expiringMrr,
      totalTrials,
      converted,
      conversionRate: Math.round((converted / totalTrials) * 100)
    };
  });

  public readonly filtered = computed<ISubscription[]>(() => {
    const q = this.search().trim().toLowerCase();
    const tab = this.activeTab();
    const tier = this.tierFilter();
    const status = this.statusFilter();
    const now = Date.now();

    return this.subscriptions()
      .filter(s => {
        if (q) {
          const hay = `${s.tenantName} ${s.slug}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (tier && s.tier !== tier) return false;
        if (status && s.status !== status) return false;
        if (tab === 'active' && s.status !== 'Active') return false;
        if (tab === 'trial' && s.tier !== 'Trial') return false;
        if (tab === 'suspended' && s.status !== 'Suspended') return false;
        if (tab === 'expiring') {
          if (s.status !== 'Active') return false;
          const diff = new Date(s.endDate).getTime() - now;
          if (!(diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (this.sortBy()) {
          case 'oldest': return +new Date(a.startDate) - +new Date(b.startDate);
          case 'name-asc': return a.tenantName.localeCompare(b.tenantName);
          case 'name-desc': return b.tenantName.localeCompare(a.tenantName);
          case 'expiring': return +new Date(a.endDate) - +new Date(b.endDate);
          case 'rate-desc': return b.monthlyRate - a.monthlyRate;
          case 'newest':
          default: return +new Date(b.startDate) - +new Date(a.startDate);
        }
      });
  });

  public readonly tabCounts = computed(() => {
    const all = this.subscriptions();
    const now = Date.now();
    return {
      all: all.length,
      active: all.filter(s => s.status === 'Active').length,
      trial: all.filter(s => s.tier === 'Trial').length,
      expiring: all.filter(s => {
        if (s.status !== 'Active') return false;
        const diff = new Date(s.endDate).getTime() - now;
        return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
      }).length,
      suspended: all.filter(s => s.status === 'Suspended').length
    };
  });

  public readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
  );

  public readonly pageRows = computed(() => {
    const rows = this.filtered();
    const start = (this.page() - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  });

  public readonly pagerInfo = computed(() => {
    const total = this.filtered().length;
    if (!total) return { from: 0, to: 0, total };
    const from = (this.page() - 1) * this.pageSize + 1;
    const to = Math.min(from + this.pageSize - 1, total);
    return { from, to, total };
  });

  public setTab(tab: TabKey): void {
    this.activeTab.set(tab);
    this.page.set(1);
  }

  public setPage(p: number): void {
    const n = Math.min(Math.max(1, p), this.pageCount());
    this.page.set(n);
  }

  public toggleKebab(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openKebabId.update(current => (current === id ? null : id));
  }

  public menuActionsFor(s: ISubscription): IKebabAction[] {
    return actionsFor(s.status, s.tier);
  }

  public runAction(key: string, s: ISubscription): void {
    this.openKebabId.set(null);
    const action = KEBAB_ACTIONS.find(a => a.key === key);
    if (!action) return;
    this.toast.showInfo(`${action.label}: ${s.tenantName} — coming soon.`);
  }

  public onNew(): void {
    this.toast.showInfo('New Subscription wizard — coming soon.');
  }

  public onExport(): void {
    this.toast.showInfo('Exporting CSV — coming soon.');
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.openKebabId()) return;
    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.openKebabId.set(null);
      return;
    }
    if (target && !(target instanceof HTMLElement)) return;
    const kebab = (target as HTMLElement).closest('.sl-kebab');
    if (!kebab) this.openKebabId.set(null);
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    if (this.openKebabId()) this.openKebabId.set(null);
  }

  public tierBg(tier: SubTier): string {
    return this.hexToTintedBg(TIER_COLORS[tier]);
  }
  public tierText(tier: SubTier): string {
    return TIER_COLORS[tier];
  }
  public statusClass(s: SubStatus): string {
    return STATUS_PILLS[s];
  }
  public billingClass(s: BillingStatus): string {
    switch (s) {
      case 'Current': return 'sl-pill--ok';
      case 'Overdue': return 'sl-pill--danger';
      case 'Grace':   return 'sl-pill--warn';
    }
  }

  public daysLeft(s: ISubscription): { label: string; cls: string } {
    const diff = new Date(s.endDate).getTime() - Date.now();
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    if (s.tier === 'Trial' && s.status === 'Trial') {
      if (days < 0) return { label: `Trial ended`, cls: 'sl-days--done' };
      return { label: `Trial: ${days}d left`, cls: 'sl-days--trial' };
    }
    if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, cls: 'sl-days--done' };
    if (days === 0) return { label: 'Expires today', cls: 'sl-days--crit' };
    if (days <= 30) return { label: `${days}d`, cls: 'sl-days--crit' };
    if (days <= 60) return { label: `${days}d`, cls: 'sl-days--warn' };
    return { label: `${days}d`, cls: 'sl-days--ok' };
  }

  public usage(curr: number, max: number): { pct: number; cls: string } {
    const pct = max > 0 ? Math.min(100, Math.round((curr / max) * 100)) : 0;
    const cls =
      pct >= 96 ? 'sl-usage__fill--hot' :
      pct >= 71 ? 'sl-usage__fill--warn' :
      'sl-usage__fill--ok';
    return { pct, cls };
  }

  public formatCurrency(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 10_000) return `$${Math.round(n).toLocaleString('en-US')}`;
    return `$${n.toLocaleString('en-US')}`;
  }

  private hexToTintedBg(hex: string): string {
    return `color-mix(in srgb, ${hex} 12%, #ffffff)`;
  }

  private seed(): ISubscription[] {
    const today = new Date();
    const daysAhead = (d: number) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + d);
      return dt.toISOString();
    };
    const daysAgo = (d: number) => daysAhead(-d);

    return [
      {
        id: 's1', tenantName: 'Grafton Drug Court', slug: 'grafton-drug-court',
        tier: 'Professional', status: 'Active',
        startDate: daysAgo(98), endDate: daysAhead(267), monthlyRate: 1500,
        users: 32, maxUsers: 50, clients: 187, maxClients: 500,
        billingStatus: 'Current', lastPaymentDate: daysAgo(2)
      },
      {
        id: 's2', tenantName: 'Northwind Care', slug: 'northwind-care',
        tier: 'Enterprise', status: 'Active',
        startDate: daysAgo(210), endDate: daysAhead(155), monthlyRate: 3500,
        users: 128, maxUsers: 150, clients: 1640, maxClients: 2000,
        billingStatus: 'Current', lastPaymentDate: daysAgo(6)
      },
      {
        id: 's3', tenantName: 'Riverside Health', slug: 'riverside-health',
        tier: 'Professional', status: 'Active',
        startDate: daysAgo(45), endDate: daysAhead(320), monthlyRate: 1500,
        users: 41, maxUsers: 50, clients: 240, maxClients: 500,
        billingStatus: 'Overdue', lastPaymentDate: daysAgo(48)
      },
      {
        id: 's4', tenantName: 'Evergreen Home', slug: 'evergreen-home',
        tier: 'Basic', status: 'Active',
        startDate: daysAgo(180), endDate: daysAhead(22), monthlyRate: 500,
        users: 24, maxUsers: 25, clients: 96, maxClients: 100,
        billingStatus: 'Current', lastPaymentDate: daysAgo(3)
      },
      {
        id: 's5', tenantName: 'Harbor Point Home', slug: 'harbor-point-home',
        tier: 'Professional', status: 'Active',
        startDate: daysAgo(15), endDate: daysAhead(350), monthlyRate: 1500,
        users: 18, maxUsers: 50, clients: 72, maxClients: 500,
        billingStatus: 'Current', lastPaymentDate: daysAgo(10)
      },
      {
        id: 's6', tenantName: 'Bright Horizon', slug: 'bright-horizon',
        tier: 'Trial', status: 'Trial',
        startDate: daysAgo(5), endDate: daysAhead(25), monthlyRate: 0,
        users: 4, maxUsers: 10, clients: 12, maxClients: 25,
        billingStatus: 'Current', lastPaymentDate: null
      },
      {
        id: 's7', tenantName: 'Sunset Senior Care', slug: 'sunset-senior-care',
        tier: 'Enterprise', status: 'Active',
        startDate: daysAgo(420), endDate: daysAhead(90), monthlyRate: 3500,
        users: 142, maxUsers: 150, clients: 1820, maxClients: 2000,
        billingStatus: 'Current', lastPaymentDate: daysAgo(5)
      },
      {
        id: 's8', tenantName: 'Meadowbrook Care', slug: 'meadowbrook-care',
        tier: 'Professional', status: 'Suspended',
        startDate: daysAgo(300), endDate: daysAhead(60), monthlyRate: 1500,
        users: 31, maxUsers: 50, clients: 142, maxClients: 500,
        billingStatus: 'Overdue', lastPaymentDate: daysAgo(65)
      },
      {
        id: 's9', tenantName: 'State of NJ — Addictions', slug: 'nj-addictions',
        tier: 'Government', status: 'Active',
        startDate: daysAgo(540), endDate: daysAhead(180), monthlyRate: 8000,
        users: 312, maxUsers: 500, clients: 4200, maxClients: 10000,
        billingStatus: 'Current', lastPaymentDate: daysAgo(12)
      },
      {
        id: 's10', tenantName: 'Pinewood Recovery', slug: 'pinewood-recovery',
        tier: 'Basic', status: 'Active',
        startDate: daysAgo(60), endDate: daysAhead(14), monthlyRate: 500,
        users: 18, maxUsers: 25, clients: 64, maxClients: 100,
        billingStatus: 'Grace', lastPaymentDate: daysAgo(38)
      },
      {
        id: 's11', tenantName: 'Crestwood Wellness', slug: 'crestwood-wellness',
        tier: 'Trial', status: 'Trial',
        startDate: daysAgo(18), endDate: daysAhead(12), monthlyRate: 0,
        users: 8, maxUsers: 10, clients: 22, maxClients: 25,
        billingStatus: 'Current', lastPaymentDate: null
      },
      {
        id: 's12', tenantName: 'Willow Oak Services', slug: 'willow-oak-services',
        tier: 'Professional', status: 'Deactivated',
        startDate: daysAgo(730), endDate: daysAgo(30), monthlyRate: 1500,
        users: 0, maxUsers: 50, clients: 0, maxClients: 500,
        billingStatus: 'Current', lastPaymentDate: daysAgo(45)
      }
    ];
  }
}
