import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SaAreaChartComponent, IAreaChartPoint } from './sa-area-chart.component';
import { SaBarChartComponent, IBarChartData } from './sa-bar-chart.component';
import { SaStatCardComponent } from './sa-stat-card.component';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

interface ISecurityAlert {
  id: string;
  title: string;
  tenant: string;
  severity: AlertSeverity;
  time: string;
}

interface IActiveSession {
  id: string;
  user: string;
  role: string;
  tenant: string;
  ip: string;
  duration: string;
}

interface IRecentTenant {
  id: string;
  name: string;
  plan: string;
  users: number;
  status: 'active' | 'trial' | 'suspended';
  joined: string;
}

interface ISystemHealthItem {
  id: string;
  service: string;
  status: 'operational' | 'degraded' | 'down';
  latency: string;
  uptime: string;
}

@Component({
  selector: 'app-system-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
    SaStatCardComponent,
    SaAreaChartComponent,
    SaBarChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sa-page">
      <!-- Welcome banner -->
      <header class="sa-banner" aria-label="System administrator overview">
        <div class="sa-banner__content">
          <div class="sa-banner__left">
            <p class="sa-banner__eyebrow">System Administrator</p>
            <h1 class="sa-banner__title">{{ greeting() }}, {{ firstName() }}</h1>
            <p class="sa-banner__meta">
              <span>{{ now | date: 'fullDate' }}</span>
              <span class="sa-banner__dot" aria-hidden="true">•</span>
              <span>Last login: {{ lastLogin | date: 'medium' }}</span>
            </p>
          </div>
          <div class="sa-banner__right">
            <span class="sa-badge sa-badge--success" role="status" aria-label="System operational">
              <span class="sa-badge__pulse" aria-hidden="true"></span>
              All systems operational
            </span>
          </div>
        </div>
      </header>

      <!-- KPI cards -->
      <section class="sa-kpi" aria-label="Key metrics">
        <app-sa-stat-card
          label="Active Tenants"
          [value]="kpi().tenants"
          accent="#2563eb"
          trend="+3 this month"
          trendDirection="up"
          subtitle="Organizations onboarded"
          route="/system/tenants"
          iconPath="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10"
        />
        <app-sa-stat-card
          label="Total Users"
          [value]="formatNumber(kpi().users)"
          accent="#7c3aed"
          trend="+128 this week"
          trendDirection="up"
          subtitle="Across all tenants"
          route="/system/users"
          iconPath="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M17 3.13a4 4 0 010 7.75"
        />
        <app-sa-stat-card
          label="Active Clients"
          [value]="formatNumber(kpi().clients)"
          accent="#059669"
          trend="+42 this week"
          trendDirection="up"
          subtitle="Receiving care"
          route="/system/clients"
          iconPath="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87m6-4a4 4 0 100-8 4 4 0 000 8zm6 0a3 3 0 100-6 3 3 0 000 6zm-12 0a3 3 0 100-6 3 3 0 000 6z"
        />
        <app-sa-stat-card
          label="Today's Sessions"
          [value]="formatNumber(kpi().sessions)"
          accent="#d97706"
          trend="+8% vs yesterday"
          trendDirection="up"
          subtitle="Care visits completed"
          route="/system/sessions"
          iconPath="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <app-sa-stat-card
          label="Security Alerts"
          [value]="kpi().alerts"
          [accent]="kpi().alerts > 0 ? '#dc2626' : '#059669'"
          [trend]="kpi().alerts > 0 ? 'Needs review' : 'All clear'"
          [trendDirection]="kpi().alerts > 0 ? 'down' : 'up'"
          subtitle="Open incidents"
          route="/system/security/alerts"
          iconPath="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
        <app-sa-stat-card
          label="System Uptime"
          [value]="kpi().uptime"
          accent="#059669"
          trend="30d avg"
          trendDirection="up"
          subtitle="SLA: 99.9%"
          route="/system/monitoring"
          iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </section>

      <!-- Charts -->
      <section class="sa-charts" aria-label="Trends">
        <article class="sa-panel">
          <header class="sa-panel__header">
            <div>
              <h2 class="sa-panel__title">Tenant Growth</h2>
              <p class="sa-panel__subtitle">Active tenants over the last 12 months</p>
            </div>
            <div class="sa-panel__actions">
              <span class="sa-chip">12M</span>
            </div>
          </header>
          <div class="sa-panel__body sa-panel__body--chart">
            <app-sa-area-chart [data]="tenantGrowth" accent="#2563eb" idSuffix="tenants" />
          </div>
        </article>

        <article class="sa-panel">
          <header class="sa-panel__header">
            <div>
              <h2 class="sa-panel__title">User Activity</h2>
              <p class="sa-panel__subtitle">Engagement across the last 7 days</p>
            </div>
            <div class="sa-panel__actions">
              <span class="sa-chip">7D</span>
            </div>
          </header>
          <div class="sa-panel__body sa-panel__body--chart">
            <app-sa-bar-chart [data]="userActivity" />
          </div>
        </article>
      </section>

      <!-- Tables grid -->
      <section class="sa-tables" aria-label="Operational detail">
        <!-- Recent Security Alerts -->
        <article class="sa-panel">
          <header class="sa-panel__header">
            <div>
              <h2 class="sa-panel__title">Recent Security Alerts</h2>
              <p class="sa-panel__subtitle">Latest events requiring review</p>
            </div>
            <a routerLink="/system/security/alerts" class="sa-link">View all</a>
          </header>
          <div class="sa-panel__body">
            <div class="sa-table-wrap">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th scope="col">Alert</th>
                    <th scope="col">Tenant</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Time</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of alerts; track a.id) {
                    <tr>
                      <td class="sa-table__primary">{{ a.title }}</td>
                      <td>{{ a.tenant }}</td>
                      <td>
                        <span class="sa-sev sa-sev--{{ a.severity }}">{{ a.severity }}</span>
                      </td>
                      <td class="sa-table__muted">{{ a.time }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="sa-table__empty">No alerts — you're all clear.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <!-- Active Sessions -->
        <article class="sa-panel">
          <header class="sa-panel__header">
            <div>
              <h2 class="sa-panel__title">Active Sessions</h2>
              <p class="sa-panel__subtitle">Users currently signed in</p>
            </div>
            <a routerLink="/system/security/sessions" class="sa-link">View all</a>
          </header>
          <div class="sa-panel__body">
            <div class="sa-table-wrap">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Role</th>
                    <th scope="col">Tenant</th>
                    <th scope="col">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of sessions; track s.id) {
                    <tr>
                      <td class="sa-table__primary">{{ s.user }}</td>
                      <td>{{ s.role }}</td>
                      <td>{{ s.tenant }}</td>
                      <td class="sa-table__muted">{{ s.duration }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <!-- Recent Tenants -->
        <article class="sa-panel">
          <header class="sa-panel__header">
            <div>
              <h2 class="sa-panel__title">Recent Tenants</h2>
              <p class="sa-panel__subtitle">Newest organizations</p>
            </div>
            <a routerLink="/system/tenants" class="sa-link">Manage</a>
          </header>
          <div class="sa-panel__body">
            <div class="sa-table-wrap">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th scope="col">Organization</th>
                    <th scope="col">Plan</th>
                    <th scope="col">Users</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of tenants; track t.id) {
                    <tr>
                      <td class="sa-table__primary">{{ t.name }}</td>
                      <td>{{ t.plan }}</td>
                      <td>{{ t.users }}</td>
                      <td>
                        <span class="sa-pill sa-pill--{{ t.status }}">{{ t.status }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <!-- System Health -->
        <article class="sa-panel">
          <header class="sa-panel__header">
            <div>
              <h2 class="sa-panel__title">System Health</h2>
              <p class="sa-panel__subtitle">Service availability snapshot</p>
            </div>
            <a routerLink="/system/monitoring" class="sa-link">Details</a>
          </header>
          <div class="sa-panel__body">
            <div class="sa-table-wrap">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Status</th>
                    <th scope="col">Latency</th>
                    <th scope="col">Uptime</th>
                  </tr>
                </thead>
                <tbody>
                  @for (h of health; track h.id) {
                    <tr>
                      <td class="sa-table__primary">{{ h.service }}</td>
                      <td>
                        <span class="sa-pill sa-pill--{{ h.status }}">{{ h.status }}</span>
                      </td>
                      <td class="sa-table__muted">{{ h.latency }}</td>
                      <td class="sa-table__muted">{{ h.uptime }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>

      <!-- Quick actions -->
      <section class="sa-actions" aria-label="Quick actions">
        <header class="sa-actions__head">
          <h2 class="sa-panel__title">Quick Actions</h2>
          <p class="sa-panel__subtitle">Common administrative tasks</p>
        </header>
        <div class="sa-actions__grid">
          <a routerLink="/system/tenants/new" class="sa-action" aria-label="Create tenant">
            <span class="sa-action__icon" style="--sa-accent: #2563eb">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
              </svg>
            </span>
            <span class="sa-action__body">
              <span class="sa-action__title">New Tenant</span>
              <span class="sa-action__sub">Onboard an organization</span>
            </span>
          </a>

          <a routerLink="/system/users/new" class="sa-action" aria-label="Create user">
            <span class="sa-action__icon" style="--sa-accent: #7c3aed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM19 8v6m3-3h-6"
                />
              </svg>
            </span>
            <span class="sa-action__body">
              <span class="sa-action__title">Add User</span>
              <span class="sa-action__sub">Create account & assign role</span>
            </span>
          </a>

          <a routerLink="/system/security/alerts" class="sa-action" aria-label="Review alerts">
            <span class="sa-action__icon" style="--sa-accent: #dc2626">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </span>
            <span class="sa-action__body">
              <span class="sa-action__title">Review Alerts</span>
              <span class="sa-action__sub">Open security incidents</span>
            </span>
          </a>

          <a routerLink="/system/audit-logs" class="sa-action" aria-label="Audit logs">
            <span class="sa-action__icon" style="--sa-accent: #059669">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <span class="sa-action__body">
              <span class="sa-action__title">Audit Logs</span>
              <span class="sa-action__sub">Trace system events</span>
            </span>
          </a>

          <a routerLink="/system/settings" class="sa-action" aria-label="Platform settings">
            <span class="sa-action__icon" style="--sa-accent: #475569">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.325 4.317a2 2 0 013.35 0l.387.684a2 2 0 001.923 1.01l.785-.05a2 2 0 012.072 2.072l-.05.785a2 2 0 001.01 1.923l.684.387a2 2 0 010 3.35l-.684.387a2 2 0 00-1.01 1.923l.05.785a2 2 0 01-2.072 2.072l-.785-.05a2 2 0 00-1.923 1.01l-.387.684a2 2 0 01-3.35 0l-.387-.684a2 2 0 00-1.923-1.01l-.785.05a2 2 0 01-2.072-2.072l.05-.785a2 2 0 00-1.01-1.923l-.684-.387a2 2 0 010-3.35l.684-.387a2 2 0 001.01-1.923l-.05-.785a2 2 0 012.072-2.072l.785.05a2 2 0 001.923-1.01l.387-.684zM12 15a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            </span>
            <span class="sa-action__body">
              <span class="sa-action__title">Platform Settings</span>
              <span class="sa-action__sub">Configure global options</span>
            </span>
          </a>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .sa-page {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      /* Banner */
      .sa-banner {
        background: linear-gradient(135deg, #1b3a5c 0%, #2a5f8f 100%);
        color: #f8fafc;
        border-radius: 14px;
        padding: 1.5rem 1.75rem;
        box-shadow: 0 8px 24px -12px rgba(15, 23, 42, 0.25);
      }
      .sa-banner__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .sa-banner__eyebrow {
        margin: 0;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #93c5fd;
      }
      .sa-banner__title {
        margin: 0.25rem 0 0;
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .sa-banner__meta {
        margin: 0.375rem 0 0;
        font-size: 0.8125rem;
        color: #cbd5e1;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .sa-banner__dot {
        color: #64748b;
      }
      .sa-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .sa-badge__pulse {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
        animation: sa-pulse 2s infinite;
      }
      @keyframes sa-pulse {
        0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6); }
        70% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
        100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
      }

      /* KPI grid */
      .sa-kpi {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 0.875rem;
      }

      /* Chart grid */
      .sa-charts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.875rem;
      }

      /* Tables grid */
      .sa-tables {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.875rem;
      }

      /* Panels */
      .sa-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .sa-panel__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.125rem 0.75rem;
      }
      .sa-panel__title {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 600;
        color: #0f172a;
      }
      .sa-panel__subtitle {
        margin: 0.125rem 0 0;
        font-size: 0.75rem;
        color: #64748b;
      }
      .sa-panel__actions {
        display: inline-flex;
        gap: 0.375rem;
      }
      .sa-panel__body {
        padding: 0.25rem 1.125rem 1.125rem;
        flex: 1;
        min-height: 0;
      }
      .sa-panel__body--chart {
        min-height: 300px;
        padding: 0.75rem 1.125rem 1.125rem;
      }
      .sa-chip {
        display: inline-flex;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.6875rem;
        font-weight: 600;
        color: #475569;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
      }
      .sa-link {
        font-size: 0.75rem;
        font-weight: 600;
        color: #2563eb;
        text-decoration: none;
        white-space: nowrap;
      }
      .sa-link:hover {
        text-decoration: underline;
      }

      /* Tables */
      .sa-table-wrap {
        overflow: auto;
        border-top: 1px solid #f1f5f9;
        max-height: 320px;
      }
      .sa-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
      }
      .sa-table thead th {
        position: sticky;
        top: 0;
        background: #f8fafc;
        color: #64748b;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        text-align: left;
        padding: 0.625rem 0.875rem;
        border-bottom: 1px solid #e2e8f0;
        z-index: 1;
      }
      .sa-table tbody td {
        padding: 0.625rem 0.875rem;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        vertical-align: middle;
      }
      .sa-table tbody tr:last-child td {
        border-bottom: 0;
      }
      .sa-table tbody tr:hover td {
        background: #f8fafc;
      }
      .sa-table__primary {
        font-weight: 600;
        color: #0f172a;
      }
      .sa-table__muted {
        color: #64748b;
      }
      .sa-table__empty {
        text-align: center;
        padding: 1.5rem;
        color: #64748b;
        font-size: 0.8125rem;
      }

      /* Severity labels */
      .sa-sev {
        display: inline-flex;
        align-items: center;
        padding: 0.1875rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      .sa-sev--critical { color: #7f1d1d; background: #fee2e2; }
      .sa-sev--high     { color: #9a3412; background: #ffedd5; }
      .sa-sev--medium   { color: #92400e; background: #fef3c7; }
      .sa-sev--low      { color: #1e40af; background: #dbeafe; }

      /* Status pills */
      .sa-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.1875rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      .sa-pill--active,
      .sa-pill--operational { color: #065f46; background: #d1fae5; }
      .sa-pill--trial,
      .sa-pill--degraded    { color: #92400e; background: #fef3c7; }
      .sa-pill--suspended,
      .sa-pill--down        { color: #7f1d1d; background: #fee2e2; }

      /* Quick actions */
      .sa-actions {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem 1.125rem 1.125rem;
      }
      .sa-actions__head {
        margin-bottom: 0.875rem;
      }
      .sa-actions__grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.75rem;
      }
      .sa-action {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0.875rem;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #ffffff;
        text-decoration: none;
        transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
      }
      .sa-action:hover {
        border-color: color-mix(in srgb, var(--sa-accent, #2563eb) 35%, #e2e8f0);
        box-shadow: 0 6px 14px -8px rgba(15, 23, 42, 0.18);
      }
      .sa-action:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }
      .sa-action__icon {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: var(--sa-accent, #2563eb);
        background: color-mix(in srgb, var(--sa-accent, #2563eb) 10%, transparent);
      }
      .sa-action__icon svg { width: 18px; height: 18px; }
      .sa-action__body { display: flex; flex-direction: column; min-width: 0; }
      .sa-action__title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #0f172a;
      }
      .sa-action__sub {
        font-size: 0.6875rem;
        color: #64748b;
      }

      /* Responsive */
      @media (max-width: 1439px) {
        .sa-kpi { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .sa-actions__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }
      @media (max-width: 1023px) {
        .sa-kpi { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .sa-charts,
        .sa-tables { grid-template-columns: minmax(0, 1fr); }
        .sa-actions__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .sa-banner { padding: 1.125rem 1.25rem; }
        .sa-banner__title { font-size: 1.25rem; }
        .sa-kpi,
        .sa-actions__grid { grid-template-columns: minmax(0, 1fr); }
      }
    `
  ]
})
export class SystemDashboardComponent {
  private readonly authService = inject(AuthService);

  public readonly now = new Date();
  public readonly lastLogin = new Date(Date.now() - 1000 * 60 * 60 * 6);

  private readonly user = signal(this.authService.getCurrentUser());

  public readonly firstName = computed(() => this.user()?.firstName ?? 'Admin');

  public readonly greeting = computed(() => {
    const h = this.now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  public readonly kpi = signal({
    tenants: 147,
    users: 8342,
    clients: 12_487,
    sessions: 1_256,
    alerts: 3,
    uptime: '99.98%'
  });

  public readonly tenantGrowth: IAreaChartPoint[] = [
    { label: 'May', value: 92 },
    { label: 'Jun', value: 98 },
    { label: 'Jul', value: 104 },
    { label: 'Aug', value: 111 },
    { label: 'Sep', value: 118 },
    { label: 'Oct', value: 124 },
    { label: 'Nov', value: 129 },
    { label: 'Dec', value: 133 },
    { label: 'Jan', value: 137 },
    { label: 'Feb', value: 141 },
    { label: 'Mar', value: 144 },
    { label: 'Apr', value: 147 }
  ];

  public readonly userActivity: IBarChartData = {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      { name: 'Logins', color: '#2563eb', values: [420, 465, 510, 498, 523, 318, 286] },
      { name: 'Check-Ins', color: '#059669', values: [312, 355, 378, 362, 401, 248, 210] },
      { name: 'Messages', color: '#7c3aed', values: [198, 224, 248, 236, 259, 141, 122] }
    ]
  };

  public readonly alerts: ISecurityAlert[] = [
    {
      id: 'a1',
      title: 'Multiple failed logins',
      tenant: 'Northwind Care',
      severity: 'high',
      time: '12m ago'
    },
    {
      id: 'a2',
      title: 'Unusual access pattern',
      tenant: 'Riverside Health',
      severity: 'medium',
      time: '1h ago'
    },
    {
      id: 'a3',
      title: 'Password reset spike',
      tenant: 'Evergreen Home',
      severity: 'low',
      time: '3h ago'
    }
  ];

  public readonly sessions: IActiveSession[] = [
    { id: 's1', user: 'Sarah Chen', role: 'Admin', tenant: 'Northwind', ip: '', duration: '2h 14m' },
    { id: 's2', user: 'Marcus Doyle', role: 'Caregiver', tenant: 'Riverside', ip: '', duration: '47m' },
    { id: 's3', user: 'Priya Patel', role: 'Manager', tenant: 'Evergreen', ip: '', duration: '1h 08m' },
    { id: 's4', user: 'James Wu', role: 'Caregiver', tenant: 'Northwind', ip: '', duration: '22m' }
  ];

  public readonly tenants: IRecentTenant[] = [
    { id: 't1', name: 'Harbor Point Home', plan: 'Professional', users: 42, status: 'active', joined: '2d' },
    { id: 't2', name: 'Sunset Senior Care', plan: 'Enterprise', users: 128, status: 'active', joined: '5d' },
    { id: 't3', name: 'Bright Horizon', plan: 'Starter', users: 8, status: 'trial', joined: '1w' },
    { id: 't4', name: 'Meadowbrook Care', plan: 'Professional', users: 31, status: 'active', joined: '2w' }
  ];

  public formatNumber(n: number): string {
    return n.toLocaleString('en-US');
  }

  public readonly health: ISystemHealthItem[] = [
    { id: 'h1', service: 'API Gateway', status: 'operational', latency: '82ms', uptime: '99.99%' },
    { id: 'h2', service: 'Auth Service', status: 'operational', latency: '41ms', uptime: '100%' },
    { id: 'h3', service: 'Database', status: 'operational', latency: '11ms', uptime: '99.97%' },
    { id: 'h4', service: 'File Storage', status: 'degraded', latency: '318ms', uptime: '99.82%' },
    { id: 'h5', service: 'Notifications', status: 'operational', latency: '64ms', uptime: '99.95%' }
  ];
}
