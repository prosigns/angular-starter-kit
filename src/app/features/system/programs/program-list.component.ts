import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { SaStatCardComponent } from '../dashboard/sa-stat-card.component';
import { ProgramStoreService } from './program-store.service';
import { IProgram, PROGRAM_TYPE_LABEL, ProgramStatus, ProgramType } from './program.types';
import { ProgramSuspendModalComponent } from './modals/program-suspend-modal.component';
import { ProgramReactivateModalComponent } from './modals/program-reactivate-modal.component';
import { ProgramDeactivateModalComponent } from './modals/program-deactivate-modal.component';
import { ProgramActivateModalComponent } from './modals/program-activate-modal.component';
import { ProgramArchiveModalComponent } from './modals/program-archive-modal.component';

type TabKey = 'all' | 'active' | 'draft' | 'suspended' | 'deactivated';
type ViewMode = 'table' | 'card';
type ModalKey = 'activate' | 'suspend' | 'reactivate' | 'deactivate' | 'archive';

interface IKebabAction {
  id: string;
  label: string;
  iconPath: string;
  danger?: boolean;
}

const KEBAB_ACTIONS: readonly IKebabAction[] = [
  { id: 'view',        label: 'View Dashboard',  iconPath: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'edit',        label: 'Edit Program',    iconPath: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125' },
  { id: 'activate',    label: 'Activate Program',iconPath: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-10.5-3.75l4.72 4.72a.75.75 0 010 1.06l-4.72 4.72' },
  { id: 'suspend',     label: 'Suspend Program', iconPath: 'M15.75 5.25v13.5m-7.5-13.5v13.5', danger: true },
  { id: 'reactivate',  label: 'Reactivate',      iconPath: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
  { id: 'deactivate',  label: 'Deactivate',      iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z', danger: true },
  { id: 'archive',     label: 'Archive',         iconPath: 'M21 8.25H3m18 0a1.875 1.875 0 000-3.75H3a1.875 1.875 0 000 3.75m18 0l-1.13 10.173c-.131 1.17-1.126 2.077-2.303 2.077H7.433c-1.177 0-2.172-.907-2.303-2.077L4 8.25m5 3h6', danger: true }
];

@Component({
  selector: 'app-program-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    SaStatCardComponent,
    ProgramActivateModalComponent,
    ProgramSuspendModalComponent,
    ProgramReactivateModalComponent,
    ProgramDeactivateModalComponent,
    ProgramArchiveModalComponent
  ],
  template: `
    <div class="pl">
      <!-- Header -->
      <header class="pl__header">
        <div>
          <p class="pl__breadcrumb">Admin · Programs</p>
          <h1 class="pl__title">All Programs</h1>
          <p class="pl__subtitle">{{ programs().length }} programs across {{ typeCount() }} types</p>
        </div>
        <div class="pl__actions">
          <button type="button" class="pl-btn pl-btn--ghost" (click)="stub('Export')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Export
          </button>
          <button type="button" class="pl-btn pl-btn--primary" (click)="goToCreate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Program
          </button>
        </div>
      </header>

      <!-- KPI row -->
      <div class="pl__stats">
        <app-sa-stat-card
          label="Active Programs"
          [value]="counts().active"
          iconPath="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
          [subtitle]="counts().total + ' total'"
        />
        <app-sa-stat-card
          label="Total Enrolled"
          [value]="kpi().enrolled"
          iconPath="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          accent="#10b981"
          [subtitle]="'of ' + kpi().capacity + ' capacity'"
        />
        <app-sa-stat-card
          label="Avg Check-In Rate"
          [value]="kpi().checkInRate + '%'"
          iconPath="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          accent="#0ea5e9"
          [subtitle]="'across active'"
        />
        <app-sa-stat-card
          label="Avg Compliance"
          [value]="kpi().complianceRate + '%'"
          iconPath="M4.26 10.147a60.438 60.438 0 000-.94 2.25 2.25 0 012.247-2.143h.95c1.168 0 2.254.6 2.87 1.591A2.865 2.865 0 0113.5 8.25a2.865 2.865 0 013.173-1.595c.616-.991 1.702-1.591 2.87-1.591h.95a2.25 2.25 0 012.247 2.143c0 .313-.007.627 0 .94"
          accent="#7c3aed"
          [subtitle]="'7-day avg'"
        />
        <app-sa-stat-card
          label="At-Risk Clients"
          [value]="kpi().atRisk"
          iconPath="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          accent="#f59e0b"
          [subtitle]="'flagged across programs'"
        />
        <app-sa-stat-card
          label="Draft / Suspended"
          [value]="(counts().draft + counts().suspended)"
          iconPath="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          accent="#64748b"
          [subtitle]="counts().draft + ' draft · ' + counts().suspended + ' suspended'"
        />
      </div>

      <!-- Tabs + filters -->
      <div class="pl__tabs">
        <button type="button" class="pl-tab" [class.pl-tab--active]="tab() === 'all'"        (click)="tab.set('all')">All <span>{{ programs().length }}</span></button>
        <button type="button" class="pl-tab" [class.pl-tab--active]="tab() === 'active'"     (click)="tab.set('active')">Active <span>{{ counts().active }}</span></button>
        <button type="button" class="pl-tab" [class.pl-tab--active]="tab() === 'draft'"      (click)="tab.set('draft')">Draft <span>{{ counts().draft }}</span></button>
        <button type="button" class="pl-tab" [class.pl-tab--active]="tab() === 'suspended'"  (click)="tab.set('suspended')">Suspended <span>{{ counts().suspended }}</span></button>
        <button type="button" class="pl-tab" [class.pl-tab--active]="tab() === 'deactivated'"(click)="tab.set('deactivated')">Deactivated <span>{{ counts().deactivated }}</span></button>
      </div>

      <div class="pl__toolbar">
        <div class="pl__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Search by name, code, director…" [(ngModel)]="searchInput" (ngModelChange)="search.set($event)" />
        </div>
        <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)" class="pl-select">
          <option value="">All Types</option>
          @for (t of allTypes; track t) { <option [value]="t">{{ typeLabel[t] }}</option> }
        </select>
        <div class="pl-view">
          <button type="button" [class.pl-view--active]="view() === 'table'" (click)="view.set('table')" aria-label="Table view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3h16.5M3.75 7.5h16.5M3.75 12h16.5" /></svg>
          </button>
          <button type="button" [class.pl-view--active]="view() === 'card'" (click)="view.set('card')" aria-label="Card view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25A2.25 2.25 0 018.25 10.5H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25A2.25 2.25 0 0110.5 15.75V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5H18A2.25 2.25 0 0120.25 15.75V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
          </button>
        </div>
      </div>

      <!-- Table view -->
      @if (view() === 'table') {
        <div class="pl__table-wrap">
          <table class="pl-table">
            <thead>
              <tr>
                <th class="pl-th pl-th--status"></th>
                <th class="pl-th">Program</th>
                <th class="pl-th">Code</th>
                <th class="pl-th">Type</th>
                <th class="pl-th">Director</th>
                <th class="pl-th">Enrolled</th>
                <th class="pl-th">Compliance</th>
                <th class="pl-th">Check-In</th>
                <th class="pl-th">At-Risk</th>
                <th class="pl-th">Status</th>
                <th class="pl-th pl-th--kebab"></th>
              </tr>
            </thead>
            <tbody>
              @for (p of filtered(); track p.id) {
                <tr class="pl-tr" (click)="openDetail(p)">
                  <td class="pl-td"><span class="pl-dot" [class]="'pl-dot--' + statusClass(p.status)"></span></td>
                  <td class="pl-td pl-td--name">
                    <div class="pl-name">
                      <div class="pl-name__title">{{ p.name }}</div>
                      <div class="pl-name__sub">Capacity {{ p.capacity }} · Updated {{ p.updatedAt }}</div>
                    </div>
                  </td>
                  <td class="pl-td"><code class="pl-code">{{ p.code }}</code></td>
                  <td class="pl-td"><span class="pl-type pl-type--{{ p.type }}">{{ typeLabel[p.type] }}</span></td>
                  <td class="pl-td">{{ p.directorName || '—' }}</td>
                  <td class="pl-td">
                    <div class="pl-usage">
                      <div class="pl-usage__num">{{ p.currentEnrollment }} / {{ p.capacity }}</div>
                      <div class="pl-usage__bar"><span [style.width.%]="capPct(p)"></span></div>
                    </div>
                  </td>
                  <td class="pl-td"><span class="pl-rate" [style.color]="rateColor(p.complianceRate, 85, 70)">{{ p.complianceRate }}%</span></td>
                  <td class="pl-td"><span class="pl-rate" [style.color]="rateColor(p.checkInRate, 80, 60)">{{ p.checkInRate }}%</span></td>
                  <td class="pl-td"><span class="pl-risk" [class.pl-risk--hi]="p.atRiskCount > 5" [class.pl-risk--mid]="p.atRiskCount > 2 && p.atRiskCount <= 5">{{ p.atRiskCount }}</span></td>
                  <td class="pl-td"><span class="pl-badge pl-badge--{{ statusClass(p.status) }}">{{ p.status }}</span></td>
                  <td class="pl-td pl-td--kebab" (click)="$event.stopPropagation()">
                    <button type="button" class="pl-kebab" aria-label="Actions" (click)="toggleKebab($event, p.id)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="12" cy="19" r="1.75"/></svg>
                    </button>
                    @if (openKebab() === p.id) {
                      <ul class="pl-menu" role="menu">
                        @for (a of actionsFor(p); track a.id) {
                          <li>
                            <button type="button" role="menuitem" [class.pl-menu__item--danger]="a.danger" (click)="runAction(a.id, p)">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" [attr.d]="a.iconPath" /></svg>
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
          @if (filtered().length === 0) {
            <div class="pl-empty">
              <p>No programs match the current filters.</p>
            </div>
          }
        </div>
      }

      <!-- Card view -->
      @if (view() === 'card') {
        <div class="pl__cards">
          @for (p of filtered(); track p.id) {
            <article class="pl-card" (click)="openDetail(p)">
              <header class="pl-card__head">
                <span class="pl-dot" [class]="'pl-dot--' + statusClass(p.status)"></span>
                <div>
                  <h3 class="pl-card__name">{{ p.name }}</h3>
                  <p class="pl-card__sub"><code>{{ p.code }}</code> · {{ typeLabel[p.type] }}</p>
                </div>
                <span class="pl-badge pl-badge--{{ statusClass(p.status) }}">{{ p.status }}</span>
              </header>
              <dl class="pl-card__grid">
                <div><dt>Director</dt><dd>{{ p.directorName || '—' }}</dd></div>
                <div><dt>Enrolled</dt><dd>{{ p.currentEnrollment }} / {{ p.capacity }}</dd></div>
                <div><dt>Check-In</dt><dd [style.color]="rateColor(p.checkInRate, 80, 60)">{{ p.checkInRate }}%</dd></div>
                <div><dt>Compliance</dt><dd [style.color]="rateColor(p.complianceRate, 85, 70)">{{ p.complianceRate }}%</dd></div>
                <div><dt>At-Risk</dt><dd>{{ p.atRiskCount }}</dd></div>
                <div><dt>Updated</dt><dd>{{ p.updatedAt }}</dd></div>
              </dl>
              <div class="pl-card__bar">
                <span [style.width.%]="capPct(p)"></span>
              </div>
            </article>
          }
          @if (filtered().length === 0) {
            <div class="pl-empty"><p>No programs match the current filters.</p></div>
          }
        </div>
      }
    </div>

    <!-- Modals -->
    @if (currentProgram(); as p) {
      @switch (activeModal()) {
        @case ('activate')    { <app-program-activate-modal    [program]="p" (close)="closeModal()" /> }
        @case ('suspend')     { <app-program-suspend-modal     [program]="p" (close)="closeModal()" /> }
        @case ('reactivate')  { <app-program-reactivate-modal  [program]="p" (close)="closeModal()" /> }
        @case ('deactivate')  { <app-program-deactivate-modal  [program]="p" (close)="closeModal()" /> }
        @case ('archive')     { <app-program-archive-modal     [program]="p" (close)="closeModal()" /> }
      }
    }
  `,
  styles: [
    `
      :host { display: block; padding: 1.25rem 1.5rem 2rem; }
      .pl__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
      .pl__breadcrumb { margin: 0; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
      .pl__title { margin: 0.25rem 0 0.125rem; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
      .pl__subtitle { margin: 0; font-size: 0.8125rem; color: #64748b; }
      .pl__actions { display: flex; gap: 0.5rem; }
      .pl-btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
      .pl-btn--ghost { background: white; color: #334155; border-color: #e2e8f0; }
      .pl-btn--primary { background: #1e40af; color: white; }
      .pl-btn--primary:hover { background: #1e3a8a; }
      .pl__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
      .pl__tabs { display: flex; gap: 0.375rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.875rem; }
      .pl-tab { background: transparent; border: 0; padding: 0.625rem 0.875rem; font-size: 0.8125rem; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; font-weight: 500; }
      .pl-tab span { background: #f1f5f9; color: #475569; padding: 0.05rem 0.4rem; border-radius: 9999px; font-size: 0.6875rem; margin-left: 0.25rem; }
      .pl-tab--active { color: #1e40af; border-bottom-color: #1e40af; font-weight: 600; }
      .pl-tab--active span { background: #dbeafe; color: #1e40af; }
      .pl__toolbar { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.875rem; flex-wrap: wrap; }
      .pl__search { display: flex; align-items: center; gap: 0.375rem; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.375rem 0.625rem; flex: 1; min-width: 260px; }
      .pl__search input { border: 0; outline: none; font-size: 0.8125rem; flex: 1; color: #0f172a; background: transparent; }
      .pl-select { padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; background: white; font-size: 0.8125rem; color: #0f172a; }
      .pl-view { display: flex; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
      .pl-view button { border: 0; background: white; padding: 0.5rem 0.625rem; cursor: pointer; color: #64748b; }
      .pl-view--active { background: #eff6ff; color: #1e40af; }
      .pl__table-wrap { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
      .pl-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
      .pl-th { text-align: left; padding: 0.625rem 0.75rem; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; }
      .pl-th--status, .pl-th--kebab { width: 28px; }
      .pl-tr { cursor: pointer; }
      .pl-tr:hover { background: #f8fafc; }
      .pl-td { padding: 0.625rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: middle; position: relative; }
      .pl-td--name { min-width: 200px; }
      .pl-td--kebab { text-align: right; width: 28px; padding-right: 0.5rem; }
      .pl-dot { display: inline-block; width: 9px; height: 9px; border-radius: 9999px; }
      .pl-dot--active { background: #16a34a; }
      .pl-dot--draft { background: #64748b; }
      .pl-dot--suspended { background: #dc2626; }
      .pl-dot--deactivated { background: #334155; }
      .pl-dot--archived { background: #94a3b8; }
      .pl-name__title { font-weight: 600; color: #0f172a; }
      .pl-name__sub { font-size: 0.75rem; color: #64748b; margin-top: 0.125rem; }
      .pl-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f1f5f9; color: #334155; padding: 0.05rem 0.4rem; border-radius: 4px; font-size: 0.75rem; }
      .pl-type { display: inline-flex; align-items: center; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
      .pl-type--RH { background: #f0fdfa; color: #0f766e; border-color: #99f6e4; }
      .pl-type--DC { background: #fef3c7; color: #92400e; border-color: #fde68a; }
      .pl-type--PP { background: #fce7f3; color: #9d174d; border-color: #fbcfe8; }
      .pl-type--MAT { background: #ede9fe; color: #5b21b6; border-color: #ddd6fe; }
      .pl-type--CM { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
      .pl-type--SUD { background: #eff6ff; color: #1e40af; border-color: #dbeafe; }
      .pl-type--CBO { background: #f3f4f6; color: #374151; border-color: #d1d5db; }
      .pl-type--DW  { background: #fff1f2; color: #9f1239; border-color: #ffe4e6; }
      .pl-type--OTH { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
      .pl-usage__num { font-weight: 600; font-size: 0.8125rem; }
      .pl-usage__bar { display: block; width: 100%; height: 4px; background: #e2e8f0; border-radius: 9999px; margin-top: 0.25rem; overflow: hidden; }
      .pl-usage__bar span { display: block; height: 100%; background: linear-gradient(90deg, #16a34a, #22c55e); border-radius: 9999px; }
      .pl-rate { font-weight: 600; }
      .pl-risk { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: #f0fdf4; color: #166534; }
      .pl-risk--mid { background: #fffbeb; color: #92400e; }
      .pl-risk--hi { background: #fef2f2; color: #991b1b; }
      .pl-badge { display: inline-flex; align-items: center; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; border: 1px solid; }
      .pl-badge--active { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
      .pl-badge--draft { background: #f8fafc; color: #475569; border-color: #cbd5e1; }
      .pl-badge--suspended { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
      .pl-badge--deactivated { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
      .pl-badge--archived { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; }
      .pl-kebab { background: transparent; border: 0; color: #64748b; padding: 0.25rem; cursor: pointer; border-radius: 4px; }
      .pl-kebab:hover { background: #f1f5f9; color: #0f172a; }
      .pl-menu { position: absolute; right: 0.5rem; top: 100%; margin-top: 0.25rem; min-width: 200px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(15,23,42,0.1); list-style: none; padding: 0.25rem; margin: 0.25rem 0 0; z-index: 20; }
      .pl-menu li button { width: 100%; display: flex; align-items: center; gap: 0.5rem; background: transparent; border: 0; padding: 0.5rem 0.625rem; font-size: 0.8125rem; color: #334155; text-align: left; cursor: pointer; border-radius: 4px; font-family: inherit; }
      .pl-menu li button:hover { background: #f1f5f9; color: #0f172a; }
      .pl-menu__item--danger { color: #dc2626 !important; }
      .pl-menu__item--danger:hover { background: #fef2f2 !important; color: #991b1b !important; }
      .pl-empty { padding: 2rem; text-align: center; color: #64748b; font-size: 0.875rem; background: white; border: 1px dashed #e2e8f0; border-radius: 8px; }
      .pl__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.875rem; }
      .pl-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.875rem 1rem; cursor: pointer; transition: box-shadow 0.15s ease, border-color 0.15s ease; }
      .pl-card:hover { border-color: #93c5fd; box-shadow: 0 4px 12px -4px rgba(30,64,175,0.15); }
      .pl-card__head { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.625rem; }
      .pl-card__head > div { flex: 1; min-width: 0; }
      .pl-card__name { margin: 0; font-size: 0.9375rem; font-weight: 600; color: #0f172a; }
      .pl-card__sub { margin: 0.125rem 0 0; font-size: 0.75rem; color: #64748b; }
      .pl-card__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; margin: 0 0 0.625rem; padding: 0; }
      .pl-card__grid > div { display: flex; flex-direction: column; }
      .pl-card__grid dt { margin: 0; font-size: 0.6875rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
      .pl-card__grid dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .pl-card__bar { display: block; width: 100%; height: 4px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; }
      .pl-card__bar span { display: block; height: 100%; background: linear-gradient(90deg, #1e40af, #3b82f6); }
    `
  ]
})
export class ProgramListComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  public readonly programs = this.store.programs;
  public readonly counts = this.store.counts;
  public readonly kpi = this.store.kpi;

  public readonly tab = signal<TabKey>('all');
  public readonly search = signal('');
  public readonly typeFilter = signal<ProgramType | ''>('');
  public readonly view = signal<ViewMode>('table');
  public readonly openKebab = signal<string | null>(null);
  public readonly activeModal = signal<ModalKey | null>(null);
  public readonly currentProgram = signal<IProgram | null>(null);

  public searchInput = '';

  public readonly allTypes: ProgramType[] = ['SUD', 'RH', 'DC', 'PP', 'CM', 'MAT', 'CBO', 'DW', 'OTH'];
  public readonly typeLabel = PROGRAM_TYPE_LABEL;

  public readonly typeCount = computed(() => new Set(this.programs().map(p => p.type)).size);

  public readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const tab = this.tab();
    const type = this.typeFilter();
    return this.programs().filter(p => {
      if (tab === 'active' && p.status !== 'Active') return false;
      if (tab === 'draft' && p.status !== 'Draft') return false;
      if (tab === 'suspended' && p.status !== 'Suspended') return false;
      if (tab === 'deactivated' && (p.status !== 'Deactivated' && p.status !== 'Archived')) return false;
      if (type && p.type !== type) return false;
      if (term) {
        const hay = `${p.name} ${p.code} ${p.directorName ?? ''} ${p.type}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  });

  public statusClass(s: ProgramStatus): string {
    return s.toLowerCase();
  }

  public capPct(p: IProgram): number {
    return p.capacity > 0 ? Math.min(100, Math.round((p.currentEnrollment / p.capacity) * 100)) : 0;
  }

  public rateColor(value: number, good: number, warn: number): string {
    if (value >= good) return '#15803d';
    if (value >= warn) return '#b45309';
    return '#b91c1c';
  }

  public actionsFor(p: IProgram): IKebabAction[] {
    const actions: IKebabAction[] = [KEBAB_ACTIONS[0], KEBAB_ACTIONS[1]];
    if (p.status === 'Draft') actions.push(KEBAB_ACTIONS[2]);
    if (p.status === 'Active') actions.push(KEBAB_ACTIONS[3]);
    if (p.status === 'Suspended') actions.push(KEBAB_ACTIONS[4]);
    if (p.status === 'Active' || p.status === 'Suspended') actions.push(KEBAB_ACTIONS[5]);
    if (p.status === 'Deactivated') actions.push(KEBAB_ACTIONS[6]);
    return actions;
  }

  public toggleKebab(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.openKebab.set(this.openKebab() === id ? null : id);
  }

  public runAction(actionId: string, p: IProgram): void {
    this.openKebab.set(null);
    switch (actionId) {
      case 'view':
        this.openDetail(p);
        return;
      case 'edit':
        this.router.navigate(['/system/programs', p.id], { queryParams: { edit: 1 } });
        return;
      case 'activate':
      case 'suspend':
      case 'reactivate':
      case 'deactivate':
      case 'archive':
        this.currentProgram.set(p);
        this.activeModal.set(actionId as ModalKey);
        return;
    }
  }

  public openDetail(p: IProgram): void {
    this.router.navigate(['/system/programs', p.id]);
  }

  public goToCreate(): void {
    this.router.navigate(['/system/programs/new']);
  }

  public closeModal(): void {
    this.activeModal.set(null);
    this.currentProgram.set(null);
  }

  public stub(label: string): void {
    this.toast.showInfo(`${label} (stub)`);
  }

  @HostListener('document:click')
  public onDocumentClick(): void {
    if (this.openKebab()) this.openKebab.set(null);
  }
}
