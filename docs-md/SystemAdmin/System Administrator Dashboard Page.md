# BPDS CareTrack™ — System Administrator Dashboard Page

**Page:** Dashboard (Landing Page after Login)
**Role:** System Administrator (Super Admin)
**Route:** `/admin/dashboard`
**Platform:** Web Admin Panel (Angular 18+)
**Refresh:** Real-time WebSocket + 60-second polling fallback

---

## Page Purpose

The System Admin Dashboard is the command center for the entire CareTrack platform. It provides instant visibility into platform health, tenant activity, user metrics, security posture, and operational alerts — all in a single glance. The goal is **zero clicks to critical information**.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                         │
│  [Logo] BPDS CareTrack™    [Search]    [Notifications] [Profile]   │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│  SIDEBAR │  WELCOME BANNER                                          │
│          │  ─────────────────────────────────────────────────────── │
│  (See    │                                                          │
│  Sidebar │  ROW 1: STAT CARDS (6 cards)                             │
│  Menu    │  ─────────────────────────────────────────────────────── │
│  Doc)    │                                                          │
│          │  ROW 2: CHARTS (2 columns)                               │
│          │  [Tenant Growth Chart]     [User Activity Chart]         │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  ROW 3: TABLES (2 columns)                               │
│          │  [Recent Alerts]           [Active Sessions]             │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  ROW 4: TABLES (2 columns)                               │
│          │  [Recent Tenants]          [System Health]               │
│          │  ─────────────────────────────────────────────────────── │
│          │                                                          │
│          │  ROW 5: QUICK ACTIONS                                    │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

---

## Section 1: Welcome Banner

**Position:** Top of content area, full width
**Height:** 80px
**Background:** Gradient using brand primary (#1B3A5C → #2A5F8F)

| Element              | Detail                                              |
|----------------------|-----------------------------------------------------|
| Greeting             | "Good [morning/afternoon/evening], [FirstName]"     |
| Date & Time          | "Wednesday, April 22, 2026 · 2:34 PM EST"           |
| Last Login           | "Last login: Apr 21, 2026 at 9:12 AM from 192.168.x.x" |
| System Status Badge  | Green dot + "All Systems Operational" OR Red dot + "Issues Detected" |

**Logic:**
- Greeting based on server time in user's configured timezone
- Last login pulled from `ApplicationUser.LastLoginAtUtc` and `LastLoginIp`
- System status derived from health check endpoint

---

## Section 2: Stat Cards (KPI Row)

**Position:** Below welcome banner
**Layout:** 6 cards in a single responsive row (3 cols on tablet, 2 cols on small screens)
**Card Height:** 120px
**Card Style:** White background, subtle shadow, left-colored accent border (4px)

### Card 1: Total Tenants
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `building-2` (Lucide)                     |
| Accent Color   | `#2563EB` (Blue)                          |
| Primary Value  | Total active tenants (e.g., "24")         |
| Label          | "Active Tenants"                          |
| Trend          | ▲ +3 this month (green) OR ▼ -1 (red)    |
| Click Action   | Navigate to `/admin/tenants`              |

**Data Source:** `SELECT COUNT(*) FROM tenant.tenants WHERE status = 'Active'`

### Card 2: Total Users
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `users` (Lucide)                          |
| Accent Color   | `#7C3AED` (Purple)                        |
| Primary Value  | Total active users across all tenants     |
| Label          | "Active Users"                            |
| Trend          | ▲ +18 this month                          |
| Click Action   | Navigate to `/admin/users`                |

**Data Source:** `SELECT COUNT(*) FROM identity.application_users WHERE status = 'Active'`

### Card 3: Total Clients
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `user-round` (Lucide)                     |
| Accent Color   | `#059669` (Green)                         |
| Primary Value  | Total enrolled clients platform-wide      |
| Label          | "Enrolled Clients"                        |
| Trend          | ▲ +42 this month                          |
| Click Action   | Navigate to `/admin/reports/clients`      |

**Data Source:** `SELECT COUNT(*) FROM usermgmt.user_role_assignments WHERE role_id = [ClientRoleId] AND is_active = true`

### Card 4: Active Sessions
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `monitor-smartphone` (Lucide)             |
| Accent Color   | `#D97706` (Amber)                         |
| Primary Value  | Currently active (non-expired, non-revoked) sessions |
| Label          | "Active Sessions"                         |
| Sub Value      | "12 web · 8 mobile"                       |
| Click Action   | Navigate to `/admin/security/sessions`    |

**Data Source:** `SELECT COUNT(*) FROM identity.user_sessions WHERE revoked_at_utc IS NULL AND expires_at_utc > NOW()`

### Card 5: Security Alerts
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `shield-alert` (Lucide)                   |
| Accent Color   | `#DC2626` (Red) if alerts > 0, else `#059669` (Green) |
| Primary Value  | Unresolved security alerts (last 24h)     |
| Label          | "Security Alerts"                         |
| Sub Value      | "3 failed logins · 1 suspicious IP"       |
| Click Action   | Navigate to `/admin/security/login-attempts` |

**Data Source:** `SELECT COUNT(*) FROM identity.authentication_events WHERE event_type IN ('LoginFailed','AccountLocked') AND created_at_utc > NOW() - INTERVAL '24 hours'`

### Card 6: System Uptime
| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Icon           | `activity` (Lucide)                       |
| Accent Color   | `#059669` (Green) if >= 99.9%, else `#DC2626` (Red) |
| Primary Value  | Current uptime percentage (e.g., "99.97%")|
| Label          | "Uptime (30 Days)"                        |
| Sub Value      | "Last incident: 14 days ago"              |
| Click Action   | Navigate to `/admin/support/system-status` |

**Data Source:** Health monitoring service / external uptime monitor API

---

## Section 3: Charts Row

**Position:** Below stat cards
**Layout:** 2 equal columns (stacked on mobile)
**Chart Library:** Recharts or Chart.js
**Height:** 320px per chart

### Chart 1: Tenant Growth (Left Column)

| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Chart Type     | Area chart with gradient fill             |
| Title          | "Tenant Growth"                           |
| X-Axis         | Last 12 months (labels: "May", "Jun"...)  |
| Y-Axis         | Tenant count                              |
| Line Color     | `#2563EB`                                 |
| Fill Color     | `#2563EB` at 10% opacity                  |
| Tooltip        | "Jun 2026: 22 tenants (+2)"              |
| Filter         | Dropdown: "Last 6 Months" / "Last 12 Months" / "All Time" |

**Data Source:** Monthly aggregation of `tenant.tenants.created_at_utc`

### Chart 2: User Activity (Right Column)

| Element        | Detail                                    |
|----------------|-------------------------------------------|
| Chart Type     | Bar chart (grouped)                       |
| Title          | "User Activity (Last 7 Days)"             |
| X-Axis         | Days of the week                          |
| Y-Axis         | Event count                               |
| Bar Groups     | Logins (blue), Check-Ins (green), Messages (purple) |
| Tooltip        | "Monday: 142 logins, 89 check-ins, 34 messages" |
| Filter         | Dropdown: "Last 7 Days" / "Last 30 Days" |

**Data Source:** Aggregation from `identity.authentication_events` + check-in service + messaging service

---

## Section 4: Data Tables Row 1

**Position:** Below charts
**Layout:** 2 equal columns (stacked on mobile)
**Table Height:** 360px with scroll
**Rows Shown:** 8 per table with "View All" link

### Table 1: Recent Alerts (Left Column)

| Column         | Width  | Detail                                   |
|----------------|--------|------------------------------------------|
| Severity Icon  | 40px   | Red (critical), Amber (warning), Blue (info) |
| Alert Message  | auto   | "Failed login attempt (5x) — user@email.com" |
| Tenant         | 150px  | Tenant name                              |
| Timestamp      | 140px  | Relative: "3 min ago", "1 hour ago"      |
| Action         | 80px   | "View" button                            |

**Alert Types:**
- Failed login threshold exceeded
- Account locked
- Suspicious IP detected
- MFA bypass attempt
- Session anomaly (new device + new location)
- Tenant subscription expiring
- System health degradation

**Data Source:** Aggregated from `identity.authentication_events` + system monitoring

### Table 2: Active Sessions (Right Column)

| Column         | Width  | Detail                                   |
|----------------|--------|------------------------------------------|
| User           | auto   | Full name + email                        |
| Tenant         | 150px  | Tenant name                              |
| Role           | 120px  | Badge: "Admin", "Provider", etc.         |
| Device         | 120px  | "Chrome · Windows" or "iOS App"          |
| IP Address     | 120px  | Masked last octet: "192.168.1.***"       |
| Duration       | 100px  | "12m", "1h 34m"                          |
| Action         | 80px   | "Revoke" button (red)                    |

**Data Source:** `identity.user_sessions` joined with `usermgmt.user_profiles`

---

## Section 5: Data Tables Row 2

**Position:** Below alerts and sessions
**Layout:** 2 equal columns (stacked on mobile)

### Table 3: Recent Tenants (Left Column)

| Column         | Width  | Detail                                   |
|----------------|--------|------------------------------------------|
| Tenant Name    | auto   | Organization name (clickable)            |
| Status         | 100px  | Badge: Active (green), Trial (blue), Suspended (red) |
| Subscription   | 120px  | "Professional", "Government"             |
| Users          | 80px   | Active user count                        |
| Clients        | 80px   | Enrolled client count                    |
| Created        | 120px  | "Jan 15, 2026"                           |

**Sort:** Most recently created first
**Data Source:** `tenant.tenants` with aggregated user/client counts

### Table 4: System Health (Right Column)

| Column         | Width  | Detail                                   |
|----------------|--------|------------------------------------------|
| Service        | auto   | Service name                             |
| Status         | 100px  | Green dot "Healthy" / Red dot "Down" / Amber "Degraded" |
| Response Time  | 100px  | "12ms", "45ms"                           |
| Uptime         | 100px  | "99.99%"                                 |
| Last Check     | 120px  | "30s ago"                                |

**Services Monitored:**
- Identity Service
- Tenant Service
- User Management Service
- Notification Service
- Messaging Service
- Reporting Service
- Database (Primary)
- Database (Replica)
- Redis Cache
- API Gateway

**Data Source:** Health check endpoint (`/health`) per microservice

---

## Section 6: Quick Actions Bar

**Position:** Bottom of dashboard (sticky on scroll optional)
**Layout:** Horizontal row of action buttons
**Style:** Outlined buttons with icons, hover fills with accent color

| Action               | Icon            | Route                          |
|----------------------|-----------------|--------------------------------|
| Add Tenant           | `plus-circle`   | `/admin/tenants/new`           |
| Invite User          | `user-plus`     | `/admin/users/invitations/new` |
| View Audit Logs      | `scroll-text`   | `/admin/audit-logs`            |
| Generate Report      | `file-bar-chart` | `/admin/reports`              |
| System Settings      | `settings`      | `/admin/settings`              |

---

## API Endpoints Required

| Endpoint                                | Method | Response                          |
|-----------------------------------------|--------|-----------------------------------|
| `/api/v1/admin/dashboard/stats`         | GET    | All 6 KPI card values + trends    |
| `/api/v1/admin/dashboard/tenant-growth` | GET    | Monthly tenant count series       |
| `/api/v1/admin/dashboard/user-activity` | GET    | Daily activity by type            |
| `/api/v1/admin/dashboard/alerts`        | GET    | Paginated recent alerts           |
| `/api/v1/admin/dashboard/sessions`      | GET    | Active sessions list              |
| `/api/v1/admin/dashboard/tenants`       | GET    | Recent tenants with stats         |
| `/api/v1/admin/dashboard/health`        | GET    | All service health statuses       |
| `/api/v1/admin/sessions/{id}/revoke`    | POST   | Revoke a specific session         |

**Authentication:** Bearer JWT with `SystemAdministrator` role claim
**Rate Limiting:** 60 requests/minute per user
**Caching:** Stats endpoint cached 60s, health endpoint cached 30s

---

## Real-Time Updates

| Feature                | Method                                   |
|------------------------|------------------------------------------|
| Active Session Count   | WebSocket push on session create/destroy |
| Security Alerts        | WebSocket push on new alert event        |
| System Health          | WebSocket push on status change          |
| KPI Cards              | Polling every 60 seconds                 |
| Charts                 | Polling every 5 minutes                  |
| Tables                 | Polling every 30 seconds                 |

**WebSocket Endpoint:** `wss://api.caretrack.app/ws/admin/dashboard`
**Fallback:** HTTP polling at intervals above if WebSocket unavailable

---

## Loading States

| State          | Behavior                                              |
|----------------|-------------------------------------------------------|
| Initial Load   | Skeleton loaders for all cards, charts, tables         |
| Data Refresh   | Subtle pulse animation on updated values               |
| Error State    | Card shows "Unable to load" with retry button          |
| Empty State    | Table shows "No data available" with illustration      |
| Partial Load   | Cards load independently — don't block each other      |

---

## Responsive Breakpoints

| Breakpoint     | Layout Changes                                        |
|----------------|-------------------------------------------------------|
| ≥ 1440px       | 6 stat cards in row, 2-col charts, 2-col tables       |
| 1024–1439px    | 3 stat cards per row (2 rows), 2-col charts/tables    |
| 768–1023px     | 2 stat cards per row (3 rows), stacked charts/tables   |
| < 768px        | 1 stat card per row, everything stacked, sidebar hidden |

---

## Permission Requirements

| Action                    | Permission Required         |
|---------------------------|-----------------------------|
| View Dashboard            | `tenants.view`              |
| View All Tenants          | `tenants.view`              |
| View All Users            | `users.view`                |
| View Security Alerts      | `audit.view`                |
| View Active Sessions      | `audit.view`                |
| Revoke Session            | `users.deactivate`          |
| View System Health        | `tenants.view`              |
| Access Quick Actions      | Per-action permission check |

---

## Color Palette Reference

| Usage              | Color     | Hex       |
|--------------------|-----------|-----------|
| Primary Brand      | Navy      | `#1B3A5C` |
| Primary Accent     | Blue      | `#2563EB` |
| Success / Healthy  | Green     | `#059669` |
| Warning            | Amber     | `#D97706` |
| Error / Critical   | Red       | `#DC2626` |
| Purple Accent      | Purple    | `#7C3AED` |
| Card Background    | White     | `#FFFFFF` |
| Page Background    | Light Gray| `#F8FAFC` |
| Text Primary       | Dark      | `#1E293B` |
| Text Secondary     | Gray      | `#64748B` |
| Border             | Light     | `#E2E8F0` |

---

## Accessibility Requirements

| Requirement              | Standard                                  |
|--------------------------|-------------------------------------------|
| Color Contrast           | WCAG 2.1 AA minimum (4.5:1 text)          |
| Keyboard Navigation      | Full tab order through all interactive elements |
| Screen Reader            | ARIA labels on all cards, charts, tables    |
| Chart Accessibility      | Data table alternative for all charts       |
| Focus Indicators         | Visible focus ring on all interactive items  |
| Motion                   | Respect `prefers-reduced-motion`            |
| Font Scaling             | Support up to 200% browser zoom             |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned | WCAG 2.1 AA Accessible*
