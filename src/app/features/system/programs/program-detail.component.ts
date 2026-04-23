import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { ProgramStoreService } from './program-store.service';
import {
  FEATURE_LABEL,
  FeatureKey,
  IEnrollment,
  IProgram,
  PROGRAM_TYPE_LABEL,
  STAFF_ROLE_LABEL,
  riskBand
} from './program.types';
import { ProgramActivateModalComponent } from './modals/program-activate-modal.component';
import { ProgramSuspendModalComponent } from './modals/program-suspend-modal.component';
import { ProgramReactivateModalComponent } from './modals/program-reactivate-modal.component';
import { ProgramDeactivateModalComponent } from './modals/program-deactivate-modal.component';
import { ProgramArchiveModalComponent } from './modals/program-archive-modal.component';
import { ProgramStaffAssignModalComponent } from './modals/program-staff-assign-modal.component';
import { ProgramEnrollModalComponent } from './modals/program-enroll-modal.component';
import { ProgramDischargeModalComponent } from './modals/program-discharge-modal.component';
import { ProgramFeatureToggleModalComponent } from './modals/program-feature-toggle-modal.component';

type TabKey =
  | 'overview'
  | 'clients'
  | 'staff'
  | 'phases'
  | 'checkins'
  | 'appointments'
  | 'compliance'
  | 'ua'
  | 'housing'
  | 'court'
  | 'documents'
  | 'notifications'
  | 'features'
  | 'audit';

type ModalKey =
  | 'activate'
  | 'suspend'
  | 'reactivate'
  | 'deactivate'
  | 'archive'
  | 'staff-assign'
  | 'enroll'
  | 'discharge'
  | 'feature-toggle';

interface ITabDef {
  key: TabKey;
  label: string;
  condition?: (p: IProgram) => boolean;
}

@Component({
  selector: 'app-program-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProgramActivateModalComponent,
    ProgramSuspendModalComponent,
    ProgramReactivateModalComponent,
    ProgramDeactivateModalComponent,
    ProgramArchiveModalComponent,
    ProgramStaffAssignModalComponent,
    ProgramEnrollModalComponent,
    ProgramDischargeModalComponent,
    ProgramFeatureToggleModalComponent
  ],
  template: `
    @if (program(); as p) {
      <div class="pd">
        <!-- Header -->
        <header class="pd__header">
          <div class="pd__crumbs">
            <a routerLink="/system/programs">Programs</a>
            <span>›</span>
            <span>{{ p.name }}</span>
          </div>
          <div class="pd__title-row">
            <div>
              <h1 class="pd__title">
                {{ p.name }}
                <span class="pd-badge pd-badge--{{ p.status.toLowerCase() }}">{{ p.status }}</span>
              </h1>
              <p class="pd__meta">
                <code>{{ p.code }}</code> ·
                <span class="pd-type pd-type--{{ p.type }}">{{ typeLabel[p.type] }}</span> ·
                Director: {{ p.directorName || '—' }} ·
                Capacity: {{ p.currentEnrollment }}/{{ p.capacity }}
                @if (p.activatedAt) { · Active since {{ p.activatedAt }} }
              </p>
            </div>
            <div class="pd__actions">
              @if (p.status === 'Draft') {
                <button type="button" class="pd-btn pd-btn--primary" (click)="open('activate')">Activate</button>
              }
              @if (p.status === 'Active') {
                <button type="button" class="pd-btn pd-btn--warn"  (click)="open('suspend')">Suspend</button>
                <button type="button" class="pd-btn pd-btn--ghost" (click)="open('deactivate')">Deactivate</button>
              }
              @if (p.status === 'Suspended') {
                <button type="button" class="pd-btn pd-btn--primary" (click)="open('reactivate')">Reactivate</button>
                <button type="button" class="pd-btn pd-btn--ghost" (click)="open('deactivate')">Deactivate</button>
              }
              @if (p.status === 'Deactivated') {
                <button type="button" class="pd-btn pd-btn--ghost" (click)="open('archive')">Archive</button>
              }
            </div>
          </div>
        </header>

        <!-- Tabs -->
        <nav class="pd__tabs" role="tablist">
          @for (t of visibleTabs(); track t.key) {
            <button
              type="button"
              role="tab"
              class="pd-tab"
              [class.pd-tab--active]="activeTab() === t.key"
              (click)="activeTab.set(t.key)"
            >{{ t.label }}</button>
          }
        </nav>

        <!-- Tab content -->
        <section class="pd__body">
          @switch (activeTab()) {

            @case ('overview') {
              <div class="pd__grid-stats">
                <div class="pd-kpi"><p>Enrolled</p><strong>{{ p.currentEnrollment }} / {{ p.capacity }}</strong><small>{{ capPct(p) }}% capacity</small></div>
                <div class="pd-kpi"><p>Check-In Rate</p><strong>{{ p.checkInRate }}%</strong><small>today</small></div>
                <div class="pd-kpi"><p>Compliance</p><strong>{{ p.complianceRate }}%</strong><small>7-day avg</small></div>
                <div class="pd-kpi"><p>At-Risk</p><strong>{{ p.atRiskCount }}</strong><small>flagged clients</small></div>
                <div class="pd-kpi"><p>Negative UAs</p><strong>{{ p.negativeUaRate }}%</strong><small>30-day</small></div>
                <div class="pd-kpi"><p>Appt Adherence</p><strong>{{ p.appointmentAdherence }}%</strong><small>30-day</small></div>
              </div>

              <div class="pd__grid-two">
                <section class="pd-panel">
                  <header><h2>Program Info</h2></header>
                  <dl class="pd-dl">
                    <div><dt>Type</dt><dd>{{ typeLabel[p.type] }}</dd></div>
                    <div><dt>Director</dt><dd>{{ p.directorName || '—' }}</dd></div>
                    <div><dt>Staff</dt><dd>{{ p.staff.length }}</dd></div>
                    <div><dt>Phases</dt><dd>{{ p.phases.length }}</dd></div>
                    <div><dt>Compliance Rules</dt><dd>{{ p.complianceRules.length }}</dd></div>
                    <div><dt>Active Features</dt><dd>{{ enabledFeatureCount(p) }} / 18</dd></div>
                    <div><dt>Created</dt><dd>{{ p.createdAt }}</dd></div>
                    <div><dt>Updated</dt><dd>{{ p.updatedAt }}</dd></div>
                  </dl>
                  @if (p.description) {
                    <p class="pd-desc">{{ p.description }}</p>
                  }
                </section>

                <section class="pd-panel">
                  <header><h2>At-Risk Clients</h2></header>
                  @if (atRiskClients(p).length === 0) {
                    <p class="pd-empty">No at-risk clients in the active caseload.</p>
                  } @else {
                    <ul class="pd-list">
                      @for (c of atRiskClients(p); track c.id) {
                        <li>
                          <span class="pd-pill pd-pill--{{ riskBand(c.riskScore).toLowerCase() }}">{{ riskBand(c.riskScore) }}</span>
                          <div>
                            <strong>{{ c.clientName }}</strong>
                            <small>Risk {{ c.riskScore }} · Compliance {{ c.complianceRate }}% · Check-In {{ c.checkInRate }}%</small>
                          </div>
                        </li>
                      }
                    </ul>
                  }
                </section>
              </div>
            }

            @case ('clients') {
              <header class="pd-tab-head">
                <h2>Enrolled Clients <small>({{ activeEnrollments(p).length }})</small></h2>
                <button type="button" class="pd-btn pd-btn--primary" (click)="open('enroll')" [disabled]="p.status !== 'Active'">Enroll Client</button>
              </header>
              @if (activeEnrollments(p).length === 0) {
                <p class="pd-empty">No active enrollments.</p>
              } @else {
                <table class="pd-table">
                  <thead><tr>
                    <th>Client</th><th>Status</th><th>Enrolled</th><th>Compliance</th><th>Check-In</th><th>Risk</th><th></th>
                  </tr></thead>
                  <tbody>
                    @for (en of activeEnrollments(p); track en.id) {
                      <tr>
                        <td><strong>{{ en.clientName }}</strong></td>
                        <td><span class="pd-badge pd-badge--sm pd-badge--{{ en.status.toLowerCase() }}">{{ en.status }}</span></td>
                        <td>{{ en.enrolledAt }}</td>
                        <td>{{ en.complianceRate }}%</td>
                        <td>{{ en.checkInRate }}%</td>
                        <td><span class="pd-pill pd-pill--{{ riskBand(en.riskScore).toLowerCase() }}">{{ en.riskScore }}</span></td>
                        <td class="pd-td--action">
                          <button type="button" class="pd-link" (click)="openDischarge(en)">Discharge</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            }

            @case ('staff') {
              <header class="pd-tab-head">
                <h2>Assigned Staff <small>({{ p.staff.length }})</small></h2>
                <button type="button" class="pd-btn pd-btn--primary" (click)="open('staff-assign')">Assign Staff</button>
              </header>
              <table class="pd-table">
                <thead><tr><th>Name</th><th>Role</th><th>Caseload</th><th>Assigned</th><th>Primary</th></tr></thead>
                <tbody>
                  @for (s of p.staff; track s.id) {
                    <tr>
                      <td><strong>{{ s.name }}</strong></td>
                      <td>{{ roleLabel[s.role] }}</td>
                      <td>
                        @if (s.caseloadMax > 0) { {{ s.caseloadCurrent }} / {{ s.caseloadMax }} } @else { — }
                      </td>
                      <td>{{ s.assignedAt }}</td>
                      <td>{{ s.primary ? 'Yes' : '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            @case ('phases') {
              <header class="pd-tab-head">
                <h2>Program Phases <small>({{ p.phases.length }})</small></h2>
              </header>
              @if (p.phases.length === 0) {
                <p class="pd-empty">This program is non-phased.</p>
              } @else {
                <ol class="pd-phases">
                  @for (ph of p.phases; track ph.id) {
                    <li class="pd-phase">
                      <div class="pd-phase__order">{{ ph.orderIndex }}</div>
                      <div class="pd-phase__body">
                        <h3>{{ ph.name }}</h3>
                        <p class="pd-phase__meta">{{ ph.durationDays }} days · Advancement: {{ ph.advancementMode }}</p>
                        @if (ph.description) { <p class="pd-phase__desc">{{ ph.description }}</p> }
                        @if (ph.advancementCriteria) {
                          <p class="pd-phase__crit"><strong>Advancement criteria:</strong> {{ ph.advancementCriteria }}</p>
                        }
                      </div>
                    </li>
                  }
                </ol>
              }
            }

            @case ('checkins') {
              <header class="pd-tab-head">
                <h2>Check-In Configuration</h2>
              </header>
              @if (p.checkInConfig; as cc) {
                <dl class="pd-dl">
                  <div><dt>Frequency</dt><dd>{{ cc.frequency }}</dd></div>
                  <div><dt>Window</dt><dd>{{ cc.windowStart }} – {{ cc.windowEnd }}</dd></div>
                  <div><dt>Late grace</dt><dd>{{ cc.lateGraceMinutes }} min</dd></div>
                  <div><dt>Missed action</dt><dd>{{ cc.missedAction }}</dd></div>
                  <div><dt>Location required</dt><dd>{{ cc.locationRequired ? 'Yes' : 'No' }}</dd></div>
                  <div><dt>Photo required</dt><dd>{{ cc.photoRequired ? 'Yes' : 'No' }}</dd></div>
                </dl>
                <h3 class="pd-sub">Questions ({{ cc.questions.length }})</h3>
                <ol class="pd-qs">
                  @for (q of cc.questions; track q.id) {
                    <li>
                      <div>
                        <strong>{{ q.text }}</strong>
                        <small>{{ q.type }}{{ q.required ? ' · required' : '' }}@if (q.crisisKeywords && q.crisisKeywords.length > 0) { · crisis keywords: {{ q.crisisKeywords.join(', ') }} }</small>
                      </div>
                    </li>
                  }
                </ol>
              }
            }

            @case ('appointments') {
              <header class="pd-tab-head"><h2>Appointment Types ({{ p.appointmentTypes.length }})</h2></header>
              <table class="pd-table">
                <thead><tr><th>Name</th><th>Duration</th><th>Mode</th><th>Recurrence</th><th>Grace</th><th>Staff roles</th></tr></thead>
                <tbody>
                  @for (at of p.appointmentTypes; track at.id) {
                    <tr>
                      <td><strong>{{ at.name }}</strong></td>
                      <td>{{ at.durationMinutes }} min</td>
                      <td>{{ at.mode }}</td>
                      <td>{{ at.recurrence || '—' }}</td>
                      <td>{{ at.graceMinutes }}m</td>
                      <td>{{ at.staffRoles.join(', ') }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            @case ('compliance') {
              <header class="pd-tab-head"><h2>Compliance Rules ({{ p.complianceRules.length }})</h2></header>
              <table class="pd-table">
                <thead><tr><th>Rule</th><th>Severity</th><th>Max violations</th><th>Actions</th><th>Active</th></tr></thead>
                <tbody>
                  @for (r of p.complianceRules; track r.id) {
                    <tr>
                      <td><strong>{{ r.name }}</strong>@if (r.description) { <small>{{ r.description }}</small> }</td>
                      <td><span class="pd-pill pd-pill--{{ r.severity.toLowerCase() }}">{{ r.severity }}</span></td>
                      <td>{{ r.maxViolations }}</td>
                      <td>{{ r.actions.join(', ') }}</td>
                      <td>{{ r.active ? 'Yes' : 'No' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
              <h3 class="pd-sub">Risk Indicators</h3>
              <table class="pd-table">
                <thead><tr><th>Indicator</th><th>Weight</th><th>Enabled</th></tr></thead>
                <tbody>
                  @for (r of p.riskConfig; track r.key) {
                    <tr>
                      <td>{{ r.key }}</td>
                      <td>{{ r.weight }}</td>
                      <td>{{ r.enabled ? 'Yes' : 'No' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
              <p class="pd-hint">Risk score = Σ (indicator_weight × indicator_present). Bands: Low 0-20, Medium 21-50, High 51-75, Critical 76-100.</p>
            }

            @case ('ua') {
              <header class="pd-tab-head"><h2>UA / Drug Testing</h2></header>
              @if (p.uaConfig; as ua) {
                <dl class="pd-dl">
                  <div><dt>Frequency</dt><dd>{{ ua.frequency }}@if (ua.randomRange) { · {{ ua.randomRange }}/month }</dd></div>
                  <div><dt>Method</dt><dd>{{ ua.collectionMethod }}</dd></div>
                  <div><dt>Panels</dt><dd>{{ ua.panels.join(', ') }}</dd></div>
                  <div><dt>Lab integration</dt><dd>{{ ua.labIntegration ? (ua.labName || 'Enabled') : 'Disabled' }}</dd></div>
                  <div><dt>Positive action</dt><dd>{{ ua.positiveAction }}</dd></div>
                  <div><dt>Refusal action</dt><dd>{{ ua.refusalAction }}</dd></div>
                  <div><dt>Diluted action</dt><dd>{{ ua.dilutedAction }}</dd></div>
                </dl>
              } @else {
                <p class="pd-empty">UA / drug testing is not configured for this program type.</p>
              }
            }

            @case ('housing') {
              <header class="pd-tab-head"><h2>Housing Configuration</h2></header>
              @if (p.housingConfig; as h) {
                <dl class="pd-dl">
                  <div><dt>Beds</dt><dd>{{ h.currentOccupancy }} / {{ h.totalBeds }}</dd></div>
                  <div><dt>Rent</dt><dd>\${{ h.rentAmount }} {{ h.rentFrequency }}</dd></div>
                  <div><dt>Grace period</dt><dd>{{ h.rentGraceDays }}d</dd></div>
                  <div><dt>Curfew</dt><dd>{{ h.curfew }}</dd></div>
                  <div><dt>Co-ed allowed</dt><dd>{{ h.coedAllowed ? 'Yes' : 'No' }}</dd></div>
                </dl>
                <h3 class="pd-sub">House Rules</h3>
                <table class="pd-table">
                  <thead><tr><th>Rule</th><th>Severity</th><th>Max violations</th></tr></thead>
                  <tbody>
                    @for (r of h.houseRules; track r.id) {
                      <tr>
                        <td>{{ r.name }}</td>
                        <td><span class="pd-pill pd-pill--{{ r.severity.toLowerCase() }}">{{ r.severity }}</span></td>
                        <td>{{ r.maxViolations }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <p class="pd-empty">Housing configuration only applies to Recovery Housing programs.</p>
              }
            }

            @case ('court') {
              <header class="pd-tab-head"><h2>Court Configuration</h2></header>
              @if (p.courtConfig; as c) {
                <dl class="pd-dl">
                  <div><dt>Court</dt><dd>{{ c.courtName }}</dd></div>
                  <div><dt>Judge</dt><dd>{{ c.judge || '—' }}</dd></div>
                  <div><dt>Location</dt><dd>{{ c.location || '—' }}</dd></div>
                  <div><dt>Hearing time</dt><dd>{{ c.hearingTime }}</dd></div>
                  <div><dt>Hearing frequency</dt><dd>{{ c.hearingFrequency }}</dd></div>
                  <div><dt>Session days</dt><dd>{{ c.sessionDays.join(', ') }}</dd></div>
                </dl>
              } @else {
                <p class="pd-empty">Court configuration only applies to Drug Court and Probation/Parole programs.</p>
              }
            }

            @case ('documents') {
              <header class="pd-tab-head"><h2>Required Documents ({{ p.documentRequirements.length }})</h2></header>
              <table class="pd-table">
                <thead><tr><th>Document</th><th>Required at</th><th>Frequency</th><th>Formats</th><th>Missing action</th></tr></thead>
                <tbody>
                  @for (d of p.documentRequirements; track d.id) {
                    <tr>
                      <td><strong>{{ d.documentType }}</strong>@if (d.description) { <small>{{ d.description }}</small> }</td>
                      <td>{{ d.requiredAt }}</td>
                      <td>{{ d.submissionFrequency }}</td>
                      <td>{{ d.acceptedFormats.join(', ') }}</td>
                      <td>{{ d.missingAction }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            @case ('notifications') {
              <header class="pd-tab-head"><h2>Notification Rules ({{ p.notificationRules.length }})</h2></header>
              <table class="pd-table">
                <thead><tr><th>Event</th><th>Recipients</th><th>Channels</th><th>Timing</th><th>Enabled</th></tr></thead>
                <tbody>
                  @for (n of p.notificationRules; track n.id) {
                    <tr>
                      <td>{{ n.event }}</td>
                      <td>{{ n.recipientRoles.join(', ') }}</td>
                      <td>{{ n.channels.join(', ') }}</td>
                      <td>{{ n.timing }}</td>
                      <td>{{ n.enabled ? 'Yes' : 'No' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            @case ('features') {
              <header class="pd-tab-head"><h2>Feature Toggles <small>({{ enabledFeatureCount(p) }}/18 enabled)</small></h2></header>
              <div class="pd-features">
                @for (f of featureKeys; track f) {
                  <label class="pd-feature">
                    <input type="checkbox" [checked]="p.features[f]" (change)="toggleFeature(p, f, $event)" />
                    <span>{{ featureLabel[f] }}</span>
                  </label>
                }
              </div>
              <p class="pd-hint">Disabling a feature hides related UI and pauses background jobs — existing data is preserved.</p>
            }

            @case ('audit') {
              <header class="pd-tab-head"><h2>Audit Trail</h2></header>
              @if (auditEntries().length === 0) {
                <p class="pd-empty">No audit events recorded yet.</p>
              } @else {
                <ul class="pd-audit">
                  @for (a of auditEntries(); track a.id) {
                    <li>
                      <time>{{ a.timestamp | date:'MMM d, y · HH:mm' }}</time>
                      <strong>{{ a.action }}</strong>
                      <span>{{ a.actor }}</span>
                      @if (a.details) { <p>{{ a.details }}</p> }
                    </li>
                  }
                </ul>
              }
            }
          }
        </section>
      </div>

      <!-- Modals -->
      @switch (activeModal()) {
        @case ('activate')    { <app-program-activate-modal    [program]="p" (close)="closeModal()" /> }
        @case ('suspend')     { <app-program-suspend-modal     [program]="p" (close)="closeModal()" /> }
        @case ('reactivate')  { <app-program-reactivate-modal  [program]="p" (close)="closeModal()" /> }
        @case ('deactivate')  { <app-program-deactivate-modal  [program]="p" (close)="closeModal()" /> }
        @case ('archive')     { <app-program-archive-modal     [program]="p" (close)="closeModal()" /> }
        @case ('staff-assign'){ <app-program-staff-assign-modal [program]="p" (close)="closeModal()" /> }
        @case ('enroll')      { <app-program-enroll-modal      [program]="p" (close)="closeModal()" /> }
      }
      @if (activeModal() === 'discharge' && currentEnrollment()) {
        <app-program-discharge-modal [program]="p" [enrollment]="currentEnrollment()!" (close)="closeModal()" />
      }
      @if (activeModal() === 'feature-toggle' && pendingFeature()) {
        <app-program-feature-toggle-modal
          [program]="p"
          [feature]="pendingFeature()!"
          [enabling]="pendingFeatureEnable()"
          (close)="closeModal()"
        />
      }
    } @else {
      <div class="pd__empty">
        <h1>Program not found</h1>
        <p>The requested program does not exist. <a routerLink="/system/programs">Return to program list</a>.</p>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; padding: 1.25rem 1.5rem 2rem; }
      .pd__crumbs { display: flex; gap: 0.375rem; font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem; }
      .pd__crumbs a { color: #1e40af; text-decoration: none; }
      .pd__crumbs span { color: #94a3b8; }
      .pd__title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
      .pd__title { margin: 0; font-size: 1.375rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; }
      .pd__meta { margin: 0.25rem 0 0; font-size: 0.8125rem; color: #64748b; }
      .pd__meta code { background: #f1f5f9; padding: 0.05rem 0.4rem; border-radius: 3px; font-size: 0.75rem; }
      .pd__actions { display: flex; gap: 0.375rem; }
      .pd-btn { padding: 0.5rem 0.875rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; background: white; color: #334155; border-color: #e2e8f0; }
      .pd-btn--primary { background: #1e40af; color: white; border-color: #1e40af; }
      .pd-btn--primary:hover:not(:disabled) { background: #1e3a8a; }
      .pd-btn--warn { background: #d97706; color: white; border-color: #d97706; }
      .pd-btn--ghost:hover { background: #f1f5f9; }
      .pd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .pd__tabs { display: flex; gap: 0.25rem; border-bottom: 1px solid #e2e8f0; margin: 1rem 0 1rem; overflow-x: auto; }
      .pd-tab { background: transparent; border: 0; padding: 0.5rem 0.75rem; font-size: 0.8125rem; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; font-weight: 500; white-space: nowrap; }
      .pd-tab--active { color: #1e40af; border-bottom-color: #1e40af; font-weight: 600; }
      .pd__body { }
      .pd__grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.5rem; margin-bottom: 1rem; }
      .pd-kpi { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 0.875rem; }
      .pd-kpi p { margin: 0; font-size: 0.6875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      .pd-kpi strong { display: block; font-size: 1.125rem; color: #0f172a; margin: 0.25rem 0 0.125rem; }
      .pd-kpi small { font-size: 0.6875rem; color: #94a3b8; }
      .pd__grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
      @media (max-width: 900px) { .pd__grid-two { grid-template-columns: 1fr; } }
      .pd-panel { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.875rem 1rem; }
      .pd-panel header { margin-bottom: 0.75rem; }
      .pd-panel h2 { margin: 0; font-size: 0.9375rem; font-weight: 600; color: #0f172a; }
      .pd-desc { margin: 0.625rem 0 0; font-size: 0.8125rem; color: #475569; }
      .pd-dl { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0; }
      .pd-dl div { display: flex; flex-direction: column; }
      .pd-dl dt { margin: 0; font-size: 0.6875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      .pd-dl dd { margin: 0.125rem 0 0; font-size: 0.8125rem; color: #0f172a; font-weight: 500; }
      .pd-list { list-style: none; margin: 0; padding: 0; }
      .pd-list li { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
      .pd-list li:last-child { border-bottom: 0; }
      .pd-list li strong { display: block; font-size: 0.8125rem; color: #0f172a; }
      .pd-list li small { font-size: 0.75rem; color: #64748b; }
      .pd-empty { margin: 1rem 0; padding: 1.5rem; background: white; border: 1px dashed #e2e8f0; border-radius: 8px; text-align: center; color: #64748b; font-size: 0.875rem; }
      .pd-tab-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
      .pd-tab-head h2 { margin: 0; font-size: 1rem; font-weight: 600; color: #0f172a; }
      .pd-tab-head h2 small { font-weight: 400; color: #64748b; font-size: 0.8125rem; margin-left: 0.25rem; }
      .pd-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 0.8125rem; }
      .pd-table th { text-align: left; padding: 0.625rem 0.75rem; background: #f8fafc; font-size: 0.6875rem; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
      .pd-table td { padding: 0.625rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: middle; }
      .pd-table td strong { display: block; }
      .pd-table td small { display: block; font-size: 0.75rem; color: #64748b; }
      .pd-td--action { text-align: right; }
      .pd-link { background: transparent; border: 0; color: #b91c1c; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.25rem 0.375rem; border-radius: 4px; }
      .pd-link:hover { background: #fef2f2; }
      .pd-sub { font-size: 0.9375rem; font-weight: 600; color: #0f172a; margin: 1rem 0 0.5rem; }
      .pd-phases { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
      .pd-phase { display: flex; gap: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.875rem; }
      .pd-phase__order { flex: 0 0 32px; height: 32px; width: 32px; border-radius: 9999px; background: #eff6ff; color: #1e40af; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; }
      .pd-phase__body h3 { margin: 0; font-size: 0.9375rem; font-weight: 600; color: #0f172a; }
      .pd-phase__meta { margin: 0.125rem 0 0.375rem; font-size: 0.75rem; color: #64748b; }
      .pd-phase__desc { margin: 0 0 0.25rem; font-size: 0.8125rem; color: #475569; }
      .pd-phase__crit { margin: 0; font-size: 0.75rem; color: #475569; }
      .pd-qs { list-style: decimal inside; padding: 0; margin: 0 0 0.75rem; }
      .pd-qs li { padding: 0.5rem 0; border-bottom: 1px dashed #f1f5f9; font-size: 0.8125rem; }
      .pd-qs li small { display: block; color: #64748b; font-size: 0.75rem; margin-top: 0.125rem; }
      .pd-hint { margin: 0.5rem 0; font-size: 0.75rem; color: #64748b; font-style: italic; }
      .pd-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
      @media (max-width: 900px) { .pd-features { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 600px) { .pd-features { grid-template-columns: 1fr; } }
      .pd-feature { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.625rem; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #334155; cursor: pointer; }
      .pd-feature input { accent-color: #1e40af; }
      .pd-audit { list-style: none; margin: 0; padding: 0; }
      .pd-audit li { border-left: 2px solid #e2e8f0; padding: 0.5rem 0 0.5rem 0.75rem; margin-left: 0.5rem; font-size: 0.8125rem; position: relative; }
      .pd-audit li::before { content: ''; position: absolute; left: -5px; top: 0.75rem; width: 8px; height: 8px; background: #1e40af; border-radius: 9999px; }
      .pd-audit time { display: block; font-size: 0.6875rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.125rem; }
      .pd-audit strong { display: block; color: #0f172a; }
      .pd-audit span { font-size: 0.75rem; color: #64748b; }
      .pd-audit p { margin: 0.25rem 0 0; font-size: 0.75rem; color: #475569; }
      .pd-badge { display: inline-flex; align-items: center; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; border: 1px solid; }
      .pd-badge--sm { font-size: 0.625rem; padding: 0.05rem 0.4rem; }
      .pd-badge--active { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
      .pd-badge--draft { background: #f8fafc; color: #475569; border-color: #cbd5e1; }
      .pd-badge--suspended { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
      .pd-badge--deactivated { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
      .pd-badge--archived { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; }
      .pd-badge--onhold { background: #fffbeb; color: #92400e; border-color: #fde68a; }
      .pd-badge--discharged { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; }
      .pd-badge--transferred { background: #eff6ff; color: #1e40af; border-color: #dbeafe; }
      .pd-pill { display: inline-flex; align-items: center; padding: 0.05rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; }
      .pd-pill--low, .pd-pill--warning { background: #f0fdf4; color: #166534; }
      .pd-pill--medium, .pd-pill--minor { background: #fffbeb; color: #92400e; }
      .pd-pill--high, .pd-pill--major { background: #fef2f2; color: #991b1b; }
      .pd-pill--critical, .pd-pill--immediate { background: #fef2f2; color: #7f1d1d; border: 1px solid #fecaca; }
      .pd-type { display: inline-flex; padding: 0.05rem 0.4rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
      .pd__empty { padding: 2rem; text-align: center; }
    `
  ]
})
export class ProgramDetailComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly id = signal<string>(this.route.snapshot.paramMap.get('id') ?? '');
  public readonly program = computed(() => this.store.programs().find(p => p.id === this.id()));
  public readonly auditEntries = computed(() => this.store.auditFor(this.id()));

  public readonly activeTab = signal<TabKey>('overview');
  public readonly activeModal = signal<ModalKey | null>(null);
  public readonly currentEnrollment = signal<IEnrollment | null>(null);
  public readonly pendingFeature = signal<FeatureKey | null>(null);
  public readonly pendingFeatureEnable = signal<boolean>(true);

  public readonly typeLabel = PROGRAM_TYPE_LABEL;
  public readonly roleLabel = STAFF_ROLE_LABEL;
  public readonly featureLabel = FEATURE_LABEL;
  public readonly featureKeys: FeatureKey[] = [
    'daily_checkins', 'weekly_checkins', 'appointments', 'ua_testing', 'treatment_plans',
    'housing_rules', 'rent_tracking', 'meeting_attendance', 'court_compliance', 'hearing_schedule',
    'supervision_conditions', 'cross_agency', 'moud_tracking', 'compliance_streaks', 'risk_indicators',
    'document_uploads', 'secure_messaging', 'lab_integration'
  ];

  private readonly ALL_TABS: ITabDef[] = [
    { key: 'overview',      label: 'Overview' },
    { key: 'clients',       label: 'Clients' },
    { key: 'staff',         label: 'Staff' },
    { key: 'phases',        label: 'Phases', condition: p => p.phases.length > 0 },
    { key: 'checkins',      label: 'Check-Ins', condition: p => !!p.checkInConfig && (p.features.daily_checkins || p.features.weekly_checkins) },
    { key: 'appointments',  label: 'Appointments', condition: p => p.features.appointments },
    { key: 'compliance',    label: 'Compliance' },
    { key: 'ua',            label: 'UA / Testing', condition: p => !!p.uaConfig && p.features.ua_testing },
    { key: 'housing',       label: 'Housing', condition: p => !!p.housingConfig },
    { key: 'court',         label: 'Court', condition: p => !!p.courtConfig || p.features.court_compliance },
    { key: 'documents',     label: 'Documents', condition: p => p.features.document_uploads },
    { key: 'notifications', label: 'Notifications' },
    { key: 'features',      label: 'Features' },
    { key: 'audit',         label: 'Audit' }
  ];

  public readonly visibleTabs = computed<ITabDef[]>(() => {
    const p = this.program();
    if (!p) return this.ALL_TABS.filter(t => !t.condition);
    return this.ALL_TABS.filter(t => !t.condition || t.condition(p));
  });

  public readonly riskBand = riskBand;

  public activeEnrollments(p: IProgram): IEnrollment[] {
    return p.enrollments.filter(e => e.status === 'Active');
  }

  public atRiskClients(p: IProgram): IEnrollment[] {
    return p.enrollments
      .filter(e => e.status === 'Active' && e.atRisk)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 8);
  }

  public capPct(p: IProgram): number {
    return p.capacity > 0 ? Math.min(100, Math.round((p.currentEnrollment / p.capacity) * 100)) : 0;
  }

  public enabledFeatureCount(p: IProgram): number {
    return Object.values(p.features).filter(Boolean).length;
  }

  public open(key: ModalKey): void {
    this.activeModal.set(key);
  }

  public openDischarge(en: IEnrollment): void {
    this.currentEnrollment.set(en);
    this.activeModal.set('discharge');
  }

  public toggleFeature(p: IProgram, key: FeatureKey, ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const enable = target.checked;
    // Revert the visual state — the modal will commit if confirmed.
    target.checked = p.features[key];
    this.pendingFeature.set(key);
    this.pendingFeatureEnable.set(enable);
    this.activeModal.set('feature-toggle');
  }

  public closeModal(): void {
    this.activeModal.set(null);
    this.currentEnrollment.set(null);
    this.pendingFeature.set(null);
  }
}
