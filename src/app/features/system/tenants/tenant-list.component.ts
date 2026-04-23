import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { SaStatCardComponent } from '../dashboard/sa-stat-card.component';
import { TenantStoreService } from './tenant-store.service';
import { BillingStatus, ITenant, TenantStatus, TenantTier } from './tenant.types';
import { TenantActivateModalComponent } from './modals/tenant-activate-modal.component';
import { TenantDeactivateModalComponent } from './modals/tenant-deactivate-modal.component';
import { TenantDeleteModalComponent } from './modals/tenant-delete-modal.component';
import { TenantFormModalComponent } from './modals/tenant-form-modal.component';
import { TenantImpersonateModalComponent } from './modals/tenant-impersonate-modal.component';
import { TenantSubscriptionModalComponent } from './modals/tenant-subscription-modal.component';
import { TenantSuspendModalComponent } from './modals/tenant-suspend-modal.component';

type TabKey = 'all' | 'active' | 'trial' | 'pending' | 'suspended' | 'archived';
type ViewMode = 'table' | 'card';
type TenantModalKey = 'create' | 'edit' | 'suspend' | 'activate' | 'deactivate' | 'delete' | 'impersonate' | 'subscription';

interface IKebabAction {
  id: string;
  label: string;
  iconPath: string;
  danger?: boolean;
}

const KEBAB_ACTIONS: readonly IKebabAction[] = [
  { id: 'view', label: 'View Details', iconPath: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'edit', label: 'Edit Tenant', iconPath: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125' },
  { id: 'subscription', label: 'Manage Subscription', iconPath: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
  { id: 'programs', label: 'Manage Programs', iconPath: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z' },
  { id: 'users', label: 'Manage Users', iconPath: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { id: 'features', label: 'Feature Flags', iconPath: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z' },
  { id: 'billing', label: 'View Billing', iconPath: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' },
  { id: 'branding', label: 'Configure Branding', iconPath: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z' },
  { id: 'impersonate', label: 'Impersonate Admin', iconPath: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z' },
  { id: 'extend-trial', label: 'Extend Trial', iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'suspend', label: 'Suspend Tenant', iconPath: 'M15.75 5.25v13.5m-7.5-13.5v13.5', danger: true },
  { id: 'activate', label: 'Activate Tenant', iconPath: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-10.5-3.75l4.72 4.72a.75.75 0 010 1.06l-4.72 4.72' },
  { id: 'deactivate', label: 'Deactivate Tenant', iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z', danger: true },
  { id: 'audit', label: 'View Audit Trail', iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 13.5V9a.75.75 0 00-.75-.75H9.75m-3 0h-.375a1.125 1.125 0 00-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V12m-7.5-3.75h3.75' },
  { id: 'delete', label: 'Delete Tenant', iconPath: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0', danger: true }
];

const TODAY = new Date();

function rel(days: number): string {
  if (days === 0) return 'today';
  const absDays = Math.abs(days);
  const past = days < 0;
  if (absDays < 1) return past ? 'just now' : 'in a moment';
  if (absDays === 1) return past ? 'yesterday' : 'tomorrow';
  if (absDays < 7) return past ? `${absDays}d ago` : `in ${absDays}d`;
  if (absDays < 30) return past ? `${Math.floor(absDays / 7)}w ago` : `in ${Math.floor(absDays / 7)}w`;
  if (absDays < 365) return past ? `${Math.floor(absDays / 30)}mo ago` : `in ${Math.floor(absDays / 30)}mo`;
  return past ? `${Math.floor(absDays / 365)}y ago` : `in ${Math.floor(absDays / 365)}y`;
}

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    SaStatCardComponent,
    TenantFormModalComponent,
    TenantActivateModalComponent,
    TenantSuspendModalComponent,
    TenantDeactivateModalComponent,
    TenantDeleteModalComponent,
    TenantImpersonateModalComponent,
    TenantSubscriptionModalComponent
  ],
  template: `
    <div class="tl">
      <!-- Page header -->
      <header class="tl__header">
        <div>
          <p class="tl__breadcrumb">Admin · Organization · Tenants</p>
          <h1 class="tl__title">All Tenants</h1>
          <p class="tl__subtitle">{{ tenants().length }} tenants across {{ tierCount() }} tiers</p>
        </div>
        <div class="tl__actions">
          <button type="button" class="tl-btn tl-btn--ghost" (click)="stub('Export')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Export
          </button>
          <button type="button" class="tl-btn tl-btn--primary" (click)="openCreate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Tenant
          </button>
        </div>
      </header>

      <!-- KPI cards -->
      <section class="tl__kpis" aria-label="Tenant KPIs">
        <app-sa-stat-card
          label="Total Tenants"
          [value]="kpi().total"
          accent="#2563EB"
          trend="+4 this quarter"
          trendDirection="up"
          iconPath="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18"
        />
        <app-sa-stat-card
          label="Active"
          [value]="kpi().active"
          accent="#059669"
          subtitle="{{ kpi().activePct }}% of total"
          iconPath="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <app-sa-stat-card
          label="In Trial"
          [value]="kpi().trial"
          accent="#0891B2"
          subtitle="{{ kpi().trialExpiring }} expiring this week"
          iconPath="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
        />
        <app-sa-stat-card
          label="Suspended"
          [value]="kpi().suspended"
          accent="#DC2626"
          subtitle="{{ kpi().pendingReview }} pending review"
          iconPath="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <app-sa-stat-card
          label="Total Users"
          [value]="formatNum(kpi().totalUsers)"
          accent="#7C3AED"
          subtitle="Avg {{ kpi().avgUsers }} per tenant"
          iconPath="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
        <app-sa-stat-card
          label="Total Clients"
          [value]="formatNum(kpi().totalClients)"
          accent="#D97706"
          subtitle="Avg {{ kpi().avgClients }} per tenant"
          iconPath="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </section>

      <!-- Panel: tabs + filters + view toggle + table/cards -->
      <article class="tl-panel">
        <!-- Tabs -->
        <div class="tl-tabs" role="tablist">
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === tab.key"
              class="tl-tab"
              [class.tl-tab--active]="activeTab() === tab.key"
              (click)="setTab(tab.key)"
            >
              {{ tab.label }}
              <span class="tl-tab__badge" [class]="'tl-tab__badge--' + tab.key">
                {{ tabCounts()[tab.key] }}
              </span>
            </button>
          }
        </div>

        <!-- Filters -->
        <div class="tl-filters">
          <label class="tl-filters__search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              placeholder="Search name, slug, contact, or city…"
              [(ngModel)]="search"
              (ngModelChange)="onSearch($event)"
              aria-label="Search tenants"
            />
          </label>

          <select class="tl-select" [(ngModel)]="tierFilter" (ngModelChange)="page.set(1)" aria-label="Filter by tier">
            <option value="">All tiers</option>
            <option value="Trial">Trial</option>
            <option value="Basic">Basic</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Government">Government</option>
          </select>

          <select class="tl-select" [(ngModel)]="stateFilter" (ngModelChange)="page.set(1)" aria-label="Filter by state">
            <option value="">All states</option>
            <option value="NH">NH</option>
            <option value="VT">VT</option>
            <option value="ME">ME</option>
            <option value="MA">MA</option>
          </select>

          <select class="tl-select" [(ngModel)]="billingFilter" (ngModelChange)="page.set(1)" aria-label="Filter by billing">
            <option value="">All billing</option>
            <option value="Current">Current</option>
            <option value="Overdue">Overdue</option>
            <option value="Grace">Grace Period</option>
            <option value="N/A">N/A (Trial)</option>
          </select>

          <select class="tl-select" [(ngModel)]="sortKey" (ngModelChange)="page.set(1)" aria-label="Sort by">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="most-users">Most Users</option>
            <option value="most-clients">Most Clients</option>
            <option value="tier">By Tier</option>
          </select>

          @if (hasFilters()) {
            <button type="button" class="tl-filters__clear" (click)="clearFilters()">
              Clear filters
            </button>
          }

          <div class="tl-view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              class="tl-view-btn"
              [class.tl-view-btn--active]="view() === 'table'"
              (click)="view.set('table')"
              aria-label="Table view"
              title="Table view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M12 18.375v-1.5m-1.125 1.125h-7.5m7.5 0c0 .621.504 1.125 1.125 1.125M12 16.875V15m0 1.875c0-.621.504-1.125 1.125-1.125m0 0c.621 0 1.125-.504 1.125-1.125m0 0v-1.5m0 1.5c0 .621.504 1.125 1.125 1.125m0 0h7.5" />
              </svg>
            </button>
            <button
              type="button"
              class="tl-view-btn"
              [class.tl-view-btn--active]="view() === 'card'"
              (click)="view.set('card')"
              aria-label="Card view"
              title="Card view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          </div>
        </div>

        @if (!filtered().length) {
          <div class="tl-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18" />
            </svg>
            <h3 class="tl-empty__title">No tenants match your filters</h3>
            <button type="button" class="tl-filters__clear" (click)="clearFilters()">Clear filters</button>
          </div>
        } @else if (view() === 'table') {
          <!-- Table view -->
          <div class="tl-table-wrap">
            <table class="tl-table">
              <thead>
                <tr>
                  <th class="tl-th--dot" aria-hidden="true"></th>
                  <th>Tenant</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th class="tl-th--num">Programs</th>
                  <th>Users</th>
                  <th>Clients</th>
                  <th>Subscription Ends</th>
                  <th>Billing</th>
                  <th>Last Activity</th>
                  <th class="tl-th--actions" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                @for (t of pageRows(); track t.id) {
                  <tr class="tl-row">
                    <td class="tl-td--dot">
                      <span class="tl-dot" [class]="'tl-dot--' + statusDotClass(t.status)"></span>
                    </td>
                    <td>
                      <div class="tl-tenant">
                        <span class="tl-avatar" [style.background]="avatarBg(t.name)">{{ initials(t.name) }}</span>
                        <div class="tl-tenant__meta">
                          <a href="#" class="tl-tenant__name" (click)="$event.preventDefault(); openDetail(t)">{{ t.name }}</a>
                          <span class="tl-tenant__slug">{{ t.slug }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="tl-muted">{{ t.city }}, {{ t.state }}</td>
                    <td><span class="tl-badge" [class]="'tl-badge--' + statusClass(t.status)">{{ statusLabel(t.status) }}</span></td>
                    <td><span class="tl-tier" [class]="'tl-tier--' + t.tier.toLowerCase()">{{ t.tier }}</span></td>
                    <td class="tl-td--num">{{ t.programs }}</td>
                    <td>
                      <div class="tl-usage">
                        <span class="tl-usage__num">{{ t.users }} / {{ t.maxUsers }}</span>
                        <span class="tl-usage__bar"><span class="tl-usage__fill" [class]="'tl-usage__fill--' + usageClass(t.users, t.maxUsers)" [style.width.%]="usagePct(t.users, t.maxUsers)"></span></span>
                      </div>
                    </td>
                    <td>
                      <div class="tl-usage">
                        <span class="tl-usage__num">{{ t.clients }} / {{ t.maxClients }}</span>
                        <span class="tl-usage__bar"><span class="tl-usage__fill" [class]="'tl-usage__fill--' + usageClass(t.clients, t.maxClients)" [style.width.%]="usagePct(t.clients, t.maxClients)"></span></span>
                      </div>
                    </td>
                    <td>
                      <div class="tl-sub-end">
                        <span>{{ t.subscriptionEnds }}</span>
                        @if (daysLeft(t.subscriptionEnds) !== null) {
                          <span class="tl-sub-end__hint" [class]="'tl-sub-end__hint--' + daysLeftClass(t.subscriptionEnds)">
                            {{ daysLeftLabel(t.subscriptionEnds) }}
                          </span>
                        }
                      </div>
                    </td>
                    <td><span class="tl-pill" [class]="'tl-pill--' + billingClass(t.billingStatus)">{{ t.billingStatus }}</span></td>
                    <td class="tl-muted">{{ t.lastActivity }}</td>
                    <td class="tl-td--actions">
                      <button
                        type="button"
                        class="tl-kebab-btn"
                        [attr.aria-expanded]="kebabOpenFor() === t.id"
                        [attr.aria-label]="'Actions for ' + t.name"
                        (click)="toggleKebab($event, t.id)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.75"/>
                          <circle cx="12" cy="12" r="1.75"/>
                          <circle cx="19" cy="12" r="1.75"/>
                        </svg>
                      </button>
                      @if (kebabOpenFor() === t.id) {
                        <ul class="tl-kebab" role="menu" (click)="$event.stopPropagation()">
                          @for (a of actionsFor(t); track a.id) {
                            <li role="none">
                              <button
                                type="button"
                                role="menuitem"
                                class="tl-kebab__item"
                                [class.tl-kebab__item--danger]="a.danger"
                                (click)="runAction(a, t)"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                  <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="a.iconPath" />
                                </svg>
                                {{ a.label }}
                              </button>
                            </li>
                          }
                        </ul>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <!-- Card view -->
          <div class="tl-cards">
            @for (t of pageRows(); track t.id) {
              <article class="tl-card">
                <header class="tl-card__head">
                  <span class="tl-avatar tl-avatar--lg" [style.background]="avatarBg(t.name)">{{ initials(t.name) }}</span>
                  <div class="tl-card__meta">
                    <a href="#" class="tl-card__name" (click)="$event.preventDefault(); openDetail(t)">{{ t.name }}</a>
                    <span class="tl-card__slug">{{ t.slug }}</span>
                  </div>
                  <button
                    type="button"
                    class="tl-kebab-btn"
                    [attr.aria-expanded]="kebabOpenFor() === t.id"
                    (click)="toggleKebab($event, t.id)"
                    aria-label="Actions"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="5" cy="12" r="1.75"/>
                      <circle cx="12" cy="12" r="1.75"/>
                      <circle cx="19" cy="12" r="1.75"/>
                    </svg>
                  </button>
                  @if (kebabOpenFor() === t.id) {
                    <ul class="tl-kebab tl-kebab--card" role="menu" (click)="$event.stopPropagation()">
                      @for (a of actionsFor(t); track a.id) {
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            class="tl-kebab__item"
                            [class.tl-kebab__item--danger]="a.danger"
                            (click)="runAction(a, t)"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="a.iconPath" />
                            </svg>
                            {{ a.label }}
                          </button>
                        </li>
                      }
                    </ul>
                  }
                </header>

                <div class="tl-card__badges">
                  <span class="tl-badge" [class]="'tl-badge--' + statusClass(t.status)">{{ statusLabel(t.status) }}</span>
                  <span class="tl-tier" [class]="'tl-tier--' + t.tier.toLowerCase()">{{ t.tier }}</span>
                </div>

                <div class="tl-card__contact">
                  <div>
                    <p class="tl-card__label">Contact</p>
                    <p class="tl-card__value">{{ t.contactName }}</p>
                    <p class="tl-card__muted">{{ t.contactEmail }}</p>
                  </div>
                  <div>
                    <p class="tl-card__label">Location</p>
                    <p class="tl-card__value">{{ t.city }}, {{ t.state }}</p>
                  </div>
                </div>

                <div class="tl-card__metrics">
                  <div>
                    <p class="tl-card__label">Programs</p>
                    <p class="tl-card__metric">{{ t.programs }}</p>
                  </div>
                  <div>
                    <p class="tl-card__label">Users</p>
                    <p class="tl-card__metric">{{ t.users }}/{{ t.maxUsers }}</p>
                    <span class="tl-usage__bar"><span class="tl-usage__fill" [class]="'tl-usage__fill--' + usageClass(t.users, t.maxUsers)" [style.width.%]="usagePct(t.users, t.maxUsers)"></span></span>
                  </div>
                  <div>
                    <p class="tl-card__label">Clients</p>
                    <p class="tl-card__metric">{{ t.clients }}/{{ t.maxClients }}</p>
                    <span class="tl-usage__bar"><span class="tl-usage__fill" [class]="'tl-usage__fill--' + usageClass(t.clients, t.maxClients)" [style.width.%]="usagePct(t.clients, t.maxClients)"></span></span>
                  </div>
                </div>

                <footer class="tl-card__foot">
                  <div>
                    <p class="tl-card__label">Subscription ends</p>
                    <p class="tl-card__muted">{{ t.subscriptionEnds }}</p>
                  </div>
                  <span class="tl-pill" [class]="'tl-pill--' + billingClass(t.billingStatus)">{{ t.billingStatus }}</span>
                </footer>
              </article>
            }
          </div>
        }

        <!-- Pagination -->
        @if (filtered().length > pageSize) {
          <div class="tl-pager">
            <span class="tl-pager__info">{{ pagerInfo() }}</span>
            <div class="tl-pager__ctrl">
              <button type="button" class="tl-page-btn" (click)="prevPage()" [disabled]="page() === 1" aria-label="Previous page">‹</button>
              <span class="tl-pager__num">Page {{ page() }} of {{ pageCount() }}</span>
              <button type="button" class="tl-page-btn" (click)="nextPage()" [disabled]="page() === pageCount()" aria-label="Next page">›</button>
            </div>
          </div>
        }
      </article>
    </div>

    @if (activeModal() === 'create') {
      <app-tenant-form-modal (close)="closeModal()" />
    }
    @if (currentTenant(); as t) {
      @switch (activeModal()) {
        @case ('edit') {
          <app-tenant-form-modal [tenant]="t" (close)="closeModal()" />
        }
        @case ('activate') {
          <app-tenant-activate-modal [tenant]="t" (close)="closeModal()" />
        }
        @case ('suspend') {
          <app-tenant-suspend-modal [tenant]="t" (close)="closeModal()" />
        }
        @case ('deactivate') {
          <app-tenant-deactivate-modal [tenant]="t" (close)="closeModal()" />
        }
        @case ('delete') {
          <app-tenant-delete-modal [tenant]="t" (close)="closeModal()" />
        }
        @case ('impersonate') {
          <app-tenant-impersonate-modal [tenant]="t" (close)="closeModal()" />
        }
        @case ('subscription') {
          <app-tenant-subscription-modal [tenant]="t" (close)="closeModal()" />
        }
      }
    }
  `,
  styles: [
    `
      :host { display: block; color: #0f172a; }
      .tl { padding: 1.25rem 1.5rem 2rem; display: flex; flex-direction: column; gap: 1rem; }

      /* Header */
      .tl__header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .tl__breadcrumb { margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 500; }
      .tl__title { margin: 0.25rem 0 0.125rem; font-size: 1.375rem; font-weight: 700; color: #0f172a; }
      .tl__subtitle { margin: 0; font-size: 0.8125rem; color: #64748b; }
      .tl__actions { display: inline-flex; gap: 0.5rem; }
      .tl-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.875rem;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: background 120ms, border-color 120ms;
      }
      .tl-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .tl-btn--primary:hover { background: #1d4ed8; }
      .tl-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .tl-btn--ghost:hover { background: #f8fafc; }

      /* KPI grid */
      .tl__kpis {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 0.75rem;
      }
      @media (max-width: 1400px) { .tl__kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      @media (max-width: 900px)  { .tl__kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 560px)  { .tl__kpis { grid-template-columns: 1fr; } }

      /* Panel */
      .tl-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
      }

      /* Tabs */
      .tl-tabs {
        display: flex;
        gap: 0.25rem;
        padding: 0.75rem 1.125rem 0;
        border-bottom: 1px solid #e2e8f0;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
      }
      .tl-tab {
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
      .tl-tab:hover { color: #334155; }
      .tl-tab--active { color: #2563eb; border-bottom-color: #2563eb; }
      .tl-tab__badge {
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 0.125rem 0.4rem;
        border-radius: 999px;
        background: #f1f5f9;
        color: #475569;
      }
      .tl-tab__badge--active    { background: #d1fae5; color: #065f46; }
      .tl-tab__badge--trial     { background: #cffafe; color: #155e75; }
      .tl-tab__badge--pending   { background: #fef3c7; color: #92400e; }
      .tl-tab__badge--suspended { background: #fee2e2; color: #7f1d1d; }
      .tl-tab__badge--archived  { background: #e2e8f0; color: #475569; }

      /* Filters */
      .tl-filters {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1.125rem;
        border-bottom: 1px solid #e2e8f0;
        flex-wrap: wrap;
        align-items: center;
      }
      .tl-filters__search {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1 1 280px;
        min-width: 240px;
        padding: 0.5rem 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
        color: #64748b;
      }
      .tl-filters__search svg { flex: 0 0 auto; }
      .tl-filters__search input {
        flex: 1;
        min-width: 0;
        border: 0;
        background: transparent;
        font-size: 0.8125rem;
        color: #0f172a;
        outline: none;
      }
      .tl-select {
        padding: 0.5rem 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: white;
        font-size: 0.8125rem;
        color: #334155;
        font-weight: 500;
        cursor: pointer;
      }
      .tl-filters__clear {
        border: 0;
        background: transparent;
        font-size: 0.75rem;
        color: #2563eb;
        font-weight: 600;
        cursor: pointer;
      }
      .tl-view-toggle {
        display: inline-flex;
        margin-left: auto;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .tl-view-btn {
        padding: 0.5rem 0.625rem;
        background: white;
        color: #64748b;
        border: 0;
        cursor: pointer;
      }
      .tl-view-btn:hover { background: #f8fafc; }
      .tl-view-btn--active { background: #eff6ff; color: #2563eb; }
      .tl-view-btn + .tl-view-btn { border-left: 1px solid #e2e8f0; }

      /* Empty */
      .tl-empty {
        padding: 3rem 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        color: #64748b;
      }
      .tl-empty__title { margin: 0; font-size: 0.875rem; font-weight: 600; color: #475569; }

      /* Table */
      .tl-table-wrap { overflow: auto; }
      .tl-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; min-width: 1080px; }
      .tl-table thead th {
        text-align: left;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.6875rem;
        font-weight: 600;
        color: #64748b;
        background: #f8fafc;
        padding: 0.625rem 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
      }
      .tl-th--num, .tl-td--num { text-align: right; font-variant-numeric: tabular-nums; }
      .tl-th--dot, .tl-td--dot { width: 22px; padding-left: 0.75rem; padding-right: 0; }
      .tl-th--actions, .tl-td--actions { width: 44px; text-align: right; position: relative; }
      .tl-table tbody tr { border-bottom: 1px solid #f1f5f9; }
      .tl-table tbody tr:hover { background: #f8fafc; }
      .tl-table td { padding: 0.75rem 0.75rem; vertical-align: middle; }

      .tl-dot { display: inline-block; width: 8px; height: 8px; border-radius: 999px; }
      .tl-dot--active    { background: #10b981; }
      .tl-dot--trial     { background: #0891b2; }
      .tl-dot--pending   { background: #f59e0b; }
      .tl-dot--suspended { background: #ef4444; }
      .tl-dot--inactive  { background: #94a3b8; }

      /* Tenant cell */
      .tl-tenant { display: flex; align-items: center; gap: 0.625rem; min-width: 0; }
      .tl-avatar {
        flex: 0 0 auto;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 0.75rem;
      }
      .tl-avatar--lg { width: 44px; height: 44px; font-size: 0.875rem; border-radius: 10px; }
      .tl-tenant__meta { min-width: 0; display: flex; flex-direction: column; }
      .tl-tenant__name {
        color: #0f172a;
        text-decoration: none;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tl-tenant__name:hover { color: #2563eb; text-decoration: underline; }
      .tl-tenant__slug { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #64748b; font-size: 0.6875rem; }

      .tl-muted { color: #64748b; }

      /* Status badge */
      .tl-badge {
        display: inline-flex;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
        border: 1px solid;
      }
      .tl-badge--active    { background: #d1fae5; color: #065f46; border-color: #10b981; }
      .tl-badge--trial     { background: #cffafe; color: #155e75; border-color: #06b6d4; }
      .tl-badge--pending   { background: #fef3c7; color: #92400e; border-color: #f59e0b; }
      .tl-badge--suspended { background: #fee2e2; color: #991b1b; border-color: #ef4444; }
      .tl-badge--inactive  { background: #f3f4f6; color: #374151; border-color: #9ca3af; }
      .tl-badge--archived  { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }

      /* Tier badge */
      .tl-tier {
        display: inline-flex;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
        font-size: 0.6875rem;
        font-weight: 600;
        border: 1px solid;
      }
      .tl-tier--trial        { background: #f1f5f9; color: #475569; border-color: #94a3b8; }
      .tl-tier--basic        { background: #dbeafe; color: #1e40af; border-color: #60a5fa; }
      .tl-tier--professional { background: #eff6ff; color: #1d4ed8; border-color: #2563eb; }
      .tl-tier--enterprise   { background: #eef2ff; color: #3730a3; border-color: #4f46e5; }
      .tl-tier--government   { background: #f0f4f8; color: #1b3a5c; border-color: #1e3a5f; }

      /* Usage */
      .tl-usage { display: flex; flex-direction: column; gap: 0.25rem; min-width: 88px; }
      .tl-usage__num { font-size: 0.75rem; color: #334155; font-variant-numeric: tabular-nums; }
      .tl-usage__bar { display: block; width: 100%; height: 4px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
      .tl-usage__fill { display: block; height: 100%; border-radius: 999px; }
      .tl-usage__fill--ok   { background: #10b981; }
      .tl-usage__fill--warn { background: #f59e0b; }
      .tl-usage__fill--high { background: #ef4444; }

      /* Sub end */
      .tl-sub-end { display: flex; flex-direction: column; }
      .tl-sub-end span:first-child { color: #334155; font-size: 0.75rem; }
      .tl-sub-end__hint { font-size: 0.6875rem; font-weight: 600; }
      .tl-sub-end__hint--ok   { color: #059669; }
      .tl-sub-end__hint--warn { color: #d97706; }
      .tl-sub-end__hint--crit { color: #dc2626; }

      /* Billing pill */
      .tl-pill {
        display: inline-flex;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
      }
      .tl-pill--current { background: #dcfce7; color: #166534; }
      .tl-pill--overdue { background: #fee2e2; color: #991b1b; }
      .tl-pill--grace   { background: #fef3c7; color: #92400e; }
      .tl-pill--na      { background: #f1f5f9; color: #475569; }

      /* Kebab */
      .tl-kebab-btn {
        display: inline-flex;
        padding: 0.3rem;
        border: 0;
        background: transparent;
        color: #64748b;
        border-radius: 6px;
        cursor: pointer;
      }
      .tl-kebab-btn:hover { background: #e2e8f0; color: #334155; }
      .tl-kebab {
        position: absolute;
        right: 0.5rem;
        top: calc(100% + 4px);
        z-index: 30;
        min-width: 220px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.12);
        list-style: none;
        padding: 0.25rem;
        margin: 0;
      }
      .tl-kebab--card { top: 2.5rem; }
      .tl-kebab__item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.625rem;
        border: 0;
        background: transparent;
        color: #334155;
        font-size: 0.8125rem;
        border-radius: 6px;
        cursor: pointer;
        text-align: left;
      }
      .tl-kebab__item:hover { background: #f1f5f9; }
      .tl-kebab__item--danger { color: #b91c1c; }
      .tl-kebab__item--danger:hover { background: #fee2e2; }

      /* Cards */
      .tl-cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.875rem;
        padding: 1rem 1.125rem;
      }
      @media (max-width: 1100px) { .tl-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 700px)  { .tl-cards { grid-template-columns: 1fr; } }
      .tl-card {
        position: relative;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.875rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .tl-card__head { display: flex; align-items: center; gap: 0.625rem; position: relative; }
      .tl-card__meta { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .tl-card__name { color: #0f172a; font-weight: 700; font-size: 0.9375rem; text-decoration: none; }
      .tl-card__name:hover { color: #2563eb; text-decoration: underline; }
      .tl-card__slug { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.6875rem; color: #64748b; }
      .tl-card__badges { display: flex; gap: 0.375rem; flex-wrap: wrap; }
      .tl-card__contact, .tl-card__metrics {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.75rem;
        padding: 0.625rem 0;
        border-top: 1px solid #f1f5f9;
      }
      .tl-card__contact { grid-template-columns: 1fr 1fr; }
      .tl-card__label { margin: 0; font-size: 0.625rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .tl-card__value { margin: 0.125rem 0 0; font-size: 0.8125rem; color: #0f172a; font-weight: 500; }
      .tl-card__muted { margin: 0.125rem 0 0; font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tl-card__metric { margin: 0.125rem 0 0.25rem; font-size: 0.9375rem; color: #0f172a; font-weight: 700; font-variant-numeric: tabular-nums; }
      .tl-card__foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.625rem;
        border-top: 1px solid #f1f5f9;
      }

      /* Pagination */
      .tl-pager {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.125rem;
        border-top: 1px solid #e2e8f0;
      }
      .tl-pager__info { font-size: 0.75rem; color: #64748b; }
      .tl-pager__ctrl { display: inline-flex; align-items: center; gap: 0.5rem; }
      .tl-pager__num { font-size: 0.75rem; color: #334155; font-weight: 500; }
      .tl-page-btn {
        width: 28px;
        height: 28px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: white;
        color: #334155;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .tl-page-btn:hover:not(:disabled) { background: #f1f5f9; }
      .tl-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    `
  ]
})
export class TenantListComponent {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly store = inject(TenantStoreService);

  public readonly tabs: readonly { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'trial', label: 'Trial' },
    { key: 'pending', label: 'Pending' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'archived', label: 'Archived' }
  ];

  public readonly activeTab = signal<TabKey>('all');
  public readonly view = signal<ViewMode>('table');
  public readonly page = signal<number>(1);
  public readonly pageSize = 10;
  public readonly kebabOpenFor = signal<string | null>(null);

  public readonly activeModal = signal<TenantModalKey | null>(null);
  public readonly currentTenant = signal<ITenant | null>(null);

  public search = '';
  public tierFilter = '';
  public stateFilter = '';
  public billingFilter = '';
  public sortKey: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'most-users' | 'most-clients' | 'tier' = 'newest';

  public readonly tenants = this.store.tenants;

  public readonly filtered = computed<ITenant[]>(() => {
    const q = this.search.trim().toLowerCase();
    const tab = this.activeTab();
    const tier = this.tierFilter;
    const st = this.stateFilter;
    const billing = this.billingFilter;

    let rows = this.tenants().slice();

    if (tab === 'active')    rows = rows.filter(t => t.status === 'Active');
    if (tab === 'trial')     rows = rows.filter(t => t.tier === 'Trial' || t.status === 'Trial');
    if (tab === 'pending')   rows = rows.filter(t => t.status === 'PendingActivation');
    if (tab === 'suspended') rows = rows.filter(t => t.status === 'Suspended');
    if (tab === 'archived')  rows = rows.filter(t => t.status === 'Archived' || t.status === 'Deactivated');

    if (tier)    rows = rows.filter(t => t.tier === tier);
    if (st)      rows = rows.filter(t => t.state === st);
    if (billing) rows = rows.filter(t => t.billingStatus === billing);
    if (q) {
      rows = rows.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.contactName.toLowerCase().includes(q) ||
        t.contactEmail.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      );
    }

    const tierOrder: Record<TenantTier, number> = { Trial: 0, Basic: 1, Professional: 2, Enterprise: 3, Government: 4 };
    switch (this.sortKey) {
      case 'oldest':       rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); break;
      case 'name-asc':     rows.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc':    rows.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'most-users':   rows.sort((a, b) => b.users - a.users); break;
      case 'most-clients': rows.sort((a, b) => b.clients - a.clients); break;
      case 'tier':         rows.sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier]); break;
      default:             rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return rows;
  });

  public readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  public readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  public readonly pagerInfo = computed(() => {
    const total = this.filtered().length;
    if (!total) return '';
    const start = (this.page() - 1) * this.pageSize + 1;
    const end = Math.min(total, this.page() * this.pageSize);
    return `Showing ${start}–${end} of ${total}`;
  });

  public readonly tabCounts = computed<Record<TabKey, number>>(() => {
    const list = this.tenants();
    return {
      all: list.length,
      active: list.filter(t => t.status === 'Active').length,
      trial: list.filter(t => t.tier === 'Trial' || t.status === 'Trial').length,
      pending: list.filter(t => t.status === 'PendingActivation').length,
      suspended: list.filter(t => t.status === 'Suspended').length,
      archived: list.filter(t => t.status === 'Archived' || t.status === 'Deactivated').length
    };
  });

  public readonly kpi = computed(() => {
    const list = this.tenants();
    const total = list.length;
    const active = list.filter(t => t.status === 'Active').length;
    const trial = list.filter(t => t.tier === 'Trial' || t.status === 'Trial').length;
    const suspended = list.filter(t => t.status === 'Suspended').length;
    const totalUsers = list.reduce((s, t) => s + t.users, 0);
    const totalClients = list.reduce((s, t) => s + t.clients, 0);
    const trialExpiring = list.filter(t => (t.tier === 'Trial') && this.daysFromToday(t.subscriptionEnds) <= 7 && this.daysFromToday(t.subscriptionEnds) >= 0).length;
    return {
      total,
      active,
      trial,
      suspended,
      totalUsers,
      totalClients,
      activePct: total ? Math.round((active / total) * 100) : 0,
      avgUsers: total ? Math.round(totalUsers / total) : 0,
      avgClients: total ? Math.round(totalClients / total) : 0,
      trialExpiring,
      pendingReview: list.filter(t => t.status === 'Suspended' && t.billingStatus === 'Overdue').length
    };
  });

  public tierCount(): number {
    return new Set(this.tenants().map(t => t.tier)).size;
  }

  public setTab(key: TabKey): void {
    this.activeTab.set(key);
    this.page.set(1);
  }

  public onSearch(_: string): void {
    this.page.set(1);
  }

  public hasFilters(): boolean {
    return !!(this.search || this.tierFilter || this.stateFilter || this.billingFilter) || this.activeTab() !== 'all' || this.sortKey !== 'newest';
  }

  public clearFilters(): void {
    this.search = '';
    this.tierFilter = '';
    this.stateFilter = '';
    this.billingFilter = '';
    this.sortKey = 'newest';
    this.activeTab.set('all');
    this.page.set(1);
  }

  public prevPage(): void {
    this.page.update(p => Math.max(1, p - 1));
  }

  public nextPage(): void {
    this.page.update(p => Math.min(this.pageCount(), p + 1));
  }

  public toggleKebab(ev: Event, id: string): void {
    ev.stopPropagation();
    this.kebabOpenFor.update(current => (current === id ? null : id));
  }

  @HostListener('document:click')
  public onDocClick(): void {
    this.kebabOpenFor.set(null);
  }

  @HostListener('document:keydown.escape')
  public onEsc(): void {
    this.kebabOpenFor.set(null);
  }

  public actionsFor(t: ITenant): IKebabAction[] {
    const byId = (id: string): IKebabAction | undefined => KEBAB_ACTIONS.find(a => a.id === id);
    const get = (ids: string[]): IKebabAction[] => ids.map(byId).filter((a): a is IKebabAction => !!a);

    switch (t.status) {
      case 'PendingActivation':
        return get(['view', 'edit', 'activate', 'delete']);
      case 'Active':
        return t.tier === 'Trial'
          ? get(['view', 'edit', 'subscription', 'programs', 'users', 'features', 'billing', 'branding', 'impersonate', 'extend-trial', 'audit', 'suspend'])
          : get(['view', 'edit', 'subscription', 'programs', 'users', 'features', 'billing', 'branding', 'impersonate', 'audit', 'suspend']);
      case 'Trial':
        return get(['view', 'edit', 'subscription', 'users', 'impersonate', 'extend-trial', 'audit', 'suspend']);
      case 'Suspended':
        return get(['view', 'activate', 'audit', 'deactivate']);
      case 'Deactivated':
        return get(['view', 'audit', 'delete']);
      case 'Archived':
        return get(['view', 'audit']);
    }
  }

  public runAction(a: IKebabAction, t: ITenant): void {
    this.kebabOpenFor.set(null);
    this.currentTenant.set(t);
    switch (a.id) {
      case 'view':
        this.router.navigate(['/system/tenants', t.id]);
        return;
      case 'edit':
        this.activeModal.set('edit');
        return;
      case 'subscription':
        this.activeModal.set('subscription');
        return;
      case 'suspend':
        this.activeModal.set('suspend');
        return;
      case 'activate':
        this.activeModal.set('activate');
        return;
      case 'deactivate':
        this.activeModal.set('deactivate');
        return;
      case 'delete':
        this.activeModal.set('delete');
        return;
      case 'impersonate':
        this.activeModal.set('impersonate');
        return;
      case 'extend-trial':
        this.store.extendTrial(t.id, 14);
        this.toast.showSuccess(`Trial extended 14 days for ${t.name}.`);
        return;
      case 'audit':
        this.router.navigate(['/system/tenants', t.id]);
        return;
      default:
        this.toast.showInfo(`${a.label} for ${t.name} — coming soon.`);
    }
  }

  public openCreate(): void {
    this.currentTenant.set(null);
    this.activeModal.set('create');
  }

  public openDetail(t: ITenant): void {
    this.router.navigate(['/system/tenants', t.id]);
  }

  public closeModal(): void {
    this.activeModal.set(null);
    this.currentTenant.set(null);
  }

  public stub(action: string): void {
    this.toast.showInfo(`${action} — coming soon.`);
  }

  // Visual helpers
  public statusDotClass(s: TenantStatus): string {
    if (s === 'Active') return 'active';
    if (s === 'Trial') return 'trial';
    if (s === 'PendingActivation') return 'pending';
    if (s === 'Suspended') return 'suspended';
    return 'inactive';
  }

  public statusClass(s: TenantStatus): string {
    if (s === 'Active') return 'active';
    if (s === 'Trial') return 'trial';
    if (s === 'PendingActivation') return 'pending';
    if (s === 'Suspended') return 'suspended';
    if (s === 'Archived') return 'archived';
    return 'inactive';
  }

  public statusLabel(s: TenantStatus): string {
    return s === 'PendingActivation' ? 'Pending' : s;
  }

  public billingClass(b: BillingStatus): string {
    return b === 'N/A' ? 'na' : b.toLowerCase();
  }

  public usagePct(v: number, max: number): number {
    if (!max) return 0;
    return Math.min(100, Math.round((v / max) * 100));
  }

  public usageClass(v: number, max: number): 'ok' | 'warn' | 'high' {
    const pct = this.usagePct(v, max);
    if (pct >= 90) return 'high';
    if (pct >= 75) return 'warn';
    return 'ok';
  }

  public initials(name: string): string {
    return name
      .split(/[\s—-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }

  public avatarBg(name: string): string {
    const colors = ['#2563eb', '#0891b2', '#7c3aed', '#059669', '#d97706', '#ec4899', '#0f766e', '#4f46e5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % colors.length;
    return colors[hash];
  }

  public daysLeft(endDate: string): number | null {
    const d = this.daysFromToday(endDate);
    return Number.isFinite(d) ? d : null;
  }

  public daysLeftLabel(endDate: string): string {
    const d = this.daysFromToday(endDate);
    return d < 0 ? `${rel(d)}` : `${d}d left`;
  }

  public daysLeftClass(endDate: string): 'ok' | 'warn' | 'crit' {
    const d = this.daysFromToday(endDate);
    if (d < 7) return 'crit';
    if (d < 30) return 'warn';
    return 'ok';
  }

  public formatNum(n: number): string {
    return n.toLocaleString('en-US');
  }

  private daysFromToday(dateISO: string): number {
    const target = new Date(dateISO);
    const diff = target.getTime() - TODAY.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }
}
