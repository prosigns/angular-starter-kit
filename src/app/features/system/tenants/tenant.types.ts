export type TenantStatus =
  | 'Active'
  | 'Trial'
  | 'PendingActivation'
  | 'Suspended'
  | 'Deactivated'
  | 'Archived';

export type TenantTier = 'Trial' | 'Basic' | 'Professional' | 'Enterprise' | 'Government';

export type BillingStatus = 'Current' | 'Overdue' | 'Grace' | 'N/A';

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  federalTaxId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip?: string;
  status: TenantStatus;
  tier: TenantTier;
  contractTerm?: 'Trial' | 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual';
  autoRenew?: boolean;
  monthlyRate?: number;
  discountPct?: number;
  programs: number;
  users: number;
  maxUsers: number;
  clients: number;
  maxClients: number;
  maxPrograms?: number;
  subscriptionStarts?: string;
  subscriptionEnds: string;
  billingStatus: BillingStatus;
  createdAt: string;
  lastActivity: string;
  notes?: string;
}

export interface ITenantAuditEntry {
  id: string;
  timestamp: string;
  tenantId: string;
  action: string;
  actor: string;
  details?: string;
}

export const TIER_DEFAULTS: Record<TenantTier, { users: number; clients: number; programs: number; rate: number }> = {
  Trial:        { users: 10,  clients: 50,   programs: 2,  rate: 0 },
  Basic:        { users: 25,  clients: 150,  programs: 3,  rate: 349 },
  Professional: { users: 50,  clients: 500,  programs: 6,  rate: 849 },
  Enterprise:   { users: 100, clients: 800,  programs: 15, rate: 1850 },
  Government:   { users: 120, clients: 1200, programs: 20, rate: 2400 }
};

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 128);
}
