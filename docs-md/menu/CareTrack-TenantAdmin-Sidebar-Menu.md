# BPDS CareTrack™ — Tenant Administrator Sidebar Menu

**Role:** Tenant Administrator (Organization Admin)
**Access Level:** Organization-scoped — manages users, programs, and configuration within their tenant
**Platform:** Web Admin Panel (Angular 18+)

---

## 1. OVERVIEW

### Dashboard
- Organization Overview
- Active Users & Clients
- Program Performance Summary
- Compliance Snapshot
- Upcoming Appointments
- Recent Alerts & Flags

---

## 2. PROGRAMS

### Program Management
- All Programs
- Add New Program
- Program Configuration
- Compliance Rules Setup

### Housing
- Recovery Houses
- Resident Assignments
- Rent & Payments
- Meeting Attendance
- UA Tracking (Housing)

### Drug Court
- Court Compliance Tracker
- Hearing Schedule
- Condition Monitoring
- Cross-Agency Status

---

## 3. PEOPLE

### Clients
- All Clients
- Enroll New Client
- Client Profiles
- Program Assignments
- Discharge Management

### Staff
- All Staff
- Add New Staff
- Staff Profiles
- Caseload Assignments

### Roles & Permissions
- Role Management
- Permission Assignments

### Invitations
- Invite User
- Pending Invitations
- Invitation History

---

## 4. CASE MANAGEMENT

### Caseloads
- Caseload Overview
- Provider-Client Mapping
- Reassign Caseloads

### Check-Ins
- Check-In Dashboard
- Missed Check-Ins
- Check-In History

### Appointments
- Appointment Calendar
- Missed Appointments
- Appointment History

### Compliance
- Compliance Dashboard
- Milestones & Streaks
- Violations & Escalations
- Risk Indicators

---

## 5. DOCUMENTS & COMMUNICATION

### Documents
- All Documents
- UA Results
- Attendance Verification
- Uploaded Files

### Messaging
- Message Center
- Broadcast Messages

### Notifications
- Notification Templates
- Reminder Configuration
- Delivery Logs

---

## 6. REPORTING

### Reports
- Program Reports
- Client Engagement Reports
- Compliance Reports
- State / DHHS Reports
- Custom Reports

### Analytics
- Engagement Metrics
- Retention Analytics
- KPI Dashboard

### Export
- Export Center
- Scheduled Exports

---

## 7. SECURITY & COMPLIANCE

### Security
- Password Policies
- MFA Settings
- Active Sessions

### Audit Logs
- User Activity
- Data Access Logs

### Consent Management
- Consent Records
- 42 CFR Part 2 Authorizations
- Expired / Revoked Consents

---

## 8. SETTINGS

### Organization Settings
- Organization Profile
- Branding & Logo
- Time Zone & Locale

### System Configuration
- Feature Toggles
- Workflow Configuration
- Notification Defaults

### Billing
- Current Plan
- Invoice History
- Payment Methods

### Support
- Help Desk
- Knowledge Base

---

## Menu Summary

| Group                       | Parent Items | Sub Items | Total Pages |
|-----------------------------|:------------:|:---------:|:-----------:|
| Overview                    | 1            | 6         | 7           |
| Programs                    | 3            | 13        | 16          |
| People                      | 4            | 15        | 19          |
| Case Management             | 4            | 13        | 17          |
| Documents & Communication   | 3            | 8         | 11          |
| Reporting                   | 3            | 10        | 13          |
| Security & Compliance       | 3            | 8         | 11          |
| Settings                    | 4            | 10        | 14          |
| **Total**                   | **25**       | **83**    | **108**     |

---

## Icon Suggestions (Lucide / Material Icons)

| Menu Item              | Icon                  |
|------------------------|-----------------------|
| Dashboard              | `layout-dashboard`    |
| Program Management     | `folder-kanban`       |
| Housing                | `home`                |
| Drug Court             | `gavel`               |
| Clients                | `user-round`          |
| Staff                  | `user-cog`            |
| Roles & Permissions    | `shield-check`        |
| Invitations            | `mail-plus`           |
| Caseloads              | `briefcase`           |
| Check-Ins              | `clipboard-check`     |
| Appointments           | `calendar-clock`      |
| Compliance             | `check-circle-2`      |
| Documents              | `file-text`           |
| Messaging              | `message-square`      |
| Notifications          | `bell`                |
| Reports                | `bar-chart-3`         |
| Analytics              | `trending-up`         |
| Export                  | `download`            |
| Security               | `lock-keyhole`        |
| Audit Logs             | `scroll-text`         |
| Consent Management     | `file-signature`      |
| Organization Settings  | `building-2`          |
| System Configuration   | `settings`            |
| Billing                | `credit-card`         |
| Support                | `life-buoy`           |

---

## Key Differences from System Administrator

| Aspect                  | System Administrator           | Tenant Administrator              |
|-------------------------|-------------------------------|-----------------------------------|
| Scope                   | All tenants (platform-wide)   | Single tenant (organization)      |
| Tenant CRUD             | Create / manage all tenants   | View / edit own organization only |
| User Management         | Cross-tenant user access      | Own tenant users only             |
| Programs                | View all programs             | Full CRUD within own tenant       |
| Case Management         | No direct access              | Full oversight of caseloads       |
| Housing / Drug Court    | No direct access              | Full module access                |
| Billing                 | Manage all subscriptions      | View own plan & invoices          |
| Feature Flags           | Enable / disable per tenant   | View enabled features only        |
| API Keys / Integrations | Full control                  | No access                         |
| System Health           | Infrastructure monitoring     | Organization-level stats only     |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned*
