export type ProgramStatus = 'Draft' | 'Active' | 'Suspended' | 'Deactivated' | 'Archived';

export type ProgramType =
  | 'SUD'            // Substance Use Disorder Treatment
  | 'RH'             // Recovery Housing
  | 'DC'             // Drug Court
  | 'PP'             // Probation / Parole
  | 'CM'             // Case Management
  | 'MAT'            // Medication Assisted Treatment
  | 'CBO'            // Community-Based Organization
  | 'DW'             // Drug Watch / Surveillance
  | 'OTH';           // Other

export const PROGRAM_TYPE_LABEL: Record<ProgramType, string> = {
  SUD: 'SUD Treatment',
  RH:  'Recovery Housing',
  DC:  'Drug Court',
  PP:  'Probation/Parole',
  CM:  'Case Management',
  MAT: 'Medication Assisted',
  CBO: 'Community-Based Org',
  DW:  'Drug Watch',
  OTH: 'Other'
};

export type FeatureKey =
  | 'daily_checkins'
  | 'weekly_checkins'
  | 'appointments'
  | 'ua_testing'
  | 'treatment_plans'
  | 'housing_rules'
  | 'rent_tracking'
  | 'meeting_attendance'
  | 'court_compliance'
  | 'hearing_schedule'
  | 'supervision_conditions'
  | 'cross_agency'
  | 'moud_tracking'
  | 'compliance_streaks'
  | 'risk_indicators'
  | 'document_uploads'
  | 'secure_messaging'
  | 'lab_integration';

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  daily_checkins:         'Daily Check-Ins',
  weekly_checkins:        'Weekly Check-Ins',
  appointments:           'Appointments',
  ua_testing:             'UA / Drug Testing',
  treatment_plans:        'Treatment Plans',
  housing_rules:          'Housing Rules',
  rent_tracking:          'Rent Tracking',
  meeting_attendance:     'Meeting Attendance',
  court_compliance:       'Court Compliance',
  hearing_schedule:       'Hearing Schedule',
  supervision_conditions: 'Supervision Conditions',
  cross_agency:           'Cross-Agency Reporting',
  moud_tracking:          'MOUD Tracking',
  compliance_streaks:     'Compliance Streaks',
  risk_indicators:        'Risk Indicators',
  document_uploads:       'Document Uploads',
  secure_messaging:       'Secure Messaging',
  lab_integration:        'Lab Integration'
};

export type StaffRole =
  | 'Director'
  | 'CaseManager'
  | 'Counselor'
  | 'PeerSupport'
  | 'HousingManager'
  | 'MedicalStaff'
  | 'CourtOfficer'
  | 'Supervisor'
  | 'Admin'
  | 'ReadOnly';

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  Director:        'Program Director',
  CaseManager:     'Case Manager',
  Counselor:       'Counselor',
  PeerSupport:     'Peer Support',
  HousingManager:  'Housing Manager',
  MedicalStaff:    'Medical Staff',
  CourtOfficer:    'Court Officer',
  Supervisor:      'Supervisor',
  Admin:           'Program Admin',
  ReadOnly:        'Read-Only'
};

export interface IStaffAssignment {
  id: string;
  userId: string;
  name: string;
  role: StaffRole;
  caseloadMax: number;
  caseloadCurrent: number;
  assignedAt: string;
  primary: boolean;
}

export type EnrollmentStatus = 'Active' | 'OnHold' | 'Discharged' | 'Transferred';

export interface IEnrollment {
  id: string;
  clientId: string;
  clientName: string;
  phaseId?: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  dischargedAt?: string;
  dischargeReason?: string;
  primaryStaffId?: string;
  complianceRate: number;      // 0-100
  checkInRate: number;         // 0-100
  riskScore: number;           // 0-100
  atRisk: boolean;
}

export interface IProgramPhase {
  id: string;
  name: string;
  orderIndex: number;
  durationDays: number;
  minDurationDays?: number;
  description?: string;
  advancementCriteria?: string;
  advancementMode: 'Automatic' | 'Manual' | 'Hybrid';
  requirements?: string;
}

export type CheckInFrequency = 'Daily' | 'Weekly' | 'BiWeekly' | 'Monthly' | 'Custom';
export type CheckInQuestionType = 'Scale1to10' | 'YesNo' | 'MultiChoice' | 'Text' | 'Location';

export interface ICheckInQuestion {
  id: string;
  orderIndex: number;
  text: string;
  type: CheckInQuestionType;
  required: boolean;
  crisisKeywords?: string[];
  options?: string[];
}

export interface ICheckInConfig {
  frequency: CheckInFrequency;
  windowStart: string;          // "HH:MM"
  windowEnd: string;            // "HH:MM"
  lateGraceMinutes: number;
  missedAction: 'Alert' | 'Flag' | 'Escalate';
  questions: ICheckInQuestion[];
  locationRequired: boolean;
  photoRequired: boolean;
}

export type AppointmentMode = 'InPerson' | 'Telehealth' | 'Phone' | 'Any';

export interface IAppointmentType {
  id: string;
  name: string;
  durationMinutes: number;
  mode: AppointmentMode;
  recurrence?: 'Weekly' | 'BiWeekly' | 'Monthly' | 'None';
  staffRoles: StaffRole[];
  graceMinutes: number;
}

export type RuleSeverity = 'Warning' | 'Minor' | 'Major' | 'Immediate';
export type RuleAction =
  | 'Alert'
  | 'FlagCaseManager'
  | 'EscalateDirector'
  | 'RecordViolation'
  | 'ReportCourt'
  | 'SuspendProgram';

export interface IComplianceRule {
  id: string;
  name: string;
  description?: string;
  severity: RuleSeverity;
  maxViolations: number;
  actions: RuleAction[];
  phaseId?: string;
  active: boolean;
}

export type RiskIndicator =
  | 'missed_checkins_3d'
  | 'negative_mood_trend'
  | 'crisis_keywords'
  | 'missed_appointment'
  | 'positive_ua'
  | 'rule_violation'
  | 'rent_overdue'
  | 'cravings_score_high'
  | 'isolation_score_high'
  | 'support_score_low';

export interface IRiskIndicatorConfig {
  key: RiskIndicator;
  weight: number;    // 0-100
  enabled: boolean;
}

export interface IUAConfig {
  frequency: 'Weekly' | 'BiWeekly' | 'Monthly' | 'Random' | 'AsOrdered';
  randomRange?: number;            // e.g., 4 per month
  panels: string[];                // e.g., ['Opioids','Cocaine','THC']
  collectionMethod: 'Urine' | 'Saliva' | 'Hair' | 'Breath';
  labIntegration: boolean;
  labName?: string;
  positiveAction: RuleAction;
  refusalAction: RuleAction;
  dilutedAction: RuleAction;
}

export type HouseRuleSeverity = 'Warning' | 'Minor' | 'Major' | 'Immediate';

export interface IHouseRule {
  id: string;
  name: string;
  severity: HouseRuleSeverity;
  maxViolations: number;
}

export interface IHousingConfig {
  totalBeds: number;
  currentOccupancy: number;
  rentAmount: number;
  rentFrequency: 'Weekly' | 'BiWeekly' | 'Monthly';
  rentGraceDays: number;
  curfew: string;            // "HH:MM"
  coedAllowed: boolean;
  visitorPolicy?: string;
  houseRules: IHouseRule[];
}

export interface ICourtConfig {
  courtName: string;
  judge?: string;
  location?: string;
  sessionDays: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>;
  hearingTime: string;       // "HH:MM"
  hearingFrequency: 'Weekly' | 'BiWeekly' | 'Monthly' | 'PerPhase';
}

export interface IDocumentRequirement {
  id: string;
  documentType: string;
  description?: string;
  requiredAt: 'Enrollment' | 'Ongoing' | 'Discharge' | 'PerPhase';
  submissionFrequency: 'OneTime' | 'Weekly' | 'Monthly' | 'PerEvent' | 'AsNeeded';
  acceptedFormats: string[];
  maxFileSizeMB: number;
  autoExpire: boolean;
  expirationDays?: number;
  missingAction: 'Reminder' | 'Flag' | 'Escalate' | 'Violation';
}

export interface INotificationRule {
  id: string;
  event: string;
  channels: Array<'SMS' | 'Push' | 'Email' | 'InApp'>;
  recipientRoles: Array<'Client' | 'CaseManager' | 'Director' | 'Admin' | 'HousingManager' | 'CourtOfficer'>;
  timing?: string;
  enabled: boolean;
}

export interface IProgram {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: ProgramType;
  status: ProgramStatus;
  description?: string;
  fundingSource?: string;
  externalRef?: string;

  capacity: number;
  currentEnrollment: number;
  directorUserId?: string;
  directorName?: string;

  features: Record<FeatureKey, boolean>;

  phases: IProgramPhase[];
  staff: IStaffAssignment[];
  enrollments: IEnrollment[];
  complianceRules: IComplianceRule[];
  checkInConfig?: ICheckInConfig;
  appointmentTypes: IAppointmentType[];
  uaConfig?: IUAConfig;
  housingConfig?: IHousingConfig;
  courtConfig?: ICourtConfig;
  documentRequirements: IDocumentRequirement[];
  notificationRules: INotificationRule[];
  riskConfig: IRiskIndicatorConfig[];

  checkInRate: number;       // 0-100 today
  complianceRate: number;    // 0-100 7d
  atRiskCount: number;
  negativeUaRate: number;    // 0-100
  appointmentAdherence: number; // 0-100

  activatedAt?: string;
  suspendedAt?: string;
  deactivatedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProgramAuditEntry {
  id: string;
  timestamp: string;
  programId: string;
  action: string;
  actor: string;
  details?: string;
}

export const DEFAULT_FEATURES: Record<FeatureKey, boolean> = {
  daily_checkins:         false,
  weekly_checkins:        false,
  appointments:           false,
  ua_testing:             false,
  treatment_plans:        false,
  housing_rules:          false,
  rent_tracking:          false,
  meeting_attendance:     false,
  court_compliance:       false,
  hearing_schedule:       false,
  supervision_conditions: false,
  cross_agency:           false,
  moud_tracking:          false,
  compliance_streaks:     false,
  risk_indicators:        false,
  document_uploads:       false,
  secure_messaging:       false,
  lab_integration:        false
};

export const TYPE_DEFAULT_FEATURES: Record<ProgramType, Partial<Record<FeatureKey, boolean>>> = {
  SUD: {
    daily_checkins: true, weekly_checkins: true, appointments: true, ua_testing: true,
    treatment_plans: true, moud_tracking: true, compliance_streaks: true, risk_indicators: true,
    document_uploads: true, secure_messaging: true
  },
  RH: {
    daily_checkins: true, meeting_attendance: true, housing_rules: true, rent_tracking: true,
    ua_testing: true, compliance_streaks: true, risk_indicators: true, document_uploads: true,
    secure_messaging: true
  },
  DC: {
    daily_checkins: true, appointments: true, ua_testing: true, court_compliance: true,
    hearing_schedule: true, supervision_conditions: true, cross_agency: true,
    compliance_streaks: true, risk_indicators: true, document_uploads: true
  },
  PP: {
    weekly_checkins: true, appointments: true, ua_testing: true, supervision_conditions: true,
    cross_agency: true, risk_indicators: true, document_uploads: true
  },
  CM: {
    weekly_checkins: true, appointments: true, treatment_plans: true, risk_indicators: true,
    document_uploads: true, secure_messaging: true
  },
  MAT: {
    appointments: true, ua_testing: true, moud_tracking: true, treatment_plans: true,
    document_uploads: true, secure_messaging: true, lab_integration: true
  },
  CBO: {
    weekly_checkins: true, appointments: true, meeting_attendance: true, document_uploads: true,
    secure_messaging: true
  },
  DW: {
    daily_checkins: true, ua_testing: true, supervision_conditions: true, risk_indicators: true,
    document_uploads: true
  },
  OTH: {
    weekly_checkins: true, appointments: true, document_uploads: true
  }
};

export const DEFAULT_CHECKIN_QUESTIONS: Omit<ICheckInQuestion, 'id'>[] = [
  { orderIndex: 1, text: 'How are you feeling today?', type: 'Scale1to10', required: true, crisisKeywords: [] },
  { orderIndex: 2, text: 'How strong were your cravings today? (1 = none, 10 = very strong)', type: 'Scale1to10', required: true },
  { orderIndex: 3, text: 'How connected did you feel to support today? (1 = isolated, 10 = fully supported)', type: 'Scale1to10', required: true },
  { orderIndex: 4, text: 'Did you attend your recovery meeting(s) today?', type: 'YesNo', required: false },
  { orderIndex: 5, text: 'Did you take your prescribed medication today?', type: 'YesNo', required: false },
  { orderIndex: 6, text: 'Is there anything you want your case manager to know?', type: 'Text', required: false, crisisKeywords: ['suicide', 'hurt myself', 'use', 'relapse', 'crisis'] }
];

export const DEFAULT_RISK_CONFIG: IRiskIndicatorConfig[] = [
  { key: 'missed_checkins_3d',    weight: 20, enabled: true },
  { key: 'negative_mood_trend',   weight: 15, enabled: true },
  { key: 'crisis_keywords',       weight: 30, enabled: true },
  { key: 'missed_appointment',    weight: 15, enabled: true },
  { key: 'positive_ua',           weight: 25, enabled: true },
  { key: 'rule_violation',        weight: 20, enabled: true },
  { key: 'rent_overdue',          weight: 10, enabled: true },
  { key: 'cravings_score_high',   weight: 15, enabled: true },
  { key: 'isolation_score_high',  weight: 10, enabled: true },
  { key: 'support_score_low',     weight: 10, enabled: true }
];

export const DC_DEFAULT_PHASES: Array<Omit<IProgramPhase, 'id'>> = [
  { name: 'Stabilization', orderIndex: 1, durationDays: 90,  minDurationDays: 60,  advancementMode: 'Manual', description: 'Intensive early recovery — frequent check-ins, UAs, and court appearances.', advancementCriteria: '60 days sober, attend all appointments, pass all UAs.' },
  { name: 'Early Recovery', orderIndex: 2, durationDays: 120, minDurationDays: 90,  advancementMode: 'Manual', description: 'Reduced frequency, engagement in treatment plan.', advancementCriteria: '90 days sober, 90% attendance, no major violations.' },
  { name: 'Advanced Recovery', orderIndex: 3, durationDays: 180, minDurationDays: 120, advancementMode: 'Manual', description: 'Graduated responsibilities and community engagement.', advancementCriteria: '120 days sober, 95% attendance, active employment/education.' },
  { name: 'Aftercare', orderIndex: 4, durationDays: 180, minDurationDays: 120, advancementMode: 'Manual', description: 'Transition out of intensive supervision.', advancementCriteria: 'Stable employment, sustained recovery, final court approval.' }
];

export const RH_DEFAULT_PHASES: Array<Omit<IProgramPhase, 'id'>> = [
  { name: 'Orientation',   orderIndex: 1, durationDays: 14,  minDurationDays: 7,  advancementMode: 'Automatic', description: 'Introduction to house rules, peer support, initial engagement.', advancementCriteria: 'Complete orientation, attend house meetings.' },
  { name: 'Growth',        orderIndex: 2, durationDays: 60,  minDurationDays: 30, advancementMode: 'Hybrid',    description: 'Active recovery with increased responsibility.', advancementCriteria: '30 days sober, paying rent, active in meetings.' },
  { name: 'Independence',  orderIndex: 3, durationDays: 90,  minDurationDays: 60, advancementMode: 'Hybrid',    description: 'Preparation for transition out of housing.', advancementCriteria: '60 days sober, employed, savings plan in place.' }
];

export const DEFAULT_CRISIS_KEYWORDS = ['suicide', 'hurt myself', 'use', 'relapse', 'crisis', 'kill', 'end it'];

export function programCode(tenantId: string, name: string): string {
  const cleaned = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'PROG';
  const suffix = (Math.floor(Math.random() * 900) + 100).toString();
  return `${cleaned}-${suffix}`;
}

export function riskBand(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score <= 20) return 'Low';
  if (score <= 50) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
}
