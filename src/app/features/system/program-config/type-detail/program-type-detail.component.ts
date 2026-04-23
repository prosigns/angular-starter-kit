import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { ProgramTypeEditorModalComponent } from '../modals/program-type-editor-modal.component';
import { ProgramConfigStoreService } from '../program-config-store.service';
import { FeatureOverrideMode } from '../program-config.types';

type InnerTab = 'general' | 'features' | 'phases' | 'compliance' | 'checkin' | 'ua' | 'notifications' | 'usage';

@Component({
  selector: 'app-program-type-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, ProgramTypeEditorModalComponent],
  template: `
    @if (type(); as t) {
      <div class="ptd">
        <header class="ptd__header">
          <nav class="ptd__crumb" aria-label="Breadcrumb">
            <a routerLink="/system/programs">Programs</a>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>
            <a routerLink="/system/programs/configuration">Configuration</a>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>
            <span>{{ t.name }}</span>
          </nav>

          <div class="ptd__title-row">
            <div class="ptd__title-left">
              <div class="ptd__icon" [style.background]="t.color + '18'" [style.color]="t.color">
                <svg viewBox="0 0 24 24" fill="none"><path [attr.d]="iconPath(t.iconKey)" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <h1>{{ t.name }}</h1>
                <p class="ptd__meta">
                  <code>{{ t.code }}</code>
                  @if (t.isSystem) { <span class="ptd__sys">🔒 System</span> }
                  <span>·</span>
                  <span>Used by {{ t.programsUsing }} programs</span>
                </p>
              </div>
            </div>
            <div class="ptd__actions">
              <button type="button" class="ptd-btn ptd-btn--ghost" (click)="editorOpen.set(true)">Edit Metadata</button>
              <button type="button" class="ptd-btn ptd-btn--primary" (click)="saveChanges()">Save Changes</button>
            </div>
          </div>
        </header>

        <div class="ptd__tabs" role="tablist">
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              class="ptd-tab"
              role="tab"
              [class.ptd-tab--active]="innerTab() === tab.key"
              (click)="innerTab.set(tab.key)"
            >{{ tab.label }}</button>
          }
        </div>

        <section class="ptd__content">
          @switch (innerTab()) {
            @case ('general') {
              <div class="ptd-panel">
                <h2>General</h2>
                <dl class="ptd-kv">
                  <div><dt>Name</dt><dd>{{ t.name }}</dd></div>
                  <div><dt>Code</dt><dd><code>{{ t.code }}</code></dd></div>
                  <div><dt>Category</dt><dd>{{ t.category }}</dd></div>
                  <div><dt>Min Tier</dt><dd>{{ t.minTier }}</dd></div>
                  <div><dt>Default Capacity</dt><dd>{{ t.defaultCapacity }}</dd></div>
                  <div><dt>Status</dt><dd>{{ t.isActive ? 'Active' : 'Inactive' }}</dd></div>
                  <div><dt>System Type</dt><dd>{{ t.isSystem ? 'Yes' : 'No' }}</dd></div>
                  <div><dt>Description</dt><dd>{{ t.description }}</dd></div>
                </dl>

                <h3 class="ptd-sub">Module Requirements</h3>
                <ul class="ptd-checklist">
                  <li [class.on]="t.requiresConsent">42 CFR Part 2 consent {{ t.requiresConsent ? 'required' : 'optional' }}</li>
                  <li [class.on]="t.requiresUA">UA testing {{ t.requiresUA ? 'auto-enabled' : 'optional' }}</li>
                  <li [class.on]="t.requiresCourtCompliance">Court compliance {{ t.requiresCourtCompliance ? 'auto-enabled' : 'optional' }}</li>
                  <li [class.on]="t.requiresHousing">Housing module {{ t.requiresHousing ? 'auto-enabled' : 'optional' }}</li>
                </ul>
              </div>
            }

            @case ('features') {
              <div class="ptd-panel">
                <h2>Default Features</h2>
                <p class="ptd-desc">Features pre-selected when a Tenant Admin creates a {{ t.name }} program. Lock to prevent tenant override.</p>

                <div class="ptd-feat-grid">
                  @for (f of features(); track f.key) {
                    <article class="ptd-feat">
                      <header>
                        <div>
                          <strong>{{ f.name }}</strong>
                          <small>{{ f.description }}</small>
                        </div>
                        <span class="ptd-tier">{{ f.minTier }}</span>
                      </header>
                      <div class="ptd-feat__row">
                        <label class="ptd-toggle">
                          <input type="checkbox" [checked]="featureEnabled[f.key]" (change)="toggleFeatureEnabled(f.key)" />
                          <span class="ptd-toggle__track"><span class="ptd-toggle__thumb"></span></span>
                          <span class="ptd-toggle__label">{{ featureEnabled[f.key] ? 'Enabled' : 'Disabled' }}</span>
                        </label>
                        <select class="ptd-select" [ngModel]="featureOverride[f.key]" (ngModelChange)="featureOverride[f.key] = $event">
                          <option value="Allowed">Override: Allowed</option>
                          <option value="Locked On">Locked On</option>
                          <option value="Locked Off">Locked Off</option>
                          <option value="Hidden">Hidden</option>
                        </select>
                      </div>
                    </article>
                  }
                </div>
              </div>
            }

            @case ('phases') {
              <div class="ptd-panel">
                <div class="ptd-panel-head">
                  <div><h2>Default Phases</h2><p class="ptd-desc">Phase structure applied when creating this program type.</p></div>
                  <button type="button" class="ptd-btn ptd-btn--primary">+ Add Phase</button>
                </div>
                @if (t.defaultPhases === 0) {
                  <div class="ptd-empty">No phases configured. Programs of this type will be non-phased by default.</div>
                } @else {
                  <ol class="ptd-phases">
                    @for (p of stubPhases(t.defaultPhases); track p.n) {
                      <li>
                        <span class="ptd-phase-num">{{ p.n }}</span>
                        <div>
                          <strong>Phase {{ p.n }}: {{ p.name }}</strong>
                          <small>{{ p.meta }}</small>
                        </div>
                        <div class="ptd-phase-actions">
                          <button class="ptd-link">Edit</button>
                          <button class="ptd-link ptd-link--danger">Delete</button>
                        </div>
                      </li>
                    }
                  </ol>
                }
              </div>
            }

            @case ('compliance') {
              <div class="ptd-panel">
                <div class="ptd-panel-head">
                  <div><h2>Default Compliance Rules</h2><p class="ptd-desc">Auto-applied when programs of this type are created.</p></div>
                  <button type="button" class="ptd-btn ptd-btn--primary">+ Add Rule</button>
                </div>
                <div class="ptd-table-wrap">
                  <table class="ptd-table">
                    <thead><tr><th>Rule</th><th>Category</th><th>Severity</th><th>Target</th><th class="right">Actions</th></tr></thead>
                    <tbody>
                      @for (r of stubRules(t.complianceRules); track r.name) {
                        <tr>
                          <td><strong>{{ r.name }}</strong></td>
                          <td>{{ r.category }}</td>
                          <td><span class="ptd-sev" [attr.data-sev]="r.severity">{{ r.severity }}</span></td>
                          <td>{{ r.target }}</td>
                          <td class="right"><button class="ptd-link">Edit</button> <button class="ptd-link ptd-link--danger">Delete</button></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            @case ('checkin') {
              <div class="ptd-panel">
                <div class="ptd-panel-head">
                  <div><h2>Default Check-In</h2><p class="ptd-desc">Question set pre-loaded for {{ t.name }} programs.</p></div>
                  <button type="button" class="ptd-btn ptd-btn--primary">+ Add Question</button>
                </div>
                <ol class="ptd-questions">
                  @for (q of stubQuestions(t.checkInQuestions); track q.n) {
                    <li>
                      <span class="ptd-q-num">Q{{ q.n }}</span>
                      <div>
                        <strong>{{ q.text }}</strong>
                        <small>Type: {{ q.type }} · Required · Risk: {{ q.risk }}</small>
                      </div>
                      <button class="ptd-link">Edit</button>
                    </li>
                  }
                </ol>
                <div class="ptd-note">Crisis keyword detection is enabled platform-wide and cannot be disabled here.</div>
              </div>
            }

            @case ('ua') {
              <div class="ptd-panel">
                <h2>Default UA Config</h2>
                <dl class="ptd-kv">
                  <div><dt>Testing enabled</dt><dd>{{ t.requiresUA ? 'On' : 'Off' }}</dd></div>
                  <div><dt>Default frequency</dt><dd>2x/week</dd></div>
                  <div><dt>Random testing</dt><dd>Yes (Phase 4+)</dd></div>
                  <div><dt>Default panel</dt><dd>12-panel</dd></div>
                  <div><dt>Positive → action</dt><dd>Escalate + Notify Staff</dd></div>
                  <div><dt>Dilute → action</dt><dd>Retest</dd></div>
                  <div><dt>Missed → action</dt><dd>Treat as Positive</dd></div>
                  <div><dt>Chain of custody</dt><dd>Required</dd></div>
                </dl>
              </div>
            }

            @case ('notifications') {
              <div class="ptd-panel">
                <h2>Default Notifications</h2>
                <p class="ptd-desc">Notification rules inherited from platform defaults. Override per-tenant at the program level.</p>
                <div class="ptd-table-wrap">
                  <table class="ptd-table">
                    <thead><tr><th>Rule</th><th>Recipients</th><th>Channels</th><th>Timing</th><th class="center">Override</th></tr></thead>
                    <tbody>
                      @for (n of store.notificationRules().slice(0, 8); track n.id) {
                        <tr>
                          <td><strong>{{ n.name }}</strong></td>
                          <td>{{ n.recipients }}</td>
                          <td>
                            <div class="ptd-ch-list">
                              @for (c of n.channels; track c) { <span class="ptd-ch" [attr.data-ch]="c">{{ c }}</span> }
                            </div>
                          </td>
                          <td>{{ n.timing }}</td>
                          <td class="center">{{ n.locked ? '🔒 Locked' : 'Allowed' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            @case ('usage') {
              <div class="ptd-panel">
                <h2>Usage</h2>
                <p class="ptd-desc">Tenants and programs currently using {{ t.name }}.</p>
                <div class="ptd-usage-stats">
                  <div class="ptd-stat"><p>{{ t.programsUsing }}</p><span>Programs</span></div>
                  <div class="ptd-stat"><p>{{ t.tenantsUsing }}</p><span>Tenants</span></div>
                  <div class="ptd-stat"><p>{{ t.featuresEnabled }}/{{ t.featuresTotal }}</p><span>Features</span></div>
                </div>
                <div class="ptd-table-wrap">
                  <table class="ptd-table">
                    <thead><tr><th>Tenant</th><th>Program</th><th>Status</th><th class="right">Enrolled</th><th>Customized</th></tr></thead>
                    <tbody>
                      @for (row of stubUsage(t.programsUsing); track row.name) {
                        <tr>
                          <td>{{ row.tenant }}</td>
                          <td><strong>{{ row.name }}</strong></td>
                          <td><span class="ptd-status" [attr.data-status]="row.status">{{ row.status }}</span></td>
                          <td class="right">{{ row.enrolled }}</td>
                          <td>@if (row.custom) { <span class="ptd-chip">Customized</span> }</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          }
        </section>

        @if (editorOpen()) {
          <app-program-type-editor-modal
            [existing]="t"
            (saved)="onSaved()"
            (close)="editorOpen.set(false)"
          />
        }
      </div>
    } @else {
      <div class="ptd-missing">
        <p>Program type not found.</p>
        <a routerLink="/system/programs/configuration" class="ptd-btn ptd-btn--primary">Back to Configuration</a>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; background: #F8FAFC; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; color: #0F172A; }
      .ptd { max-width: 1280px; margin: 0 auto; padding: 1.5rem 1.75rem 3rem; }
      .ptd__header { margin-bottom: 1rem; }
      .ptd__crumb { display: flex; align-items: center; gap: 0.3125rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #64748B; margin-bottom: 0.75rem; }
      .ptd__crumb a { color: #475569; text-decoration: none; }
      .ptd__crumb a:hover { color: #1E293B; }
      .ptd__crumb svg { width: 12px; height: 12px; color: #CBD5E1; }
      .ptd__crumb span { color: #1E293B; }
      .ptd__title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
      .ptd__title-left { display: flex; align-items: center; gap: 0.875rem; }
      .ptd__icon { flex: 0 0 56px; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
      .ptd__icon svg { width: 30px; height: 30px; }
      .ptd__title-left h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1E293B; letter-spacing: -0.02em; }
      .ptd__meta { margin: 0.25rem 0 0; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #64748B; }
      .ptd__meta code { font-family: ui-monospace, Menlo, monospace; background: #F1F5F9; padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.75rem; }
      .ptd__sys { font-size: 0.6875rem; background: #fef3c7; color: #92400E; padding: 0.125rem 0.375rem; border-radius: 4px; font-weight: 700; }
      .ptd__actions { display: flex; gap: 0.5rem; }

      .ptd__tabs { display: flex; gap: 0.125rem; border-bottom: 1px solid #E2E8F0; margin-bottom: 1rem; overflow-x: auto; }
      .ptd-tab { padding: 0.625rem 0.875rem; background: transparent; border: 0; border-bottom: 2px solid transparent; font-size: 0.8125rem; font-weight: 600; color: #64748B; cursor: pointer; white-space: nowrap; font-family: inherit; }
      .ptd-tab:hover { color: #334155; }
      .ptd-tab--active { color: #2563EB; border-bottom-color: #2563EB; }

      .ptd__content { display: flex; flex-direction: column; gap: 0.875rem; }
      .ptd-panel { background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.125rem 1.25rem; }
      .ptd-panel h2 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 700; color: #1E293B; }
      .ptd-panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
      .ptd-desc { margin: 0 0 0.75rem; font-size: 0.8125rem; color: #64748B; }
      .ptd-sub { margin: 1rem 0 0.375rem; font-size: 0.75rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }

      .ptd-kv { margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
      @media (max-width: 600px) { .ptd-kv { grid-template-columns: 1fr; } }
      .ptd-kv > div { padding: 0.5rem 0.625rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; }
      .ptd-kv dt { font-size: 0.6875rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
      .ptd-kv dd { margin: 0.125rem 0 0; font-size: 0.8125rem; font-weight: 600; color: #1E293B; }
      .ptd-kv code { font-family: ui-monospace, Menlo, monospace; font-size: 0.75rem; }

      .ptd-checklist { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }
      .ptd-checklist li { padding: 0.4375rem 0.625rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.8125rem; color: #64748B; }
      .ptd-checklist li.on { background: #F0FDF4; border-color: #BBF7D0; color: #166534; font-weight: 500; }

      .ptd-feat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.625rem; }
      @media (max-width: 800px) { .ptd-feat-grid { grid-template-columns: 1fr; } }
      .ptd-feat { padding: 0.75rem; background: white; border: 1px solid #E2E8F0; border-radius: 8px; }
      .ptd-feat header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem; }
      .ptd-feat header strong { display: block; font-size: 0.875rem; color: #0F172A; }
      .ptd-feat header small { display: block; font-size: 0.75rem; color: #64748B; margin-top: 0.125rem; }
      .ptd-feat__row { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #F1F5F9; }
      .ptd-tier { padding: 0.125rem 0.4375rem; background: #EEF2FF; color: #3730A3; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; }
      .ptd-select { padding: 0.3125rem 0.5rem; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 0.75rem; background: white; outline: none; font-family: inherit; }
      .ptd-select:focus { border-color: #2563EB; }

      .ptd-toggle { display: inline-flex; align-items: center; gap: 0.5rem; position: relative; cursor: pointer; font-size: 0.75rem; color: #475569; }
      .ptd-toggle input { position: absolute; opacity: 0; }
      .ptd-toggle__track { width: 32px; height: 18px; background: #CBD5E1; border-radius: 9999px; position: relative; transition: background 0.2s; }
      .ptd-toggle__thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: white; border-radius: 9999px; transition: transform 0.2s; }
      .ptd-toggle input:checked + .ptd-toggle__track { background: #2563EB; }
      .ptd-toggle input:checked + .ptd-toggle__track .ptd-toggle__thumb { transform: translateX(14px); }
      .ptd-toggle__label { font-weight: 600; }

      .ptd-phases { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
      .ptd-phases li { display: flex; align-items: center; gap: 0.625rem; padding: 0.625rem 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
      .ptd-phase-num { width: 28px; height: 28px; background: #2563EB; color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8125rem; }
      .ptd-phases li > div { flex: 1; min-width: 0; }
      .ptd-phases li strong { display: block; font-size: 0.875rem; color: #0F172A; }
      .ptd-phases li small { display: block; font-size: 0.75rem; color: #64748B; margin-top: 0.125rem; }
      .ptd-phase-actions { display: flex; gap: 0.375rem; }

      .ptd-table-wrap { border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; overflow-x: auto; }
      .ptd-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
      .ptd-table th { text-align: left; padding: 0.5rem 0.75rem; background: #F8FAFC; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
      .ptd-table th.right, .ptd-table td.right { text-align: right; }
      .ptd-table th.center, .ptd-table td.center { text-align: center; }
      .ptd-table td { padding: 0.5625rem 0.75rem; border-bottom: 1px solid #F1F5F9; color: #334155; vertical-align: middle; }
      .ptd-table tr:last-child td { border-bottom: 0; }
      .ptd-sev { display: inline-flex; padding: 0.125rem 0.4375rem; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; }
      .ptd-sev[data-sev="Minor"]    { background: #fef3c7; color: #92400E; }
      .ptd-sev[data-sev="Moderate"] { background: #fed7aa; color: #9A3412; }
      .ptd-sev[data-sev="Major"]    { background: #fecaca; color: #991B1B; }
      .ptd-sev[data-sev="Critical"] { background: #1f2937; color: #fef2f2; }

      .ptd-questions { list-style: none; margin: 0 0 0.75rem; padding: 0; display: flex; flex-direction: column; gap: 0.375rem; }
      .ptd-questions li { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; }
      .ptd-q-num { font-size: 0.6875rem; font-weight: 700; color: #3730A3; background: #E0E7FF; padding: 0.1875rem 0.4375rem; border-radius: 4px; }
      .ptd-questions li > div { flex: 1; min-width: 0; }
      .ptd-questions li strong { display: block; font-size: 0.8125rem; color: #0F172A; }
      .ptd-questions li small { display: block; font-size: 0.6875rem; color: #64748B; margin-top: 0.125rem; }

      .ptd-note { padding: 0.625rem 0.75rem; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; color: #1E40AF; font-size: 0.75rem; }

      .ptd-ch-list { display: inline-flex; gap: 0.25rem; flex-wrap: wrap; }
      .ptd-ch { padding: 0.0625rem 0.4375rem; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; background: #F1F5F9; color: #475569; }
      .ptd-ch[data-ch="SMS"] { background: #DCFCE7; color: #166534; }
      .ptd-ch[data-ch="Email"] { background: #DBEAFE; color: #1E40AF; }
      .ptd-ch[data-ch="Push"] { background: #FEF3C7; color: #92400E; }
      .ptd-ch[data-ch="In-App"] { background: #E0E7FF; color: #3730A3; }

      .ptd-usage-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.75rem; }
      .ptd-stat { padding: 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; text-align: center; }
      .ptd-stat p { margin: 0; font-size: 1.375rem; font-weight: 800; color: #1E293B; }
      .ptd-stat span { font-size: 0.6875rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .ptd-status { display: inline-flex; padding: 0.125rem 0.4375rem; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; background: #DCFCE7; color: #166534; }
      .ptd-status[data-status="Draft"] { background: #F1F5F9; color: #475569; }
      .ptd-status[data-status="Suspended"] { background: #FED7AA; color: #9A3412; }
      .ptd-chip { font-size: 0.6875rem; font-weight: 700; background: #E0E7FF; color: #3730A3; padding: 0.125rem 0.4375rem; border-radius: 4px; }

      .ptd-empty { padding: 2rem; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 10px; text-align: center; color: #64748B; font-size: 0.875rem; }
      .ptd-missing { max-width: 480px; margin: 4rem auto; text-align: center; padding: 2rem; background: white; border: 1px solid #E2E8F0; border-radius: 12px; }
      .ptd-missing p { margin: 0 0 1rem; color: #64748B; }

      .ptd-btn { padding: 0.5rem 0.875rem; border-radius: 7px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 600; cursor: pointer; background: white; color: #334155; border-color: #E2E8F0; font-family: inherit; display: inline-block; text-decoration: none; }
      .ptd-btn:hover { background: #F1F5F9; }
      .ptd-btn--primary { background: #2563EB; color: white; border-color: #2563EB; }
      .ptd-btn--primary:hover { background: #1D4ED8; }
      .ptd-btn--ghost { background: white; color: #475569; }
      .ptd-link { border: 0; background: transparent; color: #2563EB; font-size: 0.75rem; font-weight: 600; cursor: pointer; padding: 0.125rem 0.25rem; font-family: inherit; }
      .ptd-link:hover { text-decoration: underline; }
      .ptd-link--danger { color: #dc2626; }
    `
  ]
})
export class ProgramTypeDetailComponent {
  public readonly store = inject(ProgramConfigStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  public readonly editorOpen = signal(false);
  public readonly innerTab = signal<InnerTab>('general');

  public readonly tabs: { key: InnerTab; label: string }[] = [
    { key: 'general',       label: 'General' },
    { key: 'features',      label: 'Default Features' },
    { key: 'phases',        label: 'Default Phases' },
    { key: 'compliance',    label: 'Compliance Rules' },
    { key: 'checkin',       label: 'Check-In' },
    { key: 'ua',            label: 'UA Config' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'usage',         label: 'Usage' }
  ];

  public readonly typeCode = computed(() => this.route.snapshot.paramMap.get('code') ?? '');
  public readonly type = computed(() => this.store.getType(this.typeCode()));
  public readonly features = computed(() => this.store.features());

  public featureEnabled: Record<string, boolean> = {};
  public featureOverride: Record<string, FeatureOverrideMode> = {};

  constructor() {
    queueMicrotask(() => {
      const t = this.type();
      if (!t) return;
      for (const f of this.store.features()) {
        this.featureEnabled[f.key] = Math.random() < (t.featuresEnabled / t.featuresTotal);
        this.featureOverride[f.key] = 'Allowed';
      }
    });
  }

  public toggleFeatureEnabled(key: string): void {
    this.featureEnabled[key] = !this.featureEnabled[key];
  }

  public onSaved(): void {
    // Reactive — signal updates cascade.
  }

  public saveChanges(): void {
    const count = Object.values(this.featureEnabled).filter(Boolean).length;
    const t = this.type();
    if (t) {
      this.store.updateType(t.code, { featuresEnabled: count });
    }
    this.toast.showSuccess(`${t?.name} defaults saved.`);
  }

  public iconPath(key: string): string {
    const icons: Record<string, string> = {
      gavel:         'M8 3l5 5M5 6l5 5M13 8l-5 5M16 11l3 3M15 10l4 4M3 21h8',
      'heart-pulse': 'M3 12h3l2-4 4 8 2-4h7',
      home:          'M3 12l9-9 9 9v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z',
      'shield-check':'M12 2l9 4v6c0 5-3.8 9.5-9 11-5.2-1.5-9-6-9-11V6l9-4zM9 12l2 2 4-4',
      briefcase:    'M3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm5-2V4a2 2 0 012-2h4a2 2 0 012 2v1',
      pill:         'M10.5 7.5l6 6M4.5 13.5a5.5 5.5 0 007.78 7.78l8-8a5.5 5.5 0 10-7.78-7.78l-8 8z',
      users:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
      'door-open':  'M13 4h3a2 2 0 012 2v14H4V6a2 2 0 012-2h3M8 4v16',
      settings:     'M12 15a3 3 0 100-6 3 3 0 000 6z'
    };
    return icons[key] ?? icons['settings'];
  }

  public stubPhases(count: number) {
    const names = ['Orientation', 'Active Treatment', 'Stabilization', 'Transition', 'Aftercare'];
    const meta = ['30 days · Daily check-in · UA 3x/week', '90 days · Daily check-in · UA 2x/week', '120 days · Daily · UA 1x/week', '90 days · Weekly · Random UA', '60 days · Weekly'];
    return Array.from({ length: count }, (_, i) => ({ n: i + 1, name: names[i] ?? `Phase ${i + 1}`, meta: meta[i] ?? 'Custom phase' }));
  }

  public stubRules(count: number) {
    const rules = [
      { name: 'Daily Check-In Completion', category: 'Check-In', severity: 'Moderate', target: '100%' },
      { name: 'Appointment Attendance',    category: 'Attendance', severity: 'Major', target: '100%' },
      { name: 'Negative UA Results',       category: 'UA/Testing', severity: 'Critical', target: 'All' },
      { name: 'Meeting Attendance',        category: 'Attendance', severity: 'Moderate', target: '3/wk' },
      { name: 'Court Hearing Attendance',  category: 'Court', severity: 'Critical', target: 'All' },
      { name: 'Curfew Compliance',         category: 'Behavioral', severity: 'Minor', target: 'Yes' },
      { name: 'Documentation Submission',  category: 'Documentation', severity: 'Minor', target: '100%' },
      { name: 'No New Criminal Charges',   category: 'Behavioral', severity: 'Critical', target: 'Yes' }
    ];
    return rules.slice(0, Math.max(1, count));
  }

  public stubQuestions(count: number) {
    const qs = [
      { n: 1, text: 'How are you feeling today?',                        type: 'Mood Emoji', risk: 'Low mood → flag' },
      { n: 2, text: 'Did you take your medication today?',               type: 'Yes/No',     risk: 'No → flag' },
      { n: 3, text: 'Have you used any substances in the last 24 hours?',type: 'Yes/No',     risk: 'Yes → escalate' },
      { n: 4, text: 'Did you attend all required meetings?',             type: 'Yes/No',     risk: 'No → flag' },
      { n: 5, text: 'Anything you\'d like to share with your team?',     type: 'Free Text',  risk: 'Crisis keywords' },
      { n: 6, text: 'How strong were cravings today?',                   type: 'Scale 1-10', risk: '≥7 → flag' },
      { n: 7, text: 'Did you attend your court hearing this week?',      type: 'Yes/No',     risk: 'No → escalate' }
    ];
    return qs.slice(0, Math.max(1, count));
  }

  public stubUsage(count: number) {
    const tenants = ['Grafton County Services', 'NH DHHS', 'Merrimack County', 'Hillsborough HHS', 'Strafford Recovery', 'Sullivan Health', 'Belknap Services'];
    const statuses: Array<'Active' | 'Draft' | 'Suspended'> = ['Active', 'Active', 'Active', 'Draft', 'Suspended'];
    return Array.from({ length: Math.min(count, 10) }, (_, i) => ({
      tenant: tenants[i % tenants.length],
      name: `Program #${i + 1}`,
      status: statuses[i % statuses.length],
      enrolled: 10 + ((i * 7) % 40),
      custom: i % 3 === 0
    }));
  }
}
