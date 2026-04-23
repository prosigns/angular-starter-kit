import { Injectable, computed, signal } from '@angular/core';
import {
  DC_DEFAULT_PHASES,
  DEFAULT_CHECKIN_QUESTIONS,
  DEFAULT_CRISIS_KEYWORDS,
  DEFAULT_FEATURES,
  DEFAULT_RISK_CONFIG,
  FeatureKey,
  IAppointmentType,
  ICheckInConfig,
  IComplianceRule,
  IDocumentRequirement,
  IEnrollment,
  IHousingConfig,
  INotificationRule,
  IProgram,
  IProgramAuditEntry,
  IProgramPhase,
  IRiskIndicatorConfig,
  IStaffAssignment,
  IUAConfig,
  ProgramStatus,
  ProgramType,
  RH_DEFAULT_PHASES,
  StaffRole,
  TYPE_DEFAULT_FEATURES,
  programCode
} from './program.types';

function isoNow(): string {
  return new Date().toISOString();
}

function dateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function uid(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function buildPhases(template: Array<Omit<IProgramPhase, 'id'>>): IProgramPhase[] {
  return template.map(p => ({ ...p, id: uid('ph') }));
}

function buildCheckInConfig(crisisTextQuestionIdx = 5): ICheckInConfig {
  return {
    frequency: 'Daily',
    windowStart: '06:00',
    windowEnd: '22:00',
    lateGraceMinutes: 60,
    missedAction: 'Alert',
    questions: DEFAULT_CHECKIN_QUESTIONS.map((q, i) => ({
      ...q,
      id: uid('q'),
      crisisKeywords: i === crisisTextQuestionIdx ? DEFAULT_CRISIS_KEYWORDS : (q.crisisKeywords ?? [])
    })),
    locationRequired: false,
    photoRequired: false
  };
}

function buildFeatures(type: ProgramType): Record<FeatureKey, boolean> {
  return { ...DEFAULT_FEATURES, ...TYPE_DEFAULT_FEATURES[type] };
}

function buildRiskConfig(): IRiskIndicatorConfig[] {
  return DEFAULT_RISK_CONFIG.map(r => ({ ...r }));
}

function buildDefaultEnrollments(count: number, atRiskCount: number): IEnrollment[] {
  const names = [
    'J. Hernandez', 'A. Patel', 'M. Johnson', 'S. Lee', 'D. Williams',
    'R. Garcia', 'K. Brown', 'L. Davis', 'P. Miller', 'T. Wilson',
    'C. Martinez', 'E. Anderson', 'N. Taylor', 'B. Thomas', 'V. Moore'
  ];
  const enrollments: IEnrollment[] = [];
  for (let i = 0; i < count; i++) {
    const atRisk = i < atRiskCount;
    enrollments.push({
      id: uid('en'),
      clientId: uid('c'),
      clientName: names[i % names.length] + ' ' + (i + 1),
      status: 'Active',
      enrolledAt: dateStr(-Math.floor(Math.random() * 180) - 5),
      complianceRate: atRisk ? 50 + Math.floor(Math.random() * 20) : 80 + Math.floor(Math.random() * 20),
      checkInRate:    atRisk ? 40 + Math.floor(Math.random() * 20) : 80 + Math.floor(Math.random() * 20),
      riskScore:      atRisk ? 55 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 40),
      atRisk
    });
  }
  return enrollments;
}

function buildDefaultStaff(directorName: string, count: number): IStaffAssignment[] {
  const roles: StaffRole[] = ['Director', 'CaseManager', 'Counselor', 'PeerSupport'];
  const names = ['Sarah Kim', 'James Wilson', 'Emma Rodriguez', 'David Chen', 'Amanda Brooks', 'Mike Anderson'];
  const staff: IStaffAssignment[] = [];
  staff.push({
    id: uid('s'),
    userId: uid('u'),
    name: directorName,
    role: 'Director',
    caseloadMax: 0,
    caseloadCurrent: 0,
    assignedAt: dateStr(-180),
    primary: true
  });
  for (let i = 1; i < count; i++) {
    staff.push({
      id: uid('s'),
      userId: uid('u'),
      name: names[i % names.length],
      role: roles[i % roles.length] === 'Director' ? 'CaseManager' : roles[i % roles.length],
      caseloadMax: 20,
      caseloadCurrent: 10 + Math.floor(Math.random() * 8),
      assignedAt: dateStr(-Math.floor(Math.random() * 120) - 10),
      primary: false
    });
  }
  return staff;
}

function buildDefaultComplianceRules(type: ProgramType): IComplianceRule[] {
  const base: Array<Omit<IComplianceRule, 'id'>> = [
    { name: 'Missed check-in',         description: '3+ missed daily check-ins in 7 days', severity: 'Minor',  maxViolations: 3, actions: ['FlagCaseManager'], active: true },
    { name: 'Missed appointment',      description: 'No-show without excuse',                severity: 'Minor',  maxViolations: 2, actions: ['FlagCaseManager'], active: true },
    { name: 'Positive UA',             description: 'Confirmed positive drug test',          severity: 'Major',  maxViolations: 1, actions: ['FlagCaseManager', 'EscalateDirector'], active: true }
  ];
  if (type === 'RH') {
    base.push({ name: 'Rent overdue',     description: 'Rent unpaid after grace period',    severity: 'Minor',     maxViolations: 2, actions: ['FlagCaseManager'], active: true });
    base.push({ name: 'Curfew violation', description: 'Returns after curfew',               severity: 'Warning',   maxViolations: 3, actions: ['Alert'],          active: true });
  }
  if (type === 'DC' || type === 'PP') {
    base.push({ name: 'Missed hearing',   description: 'Missed court hearing',               severity: 'Immediate', maxViolations: 0, actions: ['ReportCourt'], active: true });
  }
  return base.map(r => ({ ...r, id: uid('cr') }));
}

function buildDefaultAppointmentTypes(type: ProgramType): IAppointmentType[] {
  const list: Array<Omit<IAppointmentType, 'id'>> = [
    { name: 'Individual Session', durationMinutes: 60, mode: 'InPerson',   recurrence: 'Weekly',  staffRoles: ['Counselor', 'CaseManager'], graceMinutes: 15 }
  ];
  if (type === 'DC' || type === 'PP') list.push({ name: 'Court Hearing',       durationMinutes: 30, mode: 'InPerson',  recurrence: 'BiWeekly', staffRoles: ['CourtOfficer'],  graceMinutes: 0 });
  if (type === 'MAT' || type === 'SUD') list.push({ name: 'Medical Visit',     durationMinutes: 30, mode: 'InPerson',  recurrence: 'Monthly',  staffRoles: ['MedicalStaff'],   graceMinutes: 10 });
  if (type === 'RH') list.push({ name: 'House Meeting',                        durationMinutes: 60, mode: 'InPerson',  recurrence: 'Weekly',   staffRoles: ['HousingManager'], graceMinutes: 5 });
  return list.map(a => ({ ...a, id: uid('at') }));
}

function buildDefaultNotificationRules(): INotificationRule[] {
  return [
    { id: uid('nr'), event: 'Check-In Reminder',   channels: ['SMS', 'Push'],          recipientRoles: ['Client'], timing: 'At window open', enabled: true },
    { id: uid('nr'), event: 'Missed Check-In',     channels: ['SMS', 'InApp'],         recipientRoles: ['Client', 'CaseManager'], timing: 'Immediately', enabled: true },
    { id: uid('nr'), event: 'Appointment Reminder', channels: ['SMS', 'Push', 'Email'], recipientRoles: ['Client'], timing: '24h + 1h before', enabled: true },
    { id: uid('nr'), event: 'Positive UA',          channels: ['InApp', 'Email'],      recipientRoles: ['CaseManager', 'Director'], timing: 'Immediately', enabled: true },
    { id: uid('nr'), event: 'Compliance Violation', channels: ['InApp'],               recipientRoles: ['CaseManager'], timing: 'Immediately', enabled: true },
    { id: uid('nr'), event: 'Risk Alert',           channels: ['InApp', 'Email'],      recipientRoles: ['CaseManager', 'Director'], timing: 'Immediately', enabled: true }
  ];
}

function buildDefaultDocumentRequirements(type: ProgramType): IDocumentRequirement[] {
  const list: Array<Omit<IDocumentRequirement, 'id'>> = [
    { documentType: 'Consent Form',     description: '42 CFR Part 2 consent',          requiredAt: 'Enrollment',  submissionFrequency: 'OneTime',  acceptedFormats: ['PDF', 'JPG'],          maxFileSizeMB: 10, autoExpire: true,  expirationDays: 365, missingAction: 'Violation' },
    { documentType: 'Intake Assessment', description: 'Completed intake paperwork',     requiredAt: 'Enrollment', submissionFrequency: 'OneTime',  acceptedFormats: ['PDF'],                 maxFileSizeMB: 10, autoExpire: false,                      missingAction: 'Flag' }
  ];
  if (type === 'RH') list.push({ documentType: 'Lease Agreement', description: 'Signed lease', requiredAt: 'Enrollment', submissionFrequency: 'OneTime', acceptedFormats: ['PDF'], maxFileSizeMB: 10, autoExpire: false, missingAction: 'Violation' });
  if (type === 'SUD' || type === 'MAT') list.push({ documentType: 'UA Results', description: 'Lab drug test results', requiredAt: 'Ongoing', submissionFrequency: 'Weekly', acceptedFormats: ['PDF'], maxFileSizeMB: 5, autoExpire: false, missingAction: 'Flag' });
  if (type === 'DC' || type === 'PP') list.push({ documentType: 'Court Compliance Report', description: 'Signed court order', requiredAt: 'Enrollment', submissionFrequency: 'OneTime', acceptedFormats: ['PDF'], maxFileSizeMB: 10, autoExpire: false, missingAction: 'Violation' });
  return list.map(d => ({ ...d, id: uid('dr') }));
}

function buildUaConfig(type: ProgramType): IUAConfig | undefined {
  if (!['SUD', 'MAT', 'DC', 'PP', 'RH', 'DW'].includes(type)) return undefined;
  return {
    frequency: 'Random',
    randomRange: 4,
    panels: ['Opioids', 'Cocaine', 'Amphetamines', 'THC', 'Benzodiazepines'],
    collectionMethod: 'Urine',
    labIntegration: false,
    positiveAction: 'EscalateDirector',
    refusalAction: 'RecordViolation',
    dilutedAction: 'Alert'
  };
}

function buildHousingConfig(type: ProgramType, capacity: number): IHousingConfig | undefined {
  if (type !== 'RH') return undefined;
  return {
    totalBeds: capacity,
    currentOccupancy: Math.floor(capacity * 0.75),
    rentAmount: 175,
    rentFrequency: 'Weekly',
    rentGraceDays: 3,
    curfew: '22:00',
    coedAllowed: false,
    visitorPolicy: 'Visitors allowed 9am-8pm with approval',
    houseRules: [
      { id: uid('hr'), name: 'Curfew (10:00 PM)',                severity: 'Minor',     maxViolations: 3 },
      { id: uid('hr'), name: 'No substance use on premises',     severity: 'Major',     maxViolations: 1 },
      { id: uid('hr'), name: 'Attend required meetings',         severity: 'Minor',     maxViolations: 3 },
      { id: uid('hr'), name: 'Pay rent on time',                 severity: 'Minor',     maxViolations: 2 },
      { id: uid('hr'), name: 'Maintain assigned chores',         severity: 'Warning',   maxViolations: 5 },
      { id: uid('hr'), name: 'No overnight guests without approval', severity: 'Minor', maxViolations: 2 },
      { id: uid('hr'), name: 'No violence or threats',           severity: 'Immediate', maxViolations: 0 },
      { id: uid('hr'), name: 'No theft',                         severity: 'Immediate', maxViolations: 0 },
      { id: uid('hr'), name: 'Participate in weekly house meeting', severity: 'Warning', maxViolations: 4 },
      { id: uid('hr'), name: 'Submit to random UA',              severity: 'Major',     maxViolations: 1 }
    ]
  };
}

function buildProgram(seed: {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: ProgramType;
  status: ProgramStatus;
  capacity: number;
  enrolled: number;
  atRisk: number;
  directorName: string;
  staffCount: number;
  createdDaysAgo: number;
  checkInRate: number;
  complianceRate: number;
  negativeUaRate: number;
  appointmentAdherence: number;
}): IProgram {
  const phases = seed.type === 'DC' ? buildPhases(DC_DEFAULT_PHASES)
                : seed.type === 'RH' ? buildPhases(RH_DEFAULT_PHASES)
                : [];
  return {
    id: seed.id,
    tenantId: seed.tenantId,
    name: seed.name,
    code: seed.code,
    type: seed.type,
    status: seed.status,
    description: `Default program for ${seed.name}`,
    capacity: seed.capacity,
    currentEnrollment: seed.enrolled,
    directorName: seed.directorName,
    features: buildFeatures(seed.type),
    phases,
    staff: buildDefaultStaff(seed.directorName, seed.staffCount),
    enrollments: buildDefaultEnrollments(seed.enrolled, seed.atRisk),
    complianceRules: buildDefaultComplianceRules(seed.type),
    checkInConfig: buildCheckInConfig(),
    appointmentTypes: buildDefaultAppointmentTypes(seed.type),
    uaConfig: buildUaConfig(seed.type),
    housingConfig: buildHousingConfig(seed.type, seed.capacity),
    documentRequirements: buildDefaultDocumentRequirements(seed.type),
    notificationRules: buildDefaultNotificationRules(),
    riskConfig: buildRiskConfig(),
    checkInRate: seed.checkInRate,
    complianceRate: seed.complianceRate,
    atRiskCount: seed.atRisk,
    negativeUaRate: seed.negativeUaRate,
    appointmentAdherence: seed.appointmentAdherence,
    activatedAt: seed.status === 'Draft' ? undefined : dateStr(-seed.createdDaysAgo + 7),
    suspendedAt: seed.status === 'Suspended' ? dateStr(-10) : undefined,
    deactivatedAt: seed.status === 'Deactivated' ? dateStr(-30) : undefined,
    createdAt: dateStr(-seed.createdDaysAgo),
    updatedAt: dateStr(-Math.floor(Math.random() * 14))
  };
}

function seedPrograms(): IProgram[] {
  return [
    buildProgram({ id: 'p-1', tenantId: 't-1', name: 'Grafton Drug Court — Main',    code: 'GDC-001', type: 'DC',  status: 'Active',      capacity: 50, enrolled: 42, atRisk: 4, directorName: 'Sarah Kim',      staffCount: 6, createdDaysAgo: 300, checkInRate: 87, complianceRate: 94, negativeUaRate: 96, appointmentAdherence: 91 }),
    buildProgram({ id: 'p-2', tenantId: 't-1', name: 'Grafton SUD Outpatient',       code: 'GSO-002', type: 'SUD', status: 'Active',      capacity: 60, enrolled: 48, atRisk: 5, directorName: 'James Wilson',   staffCount: 5, createdDaysAgo: 220, checkInRate: 82, complianceRate: 89, negativeUaRate: 92, appointmentAdherence: 88 }),
    buildProgram({ id: 'p-3', tenantId: 't-2', name: 'Carroll House — Conway',       code: 'CHC-001', type: 'RH',  status: 'Active',      capacity: 18, enrolled: 15, atRisk: 2, directorName: 'Emma Rodriguez', staffCount: 3, createdDaysAgo: 180, checkInRate: 90, complianceRate: 92, negativeUaRate: 95, appointmentAdherence: 93 }),
    buildProgram({ id: 'p-4', tenantId: 't-3', name: 'NH DHHS Case Management R1',   code: 'DHCM-01', type: 'CM',  status: 'Active',      capacity: 120, enrolled: 98, atRisk: 7, directorName: 'Robert Chen',    staffCount: 8, createdDaysAgo: 410, checkInRate: 79, complianceRate: 86, negativeUaRate: 94, appointmentAdherence: 84 }),
    buildProgram({ id: 'p-5', tenantId: 't-5', name: 'St. Mary\u2019s MAT Clinic',         code: 'SMMC-01', type: 'MAT', status: 'Active',      capacity: 80, enrolled: 68, atRisk: 3, directorName: 'David Brooks',   staffCount: 6, createdDaysAgo: 340, checkInRate: 85, complianceRate: 93, negativeUaRate: 97, appointmentAdherence: 90 }),
    buildProgram({ id: 'p-6', tenantId: 't-6', name: 'Rockingham MAT Primary',       code: 'RMP-001', type: 'MAT', status: 'Active',      capacity: 60, enrolled: 51, atRisk: 4, directorName: 'Aisha Green',    staffCount: 5, createdDaysAgo: 180, checkInRate: 81, complianceRate: 88, negativeUaRate: 91, appointmentAdherence: 86 }),
    buildProgram({ id: 'p-7', tenantId: 't-7', name: 'Merrimack Probation North',    code: 'MPN-001', type: 'PP',  status: 'Suspended',   capacity: 80, enrolled: 62, atRisk: 8, directorName: 'Tom Nguyen',     staffCount: 4, createdDaysAgo: 520, checkInRate: 0,  complianceRate: 0,  negativeUaRate: 0,  appointmentAdherence: 0 }),
    buildProgram({ id: 'p-8', tenantId: 't-5', name: 'St. Mary\u2019s Recovery Housing',   code: 'SMRH-01', type: 'RH',  status: 'Draft',       capacity: 24, enrolled: 0,  atRisk: 0, directorName: 'David Brooks',   staffCount: 1, createdDaysAgo: 5,   checkInRate: 0,  complianceRate: 0,  negativeUaRate: 0,  appointmentAdherence: 0 })
  ];
}

@Injectable({ providedIn: 'root' })
export class ProgramStoreService {
  private readonly _programs = signal<IProgram[]>(seedPrograms());
  private readonly _audit = signal<IProgramAuditEntry[]>([]);

  public readonly programs = this._programs.asReadonly();
  public readonly audit = this._audit.asReadonly();

  public readonly getById = (id: string) => computed(() => this._programs().find(p => p.id === id));

  public readonly counts = computed(() => {
    const list = this._programs();
    return {
      total: list.length,
      active: list.filter(p => p.status === 'Active').length,
      draft: list.filter(p => p.status === 'Draft').length,
      suspended: list.filter(p => p.status === 'Suspended').length,
      deactivated: list.filter(p => p.status === 'Deactivated').length,
      archived: list.filter(p => p.status === 'Archived').length
    };
  });

  public readonly kpi = computed(() => {
    const list = this._programs().filter(p => p.status === 'Active');
    if (list.length === 0) return { enrolled: 0, capacity: 0, checkInRate: 0, complianceRate: 0, atRisk: 0 };
    const enrolled = list.reduce((s, p) => s + p.currentEnrollment, 0);
    const capacity = list.reduce((s, p) => s + p.capacity, 0);
    const checkInRate = Math.round(list.reduce((s, p) => s + p.checkInRate, 0) / list.length);
    const complianceRate = Math.round(list.reduce((s, p) => s + p.complianceRate, 0) / list.length);
    const atRisk = list.reduce((s, p) => s + p.atRiskCount, 0);
    return { enrolled, capacity, checkInRate, complianceRate, atRisk };
  });

  public isNameAvailable(tenantId: string, name: string, ignoreId?: string): boolean {
    return !this._programs().some(p => p.tenantId === tenantId && p.name.toLowerCase() === name.toLowerCase() && p.id !== ignoreId);
  }

  public create(input: {
    tenantId: string;
    name: string;
    type: ProgramType;
    capacity: number;
    description?: string;
    directorName?: string;
    fundingSource?: string;
    features?: Partial<Record<FeatureKey, boolean>>;
    phases?: Array<Omit<IProgramPhase, 'id'>>;
  }): IProgram {
    const id = uid('p');
    const code = programCode(input.tenantId, input.name);
    const features = { ...buildFeatures(input.type), ...(input.features ?? {}) };
    const phases = input.phases?.length
      ? input.phases.map(p => ({ ...p, id: uid('ph') }))
      : input.type === 'DC' ? buildPhases(DC_DEFAULT_PHASES)
      : input.type === 'RH' ? buildPhases(RH_DEFAULT_PHASES)
      : [];

    const program: IProgram = {
      id,
      tenantId: input.tenantId,
      name: input.name,
      code,
      type: input.type,
      status: 'Draft',
      description: input.description,
      fundingSource: input.fundingSource,
      capacity: input.capacity,
      currentEnrollment: 0,
      directorName: input.directorName,
      features,
      phases,
      staff: input.directorName
        ? [{
            id: uid('s'),
            userId: uid('u'),
            name: input.directorName,
            role: 'Director',
            caseloadMax: 0,
            caseloadCurrent: 0,
            assignedAt: isoNow().slice(0, 10),
            primary: true
          }]
        : [],
      enrollments: [],
      complianceRules: buildDefaultComplianceRules(input.type),
      checkInConfig: buildCheckInConfig(),
      appointmentTypes: buildDefaultAppointmentTypes(input.type),
      uaConfig: buildUaConfig(input.type),
      housingConfig: buildHousingConfig(input.type, input.capacity),
      documentRequirements: buildDefaultDocumentRequirements(input.type),
      notificationRules: buildDefaultNotificationRules(),
      riskConfig: buildRiskConfig(),
      checkInRate: 0,
      complianceRate: 0,
      atRiskCount: 0,
      negativeUaRate: 0,
      appointmentAdherence: 0,
      createdAt: isoNow().slice(0, 10),
      updatedAt: isoNow().slice(0, 10)
    };
    this._programs.update(list => [program, ...list]);
    this.logAudit(id, 'Program created', `${program.name} (${program.code})`);
    return program;
  }

  public update(id: string, patch: Partial<IProgram>, reason?: string): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, ...patch, updatedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, 'Program updated', reason ?? Object.keys(patch).join(', '));
  }

  public setFeature(id: string, key: FeatureKey, enabled: boolean, reason?: string): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, features: { ...p.features, [key]: enabled }, updatedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, `Feature ${enabled ? 'enabled' : 'disabled'}: ${key}`, reason);
  }

  public activate(id: string, notes?: string): void {
    const p = this._programs().find(x => x.id === id);
    if (!p) return;
    this._programs.update(list => list.map(x => (x.id === id ? { ...x, status: 'Active', activatedAt: isoNow().slice(0, 10) } : x)));
    this.logAudit(id, 'Program activated', notes);
  }

  public suspend(id: string, reason: string, notifyClients = true, notifyStaff = true): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, status: 'Suspended', suspendedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, 'Program suspended', `${reason} · notifyClients=${notifyClients} · notifyStaff=${notifyStaff}`);
  }

  public reactivate(id: string, notes?: string): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, status: 'Active', suspendedAt: undefined } : p)));
    this.logAudit(id, 'Program reactivated', notes);
  }

  public deactivate(id: string, reason: string): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, status: 'Deactivated', deactivatedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, 'Program deactivated', reason);
  }

  public archive(id: string, reason: string): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, status: 'Archived', archivedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, 'Program archived', reason);
  }

  public assignStaff(id: string, staff: Omit<IStaffAssignment, 'id' | 'assignedAt'>): void {
    this._programs.update(list =>
      list.map(p =>
        p.id === id
          ? { ...p, staff: [...p.staff, { ...staff, id: uid('s'), assignedAt: isoNow().slice(0, 10) }], updatedAt: isoNow().slice(0, 10) }
          : p
      )
    );
    this.logAudit(id, 'Staff assigned', `${staff.name} (${staff.role})`);
  }

  public removeStaff(id: string, staffId: string, reason: string): void {
    this._programs.update(list =>
      list.map(p => (p.id === id ? { ...p, staff: p.staff.filter(s => s.id !== staffId), updatedAt: isoNow().slice(0, 10) } : p))
    );
    this.logAudit(id, 'Staff removed', reason);
  }

  public enrollClient(id: string, enrollment: Omit<IEnrollment, 'id' | 'enrolledAt' | 'complianceRate' | 'checkInRate' | 'riskScore' | 'atRisk'>): void {
    this._programs.update(list =>
      list.map(p =>
        p.id === id
          ? {
              ...p,
              currentEnrollment: p.currentEnrollment + 1,
              enrollments: [
                ...p.enrollments,
                { ...enrollment, id: uid('en'), enrolledAt: isoNow().slice(0, 10), complianceRate: 100, checkInRate: 100, riskScore: 0, atRisk: false }
              ],
              updatedAt: isoNow().slice(0, 10)
            }
          : p
      )
    );
    this.logAudit(id, 'Client enrolled', enrollment.clientName);
  }

  public dischargeClient(id: string, enrollmentId: string, reason: string): void {
    this._programs.update(list =>
      list.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          currentEnrollment: Math.max(0, p.currentEnrollment - 1),
          enrollments: p.enrollments.map(e =>
            e.id === enrollmentId ? { ...e, status: 'Discharged' as const, dischargedAt: isoNow().slice(0, 10), dischargeReason: reason } : e
          ),
          updatedAt: isoNow().slice(0, 10)
        };
      })
    );
    this.logAudit(id, 'Client discharged', reason);
  }

  public updateCheckInConfig(id: string, cfg: ICheckInConfig): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, checkInConfig: cfg, updatedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, 'Check-in configuration updated');
  }

  public updateUaConfig(id: string, cfg: IUAConfig): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, uaConfig: cfg, updatedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, 'UA configuration updated');
  }

  public addComplianceRule(id: string, rule: Omit<IComplianceRule, 'id'>): void {
    this._programs.update(list =>
      list.map(p =>
        p.id === id
          ? { ...p, complianceRules: [...p.complianceRules, { ...rule, id: uid('cr') }], updatedAt: isoNow().slice(0, 10) }
          : p
      )
    );
    this.logAudit(id, 'Compliance rule added', rule.name);
  }

  public deleteComplianceRule(id: string, ruleId: string): void {
    this._programs.update(list =>
      list.map(p => (p.id === id ? { ...p, complianceRules: p.complianceRules.filter(r => r.id !== ruleId), updatedAt: isoNow().slice(0, 10) } : p))
    );
    this.logAudit(id, 'Compliance rule deleted');
  }

  public updatePhases(id: string, phases: IProgramPhase[]): void {
    this._programs.update(list => list.map(p => (p.id === id ? { ...p, phases, updatedAt: isoNow().slice(0, 10) } : p)));
    this.logAudit(id, 'Phases updated', `${phases.length} phase(s)`);
  }

  public auditFor(programId: string): IProgramAuditEntry[] {
    return this._audit().filter(a => a.programId === programId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  private logAudit(programId: string, action: string, details?: string): void {
    const entry: IProgramAuditEntry = {
      id: uid('a'),
      timestamp: isoNow(),
      programId,
      action,
      actor: 'System Administrator',
      details
    };
    this._audit.update(list => [entry, ...list]);
  }
}
