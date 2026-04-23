import { Injectable, computed, signal } from '@angular/core';
import {
  IFeatureDef,
  IGlobalSettings,
  IMessageTemplate,
  INotificationRuleDef,
  IProgramTypeDef,
  IRiskIndicatorWeight,
  IRiskLevel,
  ITemplateSummary
} from './program-config.types';

const PROGRAM_TYPES_SEED: IProgramTypeDef[] = [
  { code: 'DC', name: 'Drug Court', description: 'Court-mandated treatment compliance monitoring and accountability tracking.', iconKey: 'gavel', color: '#7C3AED', category: 'Justice', isSystem: true, isActive: true, minTier: 'Professional', defaultCapacity: 30, requiresConsent: true, requiresUA: true, requiresCourtCompliance: true, requiresHousing: false, featuresEnabled: 14, featuresTotal: 18, defaultPhases: 5, complianceRules: 8, checkInQuestions: 7, programsUsing: 12, tenantsUsing: 8 },
  { code: 'SUD', name: 'SUD Treatment', description: 'Substance use disorder treatment with therapy, UA, and case management.', iconKey: 'heart-pulse', color: '#DC2626', category: 'Treatment', isSystem: true, isActive: true, minTier: 'Basic', defaultCapacity: 60, requiresConsent: true, requiresUA: true, requiresCourtCompliance: false, requiresHousing: false, featuresEnabled: 12, featuresTotal: 18, defaultPhases: 3, complianceRules: 6, checkInQuestions: 6, programsUsing: 18, tenantsUsing: 11 },
  { code: 'RH', name: 'Recovery Housing', description: 'Sober living with house rules, rent tracking, and peer accountability.', iconKey: 'home', color: '#059669', category: 'Housing', isSystem: true, isActive: true, minTier: 'Professional', defaultCapacity: 24, requiresConsent: true, requiresUA: true, requiresCourtCompliance: false, requiresHousing: true, featuresEnabled: 13, featuresTotal: 18, defaultPhases: 3, complianceRules: 10, checkInQuestions: 7, programsUsing: 9, tenantsUsing: 6 },
  { code: 'PP', name: 'Probation / Parole', description: 'Supervision conditions, court hearings, and compliance monitoring.', iconKey: 'shield-check', color: '#D97706', category: 'Justice', isSystem: true, isActive: true, minTier: 'Professional', defaultCapacity: 50, requiresConsent: false, requiresUA: true, requiresCourtCompliance: true, requiresHousing: false, featuresEnabled: 11, featuresTotal: 18, defaultPhases: 3, complianceRules: 7, checkInQuestions: 5, programsUsing: 7, tenantsUsing: 5 },
  { code: 'CM', name: 'Case Management', description: 'Lightweight case management services with appointments and documents.', iconKey: 'briefcase', color: '#2563EB', category: 'Community', isSystem: true, isActive: true, minTier: 'Basic', defaultCapacity: 100, requiresConsent: true, requiresUA: false, requiresCourtCompliance: false, requiresHousing: false, featuresEnabled: 8, featuresTotal: 18, defaultPhases: 0, complianceRules: 4, checkInQuestions: 4, programsUsing: 15, tenantsUsing: 9 },
  { code: 'MAT', name: 'Medication Assisted Treatment', description: 'MOUD tracking with adherence check-ins and medical appointments.', iconKey: 'pill', color: '#0891B2', category: 'Treatment', isSystem: true, isActive: true, minTier: 'Professional', defaultCapacity: 40, requiresConsent: true, requiresUA: true, requiresCourtCompliance: false, requiresHousing: false, featuresEnabled: 10, featuresTotal: 18, defaultPhases: 2, complianceRules: 5, checkInQuestions: 6, programsUsing: 6, tenantsUsing: 4 },
  { code: 'CBO', name: 'Community Based Org', description: 'Community organization programs for peer support and advocacy.', iconKey: 'users', color: '#7C3AED', category: 'Community', isSystem: true, isActive: true, minTier: 'Basic', defaultCapacity: 80, requiresConsent: false, requiresUA: false, requiresCourtCompliance: false, requiresHousing: false, featuresEnabled: 7, featuresTotal: 18, defaultPhases: 0, complianceRules: 3, checkInQuestions: 3, programsUsing: 4, tenantsUsing: 3 },
  { code: 'DW', name: 'Doorway Program', description: 'NH Doorway entry-point navigation and referral management.', iconKey: 'door-open', color: '#059669', category: 'Community', isSystem: true, isActive: true, minTier: 'Enterprise', defaultCapacity: 150, requiresConsent: true, requiresUA: false, requiresCourtCompliance: false, requiresHousing: false, featuresEnabled: 9, featuresTotal: 18, defaultPhases: 0, complianceRules: 3, checkInQuestions: 2, programsUsing: 3, tenantsUsing: 2 },
  { code: 'OTH', name: 'Other / Custom', description: 'Flexible program template for custom workflows that do not fit other types.', iconKey: 'settings', color: '#64748B', category: 'Other', isSystem: true, isActive: true, minTier: 'Basic', defaultCapacity: 40, requiresConsent: false, requiresUA: false, requiresCourtCompliance: false, requiresHousing: false, featuresEnabled: 6, featuresTotal: 18, defaultPhases: 0, complianceRules: 2, checkInQuestions: 3, programsUsing: 2, tenantsUsing: 2 }
];

const FEATURES_SEED: IFeatureDef[] = [
  { key: 'daily_checkins',         name: 'Daily Check-Ins',         description: 'Clients submit a short daily status survey.',                 category: 'Engagement',    iconKey: 'calendar-check',   minTier: 'Basic',        status: 'Active',     programsUsing: 38, dependencies: [], conflicts: [] },
  { key: 'weekly_checkins',        name: 'Weekly Check-Ins',        description: 'Longer weekly assessment with mood and goals.',               category: 'Engagement',    iconKey: 'calendar',         minTier: 'Basic',        status: 'Active',     programsUsing: 22, dependencies: [], conflicts: [] },
  { key: 'appointments',           name: 'Appointment Tracking',    description: 'Schedule, reminders, and attendance for sessions.',           category: 'Engagement',    iconKey: 'clock',            minTier: 'Basic',        status: 'Active',     programsUsing: 54, dependencies: [], conflicts: [] },
  { key: 'ua_testing',             name: 'UA / Drug Testing',       description: 'Track urinalysis schedules and results.',                     category: 'Clinical',      iconKey: 'flask',            minTier: 'Basic',        status: 'Active',     programsUsing: 41, dependencies: [], conflicts: [] },
  { key: 'treatment_plans',        name: 'Treatment Plans',         description: 'Clinical treatment plans with goals and progress notes.',     category: 'Clinical',      iconKey: 'clipboard-list',   minTier: 'Professional', status: 'Active',     programsUsing: 26, dependencies: [], conflicts: [] },
  { key: 'housing_rules',          name: 'Housing Rules',           description: 'House rules, violations, and accountability tracking.',       category: 'Housing',       iconKey: 'home',             minTier: 'Professional', status: 'Active',     programsUsing: 12, dependencies: [], conflicts: [] },
  { key: 'rent_tracking',          name: 'Rent / Payment Tracking', description: 'Monthly rent collection and arrears management.',            category: 'Housing',       iconKey: 'dollar-sign',      minTier: 'Professional', status: 'Active',     programsUsing: 9,  dependencies: ['housing_rules'], conflicts: [] },
  { key: 'meeting_attendance',     name: 'Meeting Attendance',      description: 'Track AA/NA/peer meeting attendance and verification.',       category: 'Engagement',    iconKey: 'users',            minTier: 'Basic',        status: 'Active',     programsUsing: 33, dependencies: [], conflicts: [] },
  { key: 'court_compliance',       name: 'Court Compliance',        description: 'Monitor court-ordered conditions and reporting.',             category: 'Justice',       iconKey: 'scale',            minTier: 'Professional', status: 'Active',     programsUsing: 19, dependencies: [], conflicts: [] },
  { key: 'hearing_schedule',       name: 'Hearing Schedule',        description: 'Court hearing calendar with reminders.',                      category: 'Justice',       iconKey: 'gavel',            minTier: 'Professional', status: 'Active',     programsUsing: 15, dependencies: ['court_compliance'], conflicts: [] },
  { key: 'supervision_conditions', name: 'Supervision Conditions',  description: 'Probation/parole condition tracking and violations.',         category: 'Justice',       iconKey: 'shield',           minTier: 'Professional', status: 'Active',     programsUsing: 11, dependencies: [], conflicts: [] },
  { key: 'cross_agency',           name: 'Cross-Agency Reporting',  description: 'Report client status to external agencies with consent.',     category: 'Reporting',     iconKey: 'network',          minTier: 'Enterprise',   status: 'Beta',       programsUsing: 4,  dependencies: [], conflicts: [] },
  { key: 'moud_tracking',          name: 'MOUD Tracking',           description: 'Medication-assisted treatment dosing and adherence.',         category: 'Clinical',      iconKey: 'pill',             minTier: 'Professional', status: 'Active',     programsUsing: 8,  dependencies: [], conflicts: [] },
  { key: 'compliance_streaks',     name: 'Compliance Streaks',      description: 'Positive reinforcement via milestone streaks.',               category: 'Engagement',    iconKey: 'flame',            minTier: 'Basic',        status: 'Active',     programsUsing: 29, dependencies: [], conflicts: [] },
  { key: 'risk_indicators',        name: 'Risk Indicators',         description: 'Weighted risk score based on behavioral signals.',            category: 'Compliance',    iconKey: 'activity',         minTier: 'Basic',        status: 'Active',     programsUsing: 35, dependencies: [], conflicts: [] },
  { key: 'document_uploads',       name: 'Document Uploads',        description: 'Client and staff document uploads with expiration.',          category: 'Administrative',iconKey: 'file-text',        minTier: 'Basic',        status: 'Active',     programsUsing: 48, dependencies: [], conflicts: [] },
  { key: 'secure_messaging',       name: 'Secure Messaging',        description: '42 CFR Part 2 compliant client/staff messaging.',             category: 'Communication', iconKey: 'message-circle',   minTier: 'Basic',        status: 'Active',     programsUsing: 42, dependencies: [], conflicts: [] },
  { key: 'lab_integration',        name: 'Lab Integration',         description: 'HL7/FHIR automatic lab result import from providers.',        category: 'Clinical',      iconKey: 'zap',              minTier: 'Enterprise',   status: 'Beta',       programsUsing: 3,  dependencies: ['ua_testing', 'document_uploads'], conflicts: [] }
];

const CHECKIN_TEMPLATES_SEED: ITemplateSummary[] = [
  { id: 'ct-1', name: 'Standard Daily Check-In',      description: 'Baseline 5-question daily template for most programs.', itemCount: 5,  itemLabel: 'questions', typesUsing: 4, programsUsing: 18, isSystem: true  },
  { id: 'ct-2', name: 'Standard Weekly Check-In',     description: 'Comprehensive 12-question weekly assessment.',          itemCount: 12, itemLabel: 'questions', typesUsing: 3, programsUsing: 12, isSystem: true  },
  { id: 'ct-3', name: 'Housing Daily Check-In',       description: 'Recovery housing–specific daily check-in.',             itemCount: 7,  itemLabel: 'questions', typesUsing: 1, programsUsing: 5,  isSystem: true  },
  { id: 'ct-4', name: 'MAT Adherence Check-In',       description: 'Medication adherence and side effect tracking.',        itemCount: 6,  itemLabel: 'questions', typesUsing: 1, programsUsing: 3,  isSystem: true  },
  { id: 'ct-5', name: 'NH DHHS Outcome Questions',    description: 'Custom outcome metrics for NH DHHS reporting.',         itemCount: 8,  itemLabel: 'questions', typesUsing: 0, programsUsing: 2,  isSystem: false }
];

const COMPLIANCE_TEMPLATES_SEED: ITemplateSummary[] = [
  { id: 'cp-1', name: 'Drug Court Standard',       description: 'Full 8-rule compliance set for drug courts.',           itemCount: 8,  itemLabel: 'rules', typesUsing: 4, programsUsing: 14, isSystem: true  },
  { id: 'cp-2', name: 'Recovery Housing Standard', description: 'Housing-specific rules including rent and curfew.',     itemCount: 10, itemLabel: 'rules', typesUsing: 2, programsUsing: 9,  isSystem: true  },
  { id: 'cp-3', name: 'Probation Basic',           description: 'Core supervision rules for probation/parole.',          itemCount: 6,  itemLabel: 'rules', typesUsing: 2, programsUsing: 7,  isSystem: true  },
  { id: 'cp-4', name: 'Case Management Light',     description: 'Minimal ruleset for case management programs.',         itemCount: 4,  itemLabel: 'rules', typesUsing: 3, programsUsing: 15, isSystem: true  },
  { id: 'cp-5', name: 'NH DHHS Outcome Rules',     description: 'Custom outcome-tracking ruleset.',                      itemCount: 5,  itemLabel: 'rules', typesUsing: 0, programsUsing: 0,  isSystem: false }
];

const PHASE_TEMPLATES_SEED: ITemplateSummary[] = [
  { id: 'ph-1', name: 'Drug Court 5-Phase',       description: 'Orientation → Active → Stabilization → Transition → Graduation.', itemCount: 5, itemLabel: 'phases', typesUsing: 2, programsUsing: 12, isSystem: true  },
  { id: 'ph-2', name: 'Recovery Housing 3-Phase', description: 'Entry → Resident → Transition.',                                   itemCount: 3, itemLabel: 'phases', typesUsing: 1, programsUsing: 9,  isSystem: true  },
  { id: 'ph-3', name: 'Simple 3-Phase (Basic)',   description: 'Lightweight 3-phase template for any program.',                    itemCount: 3, itemLabel: 'phases', typesUsing: 3, programsUsing: 8,  isSystem: true  },
  { id: 'ph-4', name: 'NH DHHS 4-Phase',          description: 'NH DHHS state-aligned 4-phase progression.',                       itemCount: 4, itemLabel: 'phases', typesUsing: 0, programsUsing: 0,  isSystem: false }
];

const NOTIFICATION_RULES_SEED: INotificationRuleDef[] = [
  { id: 'n-1',  name: 'Check-In Reminder',          trigger: 'Check-in window opens',       recipients: 'Client',           channels: ['SMS', 'Push'],         timing: 'At open',       locked: false },
  { id: 'n-2',  name: 'Check-In Warning',           trigger: '2h before deadline',          recipients: 'Client',           channels: ['SMS', 'Push'],         timing: '2h before',     locked: false },
  { id: 'n-3',  name: 'Missed Check-In',            trigger: 'Deadline passed',             recipients: 'Client + CM',      channels: ['SMS', 'In-App'],       timing: 'Immediately',   locked: false },
  { id: 'n-4',  name: 'Appointment Reminder (24h)', trigger: 'Upcoming appointment',        recipients: 'Client',           channels: ['SMS', 'Email'],        timing: '24h before',    locked: false },
  { id: 'n-5',  name: 'Appointment Reminder (1h)',  trigger: 'Upcoming appointment',        recipients: 'Client',           channels: ['Push'],                timing: '1h before',     locked: false },
  { id: 'n-6',  name: 'Missed Appointment',         trigger: 'No-show',                     recipients: 'CM',               channels: ['In-App', 'Email'],     timing: 'Immediately',   locked: false },
  { id: 'n-7',  name: 'Positive UA',                trigger: 'Positive result entered',     recipients: 'CM + Director',    channels: ['In-App', 'Email'],     timing: 'Immediately',   locked: true  },
  { id: 'n-8',  name: 'Compliance Violation',       trigger: 'Rule violated',               recipients: 'CM',               channels: ['In-App'],              timing: 'Immediately',   locked: false },
  { id: 'n-9',  name: 'Risk Alert',                 trigger: 'Risk score > threshold',      recipients: 'CM + Director',    channels: ['In-App', 'Email'],     timing: 'Immediately',   locked: true  },
  { id: 'n-10', name: 'Streak Milestone',           trigger: 'Milestone reached',           recipients: 'Client',           channels: ['Push', 'In-App'],      timing: 'Immediately',   locked: false },
  { id: 'n-11', name: 'Phase Advancement',          trigger: 'Client promoted',             recipients: 'Client + Team',    channels: ['In-App', 'Email'],     timing: 'Immediately',   locked: false },
  { id: 'n-12', name: 'Court Hearing Reminder',     trigger: 'Upcoming hearing',            recipients: 'Client + CM',      channels: ['SMS', 'Email'],        timing: '48h + 24h',     locked: false },
  { id: 'n-13', name: 'Rent Overdue',               trigger: 'Past grace period',           recipients: 'Client + HM',      channels: ['SMS', 'In-App'],       timing: 'Day after',     locked: false },
  { id: 'n-14', name: 'Document Expiring',          trigger: 'Doc near expiration',         recipients: 'Client + Staff',   channels: ['In-App'],              timing: '14d + 7d',      locked: false },
  { id: 'n-15', name: 'Enrollment Welcome',         trigger: 'Client enrolled',             recipients: 'Client',           channels: ['SMS', 'Email'],        timing: 'Immediately',   locked: false },
  { id: 'n-16', name: 'Crisis Detection',           trigger: 'Crisis keywords detected',    recipients: 'CM + Director',    channels: ['In-App', 'SMS'],       timing: 'Immediately',   locked: true  },
  { id: 'n-17', name: 'Capacity Warning',           trigger: '85% capacity',                recipients: 'Director + Admin', channels: ['In-App'],              timing: 'At threshold',  locked: false }
];

const MESSAGE_TEMPLATES_SEED: IMessageTemplate[] = [
  { id: 'm-1', notification: 'Check-In Reminder',     channel: 'SMS',   body: 'Hi {{client.first_name}}, your daily check-in for {{program.name}} is now open. Complete by {{checkin.deadline}}. Open CareTrack to check in.', charCount: 168 },
  { id: 'm-2', notification: 'Missed Check-In',       channel: 'SMS',   body: 'Hi {{client.first_name}}, you missed today\'s check-in for {{program.name}}. Your care team has been notified. Please reach out if you need support.', charCount: 153 },
  { id: 'm-3', notification: 'Appointment Reminder',  channel: 'Email', body: 'Hello {{client.first_name}}, reminder for your {{appointment.type}} on {{appointment.date}} at {{appointment.time}} with {{staff.name}}.', charCount: 139 },
  { id: 'm-4', notification: 'Streak Milestone',      channel: 'Push',  body: 'Amazing! {{streak.count}} days strong. You earned {{milestone.name}}. Keep going!', charCount: 82 }
];

const RISK_LEVELS_SEED: IRiskLevel[] = [
  { level: 'Low',      minScore: 0,  maxScore: 20,  color: '#059669', action: 'None' },
  { level: 'Medium',   minScore: 21, maxScore: 50,  color: '#D97706', action: 'In-app alert to CM' },
  { level: 'High',     minScore: 51, maxScore: 75,  color: '#EA580C', action: 'Email + in-app to CM + Director' },
  { level: 'Critical', minScore: 76, maxScore: 100, color: '#DC2626', action: 'Immediate intervention required' }
];

const RISK_WEIGHTS_SEED: IRiskIndicatorWeight[] = [
  { indicator: 'Missed check-ins (2+ in 7d)',   defaultWeight: 20, min: 0,  max: 30 },
  { indicator: 'Missed appointment',             defaultWeight: 25, min: 0,  max: 30 },
  { indicator: 'Positive UA',                    defaultWeight: 30, min: 10, max: 40 },
  { indicator: 'Declining mood trend',           defaultWeight: 10, min: 0,  max: 20 },
  { indicator: 'No contact (7+ days)',           defaultWeight: 20, min: 5,  max: 30 },
  { indicator: 'Late check-ins (3+ in 7d)',      defaultWeight: 10, min: 0,  max: 20 },
  { indicator: 'Housing payment overdue',        defaultWeight: 10, min: 0,  max: 20 },
  { indicator: 'Phase regression',               defaultWeight: 15, min: 0,  max: 25 }
];

const GLOBAL_SETTINGS_SEED: IGlobalSettings = {
  allowCustomProgramTypes: true,
  maxProgramsPerTenant: { Trial: 2, Basic: 3, Professional: 10, Enterprise: 25, Government: null },
  defaultProgramCapacity: 50,
  autoGenerateProgramCode: true,
  defaultWindowStart: '06:00',
  defaultWindowEnd: '22:00',
  defaultLateGraceMinutes: 30,
  maxCheckInQuestions: 20,
  crisisKeywordDetection: true,
  requireDailyCheckIn: false,
  riskScoreModel: 'Weighted Sum',
  enableComplianceStreaks: true,
  streakMilestones: [7, 14, 30, 60, 90, 180, 365],
  streakResetOnAnyViolation: false,
  defaultTestPanel: '12-panel',
  chainOfCustodyDefault: true,
  positiveUAAlwaysEscalates: true,
  uaResultImmutableAfterReview: true,
  defaultNoShowGraceMinutes: 15,
  defaultReminderTimes: ['24h', '2h', '1h'],
  allowClientSelfSchedule: false,
  allowClientSelfReschedule: true,
  rescheduleWindowHours: 24,
  cfr42Enforcement: true,
  consentRequiredForEnrollment: true,
  defaultConsentDurationDays: 365,
  consentExpirationWarningDays: 30,
  crossProgramDataSharing: 'Consent Required',
  programDataRetentionYears: 7,
  auditTrailRetentionYears: 7,
  purgeSchedule: 'Nightly at 2:00 AM UTC',
  legalHoldOverride: true,
  lastUpdatedAt: '2026-04-20',
  lastUpdatedBy: 'Nayab Raheel'
};

@Injectable({ providedIn: 'root' })
export class ProgramConfigStoreService {
  private readonly _types = signal<IProgramTypeDef[]>(PROGRAM_TYPES_SEED);
  private readonly _features = signal<IFeatureDef[]>(FEATURES_SEED);
  private readonly _checkinTemplates = signal<ITemplateSummary[]>(CHECKIN_TEMPLATES_SEED);
  private readonly _complianceTemplates = signal<ITemplateSummary[]>(COMPLIANCE_TEMPLATES_SEED);
  private readonly _phaseTemplates = signal<ITemplateSummary[]>(PHASE_TEMPLATES_SEED);
  private readonly _notificationRules = signal<INotificationRuleDef[]>(NOTIFICATION_RULES_SEED);
  private readonly _messageTemplates = signal<IMessageTemplate[]>(MESSAGE_TEMPLATES_SEED);
  private readonly _riskLevels = signal<IRiskLevel[]>(RISK_LEVELS_SEED);
  private readonly _riskWeights = signal<IRiskIndicatorWeight[]>(RISK_WEIGHTS_SEED);
  private readonly _settings = signal<IGlobalSettings>(GLOBAL_SETTINGS_SEED);

  public readonly types = this._types.asReadonly();
  public readonly features = this._features.asReadonly();
  public readonly checkinTemplates = this._checkinTemplates.asReadonly();
  public readonly complianceTemplates = this._complianceTemplates.asReadonly();
  public readonly phaseTemplates = this._phaseTemplates.asReadonly();
  public readonly notificationRules = this._notificationRules.asReadonly();
  public readonly messageTemplates = this._messageTemplates.asReadonly();
  public readonly riskLevels = this._riskLevels.asReadonly();
  public readonly riskWeights = this._riskWeights.asReadonly();
  public readonly settings = this._settings.asReadonly();

  public readonly counts = computed(() => ({
    types: this._types().length,
    features: this._features().length,
    checkin: this._checkinTemplates().length,
    compliance: this._complianceTemplates().length,
    phases: this._phaseTemplates().length,
    notifications: this._notificationRules().length
  }));

  public toggleTypeActive(code: string): void {
    this._types.update(list => list.map(t => (t.code === code ? { ...t, isActive: !t.isActive } : t)));
  }

  public updateSettings(patch: Partial<IGlobalSettings>): void {
    this._settings.update(s => ({ ...s, ...patch, lastUpdatedAt: new Date().toISOString().slice(0, 10) }));
  }

  public toggleNotificationRule(id: string): void {
    this._notificationRules.update(list => list.map(n => (n.id === id && !n.locked ? { ...n, locked: !n.locked } : n)));
  }

  // Program Types CRUD
  public getType(code: string): IProgramTypeDef | undefined {
    return this._types().find(t => t.code === code);
  }

  public createType(input: Omit<IProgramTypeDef, 'featuresEnabled' | 'featuresTotal' | 'defaultPhases' | 'complianceRules' | 'checkInQuestions' | 'programsUsing' | 'tenantsUsing' | 'isSystem'>): IProgramTypeDef {
    const next: IProgramTypeDef = {
      ...input,
      isSystem: false,
      featuresEnabled: 0,
      featuresTotal: 18,
      defaultPhases: 0,
      complianceRules: 0,
      checkInQuestions: 0,
      programsUsing: 0,
      tenantsUsing: 0
    };
    this._types.update(list => [...list, next]);
    return next;
  }

  public updateType(code: string, patch: Partial<IProgramTypeDef>): void {
    this._types.update(list => list.map(t => (t.code === code ? { ...t, ...patch, code: t.code } : t)));
  }

  public duplicateType(code: string): IProgramTypeDef | undefined {
    const src = this.getType(code);
    if (!src) return undefined;
    const newCode = this.nextUniqueCode(src.code);
    const clone: IProgramTypeDef = { ...src, code: newCode, name: `${src.name} (Copy)`, isSystem: false, programsUsing: 0, tenantsUsing: 0 };
    this._types.update(list => [...list, clone]);
    return clone;
  }

  public deleteType(code: string): boolean {
    const t = this.getType(code);
    if (!t || t.isSystem || t.programsUsing > 0) return false;
    this._types.update(list => list.filter(x => x.code !== code));
    return true;
  }

  private nextUniqueCode(base: string): string {
    let i = 2;
    const codes = new Set(this._types().map(t => t.code));
    while (codes.has(`${base}${i}`)) i++;
    return `${base}${i}`;
  }

  public isTypeCodeAvailable(code: string): boolean {
    return !this._types().some(t => t.code === code);
  }

  // Features CRUD
  public getFeature(key: string): IFeatureDef | undefined {
    return this._features().find(f => f.key === key);
  }

  public createFeature(input: IFeatureDef): IFeatureDef {
    this._features.update(list => [...list, { ...input, programsUsing: 0 }]);
    return input;
  }

  public updateFeature(key: string, patch: Partial<IFeatureDef>): void {
    this._features.update(list => list.map(f => (f.key === key ? { ...f, ...patch, key: f.key } : f)));
  }

  public deleteFeature(key: string): boolean {
    const f = this.getFeature(key);
    if (!f || f.programsUsing > 0) return false;
    this._features.update(list => list.filter(x => x.key !== key));
    return true;
  }

  public isFeatureKeyAvailable(key: string): boolean {
    return !this._features().some(f => f.key === key);
  }

  // Templates CRUD (generic — kind selects which collection)
  public createTemplate(kind: 'checkin' | 'compliance' | 'phase', input: Omit<ITemplateSummary, 'id' | 'typesUsing' | 'programsUsing' | 'isSystem'>): ITemplateSummary {
    const id = `${kind.slice(0, 2)}-${Date.now().toString(36)}`;
    const next: ITemplateSummary = { ...input, id, typesUsing: 0, programsUsing: 0, isSystem: false };
    const signalRef = this.templateSignal(kind);
    signalRef.update(list => [...list, next]);
    return next;
  }

  public updateTemplate(kind: 'checkin' | 'compliance' | 'phase', id: string, patch: Partial<ITemplateSummary>): void {
    const signalRef = this.templateSignal(kind);
    signalRef.update(list => list.map(t => (t.id === id ? { ...t, ...patch, id: t.id } : t)));
  }

  public duplicateTemplate(kind: 'checkin' | 'compliance' | 'phase', id: string): ITemplateSummary | undefined {
    const signalRef = this.templateSignal(kind);
    const src = signalRef().find(t => t.id === id);
    if (!src) return undefined;
    const newId = `${kind.slice(0, 2)}-${Date.now().toString(36)}`;
    const clone: ITemplateSummary = { ...src, id: newId, name: `${src.name} (Copy)`, isSystem: false, typesUsing: 0, programsUsing: 0 };
    signalRef.update(list => [...list, clone]);
    return clone;
  }

  public deleteTemplate(kind: 'checkin' | 'compliance' | 'phase', id: string): boolean {
    const signalRef = this.templateSignal(kind);
    const t = signalRef().find(x => x.id === id);
    if (!t || t.isSystem || t.programsUsing > 0) return false;
    signalRef.update(list => list.filter(x => x.id !== id));
    return true;
  }

  private templateSignal(kind: 'checkin' | 'compliance' | 'phase') {
    return kind === 'checkin' ? this._checkinTemplates
         : kind === 'compliance' ? this._complianceTemplates
         : this._phaseTemplates;
  }

  // Message templates
  public updateMessageTemplate(id: string, body: string): void {
    this._messageTemplates.update(list => list.map(m => (m.id === id ? { ...m, body, charCount: body.length } : m)));
  }

  public resetMessageTemplate(id: string): void {
    // In a real impl this would restore from a defaults table; here we just clear.
    this._messageTemplates.update(list => list.map(m => (m.id === id ? { ...m, body: '', charCount: 0 } : m)));
  }
}
