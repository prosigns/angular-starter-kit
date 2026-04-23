import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { ConfirmModalComponent } from './modals/confirm-modal.component';
import { FeatureEditorModalComponent } from './modals/feature-editor-modal.component';
import { MessageTemplateEditorModalComponent } from './modals/message-template-editor-modal.component';
import { ProgramTypeEditorModalComponent } from './modals/program-type-editor-modal.component';
import { TemplateEditorModalComponent } from './modals/template-editor-modal.component';
import { ProgramConfigStoreService } from './program-config-store.service';
import {
  CATEGORY_COLOR,
  FeatureCategory,
  FeatureStatus,
  IFeatureDef,
  IMessageTemplate,
  IProgramTypeDef,
  ITemplateSummary,
  SubscriptionTier,
  TIER_LABEL,
  TIER_ORDER
} from './program-config.types';

type TabKey = 'program-types' | 'features' | 'checkin-templates' | 'compliance' | 'phases' | 'notifications' | 'settings';
type TemplateKind = 'checkin' | 'compliance' | 'phase';
type ModalState =
  | { kind: 'type-edit'; type: IProgramTypeDef | null }
  | { kind: 'feature-edit'; feature: IFeatureDef | null }
  | { kind: 'template-edit'; templateKind: TemplateKind; template: ITemplateSummary | null }
  | { kind: 'message-edit'; template: IMessageTemplate }
  | { kind: 'confirm'; title: string; body: string; detail?: string; tone: 'default' | 'warn' | 'danger'; confirmLabel: string; action: () => void }
  | null;

interface ITabDef {
  key: TabKey;
  label: string;
  hash: string;
}

@Component({
  selector: 'app-program-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProgramTypeEditorModalComponent,
    FeatureEditorModalComponent,
    TemplateEditorModalComponent,
    MessageTemplateEditorModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="pc">
      <!-- Header -->
      <header class="pc__header">
        <nav class="pc__crumb" aria-label="Breadcrumb">
          <a routerLink="/system/dashboard">Admin</a>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <a routerLink="/system/programs">Programs</a>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Configuration</span>
        </nav>
        <div class="pc__header-main">
          <div>
            <h1 class="pc__title">Program Configuration</h1>
            <p class="pc__subtitle">Manage program types, templates, and platform-wide defaults that tenants inherit.</p>
          </div>
          <div class="pc__header-meta">
            <span class="pc__meta-item"><strong>{{ counts().types }}</strong> types</span>
            <span class="pc__meta-divider"></span>
            <span class="pc__meta-item"><strong>{{ counts().features }}</strong> features</span>
            <span class="pc__meta-divider"></span>
            <span class="pc__meta-item"><strong>{{ counts().notifications }}</strong> notifications</span>
          </div>
        </div>
      </header>

      <!-- Tab strip -->
      <div class="pc__tabs" role="tablist">
        @for (t of tabs; track t.key) {
          <button
            type="button"
            class="pc-tab"
            role="tab"
            [class.pc-tab--active]="tab() === t.key"
            [attr.aria-selected]="tab() === t.key"
            (click)="tab.set(t.key)"
          >
            {{ t.label }}
            <span class="pc-tab__badge">{{ tabBadge(t.key) }}</span>
          </button>
        }
      </div>

      <!-- Tab content -->
      <section class="pc__content">
        @switch (tab()) {

          <!-- Program Types -->
          @case ('program-types') {
            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Program Types</h2>
                  <p>{{ counts().types }} program types defined across the platform.</p>
                </div>
                <div class="pc-panel__actions">
                  <button type="button" class="pc-btn pc-btn--ghost" (click)="toast.showInfo('Drag-and-drop reorder coming soon.')">Reorder</button>
                  <button type="button" class="pc-btn pc-btn--primary" (click)="openAddType()">+ Add Program Type</button>
                </div>
              </div>

              <div class="pc-types">
                @for (t of types(); track t.code) {
                  <article class="pc-type" [style.--accent]="t.color">
                    <header class="pc-type__head">
                      <div class="pc-type__icon" [style.background]="t.color + '18'" [style.color]="t.color">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path [attr.d]="iconPath(t.iconKey)" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </div>
                      <div class="pc-type__ident">
                        <h3>{{ t.name }}</h3>
                        <code>{{ t.code }}</code>
                      </div>
                      <div class="pc-kebab-wrap">
                        <button class="pc-type__kebab" type="button" aria-label="More options" (click)="toggleKebab(t.code)">
                          <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
                        </button>
                        @if (openKebab() === t.code) {
                          <div class="pc-kebab-menu" (click)="$event.stopPropagation()">
                            <button type="button" (click)="configureType(t); openKebab.set(null)">Configure</button>
                            <button type="button" (click)="openEditType(t)">Edit Metadata</button>
                            <button type="button" (click)="duplicateType(t)">Duplicate</button>
                            <button type="button" (click)="toggleTypeActive(t)">{{ t.isActive ? 'Deactivate' : 'Activate' }}</button>
                            @if (!t.isSystem) {
                              <button type="button" class="pc-kebab-menu__danger" (click)="deleteTypeConfirm(t)">Delete</button>
                            }
                          </div>
                        }
                      </div>
                    </header>
                    <p class="pc-type__desc">{{ t.description }}</p>

                    <div class="pc-type__progress">
                      <div class="pc-type__progress-top">
                        <span>Features</span>
                        <strong>{{ t.featuresEnabled }} / {{ t.featuresTotal }}</strong>
                      </div>
                      <div class="pc-type__bar">
                        <div class="pc-type__bar-fill" [style.width.%]="(t.featuresEnabled / t.featuresTotal) * 100" [style.background]="t.color"></div>
                      </div>
                    </div>

                    <dl class="pc-type__stats">
                      <div><dt>Phases</dt><dd>{{ t.defaultPhases || '—' }}</dd></div>
                      <div><dt>Rules</dt><dd>{{ t.complianceRules }}</dd></div>
                      <div><dt>Questions</dt><dd>{{ t.checkInQuestions }}</dd></div>
                    </dl>

                    <p class="pc-type__usage">Used by <strong>{{ t.programsUsing }}</strong> programs across <strong>{{ t.tenantsUsing }}</strong> tenants</p>

                    <footer class="pc-type__foot">
                      <span class="pc-type__status" [class.pc-type__status--off]="!t.isActive">
                        <span class="pc-dot" [class.pc-dot--on]="t.isActive"></span>
                        {{ t.isActive ? 'Active' : 'Inactive' }}
                      </span>
                      @if (t.isSystem) {
                        <span class="pc-type__lock" title="System type — cannot be deleted">
                          <svg viewBox="0 0 16 16" fill="none"><path d="M4 7V5a4 4 0 118 0v2M3.5 7h9v6a1 1 0 01-1 1H4.5a1 1 0 01-1-1V7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          System
                        </span>
                      }
                      <button type="button" class="pc-btn pc-btn--block pc-btn--primary" (click)="configureType(t)">Configure →</button>
                    </footer>
                  </article>
                }
              </div>
            </div>
          }

          <!-- Feature Catalog -->
          @case ('features') {
            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Feature Catalog</h2>
                  <p>{{ counts().features }} platform features with tier requirements and dependencies.</p>
                </div>
                <button type="button" class="pc-btn pc-btn--primary" (click)="openAddFeature()">+ Add Feature</button>
              </div>

              <div class="pc-filters">
                <input type="text" class="pc-search" placeholder="Search features…" [(ngModel)]="featureSearch" />
                <select class="pc-select" [(ngModel)]="featureCategory">
                  <option value="">All categories</option>
                  @for (c of allCategories; track c) { <option [value]="c">{{ c }}</option> }
                </select>
                <select class="pc-select" [(ngModel)]="featureTier">
                  <option value="">All tiers</option>
                  @for (t of tiers; track t) { <option [value]="t">{{ t }}</option> }
                </select>
                <select class="pc-select" [(ngModel)]="featureStatus">
                  <option value="">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Beta">Beta</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              <div class="pc-table-wrap">
                <table class="pc-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Key</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Min Tier</th>
                      <th class="right">Programs</th>
                      <th>Status</th>
                      <th class="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (f of filteredFeatures(); track f.key) {
                      <tr>
                        <td><strong>{{ f.name }}</strong></td>
                        <td><code class="pc-code">{{ f.key }}</code></td>
                        <td><span class="pc-badge" [style.background]="catBg(f.category)" [style.color]="catFg(f.category)">{{ f.category }}</span></td>
                        <td class="pc-td-desc">{{ f.description }}</td>
                        <td><span class="pc-tier">{{ tierLabel[f.minTier] }}</span></td>
                        <td class="right">{{ f.programsUsing }}</td>
                        <td>
                          <span class="pc-status" [class]="'pc-status--' + f.status.toLowerCase()">
                            <span class="pc-dot" [class.pc-dot--on]="f.status === 'Active'"></span>
                            {{ f.status }}
                          </span>
                        </td>
                        <td class="right">
                          <button class="pc-link-btn" type="button" (click)="openEditFeature(f)">Edit</button>
                          @if (f.programsUsing === 0) {
                            <button class="pc-link-btn pc-link-btn--muted" type="button" (click)="deleteFeatureConfirm(f)">Delete</button>
                          }
                        </td>
                      </tr>
                    }
                    @if (filteredFeatures().length === 0) {
                      <tr><td colspan="8" class="pc-empty-row">No features match the current filters.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Check-In Templates -->
          @case ('checkin-templates') {
            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Check-In Templates</h2>
                  <p>{{ counts().checkin }} reusable question sets shared across program types.</p>
                </div>
                <button type="button" class="pc-btn pc-btn--primary" (click)="openAddTemplate('checkin')">+ Create Template</button>
              </div>
              <div class="pc-template-list">
                @for (t of store.checkinTemplates(); track t.id) {
                  <article class="pc-template">
                    <div class="pc-template__info">
                      <div class="pc-template__title">
                        <h3>{{ t.name }}</h3>
                        @if (t.isSystem) {
                          <span class="pc-chip pc-chip--system">System</span>
                        } @else {
                          <span class="pc-chip">Custom</span>
                        }
                      </div>
                      <p>{{ t.description }}</p>
                      <div class="pc-template__meta">
                        <span><strong>{{ t.itemCount }}</strong> {{ t.itemLabel }}</span>
                        <span>·</span>
                        <span>Used by <strong>{{ t.typesUsing }}</strong> program types</span>
                        <span>·</span>
                        <span><strong>{{ t.programsUsing }}</strong> programs</span>
                      </div>
                    </div>
                    <div class="pc-template__actions">
                      <button type="button" class="pc-btn pc-btn--ghost" (click)="previewTemplate(t)">Preview</button>
                      <button type="button" class="pc-btn pc-btn--ghost" (click)="openEditTemplate('checkin', t)">Edit</button>
                      <button type="button" class="pc-btn pc-btn--ghost" (click)="duplicateTemplate('checkin', t)">Duplicate</button>
                      @if (!t.isSystem) {
                        <button type="button" class="pc-btn pc-btn--danger-ghost" (click)="deleteTemplateConfirm('checkin', t)">Delete</button>
                      }
                    </div>
                  </article>
                }
              </div>
            </div>
          }

          <!-- Compliance Templates + Risk Config -->
          @case ('compliance') {
            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Compliance Templates</h2>
                  <p>{{ counts().compliance }} reusable rule sets applied to program types.</p>
                </div>
                <button type="button" class="pc-btn pc-btn--primary" (click)="openAddTemplate('compliance')">+ Create Template</button>
              </div>
              <div class="pc-template-list">
                @for (t of store.complianceTemplates(); track t.id) {
                  <article class="pc-template">
                    <div class="pc-template__info">
                      <div class="pc-template__title">
                        <h3>{{ t.name }}</h3>
                        @if (t.isSystem) { <span class="pc-chip pc-chip--system">System</span> } @else { <span class="pc-chip">Custom</span> }
                      </div>
                      <p>{{ t.description }}</p>
                      <div class="pc-template__meta">
                        <span><strong>{{ t.itemCount }}</strong> {{ t.itemLabel }}</span>
                        <span>·</span>
                        <span>Used by <strong>{{ t.typesUsing }}</strong> program types</span>
                        <span>·</span>
                        <span><strong>{{ t.programsUsing }}</strong> programs</span>
                      </div>
                    </div>
                    <div class="pc-template__actions">
                      <button type="button" class="pc-btn pc-btn--ghost" (click)="openEditTemplate('compliance', t)">Edit Rules</button>
                      <button type="button" class="pc-btn pc-btn--ghost" (click)="duplicateTemplate('compliance', t)">Duplicate</button>
                      @if (!t.isSystem) {
                        <button type="button" class="pc-btn pc-btn--danger-ghost" (click)="deleteTemplateConfirm('compliance', t)">Delete</button>
                      }
                    </div>
                  </article>
                }
              </div>
            </div>

            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Risk Score Configuration</h2>
                  <p>Platform-wide risk scoring model. Max possible score = 100.</p>
                </div>
                <span class="pc-chip pc-chip--muted">Weighted Sum · 0–100</span>
              </div>

              <h3 class="pc-sub">Risk Bands</h3>
              <div class="pc-risk-grid">
                @for (r of store.riskLevels(); track r.level) {
                  <div class="pc-risk" [style.--band]="r.color">
                    <div class="pc-risk__level">
                      <span class="pc-risk__dot" [style.background]="r.color"></span>
                      <strong>{{ r.level }}</strong>
                    </div>
                    <p class="pc-risk__range">{{ r.minScore }} – {{ r.maxScore }}</p>
                    <p class="pc-risk__action">{{ r.action }}</p>
                  </div>
                }
              </div>

              <h3 class="pc-sub">Indicator Weights</h3>
              <div class="pc-table-wrap">
                <table class="pc-table">
                  <thead>
                    <tr>
                      <th>Indicator</th>
                      <th class="right">Default</th>
                      <th class="right">Min</th>
                      <th class="right">Max</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (w of store.riskWeights(); track w.indicator) {
                      <tr>
                        <td><strong>{{ w.indicator }}</strong></td>
                        <td class="right">{{ w.defaultWeight }}</td>
                        <td class="right">{{ w.min }}</td>
                        <td class="right">{{ w.max }}</td>
                        <td>
                          <div class="pc-weight">
                            <div class="pc-weight__bar">
                              <div class="pc-weight__fill" [style.width.%]="(w.defaultWeight / 40) * 100"></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Phase Templates -->
          @case ('phases') {
            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Phase Templates</h2>
                  <p>{{ counts().phases }} reusable phase structures for program lifecycles.</p>
                </div>
                <button type="button" class="pc-btn pc-btn--primary" (click)="openAddTemplate('phase')">+ Create Template</button>
              </div>
              <div class="pc-template-list">
                @for (t of store.phaseTemplates(); track t.id) {
                  <article class="pc-template">
                    <div class="pc-template__info">
                      <div class="pc-template__title">
                        <h3>{{ t.name }}</h3>
                        @if (t.isSystem) { <span class="pc-chip pc-chip--system">System</span> } @else { <span class="pc-chip">Custom</span> }
                      </div>
                      <p>{{ t.description }}</p>
                      <div class="pc-template__meta">
                        <span><strong>{{ t.itemCount }}</strong> {{ t.itemLabel }}</span>
                        <span>·</span>
                        <span>Used by <strong>{{ t.typesUsing }}</strong> program types</span>
                        <span>·</span>
                        <span><strong>{{ t.programsUsing }}</strong> programs</span>
                      </div>
                    </div>
                    <div class="pc-template__actions">
                      <button type="button" class="pc-btn pc-btn--ghost" (click)="openEditTemplate('phase', t)">Edit Phases</button>
                      <button type="button" class="pc-btn pc-btn--ghost" (click)="duplicateTemplate('phase', t)">Duplicate</button>
                      @if (!t.isSystem) {
                        <button type="button" class="pc-btn pc-btn--danger-ghost" (click)="deleteTemplateConfirm('phase', t)">Delete</button>
                      }
                    </div>
                  </article>
                }
              </div>
            </div>
          }

          <!-- Notification Defaults -->
          @case ('notifications') {
            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Notification Defaults</h2>
                  <p>{{ counts().notifications }} rules active platform-wide. Locked rules cannot be disabled by tenants.</p>
                </div>
                <button type="button" class="pc-btn pc-btn--ghost" (click)="tab.set('settings')">Global Settings</button>
              </div>

              <div class="pc-global-strip">
                <div>
                  <p class="pc-global-strip__label">Quiet hours</p>
                  <p class="pc-global-strip__value">10:00 PM – 7:00 AM</p>
                </div>
                <div>
                  <p class="pc-global-strip__label">SMS provider</p>
                  <p class="pc-global-strip__value">Twilio</p>
                </div>
                <div>
                  <p class="pc-global-strip__label">Email sender</p>
                  <p class="pc-global-strip__value">notifications&#64;caretrack.app</p>
                </div>
                <div>
                  <p class="pc-global-strip__label">Push provider</p>
                  <p class="pc-global-strip__value">Firebase FCM</p>
                </div>
              </div>

              <h3 class="pc-sub">Notification Rules</h3>
              <div class="pc-table-wrap">
                <table class="pc-table">
                  <thead>
                    <tr>
                      <th>Rule</th>
                      <th>Trigger</th>
                      <th>Recipients</th>
                      <th>Channels</th>
                      <th>Timing</th>
                      <th class="center">Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of store.notificationRules(); track r.id) {
                      <tr>
                        <td><strong>{{ r.name }}</strong></td>
                        <td class="pc-muted">{{ r.trigger }}</td>
                        <td>{{ r.recipients }}</td>
                        <td>
                          <div class="pc-channels">
                            @for (c of r.channels; track c) {
                              <span class="pc-ch-chip" [attr.data-ch]="c">{{ c }}</span>
                            }
                          </div>
                        </td>
                        <td class="pc-muted">{{ r.timing }}</td>
                        <td class="center">
                          @if (r.locked) {
                            <span class="pc-lock-tag" title="Tenants cannot disable this rule">
                              <svg viewBox="0 0 16 16" fill="none"><path d="M4 7V5a4 4 0 118 0v2M3.5 7h9v6a1 1 0 01-1 1H4.5a1 1 0 01-1-1V7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                              Locked
                            </span>
                          } @else {
                            <span class="pc-allow-tag">Allowed</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <h3 class="pc-sub">Message Templates</h3>
              <div class="pc-msg-list">
                @for (m of store.messageTemplates(); track m.id) {
                  <article class="pc-msg">
                    <header class="pc-msg__head">
                      <span class="pc-ch-chip" [attr.data-ch]="m.channel">{{ m.channel }}</span>
                      <h4>{{ m.notification }}</h4>
                      @if (m.charCount) {
                        <span class="pc-msg__count" [class.pc-msg__count--warn]="m.charCount > 160">{{ m.charCount }} chars</span>
                      }
                    </header>
                    <p class="pc-msg__body">{{ m.body }}</p>
                    <div class="pc-msg__actions">
                      <button type="button" class="pc-link-btn" (click)="previewMessageTemplate(m)">Preview</button>
                      <button type="button" class="pc-link-btn" (click)="editMessageTemplate(m)">Edit</button>
                      <button type="button" class="pc-link-btn pc-link-btn--muted" (click)="resetMessageTemplateConfirm(m)">Reset to default</button>
                    </div>
                  </article>
                }
              </div>
            </div>
          }

          <!-- Global Settings -->
          @case ('settings') {
            <div class="pc-panel">
              <div class="pc-panel__head">
                <div>
                  <h2>Global Program Settings</h2>
                  <p>Last updated {{ store.settings().lastUpdatedAt }} by {{ store.settings().lastUpdatedBy }}.</p>
                </div>
                <div class="pc-panel__actions">
                  <button type="button" class="pc-btn pc-btn--ghost" (click)="revertSettingsConfirm()">Revert to Defaults</button>
                  <button type="button" class="pc-btn pc-btn--primary" (click)="saveSettings()">Save Changes</button>
                </div>
              </div>

              <div class="pc-settings">
                <section class="pc-setting-group">
                  <h3>General</h3>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Allow Custom Program Types</p>
                      <p class="pc-setting__desc">Tenant Admins can create custom types beyond system-defined ones.</p>
                    </div>
                    <label class="pc-toggle">
                      <input type="checkbox" [ngModel]="settings().allowCustomProgramTypes" (ngModelChange)="store.updateSettings({ allowCustomProgramTypes: $event })" />
                      <span class="pc-toggle__track"><span class="pc-toggle__thumb"></span></span>
                    </label>
                  </div>
                  <div class="pc-setting pc-setting--grid">
                    <div>
                      <p class="pc-setting__label">Max Programs per Tenant</p>
                      <p class="pc-setting__desc">Upper bound per subscription tier.</p>
                    </div>
                    <div class="pc-tier-grid">
                      @for (tier of tiers; track tier) {
                        <label class="pc-tier-cell">
                          <span>{{ tier }}</span>
                          <input type="text" [value]="settings().maxProgramsPerTenant[tier] ?? 'Unlimited'" readonly />
                        </label>
                      }
                    </div>
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Default Program Capacity</p>
                      <p class="pc-setting__desc">Suggested max clients when creating a program.</p>
                    </div>
                    <input type="number" class="pc-num" [ngModel]="settings().defaultProgramCapacity" (ngModelChange)="store.updateSettings({ defaultProgramCapacity: $event })" />
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Auto-Generate Program Code</p>
                      <p class="pc-setting__desc">Format: first letters of words + sequence (e.g., GDC-001).</p>
                    </div>
                    <label class="pc-toggle">
                      <input type="checkbox" [ngModel]="settings().autoGenerateProgramCode" (ngModelChange)="store.updateSettings({ autoGenerateProgramCode: $event })" />
                      <span class="pc-toggle__track"><span class="pc-toggle__thumb"></span></span>
                    </label>
                  </div>
                </section>

                <section class="pc-setting-group">
                  <h3>Check-Ins</h3>
                  <div class="pc-setting pc-setting--grid">
                    <div>
                      <p class="pc-setting__label">Default Check-In Window</p>
                      <p class="pc-setting__desc">Clients must submit within this daily window.</p>
                    </div>
                    <div class="pc-row-2">
                      <input type="time" class="pc-num" [ngModel]="settings().defaultWindowStart" (ngModelChange)="store.updateSettings({ defaultWindowStart: $event })" />
                      <input type="time" class="pc-num" [ngModel]="settings().defaultWindowEnd" (ngModelChange)="store.updateSettings({ defaultWindowEnd: $event })" />
                    </div>
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Default Late Grace Period (minutes)</p>
                      <p class="pc-setting__desc">Buffer after deadline before a check-in is marked missed.</p>
                    </div>
                    <input type="number" class="pc-num" [ngModel]="settings().defaultLateGraceMinutes" (ngModelChange)="store.updateSettings({ defaultLateGraceMinutes: $event })" />
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Crisis Keyword Detection</p>
                      <p class="pc-setting__desc">Cannot be disabled — required for safety.</p>
                    </div>
                    <label class="pc-toggle pc-toggle--locked">
                      <input type="checkbox" [checked]="true" disabled />
                      <span class="pc-toggle__track"><span class="pc-toggle__thumb"></span></span>
                    </label>
                  </div>
                </section>

                <section class="pc-setting-group">
                  <h3>Compliance</h3>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Risk Score Model</p>
                      <p class="pc-setting__desc">Algorithm used to combine indicator weights.</p>
                    </div>
                    <select class="pc-select" [ngModel]="settings().riskScoreModel" (ngModelChange)="store.updateSettings({ riskScoreModel: $event })">
                      <option value="Weighted Sum">Weighted Sum</option>
                      <option value="Maximum">Maximum</option>
                      <option value="Average">Average</option>
                    </select>
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Enable Compliance Streaks</p>
                      <p class="pc-setting__desc">Milestones: {{ settings().streakMilestones.join(', ') }} days.</p>
                    </div>
                    <label class="pc-toggle">
                      <input type="checkbox" [ngModel]="settings().enableComplianceStreaks" (ngModelChange)="store.updateSettings({ enableComplianceStreaks: $event })" />
                      <span class="pc-toggle__track"><span class="pc-toggle__thumb"></span></span>
                    </label>
                  </div>
                </section>

                <section class="pc-setting-group">
                  <h3>UA / Drug Testing</h3>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Default Test Panel</p>
                      <p class="pc-setting__desc">Panel assigned to new programs by default.</p>
                    </div>
                    <select class="pc-select" [ngModel]="settings().defaultTestPanel" (ngModelChange)="store.updateSettings({ defaultTestPanel: $event })">
                      <option value="5-panel">5-panel</option>
                      <option value="10-panel">10-panel</option>
                      <option value="12-panel">12-panel</option>
                    </select>
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Positive UA Always Escalates</p>
                      <p class="pc-setting__desc">Locked for patient safety — cannot be disabled.</p>
                    </div>
                    <label class="pc-toggle pc-toggle--locked">
                      <input type="checkbox" [checked]="true" disabled />
                      <span class="pc-toggle__track"><span class="pc-toggle__thumb"></span></span>
                    </label>
                  </div>
                </section>

                <section class="pc-setting-group">
                  <h3>Consent &amp; Privacy</h3>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">42 CFR Part 2 Enforcement</p>
                      <p class="pc-setting__desc">Federal privacy protections — cannot be disabled.</p>
                    </div>
                    <label class="pc-toggle pc-toggle--locked">
                      <input type="checkbox" [checked]="true" disabled />
                      <span class="pc-toggle__track"><span class="pc-toggle__thumb"></span></span>
                    </label>
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Default Consent Duration (days)</p>
                      <p class="pc-setting__desc">Auto-expire after this period unless renewed.</p>
                    </div>
                    <input type="number" class="pc-num" [ngModel]="settings().defaultConsentDurationDays" (ngModelChange)="store.updateSettings({ defaultConsentDurationDays: $event })" />
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Cross-Program Data Sharing</p>
                      <p class="pc-setting__desc">Default behavior for multi-program enrollment.</p>
                    </div>
                    <select class="pc-select" [ngModel]="settings().crossProgramDataSharing" (ngModelChange)="store.updateSettings({ crossProgramDataSharing: $event })">
                      <option value="Blocked">Blocked</option>
                      <option value="Consent Required">Consent Required</option>
                      <option value="Open Within Tenant">Open Within Tenant</option>
                    </select>
                  </div>
                </section>

                <section class="pc-setting-group">
                  <h3>Data Retention</h3>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Program Data Retention (years)</p>
                      <p class="pc-setting__desc">HIPAA minimum — 7 years recommended.</p>
                    </div>
                    <input type="number" class="pc-num" [ngModel]="settings().programDataRetentionYears" (ngModelChange)="store.updateSettings({ programDataRetentionYears: $event })" />
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Purge Schedule</p>
                      <p class="pc-setting__desc">When expired records are removed.</p>
                    </div>
                    <span class="pc-readonly">{{ settings().purgeSchedule }}</span>
                  </div>
                  <div class="pc-setting">
                    <div>
                      <p class="pc-setting__label">Legal Hold Override</p>
                      <p class="pc-setting__desc">Pauses purge when legal hold is active — locked.</p>
                    </div>
                    <label class="pc-toggle pc-toggle--locked">
                      <input type="checkbox" [checked]="true" disabled />
                      <span class="pc-toggle__track"><span class="pc-toggle__thumb"></span></span>
                    </label>
                  </div>
                </section>
              </div>
            </div>
          }
        }
      </section>

      <!-- Modals -->
      @if (modal(); as m) {
        @switch (m.kind) {
          @case ('type-edit') {
            <app-program-type-editor-modal
              [existing]="m.type"
              (close)="closeModal()"
            />
          }
          @case ('feature-edit') {
            <app-feature-editor-modal
              [existing]="m.feature"
              (close)="closeModal()"
            />
          }
          @case ('template-edit') {
            <app-template-editor-modal
              [kind]="m.templateKind"
              [existing]="m.template"
              (close)="closeModal()"
            />
          }
          @case ('message-edit') {
            <app-message-template-editor-modal
              [template]="m.template"
              (close)="closeModal()"
            />
          }
          @case ('confirm') {
            <app-confirm-modal
              [title]="m.title"
              [body]="m.body"
              [detail]="m.detail || ''"
              [tone]="m.tone"
              [confirmLabel]="m.confirmLabel"
              (confirm)="m.action()"
              (close)="closeModal()"
            />
          }
        }
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; background: #F8FAFC; min-height: 100vh; }
      .pc { max-width: 1400px; margin: 0 auto; padding: 1.5rem 1.75rem 3rem; color: #0F172A; font-family: 'Inter', system-ui, sans-serif; }

      /* Header */
      .pc__header { margin-bottom: 1.25rem; }
      .pc__crumb { display: flex; align-items: center; gap: 0.3125rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #64748B; margin-bottom: 0.625rem; }
      .pc__crumb a { color: #475569; text-decoration: none; }
      .pc__crumb a:hover { color: #1E293B; }
      .pc__crumb svg { width: 12px; height: 12px; color: #CBD5E1; }
      .pc__crumb span { color: #1E293B; }
      .pc__header-main { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
      .pc__title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1E293B; letter-spacing: -0.02em; }
      .pc__subtitle { margin: 0.375rem 0 0; font-size: 0.875rem; color: #64748B; max-width: 60ch; }
      .pc__header-meta { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.875rem; background: white; border: 1px solid #E2E8F0; border-radius: 8px; }
      .pc__meta-item { font-size: 0.75rem; color: #64748B; }
      .pc__meta-item strong { color: #0F172A; font-weight: 700; }
      .pc__meta-divider { width: 1px; height: 14px; background: #E2E8F0; }

      /* Tabs */
      .pc__tabs { display: flex; align-items: center; gap: 0.125rem; border-bottom: 1px solid #E2E8F0; margin-bottom: 1.25rem; overflow-x: auto; scrollbar-width: thin; }
      .pc-tab { position: relative; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: transparent; border: 0; border-bottom: 2px solid transparent; font-size: 0.8125rem; font-weight: 600; color: #64748B; cursor: pointer; white-space: nowrap; transition: color 0.15s; font-family: inherit; }
      .pc-tab:hover { color: #334155; }
      .pc-tab--active { color: #2563EB; border-bottom-color: #2563EB; }
      .pc-tab__badge { display: inline-flex; align-items: center; padding: 0.0625rem 0.4375rem; background: #F1F5F9; color: #64748B; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; min-width: 18px; justify-content: center; }
      .pc-tab--active .pc-tab__badge { background: #DBEAFE; color: #1E40AF; }

      /* Panels */
      .pc__content { display: flex; flex-direction: column; gap: 1rem; }
      .pc-panel { background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
      .pc-panel__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
      .pc-panel__head h2 { margin: 0; font-size: 1.0625rem; font-weight: 700; color: #1E293B; }
      .pc-panel__head p { margin: 0.25rem 0 0; font-size: 0.8125rem; color: #64748B; }
      .pc-panel__actions { display: flex; gap: 0.5rem; }
      .pc-sub { margin: 1.5rem 0 0.625rem; font-size: 0.75rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.06em; }

      /* Buttons */
      .pc-btn { padding: 0.5rem 0.875rem; border-radius: 7px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; background: white; color: #334155; border-color: #E2E8F0; font-family: inherit; transition: all 0.15s; }
      .pc-btn:hover { background: #F1F5F9; }
      .pc-btn--primary { background: #2563EB; color: white; border-color: #2563EB; box-shadow: 0 1px 2px rgba(37,99,235,0.2); }
      .pc-btn--primary:hover { background: #1D4ED8; }
      .pc-btn--ghost { background: white; color: #475569; }
      .pc-btn--block { width: 100%; }
      .pc-btn--danger-ghost { background: white; color: #DC2626; border-color: #FECACA; }
      .pc-btn--danger-ghost:hover { background: #FEF2F2; }
      .pc-link-btn { border: 0; background: transparent; color: #2563EB; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.25rem 0.375rem; font-family: inherit; }
      .pc-link-btn:hover { text-decoration: underline; }
      .pc-link-btn--muted { color: #64748B; }

      /* Program Types grid */
      .pc-types { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
      @media (max-width: 1200px) { .pc-types { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 720px)  { .pc-types { grid-template-columns: 1fr; } }
      .pc-type { position: relative; display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem 1.125rem; background: white; border: 1px solid #E2E8F0; border-radius: 12px; transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s; }
      .pc-type:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(15,23,42,0.05); transform: translateY(-1px); }
      .pc-type__head { display: flex; align-items: flex-start; gap: 0.75rem; }
      .pc-type__icon { flex: 0 0 40px; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
      .pc-type__icon svg { width: 22px; height: 22px; }
      .pc-type__ident { flex: 1; min-width: 0; }
      .pc-type__ident h3 { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #0F172A; }
      .pc-type__ident code { display: inline-block; margin-top: 0.1875rem; font-size: 0.6875rem; color: #64748B; font-family: ui-monospace, Menlo, monospace; letter-spacing: 0.05em; }
      .pc-type__kebab { flex: 0 0 28px; width: 28px; height: 28px; border: 0; background: transparent; border-radius: 6px; cursor: pointer; color: #94A3B8; display: inline-flex; align-items: center; justify-content: center; }
      .pc-type__kebab:hover { background: #F1F5F9; color: #475569; }
      .pc-type__kebab svg { width: 16px; height: 16px; }
      .pc-type__desc { margin: 0; font-size: 0.8125rem; color: #64748B; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5rem; }
      .pc-type__progress { padding: 0.5rem 0.625rem; background: #F8FAFC; border-radius: 8px; }
      .pc-type__progress-top { display: flex; justify-content: space-between; align-items: center; font-size: 0.6875rem; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.3125rem; }
      .pc-type__progress-top strong { color: #0F172A; font-weight: 700; }
      .pc-type__bar { height: 6px; background: #E2E8F0; border-radius: 9999px; overflow: hidden; }
      .pc-type__bar-fill { height: 100%; border-radius: 9999px; transition: width 0.3s; }
      .pc-type__stats { margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.375rem; }
      .pc-type__stats > div { text-align: center; padding: 0.375rem; background: #F8FAFC; border-radius: 6px; }
      .pc-type__stats dt { margin: 0; font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8; font-weight: 600; }
      .pc-type__stats dd { margin: 0.125rem 0 0; font-size: 0.875rem; font-weight: 700; color: #1E293B; }
      .pc-type__usage { margin: 0; font-size: 0.75rem; color: #64748B; line-height: 1.4; }
      .pc-type__usage strong { color: #1E293B; font-weight: 700; }
      .pc-type__foot { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; padding-top: 0.625rem; border-top: 1px solid #F1F5F9; }
      .pc-type__status { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: #059669; font-weight: 600; }
      .pc-type__status--off { color: #94A3B8; }
      .pc-type__lock { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.6875rem; color: #64748B; font-weight: 600; padding: 0.125rem 0.375rem; background: #F1F5F9; border-radius: 4px; }
      .pc-type__lock svg { width: 11px; height: 11px; }
      .pc-type__foot .pc-btn { margin-left: auto; flex: 1; max-width: 140px; }
      .pc-dot { display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background: #CBD5E1; }
      .pc-dot--on { background: #059669; }

      /* Filters */
      .pc-filters { display: flex; gap: 0.5rem; margin-bottom: 0.875rem; flex-wrap: wrap; }
      .pc-search, .pc-select { padding: 0.5rem 0.75rem; border: 1px solid #E2E8F0; border-radius: 7px; font-size: 0.8125rem; font-family: inherit; outline: none; color: #0F172A; background: white; }
      .pc-search { flex: 1; min-width: 200px; }
      .pc-select { min-width: 140px; }
      .pc-search:focus, .pc-select:focus { border-color: #2563EB; box-shadow: 0 0 0 3px #DBEAFE; }

      /* Tables */
      .pc-table-wrap { border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; overflow-x: auto; }
      .pc-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
      .pc-table th { text-align: left; padding: 0.625rem 0.875rem; background: #F8FAFC; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; font-weight: 700; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
      .pc-table th.right, .pc-table td.right { text-align: right; }
      .pc-table th.center, .pc-table td.center { text-align: center; }
      .pc-table td { padding: 0.6875rem 0.875rem; border-bottom: 1px solid #F1F5F9; color: #334155; vertical-align: middle; }
      .pc-table tr:last-child td { border-bottom: 0; }
      .pc-table tbody tr:hover { background: #F8FAFC; }
      .pc-td-desc { color: #64748B; max-width: 320px; }
      .pc-empty-row { text-align: center; padding: 2rem !important; color: #94A3B8; font-style: italic; }

      .pc-code { font-family: ui-monospace, Menlo, monospace; font-size: 0.75rem; background: #F1F5F9; color: #334155; padding: 0.125rem 0.375rem; border-radius: 4px; }
      .pc-badge { display: inline-flex; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
      .pc-tier { display: inline-flex; padding: 0.125rem 0.5rem; background: #EEF2FF; color: #3730A3; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; }
      .pc-status { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 600; }
      .pc-status--active { color: #059669; }
      .pc-status--beta { color: #D97706; }
      .pc-status--deprecated { color: #94A3B8; }
      .pc-muted { color: #64748B; }

      /* Templates */
      .pc-template-list { display: flex; flex-direction: column; gap: 0.625rem; }
      .pc-template { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.875rem 1rem; background: white; border: 1px solid #E2E8F0; border-radius: 10px; transition: border-color 0.15s; }
      .pc-template:hover { border-color: #CBD5E1; }
      .pc-template__info { flex: 1; min-width: 0; }
      .pc-template__title { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
      .pc-template__title h3 { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #0F172A; }
      .pc-template__info p { margin: 0 0 0.375rem; font-size: 0.8125rem; color: #64748B; }
      .pc-template__meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #64748B; flex-wrap: wrap; }
      .pc-template__meta strong { color: #1E293B; font-weight: 700; }
      .pc-template__actions { display: flex; gap: 0.375rem; flex-shrink: 0; }
      .pc-chip { display: inline-flex; padding: 0.125rem 0.5rem; background: #F1F5F9; color: #475569; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; }
      .pc-chip--system { background: #E0E7FF; color: #3730A3; }
      .pc-chip--muted { background: #F1F5F9; color: #475569; }

      /* Risk */
      .pc-risk-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.625rem; margin-bottom: 0.5rem; }
      @media (max-width: 700px) { .pc-risk-grid { grid-template-columns: repeat(2, 1fr); } }
      .pc-risk { padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 10px; border-left: 3px solid var(--band); background: white; }
      .pc-risk__level { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.25rem; }
      .pc-risk__dot { width: 8px; height: 8px; border-radius: 9999px; }
      .pc-risk__level strong { font-size: 0.875rem; font-weight: 700; color: #0F172A; }
      .pc-risk__range { margin: 0; font-size: 1.125rem; font-weight: 800; color: #0F172A; font-variant-numeric: tabular-nums; }
      .pc-risk__action { margin: 0.25rem 0 0; font-size: 0.75rem; color: #64748B; line-height: 1.4; }
      .pc-weight { width: 100%; }
      .pc-weight__bar { height: 6px; background: #E2E8F0; border-radius: 9999px; overflow: hidden; min-width: 80px; max-width: 160px; }
      .pc-weight__fill { height: 100%; background: linear-gradient(90deg, #2563EB, #3730A3); border-radius: 9999px; }

      /* Notifications */
      .pc-global-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; padding: 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; margin-bottom: 0.5rem; }
      @media (max-width: 800px) { .pc-global-strip { grid-template-columns: repeat(2, 1fr); } }
      .pc-global-strip__label { margin: 0; font-size: 0.6875rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .pc-global-strip__value { margin: 0.125rem 0 0; font-size: 0.8125rem; color: #0F172A; font-weight: 600; }
      .pc-channels { display: inline-flex; gap: 0.25rem; flex-wrap: wrap; }
      .pc-ch-chip { display: inline-flex; padding: 0.0625rem 0.4375rem; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; background: #F1F5F9; color: #475569; }
      .pc-ch-chip[data-ch="SMS"]   { background: #DCFCE7; color: #166534; }
      .pc-ch-chip[data-ch="Email"] { background: #DBEAFE; color: #1E40AF; }
      .pc-ch-chip[data-ch="Push"]  { background: #FEF3C7; color: #92400E; }
      .pc-ch-chip[data-ch="In-App"] { background: #E0E7FF; color: #3730A3; }
      .pc-lock-tag { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.6875rem; font-weight: 700; color: #7C2D12; background: #FED7AA; padding: 0.125rem 0.4375rem; border-radius: 4px; }
      .pc-lock-tag svg { width: 11px; height: 11px; }
      .pc-allow-tag { font-size: 0.6875rem; font-weight: 700; color: #475569; background: #F1F5F9; padding: 0.125rem 0.4375rem; border-radius: 4px; }
      .pc-msg-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .pc-msg { padding: 0.75rem 0.875rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; }
      .pc-msg__head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.375rem; }
      .pc-msg__head h4 { margin: 0; font-size: 0.8125rem; font-weight: 700; color: #0F172A; }
      .pc-msg__count { margin-left: auto; font-size: 0.6875rem; color: #64748B; font-weight: 600; }
      .pc-msg__count--warn { color: #D97706; }
      .pc-msg__body { margin: 0 0 0.375rem; font-size: 0.8125rem; color: #334155; line-height: 1.45; font-family: ui-monospace, Menlo, monospace; background: white; padding: 0.5rem 0.625rem; border: 1px solid #E2E8F0; border-radius: 6px; }
      .pc-msg__actions { display: flex; gap: 0.25rem; }

      /* Settings */
      .pc-settings { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      @media (max-width: 900px) { .pc-settings { grid-template-columns: 1fr; } }
      .pc-setting-group { background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 0.875rem 1rem; }
      .pc-setting-group h3 { margin: 0 0 0.75rem; font-size: 0.75rem; font-weight: 700; color: #3730A3; text-transform: uppercase; letter-spacing: 0.06em; padding-bottom: 0.5rem; border-bottom: 1px solid #F1F5F9; }
      .pc-setting { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.625rem 0; border-bottom: 1px dashed #F1F5F9; }
      .pc-setting:last-child { border-bottom: 0; padding-bottom: 0; }
      .pc-setting--grid { align-items: flex-start; flex-direction: column; gap: 0.5rem; }
      .pc-setting__label { margin: 0; font-size: 0.8125rem; font-weight: 600; color: #1E293B; }
      .pc-setting__desc { margin: 0.125rem 0 0; font-size: 0.75rem; color: #64748B; line-height: 1.4; }
      .pc-readonly { font-size: 0.8125rem; color: #475569; padding: 0.25rem 0.5rem; background: #F1F5F9; border-radius: 4px; }
      .pc-num { width: 96px; padding: 0.375rem 0.5rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.8125rem; font-family: inherit; text-align: right; outline: none; color: #0F172A; background: white; }
      .pc-num:focus { border-color: #2563EB; box-shadow: 0 0 0 3px #DBEAFE; }
      .pc-row-2 { display: flex; gap: 0.375rem; }
      .pc-tier-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.375rem; width: 100%; }
      @media (max-width: 640px) { .pc-tier-grid { grid-template-columns: repeat(2, 1fr); } }
      .pc-tier-cell { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.6875rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
      .pc-tier-cell input { padding: 0.3125rem 0.5rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.8125rem; background: #F8FAFC; color: #0F172A; font-family: inherit; outline: none; text-align: center; }

      /* Toggle */
      .pc-toggle { flex: 0 0 auto; display: inline-flex; position: relative; cursor: pointer; }
      .pc-toggle input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
      .pc-toggle__track { width: 36px; height: 20px; background: #CBD5E1; border-radius: 9999px; position: relative; transition: background 0.2s; }
      .pc-toggle__thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 9999px; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(15,23,42,0.2); }
      .pc-toggle input:checked + .pc-toggle__track { background: #2563EB; }
      .pc-toggle input:checked + .pc-toggle__track .pc-toggle__thumb { transform: translateX(16px); }
      .pc-toggle--locked .pc-toggle__track { background: #94A3B8 !important; cursor: not-allowed; opacity: 0.7; }

      /* Kebab dropdown */
      .pc-kebab-wrap { position: relative; }
      .pc-kebab-menu { position: absolute; top: 32px; right: 0; z-index: 40; min-width: 170px; background: white; border: 1px solid #E2E8F0; border-radius: 8px; box-shadow: 0 8px 24px rgba(15,23,42,0.12); padding: 0.25rem; display: flex; flex-direction: column; }
      .pc-kebab-menu button { padding: 0.4375rem 0.625rem; border: 0; background: transparent; text-align: left; font-size: 0.8125rem; color: #334155; cursor: pointer; border-radius: 5px; font-family: inherit; }
      .pc-kebab-menu button:hover { background: #F1F5F9; color: #0F172A; }
      .pc-kebab-menu__danger { color: #DC2626 !important; }
      .pc-kebab-menu__danger:hover { background: #FEF2F2 !important; }
    `
  ]
})
export class ProgramConfigComponent {
  public readonly store = inject(ProgramConfigStoreService);
  private readonly router = inject(Router);
  public readonly toast = inject(ToastService);

  public readonly tabs: ITabDef[] = [
    { key: 'program-types',     label: 'Program Types',     hash: '#program-types' },
    { key: 'features',          label: 'Feature Catalog',   hash: '#features' },
    { key: 'checkin-templates', label: 'Check-In Templates',hash: '#checkin-templates' },
    { key: 'compliance',        label: 'Compliance',        hash: '#compliance' },
    { key: 'phases',            label: 'Phase Templates',   hash: '#phases' },
    { key: 'notifications',     label: 'Notifications',     hash: '#notifications' },
    { key: 'settings',          label: 'Global Settings',   hash: '#settings' }
  ];

  public readonly tab = signal<TabKey>('program-types');
  public readonly counts = computed(() => this.store.counts());
  public readonly types = computed(() => this.store.types());
  public readonly settings = computed(() => this.store.settings());

  public readonly modal = signal<ModalState>(null);
  public readonly openKebab = signal<string | null>(null);

  public closeModal(): void { this.modal.set(null); }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.pc-kebab-wrap')) this.openKebab.set(null);
  }

  // Program Type actions
  public openAddType(): void {
    this.modal.set({ kind: 'type-edit', type: null });
  }
  public openEditType(t: IProgramTypeDef): void {
    this.openKebab.set(null);
    this.modal.set({ kind: 'type-edit', type: t });
  }
  public configureType(t: IProgramTypeDef): void {
    this.router.navigate(['/system/programs/configuration/types', t.code]);
  }
  public toggleTypeActive(t: IProgramTypeDef): void {
    this.openKebab.set(null);
    this.store.toggleTypeActive(t.code);
    this.toast.showSuccess(`${t.name} ${t.isActive ? 'deactivated' : 'activated'}.`);
  }
  public duplicateType(t: IProgramTypeDef): void {
    this.openKebab.set(null);
    const clone = this.store.duplicateType(t.code);
    if (clone) this.toast.showSuccess(`${clone.name} created as custom copy.`);
  }
  public deleteTypeConfirm(t: IProgramTypeDef): void {
    this.openKebab.set(null);
    if (t.isSystem) { this.toast.showError('System types cannot be deleted.'); return; }
    if (t.programsUsing > 0) { this.toast.showError('Cannot delete — programs are using this type.'); return; }
    this.modal.set({
      kind: 'confirm',
      title: 'Delete Program Type',
      body: `Permanently delete "${t.name}"? This cannot be undone.`,
      tone: 'danger',
      confirmLabel: 'Delete',
      action: () => {
        if (this.store.deleteType(t.code)) this.toast.showSuccess(`${t.name} deleted.`);
      }
    });
  }
  public toggleKebab(code: string): void {
    this.openKebab.update(c => (c === code ? null : code));
  }

  // Feature actions
  public openAddFeature(): void { this.modal.set({ kind: 'feature-edit', feature: null }); }
  public openEditFeature(f: IFeatureDef): void { this.modal.set({ kind: 'feature-edit', feature: f }); }
  public deleteFeatureConfirm(f: IFeatureDef): void {
    if (f.programsUsing > 0) { this.toast.showError('Cannot delete — feature is in use.'); return; }
    this.modal.set({
      kind: 'confirm',
      title: 'Delete Feature',
      body: `Permanently delete "${f.name}"? This cannot be undone.`,
      tone: 'danger',
      confirmLabel: 'Delete',
      action: () => {
        if (this.store.deleteFeature(f.key)) this.toast.showSuccess(`${f.name} deleted.`);
      }
    });
  }

  // Template actions (checkin / compliance / phase)
  public openAddTemplate(kind: TemplateKind): void {
    this.modal.set({ kind: 'template-edit', templateKind: kind, template: null });
  }
  public openEditTemplate(kind: TemplateKind, t: ITemplateSummary): void {
    this.modal.set({ kind: 'template-edit', templateKind: kind, template: t });
  }
  public duplicateTemplate(kind: TemplateKind, t: ITemplateSummary): void {
    const clone = this.store.duplicateTemplate(kind, t.id);
    if (clone) this.toast.showSuccess(`${clone.name} created.`);
  }
  public deleteTemplateConfirm(kind: TemplateKind, t: ITemplateSummary): void {
    if (t.isSystem) { this.toast.showError('System templates cannot be deleted.'); return; }
    if (t.programsUsing > 0) { this.toast.showError('Cannot delete — programs are using this template.'); return; }
    this.modal.set({
      kind: 'confirm',
      title: 'Delete Template',
      body: `Permanently delete "${t.name}"?`,
      tone: 'danger',
      confirmLabel: 'Delete',
      action: () => {
        if (this.store.deleteTemplate(kind, t.id)) this.toast.showSuccess(`${t.name} deleted.`);
      }
    });
  }
  public previewTemplate(t: ITemplateSummary): void {
    this.toast.showInfo(`Preview: "${t.name}" — ${t.itemCount} ${t.itemLabel}.`);
  }

  // Message template actions
  public editMessageTemplate(m: IMessageTemplate): void {
    this.modal.set({ kind: 'message-edit', template: m });
  }
  public previewMessageTemplate(m: IMessageTemplate): void {
    this.toast.showInfo(`${m.channel} preview: "${m.body.slice(0, 120)}${m.body.length > 120 ? '…' : ''}"`);
  }
  public resetMessageTemplateConfirm(m: IMessageTemplate): void {
    this.modal.set({
      kind: 'confirm',
      title: 'Reset to Default',
      body: `Reset ${m.channel} template for "${m.notification}" to its default body?`,
      tone: 'warn',
      confirmLabel: 'Reset',
      action: () => {
        this.store.resetMessageTemplate(m.id);
        this.toast.showSuccess('Template reset.');
      }
    });
  }

  // Global settings actions
  public saveSettings(): void {
    this.store.updateSettings({ lastUpdatedBy: 'You' });
    this.toast.showSuccess('Global settings saved.');
  }
  public revertSettingsConfirm(): void {
    this.modal.set({
      kind: 'confirm',
      title: 'Revert to Defaults',
      body: 'Restore all global program settings to their platform defaults? In-flight program settings are not affected.',
      tone: 'warn',
      confirmLabel: 'Revert',
      action: () => this.toast.showInfo('Defaults restored.')
    });
  }

  public readonly allCategories: FeatureCategory[] = ['Engagement', 'Compliance', 'Clinical', 'Housing', 'Justice', 'Communication', 'Reporting', 'Administrative'];
  public readonly tiers: SubscriptionTier[] = TIER_ORDER;
  public readonly tierLabel = TIER_LABEL;

  public featureSearch = '';
  public featureCategory: '' | FeatureCategory = '';
  public featureTier: '' | SubscriptionTier = '';
  public featureStatus: '' | FeatureStatus = '';

  public readonly filteredFeatures = computed(() => {
    const q = this.featureSearch.trim().toLowerCase();
    const cat = this.featureCategory;
    const tier = this.featureTier;
    const status = this.featureStatus;
    return this.store.features().filter(f => {
      if (q && !f.name.toLowerCase().includes(q) && !f.key.toLowerCase().includes(q)) return false;
      if (cat && f.category !== cat) return false;
      if (tier && f.minTier !== tier) return false;
      if (status && f.status !== status) return false;
      return true;
    });
  });

  public tabBadge(key: TabKey): string {
    const c = this.counts();
    switch (key) {
      case 'program-types':     return String(c.types);
      case 'features':          return String(c.features);
      case 'checkin-templates': return String(c.checkin);
      case 'compliance':        return String(c.compliance);
      case 'phases':            return String(c.phases);
      case 'notifications':     return String(c.notifications);
      case 'settings':          return '—';
    }
  }

  public catBg(c: FeatureCategory): string {
    const hex = CATEGORY_COLOR[c];
    return hex + '18';
  }
  public catFg(c: FeatureCategory): string {
    return CATEGORY_COLOR[c];
  }

  public iconPath(key: string): string {
    const icons: Record<string, string> = {
      gavel:         'M8 3l5 5M5 6l5 5M13 8l-5 5M16 11l3 3M15 10l4 4M3 21h8',
      'heart-pulse': 'M3 12h3l2-4 4 8 2-4h7M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
      home:          'M3 12l9-9 9 9v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z',
      'shield-check':'M12 2l9 4v6c0 5-3.8 9.5-9 11-5.2-1.5-9-6-9-11V6l9-4zM9 12l2 2 4-4',
      briefcase:    'M3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm5-2V4a2 2 0 012-2h4a2 2 0 012 2v1',
      pill:         'M10.5 7.5l6 6M4.5 13.5a5.5 5.5 0 007.78 7.78l8-8a5.5 5.5 0 10-7.78-7.78l-8 8z',
      users:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
      'door-open':  'M13 4h3a2 2 0 012 2v14H4V6a2 2 0 012-2h3M8 4v16M12 12h.01',
      settings:     'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.3l2-1.5-2-3.4-2.3.9a7.4 7.4 0 00-2.2-1.3L14 3h-4l-.7 2.4a7.4 7.4 0 00-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7.4 7.4 0 000 2.6l-2 1.5 2 3.4 2.3-.9a7.4 7.4 0 002.2 1.3L10 21h4l.7-2.4a7.4 7.4 0 002.2-1.3l2.3.9 2-3.4-2-1.5c.07-.4.1-.85.1-1.3z'
    };
    return icons[key] ?? icons['settings'];
  }
}
