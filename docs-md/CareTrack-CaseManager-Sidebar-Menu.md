# BPDS CareTrack™ — Case Manager Sidebar Menu

**Role:** Case Manager (Probation, Parole, Recovery Housing Coordinator)
**Access Level:** Caseload-scoped — manages assigned clients, tracks accountability, coordinates with providers
**Platform:** Web Admin Panel (Angular 18+) + Mobile App (Flutter)

---

## 1. OVERVIEW

### Dashboard
- My Caseload Summary
- Today's Tasks
- Pending Check-In Reviews
- Missed Appointments (Last 7 Days)
- Compliance Alerts
- Overdue Documents
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

## 3. ACCOUNTABILITY

### Check-Ins
- Pending Reviews
- Approved Check-Ins
- Flagged Check-Ins
- Check-In History

### Appointments
- My Calendar
- Schedule Appointment
- Appointment History
- No-Shows & Cancellations

### Compliance
- Compliance Dashboard
- Milestones & Streaks
- Violations
- Risk Indicators
- Escalation Queue

### UA / Drug Testing
- Recent Results
- Pending Results
- Positive / Negative History

---

## 4. PROGRAMS

### Housing
- Resident Status
- Meeting Attendance
- Rent & Payments
- Housing UA Results
- Housing Rules Compliance

### Court / Probation
- Court Compliance Status
- Upcoming Hearings
- Condition Monitoring
- Status Reports
- Probation / Parole Notes

---

## 5. DOCUMENTS

### Documents
- Client Documents
- Upload Document
- UA Results
- Attendance Verification
- Court Orders / Conditions
- Housing Agreements

### Case Notes
- Add Case Note
- Case Note History
- Intervention Log
- Referral Notes

---

## 6. COMMUNICATION

### Messaging
- Inbox
- Send Message
- Client Conversations
- Provider Conversations

### Notifications
- My Alerts
- Alert Preferences

---

## 7. REPORTING

### Reports
- Client Progress Reports
- Caseload Reports
- Compliance Reports
- Housing Reports
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

| Group                | Parent Items | Sub Items | Total Pages |
|----------------------|:------------:|:---------:|:-----------:|
| Overview             | 1            | 7         | 8           |
| My Caseload          | 3            | 10        | 13          |
| Accountability       | 4            | 16        | 20          |
| Programs             | 2            | 10        | 12          |
| Documents            | 2            | 10        | 12          |
| Communication        | 2            | 6         | 8           |
| Reporting            | 2            | 7         | 9           |
| My Account           | 1            | 4         | 5           |
| **Total**            | **17**       | **70**    | **87**      |

---

## Icon Suggestions (Lucide / Material Icons)

| Menu Item            | Icon                  |
|----------------------|-----------------------|
| Dashboard            | `layout-dashboard`    |
| Clients              | `user-round`          |
| Enrollments          | `user-plus`           |
| Caseload Tools       | `briefcase`           |
| Check-Ins            | `clipboard-check`     |
| Appointments         | `calendar-clock`      |
| Compliance           | `check-circle-2`      |
| UA / Drug Testing    | `test-tubes`          |
| Housing              | `home`                |
| Court / Probation    | `gavel`               |
| Documents            | `file-text`           |
| Case Notes           | `notebook-pen`        |
| Messaging            | `message-square`      |
| Notifications        | `bell`                |
| Reports              | `bar-chart-3`         |
| Export               | `download`            |
| Profile              | `circle-user`         |

---

## Key Differences from Provider

| Aspect                  | Provider                          | Case Manager                         |
|-------------------------|-----------------------------------|--------------------------------------|
| Clinical Focus          | Treatment plans, prescribing      | Accountability, coordination         |
| Treatment Plans         | Full CRUD                         | View only                            |
| UA / Drug Testing       | Order new tests (Phase 2)         | View results only                    |
| Housing Module          | Monitor assigned clients          | Full housing management              |
| Court / Probation       | View court status                 | Full court compliance management     |
| Case Notes              | Clinical notes                    | Case management & referral notes     |
| Provider Communication  | N/A                               | Direct messaging with providers      |
| Housing Agreements      | No access                         | Upload & manage                      |
| Rent & Payments         | No access                         | Track & manage                       |

---

## Mobile App (Flutter) — Case Manager View

| Mobile Screen          | Maps To                           |
|------------------------|-----------------------------------|
| Home                   | Dashboard                         |
| My Clients             | Clients → All My Clients          |
| Today                  | Appointments → My Calendar        |
| Check-Ins              | Check-Ins → Pending Reviews       |
| Compliance             | Compliance → Compliance Dashboard |
| Housing                | Housing → Resident Status         |
| Messages               | Messaging → Inbox                 |
| Quick Note             | Case Notes → Add Case Note        |
| Profile                | My Account → My Profile           |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned*
