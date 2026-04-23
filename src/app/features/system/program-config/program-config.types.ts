export type ProgramTypeCategory = 'Treatment' | 'Housing' | 'Justice' | 'Community' | 'Other';
export type SubscriptionTier = 'Trial' | 'Basic' | 'Professional' | 'Enterprise' | 'Government';
export type FeatureCategory = 'Engagement' | 'Compliance' | 'Clinical' | 'Housing' | 'Justice' | 'Communication' | 'Reporting' | 'Administrative';
export type FeatureStatus = 'Active' | 'Beta' | 'Deprecated';
export type FeatureOverrideMode = 'Allowed' | 'Locked On' | 'Locked Off' | 'Hidden';
export type RuleSeverity = 'Minor' | 'Moderate' | 'Major' | 'Critical';
export type QuestionType = 'Mood Emoji' | 'Yes/No' | 'Scale 1-5' | 'Scale 1-10' | 'Multiple Choice' | 'Free Text' | 'Number' | 'Date' | 'Time';
export type NotificationChannel = 'SMS' | 'Email' | 'Push' | 'In-App';

export interface IProgramTypeDef {
  code: string;
  name: string;
  description: string;
  iconKey: string;
  color: string;
  category: ProgramTypeCategory;
  isSystem: boolean;
  isActive: boolean;
  minTier: SubscriptionTier;
  defaultCapacity: number;
  requiresConsent: boolean;
  requiresUA: boolean;
  requiresCourtCompliance: boolean;
  requiresHousing: boolean;
  featuresEnabled: number;
  featuresTotal: number;
  defaultPhases: number;
  complianceRules: number;
  checkInQuestions: number;
  programsUsing: number;
  tenantsUsing: number;
}

export interface IFeatureDef {
  key: string;
  name: string;
  description: string;
  category: FeatureCategory;
  iconKey: string;
  minTier: SubscriptionTier;
  status: FeatureStatus;
  programsUsing: number;
  dependencies: string[];
  conflicts: string[];
}

export interface ITemplateSummary {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  itemLabel: string;
  typesUsing: number;
  programsUsing: number;
  isSystem: boolean;
}

export interface INotificationRuleDef {
  id: string;
  name: string;
  trigger: string;
  recipients: string;
  channels: NotificationChannel[];
  timing: string;
  locked: boolean;
}

export interface IMessageTemplate {
  id: string;
  notification: string;
  channel: 'SMS' | 'Email' | 'Push';
  body: string;
  charCount?: number;
}

export interface IRiskLevel {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  minScore: number;
  maxScore: number;
  color: string;
  action: string;
}

export interface IRiskIndicatorWeight {
  indicator: string;
  defaultWeight: number;
  min: number;
  max: number;
}

export interface IGlobalSettings {
  // General
  allowCustomProgramTypes: boolean;
  maxProgramsPerTenant: Record<SubscriptionTier, number | null>;
  defaultProgramCapacity: number;
  autoGenerateProgramCode: boolean;
  // Check-Ins
  defaultWindowStart: string;
  defaultWindowEnd: string;
  defaultLateGraceMinutes: number;
  maxCheckInQuestions: number;
  crisisKeywordDetection: boolean;
  requireDailyCheckIn: boolean;
  // Compliance
  riskScoreModel: 'Weighted Sum' | 'Maximum' | 'Average';
  enableComplianceStreaks: boolean;
  streakMilestones: number[];
  streakResetOnAnyViolation: boolean;
  // UA
  defaultTestPanel: string;
  chainOfCustodyDefault: boolean;
  positiveUAAlwaysEscalates: boolean;
  uaResultImmutableAfterReview: boolean;
  // Appointments
  defaultNoShowGraceMinutes: number;
  defaultReminderTimes: string[];
  allowClientSelfSchedule: boolean;
  allowClientSelfReschedule: boolean;
  rescheduleWindowHours: number;
  // Consent
  cfr42Enforcement: boolean;
  consentRequiredForEnrollment: boolean;
  defaultConsentDurationDays: number;
  consentExpirationWarningDays: number;
  crossProgramDataSharing: 'Blocked' | 'Consent Required' | 'Open Within Tenant';
  // Retention
  programDataRetentionYears: number;
  auditTrailRetentionYears: number;
  purgeSchedule: string;
  legalHoldOverride: boolean;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

export const TIER_ORDER: SubscriptionTier[] = ['Trial', 'Basic', 'Professional', 'Enterprise', 'Government'];

export const TIER_LABEL: Record<SubscriptionTier, string> = {
  Trial: 'Trial',
  Basic: 'Basic+',
  Professional: 'Professional+',
  Enterprise: 'Enterprise+',
  Government: 'Government'
};

export const CATEGORY_COLOR: Record<FeatureCategory, string> = {
  Engagement: '#2563EB',
  Compliance: '#D97706',
  Clinical: '#DC2626',
  Housing: '#059669',
  Justice: '#7C3AED',
  Communication: '#0891B2',
  Reporting: '#475569',
  Administrative: '#64748B'
};

export const SEVERITY_COLOR: Record<RuleSeverity, string> = {
  Minor: '#fef3c7/#92400e',
  Moderate: '#fed7aa/#9a3412',
  Major: '#fecaca/#991b1b',
  Critical: '#1f2937/#fef2f2'
};
