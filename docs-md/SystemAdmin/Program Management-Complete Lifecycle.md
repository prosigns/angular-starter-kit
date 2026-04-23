# BPDS CareTrack™ — Program Management (Complete Lifecycle)

**Document:** Program Management — Full Process Specification
**Roles:** System Administrator, Tenant Administrator
**Platform:** Web Admin Panel (Angular 18+)
**Routes:** `/admin/tenants/:id/programs` (SysAdmin) | `/programs` (Tenant Admin)
**Version:** 1.0
**Last Updated:** April 22, 2026

---

## Table of Contents

1. [What Is a Program in CareTrack](#1-what-is-a-program-in-caretrack)
2. [Program Types](#2-program-types)
3. [Program State Machine](#3-program-state-machine)
4. [Program Structure & Hierarchy](#4-program-structure--hierarchy)
5. [Lifecycle Phase 1: Creation](#5-lifecycle-phase-1-creation)
6. [Lifecycle Phase 2: Configuration](#6-lifecycle-phase-2-configuration)
7. [Lifecycle Phase 3: Activation](#7-lifecycle-phase-3-activation)
8. [Lifecycle Phase 4: Active Operations](#8-lifecycle-phase-4-active-operations)
9. [Lifecycle Phase 5: Edit & Update](#9-lifecycle-phase-5-edit--update)
10. [Lifecycle Phase 6: Staff Assignment](#10-lifecycle-phase-6-staff-assignment)
11. [Lifecycle Phase 7: Client Enrollment](#11-lifecycle-phase-7-client-enrollment)
12. [Lifecycle Phase 8: Check-In Configuration](#12-lifecycle-phase-8-check-in-configuration)
13. [Lifecycle Phase 9: Appointment Configuration](#13-lifecycle-phase-9-appointment-configuration)
14. [Lifecycle Phase 10: Compliance Rules Engine](#14-lifecycle-phase-10-compliance-rules-engine)
15. [Lifecycle Phase 11: UA / Drug Testing Configuration](#15-lifecycle-phase-11-ua--drug-testing-configuration)
16. [Lifecycle Phase 12: Housing Program Configuration](#16-lifecycle-phase-12-housing-program-configuration)
17. [Lifecycle Phase 13: Drug Court / Probation Configuration](#17-lifecycle-phase-13-drug-court--probation-configuration)
18. [Lifecycle Phase 14: Document Requirements](#18-lifecycle-phase-14-document-requirements)
19. [Lifecycle Phase 15: Notification & Reminder Rules](#19-lifecycle-phase-15-notification--reminder-rules)
20. [Lifecycle Phase 16: Reporting Configuration](#20-lifecycle-phase-16-reporting-configuration)
21. [Lifecycle Phase 17: Suspension & Deactivation](#21-lifecycle-phase-17-suspension--deactivation)
22. [Lifecycle Phase 18: Archival & Data Retention](#22-lifecycle-phase-18-archival--data-retention)
23. [Program Dashboard](#23-program-dashboard)
24. [All Programs List Page](#24-all-programs-list-page)
25. [Program Detail Page](#25-program-detail-page)
26. [Cross-Program Client Enrollment](#26-cross-program-client-enrollment)
27. [Inter-Program Communication](#27-inter-program-communication)
28. [Consent & 42 CFR Part 2 Per Program](#28-consent--42-cfr-part-2-per-program)
29. [Database Entities](#29-database-entities)
30. [API Endpoints](#30-api-endpoints)
31. [Notification Matrix](#31-notification-matrix)
32. [Business Rules Master List](#32-business-rules-master-list)
33. [Edge Cases & Exception Handling](#33-edge-cases--exception-handling)

---

## 1. What Is a Program in CareTrack

A **Program** is the fundamental organizational unit within a tenant. It represents a specific service delivery model — a drug court, a recovery housing operation, a probation/parole program, a MAT clinic, or a community-based case management program. Every client interaction, compliance check, appointment, check-in, UA result, and case note belongs to a program.

From the RFP and Brittany's transcript, the key program functions are:

- **Engagement:** Keep clients connected through check-ins, reminders, and messaging
- **Accountability:** Track appointments, UAs, meetings, compliance milestones
- **Adherence:** Monitor treatment plan compliance, housing rules, court conditions
- **Retention:** Identify disengagement early, intervene before dropout

A single tenant (organization) can operate multiple programs simultaneously. For example, Grafton County might run a Drug Court program, a Recovery Housing program, and a Case Management program — all within one CareTrack tenant.

---

## 2. Program Types

### Core Program Types (from RFP + Transcript)

| Type                                | Code  | Description                                                  | Key Features                              |
|-------------------------------------|-------|--------------------------------------------------------------|-------------------------------------------|
| Substance Use Disorder Treatment    | `SUD` | Outpatient/inpatient SUD treatment (OUD, StimUD)            | Treatment plans, MOUD tracking, provider visits |
| Recovery Housing                    | `RH`  | Sober living / recovery residences                           | Rent, meetings, house rules, UA tracking  |
| Drug Court                          | `DC`  | Court-mandated treatment compliance                          | Hearing schedule, conditions, cross-agency |
| Probation / Parole                  | `PP`  | Supervision compliance monitoring                            | Conditions, check-ins, officer contact    |
| Case Management                     | `CM`  | General case management coordination                         | Appointments, referrals, documentation    |
| Medication Assisted Treatment       | `MAT` | MOUD/Suboxone/methadone program                             | Dosing schedule, prescription tracking    |
| Community Based Organization        | `CBO` | Non-profit / community service programs                      | Service tracking, referrals, outcomes     |
| Doorway Program                     | `DW`  | NH-specific Doorway access point program                     | Intake, referrals, warm handoffs          |
| Other                               | `OTH` | Custom program type                                          | Fully configurable                        |

### Program Type Feature Matrix

| Feature                    | SUD | RH  | DC  | PP  | CM  | MAT | CBO | DW  |
|----------------------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Daily Check-Ins            | ✅  | ✅  | ✅  | ✅  | ○   | ✅  | ○   | ○   |
| Weekly Check-Ins           | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Appointment Tracking       | ✅  | ○   | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| UA / Drug Testing          | ✅  | ✅  | ✅  | ✅  | ○   | ✅  | ○   | ○   |
| Treatment Plans            | ✅  | ○   | ○   | ○   | ○   | ✅  | ○   | ○   |
| Housing Rules              | ○   | ✅  | ○   | ○   | ○   | ○   | ○   | ○   |
| Rent / Payment Tracking    | ○   | ✅  | ○   | ○   | ○   | ○   | ○   | ○   |
| Meeting Attendance         | ○   | ✅  | ✅  | ○   | ○   | ○   | ○   | ○   |
| Court Compliance           | ○   | ○   | ✅  | ○   | ○   | ○   | ○   | ○   |
| Hearing Schedule           | ○   | ○   | ✅  | ○   | ○   | ○   | ○   | ○   |
| Supervision Conditions     | ○   | ○   | ✅  | ✅  | ○   | ○   | ○   | ○   |
| Cross-Agency Reporting     | ○   | ○   | ✅  | ✅  | ○   | ○   | ○   | ○   |
| MOUD Tracking              | ✅  | ○   | ○   | ○   | ○   | ✅  | ○   | ○   |
| Compliance Streaks         | ✅  | ✅  | ✅  | ✅  | ○   | ✅  | ○   | ○   |
| Risk Indicators            | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ○   | ✅  |
| Document Uploads           | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Secure Messaging           | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| State/DHHS Reporting       | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Lab Integration (Phase 2)  | ✅  | ○   | ○   | ○   | ○   | ✅  | ○   | ○   |

*✅ = Enabled by default | ○ = Available but not default (can be enabled)*

---

## 3. Program State Machine

```
     ┌──────────┐
     │  DRAFT   │
     └────┬─────┘
          │ Configure + Activate
          ▼
     ┌──────────┐
     │  ACTIVE  │
     └──┬───┬───┘
        │   │
        │   │ Suspend
        │   ▼
        │ ┌──────────┐
        │ │ SUSPENDED│
        │ └──┬───┬───┘
        │    │   │
        │    │   │ Reactivate
        │    │   ▼
        │    │ ┌──────────┐
        │    │ │  ACTIVE  │
        │    │ └──────────┘
        │    │
        │    │ Deactivate
        │    ▼
        │ ┌──────────────┐
        ├─│ DEACTIVATED  │
        │ └──────┬───────┘
        │        │ Archive (after retention)
        │        ▼
        │ ┌──────────────┐
        └─│  ARCHIVED    │
          └──────────────┘
```

### Valid State Transitions

| From         | To           | Trigger                              | Who Can Trigger      |
|--------------|--------------|--------------------------------------|----------------------|
| Draft        | Active       | Configuration complete + activate    | Tenant Admin         |
| Draft        | Deleted      | Delete draft (soft delete)           | Tenant Admin         |
| Active       | Suspended    | Admin suspends program               | Tenant Admin, SysAdmin |
| Active       | Deactivated  | Admin deactivates (all clients discharged) | Tenant Admin, SysAdmin |
| Suspended    | Active       | Admin reactivates                    | Tenant Admin, SysAdmin |
| Suspended    | Deactivated  | Admin deactivates while suspended    | Tenant Admin, SysAdmin |
| Deactivated  | Archived     | Retention period expires             | Automated            |

### Invalid Transitions

| From         | To           | Reason                                          |
|--------------|--------------|-------------------------------------------------|
| Active       | Draft        | Cannot revert to draft once activated            |
| Archived     | Any          | Terminal state                                   |
| Deactivated  | Active       | Must create new program                          |
| Any          | Active       | Cannot activate with enrolled clients if suspended (must discharge first or reactivate) |

---

## 4. Program Structure & Hierarchy

```
Tenant (Organization)
  │
  ├── Program A: "Grafton Drug Court"
  │     ├── Staff Assignments
  │     │     ├── Judge Williams (Court Officer)
  │     │     ├── Sarah Chen (Case Manager)
  │     │     └── Dr. Patel (Treatment Provider)
  │     │
  │     ├── Enrolled Clients
  │     │     ├── Client 001 (Phase 2)
  │     │     ├── Client 002 (Phase 1)
  │     │     └── Client 003 (Phase 3)
  │     │
  │     ├── Program Phases
  │     │     ├── Phase 1: Orientation (0-30 days)
  │     │     ├── Phase 2: Active Treatment (31-120 days)
  │     │     ├── Phase 3: Stabilization (121-240 days)
  │     │     └── Phase 4: Maintenance (241-365 days)
  │     │
  │     ├── Compliance Rules
  │     │     ├── Check-in frequency: Daily
  │     │     ├── UA frequency: 2x/week (Phase 1), 1x/week (Phase 2+)
  │     │     ├── Meeting attendance: 3x/week
  │     │     └── Court hearing attendance: Required
  │     │
  │     ├── Document Requirements
  │     │     ├── UA results
  │     │     ├── Attendance verification
  │     │     └── Court orders
  │     │
  │     └── Notification Rules
  │           ├── Check-in reminder: 9:00 AM daily
  │           ├── Appointment reminder: 24h + 1h before
  │           └── Missed check-in escalation: 2h after deadline
  │
  ├── Program B: "Carroll Recovery Housing"
  │     └── (similar structure, housing-specific config)
  │
  └── Program C: "Northern NH Case Management"
        └── (similar structure, CM-specific config)
```

---

## 5. Lifecycle Phase 1: Creation

### Route
`/programs/new` (Tenant Admin) | `/admin/tenants/:id/programs/new` (SysAdmin)

### Creation Process Flow

```
Admin clicks [+ New Program]
         │
         ▼
┌─────────────────────────┐
│ Step 1: Program Basics  │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 2: Program Type    │
│ & Feature Selection     │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 3: Program Phases  │
│ (Optional)              │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 4: Compliance Rules│
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 5: Check-In Config │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 6: Appointment     │
│ Configuration           │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 7: UA / Testing    │
│ Configuration           │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 8: Document Reqs   │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 9: Notification    │
│ Rules                   │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 10: Staff Assign   │
│ (Optional at creation)  │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Step 11: Review & Save  │
└────────────┬────────────┘
             │
      ┌──────┴──────┐
      ▼              ▼
[Save as Draft]  [Save & Activate]
```

### Step 1: Program Basics

| Field                  | Type          | Validation                          | Required |
|------------------------|---------------|-------------------------------------|:--------:|
| Program Name           | Text input    | 3–256 chars, unique within tenant   | Yes      |
| Program Code           | Text input    | Auto-generated, editable, 2–20 chars, uppercase | Yes |
| Description            | Textarea      | 0–1000 chars                        | No       |
| Program Director       | Text input    | Full name                           | No       |
| Director Email         | Email input   | Valid email                         | No       |
| Director Phone         | Phone input   | US format                           | No       |
| Program Address        | Address fields| Can inherit from tenant or custom   | No       |
| Funding Source          | Dropdown      | State/DHHS, Federal Grant, County, Private, Medicaid, Self-Pay, Mixed | No |
| Grant/Contract Number  | Text input    | Reference number                    | No       |
| Start Date             | Date picker   | Program operational start           | No       |
| Expected End Date      | Date picker   | For grant-funded programs           | No       |
| Capacity               | Number input  | Max clients at any time (0=unlimited) | No     |

### Step 2: Program Type & Feature Selection

| Field                  | Type          | Detail                              |
|------------------------|---------------|-------------------------------------|
| Program Type           | Radio cards   | 9 types from Section 2 — each card shows description + default features |
| Feature Toggles        | Checkbox list | Pre-selected based on type, admin can enable/disable |

**Feature Toggle List:**

| Feature                    | Key                    | Description                                  |
|----------------------------|------------------------|----------------------------------------------|
| Daily Check-Ins            | `daily_checkins`       | Clients submit daily status check-ins        |
| Weekly Check-Ins           | `weekly_checkins`      | Clients submit weekly comprehensive check-ins|
| Appointment Tracking       | `appointments`         | Schedule and track client appointments       |
| UA / Drug Testing          | `ua_testing`           | Track urinalysis and drug test results       |
| Treatment Plans            | `treatment_plans`      | Create and monitor treatment plans           |
| Housing Rules              | `housing_rules`        | Define and enforce sober living rules        |
| Rent / Payment Tracking    | `rent_tracking`        | Track resident rent and payments             |
| Meeting Attendance         | `meeting_attendance`   | Track recovery meeting attendance            |
| Court Compliance           | `court_compliance`     | Monitor court-ordered conditions             |
| Hearing Schedule           | `hearing_schedule`     | Track court hearing dates and outcomes       |
| Supervision Conditions     | `supervision_conditions` | Track probation/parole conditions          |
| Cross-Agency Reporting     | `cross_agency`         | Share compliance status with external agencies|
| MOUD Tracking              | `moud_tracking`        | Track medication dosing and adherence        |
| Compliance Streaks         | `compliance_streaks`   | Gamified streak tracking for motivation      |
| Risk Indicators            | `risk_indicators`      | Auto-detect disengagement risk signals       |
| Document Uploads           | `document_uploads`     | Client and staff document management         |
| Secure Messaging           | `secure_messaging`     | In-platform encrypted messaging              |
| Lab Integration            | `lab_integration`      | HL7/FHIR lab result integration (Phase 2)    |

---

## 6. Lifecycle Phase 2: Configuration

### Step 3: Program Phases (Optional)

Programs can define structured phases that clients progress through. Each phase can have its own compliance rules, check-in frequency, and UA schedule.

| Field                  | Type          | Detail                              |
|------------------------|---------------|-------------------------------------|
| Enable Phases          | Toggle        | "Use phased progression for this program?" |
| Phase Name             | Text input    | e.g., "Orientation", "Active Treatment" |
| Phase Order            | Number        | Sequential order (1, 2, 3...)       |
| Duration (Days)        | Number input  | Expected duration in days (0=open-ended) |
| Phase Description      | Textarea      | What happens in this phase          |
| Entry Criteria         | Textarea      | Requirements to enter this phase    |
| Graduation Criteria    | Textarea      | Requirements to advance to next phase |
| Phase Color            | Color picker  | For visual identification in UI     |
| [+ Add Phase]          | Button        | Add another phase                   |

### Drug Court Default Phases

| Phase | Name                 | Duration | Check-In | UA Freq    | Meetings |
|:-----:|----------------------|:--------:|:--------:|:----------:|:--------:|
| 1     | Orientation          | 30 days  | Daily    | 3x/week    | 5x/week  |
| 2     | Active Treatment     | 90 days  | Daily    | 2x/week    | 3x/week  |
| 3     | Stabilization        | 120 days | Daily    | 1x/week    | 2x/week  |
| 4     | Maintenance          | 120 days | Weekly   | 1x/2 weeks | 1x/week  |
| 5     | Aftercare            | Open     | Weekly   | Random     | 1x/week  |

### Recovery Housing Default Phases

| Phase | Name                 | Duration | Check-In | UA Freq    | Meetings |
|:-----:|----------------------|:--------:|:--------:|:----------:|:--------:|
| 1     | Intake / Probation   | 30 days  | Daily    | 2x/week    | Daily    |
| 2     | Resident             | Open     | Daily    | 1x/week    | 4x/week  |
| 3     | Senior Resident      | Open     | Weekly   | Random     | 2x/week  |

---

## 7. Lifecycle Phase 3: Activation

### Activation Prerequisites

| Prerequisite                          | Validation                                    |
|---------------------------------------|-----------------------------------------------|
| Program name set                      | Non-empty, unique within tenant               |
| Program type selected                 | Valid program type                             |
| At least one feature enabled          | Minimum 1 feature toggle on                   |
| Compliance rules configured           | At least basic rules if compliance features enabled |
| Check-in config set                   | If check-in features enabled                  |
| Tenant subscription supports it       | `current_programs < max_programs`             |
| Feature flags match subscription tier | Program features within tier allowance        |

### Activation Effects

| Action                                | Timing      |
|---------------------------------------|-------------|
| Program status → Active               | Immediate   |
| Program visible to staff              | Immediate   |
| Client enrollment enabled             | Immediate   |
| Notification rules activated          | Immediate   |
| Program added to dashboards           | Immediate   |
| Audit log entry created               | Immediate   |

---

## 8. Lifecycle Phase 4: Active Operations

### Active Program Monitoring

| Monitor                          | Threshold       | Action                              |
|----------------------------------|-----------------|-------------------------------------|
| Capacity approaching             | 85%             | Warning to program director         |
| Capacity reached                 | 100%            | Block new enrollments + alert       |
| No activity (dormant)            | 30 days         | Alert to tenant admin               |
| High non-compliance rate         | > 40%           | Alert to program director + admin   |
| Missed check-in rate rising      | > 25% in 7 days | Risk alert                          |
| Staff-to-client ratio            | > 1:25          | Staffing recommendation alert       |
| Average days to intervention     | > 48 hours      | Process improvement alert           |

---

## 9. Lifecycle Phase 5: Edit & Update

### Editable Fields (Active Program)

| Field                    | Editable | Impact of Change                      | Requires Confirmation |
|--------------------------|:--------:|---------------------------------------|:---------------------:|
| Program Name             | Yes      | Updates across all references         | Yes                   |
| Description              | Yes      | Display only                          | No                    |
| Program Director         | Yes      | Notification to old + new director    | Yes                   |
| Director Contact Info    | Yes      | Display only                          | No                    |
| Capacity                 | Yes      | Cannot set below current enrollment   | Yes (if reducing)     |
| Feature Toggles          | Yes      | Enabling = immediate; Disabling = confirmation required | Yes (disable) |
| Compliance Rules         | Yes      | Affects all future compliance checks  | Yes                   |
| Check-In Configuration   | Yes      | Affects all future check-in schedules | Yes                   |
| UA Configuration         | Yes      | Affects all future UA schedules       | Yes                   |
| Notification Rules       | Yes      | Affects all future notifications      | No                    |
| Program Phases           | Yes      | Cannot delete phases with active clients | Yes              |
| Phase Duration           | Yes      | Does not retroactively change existing clients | No       |
| Program Address          | Yes      | Display only                          | No                    |
| Funding Source           | Yes      | Reporting impact                      | No                    |

### Non-Editable Fields

| Field                    | Reason                                          |
|--------------------------|-------------------------------------------------|
| Program Code             | Used in integrations, reporting, audit trail     |
| Program Type             | Fundamental to feature configuration — create new program instead |
| Tenant ID                | Cannot reassign program to different tenant      |
| Created Date             | Historical record                                |
| Program ID               | System-generated, immutable                      |

### Feature Toggle Disable Warning

When disabling a feature on an active program:

```
┌──────────────────────────────────────────┐
│ ⚠️ Disable "UA / Drug Testing"?          │
│                                          │
│ This will affect:                        │
│ • 187 enrolled clients                   │
│ • 342 existing UA records (preserved)    │
│ • 12 pending UA results                  │
│ • 3 scheduled UA reminders               │
│                                          │
│ Existing data will be preserved but:     │
│ • No new UA results can be entered       │
│ • UA-related reminders will stop         │
│ • UA compliance rules will be inactive   │
│ • UA columns hidden from dashboards      │
│                                          │
│ [Cancel] [Disable Feature]               │
└──────────────────────────────────────────┘
```

---

## 10. Lifecycle Phase 6: Staff Assignment

### Staff Roles Within a Program

| Role                       | Description                                      | Max Per Program |
|----------------------------|--------------------------------------------------|:---------------:|
| Program Director           | Oversight, reporting, strategic                  | 1               |
| Lead Case Manager          | Senior case manager, caseload oversight           | 2               |
| Case Manager               | Direct client management                         | Unlimited       |
| Treatment Provider         | Clinical provider, prescriber                    | Unlimited       |
| Court Officer              | Drug court judge or liaison                      | 3               |
| Probation Officer          | P.O. assigned to program                         | Unlimited       |
| Housing Manager            | Recovery house manager/coordinator               | 3               |
| Peer Support Specialist    | Peer recovery support                            | Unlimited       |
| Administrative Support     | Data entry, scheduling                           | Unlimited       |
| Read-Only Observer         | Auditors, evaluators                             | Unlimited       |

### Staff Assignment UI

| Field                  | Type           | Detail                              |
|------------------------|----------------|-------------------------------------|
| Select Staff Member    | Searchable dropdown | Tenant users with Provider/CaseManager role |
| Program Role           | Dropdown       | From roles table above               |
| Start Date             | Date picker    | Default: today                       |
| End Date               | Date picker    | Optional (for temporary assignments) |
| Caseload Limit         | Number input   | Max clients this staff member handles in this program |
| Primary Contact        | Toggle         | Is this person the primary contact for the program? |
| Receive Escalations    | Toggle         | Receive escalation alerts for this program? |
| Notes                  | Textarea       | Assignment notes                     |

### Staff Assignment Rules

| Rule                                              | Logic                                 |
|---------------------------------------------------|---------------------------------------|
| Staff must belong to same tenant                  | `staff.tenant_id = program.tenant_id` |
| Staff must have Provider or CaseManager system role | Validates against RBAC              |
| One staff member can be in multiple programs      | Cross-program assignment allowed      |
| Caseload limit enforced on client assignment      | Cannot assign client if staff at limit|
| Removing staff with active clients                | Requires reassignment first           |
| Program Director is required for activation       | At least 1 director assigned          |

---

## 11. Lifecycle Phase 7: Client Enrollment

### Enrollment Process

```
Staff clicks [+ Enroll Client]
         │
         ▼
┌──────────────────────────────────────────┐
│ Enrollment Modal / Page                  │
│                                          │
│ Client:                                  │
│ ○ Existing Client: [Search dropdown]     │
│ ○ New Client: [Create new intake]        │
│                                          │
│ ─────────────────────────────────────── │
│ Program: [Auto-filled from context]      │
│                                          │
│ Starting Phase: [Phase 1 - Orientation ▼]│
│                                          │
│ Enrollment Date: [Date picker]           │
│                                          │
│ Assigned Case Manager: [Dropdown]        │
│ Assigned Provider: [Dropdown] (optional) │
│                                          │
│ Referral Source:                          │
│ [Court Order ▼]                          │
│ Referral Reference: [Text input]         │
│                                          │
│ ─────────────────────────────────────── │
│ CONSENT (42 CFR Part 2):                 │
│                                          │
│ ☐ Client has signed consent form         │
│ ☐ Consent covers this program's data     │
│   sharing requirements                   │
│ Consent Form Version: [v2.1 ▼]          │
│ Consent Signed Date: [Date picker]       │
│                                          │
│ ─────────────────────────────────────── │
│ PROGRAM-SPECIFIC FIELDS:                 │
│                                          │
│ [Housing]: Room Assignment [Dropdown]    │
│ [Drug Court]: Case Number [Text]         │
│ [Drug Court]: Next Hearing [Date]        │
│ [Probation]: P.O. Name [Text]            │
│ [Probation]: Supervision Level [Dropdown]│
│                                          │
│ Notes: [Textarea]                        │
│                                          │
│ [Cancel] [Enroll Client]                 │
└──────────────────────────────────────────┘
```

### Enrollment Validation Rules

| Rule                                              | Validation                            |
|---------------------------------------------------|---------------------------------------|
| Client not already enrolled in this program       | Check active enrollment               |
| Program capacity not exceeded                     | `enrolled_count < capacity`           |
| Assigned staff belongs to this program            | Staff must be assigned to program     |
| Assigned staff not at caseload limit              | `staff.current_caseload < caseload_limit` |
| Consent required for 42 CFR Part 2 programs       | Consent checkbox must be checked      |
| Client age validation                             | Must be 18+ (or guardian consent for minors) |
| Program is Active                                 | Cannot enroll in Draft/Suspended/Deactivated programs |

### Enrollment Effects

| Action                                    | Timing      |
|-------------------------------------------|-------------|
| Client enrollment record created          | Immediate   |
| Client assigned to starting phase         | Immediate   |
| Check-in schedule activated               | Immediate   |
| Compliance tracking started               | Immediate   |
| Welcome notification sent to client       | Immediate   |
| Notification to assigned case manager     | Immediate   |
| Client appears on staff caseload          | Immediate   |
| Consent record created                    | Immediate   |
| Audit log entry                           | Immediate   |

### Discharge Process

| Field                  | Type          | Detail                              |
|------------------------|---------------|-------------------------------------|
| Discharge Type         | Dropdown      | Successful Completion, Administrative, Voluntary Withdrawal, Non-Compliance, Transfer, Incarceration, Deceased, Lost to Follow-Up, Other |
| Discharge Date         | Date picker   | Default: today                      |
| Discharge Reason       | Textarea      | Required                            |
| Discharge Summary      | Textarea      | Clinical / program summary          |
| Final Compliance Status| Display       | Auto-calculated from records        |
| Transfer To            | Dropdown      | If Transfer: select destination program |
| Referrals Made         | Multi-select  | External referrals at discharge     |
| Follow-Up Plan         | Textarea      | Post-discharge follow-up notes      |
| Close All Open Items   | Checkbox list | Auto-close open check-ins, appointments, etc. |

---

## 12. Lifecycle Phase 8: Check-In Configuration

### Check-In Types

| Type              | Frequency     | Purpose                                  | Default Questions |
|-------------------|---------------|------------------------------------------|:-----------------:|
| Daily Check-In    | Every day     | Quick status, mood, safety               | 3–5               |
| Weekly Check-In   | Once per week | Comprehensive weekly review              | 8–12              |
| Custom Check-In   | Custom        | Program-specific assessments             | Custom            |

### Check-In Configuration UI

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Check-In Type            | Dropdown      | Daily, Weekly, Custom               |
| Frequency                | Dropdown      | Daily, Weekdays Only, Specific Days, Weekly, Bi-Weekly, Custom |
| Specific Days            | Multi-select  | Mon, Tue, Wed, Thu, Fri, Sat, Sun   |
| Check-In Window Opens    | Time picker   | When check-in becomes available (e.g., 6:00 AM) |
| Check-In Deadline        | Time picker   | When check-in must be completed (e.g., 10:00 PM) |
| Late Check-In Grace      | Number (min)  | Minutes after deadline still accepted as "late" |
| Missed Check-In Action   | Dropdown      | Flag Only, Notify Staff, Escalate, Auto-Violation |
| Phase-Specific Override  | Toggle        | Different frequency per program phase |

### Check-In Question Builder

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Question Text            | Text input    | Plain language question              |
| Question Type            | Dropdown      | Scale (1-10), Yes/No, Multiple Choice, Text, Mood Emoji, Number |
| Required                 | Toggle        | Must answer to submit               |
| Options                  | List input    | For multiple choice questions        |
| Risk Flag Trigger        | Condition     | "If answer = X, flag as risk"       |
| Order                    | Drag-and-drop | Question display order              |
| Phase Specific           | Toggle        | Only show in certain phases         |
| [+ Add Question]         | Button        | Add another question                |

### Default Daily Check-In Questions

| #  | Question                                    | Type        | Risk Trigger              |
|----|---------------------------------------------|-------------|---------------------------|
| 1  | How are you feeling today?                  | Mood Emoji  | Very Low mood → flag      |
| 2  | Did you take your medication today?         | Yes/No      | No → flag (if MOUD)       |
| 3  | Have you used any substances in the last 24 hours? | Yes/No | Yes → escalate        |
| 4  | Did you attend your required meetings/appointments today? | Yes/No | No → flag       |
| 5  | Is there anything you'd like to share with your team? | Text | Contains crisis keywords → escalate |

### Crisis Keyword Detection

| Category        | Keywords                                              | Action          |
|-----------------|-------------------------------------------------------|-----------------|
| Self-Harm       | "hurt myself", "end it", "suicide", "don't want to live" | Immediate escalation to staff + crisis resources |
| Substance Use   | "relapsed", "used", "slipped", "high"                 | Flag + notify case manager |
| Housing Crisis   | "kicked out", "homeless", "nowhere to go"             | Flag + notify case manager |
| Safety Concern   | "threatened", "scared", "abuse", "unsafe"             | Immediate escalation |

---

## 13. Lifecycle Phase 9: Appointment Configuration

### Appointment Types (Per Program)

| Type                    | Default Duration | Recurring | Mandatory |
|-------------------------|:----------------:|:---------:|:---------:|
| Case Management Visit   | 60 min           | Weekly    | Yes       |
| Provider Visit          | 30 min           | Bi-weekly | Yes       |
| Court Hearing           | Variable         | Per schedule | Yes    |
| Group Session           | 90 min           | Per schedule | Varies |
| UA Collection           | 15 min           | Per schedule | Yes    |
| Intake Assessment       | 90 min           | One-time  | Yes       |
| Discharge Planning      | 60 min           | One-time  | Yes       |
| Peer Support Meeting    | 45 min           | Weekly    | No        |
| Recovery Meeting (AA/NA)| 60 min           | Per schedule | Varies |
| Housing Inspection      | 30 min           | Monthly   | Yes       |
| Custom                  | Custom           | Custom    | Custom    |

### Appointment Configuration

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Appointment Type         | Dropdown      | From types above + custom           |
| Default Duration         | Number (min)  | Default time for this type          |
| Location Options         | Multi-select  | In-Person, Phone, Video, Off-Site   |
| Default Location         | Dropdown      | Default location type               |
| Recurring Template       | Toggle        | Create repeating appointment        |
| Recurrence Pattern       | Dropdown      | Daily, Weekly, Bi-Weekly, Monthly, Custom |
| Reminder Settings        | Multi-input   | Reminders at: 24h, 2h, 1h before (configurable) |
| No-Show Policy           | Dropdown      | Flag Only, Notify Staff, Escalate, Auto-Violation |
| No-Show Grace Period     | Number (min)  | Minutes late before marked no-show  |
| Rescheduling Allowed     | Toggle        | Can client reschedule?              |
| Reschedule Window        | Number (hours) | How far in advance must they reschedule |
| Cancellation Policy      | Dropdown      | Anytime, 24h Notice, 48h Notice, No Cancel |

---

## 14. Lifecycle Phase 10: Compliance Rules Engine

### Compliance Rule Types

| Rule Category        | Examples                                              |
|----------------------|-------------------------------------------------------|
| Attendance           | "Must attend all scheduled appointments"              |
| Check-In             | "Must complete daily check-in by 10:00 PM"            |
| UA / Testing         | "Must produce negative UA results"                    |
| Meeting Attendance   | "Must attend minimum 3 recovery meetings per week"    |
| Curfew               | "Must be at residence by 10:00 PM (housing)"          |
| Payment              | "Must pay weekly rent of $150 by Friday"              |
| Documentation        | "Must submit attendance verification within 48 hours" |
| Court                | "Must attend all scheduled court hearings"            |
| Behavioral           | "No physical altercations, no theft"                  |
| Custom               | Admin-defined rules                                   |

### Compliance Rule Builder

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Rule Name                | Text input    | e.g., "Daily Check-In Compliance"   |
| Rule Category            | Dropdown      | From categories above               |
| Description              | Textarea      | Plain language rule description      |
| Measurement              | Dropdown      | Count, Percentage, Boolean, Threshold |
| Target Value             | Number/Bool   | e.g., 100% (attendance), 0 (positive UAs) |
| Evaluation Period        | Dropdown      | Daily, Weekly, Monthly, Per Phase   |
| Violation Severity       | Dropdown      | Minor, Moderate, Major, Critical    |
| Auto-Detection           | Toggle        | System automatically detects violations |
| First Violation Action   | Dropdown      | Warning, Notify Staff, Notify Client + Staff |
| Repeat Violation Action  | Dropdown      | Escalate, Phase Regression, Sanctions, Review |
| Violation Threshold      | Number        | Number of violations before escalation |
| Phase Specific           | Toggle        | Different rules per phase           |
| Applies To               | Multi-select  | All clients, specific phases, specific referral types |

### Compliance Streak Configuration

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Enable Streaks           | Toggle        | Track consecutive compliance days   |
| Streak Milestones        | List input    | 7, 14, 30, 60, 90, 180, 365 days   |
| Milestone Notification   | Toggle        | Notify client on milestone          |
| Milestone Message        | Text input    | Custom congratulation message per milestone |
| Streak Reset Trigger     | Multi-select  | Missed check-in, Positive UA, Missed appointment, Any violation |
| Display on Client Portal | Toggle        | Show streak counter to client       |

### Risk Indicator Configuration

| Indicator                    | Detection Logic                          | Default Weight |
|------------------------------|------------------------------------------|:--------------:|
| Missed check-ins (2+ in 7d) | `missed_checkins >= 2 in last 7 days`    | High           |
| Missed appointments (1+)     | `missed_appointments >= 1 in last 14 days` | High         |
| Declining mood trend         | `avg_mood_score decreasing over 7 days`  | Medium         |
| Positive UA result           | `latest_ua_result = positive`            | Critical       |
| No contact (7+ days)         | `last_activity > 7 days ago`             | High           |
| Late check-ins (3+ in 7d)   | `late_checkins >= 3 in last 7 days`      | Medium         |
| Declining check-in responses | `check_in_quality_score decreasing`      | Medium         |
| Housing payment overdue      | `rent_overdue > 7 days`                  | Medium         |
| Phase regression             | `phase_changed to lower phase`           | High           |
| Staff override               | Manual flag by staff                     | Custom         |

**Risk Score Calculation:**
```
Risk Score = Σ (indicator_weight × indicator_present)
  0-20:  Low Risk (Green)
  21-50: Medium Risk (Yellow)
  51-75: High Risk (Orange)
  76-100: Critical Risk (Red) — immediate intervention required
```

---

## 15. Lifecycle Phase 11: UA / Drug Testing Configuration

### UA Configuration

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Testing Enabled          | Toggle        | Enable UA tracking for this program |
| Testing Frequency        | Dropdown      | Random, 1x/week, 2x/week, 3x/week, Daily, Custom |
| Random Testing Config    | Number        | Min and max tests per month         |
| Random Selection Method  | Dropdown      | Color System, Number System, True Random |
| Testing Labs             | Multi-select  | Aegis Sciences, Dominion Diagnostics, On-Site, Other |
| Test Panel               | Multi-select  | Standard 5-panel, 10-panel, 12-panel, Custom |
| Result Entry Method      | Multi-select  | Manual Entry, Document Upload, Lab Integration (Phase 2) |
| Positive Result Action   | Dropdown      | Flag, Notify Staff, Escalate, Auto-Violation, Sanctions |
| Dilute Result Action     | Dropdown      | Retest, Flag, Treat as Positive     |
| Missed Test Action       | Dropdown      | Flag, Treat as Positive, Escalate   |
| Chain of Custody         | Toggle        | Required for court-admissible results |
| Phase-Specific Frequency | Toggle        | Different UA frequency per phase    |

### UA Result Tracking Fields

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Client                   | Display       | Client name                         |
| Test Date                | Date picker   | When specimen collected             |
| Test Type                | Dropdown      | Urine, Oral Swab, Blood, Hair      |
| Panel Type               | Dropdown      | 5, 10, 12, Custom                  |
| Collection Method        | Dropdown      | Observed, Unobserved, Random        |
| Lab / Testing Site       | Dropdown      | From configured labs                |
| Specimen ID              | Text input    | Lab specimen identifier             |
| Overall Result           | Dropdown      | Negative, Positive, Dilute, Invalid, Pending |
| Substances Detected      | Multi-select  | From panel substances list          |
| Levels (if quantitative) | Number inputs | Per substance (ng/mL)              |
| Confirmation Testing     | Toggle        | Confirmatory test requested?        |
| Chain of Custody Doc     | File upload   | CoC form attachment                 |
| Lab Report               | File upload   | Full lab report attachment          |
| Notes                    | Textarea      | Staff notes                         |
| Reviewed By              | Auto-filled   | Reviewing staff member              |
| Reviewed At              | Auto-filled   | Timestamp                           |

---

## 16. Lifecycle Phase 12: Housing Program Configuration

*Only visible when Program Type = Recovery Housing or `housing_rules` feature enabled*

### Housing Configuration

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| House Name               | Text input    | e.g., "Serenity House"             |
| House Address            | Address fields| Physical address                    |
| Total Beds/Rooms         | Number        | Capacity                            |
| Room Types               | List builder  | Single, Double, Shared              |
| House Manager            | Dropdown      | Assigned staff member               |

### Rent / Payment Configuration

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Rent Amount              | Currency      | Weekly or monthly                   |
| Billing Frequency        | Dropdown      | Weekly, Bi-Weekly, Monthly          |
| Due Day                  | Dropdown      | Day of week or month                |
| Grace Period             | Number (days) | Days after due before late          |
| Late Fee                 | Currency      | Late payment fee amount             |
| Payment Methods Accepted | Multi-select  | Cash, Money Order, Card, Payroll Deduction |
| Financial Aid Eligible   | Toggle        | Can funding cover rent?             |

### House Rules Builder

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Rule Name                | Text input    | e.g., "Curfew"                     |
| Rule Description         | Textarea      | Full rule text                      |
| Violation Severity       | Dropdown      | Warning, Minor, Major, Immediate Discharge |
| Monitoring Method        | Dropdown      | Self-Report, Staff Verification, Automated |
| Max Violations Before Action | Number    | e.g., 3 warnings before discharge  |

### Default House Rules

| Rule                              | Severity | Max Violations |
|-----------------------------------|:--------:|:--------------:|
| Curfew (10:00 PM)                 | Minor    | 3              |
| No substance use on premises      | Major    | 1              |
| Attend required meetings          | Minor    | 3              |
| Pay rent on time                  | Minor    | 2              |
| Maintain assigned chores          | Warning  | 5              |
| No overnight guests without approval | Minor | 2              |
| No violence or threats            | Immediate| 0 (immediate)  |
| No theft                          | Immediate| 0 (immediate)  |
| Participate in weekly house meeting| Warning  | 4              |
| Submit to random UA               | Major    | 1              |

---

## 17. Lifecycle Phase 13: Drug Court / Probation Configuration

*Only visible when Program Type = Drug Court or Probation/Parole or features enabled*

### Court Configuration

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Court Name               | Text input    | e.g., "Grafton County Drug Court"  |
| Presiding Judge          | Text input    | Judge name                          |
| Court Location           | Address       | Court address                       |
| Court Session Days       | Multi-select  | Days when court is in session       |
| Default Hearing Time     | Time picker   | Regular hearing time                |
| Hearing Frequency        | Dropdown      | Weekly, Bi-Weekly, Monthly, Per Phase |

### Supervision Conditions Builder

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Condition Name           | Text input    | e.g., "Maintain employment"        |
| Condition Description    | Textarea      | Full condition text                 |
| Condition Source         | Dropdown      | Court Order, Probation, Parole, Program |
| Verification Method      | Dropdown      | Self-Report, Staff Verification, Document Upload, Third Party |
| Verification Frequency   | Dropdown      | Daily, Weekly, Monthly, As Needed  |
| Start Date               | Date picker   | When condition takes effect         |
| End Date                 | Date picker   | When condition expires (or open-ended) |
| Compliance Required      | Toggle        | Is this mandatory?                  |
| Non-Compliance Action    | Dropdown      | Warning, Report to Court, Sanctions, Revocation Hearing |

### Cross-Agency Communication

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Reporting Agency         | Text input    | e.g., "Grafton County Probation"   |
| Agency Contact           | Text/Email    | Contact person                      |
| Report Frequency         | Dropdown      | Weekly, Bi-Weekly, Monthly, Per Hearing |
| Report Format            | Dropdown      | Standard Template, Custom, Free Text |
| Automated Report         | Toggle        | Auto-generate compliance report    |
| Data Shared              | Multi-select  | Attendance, UA Results, Check-Ins, Compliance Status, Violations |
| Consent Required         | Toggle        | 42 CFR Part 2 consent needed       |

---

## 18. Lifecycle Phase 14: Document Requirements

### Required Documents Configuration

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Document Type            | Text input    | e.g., "UA Results"                  |
| Description              | Textarea      | What qualifies as this document     |
| Required At              | Dropdown      | Enrollment, Ongoing, Discharge, Per Phase |
| Submission Frequency     | Dropdown      | One-Time, Weekly, Monthly, Per Event, As Needed |
| Accepted Formats         | Multi-select  | PDF, JPG, PNG, DOC, DOCX           |
| Max File Size            | Number (MB)   | Maximum upload size                 |
| Auto-Expire              | Toggle        | Document expires after set period   |
| Expiration Period        | Number (days) | Days until document expires         |
| Missing Document Action  | Dropdown      | Reminder, Flag, Escalate, Compliance Violation |
| Phase Specific           | Toggle        | Required only in certain phases     |

---

## 19. Lifecycle Phase 15: Notification & Reminder Rules

### Notification Rule Configuration

| Rule Type                | Trigger                              | Recipients           | Channel         | Timing            |
|--------------------------|--------------------------------------|-----------------------|-----------------|-------------------|
| Check-In Reminder        | Check-in window opens                | Client               | SMS + Push      | At window open    |
| Check-In Warning         | 2 hours before deadline              | Client               | SMS + Push      | 2h before         |
| Missed Check-In          | Deadline passed, no submission       | Client + Case Manager | SMS + In-App   | Immediately       |
| Appointment Reminder     | Upcoming appointment                 | Client               | SMS + Push + Email | 24h + 1h before |
| Missed Appointment       | No-show after grace period           | Case Manager          | In-App + Email  | Immediately       |
| UA Scheduled             | UA test day                          | Client               | SMS + Push      | Morning of        |
| Positive UA              | Positive result entered              | Case Manager + Director | In-App + Email | Immediately     |
| Compliance Violation     | Rule violated                        | Case Manager          | In-App          | Immediately       |
| Risk Alert               | Risk score exceeds threshold         | Case Manager + Director | In-App + Email | Immediately     |
| Streak Milestone         | Client hits milestone                | Client               | Push + In-App   | Immediately       |
| Phase Advancement        | Client promoted to next phase        | Client + Team         | In-App + Email  | Immediately       |
| Rent Overdue             | Rent past grace period               | Client + Housing Mgr  | SMS + In-App    | Day after grace   |
| Court Hearing Reminder   | Upcoming hearing                     | Client + Case Manager | SMS + Email     | 48h + 24h before |
| Document Expiring        | Required doc nearing expiration      | Client + Staff        | In-App          | 14d + 7d before   |
| Enrollment Welcome       | Client enrolled in program           | Client               | SMS + Email     | Immediately       |
| Discharge Notice         | Client being discharged              | Client               | Email           | Immediately       |
| Staff Assignment         | Staff assigned to program            | Staff member          | Email + In-App  | Immediately       |
| Capacity Warning         | Program near capacity                | Director + Admin      | In-App          | At 85%            |

### Notification Channel Configuration

| Channel       | Configuration                                        |
|---------------|------------------------------------------------------|
| SMS           | Enabled/disabled per program, opt-out allowed         |
| Push          | Enabled/disabled, requires mobile app                |
| Email         | Enabled/disabled, custom from address optional       |
| In-App        | Always enabled, cannot be disabled                   |
| Phone Call    | Future phase — automated voice reminders             |

### Notification Quiet Hours

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Enable Quiet Hours       | Toggle        | Suppress non-critical notifications |
| Quiet Start              | Time picker   | e.g., 10:00 PM                     |
| Quiet End                | Time picker   | e.g., 7:00 AM                      |
| Override for Critical    | Toggle        | Crisis/safety alerts bypass quiet hours |

---

## 20. Lifecycle Phase 16: Reporting Configuration

### Standard Program Reports

| Report                          | Frequency    | Audience                  |
|---------------------------------|:------------:|---------------------------|
| Program Summary                 | Weekly       | Director, Admin           |
| Client Engagement Report        | Weekly       | Director, Staff           |
| Compliance Dashboard            | Real-time    | All staff                 |
| UA Results Summary              | Weekly       | Director, Staff           |
| Attendance Report               | Weekly       | Director, Staff           |
| Missed Appointments Report      | Daily        | Case Managers             |
| Risk Indicator Report           | Daily        | Case Managers, Director   |
| Caseload Distribution           | Monthly      | Director, Admin           |
| Client Outcomes Report          | Monthly      | Director, Admin, DHHS     |
| Retention Analysis              | Monthly      | Director, Admin           |
| State/DHHS Compliance Report    | Monthly/Quarterly | Admin, State          |
| Financial Report (Housing)      | Monthly      | Housing Manager, Admin    |
| Court Compliance Report         | Per hearing  | Court Officer, Judge      |
| Phase Progression Report        | Monthly      | Director                  |
| Discharge Summary Report        | Per discharge| Director, Referral Source  |

### Custom Report Builder

| Feature                  | Detail                                              |
|--------------------------|-----------------------------------------------------|
| Drag-and-Drop Fields     | Select data fields to include                       |
| Filter Builder           | Date range, phase, staff, compliance status         |
| Grouping                 | Group by phase, staff, referral source, month       |
| Aggregation              | Count, average, sum, min, max, percentage           |
| Visualization            | Table, bar chart, line chart, pie chart             |
| Schedule                 | One-time, daily, weekly, monthly                    |
| Auto-Email               | Send to specified recipients on schedule            |
| Export Formats            | PDF, CSV, Excel, JSON                               |

---

## 21. Lifecycle Phase 17: Suspension & Deactivation

### Program Suspension

| Field                    | Detail                                              |
|--------------------------|-----------------------------------------------------|
| Warning                  | "Suspending will pause all program activity for X enrolled clients." |
| Suspension Reason        | Required dropdown + textarea                        |
| Client Communication     | Toggle: notify enrolled clients                     |
| Staff Communication      | Toggle: notify assigned staff                       |

**Suspension Effects:**
- No new enrollments
- Check-in reminders paused
- Appointment reminders paused
- Compliance tracking paused (not reset)
- Existing data preserved
- Clients remain enrolled (frozen state)
- Staff assignments preserved

### Program Deactivation

| Prerequisite                                  | Validation                            |
|-----------------------------------------------|---------------------------------------|
| All clients discharged or transferred         | `enrolled_count = 0`                  |
| All open items closed                         | No pending check-ins, appointments    |
| Final reports generated                       | Recommended, not required             |
| Staff notified                                | Confirmation toggle                   |

**Deactivation Effects:**
- Program status → Deactivated
- All staff assignments ended
- Program hidden from active lists
- Data preserved per retention policy
- Cannot be reactivated (create new program)
- Reporting data preserved for historical analysis

---

## 22. Lifecycle Phase 18: Archival & Data Retention

| Data Category              | Retention Period     | After Retention         |
|----------------------------|---------------------:|-------------------------|
| Program configuration      | 7 years              | Minimized               |
| Client enrollment records  | 7 years              | Purged                  |
| Check-in data              | 7 years              | Purged                  |
| UA results                 | 7 years              | Purged                  |
| Appointment records        | 7 years              | Purged                  |
| Compliance records         | 7 years              | Purged                  |
| Case notes                 | 7 years              | Purged                  |
| Documents / uploads        | 7 years              | Purged                  |
| Audit trail                | 7 years              | Purged                  |
| Housing financial records  | 7 years              | Purged                  |
| Court compliance records   | 7 years              | Purged                  |

---

## 23. Program Dashboard

### Route
`/programs/:id/dashboard`

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Program Header: [Program Name] · [Type Badge] · [Status Badge] │
│  Director: [Name]    Capacity: 42/50    Active Since: Jan 2026   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ROW 1: STAT CARDS (6 cards)                                     │
│  [Enrolled] [Check-In Rate] [Compliance] [At-Risk] [UAs] [Appts]│
│                                                                  │
│  ROW 2: CHARTS (2 columns)                                      │
│  [Engagement Trend (30d)]     [Compliance by Phase]              │
│                                                                  │
│  ROW 3: TABLES (2 columns)                                      │
│  [At-Risk Clients]            [Today's Activity]                 │
│                                                                  │
│  ROW 4: TABLES (2 columns)                                      │
│  [Upcoming Appointments]      [Recent UA Results]                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Stat Cards

| Card                 | Value                     | Trend           | Color Logic         |
|----------------------|---------------------------|-----------------|---------------------|
| Enrolled Clients     | 42 / 50 capacity          | ▲ +3 this month | Green < 85%, Amber 85-95%, Red > 95% |
| Check-In Rate        | 87% (today)               | ▲ +2% vs last week | Green > 80%, Amber 60-80%, Red < 60% |
| Compliance Rate      | 94% (7-day average)       | ▲ +1%           | Green > 85%, Amber 70-85%, Red < 70% |
| At-Risk Clients      | 4                         | ▼ -1 (good)     | Green 0-2, Amber 3-5, Red > 5 |
| Negative UAs (30d)   | 96%                       | Stable          | Green > 90%, Amber 75-90%, Red < 75% |
| Appointment Adherence | 91%                      | ▲ +3%           | Green > 85%, Amber 70-85%, Red < 70% |

---

## 24. All Programs List Page

### Route
`/programs` (Tenant Admin) | `/admin/tenants/:id/programs` (SysAdmin)

### Table Columns

| #  | Column             | Width  | Sortable | Detail                              |
|----|--------------------|--------|:--------:|-------------------------------------|
| 1  | Status Indicator   | 12px   | No       | Colored dot                         |
| 2  | Program Name       | auto   | Yes      | Clickable → detail                  |
| 3  | Program Code       | 80px   | Yes      | Short code                          |
| 4  | Type               | 130px  | Yes      | Type badge                          |
| 5  | Director           | 150px  | Yes      | Name                                |
| 6  | Enrolled / Capacity| 110px  | Yes      | "42 / 50" with progress bar         |
| 7  | Staff              | 80px   | Yes      | Count                               |
| 8  | Compliance Rate    | 110px  | Yes      | Percentage with color               |
| 9  | Check-In Rate      | 110px  | Yes      | Today's rate with color             |
| 10 | At-Risk            | 80px   | Yes      | Count with color                    |
| 11 | Status             | 100px  | Yes      | Active / Draft / Suspended          |
| 12 | Created            | 100px  | Yes      | Date                                |
| 13 | Actions            | 80px   | No       | Kebab menu                          |

---

## 25. Program Detail Page

### Route
`/programs/:id`

### Tabs

| Tab                | Content                                              |
|--------------------|------------------------------------------------------|
| Overview           | Program info, stats, recent activity, health indicators |
| Clients            | Enrolled client list with status, phase, compliance  |
| Staff              | Assigned staff with roles, caseload counts           |
| Phases             | Phase configuration and client distribution          |
| Check-Ins          | Check-in dashboard, completion rates, flagged items  |
| Appointments       | Calendar view, attendance rates, upcoming schedule   |
| Compliance         | Compliance rules, violation log, streak leaderboard  |
| UA / Testing       | UA results, trends, positive rate tracking           |
| Housing            | Room assignments, rent status, rules violations (if housing) |
| Court              | Hearing schedule, conditions, compliance reports (if court) |
| Documents          | Required documents status, uploads, expirations      |
| Reports            | Program reports, scheduled reports, export center    |
| Settings           | Program configuration, feature toggles, notification rules |
| Audit              | Program-level audit trail                            |

---

## 26. Cross-Program Client Enrollment

A single client can be enrolled in multiple programs simultaneously within the same tenant.

### Cross-Program Scenarios

| Scenario                                              | Example                              |
|-------------------------------------------------------|---------------------------------------|
| Drug Court + Recovery Housing                         | Court-mandated client in sober living |
| SUD Treatment + Case Management                       | MAT patient with case manager        |
| Probation + Recovery Housing                          | Parolee in transitional housing      |
| Drug Court + SUD Treatment + Recovery Housing         | Full wraparound services             |

### Cross-Program Rules

| Rule                                              | Logic                                 |
|---------------------------------------------------|---------------------------------------|
| Client can be in multiple active programs         | No limit on concurrent enrollments    |
| Each enrollment is independent                    | Separate compliance tracking per program |
| Consent must cover each program                   | 42 CFR Part 2 consent per program     |
| Staff can see cross-program status                | If consent allows, with consent gate  |
| Discharge from one doesn't affect others          | Independent lifecycle                 |
| Conflicting appointments flagged                  | Calendar conflict detection           |
| Aggregate risk score available                    | Combined risk across all programs     |

---

## 27. Inter-Program Communication

### Communication Rules

| Scenario                                    | Behavior                                |
|---------------------------------------------|-----------------------------------------|
| Drug Court needs UA results from Treatment  | Requires 42 CFR Part 2 consent          |
| Housing reports violation to Court program  | Consent-gated automated report          |
| Case Manager sees all program statuses      | Per consent authorization               |
| Court officer requests compliance summary   | Generated per program, consent-gated    |

### Cross-Program Compliance Report

Auto-generated for clients in multiple programs:

| Section              | Content                                             |
|----------------------|-----------------------------------------------------|
| Client Summary       | Name, enrolled programs, overall risk score         |
| Per-Program Status   | Compliance rate, phase, recent activity per program |
| Combined Timeline    | Merged activity timeline across all programs        |
| Aggregate Metrics    | Combined attendance, UA results, check-in rates     |
| Flags / Alerts       | Any active risk indicators across programs          |
| Consent Status       | Which programs are authorized to share data         |

---

## 28. Consent & 42 CFR Part 2 Per Program

### Consent Requirements

| Consent Element              | Detail                                          |
|------------------------------|-------------------------------------------------|
| Client Name                  | Who the consent is for                          |
| Program Name                 | Which program the consent covers                |
| Data Categories              | What data can be shared (attendance, UAs, treatment info, etc.) |
| Authorized Recipients        | Who can receive the data (court, probation, housing, etc.) |
| Purpose                      | Why the data is being shared                    |
| Expiration Date              | When consent expires                            |
| Revocation Rights            | Client can revoke at any time                   |
| Consent Form Version         | Which version of the form was used              |
| Signature Timestamp          | When client signed (digital or wet signature)   |
| Witness (if required)        | Staff who witnessed the consent                 |

### Consent Verification Flow (Per Program)

```
Staff/System requests client data from Program X
         │
         ▼
┌─────────────────────────┐
│ Does requesting party   │── No ──▶ ACCESS DENIED
│ have active consent for │
│ this program's data?    │
└────────────┬────────────┘
             │ Yes
             ▼
┌─────────────────────────┐
│ Does consent cover the  │── No ──▶ PARTIAL ACCESS
│ requested data category?│         (only authorized categories)
└────────────┬────────────┘
             │ Yes
             ▼
┌─────────────────────────┐
│ Is consent still valid  │── No ──▶ ACCESS DENIED
│ (not expired/revoked)?  │         (renewal required)
└────────────┬────────────┘
             │ Yes
             ▼
      ACCESS GRANTED
      (logged with timestamp + accessor)
```

---

## 29. Database Entities

### New / Updated Entities Required

| Entity                        | Service              | Purpose                              |
|-------------------------------|----------------------|--------------------------------------|
| `Program`                     | Case Management      | Core program record                  |
| `ProgramPhase`                | Case Management      | Phase definitions                    |
| `ProgramFeatureConfig`        | Case Management      | Feature toggles per program          |
| `ProgramStaffAssignment`      | User Management      | Staff-to-program mapping             |
| `ClientEnrollment`            | Client Service       | Client-to-program enrollment         |
| `ClientPhaseHistory`          | Client Service       | Phase progression tracking           |
| `ComplianceRule`              | Compliance Service   | Rule definitions                     |
| `ComplianceViolation`         | Compliance Service   | Violation records                    |
| `ComplianceStreak`            | Compliance Service   | Streak tracking                      |
| `CheckInTemplate`             | Check-In Service     | Check-in question configuration      |
| `CheckInQuestion`             | Check-In Service     | Individual questions                 |
| `CheckInSubmission`           | Check-In Service     | Client submissions                   |
| `CheckInResponse`             | Check-In Service     | Individual answers                   |
| `AppointmentType`             | Appointment Service  | Appointment type configuration       |
| `AppointmentTemplate`         | Appointment Service  | Recurring appointment templates      |
| `UaConfiguration`             | Lab Integration      | UA testing configuration             |
| `UaResult`                    | Lab Integration      | Individual UA results                |
| `HousingUnit`                 | Housing Service      | Recovery house/room configuration    |
| `HousingAssignment`           | Housing Service      | Client room assignments              |
| `HousingPayment`              | Housing Service      | Rent payment tracking                |
| `HouseRule`                   | Housing Service      | House rule definitions               |
| `HouseRuleViolation`          | Housing Service      | Rule violation records               |
| `CourtCondition`              | Drug Court Service   | Supervision conditions               |
| `CourtHearing`                | Drug Court Service   | Hearing schedule and outcomes        |
| `DocumentRequirement`         | Document Service     | Required document definitions        |
| `NotificationRule`            | Notification Service | Per-program notification configuration |
| `ProgramReport`               | Reporting Service    | Report configuration                 |
| `RiskIndicatorConfig`         | Compliance Service   | Risk detection configuration         |
| `CrossProgramConsent`         | Consent Service      | Inter-program data sharing consent   |

---

## 30. API Endpoints

| Endpoint                                              | Method | Description                        |
|-------------------------------------------------------|--------|------------------------------------|
| `/api/v1/programs`                                    | GET    | List tenant programs               |
| `/api/v1/programs`                                    | POST   | Create program                     |
| `/api/v1/programs/stats`                              | GET    | Programs dashboard KPIs            |
| `/api/v1/programs/:id`                                | GET    | Program detail                     |
| `/api/v1/programs/:id`                                | PUT    | Update program                     |
| `/api/v1/programs/:id/activate`                       | POST   | Activate draft program             |
| `/api/v1/programs/:id/suspend`                        | POST   | Suspend program                    |
| `/api/v1/programs/:id/reactivate`                     | POST   | Reactivate suspended program       |
| `/api/v1/programs/:id/deactivate`                     | POST   | Deactivate program                 |
| `/api/v1/programs/:id/phases`                         | GET    | List program phases                |
| `/api/v1/programs/:id/phases`                         | POST   | Add phase                          |
| `/api/v1/programs/:id/phases/:pid`                    | PUT    | Update phase                       |
| `/api/v1/programs/:id/phases/:pid`                    | DELETE | Delete phase (if no clients)       |
| `/api/v1/programs/:id/staff`                          | GET    | List assigned staff                |
| `/api/v1/programs/:id/staff`                          | POST   | Assign staff                       |
| `/api/v1/programs/:id/staff/:sid`                     | PUT    | Update staff assignment            |
| `/api/v1/programs/:id/staff/:sid`                     | DELETE | Remove staff (requires reassignment) |
| `/api/v1/programs/:id/clients`                        | GET    | List enrolled clients              |
| `/api/v1/programs/:id/clients/enroll`                 | POST   | Enroll client                      |
| `/api/v1/programs/:id/clients/:cid/discharge`         | POST   | Discharge client                   |
| `/api/v1/programs/:id/clients/:cid/advance-phase`     | POST   | Advance client to next phase       |
| `/api/v1/programs/:id/clients/:cid/regress-phase`     | POST   | Move client to earlier phase       |
| `/api/v1/programs/:id/checkin-config`                 | GET    | Get check-in configuration         |
| `/api/v1/programs/:id/checkin-config`                 | PUT    | Update check-in configuration      |
| `/api/v1/programs/:id/checkin-config/questions`       | GET    | List check-in questions            |
| `/api/v1/programs/:id/checkin-config/questions`       | POST   | Add question                       |
| `/api/v1/programs/:id/compliance-rules`               | GET    | List compliance rules              |
| `/api/v1/programs/:id/compliance-rules`               | POST   | Add compliance rule                |
| `/api/v1/programs/:id/compliance-rules/:rid`          | PUT    | Update rule                        |
| `/api/v1/programs/:id/compliance-rules/:rid`          | DELETE | Delete rule                        |
| `/api/v1/programs/:id/ua-config`                      | GET    | Get UA configuration               |
| `/api/v1/programs/:id/ua-config`                      | PUT    | Update UA configuration            |
| `/api/v1/programs/:id/appointment-types`              | GET    | List appointment types             |
| `/api/v1/programs/:id/appointment-types`              | POST   | Add appointment type               |
| `/api/v1/programs/:id/housing-config`                 | GET    | Get housing configuration          |
| `/api/v1/programs/:id/housing-config`                 | PUT    | Update housing configuration       |
| `/api/v1/programs/:id/housing-config/rules`           | GET    | List house rules                   |
| `/api/v1/programs/:id/housing-config/rules`           | POST   | Add house rule                     |
| `/api/v1/programs/:id/court-config`                   | GET    | Get court configuration            |
| `/api/v1/programs/:id/court-config`                   | PUT    | Update court configuration         |
| `/api/v1/programs/:id/court-config/conditions`        | GET    | List supervision conditions        |
| `/api/v1/programs/:id/court-config/conditions`        | POST   | Add condition                      |
| `/api/v1/programs/:id/document-requirements`          | GET    | List required documents            |
| `/api/v1/programs/:id/document-requirements`          | POST   | Add document requirement           |
| `/api/v1/programs/:id/notification-rules`             | GET    | List notification rules            |
| `/api/v1/programs/:id/notification-rules`             | PUT    | Update notification rules          |
| `/api/v1/programs/:id/features`                       | GET    | List feature toggles               |
| `/api/v1/programs/:id/features`                       | PUT    | Update feature toggles             |
| `/api/v1/programs/:id/risk-config`                    | GET    | Get risk indicator configuration   |
| `/api/v1/programs/:id/risk-config`                    | PUT    | Update risk configuration          |
| `/api/v1/programs/:id/reports`                        | GET    | List available reports             |
| `/api/v1/programs/:id/dashboard`                      | GET    | Program dashboard data             |
| `/api/v1/programs/:id/audit`                          | GET    | Program audit trail                |

---

## 31. Notification Matrix

| Event                        | Client | Case Mgr | Director | Admin | Channel         |
|------------------------------|:------:|:--------:|:--------:|:-----:|-----------------|
| Program Created              | ❌     | ❌       | ✅       | ✅    | Email           |
| Program Activated            | ❌     | ✅       | ✅       | ✅    | Email + In-App  |
| Program Suspended            | ✅     | ✅       | ✅       | ✅    | Email + SMS     |
| Program Reactivated          | ✅     | ✅       | ✅       | ✅    | Email + SMS     |
| Program Deactivated          | ✅     | ✅       | ✅       | ✅    | Email           |
| Client Enrolled              | ✅     | ✅       | ❌       | ❌    | SMS + Email     |
| Client Discharged            | ✅     | ✅       | ✅       | ❌    | Email           |
| Staff Assigned               | ❌     | ✅       | ✅       | ❌    | Email + In-App  |
| Staff Removed                | ❌     | ✅       | ✅       | ❌    | Email           |
| Phase Advancement            | ✅     | ✅       | ❌       | ❌    | Push + In-App   |
| Capacity Warning (85%)       | ❌     | ❌       | ✅       | ✅    | In-App          |
| Capacity Reached (100%)      | ❌     | ❌       | ✅       | ✅    | Email + In-App  |
| Compliance Rule Changed      | ❌     | ✅       | ✅       | ❌    | In-App          |
| Feature Enabled/Disabled     | ❌     | ✅       | ✅       | ✅    | In-App          |
| Configuration Changed        | ❌     | ✅       | ✅       | ❌    | In-App          |

---

## 32. Business Rules Master List

| #  | Rule                                              | Logic                                                |
|----|---------------------------------------------------|------------------------------------------------------|
| 1  | Program name unique within tenant                 | Cannot have two programs with same name              |
| 2  | Program code unique within tenant                 | Auto-generated, immutable after activation           |
| 3  | Program type immutable after activation           | Must create new program for different type           |
| 4  | Max programs per tenant                           | Enforced by subscription tier                        |
| 5  | Features limited by subscription tier             | Cannot enable Enterprise features on Basic tier      |
| 6  | Program activation requires director              | At least one staff with Director role                |
| 7  | Cannot delete phase with enrolled clients         | Must move or discharge clients first                 |
| 8  | Cannot deactivate with enrolled clients           | Must discharge all clients first                     |
| 9  | Staff removal requires caseload reassignment      | Cannot leave clients unassigned                      |
| 10 | Cross-program enrollment requires separate consent | 42 CFR Part 2 per program                           |
| 11 | Compliance rules apply per phase (if phased)      | Phase-level override of program-level rules          |
| 12 | Risk score aggregated across programs             | Combined score for multi-program clients             |
| 13 | Check-in questions plain language                 | WCAG 2.1 AA, 8th grade reading level                |
| 14 | UA results immutable after review                 | Cannot edit reviewed UA results (append correction)  |
| 15 | Housing payments tracked to the penny             | Decimal(18,2) precision                              |
| 16 | Court conditions require consent for sharing      | 42 CFR Part 2 verified before any external report    |
| 17 | Program data retained 7 years (HIPAA)             | Cannot purge before retention period                 |
| 18 | Suspended programs resume with same config        | No configuration loss on reactivation                |
| 19 | Program capacity includes all active enrollments  | Discharged clients don't count                       |
| 20 | Notification quiet hours respected                | Except crisis/safety alerts                          |

---

## 33. Edge Cases & Exception Handling

| Edge Case                                      | Handling                                             |
|------------------------------------------------|------------------------------------------------------|
| Client enrolled in same program twice          | Block: "Client already enrolled in this program"     |
| Program capacity reached mid-bulk-enrollment   | Enroll up to capacity, queue remainder with alert    |
| Staff member deactivated while assigned        | Auto-flag for reassignment, alert director           |
| Phase deleted while clients in that phase      | Block: must move clients first                       |
| Feature disabled while data exists             | Data preserved, feature UI hidden, re-enable restores |
| Cross-program consent revoked                  | Immediately hide data from non-consented programs    |
| Check-in submitted after deadline              | Accept as "Late", flag accordingly                   |
| UA result uploaded for wrong client            | Staff can void and re-enter with correction note     |
| Two programs with conflicting appointment times | Calendar conflict warning on enrollment             |
| Program deactivated while reports scheduled    | Cancel scheduled reports, generate final report      |
| Client transfers between programs same tenant  | Streamlined transfer flow, data visible per consent  |
| Client transfers between different tenants     | Not supported — discharge + re-enroll required       |
| Housing payment recorded twice                 | Duplicate detection, admin override available        |
| Court hearing rescheduled                      | Update notification, notify client + team            |
| Program type-specific feature on wrong type    | Feature toggle hidden, cannot be enabled             |
| Concurrent edits to program configuration      | Optimistic concurrency, last-write-wins with diff    |
| Trial subscription limits program creation     | Clear message: "Trial allows max 2 programs"         |
| Bulk discharge on program deactivation         | Batch discharge with shared reason, individual notes |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned | WCAG 2.1 AA Accessible*
