import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { ProgramStoreService } from '../program-store.service';
import {
  DC_DEFAULT_PHASES,
  DEFAULT_FEATURES,
  FEATURE_LABEL,
  FeatureKey,
  IProgramPhase,
  PROGRAM_TYPE_LABEL,
  ProgramType,
  RH_DEFAULT_PHASES,
  TYPE_DEFAULT_FEATURES
} from '../program.types';

type StepKey =
  | 'basics'
  | 'type'
  | 'phases'
  | 'compliance'
  | 'checkin'
  | 'appointment'
  | 'ua'
  | 'documents'
  | 'notifications'
  | 'staff'
  | 'review';

interface IStep {
  key: StepKey;
  label: string;
  shortLabel: string;
  description: string;
  group: 'Setup' | 'Configuration' | 'Finalize';
}

const STEPS: IStep[] = [
  { key: 'basics',        label: 'Program Basics',            shortLabel: 'Basics',        description: 'Name, capacity, funding', group: 'Setup' },
  { key: 'type',          label: 'Type & Features',           shortLabel: 'Type',          description: 'Program type and feature toggles', group: 'Setup' },
  { key: 'phases',        label: 'Phases',                    shortLabel: 'Phases',        description: 'Phased structure (optional)', group: 'Setup' },
  { key: 'compliance',    label: 'Compliance Rules',          shortLabel: 'Compliance',    description: 'Default rule set by type', group: 'Configuration' },
  { key: 'checkin',       label: 'Check-In Configuration',    shortLabel: 'Check-Ins',     description: 'Frequency, window, crisis detection', group: 'Configuration' },
  { key: 'appointment',   label: 'Appointment Configuration', shortLabel: 'Appointments',  description: 'Appointment types and cadence', group: 'Configuration' },
  { key: 'ua',            label: 'UA / Testing',              shortLabel: 'UA',            description: 'Drug testing parameters', group: 'Configuration' },
  { key: 'documents',     label: 'Document Requirements',     shortLabel: 'Documents',     description: 'Required uploads', group: 'Configuration' },
  { key: 'notifications', label: 'Notification Rules',        shortLabel: 'Notifications', description: 'Channels and timing', group: 'Configuration' },
  { key: 'staff',         label: 'Staff Assignment',          shortLabel: 'Staff',         description: 'Director and initial staff', group: 'Finalize' },
  { key: 'review',        label: 'Review & Create',           shortLabel: 'Review',        description: 'Confirm and submit', group: 'Finalize' }
];

interface IDraftPhase { name: string; orderIndex: number; durationDays: number; description?: string; advancementMode: 'Automatic' | 'Manual' | 'Hybrid'; advancementCriteria?: string; }

@Component({
  selector: 'app-program-create-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="wz">
      <!-- Header bar -->
      <header class="wz__header">
        <div class="wz__header-main">
          <nav class="wz__crumb" aria-label="Breadcrumb">
            <a routerLink="/system/programs">Programs</a>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Create</span>
          </nav>
          <h1 class="wz__title">Create Program</h1>
          <p class="wz__eyebrow">
            <span class="wz__chip">{{ currentStep().group }}</span>
            Step {{ currentIndex() + 1 }} of {{ steps.length }} · {{ currentStep().label }}
          </p>
        </div>
        <div class="wz__header-actions">
          <button type="button" class="wz-btn wz-btn--ghost" (click)="cancel()">Cancel</button>
        </div>
      </header>

      <!-- Progress bar -->
      <div class="wz__progress-bar" role="progressbar" [attr.aria-valuenow]="progressPct()" aria-valuemin="0" aria-valuemax="100">
        <div class="wz__progress-fill" [style.width.%]="progressPct()"></div>
      </div>

      <div class="wz__layout">
        <!-- Sidebar stepper -->
        <aside class="wz__nav" aria-label="Wizard steps">
          <div class="wz__nav-head">
            <p class="wz__nav-title">Create Wizard</p>
            <p class="wz__nav-sub">{{ currentIndex() + 1 }} / {{ steps.length }} complete</p>
          </div>

          <ol class="wz__steps">
            @for (s of steps; track s.key; let i = $index; let first = $first) {
              @if (first || s.group !== steps[i - 1].group) {
                <li class="wz__group">{{ s.group }}</li>
              }
              <li
                class="wz-step"
                [class.wz-step--active]="s.key === step()"
                [class.wz-step--done]="i < currentIndex()"
                (click)="goTo(s.key)"
                role="button"
                tabindex="0"
                (keydown.enter)="goTo(s.key)"
              >
                <span class="wz-step__marker">
                  @if (i < currentIndex()) {
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span class="wz-step__text">
                  <span class="wz-step__label">{{ s.shortLabel }}</span>
                  <span class="wz-step__desc">{{ s.description }}</span>
                </span>
              </li>
            }
          </ol>
        </aside>

        <!-- Main content -->
        <section class="wz__main">
          <div class="wz-panel">
            <!-- Panel header -->
            <div class="wz-panel__head">
              <div>
                <p class="wz-panel__kicker">{{ currentStep().group }} · Step {{ currentIndex() + 1 }}</p>
                <h2 class="wz-panel__title">{{ currentStep().label }}</h2>
                <p class="wz-panel__desc">{{ currentStep().description }}</p>
              </div>
              <span class="wz-panel__counter">{{ currentIndex() + 1 }}/{{ steps.length }}</span>
            </div>

            <div class="wz-panel__body">
              @switch (step()) {

                @case ('basics') {
                  <div class="wz-section">
                    <h3 class="wz-section__title">Identity</h3>
                    <div class="wz-form">
                      <label class="wz-field wz-field--full">
                        <span>Program name <em>*</em></span>
                        <input type="text" [(ngModel)]="name" maxlength="128" placeholder="e.g., Grafton Drug Court — Main" />
                        @if (name && !isNameAvailable()) { <small class="wz-error">A program with this name already exists for this tenant.</small> }
                        @else { <small class="wz-help">Appears in reports and client-facing notifications.</small> }
                      </label>

                      <label class="wz-field wz-field--full">
                        <span>Description</span>
                        <textarea rows="3" [(ngModel)]="description" placeholder="Short description of program purpose and target population…"></textarea>
                      </label>
                    </div>
                  </div>

                  <div class="wz-section">
                    <h3 class="wz-section__title">Operational</h3>
                    <div class="wz-form">
                      <label class="wz-field">
                        <span>Capacity <em>*</em></span>
                        <input type="number" [(ngModel)]="capacity" min="1" max="2000" />
                        <small class="wz-help">Maximum concurrent enrollments.</small>
                      </label>
                      <label class="wz-field">
                        <span>Funding source</span>
                        <input type="text" [(ngModel)]="fundingSource" placeholder="e.g., DHHS SOR Grant" />
                      </label>
                      <label class="wz-field wz-field--full">
                        <span>External reference / grant ID</span>
                        <input type="text" [(ngModel)]="externalRef" placeholder="Optional external identifier" />
                      </label>
                    </div>
                  </div>
                }

                @case ('type') {
                  <div class="wz-section">
                    <h3 class="wz-section__title">Program Type</h3>
                    <p class="wz-section__desc">Selecting a type applies smart defaults for features, phases, and rules.</p>
                    <div class="wz-types">
                      @for (t of allTypes; track t) {
                        <label class="wz-type" [class.wz-type--active]="type() === t">
                          <input type="radio" name="type" [value]="t" [ngModel]="type()" (ngModelChange)="setType(t)" />
                          <span class="wz-type__badge">{{ t }}</span>
                          <span class="wz-type__body">
                            <strong>{{ typeLabel[t] }}</strong>
                            <small>{{ typeDescription[t] }}</small>
                          </span>
                          <span class="wz-type__check" aria-hidden="true">
                            <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          </span>
                        </label>
                      }
                    </div>
                  </div>

                  <div class="wz-section">
                    <div class="wz-section__head">
                      <div>
                        <h3 class="wz-section__title">Feature Toggles</h3>
                        <p class="wz-section__desc">Smart defaults based on selected type. Customize any feature below.</p>
                      </div>
                      <span class="wz-pill wz-pill--muted">{{ enabledFeatureCount() }} / 18 enabled</span>
                    </div>
                    <div class="wz-features">
                      @for (f of allFeatures; track f) {
                        <label class="wz-feature" [class.wz-feature--on]="features()[f]">
                          <input type="checkbox" [checked]="features()[f]" (change)="toggleFeature(f)" />
                          <span class="wz-feature__dot"></span>
                          <span>{{ featureLabel[f] }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }

                @case ('phases') {
                  <div class="wz-section">
                    <p class="wz-section__desc">Some program types use a phased structure. Add phases below, apply a template, or continue without any.</p>

                    @if (phases().length === 0) {
                      <div class="wz-empty">
                        <svg class="wz-empty__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <p class="wz-empty__title">No phases configured</p>
                        <p class="wz-empty__desc">This program will be non-phased. You can add phases now or later.</p>
                        <div class="wz-empty__actions">
                          <button type="button" class="wz-btn wz-btn--primary" (click)="addPhase()">+ Add Phase</button>
                          @if (type() === 'DC') {
                            <button type="button" class="wz-btn wz-btn--ghost" (click)="applyDefaultPhases('DC')">Apply Drug Court template</button>
                          }
                          @if (type() === 'RH') {
                            <button type="button" class="wz-btn wz-btn--ghost" (click)="applyDefaultPhases('RH')">Apply Recovery Housing template</button>
                          }
                        </div>
                      </div>
                    } @else {
                      <ol class="wz-phases">
                        @for (ph of phases(); track $index; let i = $index) {
                          <li class="wz-phase">
                            <div class="wz-phase__head">
                              <span class="wz-phase__num">{{ ph.orderIndex }}</span>
                              <input class="wz-phase__name" type="text" [(ngModel)]="ph.name" placeholder="Phase name" />
                              <button type="button" class="wz-phase__del" (click)="removePhase(i)" aria-label="Remove phase">
                                <svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                              </button>
                            </div>
                            <div class="wz-form">
                              <label class="wz-field">
                                <span>Duration (days)</span>
                                <input type="number" [(ngModel)]="ph.durationDays" min="1" />
                              </label>
                              <label class="wz-field">
                                <span>Advancement</span>
                                <select [(ngModel)]="ph.advancementMode">
                                  <option value="Automatic">Automatic</option>
                                  <option value="Manual">Manual</option>
                                  <option value="Hybrid">Hybrid</option>
                                </select>
                              </label>
                              <label class="wz-field wz-field--full">
                                <span>Description</span>
                                <textarea rows="2" [(ngModel)]="ph.description"></textarea>
                              </label>
                              <label class="wz-field wz-field--full">
                                <span>Advancement criteria</span>
                                <textarea rows="2" [(ngModel)]="ph.advancementCriteria"></textarea>
                              </label>
                            </div>
                          </li>
                        }
                      </ol>
                      <button type="button" class="wz-btn wz-btn--ghost wz-btn--block" (click)="addPhase()">+ Add Phase</button>
                    }
                  </div>
                }

                @case ('compliance') {
                  <div class="wz-section">
                    <div class="wz-note">
                      Default rule set for <strong>{{ typeLabel[type()] }}</strong> will be applied. Edit severities, thresholds, and actions later from the Compliance tab.
                    </div>
                    <table class="wz-table">
                      <thead><tr><th>Rule</th><th>Severity</th><th>Max violations</th></tr></thead>
                      <tbody>
                        <tr><td>Missed check-in</td><td><span class="wz-sev wz-sev--minor">Minor</span></td><td>3 per 7 days</td></tr>
                        <tr><td>Missed appointment</td><td><span class="wz-sev wz-sev--minor">Minor</span></td><td>2</td></tr>
                        <tr><td>Positive UA</td><td><span class="wz-sev wz-sev--major">Major</span></td><td>1</td></tr>
                        @if (type() === 'RH') {
                          <tr><td>Rent overdue</td><td><span class="wz-sev wz-sev--minor">Minor</span></td><td>2</td></tr>
                          <tr><td>Curfew violation</td><td><span class="wz-sev wz-sev--warn">Warning</span></td><td>3</td></tr>
                        }
                        @if (type() === 'DC' || type() === 'PP') {
                          <tr><td>Missed hearing</td><td><span class="wz-sev wz-sev--crit">Immediate</span></td><td>0</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }

                @case ('checkin') {
                  <div class="wz-section">
                    @if (!features().daily_checkins && !features().weekly_checkins) {
                      <div class="wz-empty wz-empty--soft">
                        <p class="wz-empty__title">Check-ins disabled</p>
                        <p class="wz-empty__desc">Enable "Daily Check-Ins" or "Weekly Check-Ins" on the Type step to configure.</p>
                      </div>
                    } @else {
                      <p class="wz-section__desc">Configure check-in window and defaults. Questions can be customized after creation.</p>
                      <div class="wz-form">
                        <label class="wz-field">
                          <span>Frequency</span>
                          <select [(ngModel)]="checkInFrequency">
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="BiWeekly">Bi-Weekly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </label>
                        <label class="wz-field">
                          <span>Late grace (minutes)</span>
                          <input type="number" [(ngModel)]="lateGrace" min="0" max="180" />
                        </label>
                        <label class="wz-field">
                          <span>Window start</span>
                          <input type="time" [(ngModel)]="windowStart" />
                        </label>
                        <label class="wz-field">
                          <span>Window end</span>
                          <input type="time" [(ngModel)]="windowEnd" />
                        </label>
                      </div>
                      <div class="wz-note">
                        Default question set (6 questions covering mood, cravings, support, and crisis keyword detection) will be pre-loaded.
                      </div>
                    }
                  </div>
                }

                @case ('appointment') {
                  <div class="wz-section">
                    @if (!features().appointments) {
                      <div class="wz-empty wz-empty--soft">
                        <p class="wz-empty__title">Appointments disabled</p>
                        <p class="wz-empty__desc">Enable "Appointments" on the Type step to configure types.</p>
                      </div>
                    } @else {
                      <p class="wz-section__desc">Default appointment types for <strong>{{ typeLabel[type()] }}</strong>:</p>
                      <ul class="wz-list">
                        <li><strong>Individual Session</strong><span>60 min · in-person · weekly · 15 min grace</span></li>
                        @if (type() === 'DC' || type() === 'PP') { <li><strong>Court Hearing</strong><span>30 min · in-person · bi-weekly</span></li> }
                        @if (type() === 'MAT' || type() === 'SUD') { <li><strong>Medical Visit</strong><span>30 min · in-person · monthly</span></li> }
                        @if (type() === 'RH') { <li><strong>House Meeting</strong><span>60 min · in-person · weekly</span></li> }
                      </ul>
                      <div class="wz-note">
                        You can add, edit, or remove appointment types from the Appointments tab after creation.
                      </div>
                    }
                  </div>
                }

                @case ('ua') {
                  <div class="wz-section">
                    @if (!features().ua_testing) {
                      <div class="wz-empty wz-empty--soft">
                        <p class="wz-empty__title">UA testing disabled</p>
                        <p class="wz-empty__desc">Enable "UA / Drug Testing" on the Type step to configure.</p>
                      </div>
                    } @else {
                      <p class="wz-section__desc">Base testing parameters. Sensitive actions (positive/refused/diluted) are refined later.</p>
                      <div class="wz-form">
                        <label class="wz-field">
                          <span>Frequency</span>
                          <select [(ngModel)]="uaFrequency">
                            <option value="Weekly">Weekly</option>
                            <option value="BiWeekly">Bi-Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Random">Random</option>
                            <option value="AsOrdered">As Ordered</option>
                          </select>
                        </label>
                        @if (uaFrequency === 'Random') {
                          <label class="wz-field">
                            <span>Random samples / month</span>
                            <input type="number" [(ngModel)]="uaRandomRange" min="1" max="30" />
                          </label>
                        }
                        <label class="wz-field">
                          <span>Collection method</span>
                          <select [(ngModel)]="uaMethod">
                            <option value="Urine">Urine</option>
                            <option value="Saliva">Saliva</option>
                            <option value="Hair">Hair</option>
                            <option value="Breath">Breath</option>
                          </select>
                        </label>
                        <label class="wz-field wz-field--toggle wz-field--full">
                          <input type="checkbox" [(ngModel)]="uaLabIntegration" />
                          <span>Integrate with lab for automatic result import</span>
                        </label>
                      </div>
                      <p class="wz-hint">Default panels (Opioids, Cocaine, Amphetamines, THC, Benzodiazepines) will be pre-loaded.</p>
                    }
                  </div>
                }

                @case ('documents') {
                  <div class="wz-section">
                    <p class="wz-section__desc">Default required documents based on program type:</p>
                    <ul class="wz-list">
                      <li><strong>Consent Form</strong><span>required at enrollment · auto-expires in 365 days</span></li>
                      <li><strong>Intake Assessment</strong><span>required at enrollment · one-time</span></li>
                      @if (type() === 'RH') { <li><strong>Lease Agreement</strong><span>required at enrollment · PDF</span></li> }
                      @if (type() === 'SUD' || type() === 'MAT') { <li><strong>UA Results</strong><span>ongoing · weekly</span></li> }
                      @if (type() === 'DC' || type() === 'PP') { <li><strong>Court Compliance Report</strong><span>at enrollment</span></li> }
                    </ul>
                    <div class="wz-note">
                      Refine required documents, accepted formats, and expiration behavior from the Documents tab.
                    </div>
                  </div>
                }

                @case ('notifications') {
                  <div class="wz-section">
                    <p class="wz-section__desc">Default notification rules will be enabled. Channels, timing, and recipients can be tuned later.</p>
                    <ul class="wz-list">
                      <li><strong>Check-In Reminder</strong><span>SMS + Push to client · at window open</span></li>
                      <li><strong>Missed Check-In</strong><span>SMS + In-App · client + case manager</span></li>
                      <li><strong>Appointment Reminder</strong><span>SMS + Push + Email · 24h and 1h before</span></li>
                      <li><strong>Positive UA</strong><span>In-App + Email · case manager + director</span></li>
                      <li><strong>Compliance Violation</strong><span>In-App · case manager</span></li>
                      <li><strong>Risk Alert</strong><span>In-App + Email · case manager + director</span></li>
                    </ul>
                    <label class="wz-field wz-field--toggle">
                      <input type="checkbox" [(ngModel)]="respectQuietHours" />
                      <span>Respect quiet hours (10:00 PM – 7:00 AM)</span>
                    </label>
                  </div>
                }

                @case ('staff') {
                  <div class="wz-section">
                    <p class="wz-section__desc">
                      A Program Director is required before activation. Additional staff can be assigned from the Staff tab after creation.
                    </p>
                    <div class="wz-form">
                      <label class="wz-field wz-field--full">
                        <span>Program Director <em>*</em></span>
                        <input type="text" [(ngModel)]="directorName" placeholder="e.g., Sarah Kim" />
                      </label>
                    </div>
                    <div class="wz-note">
                      This program will be created in <strong>Draft</strong> status. Assign additional case managers, counselors,
                      peer support, or role-specific staff (court officer, housing manager, medical) from the Staff tab.
                    </div>
                  </div>
                }

                @case ('review') {
                  <div class="wz-section">
                    <p class="wz-section__desc">Review the program configuration. After creation, the program will be in <strong>Draft</strong> status and can be activated from the detail page.</p>

                    <div class="wz-review">
                      <div class="wz-review__card">
                        <h4>Basics</h4>
                        <dl>
                          <div><dt>Name</dt><dd>{{ name || '—' }}</dd></div>
                          <div><dt>Capacity</dt><dd>{{ capacity }}</dd></div>
                          <div><dt>Funding</dt><dd>{{ fundingSource || '—' }}</dd></div>
                          <div><dt>External ref</dt><dd>{{ externalRef || '—' }}</dd></div>
                        </dl>
                      </div>
                      <div class="wz-review__card">
                        <h4>Type & Staff</h4>
                        <dl>
                          <div><dt>Type</dt><dd>{{ typeLabel[type()] }}</dd></div>
                          <div><dt>Director</dt><dd>{{ directorName || '—' }}</dd></div>
                          <div><dt>Features</dt><dd>{{ enabledFeatureCount() }} / 18 enabled</dd></div>
                          <div><dt>Phases</dt><dd>{{ phases().length || 'Non-phased' }}</dd></div>
                        </dl>
                      </div>
                    </div>

                    @if (validationErrors().length > 0) {
                      <div class="wz-error-block">
                        <strong>Fix the following before creating:</strong>
                        <ul>
                          @for (err of validationErrors(); track err) { <li>{{ err }}</li> }
                        </ul>
                      </div>
                    } @else {
                      <div class="wz-success-block">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span>All required fields look good. You're ready to create this program.</span>
                      </div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        </section>
      </div>

      <!-- Sticky action bar -->
      <footer class="wz__footer">
        <div class="wz__footer-inner">
          <button type="button" class="wz-btn wz-btn--ghost" (click)="back()" [disabled]="currentIndex() === 0">← Back</button>
          <div class="wz__footer-center">
            <span class="wz__progress-label">{{ progressPct() }}% complete</span>
          </div>
          @if (step() !== 'review') {
            <button type="button" class="wz-btn wz-btn--primary" (click)="next()" [disabled]="!canAdvance()">Continue →</button>
          } @else {
            <button type="button" class="wz-btn wz-btn--primary" (click)="submit()" [disabled]="validationErrors().length > 0">Create Program</button>
          }
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        min-height: 100vh;
      }
      .wz {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1.5rem 1.75rem 6rem;
      }

      /* Header */
      .wz__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
      .wz__crumb { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #64748b; margin: 0 0 0.375rem; }
      .wz__crumb a { color: #1e40af; text-decoration: none; font-weight: 500; }
      .wz__crumb a:hover { text-decoration: underline; }
      .wz__crumb svg { width: 12px; height: 12px; color: #cbd5e1; }
      .wz__crumb span { color: #0f172a; font-weight: 600; }
      .wz__title { margin: 0; font-size: 1.625rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
      .wz__eyebrow { margin: 0.375rem 0 0; font-size: 0.8125rem; color: #64748b; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
      .wz__chip { display: inline-flex; align-items: center; padding: 0.1875rem 0.5rem; background: #eef2ff; color: #3730a3; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
      .wz__header-actions { display: flex; gap: 0.5rem; }

      /* Progress bar */
      .wz__progress-bar { height: 4px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; margin-bottom: 1.5rem; }
      .wz__progress-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #1e40af); border-radius: 9999px; transition: width 0.25s ease; }

      /* Layout */
      .wz__layout { display: grid; grid-template-columns: 260px 1fr; gap: 1.25rem; align-items: flex-start; }
      @media (max-width: 960px) { .wz__layout { grid-template-columns: 1fr; } }

      /* Sidebar nav */
      .wz__nav { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.875rem; position: sticky; top: 1rem; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
      .wz__nav-head { padding: 0 0.375rem 0.75rem; border-bottom: 1px solid #f1f5f9; margin-bottom: 0.625rem; }
      .wz__nav-title { margin: 0; font-size: 0.75rem; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em; }
      .wz__nav-sub { margin: 0.125rem 0 0; font-size: 0.75rem; color: #94a3b8; }
      .wz__steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.125rem; position: relative; }
      .wz__group { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8; padding: 0.625rem 0.5rem 0.25rem; }
      .wz__group:first-child { padding-top: 0.125rem; }

      .wz-step { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.625rem; border-radius: 8px; cursor: pointer; color: #475569; transition: background 0.15s, color 0.15s; position: relative; }
      .wz-step:hover { background: #f8fafc; }
      .wz-step:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
      .wz-step__marker { flex: 0 0 26px; height: 26px; width: 26px; display: inline-flex; align-items: center; justify-content: center; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; transition: all 0.15s; }
      .wz-step__marker svg { width: 12px; height: 12px; }
      .wz-step__text { display: flex; flex-direction: column; min-width: 0; }
      .wz-step__label { font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
      .wz-step__desc { font-size: 0.6875rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .wz-step--active { background: #eff6ff; }
      .wz-step--active .wz-step__marker { background: #1e40af; color: white; border-color: #1e40af; box-shadow: 0 0 0 3px #dbeafe; }
      .wz-step--active .wz-step__label { color: #1e40af; }
      .wz-step--active .wz-step__desc { color: #60a5fa; }

      .wz-step--done .wz-step__marker { background: #15803d; color: white; border-color: #15803d; }
      .wz-step--done .wz-step__label { color: #15803d; }

      /* Panel */
      .wz-panel { background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 2px rgba(15,23,42,0.04); overflow: hidden; }
      .wz-panel__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; background: linear-gradient(180deg, #fafbfc 0%, white 100%); }
      .wz-panel__kicker { margin: 0 0 0.25rem; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3730a3; }
      .wz-panel__title { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
      .wz-panel__desc { margin: 0.25rem 0 0; font-size: 0.8125rem; color: #64748b; }
      .wz-panel__counter { flex: 0 0 auto; padding: 0.375rem 0.75rem; background: #f1f5f9; color: #475569; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; font-variant-numeric: tabular-nums; }
      .wz-panel__body { padding: 1.25rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }

      /* Section */
      .wz-section { display: flex; flex-direction: column; gap: 0.75rem; }
      .wz-section__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
      .wz-section__title { margin: 0; font-size: 0.875rem; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; }
      .wz-section__desc { margin: 0; font-size: 0.8125rem; color: #64748b; line-height: 1.5; }

      /* Form grid */
      .wz-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.875rem; }
      @media (max-width: 700px) { .wz-form { grid-template-columns: 1fr; } }
      .wz-field { display: flex; flex-direction: column; gap: 0.375rem; font-size: 0.75rem; color: #475569; min-width: 0; }
      .wz-field--full { grid-column: 1 / -1; }
      .wz-field > span { font-weight: 600; color: #334155; font-size: 0.75rem; }
      .wz-field > span > em { color: #dc2626; font-style: normal; margin-left: 0.125rem; }
      .wz-field--toggle { flex-direction: row; align-items: center; gap: 0.5rem; padding: 0.625rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.8125rem; color: #334155; cursor: pointer; }
      .wz-field--toggle input { accent-color: #1e40af; }
      .wz-field input[type="text"], .wz-field input[type="number"], .wz-field input[type="time"], .wz-field select, .wz-field textarea {
        padding: 0.5625rem 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.875rem;
        font-family: inherit;
        outline: none;
        color: #0f172a;
        background: white;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .wz-field input:focus, .wz-field select:focus, .wz-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .wz-field textarea { resize: vertical; min-height: 72px; }
      .wz-help { color: #94a3b8; font-size: 0.6875rem; }
      .wz-error { color: #dc2626; font-size: 0.6875rem; font-weight: 500; }

      /* Type cards */
      .wz-types { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.625rem; }
      @media (max-width: 900px) { .wz-types { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 560px) { .wz-types { grid-template-columns: 1fr; } }
      .wz-type { position: relative; display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 10px; cursor: pointer; background: white; transition: all 0.15s; }
      .wz-type:hover { border-color: #cbd5e1; background: #f8fafc; }
      .wz-type input { position: absolute; opacity: 0; pointer-events: none; }
      .wz-type__badge { flex: 0 0 auto; padding: 0.25rem 0.5rem; background: #f1f5f9; color: #475569; border-radius: 6px; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.05em; }
      .wz-type__body { flex: 1; min-width: 0; }
      .wz-type__body strong { display: block; font-size: 0.875rem; font-weight: 600; color: #0f172a; }
      .wz-type__body small { display: block; font-size: 0.75rem; color: #64748b; margin-top: 0.125rem; line-height: 1.4; }
      .wz-type__check { flex: 0 0 auto; width: 18px; height: 18px; border-radius: 9999px; border: 1.5px solid #cbd5e1; display: inline-flex; align-items: center; justify-content: center; color: transparent; }
      .wz-type__check svg { width: 11px; height: 11px; }
      .wz-type--active { border-color: #1e40af; background: #eff6ff; box-shadow: 0 0 0 3px #dbeafe; }
      .wz-type--active .wz-type__badge { background: #dbeafe; color: #1e40af; }
      .wz-type--active .wz-type__check { background: #1e40af; border-color: #1e40af; color: white; }

      /* Features */
      .wz-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
      @media (max-width: 900px) { .wz-features { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 560px) { .wz-features { grid-template-columns: 1fr; } }
      .wz-feature { display: flex; align-items: center; gap: 0.5rem; padding: 0.5625rem 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.8125rem; color: #334155; cursor: pointer; transition: all 0.15s; }
      .wz-feature:hover { background: #f8fafc; border-color: #cbd5e1; }
      .wz-feature input { position: absolute; opacity: 0; pointer-events: none; }
      .wz-feature__dot { flex: 0 0 16px; width: 16px; height: 16px; border: 1.5px solid #cbd5e1; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
      .wz-feature--on { background: #eff6ff; border-color: #1e40af; color: #1e40af; font-weight: 600; }
      .wz-feature--on .wz-feature__dot { background: #1e40af; border-color: #1e40af; }
      .wz-feature--on .wz-feature__dot::after { content: ''; width: 8px; height: 4px; border-left: 1.5px solid white; border-bottom: 1.5px solid white; transform: rotate(-45deg) translate(1px, -1px); }

      .wz-pill { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.02em; }
      .wz-pill--muted { background: #f1f5f9; color: #475569; }

      /* Empty state */
      .wz-empty { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 2rem 1.25rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
      .wz-empty__icon { width: 36px; height: 36px; color: #94a3b8; margin-bottom: 0.25rem; }
      .wz-empty__title { margin: 0; font-size: 0.9375rem; font-weight: 600; color: #334155; }
      .wz-empty__desc { margin: 0; font-size: 0.8125rem; color: #64748b; }
      .wz-empty__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem; }
      .wz-empty--soft { padding: 1.25rem; }

      /* Phases */
      .wz-phases { list-style: none; margin: 0 0 0.75rem; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
      .wz-phase { border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; background: white; }
      .wz-phase__head { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.75rem; padding-bottom: 0.625rem; border-bottom: 1px solid #f1f5f9; }
      .wz-phase__num { flex: 0 0 30px; height: 30px; width: 30px; background: #1e40af; color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8125rem; }
      .wz-phase__name { flex: 1; padding: 0.4375rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9375rem; font-weight: 600; color: #0f172a; outline: none; }
      .wz-phase__name:focus { border-color: #2563eb; box-shadow: 0 0 0 3px #dbeafe; }
      .wz-phase__del { border: 0; background: transparent; color: #94a3b8; cursor: pointer; padding: 0.375rem; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
      .wz-phase__del svg { width: 14px; height: 14px; }
      .wz-phase__del:hover { background: #fef2f2; color: #dc2626; }

      /* Notes / lists */
      .wz-note { padding: 0.875rem 1rem; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 10px; color: #1e40af; font-size: 0.8125rem; line-height: 1.5; }
      .wz-hint { margin: 0.25rem 0 0; font-size: 0.75rem; color: #64748b; font-style: italic; }
      .wz-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.375rem; }
      .wz-list li { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.625rem 0.875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.8125rem; }
      .wz-list li strong { color: #0f172a; font-weight: 600; }
      .wz-list li span { color: #64748b; font-size: 0.75rem; text-align: right; }

      /* Table */
      .wz-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 0.5rem; font-size: 0.8125rem; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
      .wz-table th { text-align: left; padding: 0.625rem 0.875rem; background: #f8fafc; font-size: 0.6875rem; text-transform: uppercase; color: #475569; font-weight: 700; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
      .wz-table td { padding: 0.625rem 0.875rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
      .wz-table tr:last-child td { border-bottom: 0; }

      .wz-sev { display: inline-flex; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
      .wz-sev--minor { background: #fef3c7; color: #92400e; }
      .wz-sev--warn { background: #fed7aa; color: #9a3412; }
      .wz-sev--major { background: #fecaca; color: #991b1b; }
      .wz-sev--crit { background: #1f2937; color: #fef2f2; }

      /* Review */
      .wz-review { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      @media (max-width: 700px) { .wz-review { grid-template-columns: 1fr; } }
      .wz-review__card { padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
      .wz-review__card h4 { margin: 0 0 0.625rem; font-size: 0.75rem; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.05em; }
      .wz-review__card dl { margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
      .wz-review__card dl > div { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.8125rem; padding: 0.25rem 0; border-bottom: 1px dashed #e2e8f0; }
      .wz-review__card dl > div:last-child { border-bottom: 0; }
      .wz-review__card dt { color: #64748b; font-weight: 500; }
      .wz-review__card dd { margin: 0; color: #0f172a; font-weight: 600; text-align: right; }

      .wz-error-block { margin-top: 0.5rem; padding: 0.875rem 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #991b1b; font-size: 0.8125rem; }
      .wz-error-block ul { margin: 0.375rem 0 0 1.125rem; padding: 0; }
      .wz-success-block { display: flex; align-items: center; gap: 0.625rem; margin-top: 0.5rem; padding: 0.875rem 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; color: #166534; font-size: 0.8125rem; font-weight: 500; }
      .wz-success-block svg { flex: 0 0 18px; width: 18px; height: 18px; }

      /* Footer */
      .wz__footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 16px rgba(15,23,42,0.06); z-index: 10; }
      .wz__footer-inner { max-width: 1280px; margin: 0 auto; padding: 0.875rem 1.75rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      .wz__footer-center { flex: 1; text-align: center; }
      .wz__progress-label { font-size: 0.75rem; color: #64748b; font-weight: 500; font-variant-numeric: tabular-nums; }

      /* Buttons */
      .wz-btn { padding: 0.5625rem 1rem; border-radius: 8px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; background: white; color: #334155; border-color: #e2e8f0; transition: all 0.15s; white-space: nowrap; }
      .wz-btn:hover:not(:disabled) { transform: translateY(-1px); }
      .wz-btn--primary { background: #1e40af; color: white; border-color: #1e40af; box-shadow: 0 1px 2px rgba(30,64,175,0.2); }
      .wz-btn--primary:hover:not(:disabled) { background: #1e3a8a; box-shadow: 0 4px 8px rgba(30,64,175,0.25); }
      .wz-btn--ghost:hover:not(:disabled) { background: #f1f5f9; }
      .wz-btn--block { display: block; width: 100%; }
      .wz-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
    `
  ]
})
export class ProgramCreateWizardComponent {
  private readonly store = inject(ProgramStoreService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  public readonly steps = STEPS;
  public readonly step = signal<StepKey>('basics');
  public readonly currentIndex = computed(() => this.steps.findIndex(s => s.key === this.step()));
  public readonly currentStep = computed(() => this.steps[this.currentIndex()]);
  public readonly progressPct = computed(() => Math.round(((this.currentIndex() + 1) / this.steps.length) * 100));

  public name = '';
  public description = '';
  public capacity = 30;
  public fundingSource = '';
  public externalRef = '';

  public readonly type = signal<ProgramType>('SUD');
  public readonly features = signal<Record<FeatureKey, boolean>>({ ...DEFAULT_FEATURES, ...TYPE_DEFAULT_FEATURES['SUD'] });

  public readonly phases = signal<IDraftPhase[]>([]);

  public checkInFrequency: 'Daily' | 'Weekly' | 'BiWeekly' | 'Monthly' = 'Daily';
  public lateGrace = 60;
  public windowStart = '06:00';
  public windowEnd = '22:00';

  public uaFrequency: 'Weekly' | 'BiWeekly' | 'Monthly' | 'Random' | 'AsOrdered' = 'Random';
  public uaRandomRange = 4;
  public uaMethod: 'Urine' | 'Saliva' | 'Hair' | 'Breath' = 'Urine';
  public uaLabIntegration = false;

  public respectQuietHours = true;
  public directorName = '';

  public readonly allTypes: ProgramType[] = ['SUD', 'RH', 'DC', 'PP', 'CM', 'MAT', 'CBO', 'DW', 'OTH'];
  public readonly allFeatures: FeatureKey[] = [
    'daily_checkins', 'weekly_checkins', 'appointments', 'ua_testing', 'treatment_plans',
    'housing_rules', 'rent_tracking', 'meeting_attendance', 'court_compliance', 'hearing_schedule',
    'supervision_conditions', 'cross_agency', 'moud_tracking', 'compliance_streaks', 'risk_indicators',
    'document_uploads', 'secure_messaging', 'lab_integration'
  ];
  public readonly typeLabel = PROGRAM_TYPE_LABEL;
  public readonly featureLabel = FEATURE_LABEL;

  public readonly typeDescription: Record<ProgramType, string> = {
    SUD: 'Substance use disorder treatment',
    RH:  'Recovery housing / sober living',
    DC:  'Drug court with judicial supervision',
    PP:  'Probation or parole supervision',
    CM:  'Case management services',
    MAT: 'Medication-assisted treatment',
    CBO: 'Community-based organization',
    DW:  'Drug watch / surveillance',
    OTH: 'Other program type'
  };

  public readonly isNameAvailable = computed(() => {
    if (!this.name.trim()) return true;
    return this.store.isNameAvailable('t-1', this.name.trim());
  });

  public readonly validationErrors = computed<string[]>(() => {
    const errors: string[] = [];
    if (!this.name.trim()) errors.push('Program name is required.');
    if (!this.isNameAvailable()) errors.push('Program name is already in use.');
    if (!this.capacity || this.capacity < 1) errors.push('Capacity must be at least 1.');
    if (!this.directorName.trim()) errors.push('Program Director name is required.');
    return errors;
  });

  public setType(t: ProgramType): void {
    this.type.set(t);
    this.features.set({ ...DEFAULT_FEATURES, ...TYPE_DEFAULT_FEATURES[t] });
  }

  public toggleFeature(f: FeatureKey): void {
    this.features.update(map => ({ ...map, [f]: !map[f] }));
  }

  public addPhase(): void {
    const next = this.phases().length + 1;
    this.phases.update(list => [
      ...list,
      { name: `Phase ${next}`, orderIndex: next, durationDays: 60, advancementMode: 'Manual', description: '', advancementCriteria: '' }
    ]);
  }

  public removePhase(i: number): void {
    this.phases.update(list => list.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, orderIndex: idx + 1 })));
  }

  public applyDefaultPhases(type: 'DC' | 'RH'): void {
    const template = type === 'DC' ? DC_DEFAULT_PHASES : RH_DEFAULT_PHASES;
    this.phases.set(template.map(p => ({
      name: p.name,
      orderIndex: p.orderIndex,
      durationDays: p.durationDays,
      description: p.description,
      advancementMode: p.advancementMode,
      advancementCriteria: p.advancementCriteria
    })));
  }

  public enabledFeatureCount(): number {
    return Object.values(this.features()).filter(Boolean).length;
  }

  public canAdvance(): boolean {
    switch (this.step()) {
      case 'basics':
        return !!this.name.trim() && this.isNameAvailable() && this.capacity >= 1;
      case 'staff':
        return !!this.directorName.trim();
      default:
        return true;
    }
  }

  public goTo(key: StepKey): void {
    this.step.set(key);
  }

  public next(): void {
    const i = this.currentIndex();
    if (i < this.steps.length - 1) this.step.set(this.steps[i + 1].key);
  }

  public back(): void {
    const i = this.currentIndex();
    if (i > 0) this.step.set(this.steps[i - 1].key);
  }

  public cancel(): void {
    this.router.navigate(['/system/programs']);
  }

  public submit(): void {
    if (this.validationErrors().length > 0) return;
    const phasesForStore: Array<Omit<IProgramPhase, 'id'>> = this.phases().map(p => ({
      name: p.name,
      orderIndex: p.orderIndex,
      durationDays: p.durationDays,
      description: p.description,
      advancementMode: p.advancementMode,
      advancementCriteria: p.advancementCriteria
    }));

    const program = this.store.create({
      tenantId: 't-1',
      name: this.name.trim(),
      type: this.type(),
      capacity: this.capacity,
      description: this.description.trim() || undefined,
      directorName: this.directorName.trim(),
      fundingSource: this.fundingSource.trim() || undefined,
      features: this.features(),
      phases: phasesForStore.length > 0 ? phasesForStore : undefined
    });

    this.toast.showSuccess(`Program "${program.name}" created in Draft status.`);
    this.router.navigate(['/system/programs', program.id]);
  }
}
