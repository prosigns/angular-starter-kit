# BPDS CareTrack™ — System Admin: Program Configuration (Frontend Instructions)

**Page:** Program Configuration
**Role:** System Administrator (Super Admin)
**Route:** `/admin/programs/configuration`
**Platform:** Web Admin Panel (Angular 18+)
**Parent Menu:** Operations → Programs → Program Configuration
**Purpose:** Platform-level configuration of program type templates, default features, compliance templates, check-in templates, and global settings that Tenant Admins inherit when creating programs

---

## Design Context

This page follows the same design language as the "All Programs" page (see screenshot reference):
- **Sidebar:** Dark navy (`#1B2B4B`) with `OPERATIONS` and `ADMINISTRATION` groups
- **Content Area:** Light background (`#F8FAFC`)
- **Cards:** White background, subtle shadow, colored accent icons
- **Table:** Clean rows with status dots, colored badges, progress bars
- **Typography:** Inter/Instrument Sans, 14px body, 13px table
- **Active Menu:** Blue highlight (`#2563EB`) on sidebar item

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                             │
│  [CareTrack Logo]  [≡]   [🔍 Search or jump to...  ctrl+k]   [NR] Nayab│
├──────────┬──────────────────────────────────────────────────────────────┤
│          │                                                              │
│  SIDEBAR │  BREADCRUMB: ADMIN > PROGRAMS                                │
│          │  PAGE TITLE: "Program Configuration"                         │
│          │  SUBTITLE: "Manage program types, templates, and defaults"   │
│  Programs│  ─────────────────────────────────────────────────────────── │
│  ├ All   │                                                              │
│  │ Prgrms│  TAB BAR                                                     │
│  └►Prgm  │  [Program Types] [Feature Catalog] [Check-In Templates]     │
│    Config│  [Compliance Templates] [Phase Templates] [Notification      │
│          │   Defaults] [Global Settings]                                │
│          │  ─────────────────────────────────────────────────────────── │
│          │                                                              │
│          │  TAB CONTENT                                                 │
│          │  (Changes based on selected tab)                             │
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## Page Header

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Breadcrumb           | `ADMIN > PROGRAMS` (muted, uppercase, 12px)         |
| Page Title           | "Program Configuration" (bold, 24px, `#1E293B`)     |
| Subtitle             | "Manage program types, templates, and defaults" (14px, `#64748B`) |
| No primary action    | Actions are per-tab (inside each tab content)       |

---

## Tab Bar

**Style:** Horizontal underline tabs matching the "All Programs" tab bar design (All 8 / Active 6 / Draft 1 / etc.)
**Position:** Below page header
**Behavior:** URL hash-based navigation (`/admin/programs/configuration#program-types`)

| Tab                       | Route Hash            | Badge   | Description                          |
|---------------------------|-----------------------|---------|--------------------------------------|
| Program Types             | `#program-types`      | 9       | Manage program type definitions      |
| Feature Catalog           | `#features`           | 18      | Platform feature definitions         |
| Check-In Templates        | `#checkin-templates`  | 5       | Reusable check-in question sets      |
| Compliance Templates      | `#compliance`         | 12      | Reusable compliance rule sets        |
| Phase Templates           | `#phases`             | 4       | Reusable program phase structures    |
| Notification Defaults     | `#notifications`      | 17      | Default notification rules           |
| Global Settings           | `#settings`           | —       | Platform-wide program settings       |

---

## TAB 1: Program Types

### Route: `/admin/programs/configuration#program-types`

### Purpose
Define and manage the program types available across the entire platform. When a Tenant Admin creates a program, they select from these types. Each type comes with pre-configured default features, compliance rules, phases, and settings.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TAB HEADER                                                      │
│  "Program Types"            [+ Add Program Type] [Reorder]       │
│  "9 program types defined"                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ PROGRAM TYPE CARD GRID (3 columns)                         │  │
│  │                                                            │  │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │  │
│  │ │ Drug Court   │ │ SUD Treat.   │ │ Recovery     │        │  │
│  │ │              │ │              │ │ Housing      │        │  │
│  │ └──────────────┘ └──────────────┘ └──────────────┘        │  │
│  │                                                            │  │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │  │
│  │ │ Probation/   │ │ Case Mgmt    │ │ MAT          │        │  │
│  │ │ Parole       │ │              │ │              │        │  │
│  │ └──────────────┘ └──────────────┘ └──────────────┘        │  │
│  │                                                            │  │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │  │
│  │ │ CBO          │ │ Doorway      │ │ Other        │        │  │
│  │ │              │ │              │ │              │        │  │
│  │ └──────────────┘ └──────────────┘ └──────────────┘        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Program Type Card

```
┌──────────────────────────────────────────┐
│  [Icon]   Drug Court                [⋮]  │
│           DC                             │
│  ──────────────────────────────────────  │
│  Court-mandated treatment compliance     │
│  monitoring and accountability tracking  │
│  ──────────────────────────────────────  │
│  Features: 14 / 18 enabled              │
│  ████████████████░░░░ 78%               │
│  ──────────────────────────────────────  │
│  Default Phases: 5                       │
│  Compliance Rules: 8                     │
│  Check-In Questions: 7                   │
│  ──────────────────────────────────────  │
│  Used by: 12 programs across 8 tenants   │
│  ──────────────────────────────────────  │
│  Status: ● Active    System Type: 🔒     │
│                                          │
│  [Configure →]                           │
└──────────────────────────────────────────┘
```

### Card Elements

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Icon                 | Program type icon (per type — see icon table below) |
| Type Name            | Bold, 16px (e.g., "Drug Court")                     |
| Type Code            | Muted, monospace, 12px (e.g., "DC")                |
| Description          | 2-line description, 13px, `#64748B`                  |
| Feature Bar          | Progress bar: enabled/total features                 |
| Stats                | Default phases, compliance rules, check-in questions |
| Usage Count          | How many active programs use this type across tenants|
| Status               | Active (green dot) / Inactive (gray dot)            |
| System Type Lock     | 🔒 icon if system-defined (cannot be deleted)       |
| Configure Button     | Primary action → opens type detail page             |
| Kebab Menu (⋮)       | Edit, Duplicate, Deactivate, Delete (if custom)     |

### Program Type Icons

| Type                    | Icon (Lucide)       | Color     |
|-------------------------|---------------------|-----------|
| Drug Court              | `gavel`             | `#7C3AED` |
| SUD Treatment           | `heart-pulse`       | `#DC2626` |
| Recovery Housing        | `home`              | `#059669` |
| Probation / Parole      | `shield-check`      | `#D97706` |
| Case Management         | `briefcase`         | `#2563EB` |
| Medication Assisted     | `pill`              | `#0891B2` |
| Community Based Org     | `users`             | `#7C3AED` |
| Doorway Program         | `door-open`         | `#059669` |
| Other / Custom          | `settings`          | `#64748B` |

### Kebab Menu Actions

| Action        | Condition                      | Behavior                          |
|---------------|--------------------------------|-----------------------------------|
| Configure     | Always                         | Navigate to type detail page      |
| Duplicate     | Always                         | Clone type as new custom type     |
| Deactivate    | Active, not system-required    | Hide from Tenant Admin dropdowns  |
| Activate      | Inactive only                  | Restore to Tenant Admin dropdowns |
| Delete        | Custom types only, usage = 0   | Permanent delete (confirmation)   |

### Program Type Detail / Configure Page

**Route:** `/admin/programs/configuration/types/:typeCode`

```
┌──────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: ADMIN > PROGRAMS > CONFIGURATION > Drug Court       │
│  PAGE TITLE: [Icon] Drug Court                    [Save Changes] │
│  CODE: DC · System Type 🔒 · Used by 12 programs                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INNER TABS:                                                     │
│  [General] [Default Features] [Default Phases] [Default          │
│   Compliance Rules] [Default Check-In] [Default UA Config]       │
│  [Default Notifications] [Usage]                                 │
│                                                                  │
│  ────────────────────────────────────────────────────────────── │
│                                                                  │
│  INNER TAB CONTENT                                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Inner Tab: General

| Field                  | Type          | Validation                    | Editable |
|------------------------|---------------|-------------------------------|:--------:|
| Type Name              | Text input    | 3–128 chars, unique           | Yes      |
| Type Code              | Text display  | Immutable after creation      | No       |
| Description            | Textarea      | 0–500 chars                   | Yes      |
| Icon                   | Icon picker   | Select from Lucide icon set   | Yes      |
| Color                  | Color picker  | Hex color for badges/accents  | Yes      |
| Category               | Dropdown      | Treatment, Housing, Justice, Community, Other | Yes |
| Is Active              | Toggle        | Show/hide in Tenant Admin     | Yes      |
| Is System Type         | Display only  | Cannot be changed             | No       |
| Minimum Subscription Tier | Dropdown   | Trial, Basic, Professional, Enterprise, Government | Yes |
| Default Capacity       | Number        | Suggested max clients         | Yes      |
| Requires Consent       | Toggle        | 42 CFR Part 2 consent mandatory | Yes    |
| Requires UA            | Toggle        | UA module auto-enabled        | Yes      |
| Requires Court Compliance | Toggle     | Court module auto-enabled     | Yes      |
| Requires Housing       | Toggle        | Housing module auto-enabled   | Yes      |

#### Inner Tab: Default Features

Feature toggles that are pre-selected when a Tenant Admin creates a program of this type. Tenant Admin can override these defaults.

| Feature                    | Key                    | Default State | Can Tenant Override | Tier Required    |
|----------------------------|------------------------|:-------------:|:-------------------:|-----------------|
| Daily Check-Ins            | `daily_checkins`       | Toggle        | Yes                 | Basic+          |
| Weekly Check-Ins           | `weekly_checkins`      | Toggle        | Yes                 | Basic+          |
| Appointment Tracking       | `appointments`         | Toggle        | Yes                 | Basic+          |
| UA / Drug Testing          | `ua_testing`           | Toggle        | Yes                 | Basic+          |
| Treatment Plans            | `treatment_plans`      | Toggle        | Yes                 | Professional+   |
| Housing Rules              | `housing_rules`        | Toggle        | Yes                 | Professional+   |
| Rent / Payment Tracking    | `rent_tracking`        | Toggle        | Yes                 | Professional+   |
| Meeting Attendance         | `meeting_attendance`   | Toggle        | Yes                 | Basic+          |
| Court Compliance           | `court_compliance`     | Toggle        | Yes                 | Professional+   |
| Hearing Schedule           | `hearing_schedule`     | Toggle        | Yes                 | Professional+   |
| Supervision Conditions     | `supervision_conditions` | Toggle      | Yes                 | Professional+   |
| Cross-Agency Reporting     | `cross_agency`         | Toggle        | Yes                 | Enterprise+     |
| MOUD Tracking              | `moud_tracking`        | Toggle        | Yes                 | Professional+   |
| Compliance Streaks         | `compliance_streaks`   | Toggle        | Yes                 | Basic+          |
| Risk Indicators            | `risk_indicators`      | Toggle        | Yes                 | Basic+          |
| Document Uploads           | `document_uploads`     | Toggle        | Yes                 | Basic+          |
| Secure Messaging           | `secure_messaging`     | Toggle        | Yes                 | Basic+          |
| Lab Integration            | `lab_integration`      | Toggle        | Yes                 | Enterprise+     |

**UI:** Two-column layout — left column shows feature name + description, right column shows toggle + tier badge + override toggle.

```
┌──────────────────────────────────────────────────────────────────┐
│  Default Features for Drug Court                                 │
│  "These defaults are pre-selected when a Tenant Admin creates    │
│   a Drug Court program. Tenants can override unless locked."     │
│                                                                  │
│  ┌──────────────────────────────────┬────────────────────────┐   │
│  │ Daily Check-Ins                  │ [●━━━ On]  Basic+      │   │
│  │ Clients submit daily status      │ Override: [Allowed ▼]  │   │
│  ├──────────────────────────────────┼────────────────────────┤   │
│  │ UA / Drug Testing                │ [●━━━ On]  Basic+      │   │
│  │ Track urinalysis results         │ Override: [Locked 🔒]  │   │
│  ├──────────────────────────────────┼────────────────────────┤   │
│  │ Court Compliance                 │ [●━━━ On]  Professional│   │
│  │ Monitor court-ordered conditions │ Override: [Locked 🔒]  │   │
│  ├──────────────────────────────────┼────────────────────────┤   │
│  │ Lab Integration                  │ [━━━○ Off] Enterprise+ │   │
│  │ HL7/FHIR lab result integration  │ Override: [Allowed ▼]  │   │
│  └──────────────────────────────────┴────────────────────────┘   │
│                                                                  │
│  Legend: Locked 🔒 = Tenant cannot disable this feature          │
│          Allowed = Tenant can enable/disable                     │
└──────────────────────────────────────────────────────────────────┘
```

**Override Options:**
- `Allowed` — Tenant Admin can toggle on/off
- `Locked On` — Feature is forced on, Tenant Admin cannot disable
- `Locked Off` — Feature is forced off, Tenant Admin cannot enable
- `Hidden` — Feature not shown to Tenant Admin at all

#### Inner Tab: Default Phases

Pre-configured phase templates for this program type. Tenant Admin receives these as starting phases when creating a program.

**Layout:** Drag-and-drop sortable list

```
┌──────────────────────────────────────────────────────────────────┐
│  Default Phases for Drug Court              [+ Add Phase]        │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Phase 1: Orientation                                    │    │
│  │  Duration: 30 days │ Check-In: Daily │ UA: 3x/week       │    │
│  │  Meetings: 5x/week │ Color: ██ Blue                      │    │
│  │  [Edit] [Delete]                                         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Phase 2: Active Treatment                               │    │
│  │  Duration: 90 days │ Check-In: Daily │ UA: 2x/week       │    │
│  │  Meetings: 3x/week │ Color: ██ Green                     │    │
│  │  [Edit] [Delete]                                         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Phase 3: Stabilization                                  │    │
│  │  Duration: 120 days │ Check-In: Daily │ UA: 1x/week      │    │
│  │  Meetings: 2x/week │ Color: ██ Teal                      │    │
│  │  [Edit] [Delete]                                         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ... (Phase 4, Phase 5)                                          │
│                                                                  │
│  Note: "Tenant Admins will receive these phases as defaults.     │
│   They can add, remove, or modify phases for their program."     │
└──────────────────────────────────────────────────────────────────┘
```

**Phase Edit Modal:**

| Field                  | Type          | Detail                              |
|------------------------|---------------|-------------------------------------|
| Phase Name             | Text input    | Required, 3–128 chars               |
| Phase Order            | Number        | Auto-set by drag-and-drop           |
| Duration (Days)        | Number input  | 0 = open-ended                      |
| Description            | Textarea      | What happens in this phase          |
| Entry Criteria         | Textarea      | Requirements to enter               |
| Graduation Criteria    | Textarea      | Requirements to advance             |
| Check-In Frequency     | Dropdown      | Daily, Weekdays, Specific Days, Weekly, Bi-Weekly |
| UA Frequency           | Dropdown      | None, Random, 1x-5x/week, Daily    |
| Meeting Requirement    | Number        | Meetings per week                   |
| Phase Color            | Color picker  | Visual identifier                   |
| Override Compliance Rules | Toggle     | Use phase-specific rules instead of program defaults |

#### Inner Tab: Default Compliance Rules

Pre-configured compliance rules that apply when a Tenant Admin creates this program type.

**Layout:** Table with inline editing

| #  | Rule Name                    | Category    | Measurement | Target | Severity | Auto-Detect | Actions |
|----|------------------------------|-------------|-------------|--------|----------|:-----------:|---------|
| 1  | Daily Check-In Completion    | Check-In    | Percentage  | 100%   | Moderate | ✅          | [Edit] [Delete] |
| 2  | Appointment Attendance       | Attendance  | Percentage  | 100%   | Major    | ✅          | [Edit] [Delete] |
| 3  | Negative UA Results          | UA/Testing  | Boolean     | All    | Critical | ✅          | [Edit] [Delete] |
| 4  | Meeting Attendance           | Attendance  | Count/Week  | 3      | Moderate | ✅          | [Edit] [Delete] |
| 5  | Court Hearing Attendance     | Court       | Boolean     | All    | Critical | ✅          | [Edit] [Delete] |
| 6  | Curfew Compliance            | Behavioral  | Boolean     | Yes    | Minor    | ❌          | [Edit] [Delete] |
| 7  | Documentation Submission     | Documentation| Percentage | 100%   | Minor    | ✅          | [Edit] [Delete] |
| 8  | No New Criminal Charges      | Behavioral  | Boolean     | Yes    | Critical | ❌          | [Edit] [Delete] |

**[+ Add Rule]** button opens the Compliance Rule Builder modal (same as defined in Program Management Lifecycle doc, Phase 10).

#### Inner Tab: Default Check-In

Pre-configured check-in questions for this program type.

**Layout:** Two sections — Daily Check-In Questions + Weekly Check-In Questions

```
┌──────────────────────────────────────────────────────────────────┐
│  DAILY CHECK-IN QUESTIONS                   [+ Add Question]     │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Q1: "How are you feeling today?"                        │    │
│  │  Type: Mood Emoji │ Required: Yes │ Risk: Low mood → flag│    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Q2: "Did you take your medication today?"               │    │
│  │  Type: Yes/No │ Required: Yes │ Risk: No → flag          │    │
│  │  Condition: Only if MOUD Tracking enabled                │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Q3: "Have you used any substances in the last 24 hours?"│    │
│  │  Type: Yes/No │ Required: Yes │ Risk: Yes → escalate     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Q4: "Did you attend all required meetings/appointments?" │    │
│  │  Type: Yes/No │ Required: Yes │ Risk: No → flag          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Q5: "Anything you'd like to share with your team?"      │    │
│  │  Type: Free Text │ Required: No │ Risk: Crisis keywords  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  WEEKLY CHECK-IN QUESTIONS                  [+ Add Question]     │
│  (Similar layout with more comprehensive questions)              │
└──────────────────────────────────────────────────────────────────┘
```

**Question drag-and-drop for reordering. Each question card expandable to show full configuration.**

#### Inner Tab: Default UA Config

| Field                    | Type          | Default for Drug Court           |
|--------------------------|---------------|----------------------------------|
| Testing Enabled          | Toggle (On)   | On                               |
| Default Frequency        | Dropdown      | 2x/week                          |
| Random Testing           | Toggle        | Yes (Phase 4+)                   |
| Default Panel            | Dropdown      | 12-panel                         |
| Positive Result Action   | Dropdown      | Escalate + Notify Staff          |
| Dilute Result Action     | Dropdown      | Retest                           |
| Missed Test Action       | Dropdown      | Treat as Positive                |
| Chain of Custody         | Toggle        | On                               |
| Phase-Specific Frequency | Table         | Phase 1: 3x, Phase 2: 2x, Phase 3: 1x, Phase 4+: random |

#### Inner Tab: Default Notifications

Default notification rules pre-configured for this program type. Tenant Admin inherits these but can modify.

| Rule                         | Trigger                    | Recipients      | Channel       | Timing        | Override |
|------------------------------|----------------------------|-----------------|---------------|---------------|:--------:|
| Check-In Reminder            | Check-in window opens      | Client          | SMS + Push    | At open       | Yes      |
| Check-In Warning             | 2h before deadline         | Client          | SMS + Push    | 2h before     | Yes      |
| Missed Check-In              | Deadline passed            | Client + CM     | SMS + In-App  | Immediately   | Yes      |
| Appointment Reminder (24h)   | Upcoming appointment       | Client          | SMS + Email   | 24h before    | Yes      |
| Appointment Reminder (1h)    | Upcoming appointment       | Client          | Push          | 1h before     | Yes      |
| Missed Appointment           | No-show                    | CM              | In-App + Email| Immediately   | Yes      |
| Positive UA                  | Positive result entered    | CM + Director   | In-App + Email| Immediately   | No (🔒)  |
| Compliance Violation         | Rule violated              | CM              | In-App        | Immediately   | Yes      |
| Risk Alert                   | Risk score > threshold     | CM + Director   | In-App + Email| Immediately   | No (🔒)  |
| Streak Milestone             | Milestone reached          | Client          | Push + In-App | Immediately   | Yes      |
| Phase Advancement            | Client promoted            | Client + Team   | In-App + Email| Immediately   | Yes      |
| Court Hearing Reminder       | Upcoming hearing           | Client + CM     | SMS + Email   | 48h + 24h     | Yes      |
| Rent Overdue                 | Past grace period          | Client + HM     | SMS + In-App  | Day after     | Yes      |
| Document Expiring            | Doc near expiration        | Client + Staff  | In-App        | 14d + 7d      | Yes      |
| Enrollment Welcome           | Client enrolled            | Client          | SMS + Email   | Immediately   | Yes      |
| Crisis Detection             | Crisis keywords detected   | CM + Director   | In-App + SMS  | Immediately   | No (🔒)  |
| Capacity Warning             | 85% capacity               | Director + Admin| In-App        | At threshold  | Yes      |

**Override Column:** 🔒 = Tenant Admin cannot disable (safety-critical notification)

#### Inner Tab: Usage

Shows which tenants and programs are using this program type.

| Column         | Detail                                          |
|----------------|-------------------------------------------------|
| Tenant         | Organization name (clickable → tenant detail)   |
| Program Name   | Program name (clickable → program detail)       |
| Status         | Active / Draft / Suspended                      |
| Enrolled       | Client count                                    |
| Created        | When program was created                        |
| Customized     | Badge if tenant modified defaults               |

---

## TAB 2: Feature Catalog

### Route: `/admin/programs/configuration#features`

### Purpose
Master list of all features available in CareTrack. System Admin can add new features, configure metadata, set tier requirements, and control availability.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Feature Catalog                        [+ Add Feature]          │
│  "18 features defined"                                           │
│                                                                  │
│  [Search features...]  [Category ▼] [Tier ▼] [Status ▼]        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ TABLE                                                      │  │
│  │ Feature | Key | Category | Tier | Programs Using | Status  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Feature Table Columns

| #  | Column           | Width  | Sortable | Detail                              |
|----|------------------|--------|:--------:|-------------------------------------|
| 1  | Feature Name     | auto   | Yes      | Display name                        |
| 2  | Key              | 140px  | Yes      | Machine key, monospace              |
| 3  | Category         | 120px  | Yes      | Badge: Engagement, Compliance, Clinical, Housing, Justice, Communication, Reporting |
| 4  | Description      | auto   | No       | Short description (truncated)       |
| 5  | Min Tier         | 110px  | Yes      | Badge: Basic, Professional, Enterprise |
| 6  | Programs Using   | 100px  | Yes      | Count of active programs            |
| 7  | Status           | 80px   | Yes      | Active / Beta / Deprecated          |
| 8  | Actions          | 80px   | No       | Edit, Deprecate, Delete (if unused) |

### Add / Edit Feature Modal

| Field                  | Type          | Validation                    |
|------------------------|---------------|-------------------------------|
| Feature Name           | Text input    | 3–128 chars, unique           |
| Feature Key            | Text input    | Auto-generated, snake_case, immutable after save |
| Description            | Textarea      | 0–500 chars                   |
| Category               | Dropdown      | Engagement, Compliance, Clinical, Housing, Justice, Communication, Reporting, Administrative |
| Icon                   | Icon picker   | Lucide icon                   |
| Minimum Tier           | Dropdown      | Trial, Basic, Professional, Enterprise, Government |
| Status                 | Dropdown      | Active, Beta, Deprecated      |
| Dependent Features     | Multi-select  | Features this depends on (e.g., `lab_integration` requires `ua_testing`) |
| Conflicting Features   | Multi-select  | Features that cannot coexist  |
| Configuration Schema   | JSON editor   | Default configuration JSON for this feature |
| Release Notes          | Textarea      | Version/changelog info        |

### Feature Dependency Visualization

When a feature has dependencies, show a mini dependency graph:

```
  lab_integration
       │
       ├── requires: ua_testing
       │
       └── requires: document_uploads
```

---

## TAB 3: Check-In Templates

### Route: `/admin/programs/configuration#checkin-templates`

### Purpose
Reusable check-in question sets that can be assigned to program types or individual programs. Templates prevent duplicate configuration across program types.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Check-In Templates                    [+ Create Template]       │
│  "5 templates defined"                                           │
│                                                                  │
│  TEMPLATE CARD LIST                                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Standard Daily Check-In                     System 🔒     │  │
│  │  5 questions │ Used by: 4 program types │ 18 programs      │  │
│  │  [Preview] [Edit] [Duplicate]                              │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Standard Weekly Check-In                    System 🔒     │  │
│  │  12 questions │ Used by: 3 program types │ 12 programs     │  │
│  │  [Preview] [Edit] [Duplicate]                              │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Housing Daily Check-In                      System 🔒     │  │
│  │  7 questions │ Used by: 1 program type │ 5 programs        │  │
│  │  [Preview] [Edit] [Duplicate]                              │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  MAT Adherence Check-In                      System 🔒     │  │
│  │  6 questions │ Used by: 1 program type │ 3 programs        │  │
│  │  [Preview] [Edit] [Duplicate]                              │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Custom: NH DHHS Outcome Questions           Custom        │  │
│  │  8 questions │ Used by: 0 program types │ 2 programs       │  │
│  │  [Preview] [Edit] [Duplicate] [Delete]                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Template Builder (Full Page)

**Route:** `/admin/programs/configuration/checkin-templates/:id`

```
┌──────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: ADMIN > PROGRAMS > CONFIG > Check-In Templates      │
│  TITLE: "Standard Daily Check-In"        [Save] [Preview] [⋮]   │
│                                                                  │
│  Template Name: [Standard Daily Check-In      ]                  │
│  Description:   [Quick daily status check for program clients]   │
│  Type: ○ Daily  ○ Weekly  ○ Custom                               │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  QUESTIONS                                    [+ Add Question]   │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Q1 │ "How are you feeling today?"           [Edit] [×]  │    │
│  │  Type: Mood Emoji │ Required │ Risk: Low → Flag           │    │
│  │  Condition: Always show                                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ ⠿ ─────────────────────────────────────────────────────┐    │
│  │  Q2 │ "Did you take your medication today?"   [Edit] [×]  │    │
│  │  Type: Yes/No │ Required │ Risk: No → Flag                │    │
│  │  Condition: If feature 'moud_tracking' = enabled          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ... (drag to reorder)                                           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  CRISIS KEYWORD CONFIGURATION                                    │
│  Keywords: [hurt myself, end it, suicide, don't want to live,    │
│             relapsed, used, homeless, unsafe, threatened ...]     │
│  Action: Immediate escalation + crisis resource display          │
│  [Edit Keywords]                                                 │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  PREVIEW                                                         │
│  [Mobile Preview] [Desktop Preview]                              │
│  (Shows how the check-in looks to the client)                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Question Edit Modal

| Field                  | Type          | Detail                              |
|------------------------|---------------|-------------------------------------|
| Question Text          | Text input    | Plain language (8th grade level)    |
| Help Text              | Text input    | Optional subtitle/explanation       |
| Question Type          | Dropdown      | Mood Emoji, Yes/No, Scale (1-5 / 1-10), Multiple Choice, Free Text, Number, Date, Time |
| Required               | Toggle        | Must answer                         |
| Options                | List builder  | For multiple choice (add/remove/reorder) |
| Risk Flag Trigger      | Condition builder | "If [value] [operator] [threshold] → [action]" |
| Risk Action            | Dropdown      | Flag, Notify Staff, Escalate, Crisis Protocol |
| Conditional Display    | Condition builder | Show only if feature enabled / previous answer = X |
| Phase Specific         | Multi-select  | Show only in selected phases (or all) |
| Validation             | Condition     | Min/max for numbers, max length for text |

---

## TAB 4: Compliance Templates

### Route: `/admin/programs/configuration#compliance`

### Purpose
Reusable compliance rule sets that can be applied to program types. Similar structure to Check-In Templates.

### Template List

| Template Name                | Rules | Used By    | Type    |
|------------------------------|:-----:|------------|---------|
| Drug Court Standard          | 8     | 4 types    | System  |
| Recovery Housing Standard    | 10    | 2 types    | System  |
| Probation Basic              | 6     | 2 types    | System  |
| Case Management Light        | 4     | 3 types    | System  |
| NH DHHS Outcome Rules        | 5     | 0 types    | Custom  |

### Compliance Rule Template Builder

Same rule builder UI as documented in Program Management Lifecycle doc (Phase 10), but at the platform template level. Each rule includes:

- Rule name, category, description
- Measurement type and target
- Evaluation period
- Violation severity and escalation actions
- Phase-specific overrides
- Auto-detection toggle

### Risk Score Configuration (Global)

| Field                    | Type          | Detail                              |
|--------------------------|---------------|-------------------------------------|
| Scoring Model            | Dropdown      | Weighted Sum, Maximum, Average      |
| Score Range              | Display       | 0–100                              |
| Risk Levels              | Table         | Configure thresholds and labels     |

| Level     | Min Score | Max Score | Color     | Label            | Auto-Action              |
|-----------|:---------:|:---------:|-----------|------------------|--------------------------|
| Low       | 0         | 20        | `#059669` | Low Risk         | None                     |
| Medium    | 21        | 50        | `#D97706` | Medium Risk      | In-app alert to CM       |
| High      | 51        | 75        | `#EA580C` | High Risk        | Email + in-app to CM + Director |
| Critical  | 76        | 100       | `#DC2626` | Critical Risk    | Immediate intervention required |

### Risk Indicator Weight Configuration

| Indicator                        | Default Weight | Configurable | Min | Max |
|----------------------------------|:--------------:|:------------:|:---:|:---:|
| Missed check-ins (2+ in 7d)     | 20             | Yes          | 0   | 30  |
| Missed appointment               | 25             | Yes          | 0   | 30  |
| Positive UA                      | 30             | Yes          | 10  | 40  |
| Declining mood trend             | 10             | Yes          | 0   | 20  |
| No contact (7+ days)            | 20             | Yes          | 5   | 30  |
| Late check-ins (3+ in 7d)       | 10             | Yes          | 0   | 20  |
| Housing payment overdue          | 10             | Yes          | 0   | 20  |
| Phase regression                 | 15             | Yes          | 0   | 25  |

**Note:** Weights should be configured so maximum possible score = 100 for consistency across programs.

---

## TAB 5: Phase Templates

### Route: `/admin/programs/configuration#phases`

### Purpose
Reusable phase structures that can be applied to program types. System Admin defines standard phase progressions.

### Template List

| Template Name                | Phases | Used By    | Type    |
|------------------------------|:------:|------------|---------|
| Drug Court 5-Phase           | 5      | 2 types    | System  |
| Recovery Housing 3-Phase     | 3      | 1 type     | System  |
| Simple 3-Phase (Basic)       | 3      | 3 types    | System  |
| Custom: NH DHHS 4-Phase      | 4      | 0 types    | Custom  |

### Phase Template Builder

Same UI as Program Type → Default Phases inner tab, but standalone and reusable.

---

## TAB 6: Notification Defaults

### Route: `/admin/programs/configuration#notifications`

### Purpose
Platform-wide default notification rules. These serve as the foundation that program types and individual programs inherit.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Notification Defaults                                           │
│  "17 notification rules configured"                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  GLOBAL SETTINGS                                           │  │
│  │  Quiet Hours: [10:00 PM] to [7:00 AM]  Override Critical: ✅│  │
│  │  Default SMS Provider: [Twilio ▼]                          │  │
│  │  Default Email From: [notifications@caretrack.app]         │  │
│  │  Push Provider: [Firebase Cloud Messaging ▼]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  NOTIFICATION RULES TABLE                                        │
│  (Same table as Program Type → Default Notifications inner tab)  │
│  Each row: Rule name, trigger, recipients, channels, timing,     │
│  lockable toggle, edit button                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  SMS TEMPLATES                               [+ Add Template]    │
│  (Editable SMS message templates per notification type)          │
│                                                                  │
│  EMAIL TEMPLATES                             [+ Add Template]    │
│  (Editable email templates with HTML editor per notification)    │
│                                                                  │
│  PUSH TEMPLATES                              [+ Add Template]    │
│  (Editable push notification title + body templates)             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Template Variables Available

| Variable                   | Example Output                          |
|----------------------------|-----------------------------------------|
| `{{client.first_name}}`    | "John"                                  |
| `{{client.full_name}}`     | "John Smith"                            |
| `{{program.name}}`         | "Grafton Drug Court"                    |
| `{{staff.name}}`           | "Sarah Chen"                            |
| `{{appointment.date}}`     | "April 25, 2026"                        |
| `{{appointment.time}}`     | "2:00 PM"                               |
| `{{appointment.type}}`     | "Case Management Visit"                 |
| `{{checkin.deadline}}`     | "10:00 PM tonight"                      |
| `{{streak.count}}`         | "30"                                    |
| `{{milestone.name}}`       | "30-Day Streak"                         |
| `{{tenant.name}}`          | "Grafton County Services"               |
| `{{support.phone}}`        | "(603) 555-0100"                        |
| `{{crisis.hotline}}`       | "988 Suicide & Crisis Lifeline"         |

### SMS Template Example

```
Notification: Check-In Reminder
Template:
"Hi {{client.first_name}}, your daily check-in for {{program.name}} 
is now open. Complete by {{checkin.deadline}}. Open CareTrack to 
check in."

Character Count: 168 / 160 (will send as 2 segments)
[Preview] [Edit] [Reset to Default]
```

---

## TAB 7: Global Settings

### Route: `/admin/programs/configuration#settings`

### Purpose
Platform-wide settings that affect all programs across all tenants.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Global Program Settings                          [Save Changes] │
│                                                                  │
│  GENERAL                                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Allow Custom Program Types:     [●━━━ On]                  │  │
│  │ Tenant Admins can create custom program types beyond       │  │
│  │ system-defined types                                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Max Programs per Tenant:                                   │  │
│  │ Trial: [2]  Basic: [3]  Professional: [10]                │  │
│  │ Enterprise: [25]  Government: [Unlimited ▼]               │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Default Program Capacity:       [50]                       │  │
│  │ Suggested max clients when creating a program              │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Auto-Generate Program Code:     [●━━━ On]                  │  │
│  │ Format: [First letters of words + sequence]                │  │
│  │ Example: "Grafton Drug Court" → GDC-001                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  CHECK-INS                                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Default Check-In Window:        [6:00 AM] to [10:00 PM]   │  │
│  │ Default Late Grace Period:      [30] minutes               │  │
│  │ Max Check-In Questions:         [20] per check-in          │  │
│  │ Crisis Keyword Detection:       [●━━━ On] (cannot disable) │  │
│  │ Require Daily Check-In:         [━━━○ Off]                 │  │
│  │ (If on, all programs must have daily check-ins)            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  COMPLIANCE                                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Risk Score Model:              [Weighted Sum ▼]            │  │
│  │ Risk Score Range:              0 – 100                     │  │
│  │ Enable Compliance Streaks:     [●━━━ On]                   │  │
│  │ Default Streak Milestones:     [7, 14, 30, 60, 90, 180, 365] │
│  │ Streak Reset on Any Violation: [━━━○ Off]                 │  │
│  │ (If off, only specified triggers reset streaks)            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  UA / DRUG TESTING                                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Default Test Panel:            [12-panel ▼]                │  │
│  │ Chain of Custody Default:      [●━━━ On]                   │  │
│  │ Lab Providers:                 [Manage Labs →]             │  │
│  │ Positive UA Always Escalates:  [●━━━ On] (cannot disable)  │  │
│  │ UA Result Immutable After Review: [●━━━ On] (cannot disable)│ │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  APPOINTMENTS                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Default No-Show Grace:         [15] minutes                │  │
│  │ Default Reminder Times:        [24h, 2h, 1h] before       │  │
│  │ Allow Client Self-Schedule:    [━━━○ Off]                 │  │
│  │ Allow Client Self-Reschedule:  [●━━━ On]                   │  │
│  │ Reschedule Window:             [24] hours before           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  CONSENT & PRIVACY                                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 42 CFR Part 2 Enforcement:     [●━━━ On] (cannot disable)  │  │
│  │ Consent Required for Enrollment: [●━━━ On]                 │  │
│  │ Default Consent Duration:      [365] days                  │  │
│  │ Consent Expiration Warning:    [30] days before            │  │
│  │ Cross-Program Data Sharing:    [Consent Required ▼]        │  │
│  │ Options: Blocked, Consent Required, Open Within Tenant     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  DATA RETENTION                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Program Data Retention:        [7] years (HIPAA minimum)   │  │
│  │ Audit Trail Retention:         [7] years                   │  │
│  │ Purge Schedule:                [Nightly at 2:00 AM UTC]    │  │
│  │ Legal Hold Override:           [●━━━ On] (cannot disable)  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│  Last updated: Apr 20, 2026 by Nayab Raheel                     │
│  [Revert to Defaults] [Save Changes]                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

| Endpoint                                                   | Method | Description                        |
|------------------------------------------------------------|--------|------------------------------------|
| `/api/v1/admin/program-config/types`                       | GET    | List all program types             |
| `/api/v1/admin/program-config/types`                       | POST   | Create program type                |
| `/api/v1/admin/program-config/types/:code`                 | GET    | Get program type detail            |
| `/api/v1/admin/program-config/types/:code`                 | PUT    | Update program type                |
| `/api/v1/admin/program-config/types/:code/features`        | GET    | Get type default features          |
| `/api/v1/admin/program-config/types/:code/features`        | PUT    | Update type default features       |
| `/api/v1/admin/program-config/types/:code/phases`          | GET    | Get type default phases            |
| `/api/v1/admin/program-config/types/:code/phases`          | PUT    | Update type default phases         |
| `/api/v1/admin/program-config/types/:code/compliance`      | GET    | Get type default compliance rules  |
| `/api/v1/admin/program-config/types/:code/compliance`      | PUT    | Update type default compliance     |
| `/api/v1/admin/program-config/types/:code/checkin`         | GET    | Get type default check-in config   |
| `/api/v1/admin/program-config/types/:code/checkin`         | PUT    | Update type default check-in       |
| `/api/v1/admin/program-config/types/:code/ua`              | GET    | Get type default UA config         |
| `/api/v1/admin/program-config/types/:code/ua`              | PUT    | Update type default UA config      |
| `/api/v1/admin/program-config/types/:code/notifications`   | GET    | Get type default notifications     |
| `/api/v1/admin/program-config/types/:code/notifications`   | PUT    | Update type default notifications  |
| `/api/v1/admin/program-config/types/:code/usage`           | GET    | Get usage stats for this type      |
| `/api/v1/admin/program-config/types/:code/duplicate`       | POST   | Duplicate type as custom           |
| `/api/v1/admin/program-config/types/:code/activate`        | POST   | Activate program type              |
| `/api/v1/admin/program-config/types/:code/deactivate`      | POST   | Deactivate program type            |
| `/api/v1/admin/program-config/features`                    | GET    | List all features                  |
| `/api/v1/admin/program-config/features`                    | POST   | Create feature                     |
| `/api/v1/admin/program-config/features/:key`               | PUT    | Update feature                     |
| `/api/v1/admin/program-config/features/:key`               | DELETE | Delete feature (if unused)         |
| `/api/v1/admin/program-config/checkin-templates`           | GET    | List check-in templates            |
| `/api/v1/admin/program-config/checkin-templates`           | POST   | Create template                    |
| `/api/v1/admin/program-config/checkin-templates/:id`       | GET    | Get template detail                |
| `/api/v1/admin/program-config/checkin-templates/:id`       | PUT    | Update template                    |
| `/api/v1/admin/program-config/checkin-templates/:id`       | DELETE | Delete template (if unused)        |
| `/api/v1/admin/program-config/compliance-templates`        | GET    | List compliance templates          |
| `/api/v1/admin/program-config/compliance-templates`        | POST   | Create template                    |
| `/api/v1/admin/program-config/compliance-templates/:id`    | GET    | Get template detail                |
| `/api/v1/admin/program-config/compliance-templates/:id`    | PUT    | Update template                    |
| `/api/v1/admin/program-config/compliance-templates/:id`    | DELETE | Delete template (if unused)        |
| `/api/v1/admin/program-config/phase-templates`             | GET    | List phase templates               |
| `/api/v1/admin/program-config/phase-templates`             | POST   | Create template                    |
| `/api/v1/admin/program-config/phase-templates/:id`         | PUT    | Update template                    |
| `/api/v1/admin/program-config/phase-templates/:id`         | DELETE | Delete template (if unused)        |
| `/api/v1/admin/program-config/notification-defaults`       | GET    | Get notification defaults          |
| `/api/v1/admin/program-config/notification-defaults`       | PUT    | Update notification defaults       |
| `/api/v1/admin/program-config/notification-templates`      | GET    | List notification templates        |
| `/api/v1/admin/program-config/notification-templates/:id`  | PUT    | Update notification template       |
| `/api/v1/admin/program-config/global-settings`             | GET    | Get global settings                |
| `/api/v1/admin/program-config/global-settings`             | PUT    | Update global settings             |
| `/api/v1/admin/program-config/risk-config`                 | GET    | Get risk score configuration       |
| `/api/v1/admin/program-config/risk-config`                 | PUT    | Update risk score configuration    |

---

## Permission Requirements

| Action                              | Permission Required       |
|-------------------------------------|---------------------------|
| View Program Configuration          | `programs.view`           |
| Manage Program Types                | `programs.manage`         |
| Manage Feature Catalog              | `programs.manage`         |
| Manage Check-In Templates           | `programs.manage`         |
| Manage Compliance Templates         | `programs.manage`         |
| Manage Phase Templates              | `programs.manage`         |
| Manage Notification Defaults        | `notifications.manage`    |
| Manage Global Settings              | `programs.manage`         |
| Delete Templates / Types            | `programs.manage`         |
| View Usage Stats                    | `programs.view`           |

---

## Inheritance Model

```
GLOBAL SETTINGS (this page)
       │
       ▼
PROGRAM TYPE DEFAULTS (per type on this page)
       │
       ▼
TENANT PROGRAM INSTANCE (created by Tenant Admin)
       │  ── Can override non-locked settings
       ▼
CLIENT EXPERIENCE (what the client sees)
```

### Override Rules

| Level              | Can Override From  | Locked Settings           |
|--------------------|--------------------|---------------------------|
| Global Settings    | N/A (top level)    | Crisis detection, 42 CFR  |
| Program Type       | Global Settings    | Per-feature lock config   |
| Tenant Program     | Program Type       | Cannot unlock "Locked On" |
| Per-Client         | Tenant Program     | Phase assignment only     |

---

## Responsive Breakpoints

| Breakpoint     | Layout Changes                                        |
|----------------|-------------------------------------------------------|
| ≥ 1440px       | 3-column card grid, full tables, side-by-side editors |
| 1024–1439px    | 2-column card grid, tables with scroll                |
| 768–1023px     | 1-column cards, stacked editors                       |
| < 768px        | Stacked everything, tabs become dropdown              |

---

## Accessibility

| Requirement              | Standard                                  |
|--------------------------|-------------------------------------------|
| Tab navigation           | Arrow keys between tabs, Enter to select  |
| Drag-and-drop            | Keyboard alternative (up/down buttons)    |
| Toggle switches          | ARIA `role="switch"` + `aria-checked`     |
| Color picker             | Hex input alternative for colorblind users|
| JSON editor              | Screen reader compatible code editor      |
| Form validation          | `aria-describedby` for all error messages |
| Template preview         | Live preview accessible via screen reader |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned | WCAG 2.1 AA Accessible*
