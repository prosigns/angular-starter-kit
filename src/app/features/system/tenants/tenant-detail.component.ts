import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { TenantStoreService } from './tenant-store.service';
import { ITenant } from './tenant.types';
import { TenantActivateModalComponent } from './modals/tenant-activate-modal.component';
import { TenantDeactivateModalComponent } from './modals/tenant-deactivate-modal.component';
import { TenantDeleteModalComponent } from './modals/tenant-delete-modal.component';
import { TenantFormModalComponent } from './modals/tenant-form-modal.component';
import { TenantImpersonateModalComponent } from './modals/tenant-impersonate-modal.component';
import { TenantSubscriptionModalComponent } from './modals/tenant-subscription-modal.component';
import { TenantSuspendModalComponent } from './modals/tenant-suspend-modal.component';

type TabKey = 'overview' | 'programs' | 'users' | 'subscription' | 'features' | 'branding' | 'billing' | 'audit' | 'settings';

interface IFeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TenantFormModalComponent,
    TenantSuspendModalComponent,
    TenantActivateModalComponent,
    TenantDeactivateModalComponent,
    TenantDeleteModalComponent,
    TenantImpersonateModalComponent,
    TenantSubscriptionModalComponent
  ],
  template: `
    @if (!tenant()) {
      <div class="td-not-found">
        <h2>Tenant not found</h2>
        <a routerLink="/system/tenants" class="td-btn td-btn--ghost">← Back to all tenants</a>
      </div>
    } @else {
      <div class="td">
        <!-- Header -->
        <header class="td__header">
          <nav class="td__breadcrumb">
            <a routerLink="/system/tenants">Admin · Tenants</a>
            <span> › {{ tenant()!.name }}</span>
          </nav>
          <div class="td__title-row">
            <div class="td__title-group">
              <span class="td__avatar" [style.background]="avatarBg(tenant()!.name)">{{ initials(tenant()!.name) }}</span>
              <div>
                <h1 class="td__title">{{ tenant()!.name }}</h1>
                <div class="td__meta">
                  <code>{{ tenant()!.slug }}</code>
                  <span class="td-badge" [class]="'td-badge--' + statusClass(tenant()!.status)">{{ statusLabel(tenant()!.status) }}</span>
                  <span class="td-tier" [class]="'td-tier--' + tenant()!.tier.toLowerCase()">{{ tenant()!.tier }}</span>
                </div>
              </div>
            </div>
            <div class="td__actions">
              <button type="button" class="td-btn td-btn--ghost" (click)="openEdit()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                Edit
              </button>
              <div class="td__menu">
                <button type="button" class="td-btn td-btn--ghost" (click)="menuOpen.set(!menuOpen())" aria-label="More actions">Actions ▾</button>
                @if (menuOpen()) {
                  <ul class="td__menu-list" role="menu">
                    @if (tenant()!.status === 'PendingActivation' || tenant()!.status === 'Suspended') {
                      <li><button role="menuitem" (click)="open('activate')">Activate Tenant</button></li>
                    }
                    @if (tenant()!.status === 'Active') {
                      <li><button role="menuitem" (click)="open('suspend')" class="td__menu-danger">Suspend Tenant</button></li>
                      <li><button role="menuitem" (click)="open('impersonate')">Impersonate Admin</button></li>
                    }
                    @if (tenant()!.status === 'Suspended' || tenant()!.status === 'Active') {
                      <li><button role="menuitem" (click)="open('deactivate')" class="td__menu-danger">Deactivate Tenant</button></li>
                    }
                    @if (tenant()!.status === 'PendingActivation' || tenant()!.status === 'Deactivated') {
                      <li><button role="menuitem" (click)="open('delete')" class="td__menu-danger">Delete Tenant</button></li>
                    }
                    <li><button role="menuitem" (click)="open('subscription')">Change Subscription</button></li>
                  </ul>
                }
              </div>
            </div>
          </div>
        </header>

        <!-- Info cards -->
        <section class="td__cards">
          <article class="td-card">
            <p class="td-card__label">Users</p>
            <p class="td-card__value">{{ tenant()!.users }} <span class="td-card__limit">/ {{ tenant()!.maxUsers }}</span></p>
            <span class="td-bar"><span class="td-bar__fill" [style.width.%]="pct(tenant()!.users, tenant()!.maxUsers)"></span></span>
          </article>
          <article class="td-card">
            <p class="td-card__label">Clients</p>
            <p class="td-card__value">{{ tenant()!.clients }} <span class="td-card__limit">/ {{ tenant()!.maxClients }}</span></p>
            <span class="td-bar"><span class="td-bar__fill" [style.width.%]="pct(tenant()!.clients, tenant()!.maxClients)"></span></span>
          </article>
          <article class="td-card">
            <p class="td-card__label">Programs</p>
            <p class="td-card__value">{{ tenant()!.programs }} <span class="td-card__limit">/ {{ tenant()!.maxPrograms || '—' }}</span></p>
          </article>
          <article class="td-card">
            <p class="td-card__label">Monthly Rate</p>
            <p class="td-card__value">\${{ (tenant()!.monthlyRate || 0).toLocaleString() }}</p>
            <p class="td-card__muted">{{ tenant()!.contractTerm }} · Auto-renew {{ tenant()!.autoRenew ? 'on' : 'off' }}</p>
          </article>
        </section>

        <!-- Tabs -->
        <nav class="td-tabs" role="tablist">
          @for (t of tabs; track t.key) {
            <button
              type="button"
              role="tab"
              class="td-tab"
              [class.td-tab--active]="activeTab() === t.key"
              (click)="activeTab.set(t.key)"
            >{{ t.label }}</button>
          }
        </nav>

        <!-- Tab panels -->
        <section class="td-panel">
          @switch (activeTab()) {
            @case ('overview') {
              <div class="td-grid-2">
                <article class="td-sub">
                  <h3>Organization</h3>
                  <dl class="td-dl">
                    <dt>Name</dt><dd>{{ tenant()!.name }}</dd>
                    <dt>Slug</dt><dd><code>{{ tenant()!.slug }}</code></dd>
                    <dt>Federal Tax ID</dt><dd>{{ maskedTaxId() }}</dd>
                    <dt>Address</dt><dd>{{ tenant()!.addressLine1 }}<br>{{ tenant()!.city }}, {{ tenant()!.state }} {{ tenant()!.zip }}</dd>
                    <dt>Contact</dt><dd>{{ tenant()!.contactName }}<br><span class="td-muted">{{ tenant()!.contactEmail }}</span>@if (tenant()!.contactPhone) {<br><span class="td-muted">{{ tenant()!.contactPhone }}</span>}</dd>
                  </dl>
                </article>

                <article class="td-sub">
                  <h3>Quick stats</h3>
                  <dl class="td-dl">
                    <dt>Status</dt><dd><span class="td-badge" [class]="'td-badge--' + statusClass(tenant()!.status)">{{ statusLabel(tenant()!.status) }}</span></dd>
                    <dt>Tier</dt><dd>{{ tenant()!.tier }}</dd>
                    <dt>Billing</dt><dd><span class="td-pill" [class]="'td-pill--' + billingClass(tenant()!.billingStatus)">{{ tenant()!.billingStatus }}</span></dd>
                    <dt>Subscription</dt><dd>{{ tenant()!.subscriptionStarts }} → {{ tenant()!.subscriptionEnds }}</dd>
                    <dt>Created</dt><dd>{{ tenant()!.createdAt }}</dd>
                    <dt>Last Activity</dt><dd>{{ tenant()!.lastActivity }}</dd>
                  </dl>
                </article>
              </div>

              <article class="td-sub">
                <h3>Recent activity</h3>
                @if (audit().length === 0) {
                  <p class="td-muted">No activity recorded yet.</p>
                } @else {
                  <ul class="td-timeline">
                    @for (a of audit().slice(0, 10); track a.id) {
                      <li>
                        <span class="td-timeline__dot"></span>
                        <div class="td-timeline__content">
                          <p class="td-timeline__action">{{ a.action }}</p>
                          @if (a.details) { <p class="td-timeline__detail">{{ a.details }}</p> }
                          <p class="td-timeline__meta">{{ a.actor }} · {{ formatTime(a.timestamp) }}</p>
                        </div>
                      </li>
                    }
                  </ul>
                }
              </article>
            }

            @case ('programs') {
              <div class="td-section-head">
                <h3>Programs ({{ tenant()!.programs }})</h3>
                <button type="button" class="td-btn td-btn--primary" (click)="stub('Add Program')">+ Add Program</button>
              </div>
              @if (tenant()!.programs === 0) {
                <p class="td-empty">No programs configured yet.</p>
              } @else {
                <table class="td-table">
                  <thead><tr><th>Program</th><th>Type</th><th>Director</th><th>Clients</th><th>Staff</th><th>Status</th></tr></thead>
                  <tbody>
                    @for (p of mockPrograms(); track p.name) {
                      <tr><td>{{ p.name }}</td><td>{{ p.type }}</td><td>{{ p.director }}</td><td>{{ p.clients }}</td><td>{{ p.staff }}</td><td><span class="td-badge td-badge--active">Active</span></td></tr>
                    }
                  </tbody>
                </table>
              }
            }

            @case ('users') {
              <div class="td-section-head">
                <h3>Users ({{ tenant()!.users }} / {{ tenant()!.maxUsers }})</h3>
                <button type="button" class="td-btn td-btn--primary" (click)="stub('Invite User')">+ Invite User</button>
              </div>
              @if (tenant()!.users === 0) {
                <p class="td-empty">No users yet.</p>
              } @else {
                <table class="td-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th></tr></thead>
                  <tbody>
                    <tr><td>{{ tenant()!.contactName }}</td><td>{{ tenant()!.contactEmail }}</td><td><span class="td-badge td-badge--active">Tenant Admin</span></td><td><span class="td-badge td-badge--active">Active</span></td><td>Today</td></tr>
                    <tr><td>Jane Roe</td><td>jane.roe&#64;{{ tenant()!.slug }}.example</td><td><span class="td-badge td-badge--trial">Provider</span></td><td><span class="td-badge td-badge--active">Active</span></td><td>2d ago</td></tr>
                    <tr><td>Ken Mitchell</td><td>ken.mitchell&#64;{{ tenant()!.slug }}.example</td><td><span class="td-badge td-badge--trial">Case Manager</span></td><td><span class="td-badge td-badge--active">Active</span></td><td>5h ago</td></tr>
                  </tbody>
                </table>
              }
            }

            @case ('subscription') {
              <div class="td-grid-2">
                <article class="td-sub">
                  <h3>Plan</h3>
                  <dl class="td-dl">
                    <dt>Tier</dt><dd>{{ tenant()!.tier }}</dd>
                    <dt>Term</dt><dd>{{ tenant()!.contractTerm }}</dd>
                    <dt>Auto-renew</dt><dd>{{ tenant()!.autoRenew ? 'Enabled' : 'Disabled' }}</dd>
                    <dt>Monthly Rate</dt><dd>\${{ (tenant()!.monthlyRate || 0).toLocaleString() }}</dd>
                    <dt>Discount</dt><dd>{{ tenant()!.discountPct || 0 }}%</dd>
                  </dl>
                </article>
                <article class="td-sub">
                  <h3>Dates</h3>
                  <dl class="td-dl">
                    <dt>Starts</dt><dd>{{ tenant()!.subscriptionStarts }}</dd>
                    <dt>Ends</dt><dd>{{ tenant()!.subscriptionEnds }}</dd>
                    <dt>Billing</dt><dd><span class="td-pill" [class]="'td-pill--' + billingClass(tenant()!.billingStatus)">{{ tenant()!.billingStatus }}</span></dd>
                  </dl>
                </article>
              </div>
              <div class="td-actions-row">
                <button type="button" class="td-btn td-btn--primary" (click)="open('subscription')">Change Subscription</button>
                <button type="button" class="td-btn td-btn--ghost" routerLink="/system/tenants/subscriptions">Open Billing Console</button>
              </div>
            }

            @case ('features') {
              <h3>Feature flags</h3>
              <ul class="td-flags">
                @for (f of featureFlags(); track f.key) {
                  <li>
                    <div>
                      <p class="td-flag__label">{{ f.label }} <code>{{ f.key }}</code></p>
                      <p class="td-flag__desc">{{ f.description }}</p>
                    </div>
                    <label class="td-switch">
                      <input type="checkbox" [(ngModel)]="f.enabled" (ngModelChange)="toggleFlag(f)" />
                      <span class="td-switch__track"><span class="td-switch__thumb"></span></span>
                    </label>
                  </li>
                }
              </ul>
            }

            @case ('branding') {
              <div class="td-grid-2">
                <article class="td-sub">
                  <h3>Logo</h3>
                  <div class="td-logo">
                    <span class="td__avatar td__avatar--xl" [style.background]="avatarBg(tenant()!.name)">{{ initials(tenant()!.name) }}</span>
                    <button type="button" class="td-btn td-btn--ghost" (click)="stub('Upload Logo')">Upload new logo</button>
                  </div>
                </article>
                <article class="td-sub">
                  <h3>Brand colors</h3>
                  <div class="td-color">
                    <span class="td-swatch" [style.background]="brandColor"></span>
                    <input type="color" [(ngModel)]="brandColor" aria-label="Primary color" />
                    <code>{{ brandColor }}</code>
                  </div>
                  <button type="button" class="td-btn td-btn--ghost" (click)="stub('Custom Domain')">Configure custom domain</button>
                </article>
              </div>
            }

            @case ('billing') {
              <h3>Billing history</h3>
              <table class="td-table">
                <thead><tr><th>Invoice</th><th>Period</th><th>Amount</th><th>Status</th><th>Paid On</th></tr></thead>
                <tbody>
                  <tr><td>INV-2026-04</td><td>Apr 2026</td><td>\${{ (tenant()!.monthlyRate || 0).toLocaleString() }}</td><td><span class="td-pill td-pill--current">Paid</span></td><td>2026-04-05</td></tr>
                  <tr><td>INV-2026-03</td><td>Mar 2026</td><td>\${{ (tenant()!.monthlyRate || 0).toLocaleString() }}</td><td><span class="td-pill td-pill--current">Paid</span></td><td>2026-03-03</td></tr>
                  <tr><td>INV-2026-02</td><td>Feb 2026</td><td>\${{ (tenant()!.monthlyRate || 0).toLocaleString() }}</td><td><span class="td-pill td-pill--current">Paid</span></td><td>2026-02-05</td></tr>
                </tbody>
              </table>
            }

            @case ('audit') {
              <h3>Audit trail</h3>
              @if (audit().length === 0) {
                <p class="td-empty">No audit entries recorded yet.</p>
              } @else {
                <table class="td-table">
                  <thead><tr><th>Timestamp</th><th>Action</th><th>User</th><th>Details</th></tr></thead>
                  <tbody>
                    @for (a of audit(); track a.id) {
                      <tr>
                        <td>{{ formatTime(a.timestamp) }}</td>
                        <td>{{ a.action }}</td>
                        <td>{{ a.actor }}</td>
                        <td class="td-muted">{{ a.details || '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            }

            @case ('settings') {
              <div class="td-grid-2">
                <article class="td-sub">
                  <h3>Time zone & locale</h3>
                  <label class="td-field">
                    <span>Time zone</span>
                    <select [(ngModel)]="timeZone" (ngModelChange)="saveSettings()">
                      <option value="America/New_York">America/New_York (ET)</option>
                      <option value="America/Chicago">America/Chicago (CT)</option>
                      <option value="America/Denver">America/Denver (MT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                    </select>
                  </label>
                  <label class="td-field">
                    <span>Locale</span>
                    <select [(ngModel)]="locale" (ngModelChange)="saveSettings()">
                      <option value="en-US">English (United States)</option>
                      <option value="es-US">Spanish (United States)</option>
                    </select>
                  </label>
                </article>
                <article class="td-sub">
                  <h3>Internal notes</h3>
                  <textarea rows="6" [(ngModel)]="internalNotes" (ngModelChange)="saveNotes()" placeholder="Admin-only notes…"></textarea>
                </article>
              </div>
            }
          }
        </section>
      </div>
    }

    <!-- Modals -->
    @if (activeModal() === 'edit' && tenant()) {
      <app-tenant-form-modal [tenant]="tenant()!" (close)="activeModal.set(null)" (saved)="onSaved()" />
    }
    @if (activeModal() === 'suspend' && tenant()) {
      <app-tenant-suspend-modal [tenant]="tenant()!" (close)="activeModal.set(null)" />
    }
    @if (activeModal() === 'activate' && tenant()) {
      <app-tenant-activate-modal [tenant]="tenant()!" (close)="activeModal.set(null)" />
    }
    @if (activeModal() === 'deactivate' && tenant()) {
      <app-tenant-deactivate-modal [tenant]="tenant()!" (close)="activeModal.set(null)" />
    }
    @if (activeModal() === 'delete' && tenant()) {
      <app-tenant-delete-modal [tenant]="tenant()!" (close)="onDeleteClosed()" />
    }
    @if (activeModal() === 'impersonate' && tenant()) {
      <app-tenant-impersonate-modal [tenant]="tenant()!" (close)="activeModal.set(null)" />
    }
    @if (activeModal() === 'subscription' && tenant()) {
      <app-tenant-subscription-modal [tenant]="tenant()!" (close)="activeModal.set(null)" />
    }
  `,
  styles: [
    `
      :host { display: block; color: #0f172a; }
      .td { padding: 1.25rem 1.5rem 2rem; display: flex; flex-direction: column; gap: 1rem; }
      .td-not-found { padding: 4rem 1.5rem; text-align: center; color: #64748b; }

      /* Header */
      .td__header { display: flex; flex-direction: column; gap: 0.75rem; }
      .td__breadcrumb { font-size: 0.75rem; color: #64748b; }
      .td__breadcrumb a { color: #2563eb; text-decoration: none; }
      .td__breadcrumb a:hover { text-decoration: underline; }
      .td__title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
      .td__title-group { display: flex; align-items: center; gap: 0.875rem; }
      .td__avatar { width: 48px; height: 48px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1rem; }
      .td__avatar--xl { width: 96px; height: 96px; border-radius: 16px; font-size: 2rem; }
      .td__title { margin: 0; font-size: 1.375rem; font-weight: 700; }
      .td__meta { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-top: 0.25rem; }
      .td__meta code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 0.1rem 0.4rem; border-radius: 4px; }
      .td__actions { display: inline-flex; gap: 0.5rem; position: relative; }
      .td__menu { position: relative; }
      .td__menu-list { position: absolute; right: 0; top: calc(100% + 4px); z-index: 20; min-width: 220px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 20px -5px rgba(15,23,42,0.12); padding: 0.25rem; margin: 0; list-style: none; }
      .td__menu-list button { width: 100%; text-align: left; padding: 0.5rem 0.625rem; border: 0; background: transparent; color: #334155; font-size: 0.8125rem; border-radius: 6px; cursor: pointer; }
      .td__menu-list button:hover { background: #f1f5f9; }
      .td__menu-danger { color: #b91c1c !important; }
      .td__menu-danger:hover { background: #fee2e2 !important; }

      .td-btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.875rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
      .td-btn--primary { background: #2563eb; color: white; border-color: #2563eb; }
      .td-btn--primary:hover { background: #1d4ed8; }
      .td-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .td-btn--ghost:hover { background: #f8fafc; }

      /* Cards */
      .td__cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
      @media (max-width: 900px) { .td__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 560px) { .td__cards { grid-template-columns: 1fr; } }
      .td-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.75rem 0.875rem; }
      .td-card__label { margin: 0; font-size: 0.625rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .td-card__value { margin: 0.25rem 0; font-size: 1.375rem; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
      .td-card__limit { font-size: 0.875rem; color: #64748b; font-weight: 500; }
      .td-card__muted { margin: 0.125rem 0 0; font-size: 0.75rem; color: #64748b; }
      .td-bar { display: block; width: 100%; height: 4px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
      .td-bar__fill { display: block; height: 100%; background: #2563eb; border-radius: 999px; }

      /* Tabs */
      .td-tabs { display: flex; gap: 0.25rem; border-bottom: 1px solid #e2e8f0; overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; }
      .td-tab { padding: 0.625rem 0.875rem; border: 0; background: transparent; color: #64748b; font-size: 0.8125rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; }
      .td-tab:hover { color: #334155; }
      .td-tab--active { color: #2563eb; border-bottom-color: #2563eb; }

      /* Panel */
      .td-panel { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.125rem; display: flex; flex-direction: column; gap: 1rem; }
      .td-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
      .td-section-head h3 { margin: 0; font-size: 0.9375rem; }
      .td-actions-row { margin-top: 1rem; display: flex; gap: 0.5rem; }

      .td-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.875rem; }
      @media (max-width: 700px) { .td-grid-2 { grid-template-columns: 1fr; } }
      .td-sub { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.875rem; }
      .td-sub h3 { margin: 0 0 0.625rem; font-size: 0.8125rem; font-weight: 700; color: #0f172a; }
      .td-dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.375rem 1rem; margin: 0; font-size: 0.8125rem; }
      .td-dl dt { color: #64748b; font-weight: 600; font-size: 0.75rem; }
      .td-dl dd { margin: 0; color: #0f172a; }

      .td-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
      .td-table th, .td-table td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #f1f5f9; }
      .td-table th { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: #f8fafc; }

      .td-badge { display: inline-flex; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.625rem; font-weight: 700; }
      .td-badge--active { background: #d1fae5; color: #065f46; }
      .td-badge--trial { background: #cffafe; color: #155e75; }
      .td-badge--pending { background: #fef3c7; color: #92400e; }
      .td-badge--suspended { background: #fee2e2; color: #991b1b; }
      .td-badge--inactive { background: #f3f4f6; color: #374151; }
      .td-badge--archived { background: #f3f4f6; color: #6b7280; }

      .td-tier { display: inline-flex; padding: 0.1rem 0.4rem; border-radius: 6px; font-size: 0.625rem; font-weight: 700; border: 1px solid; }
      .td-tier--trial { background: #f1f5f9; color: #475569; border-color: #94a3b8; }
      .td-tier--basic { background: #dbeafe; color: #1e40af; border-color: #60a5fa; }
      .td-tier--professional { background: #eff6ff; color: #1d4ed8; border-color: #2563eb; }
      .td-tier--enterprise { background: #eef2ff; color: #3730a3; border-color: #4f46e5; }
      .td-tier--government { background: #f0f4f8; color: #1b3a5c; border-color: #1e3a5f; }

      .td-pill { display: inline-flex; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.625rem; font-weight: 700; }
      .td-pill--current { background: #dcfce7; color: #166534; }
      .td-pill--overdue { background: #fee2e2; color: #991b1b; }
      .td-pill--grace { background: #fef3c7; color: #92400e; }
      .td-pill--na { background: #f1f5f9; color: #475569; }

      .td-timeline { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .td-timeline li { display: grid; grid-template-columns: 18px 1fr; gap: 0.625rem; align-items: flex-start; }
      .td-timeline__dot { width: 10px; height: 10px; margin-top: 0.25rem; border-radius: 999px; background: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .td-timeline__action { margin: 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .td-timeline__detail { margin: 0.125rem 0 0; font-size: 0.75rem; color: #475569; }
      .td-timeline__meta { margin: 0.125rem 0 0; font-size: 0.6875rem; color: #94a3b8; }

      .td-empty { padding: 1.5rem; text-align: center; color: #94a3b8; font-size: 0.8125rem; }
      .td-muted { color: #64748b; }

      /* Feature flags */
      .td-flags { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
      .td-flags li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.625rem 0.875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
      .td-flag__label { margin: 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .td-flag__label code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.6875rem; color: #64748b; background: white; padding: 0.05rem 0.3rem; border-radius: 3px; margin-left: 0.375rem; }
      .td-flag__desc { margin: 0.125rem 0 0; font-size: 0.75rem; color: #64748b; }

      .td-switch { position: relative; display: inline-flex; align-items: center; }
      .td-switch input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
      .td-switch__track { width: 36px; height: 20px; border-radius: 999px; background: #e2e8f0; position: relative; transition: background 120ms; }
      .td-switch__thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 999px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: left 120ms; }
      .td-switch input:checked + .td-switch__track { background: #2563eb; }
      .td-switch input:checked + .td-switch__track .td-switch__thumb { left: 18px; }

      .td-logo { display: flex; align-items: center; gap: 1rem; }
      .td-color { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.75rem; }
      .td-color input[type="color"] { width: 36px; height: 36px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; padding: 2px; }
      .td-swatch { display: inline-block; width: 36px; height: 36px; border-radius: 6px; border: 1px solid #e2e8f0; }
      .td-color code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8125rem; color: #334155; }

      .td-field { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; }
      .td-field select, .td-field textarea { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #0f172a; outline: none; font-family: inherit; }
      .td-sub textarea { width: 100%; min-height: 120px; padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #0f172a; outline: none; font-family: inherit; resize: vertical; }
    `
  ]
})
export class TenantDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(TenantStoreService);
  private readonly toast = inject(ToastService);

  public readonly activeTab = signal<TabKey>('overview');
  public readonly menuOpen = signal<boolean>(false);
  public readonly activeModal = signal<'edit' | 'suspend' | 'activate' | 'deactivate' | 'delete' | 'impersonate' | 'subscription' | null>(null);

  public readonly tabs: readonly { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'programs', label: 'Programs' },
    { key: 'users', label: 'Users' },
    { key: 'subscription', label: 'Subscription' },
    { key: 'features', label: 'Features' },
    { key: 'branding', label: 'Branding' },
    { key: 'billing', label: 'Billing' },
    { key: 'audit', label: 'Audit' },
    { key: 'settings', label: 'Settings' }
  ];

  public readonly tenantId = this.route.snapshot.paramMap.get('id') ?? '';

  public readonly tenant = computed<ITenant | undefined>(() => this.store.tenants().find(t => t.id === this.tenantId));

  public readonly audit = computed(() => this.store.auditFor(this.tenantId));

  public readonly featureFlags = signal<IFeatureFlag[]>([
    { key: 'housing_module',    label: 'Recovery Housing',  description: 'Enables the Recovery Housing module and related intake flow', enabled: true },
    { key: 'lab_integration',   label: 'Lab Integration',   description: 'Connects to third-party lab providers for automated test results', enabled: false },
    { key: 'ai_notes',          label: 'AI Clinical Notes', description: 'Generate structured clinical notes from session audio', enabled: false },
    { key: 'drug_court',        label: 'Drug Court Module', description: 'Court-specific workflows, compliance reporting, and judge dashboards', enabled: true },
    { key: 'two_factor_enforce',label: 'Enforce 2FA',       description: 'Require all users to enable two-factor authentication', enabled: true }
  ]);

  public brandColor = '#2563EB';
  public timeZone = 'America/New_York';
  public locale = 'en-US';
  public internalNotes = '';

  constructor() {
    const t = this.tenant();
    if (t) {
      this.internalNotes = t.notes ?? '';
    }
  }

  public openEdit(): void {
    this.activeModal.set('edit');
    this.menuOpen.set(false);
  }

  public open(action: 'suspend' | 'activate' | 'deactivate' | 'delete' | 'impersonate' | 'subscription'): void {
    this.activeModal.set(action);
    this.menuOpen.set(false);
  }

  public onSaved(): void {
    this.activeModal.set(null);
  }

  public onDeleteClosed(): void {
    this.activeModal.set(null);
    // If tenant was archived, bounce back to list.
    const t = this.tenant();
    if (t && t.status === 'Archived') {
      this.router.navigate(['/system/tenants']);
    }
  }

  public stub(label: string): void {
    this.toast.showInfo(`${label} — coming soon.`);
  }

  public toggleFlag(f: IFeatureFlag): void {
    this.toast.showInfo(`${f.label} ${f.enabled ? 'enabled' : 'disabled'}.`);
  }

  public saveSettings(): void {
    this.toast.showSuccess('Settings saved.');
  }

  public saveNotes(): void {
    const t = this.tenant();
    if (t) this.store.update(t.id, { notes: this.internalNotes });
  }

  public mockPrograms() {
    const t = this.tenant();
    if (!t) return [];
    return Array.from({ length: t.programs }).map((_, i) => ({
      name: `${t.name.split(' ')[0]} Program ${i + 1}`,
      type: ['SUD Treatment', 'Recovery Housing', 'Drug Court', 'Case Management', 'MAT'][i % 5],
      director: t.contactName,
      clients: Math.round(t.clients / Math.max(1, t.programs)),
      staff: Math.round(t.users / Math.max(1, t.programs))
    }));
  }

  public pct(v: number, max: number): number {
    if (!max) return 0;
    return Math.min(100, Math.round((v / max) * 100));
  }

  public maskedTaxId(): string {
    const id = this.tenant()?.federalTaxId;
    if (!id) return '—';
    return '**-***' + id.slice(-4);
  }

  public formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  public statusClass(s: string): string {
    if (s === 'Active') return 'active';
    if (s === 'Trial') return 'trial';
    if (s === 'PendingActivation') return 'pending';
    if (s === 'Suspended') return 'suspended';
    if (s === 'Archived') return 'archived';
    return 'inactive';
  }

  public statusLabel(s: string): string {
    return s === 'PendingActivation' ? 'Pending' : s;
  }

  public billingClass(b: string): string {
    return b === 'N/A' ? 'na' : b.toLowerCase();
  }

  public initials(name: string): string {
    return name.split(/[\s—-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  public avatarBg(name: string): string {
    const colors = ['#2563eb', '#0891b2', '#7c3aed', '#059669', '#d97706', '#ec4899', '#0f766e', '#4f46e5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % colors.length;
    return colors[hash];
  }
}
