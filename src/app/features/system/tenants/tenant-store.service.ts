import { Injectable, computed, signal } from '@angular/core';
import { BillingStatus, ITenant, ITenantAuditEntry, TIER_DEFAULTS, TenantStatus, TenantTier } from './tenant.types';

const TODAY = new Date();

function dateStr(daysFromNow: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

function seed(): ITenant[] {
  return [
    { id: 't-1',  name: 'Grafton County Drug Court',       slug: 'grafton-county-drug-court',  contactName: 'John Smith',     contactEmail: 'john.smith@grafton.gov',  contactPhone: '(603) 555-0101', addressLine1: '123 Court St', city: 'Haverhill',  state: 'NH', zip: '03765', status: 'Active',            tier: 'Professional', autoRenew: true,  monthlyRate: 849,  programs: 4, users: 32, maxUsers: 50,  clients: 187, maxClients: 500, maxPrograms: 6,  subscriptionStarts: dateStr(-90),  subscriptionEnds: dateStr(275),  billingStatus: 'Current', createdAt: dateStr(-400), lastActivity: '2h ago' },
    { id: 't-2',  name: 'Carroll Recovery Housing Inc.',   slug: 'carroll-recovery-housing',   contactName: 'Maria Lopez',    contactEmail: 'maria@carrollrh.org',     contactPhone: '(603) 555-0202', addressLine1: '45 Mountain Rd', city: 'Conway',   state: 'NH', zip: '03818', status: 'Active',            tier: 'Basic',        autoRenew: true,  monthlyRate: 349,  programs: 2, users: 14, maxUsers: 25,  clients: 68,  maxClients: 150, maxPrograms: 3,  subscriptionStarts: dateStr(-185), subscriptionEnds: dateStr(180),  billingStatus: 'Current', createdAt: dateStr(-260), lastActivity: '5h ago' },
    { id: 't-3',  name: 'NH DHHS — Region 1',              slug: 'nh-dhhs-region-1',           contactName: 'Robert Chen',    contactEmail: 'rchen@dhhs.nh.gov',       contactPhone: '(603) 555-0303', addressLine1: '129 Pleasant St', city: 'Concord',  state: 'NH', zip: '03301', status: 'Active',            tier: 'Government',   autoRenew: true,  monthlyRate: 2400, programs: 9, users: 88, maxUsers: 120, clients: 612, maxClients: 1200, maxPrograms: 20, subscriptionStarts: dateStr(-25),  subscriptionEnds: dateStr(340),  billingStatus: 'Current', createdAt: dateStr(-720), lastActivity: '1d ago' },
    { id: 't-4',  name: 'Coös Wellness Collective',        slug: 'coos-wellness-collective',   contactName: 'Priya Patel',    contactEmail: 'priya@cooswell.org',      contactPhone: '(603) 555-0404', addressLine1: '12 Main St', city: 'Berlin',     state: 'NH', zip: '03570', status: 'Trial',             tier: 'Trial',        autoRenew: false, monthlyRate: 0,    programs: 1, users: 6,  maxUsers: 10,  clients: 22,  maxClients: 50,  maxPrograms: 2,  subscriptionStarts: dateStr(-18),  subscriptionEnds: dateStr(12),   billingStatus: 'N/A',     createdAt: dateStr(-18),  lastActivity: '30m ago' },
    { id: 't-5',  name: 'St. Mary\u2019s Treatment Center',     slug: 'st-marys-treatment-center',  contactName: 'David Brooks',   contactEmail: 'david.brooks@stmarys.com',contactPhone: '(603) 555-0505', addressLine1: '890 Elm St', city: 'Manchester', state: 'NH', zip: '03101', status: 'Active',            tier: 'Enterprise',   autoRenew: true,  monthlyRate: 1850, programs: 6, users: 58, maxUsers: 100, clients: 342, maxClients: 800, maxPrograms: 15, subscriptionStarts: dateStr(-140), subscriptionEnds: dateStr(410),  billingStatus: 'Current', createdAt: dateStr(-510), lastActivity: '3h ago' },
    { id: 't-6',  name: 'Rockingham MAT Clinic',           slug: 'rockingham-mat-clinic',      contactName: 'Aisha Green',    contactEmail: 'aisha@rockmat.org',       contactPhone: '(603) 555-0606', addressLine1: '55 Water St', city: 'Exeter',    state: 'NH', zip: '03833', status: 'Active',            tier: 'Professional', autoRenew: true,  monthlyRate: 849,  programs: 3, users: 22, maxUsers: 50,  clients: 148, maxClients: 500, maxPrograms: 6,  subscriptionStarts: dateStr(-315), subscriptionEnds: dateStr(52),   billingStatus: 'Overdue', createdAt: dateStr(-340), lastActivity: '1h ago' },
    { id: 't-7',  name: 'Merrimack Probation Services',    slug: 'merrimack-probation',        contactName: 'Tom Nguyen',     contactEmail: 'tom.n@merrimack.gov',     contactPhone: '(603) 555-0707', addressLine1: '8 Legal Blvd', city: 'Concord',  state: 'NH', zip: '03301', status: 'Suspended',         tier: 'Government',   autoRenew: false, monthlyRate: 2400, programs: 4, users: 0,  maxUsers: 80,  clients: 0,   maxClients: 600, maxPrograms: 12, subscriptionStarts: dateStr(-588), subscriptionEnds: dateStr(-8),   billingStatus: 'Overdue', createdAt: dateStr(-620), lastActivity: '14d ago' },
    { id: 't-8',  name: 'Seacoast Case Management',        slug: 'seacoast-case-management',   contactName: 'Elena Roberts',  contactEmail: 'elena@seacoastcm.com',    contactPhone: '(603) 555-0808', addressLine1: '220 Harbor Pl', city: 'Portsmouth', state: 'NH', zip: '03801', status: 'Active',            tier: 'Basic',        autoRenew: true,  monthlyRate: 349,  programs: 2, users: 11, maxUsers: 25,  clients: 74,  maxClients: 150, maxPrograms: 3,  subscriptionStarts: dateStr(-220), subscriptionEnds: dateStr(145),  billingStatus: 'Current', createdAt: dateStr(-210), lastActivity: '6h ago' },
    { id: 't-9',  name: 'Hillsborough SUD Partners',       slug: 'hillsborough-sud-partners',  contactName: 'Jacob Reyes',    contactEmail: 'jreyes@hillsud.org',      contactPhone: '(603) 555-0909', addressLine1: '17 Amherst St', city: 'Nashua',   state: 'NH', zip: '03060', status: 'PendingActivation', tier: 'Professional', autoRenew: true,  monthlyRate: 849,  programs: 0, users: 0,  maxUsers: 50,  clients: 0,   maxClients: 500, maxPrograms: 6,  subscriptionStarts: dateStr(0),    subscriptionEnds: dateStr(365),  billingStatus: 'Current', createdAt: dateStr(-4),   lastActivity: '—' },
    { id: 't-10', name: 'White Mountain Outpatient',       slug: 'white-mountain-outpatient',  contactName: 'Hannah Torres',  contactEmail: 'hannah@wmoutpatient.com', contactPhone: '(603) 555-1010', addressLine1: '5 Clay St', city: 'Littleton',  state: 'NH', zip: '03561', status: 'Trial',             tier: 'Trial',        autoRenew: false, monthlyRate: 0,    programs: 1, users: 4,  maxUsers: 10,  clients: 12,  maxClients: 50,  maxPrograms: 2,  subscriptionStarts: dateStr(-26),  subscriptionEnds: dateStr(4),    billingStatus: 'N/A',     createdAt: dateStr(-26),  lastActivity: '45m ago' },
    { id: 't-11', name: 'Cheshire Recovery Housing',       slug: 'cheshire-recovery-housing',  contactName: 'Michael Young',  contactEmail: 'myoung@cheshirerh.org',   contactPhone: '(603) 555-1111', addressLine1: '99 Central Sq', city: 'Keene',    state: 'NH', zip: '03431', status: 'Active',            tier: 'Basic',        autoRenew: true,  monthlyRate: 349,  programs: 2, users: 18, maxUsers: 25,  clients: 128, maxClients: 150, maxPrograms: 3,  subscriptionStarts: dateStr(-275), subscriptionEnds: dateStr(90),   billingStatus: 'Grace',   createdAt: dateStr(-180), lastActivity: '4h ago' },
    { id: 't-12', name: 'Strafford Behavioral Health',     slug: 'strafford-behavioral',       contactName: 'Olivia Park',    contactEmail: 'olivia@straffordbh.org',  contactPhone: '(603) 555-1212', addressLine1: '60 Main St', city: 'Dover',      state: 'NH', zip: '03820', status: 'Active',            tier: 'Enterprise',   autoRenew: true,  monthlyRate: 1850, programs: 5, users: 44, maxUsers: 100, clients: 276, maxClients: 800, maxPrograms: 15, subscriptionStarts: dateStr(-95),  subscriptionEnds: dateStr(220),  billingStatus: 'Current', createdAt: dateStr(-460), lastActivity: '2d ago' },
    { id: 't-13', name: 'Belknap CBO Network',             slug: 'belknap-cbo-network',        contactName: 'Noah Williams',  contactEmail: 'noah@belknapcbo.org',     contactPhone: '(603) 555-1313', addressLine1: '33 Union Ave', city: 'Laconia',  state: 'NH', zip: '03246', status: 'Deactivated',       tier: 'Basic',        autoRenew: false, monthlyRate: 349,  programs: 2, users: 0,  maxUsers: 25,  clients: 0,   maxClients: 150, maxPrograms: 3,  subscriptionStarts: dateStr(-815), subscriptionEnds: dateStr(-45),  billingStatus: 'N/A',     createdAt: dateStr(-830), lastActivity: '60d ago' }
  ];
}

export interface IImpersonationState {
  tenantId: string;
  startedAt: string;
  durationMinutes: number;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class TenantStoreService {
  private readonly _tenants = signal<ITenant[]>(seed());
  private readonly _audit = signal<ITenantAuditEntry[]>([]);
  private readonly _impersonation = signal<IImpersonationState | null>(null);

  public readonly tenants = this._tenants.asReadonly();
  public readonly audit = this._audit.asReadonly();
  public readonly impersonation = this._impersonation.asReadonly();

  public readonly getById = (id: string) => computed(() => this._tenants().find(t => t.id === id));

  public isSlugAvailable(slug: string, ignoreId?: string): boolean {
    return !this._tenants().some(t => t.slug === slug && t.id !== ignoreId);
  }

  public create(input: Partial<ITenant> & { name: string; slug: string; contactName: string; contactEmail: string; city: string; state: string; tier: TenantTier }): ITenant {
    const defaults = TIER_DEFAULTS[input.tier];
    const id = 't-' + Date.now().toString(36);
    const trial = input.tier === 'Trial';
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + (trial ? 30 : 365));
    const tenant: ITenant = {
      id,
      name: input.name,
      slug: input.slug,
      federalTaxId: input.federalTaxId,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      zip: input.zip,
      status: 'PendingActivation',
      tier: input.tier,
      contractTerm: input.contractTerm ?? (trial ? 'Trial' : 'Annual'),
      autoRenew: input.autoRenew ?? !trial,
      monthlyRate: input.monthlyRate ?? defaults.rate,
      discountPct: input.discountPct ?? 0,
      programs: 0,
      users: 0,
      maxUsers: input.maxUsers ?? defaults.users,
      clients: 0,
      maxClients: input.maxClients ?? defaults.clients,
      maxPrograms: input.maxPrograms ?? defaults.programs,
      subscriptionStarts: input.subscriptionStarts ?? now.toISOString().slice(0, 10),
      subscriptionEnds: input.subscriptionEnds ?? end.toISOString().slice(0, 10),
      billingStatus: trial ? 'N/A' : 'Current',
      createdAt: now.toISOString().slice(0, 10),
      lastActivity: '—',
      notes: input.notes
    };
    this._tenants.update(list => [tenant, ...list]);
    this.logAudit(id, 'Tenant created', `Created ${tenant.name} (${tenant.slug})`);
    return tenant;
  }

  public update(id: string, patch: Partial<ITenant>): void {
    this._tenants.update(list => list.map(t => (t.id === id ? { ...t, ...patch } : t)));
    this.logAudit(id, 'Tenant updated', Object.keys(patch).join(', '));
  }

  public activate(id: string, notes?: string): void {
    const t = this._tenants().find(x => x.id === id);
    if (!t) return;
    this._tenants.update(list =>
      list.map(x => (x.id === id ? { ...x, status: 'Active' as TenantStatus, billingStatus: x.tier === 'Trial' ? 'N/A' as BillingStatus : x.billingStatus } : x))
    );
    this.logAudit(id, 'Tenant activated', notes);
  }

  public suspend(id: string, reason: string, type: 'Temporary' | 'Indefinite', reinstateDate?: string): void {
    this._tenants.update(list => list.map(t => (t.id === id ? { ...t, status: 'Suspended' as TenantStatus } : t)));
    this.logAudit(id, `Tenant suspended (${type})`, reinstateDate ? `${reason} — reinstate ${reinstateDate}` : reason);
  }

  public deactivate(id: string, reason: string): void {
    this._tenants.update(list => list.map(t => (t.id === id ? { ...t, status: 'Deactivated' as TenantStatus, autoRenew: false } : t)));
    this.logAudit(id, 'Tenant deactivated', reason);
  }

  public softDelete(id: string, reason: string): void {
    this._tenants.update(list => list.map(t => (t.id === id ? { ...t, status: 'Archived' as TenantStatus } : t)));
    this.logAudit(id, 'Tenant archived (soft delete)', reason);
  }

  public startImpersonation(tenantId: string, durationMinutes: number, reason: string): void {
    this._impersonation.set({ tenantId, durationMinutes, reason, startedAt: isoNow() });
    this.logAudit(tenantId, `Impersonation started (${durationMinutes}m)`, reason);
  }

  public endImpersonation(): void {
    const state = this._impersonation();
    if (state) this.logAudit(state.tenantId, 'Impersonation ended');
    this._impersonation.set(null);
  }

  public extendTrial(id: string, days: number): void {
    this._tenants.update(list =>
      list.map(t => {
        if (t.id !== id) return t;
        const d = new Date(t.subscriptionEnds);
        d.setDate(d.getDate() + days);
        return { ...t, subscriptionEnds: d.toISOString().slice(0, 10) };
      })
    );
    this.logAudit(id, `Trial extended by ${days} days`);
  }

  public auditFor(tenantId: string): ITenantAuditEntry[] {
    return this._audit().filter(a => a.tenantId === tenantId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  private logAudit(tenantId: string, action: string, details?: string): void {
    const entry: ITenantAuditEntry = {
      id: 'a-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: isoNow(),
      tenantId,
      action,
      actor: 'System Administrator',
      details
    };
    this._audit.update(list => [entry, ...list]);
  }
}
