# BPDS CareTrack™ — Subscription Lifecycle (Complete)

**Document:** Subscription Lifecycle — Full Process Specification
**Role:** System Administrator (Super Admin)
**Platform:** Web Admin Panel (Angular 18+)
**Version:** 1.0
**Last Updated:** April 22, 2026

---

## Table of Contents

1. [Subscription State Machine](#1-subscription-state-machine)
2. [State Definitions](#2-state-definitions)
3. [Lifecycle Phase 1: Creation](#3-lifecycle-phase-1-creation)
4. [Lifecycle Phase 2: Trial](#4-lifecycle-phase-2-trial)
5. [Lifecycle Phase 3: Activation](#5-lifecycle-phase-3-activation)
6. [Lifecycle Phase 4: Active Operations](#6-lifecycle-phase-4-active-operations)
7. [Lifecycle Phase 5: Edit & Amendment](#7-lifecycle-phase-5-edit--amendment)
8. [Lifecycle Phase 6: Upgrade & Downgrade](#8-lifecycle-phase-6-upgrade--downgrade)
9. [Lifecycle Phase 7: Renewal](#9-lifecycle-phase-7-renewal)
10. [Lifecycle Phase 8: Payment Management](#10-lifecycle-phase-8-payment-management)
11. [Lifecycle Phase 9: Invoicing & Billing](#11-lifecycle-phase-9-invoicing--billing)
12. [Lifecycle Phase 10: Proration](#12-lifecycle-phase-10-proration)
13. [Lifecycle Phase 11: Discounts & Credits](#13-lifecycle-phase-11-discounts--credits)
14. [Lifecycle Phase 12: Pause](#14-lifecycle-phase-12-pause)
15. [Lifecycle Phase 13: Suspension](#15-lifecycle-phase-13-suspension)
16. [Lifecycle Phase 14: Reactivation](#16-lifecycle-phase-14-reactivation)
17. [Lifecycle Phase 15: Cancellation](#17-lifecycle-phase-15-cancellation)
18. [Lifecycle Phase 16: Refunds](#18-lifecycle-phase-16-refunds)
19. [Lifecycle Phase 17: Expiration & Grace Period](#19-lifecycle-phase-17-expiration--grace-period)
20. [Lifecycle Phase 18: Archival & Data Retention](#20-lifecycle-phase-18-archival--data-retention)
21. [Lifecycle Phase 19: Deletion](#21-lifecycle-phase-19-deletion)
22. [Payment Failed Flows](#22-payment-failed-flows)
23. [Notification Matrix](#23-notification-matrix)
24. [Audit Trail Requirements](#24-audit-trail-requirements)
25. [Database Entities](#25-database-entities)
26. [API Endpoints](#26-api-endpoints)
27. [Business Rules Master List](#27-business-rules-master-list)
28. [Edge Cases & Exception Handling](#28-edge-cases--exception-handling)

---

## 1. Subscription State Machine

```
                          ┌─────────────┐
                          │   DRAFT     │
                          └──────┬──────┘
                                 │ Activate / Start Trial
                                 ▼
              ┌─────────────────────────────────────┐
              │                                     │
              ▼                                     ▼
      ┌──────────────┐                     ┌──────────────┐
      │    TRIAL     │────── Convert ─────▶│    ACTIVE    │
      └──────┬───────┘                     └──┬───┬───┬───┘
             │                                │   │   │
             │ Expire                  Pause ─┘   │   │
             ▼                                    │   │
      ┌──────────────┐    ┌──────────────┐        │   │
      │ TRIAL_EXPIRED│    │   PAUSED     │◀───────┘   │
      └──────┬───────┘    └──────┬───────┘            │
             │                   │ Resume              │
             │                   ▼                     │
             │            ┌──────────────┐             │
             │            │    ACTIVE    │             │
             │            └──────────────┘             │
             │                                         │
             │         Suspend ────────────────────────┘
             │                                    │
             │                                    ▼
             │                           ┌──────────────┐
             │                           │  SUSPENDED   │
             │                           └──────┬───────┘
             │                                  │
             │              Reactivate ─────────┤
             │                                  │
             │              Deactivate ─────────┤
             │                                  ▼
             │                           ┌──────────────┐
             ├──── Convert ────────────▶ │    ACTIVE    │
             │                           └──────────────┘
             │
             ▼
      ┌──────────────┐         ┌──────────────┐
      │  CANCELLED   │◀────────│   ACTIVE     │
      └──────┬───────┘  Cancel └──────────────┘
             │                        │
             │                        │ Expire (no renew)
             │                        ▼
             │                 ┌──────────────┐
             │                 │   EXPIRED    │
             │                 └──────┬───────┘
             │                        │
             │                        │ Grace period ends
             │                        ▼
             │                 ┌──────────────┐
             │                 │ GRACE_PERIOD │
             │                 └──────┬───────┘
             │                        │
             │                        │ Grace expires
             ▼                        ▼
      ┌──────────────┐         ┌──────────────┐
      │ DEACTIVATED  │◀────────│  SUSPENDED   │
      └──────┬───────┘         └──────────────┘
             │
             │ Archive (after retention period)
             ▼
      ┌──────────────┐
      │  ARCHIVED    │
      └──────────────┘
```

### Valid State Transitions

| From             | To               | Trigger                    | Requires Approval |
|------------------|------------------|----------------------------|:-----------------:|
| Draft            | Trial            | Start trial                | No                |
| Draft            | Active           | Activate with payment      | No                |
| Trial            | Active           | Trial conversion + payment | No                |
| Trial            | Trial Expired    | Trial end date reached     | Auto              |
| Trial Expired    | Active           | Late conversion + payment  | No                |
| Trial Expired    | Deactivated      | No conversion after 30d    | Auto              |
| Active           | Paused           | Admin pauses billing       | Yes               |
| Active           | Suspended        | Admin suspends             | Yes               |
| Active           | Expired          | End date reached, no renew | Auto              |
| Active           | Cancelled        | Admin cancels              | Yes (double)      |
| Paused           | Active           | Admin resumes              | No                |
| Paused           | Cancelled        | Admin cancels while paused | Yes (double)      |
| Suspended        | Active           | Admin reactivates          | Yes               |
| Suspended        | Deactivated      | Admin deactivates          | Yes (double)      |
| Expired          | Grace Period     | Auto (immediate)           | Auto              |
| Grace Period     | Active           | Payment received           | No                |
| Grace Period     | Suspended        | Grace period ends          | Auto              |
| Cancelled        | Deactivated      | After data export window   | Auto              |
| Deactivated      | Archived         | After retention period     | Auto              |

### Invalid State Transitions (Hard Blocked)

| From          | To          | Reason                                          |
|---------------|-------------|--------------------------------------------------|
| Archived      | Any         | Terminal state — no resurrection                 |
| Deactivated   | Active      | Must create new subscription                     |
| Cancelled     | Active      | Must create new subscription                     |
| Trial         | Paused      | Trials cannot be paused                          |
| Trial         | Suspended   | Trials are expired, not suspended                |
| Draft         | Suspended   | Never activated — just delete                    |
| Draft         | Cancelled   | Never activated — just delete                    |

---

## 2. State Definitions

| State          | Description                                          | User Access | Billing     | Data        |
|----------------|------------------------------------------------------|:-----------:|:-----------:|:-----------:|
| Draft          | Subscription created but not yet activated            | None        | None        | Config only |
| Trial          | Free evaluation period, limited features/capacity     | Full (limited) | None     | Active      |
| Trial Expired  | Trial ended without conversion                        | Blocked     | None        | Preserved   |
| Active         | Paid subscription in good standing                    | Full        | Active      | Active      |
| Paused         | Billing temporarily frozen, access maintained         | Full        | Frozen      | Active      |
| Suspended      | Access blocked due to admin action or payment failure | Blocked     | Frozen      | Preserved   |
| Expired        | Subscription end date reached without renewal         | Limited     | Stopped     | Preserved   |
| Grace Period   | Post-expiration window to renew before suspension     | Limited     | Retry       | Preserved   |
| Cancelled      | Voluntarily terminated by admin                       | Blocked     | Stopped     | Export window |
| Deactivated    | Permanently disabled, awaiting data retention expiry  | Blocked     | None        | Retention   |
| Archived       | Data retention expired, records minimized             | Blocked     | None        | Purged/minimal |

### "Limited" Access Definition

During Expired and Grace Period states, tenant users have:
- Read-only access to existing data
- No new check-ins, messages, or document uploads
- Dashboard visible with "Subscription expired" banner
- Admin can still export data
- All write APIs return 403 with `subscription_expired` error code

---

## 3. Lifecycle Phase 1: Creation

### Route
`/admin/tenants/subscriptions/new`

### Process Flow

```
Admin clicks [+ New Subscription]
         │
         ▼
┌─────────────────────────┐
│ Step 1: Select Tenant   │ ── Searchable dropdown (tenants without active subscription)
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 2: Choose Tier     │ ── Radio cards with feature comparison
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 3: Configure Term  │ ── Duration, start date, auto-renew
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 4: Set Pricing     │ ── Rate, discount, final calculation
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 5: Set Limits      │ ── Users, clients, programs, storage
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 6: Payment Method  │ ── Add card / invoice / PO number (skip for trial)
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 7: Review & Confirm│ ── Summary + internal notes
└────────────┬────────────┘
             │
      ┌──────┴──────┐
      ▼              ▼
[Save as Draft]  [Create & Activate]
```

### Step 2: Tier Selection — Feature Comparison Card

| Feature                    | Trial | Basic | Professional | Enterprise | Government |
|----------------------------|:-----:|:-----:|:------------:|:----------:|:----------:|
| Monthly Rate               | $0    | $500  | $1,500       | $3,500     | Custom     |
| Max Users                  | 10    | 25    | 50           | 150        | Custom     |
| Max Clients                | 25    | 100   | 500          | 2,000      | Custom     |
| Max Programs               | 2     | 3     | 10           | 25         | Custom     |
| Storage (GB)               | 5     | 25    | 50           | 200        | Custom     |
| Check-In Module            | ✅    | ✅    | ✅           | ✅         | ✅         |
| Appointment Module         | ✅    | ✅    | ✅           | ✅         | ✅         |
| Compliance Module          | ✅    | ✅    | ✅           | ✅         | ✅         |
| Document Management        | Basic | ✅    | ✅           | ✅         | ✅         |
| Secure Messaging           | ❌    | ✅    | ✅           | ✅         | ✅         |
| Housing Module             | ❌    | ❌    | ✅           | ✅         | ✅         |
| Drug Court Module          | ❌    | ❌    | ✅           | ✅         | ✅         |
| Custom Reports             | ❌    | ❌    | ✅           | ✅         | ✅         |
| State/DHHS Reporting       | ❌    | ❌    | ❌           | ✅         | ✅         |
| Lab Integration (Phase 2)  | ❌    | ❌    | ❌           | ✅         | ✅         |
| API Access                 | ❌    | ❌    | ❌           | ✅         | ✅         |
| Custom Branding            | ❌    | ❌    | ✅           | ✅         | ✅         |
| Custom Domain              | ❌    | ❌    | ❌           | ✅         | ✅         |
| Dedicated Support          | ❌    | ❌    | ❌           | ✅         | ✅         |
| SLA Guarantee              | ❌    | 99.5% | 99.9%        | 99.95%     | 99.99%     |
| Data Export                | ❌    | CSV   | CSV + JSON   | CSV + JSON + API | Full |
| Audit Trail Retention      | 30d   | 90d   | 1 year       | 3 years    | 7 years    |
| Support Hours              | ❌    | Business | Business + Priority | 24/7 | 24/7 |

### Step 3: Contract Term Options

| Term          | Duration  | Billing Frequency | Discount Off Monthly | Auto-Renew Default |
|---------------|-----------|-------------------|:--------------------:|:------------------:|
| Trial         | 30 days   | None              | N/A                  | Off                |
| Monthly       | 1 month   | Monthly           | 0%                   | On                 |
| Quarterly     | 3 months  | Quarterly         | 5%                   | On                 |
| Semi-Annual   | 6 months  | Semi-annually     | 10%                  | On                 |
| Annual        | 12 months | Annually          | 15%                  | On                 |
| Multi-Year    | 24 months | Annually          | 20%                  | On                 |
| Custom        | Custom    | Custom            | Custom               | Custom             |

### Step 6: Payment Method Options

| Method                | Detail                                              | Available For     |
|-----------------------|-----------------------------------------------------|-------------------|
| Credit/Debit Card     | Stripe integration — card on file                   | All paid tiers    |
| ACH Bank Transfer     | Direct bank debit                                   | Enterprise, Gov   |
| Invoice / Net 30      | Manual invoice, payment within 30 days              | Enterprise, Gov   |
| Purchase Order        | State PO number on file                             | Government only   |
| Wire Transfer         | Manual wire with reference number                   | Enterprise, Gov   |
| Skip (Trial)          | No payment required                                 | Trial only        |

### Creation Validation Rules

| Rule                                        | Validation                                    |
|---------------------------------------------|-----------------------------------------------|
| Tenant must not have active subscription    | Check: no existing record with status in (Trial, Active, Paused, Grace Period) |
| Start date cannot be in the past            | `start_date >= today`                         |
| End date must be after start date           | `end_date > start_date`                       |
| Monthly rate required for paid tiers        | `rate > 0` when tier != Trial                 |
| Discount cannot exceed 50% without override | `discount <= 50` OR SysAdmin override flag    |
| Limits must meet tier minimums              | Each limit >= tier minimum                    |
| Payment method required for non-trial       | Must have valid payment method on file        |
| Government tier requires PO or invoice      | Payment method must be PO or Invoice          |

### Post-Creation Actions

| Action                                  | Timing      | Condition                |
|-----------------------------------------|-------------|--------------------------|
| Create subscription record              | Immediate   | Always                   |
| Set tenant status to Active/Trial       | Immediate   | Based on tier            |
| Enable feature flags per tier           | Immediate   | Always                   |
| Generate first invoice                  | Immediate   | Paid tiers only          |
| Charge payment method                   | Immediate   | Card/ACH only            |
| Send welcome email to tenant admin      | Immediate   | If toggle on             |
| Create audit log entry                  | Immediate   | Always                   |
| Schedule renewal reminder               | Deferred    | 30d before end date      |
| Schedule trial expiration job           | Deferred    | Trial only               |

---

## 4. Lifecycle Phase 2: Trial

### Trial Configuration

| Setting                    | Default  | Configurable | Max        |
|----------------------------|----------|:------------:|------------|
| Trial Duration             | 30 days  | Yes          | 90 days    |
| Trial Extensions Allowed   | 2        | Yes          | 3          |
| Max Extension Per Request  | 30 days  | Yes          | 30 days    |
| Total Max Trial Duration   | 90 days  | Yes          | 90 days    |
| Trial Per Tenant Limit     | 1        | No           | 1          |
| Feature Restrictions       | Per tier table above | No | —        |

### Trial Timeline

```
Day 0          Day 20          Day 23        Day 27      Day 29     Day 30
  │               │               │             │           │          │
  ▼               ▼               ▼             ▼           ▼          ▼
Trial          Reminder 1     Reminder 2    Reminder 3   Final      Trial
Starts         (10d left)     (7d left)     (3d left)    Warning    Expires
                                                         (1d left)
```

### Trial Extension Process

**Route:** Row action → Extend Trial

| Field                | Detail                                              |
|----------------------|-----------------------------------------------------|
| Current Trial End    | Display only                                        |
| Extensions Used      | "1 of 2 extensions used"                            |
| Extension Duration   | Dropdown: 7, 14, 30 days, Custom                   |
| New Trial End        | Calculated                                          |
| Total Trial Duration | Calculated: "Will be 52 of 90 max days"            |
| Reason               | Required dropdown: Evaluation In Progress, Decision Pending, Stakeholder Review, Technical Setup, Budget Approval, Other |
| Notes                | Textarea                                            |
| Warning (if near max)| "After this extension, 1 extension remains. Max trial duration is 90 days." |
| Block (if at max)    | "Maximum trial duration (90 days) reached. Trial cannot be extended further. Convert to paid subscription or allow expiration." |

### Trial Conversion Process

**Route:** Row action → Convert to Paid OR auto-prompt in trial expiration flow

```
Admin clicks "Convert to Paid"
         │
         ▼
┌─────────────────────────┐
│ Select Target Tier      │ ── Radio cards (Basic, Professional, Enterprise, Government)
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Configure Term          │ ── Monthly, Quarterly, Semi-Annual, Annual
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Set Pricing             │ ── Rate auto-filled, discount optional
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Payment Method          │ ── Add card / invoice / PO
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Confirm Conversion      │ ── Summary + effective date
└────────────┬────────────┘
             │
             ▼
     Subscription Active
     (seamless transition — no data loss, no downtime)
```

### Conversion Rules

| Rule                                        | Logic                                        |
|---------------------------------------------|-----------------------------------------------|
| Data preserved                              | All trial data carries over to paid           |
| No service interruption                     | Transition is seamless                        |
| Effective date                              | Immediate or scheduled (admin choice)         |
| Feature unlock                              | Features per new tier enabled immediately     |
| Limits updated                              | Capacity increased per new tier               |
| First invoice generated                     | Based on new tier rate                        |
| Trial record preserved                      | Marked as converted, linked to new subscription |
| Conversion after expiration                 | Allowed within 30 days of trial expiration    |

### Trial Expiration Process (Automated)

```
Trial end date reached
         │
         ▼
┌─────────────────────────────┐
│ Status → Trial Expired      │
│ User access → Blocked       │
│ Data → Preserved            │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Send expiration email       │ ── To tenant admin + SysAdmin
│ Include: convert link,      │
│ data export option,         │
│ 30-day conversion window    │
└────────────┬────────────────┘
             │
             │  30 days pass without conversion
             ▼
┌─────────────────────────────┐
│ Status → Deactivated        │
│ Send final notice            │
│ Data retention timer starts  │
└─────────────────────────────┘
```

---

## 5. Lifecycle Phase 3: Activation

### First-Time Activation (from Draft)

| Prerequisite                     | Validation                              |
|----------------------------------|-----------------------------------------|
| Tenant record exists             | `tenant_id` valid                       |
| Subscription configured          | Tier, term, pricing set                 |
| Payment method on file           | Valid for paid tiers                    |
| Primary contact verified         | Email confirmed                         |
| At least one program configured  | Minimum 1 program exists                |
| Feature flags set per tier       | Auto-configured on activation           |

### Activation Effects

| Action                           | Timing                                  |
|----------------------------------|-----------------------------------------|
| Subscription status → Active     | Immediate                               |
| Tenant status → Active           | Immediate                               |
| User logins enabled              | Immediate                               |
| Feature flags activated          | Immediate                               |
| First invoice generated          | Immediate (paid) / Skipped (trial)      |
| Payment charged                  | Immediate (card/ACH) / Deferred (invoice/PO) |
| Welcome email sent               | Immediate                               |
| Renewal scheduler activated      | Deferred (set for end date - 30d)       |
| Audit log created                | Immediate                               |

---

## 6. Lifecycle Phase 4: Active Operations

### Active Subscription Dashboard (Tenant Detail → Subscription Tab)

| Section                    | Content                                           |
|----------------------------|---------------------------------------------------|
| Subscription Header        | Tier badge, status badge, rate, term, dates       |
| Usage Gauges               | Users, Clients, Programs, Storage — circular gauges |
| Billing Summary            | Next payment date, amount, method, outstanding balance |
| Payment History (last 5)   | Quick view with "View All" link                   |
| Upcoming Events            | Next renewal, next invoice, expiring discounts    |
| Quick Actions              | Upgrade, Adjust Limits, Pause, Edit, View Invoices |

### Active State Monitoring (Automated)

| Monitor                    | Threshold    | Action                                  |
|----------------------------|--------------|-----------------------------------------|
| User limit approaching     | 85%          | In-app alert to tenant admin            |
| User limit critical        | 95%          | Email to tenant admin + SysAdmin        |
| User limit exceeded        | 100%         | Block new user creation, alert both     |
| Client limit approaching   | 85%          | In-app alert to tenant admin            |
| Client limit critical      | 95%          | Email to tenant admin + SysAdmin        |
| Client limit exceeded      | 100%         | Block new enrollments, alert both       |
| Storage approaching        | 85%          | In-app alert                            |
| Storage exceeded           | 100%         | Block uploads, alert both               |
| Subscription expiring      | 30, 14, 7, 1d | Renewal reminders                     |
| Payment due                | 7, 3, 1d before | Payment reminders                    |
| Payment overdue            | 1, 3, 7d after | Escalating notifications              |

---

## 7. Lifecycle Phase 5: Edit & Amendment

### Route
`/admin/tenants/subscriptions/:id/edit`

### Editable Fields (Active Subscription)

| Field                  | Editable | Condition                    | Requires Re-approval |
|------------------------|:--------:|------------------------------|:--------------------:|
| Monthly Rate           | Yes      | Takes effect next billing    | No                   |
| Discount %             | Yes      | > 50% requires override      | Yes (> 50%)          |
| Discount Expiration    | Yes      | New field — when discount ends| No                  |
| Auto-Renew             | Yes      | Toggle on/off                | No                   |
| Contract Term          | Yes      | Creates amendment record     | Yes                  |
| End Date               | Yes      | Extension only (no shortening without cancel) | Yes   |
| Max Users              | Yes      | Cannot go below current usage| No                   |
| Max Clients            | Yes      | Cannot go below current usage| No                   |
| Max Programs           | Yes      | Cannot go below current usage| No                   |
| Max Storage            | Yes      | Cannot go below current usage| No                   |
| Payment Method         | Yes      | Update/replace anytime       | No                   |
| Billing Contact        | Yes      | Different from primary contact| No                  |
| PO Number              | Yes      | Government tier              | No                   |
| Internal Notes         | Yes      | Admin-only                   | No                   |

### Non-Editable Fields (Locked After Activation)

| Field                  | Reason                                            |
|------------------------|---------------------------------------------------|
| Tenant                 | Cannot reassign subscription to different tenant  |
| Start Date             | Historical record — cannot be retroactively changed |
| Subscription Tier      | Use Upgrade/Downgrade flow instead                |
| Subscription ID        | System-generated, immutable                       |

### Contract Amendment Process

**Trigger:** When editing contract term or end date

```
Admin modifies contract term or end date
         │
         ▼
┌──────────────────────────────┐
│ Amendment Modal              │
│                              │
│ Change Summary:              │
│ Term: Annual → Multi-Year    │
│ End: Jan 2027 → Jan 2028    │
│ Rate Impact: -20% discount   │
│                              │
│ Reason: [Dropdown + Text]    │
│                              │
│ ☐ Tenant admin has agreed    │
│ ☐ Updated PO/contract on file│
│                              │
│ [Generate Amendment PDF]     │
│ [Cancel] [Confirm Amendment] │
└──────────────────────────────┘
```

### Amendment Record

| Field               | Detail                                              |
|---------------------|-----------------------------------------------------|
| Amendment ID        | Auto-generated                                      |
| Subscription ID     | FK to subscription                                  |
| Amendment Type      | Term Change, Rate Adjustment, Limit Change, Other   |
| Previous Value      | JSON of changed fields (before)                     |
| New Value           | JSON of changed fields (after)                      |
| Effective Date      | When amendment takes effect                         |
| Approved By         | SysAdmin who approved                               |
| Tenant Acknowledged | Boolean + timestamp                                 |
| Amendment Document  | PDF attachment (optional)                           |
| Notes               | Free text                                           |
| Created At          | Timestamp                                           |

### Edit Audit Trail

Every edit creates an immutable audit record with:
- Field-level diff (old value → new value)
- Who made the change
- When
- IP address
- Reason / justification
- Whether it required approval
- Approval chain (if applicable)

---

## 8. Lifecycle Phase 6: Upgrade & Downgrade

### Upgrade Process

```
Admin selects "Upgrade Tier"
         │
         ▼
┌──────────────────────────────────────────┐
│ Upgrade Modal                            │
│                                          │
│ Current: Professional ($1,500/mo)        │
│                                          │
│ Upgrade to:                              │
│ ○ Enterprise ($3,500/mo)                 │
│ ○ Government (Custom)                    │
│                                          │
│ Effective: ○ Immediately                 │
│            ○ Next Billing Cycle          │
│                                          │
│ ─────────────────────────────────────── │
│ PRORATION CALCULATION (if immediate):    │
│                                          │
│ Days remaining in current cycle: 18      │
│ Daily rate (old): $50.00                 │
│ Daily rate (new): $116.67               │
│ Credit for unused days: -$900.00         │
│ Charge for new rate (18d): +$2,100.06    │
│ ─────────────────────────────────────── │
│ Amount due today: $1,200.06              │
│ Next full billing: $3,500.00 on [date]   │
│                                          │
│ Limits updated:                          │
│ Users: 50 → 150                          │
│ Clients: 500 → 2,000                     │
│ Programs: 10 → 25                        │
│ Storage: 50GB → 200GB                    │
│                                          │
│ New features enabled:                    │
│ ✅ State/DHHS Reporting                  │
│ ✅ Lab Integration                       │
│ ✅ API Access                            │
│ ✅ Custom Domain                         │
│ ✅ Dedicated Support                     │
│                                          │
│ Reason: [Dropdown]                       │
│ Notes: [Textarea]                        │
│                                          │
│ [Cancel] [Confirm Upgrade]               │
└──────────────────────────────────────────┘
```

### Upgrade Effects

| Action                           | Timing                                  |
|----------------------------------|-----------------------------------------|
| Tier updated                     | Per effective date selection             |
| New limits applied               | Immediate                               |
| New feature flags enabled        | Immediate                               |
| Proration calculated             | Immediate (if immediate effective)       |
| Invoice generated                | Immediate (proration amount)             |
| Payment charged                  | Immediate (card/ACH) or added to next invoice |
| Notification to tenant admin     | Immediate                               |
| Audit log                        | Immediate                               |
| Old tier features                | Retained (upgrade only adds)             |

### Downgrade Process

```
Admin selects "Downgrade Tier"
         │
         ▼
┌──────────────────────────────────────────┐
│ Downgrade Modal                          │
│                                          │
│ Current: Enterprise ($3,500/mo)          │
│                                          │
│ Downgrade to:                            │
│ ○ Professional ($1,500/mo)               │
│ ○ Basic ($500/mo)                        │
│                                          │
│ Effective: ○ Next Billing Cycle (Recommended) │
│            ○ Immediately                 │
│                                          │
│ ─────────────────────────────────────── │
│ ⚠️ USAGE VALIDATION:                    │
│                                          │
│ Users:    142 / 150 → Limit: 50         │
│           ❌ EXCEEDS new limit by 92     │
│                                          │
│ Clients:  1,847 / 2,000 → Limit: 500   │
│           ❌ EXCEEDS new limit by 1,347  │
│                                          │
│ Programs: 12 / 25 → Limit: 10          │
│           ❌ EXCEEDS new limit by 2      │
│                                          │
│ Storage:  45GB / 200GB → Limit: 50GB   │
│           ✅ Within new limit            │
│                                          │
│ ─────────────────────────────────────── │
│ ⚠️ FEATURE IMPACT:                      │
│                                          │
│ Features that will be DISABLED:          │
│ ❌ State/DHHS Reporting                  │
│ ❌ Lab Integration                       │
│ ❌ API Access                            │
│ ❌ Custom Domain                         │
│ ❌ Dedicated Support                     │
│                                          │
│ ─────────────────────────────────────── │
│ RESOLUTION REQUIRED:                     │
│                                          │
│ Before downgrade can proceed:            │
│ ☐ Reduce users to 50 or below           │
│ ☐ Reduce clients to 500 or below        │
│ ☐ Reduce programs to 10 or below        │
│ OR                                       │
│ ☐ Override: Allow over-limit (no new     │
│   additions until under limit)           │
│                                          │
│ Credit: $1,200.00 applied to account     │
│                                          │
│ [Cancel] [Confirm Downgrade]             │
└──────────────────────────────────────────┘
```

### Downgrade Validation Rules

| Rule                                        | Behavior                                  |
|---------------------------------------------|-------------------------------------------|
| Usage exceeds new limits                    | Warning + require resolution or override  |
| Override selected                           | Allow downgrade, block new additions       |
| Features disabled                           | Listed explicitly, confirmed by admin      |
| Proration credit                            | Calculated, applied as account credit      |
| Effective date default                      | Next billing cycle (recommended)           |
| Immediate downgrade                         | Credit issued for remaining days           |
| Active integrations using disabled features | Warning: "Lab integration will stop working" |
| Custom domain removal                       | 7-day notice before DNS redirect           |

---

## 9. Lifecycle Phase 7: Renewal

### Auto-Renewal Process

```
30 days before end date
         │
         ▼
    Send renewal reminder email
         │
         ▼
14 days before
         │
         ▼
    Send second reminder
         │
         ▼
7 days before
         │
         ▼
    Send third reminder + in-app notification
         │
         ▼
1 day before
         │
         ▼
    Send final notice
         │
         ▼
End date reached (auto-renew = ON)
         │
         ▼
┌──────────────────────────────┐
│ Attempt payment              │
└────────────┬─────────────────┘
             │
      ┌──────┴──────┐
      ▼              ▼
  Success          Failed
      │              │
      ▼              ▼
  Renew           Enter Payment
  subscription    Failed Flow
  (new term,      (see Phase 22)
  same config)
```

### Auto-Renewal Success

| Action                           | Detail                                  |
|----------------------------------|-----------------------------------------|
| New subscription term starts     | Same tier, rate, limits                 |
| New end date calculated          | Start + term duration                   |
| Invoice generated                | For new term                            |
| Payment charged                  | Per payment method on file              |
| Confirmation email sent          | To tenant admin                         |
| Audit log created                | Renewal record                          |

### Manual Renewal Process

For tenants with auto-renew OFF:

```
End date approaching (auto-renew = OFF)
         │
         ▼
    Send reminders (30, 14, 7, 1 day)
    Include: "Your subscription does not auto-renew"
         │
         ▼
End date reached
         │
         ▼
    Status → Expired
    Enter Grace Period
         │
         ▼
Admin or Tenant Admin manually renews
         │
         ▼
┌──────────────────────────────┐
│ Renewal Modal                │
│                              │
│ Renew as: ○ Same config      │
│           ○ Different tier   │
│           ○ Different term   │
│                              │
│ New term: [Dropdown]         │
│ Rate: [Auto-filled]          │
│ Payment: [On file / New]     │
│                              │
│ [Cancel] [Renew Now]         │
└──────────────────────────────┘
```

---

## 10. Lifecycle Phase 8: Payment Management

### Payment Methods Page

**Route:** `/admin/tenants/subscriptions/:id/payment-methods`

### Supported Payment Methods

| Method           | Provider    | Auto-charge | Refund Support | Gov Eligible |
|------------------|-------------|:-----------:|:--------------:|:------------:|
| Credit Card      | Stripe      | Yes         | Yes            | No           |
| Debit Card       | Stripe      | Yes         | Yes            | No           |
| ACH Bank Transfer| Stripe      | Yes         | Yes            | Yes          |
| Invoice / Net 30 | Internal    | No          | Credit note    | Yes          |
| Purchase Order   | Internal    | No          | Credit note    | Yes          |
| Wire Transfer    | Manual      | No          | Manual         | Yes          |
| Check            | Manual      | No          | Manual         | Yes          |

### Payment Method Management UI

| Action                   | Detail                                              |
|--------------------------|-----------------------------------------------------|
| Add Payment Method       | Modal: card form (Stripe Elements) / bank details / PO number |
| Set Default              | Radio selection among saved methods                 |
| Remove Payment Method    | Confirmation required, cannot remove if only method and subscription active |
| Update Card              | Replace card details (Stripe secure form)           |
| Update Bank              | Replace bank account details                        |
| Update PO Number         | Text input + new PO document upload                 |
| View Payment Method      | Masked display: VISA ****4242, Exp 03/28            |

### Payment Method Validation

| Rule                                        | Validation                                |
|---------------------------------------------|-------------------------------------------|
| At least one method required                | For active paid subscriptions             |
| Default method required                     | One method must be marked default          |
| Card expiration warning                     | Alert 60 days before card expiration       |
| Card expired                                | Block: "Payment method expired. Update required." |
| Failed card on file                         | Warning badge on payment method            |
| PO expiration                               | Track PO validity dates, alert on expiry   |

---

## 11. Lifecycle Phase 9: Invoicing & Billing

### Invoice Generation

| Trigger                        | Invoice Type        | Timing              |
|--------------------------------|---------------------|---------------------|
| Subscription created           | Initial             | On activation       |
| Billing cycle start            | Recurring           | Per billing schedule|
| Upgrade (immediate)            | Proration           | Immediately         |
| Downgrade credit               | Credit Note         | Immediately         |
| Extension                      | Extension           | On confirmation     |
| Manual charge                  | Ad-hoc              | On creation         |
| Renewal                        | Renewal             | On renewal date     |

### Invoice Detail

| Field                    | Detail                                          |
|--------------------------|-------------------------------------------------|
| Invoice Number           | Auto-generated: `INV-[TENANT_SLUG]-[YYYYMM]-[SEQ]` |
| Invoice Date             | Generation date                                 |
| Due Date                 | Based on payment terms (immediate / Net 30)     |
| Billing Period           | Start and end date of the period                |
| Tenant Name              | Organization name                               |
| Billing Address          | Tenant address                                  |
| Billing Contact          | Name + email                                    |
| Line Items               | See below                                       |
| Subtotal                 | Sum of line items                               |
| Discount                 | Discount amount and percentage                  |
| Tax                      | If applicable (configurable per state)          |
| Total Due                | Subtotal - Discount + Tax                       |
| Payment Status           | Draft, Sent, Paid, Overdue, Void, Refunded      |
| Payment Method           | Method used or expected                         |
| Payment Reference        | Transaction ID / check number / wire ref        |
| Notes                    | Internal and external notes                     |
| PDF Download             | Auto-generated branded PDF                      |

### Invoice Line Items

| Field           | Example                                          |
|-----------------|--------------------------------------------------|
| Description     | "BPDS CareTrack™ Professional — Monthly Subscription" |
| Quantity        | 1                                                |
| Unit Price      | $1,500.00                                        |
| Discount        | 10% ($150.00)                                    |
| Line Total      | $1,350.00                                        |

Additional line items for:
- Proration adjustments
- Overage charges (if applicable)
- One-time services (training, custom development)
- Credits applied

### Invoice Status Lifecycle

```
Draft → Sent → Paid
                 │
                 ├──→ Overdue (past due date)
                 │        │
                 │        ├──→ Paid (late payment)
                 │        └──→ Void (written off)
                 │
                 └──→ Refunded (partial or full)
```

### Invoice Management UI

**Route:** `/admin/tenants/subscriptions/:id/invoices`

| Action               | Detail                                              |
|----------------------|-----------------------------------------------------|
| View Invoice         | Full invoice detail page with PDF preview           |
| Download PDF         | Branded PDF with logo, terms, payment info          |
| Send Invoice         | Email invoice to billing contact                    |
| Resend Invoice       | Resend with "Reminder" flag                         |
| Mark as Paid         | Manual payment recording (check, wire, PO)          |
| Record Payment       | Enter payment reference, date, amount               |
| Void Invoice         | Cancel invoice with reason (creates credit if paid) |
| Add Credit           | Apply account credit to invoice                     |
| Add Note             | Internal/external notes                             |
| Print Invoice        | Print-friendly format                               |

---

## 12. Lifecycle Phase 10: Proration

### Proration Calculation Engine

| Scenario                    | Calculation                                    |
|-----------------------------|------------------------------------------------|
| Mid-cycle upgrade           | Credit remaining days at old rate + charge remaining days at new rate |
| Mid-cycle downgrade         | Credit remaining days at old rate (applied to account) |
| Mid-cycle cancellation      | Credit remaining days (refund or account credit) |
| Extension                   | Charge extension days at current rate           |
| Rate change                 | New rate effective next cycle (no mid-cycle proration) |

### Proration Formula

```
Daily Rate = Monthly Rate / Days in Billing Month

Upgrade Proration:
  Days Remaining = End of Current Cycle - Today
  Old Credit     = Days Remaining × Old Daily Rate
  New Charge     = Days Remaining × New Daily Rate
  Amount Due     = New Charge - Old Credit

Downgrade Proration:
  Days Remaining = End of Current Cycle - Today
  Credit Amount  = Days Remaining × (Old Daily Rate - New Daily Rate)
  → Applied as account credit

Cancellation Proration:
  Days Used      = Today - Start of Current Cycle
  Days Remaining = End of Current Cycle - Today
  Credit Amount  = Days Remaining × Daily Rate
  → Refund or account credit per policy
```

### Proration Detail View

**Shown in:** Upgrade/Downgrade/Cancel modals

| Field                      | Example                                     |
|----------------------------|---------------------------------------------|
| Current Billing Cycle      | Apr 1, 2026 – Apr 30, 2026                 |
| Days in Cycle              | 30                                          |
| Days Used                  | 12                                          |
| Days Remaining             | 18                                          |
| Old Monthly Rate           | $1,500.00                                   |
| Old Daily Rate             | $50.00                                      |
| New Monthly Rate           | $3,500.00                                   |
| New Daily Rate             | $116.67                                     |
| Credit (old unused)        | -$900.00                                    |
| Charge (new remaining)     | +$2,100.06                                  |
| Net Amount Due             | $1,200.06                                   |
| Next Full Billing          | $3,500.00 on May 1, 2026                   |

---

## 13. Lifecycle Phase 11: Discounts & Credits

### Discount Types

| Type                | Description                          | Duration        | Stackable |
|---------------------|--------------------------------------|-----------------|:---------:|
| Term Discount       | Auto-applied per contract term       | Term duration   | No        |
| Promotional         | Time-limited offer                   | Custom          | Yes       |
| Volume              | Based on user/client count           | Ongoing         | Yes       |
| Loyalty             | Applied after X months active        | Ongoing         | Yes       |
| Government          | Government entity pricing            | Term duration   | No        |
| Custom              | Negotiated per deal                  | Custom          | No        |
| Referral            | Tenant referred by existing tenant   | First term      | Yes       |

### Discount Management UI

**Route:** `/admin/tenants/subscriptions/:id/discounts`

| Field               | Detail                                              |
|---------------------|-----------------------------------------------------|
| Discount Type       | Dropdown (types above)                              |
| Percentage          | 0–100% (> 50% requires SysAdmin override)           |
| Fixed Amount        | Alternative to percentage                            |
| Start Date          | When discount takes effect                           |
| Expiration Date     | When discount expires (null = indefinite)            |
| Reason              | Required text                                        |
| Approved By         | Auto-filled (logged-in admin)                        |
| Override Required   | Flag if > 50%                                        |
| Override Approved By| Required if override                                 |

### Account Credits

| Source                    | Credit Type       | Expiration      |
|---------------------------|-------------------|-----------------|
| Downgrade proration       | Automatic         | 12 months       |
| Cancellation refund       | Automatic         | 90 days         |
| Billing error correction  | Manual            | 12 months       |
| Goodwill                  | Manual            | 6 months        |
| Referral reward           | Automatic         | 12 months       |
| Service credit (SLA miss) | Automatic         | 12 months       |

### Credit Management UI

| Action              | Detail                                              |
|---------------------|-----------------------------------------------------|
| View Credits        | Table: amount, source, date, expiration, status     |
| Apply Credit        | Apply to next invoice or specific invoice           |
| Add Manual Credit   | Amount + reason + expiration (requires approval)    |
| Expire Credit       | Manual expiration with reason                       |
| Credit History      | Full audit trail of all credits                     |

---

## 14. Lifecycle Phase 12: Pause

### Pause vs Suspend

| Aspect              | Pause                              | Suspend                            |
|---------------------|------------------------------------|------------------------------------|
| Initiated By        | Admin (mutual agreement)           | Admin (enforcement action)         |
| User Access         | Maintained (full access)           | Blocked immediately                |
| Billing             | Frozen (no charges)                | Frozen (no charges)                |
| Data                | Active, read/write                 | Preserved, read-only               |
| Duration            | Defined end date required          | Indefinite or defined              |
| Max Duration        | 90 days                            | No limit                           |
| Resume Trigger      | Auto-resume on end date or manual  | Admin reactivation only            |
| Use Case            | Budget freeze, seasonal program    | Non-payment, violation, security   |

### Pause Process

**Route:** Row action → Pause Subscription

```
┌──────────────────────────────────────┐
│ Pause Subscription Modal             │
│                                      │
│ Tenant: Grafton Drug Court           │
│ Current Status: ● Active             │
│                                      │
│ ⚠️ During pause:                     │
│ • Users retain full access           │
│ • No billing charges accrue          │
│ • Subscription end date extended by  │
│   pause duration                     │
│                                      │
│ Pause Duration:                      │
│ ○ 30 days                            │
│ ○ 60 days                            │
│ ○ 90 days (maximum)                  │
│ ○ Custom: [date picker]              │
│                                      │
│ Resume Date: [calculated]            │
│                                      │
│ Reason:                              │
│ [Budget Freeze ▼]                    │
│ [Textarea for details]               │
│                                      │
│ Notify Tenant Admin: [Toggle: On]    │
│                                      │
│ Pauses used this year: 1 of 2        │
│                                      │
│ [Cancel] [Pause Subscription]        │
└──────────────────────────────────────┘
```

### Pause Rules

| Rule                                        | Value                                 |
|---------------------------------------------|---------------------------------------|
| Max pause duration                          | 90 days per pause                     |
| Max pauses per year                         | 2                                     |
| Total pause days per year                   | 120 days max                          |
| Subscription end date                       | Extended by pause duration            |
| Trial subscriptions                         | Cannot be paused                      |
| Billing                                     | No charges during pause               |
| User access                                 | Full access maintained                |
| Auto-resume                                 | On resume date (automated)            |
| Early resume                                | Admin can resume before end date      |

### Resume Process (Auto or Manual)

| Action                           | Timing                                  |
|----------------------------------|-----------------------------------------|
| Status → Active                  | Immediately                             |
| Billing resumes                  | Next billing cycle after resume         |
| End date adjusted                | Extended by total pause days            |
| Notification sent                | To tenant admin                         |
| Audit log created                | Resume event                            |

---

## 15. Lifecycle Phase 13: Suspension

### Suspension Triggers

| Trigger                          | Auto/Manual | Severity    |
|----------------------------------|:-----------:|:-----------:|
| Payment failed (after retries)   | Auto        | High        |
| Admin action (non-payment)       | Manual      | High        |
| Contract violation               | Manual      | Critical    |
| Security concern                 | Manual      | Critical    |
| State/DHHS request               | Manual      | Critical    |
| Grace period expired             | Auto        | High        |
| Fraud detection                  | Auto        | Critical    |

### Suspension Effects (Complete Cascade)

| System Component        | Effect                                          |
|-------------------------|-------------------------------------------------|
| User Sessions           | All revoked immediately                         |
| User Login              | Blocked (return 403: `subscription_suspended`)  |
| API Access              | All API keys disabled                           |
| Scheduled Notifications | Paused (queued, not sent)                       |
| Check-In Reminders      | Paused                                          |
| Appointment Reminders   | Paused                                          |
| Data Access             | Preserved but inaccessible                      |
| Billing                 | Frozen                                          |
| Feature Flags           | Preserved (not changed)                         |
| Custom Domain           | Redirected to "Account Suspended" page          |
| Integrations            | Webhooks paused, lab integration paused         |
| Reports                 | Not generated                                   |
| Audit Logging           | Continues (logs suspension events)              |

### Suspension Landing Page (Shown to Suspended Users)

```
┌──────────────────────────────────────────┐
│                                          │
│          ⚠️ Account Suspended            │
│                                          │
│  Your organization's account has been    │
│  temporarily suspended. Please contact   │
│  your administrator for more information.│
│                                          │
│  Reference: SUP-2026-04-0042            │
│                                          │
│  If you believe this is an error,        │
│  contact support@caretrack.app           │
│                                          │
└──────────────────────────────────────────┘
```

---

## 16. Lifecycle Phase 14: Reactivation

### Reactivation from Suspension

**Route:** Row action → Reactivate

```
┌──────────────────────────────────────────┐
│ Reactivate Subscription Modal            │
│                                          │
│ Tenant: Grafton Drug Court               │
│ Suspended Since: Apr 10, 2026 (12 days)  │
│ Reason: Non-Payment                      │
│                                          │
│ ─────────────────────────────────────── │
│ PRE-REACTIVATION CHECKLIST:              │
│                                          │
│ ☐ Outstanding balance resolved           │
│   Balance: $4,050.00                     │
│   [Record Payment] [Waive Balance]       │
│                                          │
│ ☐ Payment method verified                │
│   Current: VISA ****4242 (Expired!)      │
│   [Update Payment Method]                │
│                                          │
│ ☐ Root cause addressed                   │
│   [Add resolution notes]                 │
│                                          │
│ ─────────────────────────────────────── │
│ REACTIVATION OPTIONS:                    │
│                                          │
│ Billing Restart:                         │
│ ○ Resume from today (recommended)        │
│ ○ Backdate to suspension date (full charge) │
│ ○ Resume from next cycle                 │
│                                          │
│ Subscription End Date:                   │
│ ○ Extend by suspension duration          │
│ ○ Keep original end date                 │
│                                          │
│ Grace Period Credit:                     │
│ ○ No credit (standard)                   │
│ ○ Credit suspension period (goodwill)    │
│                                          │
│ Notes: [Textarea]                        │
│                                          │
│ [Cancel] [Reactivate Now]                │
└──────────────────────────────────────────┘
```

### Reactivation Effects

| Action                           | Timing                                  |
|----------------------------------|-----------------------------------------|
| Status → Active                  | Immediate                               |
| User sessions restored           | Users can login immediately             |
| API keys re-enabled              | Immediate                               |
| Queued notifications sent        | Within 15 minutes                       |
| Billing resumed                  | Per selected option                     |
| Custom domain restored           | Within 1 hour (DNS propagation)         |
| Integrations resumed             | Immediate                               |
| Notification to tenant admin     | Immediate                               |
| Notification to all users        | "Your account has been restored"        |
| Audit log                        | Reactivation event with full context    |

### Reactivation from Expired/Grace Period

Same modal with additional field:

| Field                    | Detail                                          |
|--------------------------|-------------------------------------------------|
| Renewal Term             | Required — select new term                      |
| Payment                  | Required — must pay before reactivation         |
| Rate Adjustment          | Option to apply current tier rates (may differ from original) |

---

## 17. Lifecycle Phase 15: Cancellation

### Cancellation Types

| Type                     | Initiated By  | Effective Date              | Refund        |
|--------------------------|---------------|-----------------------------|---------------|
| Voluntary (end of term)  | Admin/Tenant  | End of current term         | None          |
| Voluntary (immediate)    | Admin         | Immediately                 | Prorated      |
| Involuntary (breach)     | Admin         | Immediately                 | None          |
| Involuntary (State order)| Admin         | Per State directive         | Per directive |
| Mutual Agreement         | Both          | Negotiated                  | Negotiated    |

### Cancellation Process

```
Admin selects "Cancel Subscription"
         │
         ▼
┌──────────────────────────────────────────┐
│ Cancel Subscription Modal                │
│                                          │
│ ⛔ CRITICAL ACTION                       │
│                                          │
│ Tenant: Grafton Drug Court               │
│ Tier: Professional ($1,350/mo)           │
│ Current Term Ends: Jan 14, 2027          │
│                                          │
│ ─────────────────────────────────────── │
│ IMPACT ASSESSMENT:                       │
│                                          │
│ 👥 32 active users will lose access      │
│ 👤 187 enrolled clients affected         │
│ 📁 4 active programs will be disabled    │
│ 📄 2,847 documents in storage            │
│ 💬 1,204 message threads                 │
│ 📊 18 months of compliance data          │
│                                          │
│ ─────────────────────────────────────── │
│ CANCELLATION TYPE:                       │
│                                          │
│ ○ End of Term (Jan 14, 2027)             │
│   • Access continues until term end      │
│   • No refund                            │
│   • No further billing                   │
│                                          │
│ ○ Immediate                              │
│   • Access blocked today                 │
│   • Prorated refund: $1,125.00           │
│   • 18 remaining days credited           │
│                                          │
│ ○ Custom Date: [date picker]             │
│   • Access continues until date          │
│   • Prorated refund calculated           │
│                                          │
│ ─────────────────────────────────────── │
│ REASON:                                  │
│                                          │
│ [Contract End            ▼]              │
│ [Detailed reason textarea - REQUIRED]    │
│                                          │
│ ─────────────────────────────────────── │
│ FINANCIAL SETTLEMENT:                    │
│                                          │
│ Outstanding Balance: $0.00               │
│ Prorated Refund: $1,125.00              │
│ Refund Method:                           │
│ ○ Original payment method                │
│ ○ Account credit (for future use)        │
│ ○ Check                                  │
│ ○ Waive refund                           │
│                                          │
│ ─────────────────────────────────────── │
│ EXIT CHECKLIST:                          │
│                                          │
│ ☐ Tenant admin notified of cancellation  │
│ ☐ Data export offered to tenant admin    │
│ ☐ Data export completed (or declined)    │
│ ☐ Outstanding invoices resolved          │
│ ☐ Active integrations documented         │
│ ☐ Custom domain redirect planned         │
│ ☐ All active programs reviewed           │
│ ☐ Client continuity plan discussed       │
│ ☐ I understand this cannot be undone     │
│                                          │
│ ─────────────────────────────────────── │
│ CONFIRMATION:                            │
│                                          │
│ Type "CANCEL GRAFTON-DRUG-COURT"         │
│ [____________________________]           │
│                                          │
│ [Go Back] [Cancel Subscription] (Red)    │
└──────────────────────────────────────────┘
```

### Post-Cancellation Timeline

```
Day 0: Cancellation Effective
  │  • Status → Cancelled
  │  • Access blocked (immediate) or continues (end of term)
  │  • Cancellation confirmation email sent
  │  • All scheduled notifications stopped
  │
Day 1-30: Data Export Window
  │  • Tenant admin can request data export
  │  • Export includes: clients, check-ins, documents, messages, compliance data, reports
  │  • Export format: ZIP containing CSV + JSON + document files
  │  • Export request via email link or support ticket
  │
Day 30: Export Window Closes
  │  • Status → Deactivated
  │  • No more exports available
  │  • All user accounts deactivated
  │  • Custom domain redirected to CareTrack landing page
  │
Day 30-90: Data Retention Period
  │  • Data preserved in encrypted cold storage
  │  • Accessible only via SysAdmin support request (legal/compliance)
  │  • Audit trail preserved
  │
Day 90: Retention Expires
  │  • Status → Archived
  │  • PHI data purged per HIPAA retention policy
  │  • Audit trail preserved (7 years per HIPAA)
  │  • Tenant record minimized (name, slug, dates, cancellation reason)
  │  • All PII/PHI permanently deleted
  │
Day 2,555 (7 years): Audit Trail Expiry
     • Audit records purged
     • Minimal tombstone record remains (tenant existed, dates, no PII)
```

---

## 18. Lifecycle Phase 16: Refunds

### Refund Types

| Type              | Trigger                              | Calculation              | Approval     |
|-------------------|--------------------------------------|--------------------------|:------------:|
| Proration         | Mid-cycle cancellation/downgrade     | Remaining days × rate    | Auto         |
| Billing Error     | Duplicate charge, wrong amount       | Full or partial          | SysAdmin     |
| Service Credit    | SLA violation (uptime < guaranteed)  | Per SLA terms            | Auto         |
| Goodwill          | Customer satisfaction                | Discretionary            | SysAdmin     |
| Overpayment       | Payment exceeded invoice amount      | Difference               | Auto         |
| Dispute           | Chargeback resolution                | Per dispute outcome      | SysAdmin     |

### Refund Process

**Route:** `/admin/tenants/subscriptions/:id/refunds/new`

```
┌──────────────────────────────────────────┐
│ Issue Refund Modal                       │
│                                          │
│ Tenant: Grafton Drug Court               │
│                                          │
│ Refund Type: [Dropdown]                  │
│                                          │
│ Amount: $[________]                      │
│ Max refundable: $1,350.00                │
│                                          │
│ Related Invoice: [INV-GRAFTON-202604-001]│
│                                          │
│ Refund To:                               │
│ ○ Original payment method (VISA ****4242)│
│ ○ Account credit                         │
│ ○ Check (mailed to billing address)      │
│ ○ Wire transfer                          │
│                                          │
│ Reason: [Required textarea]              │
│                                          │
│ Internal Notes: [Textarea]               │
│                                          │
│ ☐ I confirm this refund is authorized    │
│                                          │
│ [Cancel] [Issue Refund]                  │
└──────────────────────────────────────────┘
```

### Refund Rules

| Rule                                        | Limit                                 |
|---------------------------------------------|---------------------------------------|
| Max refund per transaction                  | Cannot exceed original payment amount |
| Refund window (card/ACH)                    | 90 days from original payment         |
| Refund window (invoice/PO)                  | 180 days (credit note issued)         |
| Approval required                           | All refunds > $500 require SysAdmin approval |
| Multiple refunds                            | Max 3 refunds per invoice             |
| Refund to different method                  | Requires SysAdmin + finance approval  |
| Chargeback handling                         | Auto-flag, investigation required     |

### Refund Ledger

| Column            | Detail                                          |
|-------------------|-------------------------------------------------|
| Refund ID         | Auto-generated: `REF-[SLUG]-[YYYYMM]-[SEQ]`    |
| Date              | Refund date                                     |
| Tenant            | Organization name                               |
| Invoice           | Related invoice number                          |
| Amount            | Refund amount                                   |
| Type              | Proration / Error / Credit / Goodwill / Dispute |
| Method            | Card / Credit / Check / Wire                    |
| Status            | Pending / Processed / Failed / Reversed         |
| Approved By       | Admin name                                      |
| Reason            | Reason text                                     |

---

## 19. Lifecycle Phase 17: Expiration & Grace Period

### Expiration Flow

```
Subscription end date reached
(auto-renew = OFF or payment failed)
         │
         ▼
┌─────────────────────────────┐
│ Status → Expired            │
│ Access → Limited (read-only)│
│ Billing → Stopped           │
└────────────┬────────────────┘
             │
             ▼ (immediately enters grace period)
┌─────────────────────────────┐
│ Status → Grace Period       │
│ Duration: 7 days            │
│ Access → Limited (read-only)│
└────────────┬────────────────┘
             │
      ┌──────┴──────────────────────┐
      │                             │
      ▼                             ▼
  Payment received              Grace expires
      │                             │
      ▼                             ▼
  Status → Active              Status → Suspended
  (seamless restore)           (full lockout)
```

### Grace Period Configuration

| Setting                    | Default  | Configurable | Per-Tier Override |
|----------------------------|----------|:------------:|:-----------------:|
| Grace Period Duration      | 7 days   | Yes          | Yes               |
| Access Level During Grace  | Read-only| No           | No                |
| Payment Retries            | 3        | Yes          | No                |
| Retry Interval             | 2 days   | Yes          | No                |
| Notification Frequency     | Daily    | Yes          | No                |

### Grace Period UI Banner (Shown to Tenant Users)

```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️ Your subscription has expired. You have 5 days remaining  │
│ to renew before your account is suspended.                   │
│ [Renew Now] [Contact Administrator]                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 20. Lifecycle Phase 18: Archival & Data Retention

### Retention Schedule

| Data Category              | Retention Period    | After Retention          |
|----------------------------|--------------------:|--------------------------|
| Tenant record (basic)      | Indefinite          | Tombstone only           |
| User accounts              | 90 days post-cancel | PII purged               |
| Client records (PHI)       | 90 days post-cancel | PHI purged               |
| Documents / uploads        | 90 days post-cancel | Permanently deleted      |
| Messages                   | 90 days post-cancel | Permanently deleted      |
| Check-in records           | 90 days post-cancel | Permanently deleted      |
| Compliance data            | 90 days post-cancel | Permanently deleted      |
| Audit trail                | 7 years             | Permanently deleted      |
| Billing / invoices         | 7 years             | Permanently deleted      |
| Consent records            | 7 years             | Permanently deleted      |

### Archival Process (Automated)

```
Retention period expires
         │
         ▼
┌─────────────────────────────────┐
│ Archival Job Runs (nightly)     │
│                                 │
│ 1. Identify expired tenants     │
│ 2. Verify no legal holds        │
│ 3. Generate purge manifest      │
│ 4. Execute PHI/PII purge        │
│ 5. Minimize tenant record       │
│ 6. Update status → Archived     │
│ 7. Create archival audit entry  │
│ 8. Send confirmation to SysAdmin│
└─────────────────────────────────┘
```

### Legal Hold

| Feature              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Place Legal Hold     | SysAdmin can freeze retention timer on any tenant   |
| Hold Reason          | Required: Litigation, Investigation, Regulatory, Audit |
| Hold Duration        | Indefinite until manually released                  |
| Hold Effect          | Data preserved regardless of retention schedule     |
| Hold Visibility      | Badge on tenant record: "⚖️ Legal Hold"            |
| Release Hold         | SysAdmin action, retention timer resumes            |

---

## 21. Lifecycle Phase 19: Deletion

CareTrack **never hard-deletes** tenant data. "Deletion" means:

| Action              | What Actually Happens                               |
|---------------------|-----------------------------------------------------|
| Delete Draft        | `is_deleted = true`, record hidden from UI          |
| Delete Deactivated  | Status → Archived, retention timer starts           |
| Purge (automated)   | PHI/PII removed, tombstone preserved                |

### Tombstone Record (Post-Purge)

| Field Preserved     | Example                                             |
|---------------------|-----------------------------------------------------|
| Tenant ID           | UUID (immutable)                                    |
| Organization Name   | "Grafton Drug Court"                                |
| Slug                | "grafton-drug-court" (reserved, cannot be reused)   |
| Created Date        | Jan 15, 2026                                        |
| Deactivated Date    | Apr 22, 2026                                        |
| Archived Date       | Jul 21, 2026                                        |
| Purged Date         | Jul 21, 2026                                        |
| Cancellation Reason | "Contract End"                                      |

---

## 22. Payment Failed Flows

### Payment Failure Cascade

```
Payment attempt fails
         │
         ▼
┌──────────────────────────┐
│ Retry 1 (Day 1)          │ ── Email: "Payment failed, retrying"
└────────────┬─────────────┘
             │ Fails
             ▼
┌──────────────────────────┐
│ Retry 2 (Day 3)          │ ── Email: "Second attempt failed, please update payment"
└────────────┬─────────────┘
             │ Fails
             ▼
┌──────────────────────────┐
│ Retry 3 (Day 5)          │ ── Email: "Final attempt — update payment to avoid suspension"
└────────────┬─────────────┘
             │ Fails
             ▼
┌──────────────────────────┐
│ Day 7: Grace Period       │ ── Email: "Payment overdue — account at risk"
│ Access → Limited          │    In-app: Banner warning
└────────────┬─────────────┘
             │ No payment received
             ▼
┌──────────────────────────┐
│ Day 14: Auto-Suspend      │ ── Email: "Account suspended due to non-payment"
│ Access → Blocked          │    SysAdmin notified
└──────────────────────────┘
```

### Payment Failure UI (SysAdmin View)

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Alert Badge          | Red badge on tenant row: "Payment Failed"           |
| Failure Detail       | Reason code from payment processor                  |
| Retry History        | Table: attempt date, amount, result, error code     |
| Manual Intervention  | [Retry Now] [Record Manual Payment] [Update Payment Method] [Waive] |
| Contact Info         | Tenant admin contact for phone/email outreach       |
| Days Until Suspend   | Countdown: "Auto-suspend in 3 days"                 |

### Payment Failure Reason Codes

| Code                    | Description                          | Suggested Action           |
|-------------------------|--------------------------------------|----------------------------|
| `card_declined`         | Generic decline                      | Update card                |
| `insufficient_funds`    | Not enough balance                   | Retry or update method     |
| `expired_card`          | Card past expiration                 | Update card                |
| `incorrect_cvc`         | CVC mismatch                         | Re-enter card details      |
| `processing_error`      | Processor issue                      | Auto-retry                 |
| `lost_stolen`           | Card reported lost/stolen            | New card required          |
| `bank_account_closed`   | ACH account closed                   | New bank account           |
| `ach_returned`          | ACH returned by bank                 | Contact bank, retry        |

---

## 23. Notification Matrix

### Complete Subscription Notification Map

| Event                          | Tenant Admin | SysAdmin | All Users | Channel        | Timing              |
|--------------------------------|:------------:|:--------:|:---------:|----------------|---------------------|
| Subscription Created           | ✅           | ✅       | ❌        | Email          | Immediate           |
| Trial Started                  | ✅           | ✅       | ❌        | Email          | Immediate           |
| Trial Reminder (10d)           | ✅           | ❌       | ❌        | Email          | 10 days before      |
| Trial Reminder (7d)            | ✅           | ❌       | ❌        | Email + In-App | 7 days before       |
| Trial Reminder (3d)            | ✅           | ✅       | ❌        | Email + In-App | 3 days before       |
| Trial Reminder (1d)            | ✅           | ✅       | ❌        | Email + In-App | 1 day before        |
| Trial Expired                  | ✅           | ✅       | ✅        | Email + In-App | On expiration       |
| Trial Converted                | ✅           | ✅       | ✅        | Email + In-App | Immediate           |
| Trial Extended                 | ✅           | ✅       | ❌        | Email          | Immediate           |
| Subscription Activated         | ✅           | ✅       | ✅        | Email          | Immediate           |
| Tier Upgraded                  | ✅           | ✅       | ❌        | Email + In-App | Immediate           |
| Tier Downgraded                | ✅           | ✅       | ❌        | Email + In-App | Immediate           |
| Subscription Paused            | ✅           | ✅       | ❌        | Email          | Immediate           |
| Subscription Resumed           | ✅           | ✅       | ❌        | Email          | Immediate           |
| Renewal Reminder (30d)         | ✅           | ❌       | ❌        | Email          | 30 days before      |
| Renewal Reminder (14d)         | ✅           | ❌       | ❌        | Email          | 14 days before      |
| Renewal Reminder (7d)          | ✅           | ✅       | ❌        | Email + In-App | 7 days before       |
| Renewal Reminder (1d)          | ✅           | ✅       | ❌        | Email + In-App | 1 day before        |
| Auto-Renewed                   | ✅           | ✅       | ❌        | Email          | Immediate           |
| Renewal Failed                 | ✅           | ✅       | ❌        | Email          | Immediate           |
| Payment Successful             | ✅           | ❌       | ❌        | Email          | Immediate           |
| Payment Failed (Retry 1)       | ✅           | ❌       | ❌        | Email          | Immediate           |
| Payment Failed (Retry 2)       | ✅           | ✅       | ❌        | Email          | Immediate           |
| Payment Failed (Final)         | ✅           | ✅       | ❌        | Email + In-App | Immediate           |
| Payment Overdue                | ✅           | ✅       | ❌        | Email          | Daily               |
| Grace Period Started           | ✅           | ✅       | ✅        | Email + In-App | Immediate           |
| Subscription Expired           | ✅           | ✅       | ✅        | Email + In-App | Immediate           |
| Subscription Suspended         | ✅           | ✅       | ✅        | Email          | Immediate           |
| Subscription Reactivated       | ✅           | ✅       | ✅        | Email + In-App | Immediate           |
| Subscription Cancelled         | ✅           | ✅       | ✅        | Email          | Immediate           |
| Data Export Available          | ✅           | ❌       | ❌        | Email          | On cancellation     |
| Data Export Expiring (7d)      | ✅           | ✅       | ❌        | Email          | 7 days before       |
| Data Export Window Closed      | ✅           | ✅       | ❌        | Email          | On closure          |
| Deactivation Complete          | ✅           | ✅       | ❌        | Email          | Immediate           |
| Usage Limit Warning (85%)      | ✅           | ❌       | ❌        | In-App         | On threshold        |
| Usage Limit Critical (95%)     | ✅           | ✅       | ❌        | Email + In-App | On threshold        |
| Usage Limit Exceeded (100%)    | ✅           | ✅       | ❌        | Email + In-App | Immediate           |
| Card Expiring (60d)            | ✅           | ❌       | ❌        | Email          | 60 days before      |
| Card Expiring (14d)            | ✅           | ✅       | ❌        | Email          | 14 days before      |
| Card Expired                   | ✅           | ✅       | ❌        | Email + In-App | Immediate           |
| Refund Issued                  | ✅           | ✅       | ❌        | Email          | Immediate           |
| Credit Applied                 | ✅           | ❌       | ❌        | Email          | Immediate           |
| Invoice Generated              | ✅           | ❌       | ❌        | Email          | Immediate           |
| Amendment Created              | ✅           | ✅       | ❌        | Email          | Immediate           |
| Discount Applied               | ✅           | ✅       | ❌        | Email          | Immediate           |
| Discount Expiring (30d)        | ✅           | ✅       | ❌        | Email          | 30 days before      |
| Legal Hold Placed              | ❌           | ✅       | ❌        | Email          | Immediate           |
| Legal Hold Released            | ❌           | ✅       | ❌        | Email          | Immediate           |

---

## 24. Audit Trail Requirements

### Subscription Events Logged

Every subscription lifecycle event creates an immutable audit record:

| Field               | Detail                                              |
|---------------------|-----------------------------------------------------|
| Event ID            | UUID                                                |
| Timestamp           | UTC datetime (millisecond precision)                |
| Tenant ID           | FK to tenant                                        |
| Subscription ID     | FK to subscription                                  |
| Event Type          | `subscription.created`, `subscription.upgraded`, etc. |
| Actor               | User ID + name + role who performed action          |
| Actor IP            | Source IP address                                   |
| Actor User Agent    | Browser/device info                                 |
| Previous State      | JSON snapshot of subscription before change         |
| New State           | JSON snapshot of subscription after change          |
| Field-Level Diff    | JSON diff of individual fields changed              |
| Reason              | Reason provided by actor                            |
| Correlation ID      | Trace ID for cross-service correlation              |
| Metadata            | Additional context (payment ref, invoice ID, etc.)  |

### Audit Retention

| Event Category       | Retention      |
|----------------------|----------------|
| Financial events     | 7 years        |
| Status changes       | 7 years        |
| Configuration changes| 3 years        |
| Access events        | 1 year         |

---

## 25. Database Entities

### New / Updated Entities Required

| Entity                      | Service              | Purpose                        |
|-----------------------------|----------------------|--------------------------------|
| `Subscription`              | Billing Service      | Core subscription record       |
| `SubscriptionHistory`       | Billing Service      | State change history           |
| `SubscriptionAmendment`     | Billing Service      | Contract amendments            |
| `Invoice`                   | Billing Service      | Invoice records                |
| `InvoiceLineItem`           | Billing Service      | Invoice detail lines           |
| `Payment`                   | Billing Service      | Payment transactions           |
| `PaymentMethod`             | Billing Service      | Stored payment methods         |
| `Refund`                    | Billing Service      | Refund records                 |
| `AccountCredit`             | Billing Service      | Credit balance tracking        |
| `Discount`                  | Billing Service      | Active discounts               |
| `SubscriptionPause`         | Billing Service      | Pause records                  |
| `LegalHold`                 | Tenant Service       | Legal hold tracking            |
| `DataExportRequest`         | Tenant Service       | Export request tracking        |

---

## 26. API Endpoints

### Complete Subscription API

| Endpoint                                              | Method | Description                        |
|-------------------------------------------------------|--------|------------------------------------|
| `/api/v1/admin/subscriptions`                         | GET    | List all subscriptions             |
| `/api/v1/admin/subscriptions`                         | POST   | Create subscription                |
| `/api/v1/admin/subscriptions/stats`                   | GET    | Dashboard KPIs                     |
| `/api/v1/admin/subscriptions/:id`                     | GET    | Subscription detail                |
| `/api/v1/admin/subscriptions/:id`                     | PUT    | Edit subscription                  |
| `/api/v1/admin/subscriptions/:id/activate`            | POST   | Activate                           |
| `/api/v1/admin/subscriptions/:id/upgrade`             | POST   | Upgrade tier                       |
| `/api/v1/admin/subscriptions/:id/downgrade`           | POST   | Downgrade tier                     |
| `/api/v1/admin/subscriptions/:id/extend`              | POST   | Extend term                        |
| `/api/v1/admin/subscriptions/:id/extend-trial`        | POST   | Extend trial                       |
| `/api/v1/admin/subscriptions/:id/convert-trial`       | POST   | Convert trial to paid              |
| `/api/v1/admin/subscriptions/:id/pause`               | POST   | Pause subscription                 |
| `/api/v1/admin/subscriptions/:id/resume`              | POST   | Resume from pause                  |
| `/api/v1/admin/subscriptions/:id/suspend`             | POST   | Suspend                            |
| `/api/v1/admin/subscriptions/:id/reactivate`          | POST   | Reactivate from suspension         |
| `/api/v1/admin/subscriptions/:id/cancel`              | POST   | Cancel subscription                |
| `/api/v1/admin/subscriptions/:id/renew`               | POST   | Manual renewal                     |
| `/api/v1/admin/subscriptions/:id/amendments`          | GET    | List amendments                    |
| `/api/v1/admin/subscriptions/:id/amendments`          | POST   | Create amendment                   |
| `/api/v1/admin/subscriptions/:id/invoices`            | GET    | List invoices                      |
| `/api/v1/admin/subscriptions/:id/invoices`            | POST   | Generate invoice                   |
| `/api/v1/admin/subscriptions/:id/invoices/:iid`       | GET    | Invoice detail                     |
| `/api/v1/admin/subscriptions/:id/invoices/:iid/send`  | POST   | Send invoice email                 |
| `/api/v1/admin/subscriptions/:id/invoices/:iid/void`  | POST   | Void invoice                       |
| `/api/v1/admin/subscriptions/:id/invoices/:iid/pay`   | POST   | Record manual payment              |
| `/api/v1/admin/subscriptions/:id/payments`            | GET    | Payment history                    |
| `/api/v1/admin/subscriptions/:id/payment-methods`     | GET    | List payment methods               |
| `/api/v1/admin/subscriptions/:id/payment-methods`     | POST   | Add payment method                 |
| `/api/v1/admin/subscriptions/:id/payment-methods/:pid`| PUT    | Update payment method              |
| `/api/v1/admin/subscriptions/:id/payment-methods/:pid`| DELETE | Remove payment method              |
| `/api/v1/admin/subscriptions/:id/refunds`             | GET    | List refunds                       |
| `/api/v1/admin/subscriptions/:id/refunds`             | POST   | Issue refund                       |
| `/api/v1/admin/subscriptions/:id/credits`             | GET    | List account credits               |
| `/api/v1/admin/subscriptions/:id/credits`             | POST   | Add manual credit                  |
| `/api/v1/admin/subscriptions/:id/discounts`           | GET    | List discounts                     |
| `/api/v1/admin/subscriptions/:id/discounts`           | POST   | Add discount                       |
| `/api/v1/admin/subscriptions/:id/discounts/:did`      | PUT    | Update discount                    |
| `/api/v1/admin/subscriptions/:id/discounts/:did`      | DELETE | Remove discount                    |
| `/api/v1/admin/subscriptions/:id/proration`           | POST   | Calculate proration (preview)      |
| `/api/v1/admin/subscriptions/:id/legal-hold`          | POST   | Place legal hold                   |
| `/api/v1/admin/subscriptions/:id/legal-hold`          | DELETE | Release legal hold                 |
| `/api/v1/admin/subscriptions/:id/export`              | POST   | Request data export                |
| `/api/v1/admin/subscriptions/:id/audit`               | GET    | Subscription audit trail           |
| `/api/v1/admin/subscriptions/:id/send-reminder`       | POST   | Send renewal reminder              |
| `/api/v1/admin/subscriptions/export`                  | GET    | Export all subscriptions CSV       |

---

## 27. Business Rules Master List

| #  | Rule                                              | Logic                                                |
|----|---------------------------------------------------|------------------------------------------------------|
| 1  | One active subscription per tenant                | Only one status in (Trial, Active, Paused, Grace) at a time |
| 2  | One trial per tenant (lifetime)                   | Cannot re-trial after conversion or expiration        |
| 3  | Trial max duration 90 days                        | Including all extensions                              |
| 4  | Trial max extensions 3                            | Each max 30 days                                      |
| 5  | Grace period 7 days                               | Configurable per tier                                |
| 6  | Payment retries 3 over 7 days                     | Retry intervals: Day 1, 3, 5                          |
| 7  | Discount cap 50%                                  | SysAdmin override required above 50%                  |
| 8  | Downgrade requires usage validation               | Cannot downgrade if usage exceeds new limits (without override) |
| 9  | Cancellation requires exit checklist              | All items must be checked                             |
| 10 | Data export window 30 days post-cancel            | After 30 days, export unavailable                     |
| 11 | Data retention 90 days post-cancel                | PHI purged after 90 days                              |
| 12 | Audit retention 7 years                           | Per HIPAA requirements                                |
| 13 | Slug reserved after deletion                      | Deleted tenant slugs cannot be reused                 |
| 14 | Legal hold freezes retention                      | Data preserved indefinitely during hold               |
| 15 | Proration on upgrade (immediate)                  | Credit old + charge new for remaining days            |
| 16 | Proration on downgrade                            | Credit issued for remaining days at rate difference   |
| 17 | No proration on rate change                       | New rate effective next cycle                         |
| 18 | Pause max 90 days per pause                       | Max 2 pauses per year, 120 total days                |
| 19 | Trials cannot be paused                           | Only paid subscriptions                               |
| 20 | Reactivation after cancel requires new subscription | Cannot "undo" cancellation                          |
| 21 | Archived is terminal state                        | No transitions out of Archived                        |
| 22 | Refund window 90 days (card/ACH)                  | 180 days for invoice/PO                               |
| 23 | Max 3 refunds per invoice                         | Prevents abuse                                        |
| 24 | Refunds > $500 require SysAdmin approval          | Approval workflow                                     |
| 25 | Card expiration monitoring                        | Alert at 60 and 14 days before expiry                 |
| 26 | Invoice numbering sequential per tenant           | Format: INV-[SLUG]-[YYYYMM]-[SEQ]                   |
| 27 | Government tier requires PO/Invoice payment       | Card not accepted for government                      |
| 28 | Feature flags per tier                            | Auto-enabled on creation, auto-adjusted on tier change |
| 29 | Impersonation during subscription actions         | All actions logged with impersonation context         |
| 30 | Concurrent modification protection               | Optimistic locking via RowVersion                     |

---

## 28. Edge Cases & Exception Handling

| Edge Case                                    | Handling                                             |
|----------------------------------------------|------------------------------------------------------|
| Payment fails during upgrade                 | Upgrade rolled back, status unchanged, error shown   |
| Double-click on create button                | Idempotency key prevents duplicate creation          |
| Tenant deleted while subscription active     | Block: "Deactivate subscription first"               |
| Admin changes tier while another admin edits | Optimistic concurrency exception → refresh + retry   |
| Invoice generated but payment method removed | Invoice marked "Payment Method Required", alert admin |
| Discount expires mid-cycle                   | Full rate applies from next cycle                    |
| Trial extension requested at max             | Block with clear message, offer conversion           |
| Auto-renew fails, manual renewal also fails  | Enter grace period, escalate to SysAdmin             |
| Tenant requests data export after window     | SysAdmin can override (within retention period)      |
| Legal hold on cancelled tenant               | Retention timer frozen, data preserved               |
| Subscription pause exceeds 90 days           | Auto-resume on Day 91 + billing resumes             |
| Downgrade with active integrations           | Warning: "Lab integration will stop working"         |
| Refund exceeds original payment              | Block: "Refund cannot exceed original amount"        |
| Payment processor outage                     | Queue payments, retry when available, alert SysAdmin |
| Timezone differences in billing              | All billing dates in UTC, display in tenant timezone |
| Leap year billing                            | Daily rate = Monthly / actual days in month          |
| Free tier tenant requests features           | "Upgrade to [Tier] to unlock this feature"           |
| Multiple SysAdmins editing same subscription | Last-write-wins with conflict detection toast        |
| Stripe webhook delivery failure              | Retry with exponential backoff, manual reconciliation |
| Subscription created with past start date    | Block: "Start date cannot be in the past"            |
| Tax rate changes mid-cycle                   | New rate applies from next invoice                   |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned*
