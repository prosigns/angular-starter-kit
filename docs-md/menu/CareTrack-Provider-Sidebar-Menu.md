# BPDS CareTrack™ — Provider Sidebar Menu

**Role:** Provider (Treatment Provider / Prescriber)
**Access Level:** Caseload-scoped — manages assigned clients, monitors compliance, documents interventions
**Platform:** Web Admin Panel (Angular 18+) + Mobile App (Flutter)

---

## 1. OVERVIEW

### Dashboard
- My Caseload Summary
- Today's Appointments
- Pending Check-In Reviews
- Compliance Alerts
- Missed Appointments (Last 7 Days)
- At-Risk Clients
- Unread Messages

---

## 2. MY CASELOAD

### Clients
- All My Clients
- Client Profiles
- Client Timeline
- Program Status

### Enrollments
- New Client Intake
- Program Assignments
- Discharge Requests

### Caseload Tools
- Caseload Overview
- Client Prioritization
- Transfer Requests

---

## 3. CLINICAL

### Appointments
- My Calendar
- Schedule Appointment
- Appointment History
- No-Shows & Cancellations

### Check-Ins
- Pending Reviews
- Approved Check-Ins
- Flagged Check-Ins
- Check-In History

### Treatment Plans
- Active Plans
- Plan Templates
- Progress Notes

### UA / Drug Testing
- Recent Results
- Pending Results
- Positive / Negative History
- Order New Test (Phase 2)

---

## 4. COMPLIANCE & ACCOUNTABILITY

### Compliance
- Compliance Dashboard
- Milestones & Streaks
- Violations
- Risk Indicators
- Escalation Queue

### Housing Monitoring
- Resident Status
- Meeting Attendance
- Rent Status
- Housing UA Results

### Court / Probation
- Court Compliance Status
- Upcoming Hearings
- Condition Monitoring
- Status Reports

---

## 5. DOCUMENTS

### Documents
- Client Documents
- Upload Document
- UA Results
- Attendance Verification
- Court Orders / Conditions

### Case Notes
- Add Case Note
- Case Note History
- Intervention Log

---

## 6. COMMUNICATION

### Messaging
- Inbox
- Send Message
- Client Conversations

### Notifications
- My Alerts
- Alert Preferences

---

## 7. REPORTING

### Reports
- Client Progress Reports
- Caseload Reports
- Compliance Reports
- Court Status Reports

### Export
- Export Client Data
- Print Reports

---

## 8. MY ACCOUNT

### Profile
- My Profile
- Change Password
- MFA Settings
- Notification Preferences

---

## Menu Summary

| Group                       | Parent Items | Sub Items | Total Pages |
|-----------------------------|:------------:|:---------:|:-----------:|
| Overview                    | 1            | 7         | 8           |
| My Caseload                 | 3            | 10        | 13          |
| Clinical                    | 4            | 16        | 20          |
| Compliance & Accountability | 3            | 13        | 16          |
| Documents                   | 2            | 8         | 10          |
| Communication               | 2            | 5         | 7           |
| Reporting                   | 2            | 6         | 8           |
| My Account                  | 1            | 4         | 5           |
| **Total**                   | **18**       | **69**    | **87**      |

---

## Icon Suggestions (Lucide / Material Icons)

| Menu Item                | Icon                  |
|--------------------------|-----------------------|
| Dashboard                | `layout-dashboard`    |
| Clients                  | `user-round`          |
| Enrollments              | `user-plus`           |
| Caseload Tools           | `briefcase`           |
| Appointments             | `calendar-clock`      |
| Check-Ins                | `clipboard-check`     |
| Treatment Plans          | `file-heart`          |
| UA / Drug Testing        | `test-tubes`          |
| Compliance               | `check-circle-2`      |
| Housing Monitoring       | `home`                |
| Court / Probation        | `gavel`               |
| Documents                | `file-text`           |
| Case Notes               | `notebook-pen`        |
| Messaging                | `message-square`      |
| Notifications            | `bell`                |
| Reports                  | `bar-chart-3`         |
| Export                   | `download`            |
| Profile                  | `circle-user`         |

---

## Key Differences from Tenant Administrator

| Aspect                    | Tenant Administrator              | Provider                            |
|---------------------------|-----------------------------------|-------------------------------------|
| Scope                     | All users & clients in tenant     | Own assigned caseload only          |
| User Management           | Full CRUD, invite users           | No access                           |
| Role & Permission Mgmt    | Full control                      | No access                           |
| Program Configuration     | Create / edit programs            | View assigned programs only         |
| Client Management         | All clients, enroll / discharge   | Own clients, request discharge      |
| Clinical Tools            | Overview only                     | Full access (plans, notes, UAs)     |
| Caseload Assignment       | Assign / reassign caseloads       | View own, request transfers         |
| Housing / Court Modules   | Full admin access                 | Monitor assigned clients only       |
| Billing                   | View plan & invoices              | No access                           |
| Settings                  | Organization-wide config          | Personal preferences only           |
| Audit Logs                | Full tenant audit trail           | No access                           |
| Reports                   | All program & State reports       | Caseload-scoped reports only        |
| Consent Management        | Full CRUD                         | View consents for own clients       |

---

## Mobile App (Flutter) — Provider View

The Provider role is the primary mobile user alongside Clients. The Flutter mobile app surfaces a simplified version of this menu:

| Mobile Screen             | Maps To                          |
|---------------------------|----------------------------------|
| Home                      | Dashboard                        |
| My Clients                | Clients → All My Clients         |
| Today                     | Appointments → My Calendar       |
| Check-Ins                 | Check-Ins → Pending Reviews      |
| Alerts                    | Compliance → Escalation Queue    |
| Messages                  | Messaging → Inbox                |
| Quick Note                | Case Notes → Add Case Note       |
| Profile                   | My Account → My Profile          |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned*
