# BPDS CareTrack™ — System Administrator: All Tenants

**Page:** All Tenants
**Role:** System Administrator (Super Admin)
**Route:** `/admin/tenants`
**Platform:** Web Admin Panel (Angular 18+)
**Parent Menu:** Organization → Tenants → All Tenants

---

## Page Purpose

The All Tenants page is the master directory of every organization on the CareTrack platform. System Admins use this page to view, search, filter, create, edit, and manage tenants — including their status, programs, users, subscription health, and configuration. This is the operational control center for tenant lifecycle management.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                         │
│  [Logo] BPDS CareTrack™    [Search]    [Notifications] [Profile]   │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│  SIDEBAR │  PAGE HEADER                                             │
│          │  "All Tenants"              [+ Add New Tenant] [Export]  │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  ROW 1: STAT CARDS (6 cards)                             │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  TAB BAR                                                 │
│          │  [All] [Active] [Trial] [Pending] [Suspended] [Archived]│
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  FILTER BAR                                              │
│          │  [Search] [Status ▼] [Tier ▼] [State ▼] [Program Type ▼]│
│          │  [Date Range] [Sort ▼] [Bulk Actions ▼] [Export]        │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  VIEW TOGGLE: [Table View] [Card View] [Map View]       │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  TENANT TABLE / CARDS / MAP                              │
│          │  (Full-width data display with row actions)              │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  PAGINATION                                              │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

---

## Section 1: Page Header

**Position:** Top of content area, full width
**Height:** 64px

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Page Title           | "All Tenants"                                       |
| Breadcrumb           | Admin → Organization → Tenants                      |
| Tenant Count         | Subtitle: "38 tenants across 4 tiers"               |
| Primary Action       | [+ Add New Tenant] button (blue, top right)         |
| Secondary Action     | [Export] button (outlined)                          |

---

## Section 2: Stat Cards (KPI Row)

**Position:** Below page header
**Layout:** 6 cards in a responsive row
**Card Height:** 100px
**Card Style:** White background, subtle shadow, left-colored accent border (4px)

### Card 1: Total Tenants
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `building-2` (Lucide)                     |
| Accent Color   | `#2563EB` (Blue)                          |
| Primary Value  | Total tenant count (e.g., "38")           |
| Label          | "Total Tenants"                           |
| Trend          | ▲ +4 this quarter                         |

**Data Source:** `SELECT COUNT(*) FROM tenant.tenants WHERE is_deleted = false`

### Card 2: Active Tenants
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `check-circle` (Lucide)                   |
| Accent Color   | `#059669` (Green)                         |
| Primary Value  | Active tenant count                       |
| Label          | "Active"                                  |
| Sub Value      | "63% of total"                            |

**Data Source:** `SELECT COUNT(*) FROM tenant.tenants WHERE status = 'Active'`

### Card 3: Trial Tenants
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `flask-conical` (Lucide)                  |
| Accent Color   | `#0891B2` (Cyan)                          |
| Primary Value  | Trial tenant count                        |
| Label          | "In Trial"                                |
| Sub Value      | "3 expiring this week"                    |

**Data Source:** `SELECT COUNT(*) FROM tenant.tenants WHERE subscription_tier = 'Trial' AND status = 'Active'`

### Card 4: Suspended Tenants
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `pause-circle` (Lucide)                   |
| Accent Color   | `#DC2626` (Red)                           |
| Primary Value  | Suspended count                           |
| Label          | "Suspended"                               |
| Sub Value      | "2 pending review"                        |

**Data Source:** `SELECT COUNT(*) FROM tenant.tenants WHERE status = 'Suspended'`

### Card 5: Total Users (Platform)
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `users` (Lucide)                          |
| Accent Color   | `#7C3AED` (Purple)                        |
| Primary Value  | Sum of active users across all tenants    |
| Label          | "Total Users"                             |
| Sub Value      | "Avg 14 per tenant"                       |

**Data Source:** `SELECT COUNT(*) FROM identity.application_users WHERE status = 'Active'`

### Card 6: Total Clients (Platform)
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `user-round` (Lucide)                     |
| Accent Color   | `#D97706` (Amber)                         |
| Primary Value  | Sum of enrolled clients across all tenants|
| Label          | "Total Clients"                           |
| Sub Value      | "Avg 78 per tenant"                       |

**Data Source:** Aggregated from user role assignments with Client role

---

## Section 3: Tab Bar

**Position:** Below stat cards
**Style:** Underline tabs with count badges

| Tab              | Filter Logic                                  | Badge Color |
|------------------|-----------------------------------------------|-------------|
| All              | No filter — all tenants                       | Gray        |
| Active           | `status = 'Active'`                           | Green       |
| Trial            | `subscription_tier = 'Trial'`                 | Cyan        |
| Pending          | `status = 'PendingActivation'`                | Amber       |
| Suspended        | `status = 'Suspended'`                        | Red         |
| Archived         | `status = 'Archived' OR status = 'Deactivated'` | Gray     |

---

## Section 4: Filter Bar

**Position:** Below tab bar
**Layout:** Horizontal row, wrapping on smaller screens

| Filter Element       | Type            | Options                                          |
|----------------------|-----------------|--------------------------------------------------|
| Search               | Text input      | Search by name, slug, contact name, contact email, city |
| Status               | Multi-select    | PendingActivation, Active, Suspended, Deactivated, Archived |
| Subscription Tier    | Multi-select    | Trial, Basic, Professional, Enterprise, Government |
| State/Region         | Dropdown        | NH (default for CareTrack), or "All States"      |
| Program Type         | Multi-select    | SUD Treatment, Recovery Housing, Drug Court, Probation/Parole, Case Management, MAT, CBO |
| Date Range           | Date picker     | Filter by created date range                     |
| Billing Status       | Dropdown        | All, Current, Overdue, Grace Period, No Billing (Trial) |
| Usage Alert          | Dropdown        | All, Near User Limit (>85%), Near Client Limit (>85%), Over Limit |
| Sort By              | Dropdown        | Newest, Oldest, Name A-Z, Name Z-A, Most Users, Most Clients, Tier |
| Bulk Actions         | Dropdown        | Suspend Selected, Activate Selected, Send Notification, Export Selected |
| Reset Filters        | Text link       | "Clear all filters"                              |

### Saved Filters

| Feature              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Save Current Filter  | "Save this view" button → name input → saves to user preferences |
| Saved Views Dropdown | Quick-access to saved filter combinations           |
| Default Saved Views  | "Expiring Trials", "Overdue Billing", "At Capacity", "New This Month" |

---

## Section 5: View Toggle

**Position:** Below filter bar, right-aligned
**Style:** Icon toggle group (3 options)

| View         | Icon              | Description                                  |
|--------------|-------------------|----------------------------------------------|
| Table View   | `table` (Lucide)  | Default — full data table with all columns   |
| Card View    | `layout-grid`     | Visual cards with key metrics per tenant     |
| Map View     | `map-pin`         | Geographic plot of tenants on NH state map   |

---

## Section 6A: Table View (Default)

**Pagination:** 20 rows per page (configurable: 10, 20, 50, 100)
**Row Height:** 52px
**Row Hover:** Light blue highlight
**Row Click:** Navigate to tenant detail page

### Table Columns

| #  | Column               | Width  | Sortable | Detail                                           |
|----|----------------------|--------|----------|---------------------------------------------------|
| 1  | Checkbox             | 40px   | No       | Multi-select for bulk actions                     |
| 2  | Status Indicator     | 12px   | No       | Colored dot: Green/Amber/Red/Gray                 |
| 3  | Organization Name    | auto   | Yes      | Tenant name (bold, clickable → detail page)       |
| 4  | Slug                 | 140px  | Yes      | URL identifier, monospace font                    |
| 5  | Primary Contact      | 180px  | Yes      | Name + email (truncated, tooltip for full)        |
| 6  | Location             | 140px  | Yes      | City, State (e.g., "Carroll, NH")                 |
| 7  | Status               | 110px  | Yes      | Badge: Active / Trial / Pending / Suspended / Archived |
| 8  | Subscription Tier    | 130px  | Yes      | Badge with tier color                             |
| 9  | Programs             | 100px  | Yes      | Count with icon stack (e.g., "4 programs")        |
| 10 | Users                | 90px   | Yes      | "32 / 50" with mini progress bar                  |
| 11 | Clients              | 90px   | Yes      | "187 / 500" with mini progress bar                |
| 12 | Subscription Ends    | 110px  | Yes      | Date or "Trial: 12d left"                         |
| 13 | Billing              | 100px  | Yes      | "Current" (green) / "Overdue" (red) / "N/A" (trial) |
| 14 | Created              | 100px  | Yes      | Relative: "3 months ago" (tooltip: full date)     |
| 15 | Last Activity        | 100px  | Yes      | Most recent login by any tenant user              |
| 16 | Actions              | 80px   | No       | Three-dot menu (kebab)                            |

### Status Badge Colors

| Status              | Background  | Text Color | Border     |
|---------------------|-------------|------------|------------|
| Pending Activation  | `#FEF3C7`   | `#92400E`  | `#F59E0B`  |
| Active              | `#D1FAE5`   | `#065F46`  | `#10B981`  |
| Suspended           | `#FEE2E2`   | `#991B1B`  | `#EF4444`  |
| Deactivated         | `#F3F4F6`   | `#374151`  | `#9CA3AF`  |
| Archived            | `#F3F4F6`   | `#6B7280`  | `#D1D5DB`  |

### Subscription Tier Badge Colors

| Tier           | Background  | Text Color | Border     |
|----------------|-------------|------------|------------|
| Trial          | `#F1F5F9`   | `#475569`  | `#94A3B8`  |
| Basic          | `#DBEAFE`   | `#1E40AF`  | `#60A5FA`  |
| Professional   | `#EFF6FF`   | `#1D4ED8`  | `#2563EB`  |
| Enterprise     | `#EEF2FF`   | `#3730A3`  | `#4F46E5`  |
| Government     | `#F0F4F8`   | `#1B3A5C`  | `#1E3A5F`  |

### Row Actions (Kebab Menu)

| Action                    | Icon              | Permission Required    | Route / Behavior              |
|---------------------------|-------------------|------------------------|-------------------------------|
| View Details              | `eye`             | `tenants.view`         | `/admin/tenants/:id`          |
| Edit Tenant               | `pencil`          | `tenants.update`       | `/admin/tenants/:id/edit`     |
| Manage Subscription       | `credit-card`     | `tenants.update`       | `/admin/tenants/subscriptions/:id` |
| Manage Programs           | `folder-kanban`   | `programs.manage`      | `/admin/tenants/:id/programs` |
| Manage Users              | `users`           | `users.view`           | `/admin/tenants/:id/users`    |
| Manage Feature Flags      | `toggle-left`     | `tenants.update`       | `/admin/tenants/:id/features` |
| View Billing History      | `receipt`         | `tenants.view`         | `/admin/tenants/:id/billing`  |
| Configure Branding        | `palette`         | `tenants.update`       | `/admin/tenants/:id/branding` |
| Impersonate Tenant Admin  | `user-check`      | `tenants.update`       | Opens modal (see below)       |
| Suspend Tenant            | `pause-circle`    | `tenants.deactivate`   | Opens modal (see below)       |
| Activate Tenant           | `play-circle`     | `tenants.update`       | Opens modal (see below)       |
| Deactivate Tenant         | `x-circle`        | `tenants.deactivate`   | Opens modal (see below)       |
| View Audit Trail          | `scroll-text`     | `audit.view`           | `/admin/tenants/:id/audit`    |
| Delete Tenant             | `trash-2`         | `tenants.deactivate`   | Opens modal (see below)       |

### Conditional Row Actions

| Condition                    | Visible Actions                                        | Hidden Actions             |
|------------------------------|--------------------------------------------------------|----------------------------|
| Status = PendingActivation   | View, Edit, Activate, Delete                           | Suspend, Deactivate        |
| Status = Active              | View, Edit, Manage *, Suspend, Impersonate             | Activate, Delete           |
| Status = Suspended           | View, Activate, Deactivate, View Audit                 | Edit, Manage *, Suspend    |
| Status = Deactivated         | View, View Audit, Delete                               | Edit, Manage *, Activate   |
| Status = Archived            | View, View Audit                                       | All actions disabled        |
| Tier = Trial                 | All + "Extend Trial" option                            | —                          |

---

## Section 6B: Card View

**Layout:** 3 cards per row (2 on tablet, 1 on mobile)
**Card Height:** Auto (content-driven, ~260px)

### Card Layout

```
┌──────────────────────────────────────┐
│  [Logo/Avatar]  Grafton Drug Court   │
│                 grafton-drug-court    │
│  ──────────────────────────────────  │
│  Status: ● Active    Tier: Professional │
│  ──────────────────────────────────  │
│  Contact: John Smith                 │
│           john@grafton.gov           │
│  Location: Grafton, NH              │
│  ──────────────────────────────────  │
│  Programs   Users      Clients      │
│  4          32/50      187/500      │
│  ████████   ████████░  ████░░░░░   │
│  ──────────────────────────────────  │
│  Subscription ends: Jan 14, 2027    │
│  Billing: ● Current                  │
│  Last activity: 2 hours ago          │
│  ──────────────────────────────────  │
│  [View Details]  [Edit]  [⋮ More]   │
└──────────────────────────────────────┘
```

### Card Elements

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Tenant Logo          | 48px circle — tenant logo or generated initials avatar |
| Organization Name    | Bold, 16px, clickable → detail page                 |
| Slug                 | Monospace, muted color, 12px                        |
| Status + Tier        | Badges (same colors as table view)                  |
| Contact Info         | Name + email (truncated with tooltip)               |
| Location             | City, State                                         |
| Metrics Row          | Programs count, Users gauge, Clients gauge          |
| Progress Bars        | Mini horizontal bars under each metric              |
| Subscription Info    | End date + billing status                           |
| Last Activity        | Relative timestamp                                  |
| Action Buttons       | View Details (primary), Edit (outlined), More (kebab) |

---

## Section 6C: Map View

**Layout:** Full-width interactive map
**Map Provider:** Leaflet.js or Google Maps
**Default View:** New Hampshire state, zoom level showing all tenant locations
**Pin Color:** Matches tenant status color (Green=Active, Amber=Trial, Red=Suspended, Gray=Inactive)

### Map Pin Popup

```
┌──────────────────────────────┐
│  Grafton Drug Court          │
│  ● Active · Professional     │
│  ──────────────────────────  │
│  32 users · 187 clients      │
│  4 programs                  │
│  ──────────────────────────  │
│  [View Details →]            │
└──────────────────────────────┘
```

### Map Sidebar (Collapsible)

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Tenant List          | Scrollable list synced with map pins                |
| Hover Sync           | Hovering list item highlights map pin and vice versa |
| Click Behavior       | Click list item → map centers on pin + opens popup  |
| Filter Sync          | Map respects all active filters from filter bar     |
| Cluster Mode         | Pins cluster when zoomed out (show count badge)     |

---

## Modals

### Modal 1: Add New Tenant

**Trigger:** [+ Add New Tenant] button
**Type:** Slide-over panel (right side, 640px wide)
**Route:** `/admin/tenants/new`

#### Step 1: Organization Info

| Field                | Type          | Validation                    | Required |
|----------------------|---------------|-------------------------------|----------|
| Organization Name    | Text input    | 3–256 characters, unique      | Yes      |
| Slug                 | Text input    | Auto-generated from name, editable, URL-safe, unique | Yes |
| Federal Tax ID       | Text input    | Format: XX-XXXXXXX (encrypted at rest) | No |
| Primary Contact Name | Text input    | 2–256 characters              | Yes      |
| Primary Contact Email| Email input   | Valid email format, unique     | Yes      |
| Primary Contact Phone| Phone input   | US format: (XXX) XXX-XXXX     | No       |

#### Step 2: Address

| Field                | Type          | Validation                    | Required |
|----------------------|---------------|-------------------------------|----------|
| Address Line 1       | Text input    | 1–512 characters              | Yes      |
| Address Line 2       | Text input    | 0–512 characters              | No       |
| City                 | Text input    | 1–128 characters              | Yes      |
| State                | Dropdown      | US states (default: NH)       | Yes      |
| ZIP Code             | Text input    | 5 or 9 digit US ZIP           | Yes      |

#### Step 3: Subscription

| Field                | Type            | Validation                  | Required |
|----------------------|-----------------|-----------------------------|----------|
| Subscription Tier    | Radio cards     | Trial, Basic, Professional, Enterprise, Government | Yes |
| Contract Term        | Dropdown        | Trial (30d), Monthly, Quarterly, Semi-Annual, Annual | Yes |
| Start Date           | Date picker     | Today or future date        | Yes      |
| Auto-Renew           | Toggle          | Default: On for paid, Off for trial | No |
| Monthly Rate         | Currency input  | Auto-filled per tier, editable | Yes (paid) |
| Discount %           | Number input    | 0–50 (>50 requires override) | No      |
| Max Users            | Number input    | Default per tier             | Yes      |
| Max Clients          | Number input    | Default per tier             | Yes      |
| Max Programs         | Number input    | Default per tier             | Yes      |

#### Step 4: Programs (Optional)

| Field                | Type            | Detail                      |
|----------------------|-----------------|-----------------------------|
| Add Initial Program  | Toggle          | "Set up first program now?" |
| Program Name         | Text input      | Required if toggle is on    |
| Program Type         | Dropdown        | SUD Treatment, Recovery Housing, Drug Court, etc. |
| Program Director     | Text input      | Optional                    |
| Director Email       | Email input     | Optional                    |

*Multiple programs can be added by clicking "+ Add Another Program"*

#### Step 5: Branding (Optional)

| Field                | Type            | Detail                      |
|----------------------|-----------------|-----------------------------|
| Logo Upload          | File upload     | PNG/SVG, max 2MB, 200×200px min |
| Primary Color        | Color picker    | Hex input + visual picker   |
| Custom Domain        | Text input      | e.g., "grafton.caretrack.app" |

#### Step 6: Review & Confirm

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Summary Card         | All entered data in read-only format                |
| Validation Check     | Green checkmarks next to all valid sections         |
| Warning Panel        | Amber warnings for optional fields left empty       |
| Welcome Email        | Toggle: "Send welcome email to primary contact" (default: On) |
| Internal Notes       | Textarea for admin-only notes                       |
| Actions              | [Save as Draft] [Create & Activate] [Cancel]        |

### Slug Auto-Generation Logic

| Input                          | Generated Slug                  |
|--------------------------------|---------------------------------|
| Grafton County Drug Court      | `grafton-county-drug-court`     |
| NH DHHS — Region 1             | `nh-dhhs-region-1`              |
| Carroll Recovery Housing Inc.  | `carroll-recovery-housing-inc`  |
| St. Mary's Treatment Center    | `st-marys-treatment-center`     |

**Rules:** Lowercase, spaces → hyphens, remove special chars except hyphens and numbers, trim to 128 chars, uniqueness check on blur.

---

### Modal 2: Edit Tenant

**Trigger:** Row action → Edit Tenant
**Type:** Slide-over panel (right side, 640px wide)
**Route:** `/admin/tenants/:id/edit`

Same fields as "Add New Tenant" Steps 1, 2, 5 — pre-populated with existing data. Subscription and Programs managed via their dedicated pages.

| Additional Field     | Detail                                              |
|----------------------|-----------------------------------------------------|
| Status               | Dropdown: PendingActivation, Active, Suspended, Deactivated |
| Tenant Settings JSON | Advanced JSON editor for custom configuration       |
| Change Reason        | Textarea (required for status changes)              |

---

### Modal 3: Suspend Tenant

**Trigger:** Row action → Suspend Tenant
**Type:** Center modal (500px wide) with warning state

| Field                | Detail                                              |
|----------------------|-----------------------------------------------------|
| Warning Banner       | Red: "Suspending will immediately block all [X] users from accessing the platform." |
| Tenant Name          | Display only (bold)                                 |
| Impact Summary       | "X active users, Y enrolled clients, Z active programs" |
| Suspension Type      | Radio: "Temporary" / "Indefinite"                   |
| Reinstatement Date   | Date picker (visible if Temporary)                  |
| Reason               | Dropdown: Non-Payment, Contract Violation, Security Concern, State Request, Investigation, Other |
| Detailed Reason      | Textarea (required)                                 |
| Notify Tenant Admin  | Toggle (default: on)                                |
| Notification Preview | Expandable email preview                            |
| Confirm Text         | Type tenant slug to confirm                         |
| Confirm              | "Suspend Tenant" button (red)                       |

**Effects on Suspend:**
- All tenant user sessions revoked immediately
- All users blocked from login
- Data preserved — no deletion
- Scheduled notifications for tenant users paused
- Billing paused
- Audit log entry created with full context
- Tenant admin receives notification (if toggle on)

---

### Modal 4: Activate Tenant

**Trigger:** Row action → Activate Tenant (for Pending or Suspended tenants)
**Type:** Center modal (450px wide)

| Field                | Detail                                              |
|----------------------|-----------------------------------------------------|
| Tenant Name          | Display only                                        |
| Current Status       | Badge showing current status                        |
| Pre-Activation Check | Checklist (auto-validated):                         |
|                      | ✅ Subscription configured                          |
|                      | ✅ Primary contact verified                         |
|                      | ✅ At least one program configured                  |
|                      | ⚠️ No branding configured (optional)               |
| Send Welcome Email   | Toggle (default: on for first activation, off for reactivation) |
| Notes                | Textarea                                            |
| Confirm              | "Activate Tenant" button (green)                    |

**Effects on Activate:**
- Status → Active
- All users regain access (if previously suspended)
- Subscription billing resumes
- Welcome email sent to tenant admin (if toggled)
- Audit log entry

---

### Modal 5: Deactivate Tenant

**Trigger:** Row action → Deactivate Tenant
**Type:** Center modal (500px wide) with critical warning

| Field                | Detail                                              |
|----------------------|-----------------------------------------------------|
| Warning Banner       | Red: "CRITICAL: Deactivation will permanently disable this tenant. Users will lose access and billing will stop." |
| Tenant Name          | Bold, red                                           |
| Impact Summary       | Full impact statement                               |
| Data Retention       | "Data retained for 90 days, then permanently purged" |
| Reason               | Dropdown + textarea (both required)                 |
| Exit Checklist       | All must be checked:                                |
|                      | ☐ Tenant admin has been notified                    |
|                      | ☐ Data export has been offered/completed            |
|                      | ☐ Outstanding invoices have been addressed          |
|                      | ☐ All active programs have been reviewed            |
|                      | ☐ I understand this deactivates all users           |
| Confirm Text         | Type "DEACTIVATE [TENANT-SLUG]"                     |
| Confirm              | "Deactivate Tenant" button (red)                    |

---

### Modal 6: Delete Tenant (Soft Delete)

**Trigger:** Row action → Delete Tenant (only for Pending or Deactivated tenants)
**Type:** Center modal (450px wide) with destructive warning

| Field                | Detail                                              |
|----------------------|-----------------------------------------------------|
| Warning Banner       | Red: "This will archive the tenant record. Data will be retained per retention policy." |
| Tenant Name          | Bold                                                |
| Condition Check      | Must be in Pending or Deactivated status            |
| Has Active Data      | Warning if any users, clients, or documents exist   |
| Reason               | Textarea (required)                                 |
| Confirm Text         | Type tenant slug                                    |
| Confirm              | "Delete Tenant" button (red)                        |

**Note:** CareTrack never hard-deletes. This sets `is_deleted = true` and `status = Archived`. Data retained per HIPAA retention requirements.

---

### Modal 7: Impersonate Tenant Admin

**Trigger:** Row action → Impersonate Tenant Admin
**Type:** Center modal (450px wide) with security warning

| Field                | Detail                                              |
|----------------------|-----------------------------------------------------|
| Warning Banner       | Amber: "You will view the platform as if you are the Tenant Administrator. All actions will be logged under your identity." |
| Tenant Name          | Display only                                        |
| Tenant Admin         | Display: admin name + email                         |
| Session Duration     | Dropdown: 15 min, 30 min, 1 hour, 2 hours          |
| Reason               | Dropdown: Support Request, Configuration Review, Troubleshooting, Training, Audit, Other |
| Detailed Reason      | Textarea (required)                                 |
| Acknowledge          | Checkbox: "I understand all actions are logged and attributed to my account" |
| Confirm              | "Start Impersonation" button (amber)                |

**Impersonation Behavior:**
- System Admin sees tenant admin view with impersonation banner at top
- Banner: "[Impersonating: Grafton Drug Court] [Time Remaining: 28:45] [End Session]"
- All actions logged with `impersonated_by` field in audit trail
- Session auto-expires after selected duration
- Cannot impersonate another admin while already impersonating
- Cannot access other tenants during impersonation
- Cannot modify System Admin settings during impersonation

---

### Modal 8: Bulk Actions Confirmation

**Trigger:** Select multiple rows → Bulk Actions dropdown
**Type:** Center modal (450px wide)

| Action               | Confirmation Detail                                  |
|----------------------|------------------------------------------------------|
| Suspend Selected     | "You are about to suspend [X] tenants. [Y] total users will lose access." |
| Activate Selected    | "You are about to activate [X] tenants."             |
| Send Notification    | "Send notification to [X] tenant admins." + template picker |
| Export Selected      | "Export [X] tenant records as CSV."                  |

---

## Tenant Detail Page

**Route:** `/admin/tenants/:id`
**Access:** Click tenant name in table, card, or map popup

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Admin > Tenants > [Tenant Name]                     │
│  PAGE TITLE: [Logo] [Tenant Name]               [Actions ▼]     │
│              [slug] · [Status Badge] · [Tier Badge]              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INFO CARDS ROW (4 cards)                                        │
│  [Users: 32/50]  [Clients: 187/500]  [Programs: 4]  [MRR: $1,350] │
│                                                                  │
│  TABS                                                            │
│  [Overview] [Programs] [Users] [Subscription] [Features]         │
│  [Branding] [Billing] [Audit] [Settings]                        │
│                                                                  │
│  TAB CONTENT                                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tab: Overview

| Section              | Content                                             |
|----------------------|-----------------------------------------------------|
| Organization Info    | Name, slug, tax ID (masked), contact info, address  |
| Quick Stats          | Users, clients, programs, last activity, created date |
| Recent Activity Feed | Last 10 actions within this tenant (timeline view)  |
| Health Indicators    | Subscription health, billing status, usage alerts   |

### Tab: Programs

| Column       | Detail                                              |
|--------------|-----------------------------------------------------|
| Program Name | Clickable                                           |
| Type         | Badge (Drug Court, Recovery Housing, etc.)          |
| Director     | Name + email                                        |
| Clients      | Count                                               |
| Staff         | Count                                               |
| Status       | Active / Inactive                                   |
| Actions      | Edit, Deactivate, View Config                       |
| CTA          | [+ Add Program] button                              |

### Tab: Users

| Column       | Detail                                              |
|--------------|-----------------------------------------------------|
| Name         | Full name (clickable → profile)                     |
| Email        | Email address                                       |
| Role         | Badge: Admin, Provider, Case Manager, Client, Auditor |
| Programs     | Assigned programs (tags)                            |
| Status       | Active / Locked / Suspended                         |
| Last Login   | Relative timestamp                                  |
| Actions      | Edit, Reset Password, Deactivate, View Activity     |
| CTA          | [+ Invite User] button                              |

### Tab: Subscription

Embedded version of Subscription Detail (see Subscription Management doc)

### Tab: Features

| Column       | Detail                                              |
|--------------|-----------------------------------------------------|
| Feature Key  | `housing_module`, `lab_integration`, etc.           |
| Display Name | Human-readable name                                 |
| Status       | Toggle switch: On / Off                             |
| Enabled At   | Timestamp                                           |
| Config       | JSON viewer (expandable)                            |

### Tab: Branding

| Element      | Detail                                              |
|--------------|-----------------------------------------------------|
| Logo Preview | Current logo (with upload/replace button)           |
| Primary Color| Color swatch + hex code (with color picker)         |
| Custom Domain| Domain name + verification status                   |
| Preview      | "Preview tenant portal" link (opens in new tab)     |

### Tab: Billing

Embedded billing history table (see Subscription Management doc)

### Tab: Audit

| Column       | Detail                                              |
|--------------|-----------------------------------------------------|
| Timestamp    | Full datetime                                       |
| User         | Who performed the action                            |
| Action       | Action type                                         |
| Entity       | What was affected                                   |
| IP Address   | Source IP                                            |
| Details      | Expandable JSON diff                                |

### Tab: Settings

| Section      | Detail                                              |
|--------------|-----------------------------------------------------|
| Tenant Config| JSON editor with validation                         |
| Time Zone    | Dropdown                                            |
| Locale       | Dropdown                                            |
| Notification Defaults | Per-tenant notification configuration       |
| Data Retention| Tenant-specific retention overrides (if applicable) |

---

## API Endpoints Required

| Endpoint                                          | Method | Description                        |
|---------------------------------------------------|--------|------------------------------------|
| `/api/v1/admin/tenants`                           | GET    | List all tenants (paginated, filterable) |
| `/api/v1/admin/tenants/stats`                     | GET    | KPI card values                    |
| `/api/v1/admin/tenants`                           | POST   | Create new tenant                  |
| `/api/v1/admin/tenants/:id`                       | GET    | Tenant detail                      |
| `/api/v1/admin/tenants/:id`                       | PUT    | Update tenant                      |
| `/api/v1/admin/tenants/:id/activate`              | POST   | Activate tenant                    |
| `/api/v1/admin/tenants/:id/suspend`               | POST   | Suspend tenant                     |
| `/api/v1/admin/tenants/:id/deactivate`            | POST   | Deactivate tenant                  |
| `/api/v1/admin/tenants/:id/delete`                | DELETE | Soft delete tenant                 |
| `/api/v1/admin/tenants/:id/programs`              | GET    | List tenant programs               |
| `/api/v1/admin/tenants/:id/programs`              | POST   | Add program to tenant              |
| `/api/v1/admin/tenants/:id/users`                 | GET    | List tenant users                  |
| `/api/v1/admin/tenants/:id/features`              | GET    | List feature flags                 |
| `/api/v1/admin/tenants/:id/features/:key`         | PUT    | Toggle feature flag                |
| `/api/v1/admin/tenants/:id/branding`              | PUT    | Update branding                    |
| `/api/v1/admin/tenants/:id/branding/logo`         | POST   | Upload logo                        |
| `/api/v1/admin/tenants/:id/settings`              | GET    | Get tenant settings                |
| `/api/v1/admin/tenants/:id/settings`              | PUT    | Update tenant settings             |
| `/api/v1/admin/tenants/:id/audit`                 | GET    | Tenant audit trail                 |
| `/api/v1/admin/tenants/:id/impersonate`           | POST   | Start impersonation session        |
| `/api/v1/admin/tenants/:id/impersonate/end`       | POST   | End impersonation session          |
| `/api/v1/admin/tenants/export`                    | GET    | Export filtered tenants as CSV     |
| `/api/v1/admin/tenants/bulk`                      | POST   | Bulk action on selected tenants    |
| `/api/v1/admin/tenants/slug-check`                | GET    | Check slug uniqueness              |
| `/api/v1/admin/tenants/map-data`                  | GET    | Tenant locations for map view      |

**Authentication:** Bearer JWT with `SystemAdministrator` role claim
**Rate Limiting:** 60 requests/minute per user

---

## Business Rules

| Rule                                          | Logic                                                |
|-----------------------------------------------|------------------------------------------------------|
| Unique Slug                                   | Globally unique, validated on create and edit         |
| Unique Contact Email                          | One primary contact email per tenant                 |
| Activation Prerequisites                      | Subscription + contact + at least 1 program required |
| Suspension Cascade                            | All user sessions revoked, logins blocked            |
| Deactivation Cascade                          | All users deactivated, billing stopped               |
| Soft Delete Only                              | `is_deleted = true`, never hard delete               |
| Delete Constraint                             | Only Pending or Deactivated tenants can be deleted   |
| Impersonation Logging                         | Every action during impersonation double-logged      |
| Impersonation Restrictions                    | Cannot access System Admin features while impersonating |
| Slug Immutability                             | Slug cannot be changed after first activation (prevents URL breakage) |
| Federal Tax ID Encryption                     | Encrypted at rest, masked in UI (show last 4 only)   |
| Logo Constraints                              | Max 2MB, PNG/SVG/JPG, min 200×200px                 |
| Max Tenants                                   | Platform limit configurable (default: unlimited)     |

---

## Permission Requirements

| Action                        | Permission Required       |
|-------------------------------|---------------------------|
| View Tenant List              | `tenants.view`            |
| View Tenant Detail            | `tenants.view`            |
| Create Tenant                 | `tenants.create`          |
| Edit Tenant                   | `tenants.update`          |
| Activate Tenant               | `tenants.update`          |
| Suspend Tenant                | `tenants.deactivate`      |
| Deactivate Tenant             | `tenants.deactivate`      |
| Delete Tenant                 | `tenants.deactivate`      |
| Impersonate Tenant Admin      | `tenants.update`          |
| Manage Feature Flags          | `tenants.update`          |
| Manage Branding               | `tenants.update`          |
| View Audit Trail              | `audit.view`              |
| Export Tenants                | `reports.export`          |
| Bulk Actions                  | Per-action permission      |

---

## Loading & Error States

| State                | Behavior                                              |
|----------------------|-------------------------------------------------------|
| Page Load            | Skeleton loaders for cards + table/cards/map           |
| Tab Loading          | Skeleton within tab content area                      |
| Modal Loading        | Spinner inside modal body                             |
| Action In Progress   | Button disabled + spinner + processing text           |
| Success              | Toast: "Tenant [action] successfully"                 |
| Error                | Toast error with retry option                         |
| Validation Error     | Inline red borders + error messages below fields       |
| Empty State          | Illustration + "No tenants found" + [Add Tenant] CTA |
| No Search Results    | "No tenants match your filters" + clear filters link  |
| Map Loading          | Map skeleton with loading spinner                     |
| Map No Data          | Map shown with "No tenant locations to display"       |

---

## Responsive Breakpoints

| Breakpoint     | Layout Changes                                         |
|----------------|--------------------------------------------------------|
| ≥ 1440px       | 6 stat cards in row, full table, map with sidebar      |
| 1024–1439px    | 3+3 stat cards, table with horizontal scroll, map full |
| 768–1023px     | 2+2+2 stat cards, card view default, map stacked       |
| < 768px        | Stacked cards, card view only (no table), no map       |

---

## Keyboard Shortcuts

| Shortcut       | Action                          |
|----------------|---------------------------------|
| `N`            | New tenant (opens slide-over)   |
| `E`            | Export current view              |
| `/`            | Focus search input               |
| `Esc`          | Close open modal/panel           |
| `T`            | Toggle table/card/map view       |
| `1-6`          | Switch tabs (on detail page)     |
| `↑` / `↓`     | Navigate table rows              |
| `Enter`        | Open selected tenant detail      |

---

## Accessibility Requirements

| Requirement              | Standard                                  |
|--------------------------|-------------------------------------------|
| Color Contrast           | WCAG 2.1 AA minimum (4.5:1 text)          |
| Keyboard Navigation      | Full tab order including modals and map    |
| Screen Reader            | ARIA labels on all interactive elements    |
| View Toggle              | `role="tablist"` with proper ARIA         |
| Map Accessibility        | Map pins navigable via keyboard + screen reader |
| Modal Focus Trap         | Focus trapped inside open modals           |
| Status Announcements     | ARIA live regions for toasts and status changes |
| Form Validation          | Errors announced via `aria-describedby`    |
| Data Tables              | Proper `<th>` scope, sortable column ARIA  |
| Skeleton Loaders         | `aria-busy="true"` during loading          |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned | WCAG 2.1 AA Accessible*
