# BPDS CareTrack™ — Production-Grade Enterprise UI/UX Prototype Prompt

---

## PROJECT OVERVIEW

Design a **production-grade, enterprise-class** high-fidelity UI/UX prototype for **BPDS CareTrack™** — a HIPAA-compliant, multi-tenant SaaS platform for substance use disorder (SUD) treatment engagement, accountability monitoring, compliance tracking, and client retention. The platform serves drug courts, probation/parole, recovery housing programs, and case management services under a State of New Hampshire DHHS contract.

**Design Philosophy:** Enterprise-grade space efficiency. Every pixel earns its place. Information density is high but never overwhelming — achieved through intelligent hierarchy, progressive disclosure, and compact component design. This is a **daily-driver work tool** for providers managing 30+ clients and administrators overseeing hundreds — not a consumer wellness app. Client-facing mobile screens remain simple but are still compact and purposeful.

**Platform Architecture:**
- **Mobile App (Flutter 3.x):** Client-facing primary + Provider field companion
- **Web Admin Portal (Angular 18+):** Provider workstation + Administrator command center + Operator tenant management
- **Compliance Standards:** HIPAA, 42 CFR Part 2, NIST 800-53/171, Section 508, WCAG 2.1 AA

---

## DESIGN SYSTEM SPECIFICATION — ENTERPRISE COMPACT

### Style: Enterprise Healthcare — Compact Minimalism
- **Space-efficient layouts** — no decorative whitespace, every gap serves hierarchy
- Compact 4px base spacing grid: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48px
- **Tight vertical rhythm** — 4px gap between related items, 8px between groups, 16px between sections
- Card padding: 12px–16px (not 24px) — maximize content area
- Sidebar width: 220px expanded / 56px collapsed (icon rail mode)
- Header height: 48px fixed (compact persistent header)
- Table row height: 40px (compact) / 48px (comfortable) — user toggle
- Dense data tables with inline actions — no row expansion unless necessary
- Split-pane layouts for master-detail views (list left, detail right)
- Collapsible sections everywhere — user controls information density
- **No full-page modals** — use slide-over panels (400px width) or inline expansion

### Color Palette — Enterprise Healthcare
```
Primary:          #1E40AF  (Blue 800 — authority, trust, enterprise)
Primary Light:    #3B82F6  (Blue 500 — interactive elements, links)
Primary Hover:    #1D4ED8  (Blue 700 — hover/active states)
Secondary:        #0F766E  (Teal 700 — health, compliance positive)
Accent:           #7C3AED  (Violet 600 — premium features, insights)

Status — Success:   #15803D  (Green 700 — compliant, negative UA, on track)
Status — Warning:   #B45309  (Amber 700 — at risk, missed item, attention)
Status — Danger:    #B91C1C  (Red 700 — non-compliant, positive UA, critical)
Status — Info:      #1D4ED8  (Blue 700 — informational, neutral status)
Status — Neutral:   #6B7280  (Gray 500 — inactive, pending, no data)

Background:       #F8FAFC  (Slate 50 — app background)
Surface:          #FFFFFF  (Cards, panels, modals)
Surface Elevated: #F1F5F9  (Slate 100 — nested cards, table headers, secondary surfaces)
Sidebar BG:       #0F172A  (Slate 900 — dark sidebar for enterprise feel)
Sidebar Text:     #CBD5E1  (Slate 300 — sidebar labels)
Sidebar Active:   #3B82F6  (Blue 500 — active nav highlight)

Text Primary:     #0F172A  (Slate 900)
Text Secondary:   #475569  (Slate 600)
Text Muted:       #94A3B8  (Slate 400 — timestamps, metadata)
Text On Dark:     #F1F5F9  (Slate 100 — text on dark sidebar)

Border:           #E2E8F0  (Slate 200 — card/container borders)
Border Strong:    #CBD5E1  (Slate 300 — table dividers, input borders)
Divider:          #F1F5F9  (Slate 100 — subtle section dividers)

Focus Ring:       #3B82F6  (Blue 500 — 2px offset ring)
```

### Typography — Enterprise Grade
```
Font Family:      "Inter", system-ui, -apple-system, sans-serif
Weights Used:     400 (regular) | 500 (medium) | 600 (semibold)

Scale (Desktop Web Admin):
  Page Title:     20px / semibold / tracking -0.02em
  Section Header: 14px / semibold / tracking 0 / uppercase / text-muted (Slate 400)
  Card Title:     15px / semibold
  Body:           14px / regular / line-height 1.5
  Table Cell:     13px / regular
  Table Header:   12px / semibold / uppercase / tracking 0.05em / text-muted
  Caption/Meta:   12px / regular / text-muted
  Badge Text:     11px / medium
  Stat Number:    28px / semibold / tracking -0.02em (KPI values)

Scale (Mobile Client App):
  Screen Title:   22px / semibold
  Card Title:     16px / semibold
  Body:           15px / regular / line-height 1.5
  Secondary:      13px / regular / text-secondary
  Button Text:    15px / semibold
  Input Text:     15px / regular
  Tab Label:      12px / medium
```

### Icon System
- **Lucide Icons** (consistent 1.5px stroke, 20px default, 16px compact)
- 24px for mobile navigation, 20px for web sidebar, 16px inline with text
- Icon + text labels in sidebar (expanded) / icon-only in rail mode (collapsed)

### Component Specifications

**Buttons:**
```
Primary:     bg-blue-800 text-white h-36px px-14px rounded-8px text-13px font-medium
Secondary:   bg-slate-100 text-slate-700 h-36px px-14px rounded-8px border border-slate-200
Ghost:       bg-transparent text-slate-600 h-36px px-10px rounded-8px hover:bg-slate-100
Danger:      bg-red-700 text-white h-36px px-14px rounded-8px
Icon Button: w-32px h-32px rounded-8px hover:bg-slate-100 flex items-center justify-center
```

**Inputs:**
```
Height:       36px (web) / 44px (mobile)
Padding:      px-10px
Border:       1px solid slate-300
Border Focus: 2px solid blue-500 (no offset, inset ring)
Radius:       8px
Font:         14px regular (web) / 15px regular (mobile)
Label:        12px semibold text-slate-600 mb-4px (always above, never floating)
Error:        12px regular text-red-700 mt-2px + red border
```

**Cards:**
```
Padding:      12px (compact) / 16px (standard)
Border:       1px solid slate-200
Radius:       10px
Shadow:       none (flat enterprise) — shadow only on hover/elevated state: 0 1px 3px rgba(0,0,0,0.06)
Header:       14px semibold + optional subtitle in muted text, action button right-aligned
```

**Badges / Status Pills:**
```
Size:         h-20px px-8px rounded-full text-11px font-medium
Compliant:    bg-green-50 text-green-700 border border-green-200
At Risk:      bg-amber-50 text-amber-700 border border-amber-200
Non-Compliant: bg-red-50 text-red-700 border border-red-200
Pending:      bg-slate-50 text-slate-500 border border-slate-200
Active:       bg-blue-50 text-blue-700 border border-blue-200
```

**Data Tables (Enterprise Compact):**
```
Header Row:   h-36px bg-slate-50 text-12px uppercase semibold text-slate-400 tracking-wide
Data Row:     h-40px border-b border-slate-100 text-13px
Hover:        bg-slate-50
Selected:     bg-blue-50 border-l-2 border-blue-500
Actions Cell: Icon buttons (edit/view/more) — 28px square, appear on row hover
Pagination:   Bottom bar — "Showing 1-25 of 342" + page controls
```

**Sidebar Navigation (Dark Enterprise):**
```
Width:        220px expanded / 56px collapsed (rail mode)
Background:   slate-900
Item:         h-36px px-12px text-13px text-slate-300 rounded-8px mx-8px
Active Item:  bg-blue-600/20 text-white border-l-2 border-blue-400
Hover:        bg-white/5
Section Label: 11px uppercase text-slate-500 tracking-widest px-12px mt-16px mb-4px
Collapse Toggle: Bottom of sidebar — chevron icon
```

---

## USER ROLES & ACCESS HIERARCHY

| Role | Web Access | Mobile Access | Scope |
|------|-----------|--------------|-------|
| **Client** | Limited (check-ins, messages) | Full mobile app | Own data only |
| **Provider** | Full provider workstation | Field companion app | Assigned clients + own data |
| **Administrator** | Full admin dashboard | Read-only mobile | Organization-wide data |
| **Operator** | Tenant management console | None | Multi-organization management |
| **Super Admin** | System-wide administration | None | All tenants, system config |

---

## MOBILE APP SCREENS — CLIENT ROLE (Flutter / Material 3)

### M-01: Client Onboarding (3-step compact wizard)
- **Step 1 — Welcome:** CareTrack logo (compact, 48px), tagline "Track. Engage. Recover.", "Get Started" CTA (full-width, 48px height)
- **Step 2 — Profile Setup:** Name (pre-filled if invited), program type dropdown (Drug Court / Probation / Parole / Recovery Housing / Treatment), provider auto-assigned. Compact form — all fields visible without scroll
- **Step 3 — Notifications:** Push notification permission prompt + SMS fallback toggle + "You're all set" confirmation
- **Progress:** 3-dot indicator, step label text, back arrow on steps 2-3
- **Compact layout:** 16px horizontal padding, 12px between fields, no decorative illustrations — just clean functional forms

### M-02: Client Home Dashboard
- **Header Bar (48px):** Profile avatar (32px circle) left, notification bell + unread count right, "CareTrack" wordmark center
- **Status Banner (conditional):** Full-width colored strip — green "On Track — 14 Day Streak" / amber "Action Needed — Check-in Overdue" / red "Alert — Missed Appointment"
- **Quick Actions Row (horizontal scroll, 4 items):**
  - Check-in (clipboard-check icon, "Check In" label)
  - Appointments (calendar icon, count badge)
  - Messages (message-square icon, unread badge)
  - Documents (upload-cloud icon)
  - Each: 64x72px card, icon 24px, label 11px, rounded-12px, bg-white, border
- **Today's Schedule Card:** Compact list — time + event + status badge, max 3 visible + "See all" link. If empty: "No events today" single line
- **Compliance Summary Card:**
  - Row 1: Streak count (bold number) + "days" label | Compliance % (circular micro-gauge 40px)
  - Row 2: Check-ins this week (X/7 with mini progress bar) | Appointments attended (X/X)
- **Recent Activity (3 items max):** Icon + description + timestamp, compact 36px rows
- **Bottom Tab Bar (4 tabs, 56px):** Home | Check-ins | Messages | Profile — active tab: blue icon + label, inactive: slate-400 icon only

### M-03: Daily Check-in Flow (Single Scrollable Screen)
- **Date Header:** "Friday, April 4, 2026" — auto-populated, non-editable, 13px muted
- **Section 1 — How are you feeling?** 5 selectable chips in a row (Very Low / Low / Okay / Good / Great) — single-select, teal highlight on selected, 40px height each
- **Section 2 — Today's Activities** (checklist format):
  - "Attended all scheduled appointments" — toggle switch
  - "Completed required meetings" — toggle switch
  - "Took prescribed medication" — toggle switch (shown only if MOUD program)
  - Each row: 44px height, label left, toggle right
- **Section 3 — Substance Use:** "Any substance use since last check-in?" — Yes (red outline) / No (green outline) buttons, 44px height
  - If Yes → expandable: substance type dropdown + brief context text field
- **Section 4 — Notes (optional):** Single-line expandable text area, "Anything else?" placeholder, 44px min height
- **Submit Button:** Full-width, 48px, "Submit Check-in" — disabled until required fields complete
- **Post-Submit:** Inline success state replacing the form — checkmark + "Check-in recorded" + updated streak count. No separate success screen — space efficient.

### M-04: Appointments Screen
- **Segmented Control (top):** Upcoming | Past — 36px height, full-width toggle
- **Appointment Cards (compact list):**
  - Left: Date block (month abbreviated + day number, stacked, 48px square, bg-slate-100, rounded-8px)
  - Center: Time (bold 14px) + Provider name (13px) + Location/Virtual badge (12px muted)
  - Right: Status badge (Confirmed green / Pending amber / Missed red / Completed slate)
  - Card: 72px height, 12px padding, border-bottom divider
- **Action on card tap:** Expand inline to show: address, notes, "Request Reschedule" button, "Add to Calendar" link
- **Floating Action Button (bottom-right):** "+ Request Appointment" — 48px circle, primary blue
- **Empty State:** Single line "No upcoming appointments" + muted subtext, no large illustrations

### M-05: Secure Messaging
- **Conversation List View:**
  - Each row: Avatar (32px) + Provider name (14px semibold) + Last message preview (13px muted, truncated 1 line) + Timestamp (12px muted, right-aligned) + Unread dot (8px blue circle)
  - Row height: 64px, divider between rows
  - Encrypted indicator: Small lock icon in header bar
- **Chat View:**
  - Message bubbles: Client (blue bg, white text, right) / Provider (slate-100 bg, dark text, left)
  - Bubble padding: 10px 14px, max-width 75%, border-radius 16px (with tail)
  - Timestamp below bubble cluster (not per message), 11px muted
  - Read receipts: Double-check icon in blue
  - Input bar: Text field (flex-grow, 40px) + attachment icon (paperclip) + send button (arrow-up, blue circle 36px)
  - Attachment options on paperclip tap: Camera / Photo Library / Document — action sheet, not full modal
  - **Typing indicator:** 3-dot animation in provider bubble position

### M-06: Document Upload
- **Upload Button Area:** Dashed border box, 80px height, camera icon + "Upload Document" text, tap to show: Camera / File picker options
- **Category Selector (required):** Dropdown — Attendance Verification / UA Results / Court Documents / Housing Receipts / Certificates / Other
- **Recent Uploads (compact table):**
  - Columns: File icon + name (truncated) | Category badge | Date (12px) | Status badge (Received / Reviewing / Approved / Rejected)
  - Row height: 44px
  - Tap row → preview image/PDF inline or download
- **No pagination on mobile** — lazy load on scroll, 20 items at a time

### M-07: Housing Tracker (Recovery Housing clients only)
- **Rent Card (compact):**
  - Current balance (large number, 24px, red if overdue / green if clear) + "Balance" label
  - Last payment: date + amount (13px muted)
  - Next due: date + amount
  - "View Payment History" link
- **Meeting Attendance (current month):**
  - Calendar grid (7 columns, 5 rows) — date numbers with colored dots: green (attended), red (missed), gray (future/N/A)
  - Stats below: "Attended: 12/14 | Missed: 2"
- **UA Summary (compact list):** Last 5 results — date + result badge (Negative green / Positive red) + lab name (12px muted). "View All" link
- **House Rules Compliance:** Checklist items — rule text + status icon (check green / x red / dash gray), compact 36px rows

### M-08: Client Profile & Settings
- **Profile Section:** Avatar (64px, editable) + Name + Program badge + Provider name + Enrollment date + Client ID
- **Settings Groups (collapsible sections):**
  - Notifications: Push / SMS / Email toggles (each 44px row)
  - Privacy: Data sharing consent status, "Review Consent" link
  - Accessibility: Text size (Small / Default / Large toggle), High contrast toggle
  - Support: Help center link, Report a Problem link, App version
  - Account: Log out (red text, bottom, 44px)
- **Compact layout:** Section headers 12px uppercase muted, 4px gap between items, 16px between sections

### M-09: Provider Mobile — Field Dashboard
- **Header:** Provider name + organization, notification bell
- **Alert Banner:** "X clients need attention" — tap to expand priority list
- **Today's Overview Card:**
  - Appointments today: count + next one (time + client name)
  - Pending reviews: count
  - Unread messages: count
- **Client Quick List:** Scrollable card list — avatar (32px) + name + status badge + last activity (12px muted) + chevron. Row height 56px
- **Search Bar (sticky top on scroll):** "Search clients..." with filter icon
- **Bottom Tab Bar:** Dashboard | Clients | Schedule | Messages | More

### M-10: Provider Mobile — Client Quick View
- **Header:** Client name + status badge + back arrow
- **Compact Info Bar:** Program | Enrolled date | Compliance % — single row, 13px
- **Action Buttons Row:** Message | Add Note | Schedule — 3 equal buttons, 36px, outlined
- **Activity Feed (scrollable):** Icon + event description + timestamp, 40px rows, color-coded icons by type
- **Expandable Sections:** Check-ins (last 7) | Appointments (next 3 + last 3) | UA Results (last 5) | Notes (last 5) — each collapsed by default, tap to expand, shows compact list

---

## WEB ADMIN PORTAL SCREENS (Angular 18+ / Material 3)

### Layout Framework — Enterprise Shell

**Global Layout (all web screens):**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [≡] CareTrack™           🔍 Cmd+K Search        🔔 3  👤 Provider ▼   │  ← 48px header
├────────┬─────────────────────────────────────────────────────────────────┤
│        │                                                                 │
│  NAV   │                    MAIN CONTENT AREA                           │
│ 220px  │                                                                 │
│  or    │  ┌─────────────────────────────────────────────────────────┐   │
│  56px  │  │  Page Title              [Action Btn] [Action Btn]      │   │  ← Page header 48px
│ (rail) │  ├─────────────────────────────────────────────────────────┤   │
│        │  │                                                         │   │
│ Dark   │  │  Content Area                                           │   │
│ Slate  │  │  (scrollable, 16px padding)                             │   │
│ 900    │  │                                                         │   │
│        │  └─────────────────────────────────────────────────────────┘   │
│        │                                                                 │
└────────┴─────────────────────────────────────────────────────────────────┘
```

**Command Palette (Cmd+K / Ctrl+K):**
- Centered modal overlay, 560px width, 48px search input
- Instant search across: Clients (by name/ID), Screens/Pages, Actions (add note, create user, generate report), Recent items
- Keyboard navigable (arrow keys + enter)
- Category grouping: Clients | Navigation | Actions | Recent

**Global Header (48px):**
- Left: Sidebar toggle (hamburger) + CareTrack logo/wordmark
- Center: Command palette trigger ("Search or jump to..." with Cmd+K hint)
- Right: Notification bell (with count badge) + Organization name + User avatar dropdown (Profile, Settings, Switch Org, Logout)

### W-01: Provider Dashboard (Web)

**Page Header:** "Dashboard" title + date range selector (Today / 7D / 30D / Custom) + "View as: Compact | Comfortable" toggle

**Row 1 — KPI Strip (4 metric cards, equal width, 72px height):**
| Metric | Display |
|--------|---------|
| Active Clients | Number (28px bold) + vs. last period trend (▲+3 green or ▼-2 red) + sparkline (48px wide) |
| Today's Appointments | Number + "X completed" subtext |
| Pending Reviews | Number (amber if >5, red if >10) + "docs / check-ins / UAs" breakdown |
| Avg. Compliance Rate | Percentage (28px) + trend arrow + mini bar chart (last 7 days) |

**Row 2 — Two-column layout (60/40 split):**

**Left Column (60%) — Alerts & Tasks Panel:**
- **Section header:** "Requires Attention" + count badge + "Mark All Read" link
- **Alert list (scrollable, max-height 400px):**
  - Each alert: Severity icon (color-coded dot) + Client name (linked) + Alert text + Timestamp + Quick action button ("View" / "Dismiss" / "Add Note")
  - Row height: 48px
  - Alert types: Missed check-in, Positive UA, Missed appointment, Overdue document, Disengagement risk
  - Grouped by severity: Critical (red) → Warning (amber) → Info (blue)
- **Below alerts: Today's Appointments Table (compact)**
  - Columns: Time | Client | Type | Location | Status | Actions
  - Row height: 40px, max 8 visible + "View full schedule" link

**Right Column (40%) — Activity Feed + Quick Stats:**
- **Recent Activity Feed (live-updating):**
  - Compact timeline: Dot (color by type) + "Sarah M. completed daily check-in" + "2m ago"
  - 36px per item, 15 items visible, auto-refresh every 60s
- **Quick Stats Card:**
  - Check-ins today: X/X (progress bar)
  - Messages awaiting reply: X
  - Documents pending review: X
  - UAs received today: X

### W-02: Client List / Caseload Manager (Provider)

**Page Header:** "My Clients" + total count badge + "Add Client" button (primary) + "Import CSV" button (ghost)

**Filter Bar (sticky, 44px):**
- Search input (flex-grow): "Search by name, ID, or program..."
- Status dropdown: All / On Track / At Risk / Non-Compliant / Inactive
- Program dropdown: All / Drug Court / Probation / Parole / Recovery Housing / Treatment
- Provider dropdown: (Admin only — filter by assigned provider)
- Date filter: Enrollment date range
- "Clear Filters" link + Active filter count badge
- View toggle: Table view (default) / Card grid view

**Data Table (enterprise compact):**
| Column | Width | Content |
|--------|-------|---------|
| □ (checkbox) | 36px | Bulk select |
| Client | 200px | Avatar (28px) + Full name (linked, 13px semibold) + Client ID below (12px muted) |
| Program | 120px | Badge pill |
| Provider | 140px | Name (if admin view) |
| Enrolled | 90px | Date (13px) |
| Last Check-in | 100px | Relative time ("2h ago" / "3d ago" — red if >48hrs) |
| Compliance | 100px | Percentage + inline bar (40px wide, color-coded) |
| Status | 100px | Status badge (On Track / At Risk / Non-Compliant) |
| Last UA | 100px | Date + result mini badge (Neg green dot / Pos red dot) |
| Actions | 80px | ••• overflow menu (View Profile / Message / Add Note / Deactivate) |

**Bulk Actions Bar (appears when checkboxes selected):**
- "X selected" + "Send Message" + "Export Selected" + "Assign Provider" + "Deselect All"

**Pagination Bar:** "Showing 1-25 of 342 clients" + items per page (25/50/100) + page navigation

### W-03: Client Detail — Split-Pane Master-Detail (Provider)

**Layout: Full-width split view**
```
┌──────────────────────┬─────────────────────────────────────────────────────┐
│   CLIENT HEADER      │                                                     │
│   (72px, full-width) │                                                     │
├──────────────────────┴─────────────────────────────────────────────────────┤
│                                                                            │
│   ┌──────────────┐  ┌──────────────────────────────────────────────────┐  │
│   │  LEFT PANEL  │  │              RIGHT CONTENT PANEL                  │  │
│   │   (280px)    │  │              (flex-grow)                          │  │
│   │              │  │                                                    │  │
│   │  Nav Tabs    │  │  Tab Content                                      │  │
│   │  (vertical)  │  │  (scrollable)                                     │  │
│   │              │  │                                                    │  │
│   │  Quick       │  │                                                    │  │
│   │  Actions     │  │                                                    │  │
│   │              │  │                                                    │  │
│   └──────────────┘  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Client Header (72px, full-width):**
- Avatar (40px) + Name (16px semibold) + Client ID (12px muted) + Status badge + Program badge
- Right side: "Message" button + "Add Note" button + "Schedule" button + ••• overflow (Edit Profile / Transfer / Deactivate / Export Data)
- Compliance score: circular gauge (40px) with percentage + "On Track" label

**Left Panel (280px, fixed):**
- **Vertical Tab Navigation:**
  - Overview
  - Check-ins
  - Appointments
  - Lab Results / UAs
  - Documents
  - Messages
  - Case Notes
  - Housing (conditional — only for Recovery Housing program)
  - Compliance Timeline
  - Each: 36px height, icon + label, active: blue left border + blue text
- **Quick Info Block (below tabs, compact):**
  - Provider: Name
  - Program: Type
  - Enrolled: Date
  - Court Date: Date (if applicable)
  - Last Contact: Date
  - Risk Level: Badge

**Right Panel — Tab Contents:**

**Overview Tab:**
- **Row 1 — 4 mini KPI cards (inline):** Compliance % | Streak days | Check-in rate (this month) | Appointments attended (this month)
- **Row 2 — Engagement Chart:** Line chart (recharts) — check-in frequency over last 30/60/90 days, selectable range
- **Row 3 — Two columns:**
  - Recent Alerts (last 5): compact list with severity, description, date
  - Recent Activity (last 10): timeline feed with icons, descriptions, timestamps

**Check-ins Tab:**
- **Calendar Heatmap (top):** GitHub-style contribution grid — green intensity = check-in consistency, red = missed, gray = N/A. 90-day view default.
- **Check-in List (below):** Date | Mood (emoji chip) | Activities completed (X/X) | Substance use (Yes/No badge) | Notes (truncated, expand on click) — 40px rows, sortable by date

**Appointments Tab:**
- **Sub-tabs:** Upcoming | History | Missed
- **Table:** Date/Time | Type | Provider | Location | Status badge | Notes | Actions (reschedule/cancel)
- **Missed appointments highlighted** with red left border

**Lab Results / UA Tab:**
- **Summary Strip:** Total tests | Negative count (green) | Positive count (red) | Pending count (amber)
- **Results Table:** Date | Lab Provider (Aegis / Dominion badge) | Specimen Type | Result (large badge: NEGATIVE green / POSITIVE red / PENDING amber) | Substances Detected (comma-separated or "None") | Confirmation (Presumptive / Confirmed) | Actions (View PDF / Add Note)
- **Chart:** UA result trend over time — positive/negative ratio bar chart (monthly)
- **Alert config:** "Notify on positive result" toggle per stakeholder (probation officer, case manager, program admin)

**Documents Tab:**
- **Filter:** Category dropdown + Status dropdown + Date range
- **Grid/List toggle**
- **Table:** Preview thumb (40px) | Filename | Category badge | Uploaded date | Status badge (Received / Under Review / Approved / Rejected) | Reviewer | Actions (View / Download / Approve / Reject)

**Messages Tab:**
- Embedded chat thread (same as mobile chat but in panel format)
- Full message history, scrollable
- Attachment previews inline

**Case Notes Tab:**
- **Add Note Button** (top-right) → slide-over panel (400px) with:
  - Template selector dropdown (Progress Note / Intervention / Contact Log / Incident Report / General)
  - Subject line input
  - Rich text body (basic formatting — bold, italic, bullet list)
  - Attachments
  - Visibility toggle: "Visible to client" / "Staff only"
  - Save Draft / Submit buttons
- **Notes List:** Card-based, chronological — template badge | author | date | preview text (3 lines) | expand to full

**Housing Tab (conditional):**
- Rent ledger table: Date | Amount | Type (Payment/Charge) | Balance | Notes
- Meeting attendance calendar grid (current month)
- House rules compliance checklist with status icons
- Compact — all visible without scrolling on 1080p

**Compliance Timeline Tab:**
- Vertical timeline (left-aligned) — every compliance event:
  - Check-ins (blue dot)
  - Appointments attended (green dot) / missed (red dot)
  - UA results (green/red dot)
  - Documents uploaded (gray dot)
  - Milestones achieved (gold star)
  - Provider interventions (purple dot)
- Filter by event type (checkboxes)
- Date range selector

### W-04: Admin Dashboard

**Page Header:** "Dashboard" + Organization name + Date range selector + "Export Dashboard" button

**Row 1 — KPI Strip (5 cards):**
| Total Clients | Active Providers | Avg. Compliance | Missed Appts (7d) | Active Alerts |
|Each: Number + trend + sparkline, 72px height |

**Row 2 — Full-width Charts (tabs: 30D / 60D / 90D / 12M):**
- **Left (60%):** Engagement Trends — multi-line chart: check-in rate, appointment attendance, document submissions
- **Right (40%):** Compliance by Program — horizontal bar chart: Drug Court X% | Probation X% | Recovery Housing X% | Treatment X%

**Row 3 — Two columns (50/50):**
- **Retention Analysis:** Cohort retention chart — % of clients still active at 30/60/90/180/365 days
- **Provider Performance:** Table — Provider name | Active clients | Avg compliance | Response time | Caseload capacity — sortable, top 10

**Row 4 — System Activity Log (collapsible):**
- Recent logins, data exports, user changes, configuration changes
- Compact table, 36px rows, last 50 entries, "View Full Audit Log" link

### W-05: User Management (Admin)

**Page Header:** "User Management" + total count + "Add User" button + "Bulk Import" button

**Tab Bar:** All Users | Clients | Providers | Administrators | Inactive

**Data Table:**
| □ | Name + Email | Role Badge | Program(s) | Status | Last Login | Created | Actions |
| Row height 40px, sortable columns, search + filter bar above |

**Add User — Slide-over Panel (480px):**
- **Form Sections:**
  - Basic Info: First name, last name, email, phone
  - Role: Dropdown (Client / Provider / Administrator) — form fields change based on role
  - Program Assignment: Multi-select checkboxes
  - Provider Assignment: Dropdown (for clients only)
  - Access: Send invite email toggle, temporary password toggle, MFA requirement toggle
- **Footer:** Cancel + "Create User" buttons

**Role & Permission Matrix (sub-page):**
- Table: Permission categories (rows) x Roles (columns)
- Categories: Client Data (View/Edit), Notes (View/Create/Edit/Delete), Reports (View/Export), Users (View/Create/Edit/Deactivate), Settings (View/Edit), Audit (View), Billing (View/Edit)
- Checkboxes per cell, custom role creation button

### W-06: Program Configuration (Admin)

**Program List:** Card per program — name, type badge, active toggle, client count, provider count, "Configure" button

**Program Config Page (tabs):**
- **General:** Name, description, type, active/inactive, enrollment capacity
- **Workflow Rules:** Check-in frequency (Daily/Weekly/Custom), appointment requirements, document requirements, UA frequency
- **Compliance Rules:** Define what constitutes: On Track (e.g., >80% check-ins), At Risk (50-80%), Non-Compliant (<50%) — configurable thresholds with sliders
- **Notifications:** Template editor per event type (missed check-in, positive UA, etc.) — SMS + email + push templates with variable insertion ({client_name}, {date}, etc.)
- **Feature Toggles:** Enable/disable per program: Housing Tracker / Lab Integration / Gamification / Document Upload / Secure Messaging

### W-07: Compliance Reporting (Admin)

**Report Builder (left sidebar, 280px):**
- Report Type: Compliance Summary / Attendance / UA Results / Provider Activity / Client Engagement / Audit Log / Custom
- Date Range picker
- Programs: Multi-select
- Providers: Multi-select
- Status: Multi-select
- Group By: Program / Provider / Client / Date
- "Generate Report" button

**Report Output (right panel, flex-grow):**
- **Summary Cards Row:** Key metrics relevant to selected report type
- **Interactive Data Table:** Sortable, filterable, grouped by selected dimension
- **Chart Visualization:** Auto-generated chart matching the report type (bar, line, pie as appropriate)
- **Export Bar:** "Export as CSV" | "Export as Excel" | "Export as PDF" | "Schedule Report" (recurring)

**Scheduled Reports (sub-tab):**
- Table: Report name | Type | Frequency (Daily/Weekly/Monthly) | Recipients | Last Run | Status | Actions (Edit/Pause/Delete)

### W-08: Audit Log Viewer (Admin)

**Full-page table with robust filtering:**
- **Filter Bar:** Date range | User | Action type (multi-select: Login / Logout / View / Create / Update / Delete / Export / Config Change) | Resource type | Search
- **Table Columns:** Timestamp (precise to second) | User + Role | Action | Resource | Details (expandable JSON) | IP Address | Session ID
- **Features:**
  - Immutable indicator badge in header: "Audit logs are tamper-proof and cannot be modified"
  - Export: CSV with full details
  - Infinite scroll with virtual scrolling (no pagination — performance optimized for large datasets)
  - Row click → expand to show full event detail JSON

### W-09: Billing & Subscription (Admin/Operator)

**Current Plan Card:** Plan name + tier badge | Billing period | Next invoice date + amount | "Change Plan" + "View Invoice History" links

**Usage Metrics (4 cards):** Active Users / Max | Storage Used / Max | API Calls (if applicable) | Integrations Active

**Invoice History Table:** Invoice # | Date | Amount | Status badge (Paid/Pending/Overdue/Failed) | PDF download link

**Payment Method Card:** Card type icon + masked number + expiry | "Update" link

### W-10: Multi-Tenant Management (Operator / Super Admin)

**Organization Table:**
| Organization Name | Plan/Tier | Active Users | Programs | Status | Created | Actions |
| Row: 40px, sortable, filterable |

**Add Organization Wizard (full-page, stepper):**
- Step 1: Organization details (name, type, primary contact, billing contact)
- Step 2: Plan selection (pricing tiers)
- Step 3: Initial programs setup (multi-select with configuration)
- Step 4: Admin user creation (first admin account)
- Step 5: Branding (logo upload, primary color picker — limited palette)
- Step 6: Review + Activate
- **Stepper:** Horizontal progress bar with step labels, 48px height, clickable completed steps

**Organization Detail View:** Split view — left: org info card + plan + usage | right: tabbed content (Users, Programs, Billing, Settings, Audit Log)

---

## SHARED COMPONENTS & PATTERNS

### S-01: Login Page
- Centered card (400px width) on subtle gradient background (slate-50 to blue-50)
- CareTrack logo (compact, 40px height)
- Email input + Password input (with show/hide toggle) + "Remember me" checkbox + "Sign In" button (full-width, 40px, primary)
- "Forgot password?" link below button
- **MFA Step (conditional):** 6-digit code input (6 separate boxes, auto-advance) + "Resend code" link + "Verify" button
- **Footer:** "Protected by HIPAA & 42 CFR Part 2" + lock icon — small trust indicator, 12px muted
- **No decorative images** — clean, fast-loading, professional

### S-02: Session Timeout Modal
- Overlay + centered modal (360px)
- Warning icon (amber) + "Session Expiring" title + countdown timer (mm:ss)
- "Continue Working" button (primary) + "Log Out" button (ghost)
- Appears at 5 minutes before timeout, auto-logout on expiration

### S-03: Notification Center (Dropdown Panel)
- Triggered by bell icon in header
- Panel: 380px width, max-height 480px, right-aligned dropdown
- **Tabs:** All | Alerts | Messages | System
- **Notification Items:** Type icon (color-coded) + title (13px semibold) + description (12px muted, 2 lines max) + timestamp (12px muted) + unread dot
- Item height: 68px
- **Footer:** "Mark All Read" + "View All Notifications" link
- Click notification → navigate to relevant resource

### S-04: Slide-Over Panel (reusable pattern)
- Right-aligned panel, 400px or 480px width, full viewport height
- Semi-transparent overlay behind
- Header: Title + close (X) button, 48px
- Scrollable content area with 16px padding
- Footer: Action buttons (Cancel + Primary action), 56px, sticky bottom
- Used for: Add Note, Add User, Edit Profile, Filter Panel, Quick View

### S-05: Empty States (compact)
- Icon (40px, muted) + Title (14px semibold) + Description (13px muted, 1-2 lines) + Action button
- Total height: ~120px — no large illustrations, no wasted space
- Every empty state has a primary action: "Add first client", "Create a report", "Upload a document"

### S-06: Confirmation Dialogs
- Centered modal, 400px max-width
- Icon (warning/danger/info) + Title + Description (1-2 sentences)
- Two buttons: Cancel (secondary) + Confirm (primary or danger)
- Used for: Delete actions, status changes, bulk operations, deactivation

### S-07: Toast Notifications
- Bottom-right, 360px width, auto-dismiss (5 seconds for info, persistent for errors)
- Types: Success (green left border) / Error (red) / Warning (amber) / Info (blue)
- Content: Icon + message (13px) + dismiss X button + optional action link ("Undo", "View")
- Stack: max 3 visible, newest on top

### S-08: Data Export Progress
- Triggered by any "Export" action
- Toast notification: "Preparing export..." with progress bar
- On complete: "Export ready" with "Download" action link
- Large exports (>10K rows): "We'll email you when it's ready" with email notification

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Layout Changes |
|-----------|-------|---------------|
| Mobile | 375–428px | Single column, bottom tab nav, full-width cards, 48px touch targets |
| Mobile Large | 429–767px | Single column, wider cards, same nav pattern |
| Tablet | 768–1023px | Sidebar collapsed to rail (56px), 2-column card grids, compact tables |
| Desktop | 1024–1439px | Sidebar expanded (220px), full table layouts, split-pane views |
| Desktop XL | 1440px+ | Max content width 1400px centered, more columns in dashboards |

---

## ACCESSIBILITY (NON-NEGOTIABLE)

- WCAG 2.1 Level AA full compliance
- Section 508 compliance
- Contrast: 4.5:1 body text, 3:1 large text — verified against enterprise dark sidebar + light content
- Focus: 2px blue ring on all interactive elements, visible in both light and dark contexts
- Keyboard: Full navigation via Tab/Shift+Tab/Enter/Escape/Arrow keys
- Screen reader: Semantic HTML, ARIA labels, live regions for dynamic content, proper heading hierarchy (h1→h2→h3)
- Touch targets: 44px minimum (web), 48px minimum (mobile client screens)
- Color independence: All status indicators use color + icon + text label
- Motion: `prefers-reduced-motion` respected — no non-essential animations
- Text scaling: Supports up to 200% browser zoom without layout breakage
- Language: Plain English (6th-8th grade) on client screens, professional on provider/admin screens

---

## INTERACTION PATTERNS — PRODUCTION GRADE

### Keyboard Shortcuts (Web Admin)
- `Cmd/Ctrl + K` → Command palette
- `Cmd/Ctrl + N` → Add note (in client context)
- `Cmd/Ctrl + /` → Toggle sidebar
- `Esc` → Close panel/modal/dropdown
- `J/K` → Navigate table rows (when table focused)
- `Enter` → Open selected row

### Real-Time Updates
- WebSocket for: New messages, alert triggers, UA result arrivals, check-in submissions
- Visual indicator: Subtle blue pulse on updated data, auto-refresh badge counts
- Stale data warning: "Data last updated X min ago" + "Refresh" link if connection lost

### Offline Mode (Mobile Only)
- Offline indicator: Top banner "You're offline — data will sync when connected"
- Available offline: View cached data, compose messages (queued), complete check-ins (queued)
- Sync indicator: When back online, "Syncing X items..." progress, then success toast

### Error Recovery
- Network error: Inline retry button + "Check your connection" message
- Server error (500): "Something went wrong" + "Try Again" + "Report Issue" link
- Form validation: Inline field-level errors on blur + summary at top if >3 errors
- Optimistic UI: Immediate visual feedback on actions, rollback with error toast if server rejects

---

## DESIGN DELIVERABLES

1. **Screen Set:** All 28+ screens above at high fidelity — desktop (1440px) and mobile (375px)
2. **Component Library:** Every component specced above with all states (default, hover, active, focused, disabled, loading, error, empty)
3. **Interactive Prototype Flows:**
   - Client: Onboarding → Home → Daily Check-in → Submit → Updated Dashboard
   - Provider: Dashboard → Alert Click → Client Detail → Add Note → Save
   - Provider: Client List → Search → Client Detail → UA Results Tab → View PDF
   - Admin: Dashboard → Reports → Generate → Export
   - Login → MFA → Role-based Dashboard Redirect
4. **Design Tokens File:** JSON export of all colors, typography, spacing, shadows, radii for developer handoff
5. **Responsive Variants:** Mobile (375), Tablet (768), Desktop (1440) for all key screens
6. **Dark Mode Variant (Sidebar only):** Dark sidebar is default; content area is always light. No full dark mode.

---

## ANTI-PATTERNS — DO NOT USE

- ❌ Decorative whitespace that doesn't serve hierarchy
- ❌ Full-page modals (use slide-overs or inline expansion)
- ❌ Large hero illustrations on dashboards or work screens
- ❌ Generic purple/pink AI gradients
- ❌ Rounded "pill" buttons on enterprise forms (use 8px radius)
- ❌ Emoji as functional icons
- ❌ Placeholder-only form labels
- ❌ More than 1 primary CTA per visible area
- ❌ Dark mode for content areas (dark sidebar only)
- ❌ Skeleton loaders that don't match content shape
- ❌ Pagination under 100 items — show all or use virtual scroll
- ❌ Fixed-width layouts that don't use available screen space
- ❌ Red as a primary brand color in healthcare context
- ❌ Tooltip-only labels on critical information
- ❌ Auto-hiding sidebar on desktop (let user control it)
- ❌ Hamburger menu on desktop (sidebar always present)
- ❌ More than 3 font weights on any single screen
- ❌ Card shadows heavier than `0 1px 3px rgba(0,0,0,0.08)`
