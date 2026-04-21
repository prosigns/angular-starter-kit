# BPDS CareTrack™ — Read-Only Auditor Sidebar Menu

**Role:** Read-Only Auditor (State/DHHS Oversight)
**Access Level:** Tenant-scoped read-only — reports, audit trails, compliance data. Zero write access.
**Platform:** Web Portal (Angular 18+) only — no mobile app access
**Access Gated By:** 42 CFR Part 2 consent authorization per client

---

## 1. OVERVIEW

### Dashboard
- Program Performance Summary
- Active Client Count
- Compliance Rate (Overall)
- Engagement Trends
- Flagged Incidents (Last 30 Days)
- Audit Activity Log

---

## 2. PROGRAM OVERSIGHT

### Programs
- Program Directory
- Program Configuration (View Only)
- Program Enrollment Statistics

### Compliance Overview
- Compliance Dashboard
- Milestone Completion Rates
- Violation Summary
- Risk Indicator Trends
- Escalation History

---

## 3. CLIENT DATA (Consent-Gated)

### Client Records
- Client Directory (Authorized Only)
- Client Profiles (View Only)
- Program Participation History
- Compliance Timeline

### Check-Ins
- Check-In Completion Rates
- Missed Check-In Trends
- Flagged Check-Ins

### Appointments
- Attendance Rates
- Missed Appointment Trends
- No-Show Analysis

### UA / Drug Testing
- UA Result Summary
- Positive / Negative Trends
- Testing Compliance Rate

---

## 4. HOUSING & COURT

### Housing
- Housing Occupancy Overview
- Meeting Attendance Rates
- Rent Collection Status
- Housing UA Summary

### Court / Probation
- Court Compliance Rates
- Condition Adherence Summary
- Hearing Attendance

---

## 5. AUDIT TRAIL

### Audit Logs
- User Activity Logs
- Data Access Logs
- PHI Access Records
- Authentication Events
- Consent Change History

### Consent Records
- Active Consents
- Expired Consents
- Revoked Consents
- Consent Audit Trail

---

## 6. REPORTING

### Standard Reports
- Engagement Reports
- Retention Reports
- Compliance Reports
- Program Performance Reports
- Client Outcome Reports

### State / DHHS Reports
- DHHS Required Reports
- Federal Reporting Data
- KPI Summary Reports

### Export
- Export Center
- Scheduled Reports
- Report Archive

---

## 7. MY ACCOUNT

### Profile
- My Profile
- Change Password
- MFA Settings

---

## Menu Summary

| Group                | Parent Items | Sub Items | Total Pages |
|----------------------|:------------:|:---------:|:-----------:|
| Overview             | 1            | 6         | 7           |
| Program Oversight    | 2            | 8         | 10          |
| Client Data          | 4            | 13        | 17          |
| Housing & Court      | 2            | 7         | 9           |
| Audit Trail          | 2            | 10        | 12          |
| Reporting            | 3            | 11        | 14          |
| My Account           | 1            | 3         | 4           |
| **Total**            | **15**       | **58**    | **73**      |

---

## Icon Suggestions (Lucide / Material Icons)

| Menu Item            | Icon                  |
|----------------------|-----------------------|
| Dashboard            | `layout-dashboard`    |
| Programs             | `folder-kanban`       |
| Compliance Overview  | `check-circle-2`      |
| Client Records       | `user-round-search`   |
| Check-Ins            | `clipboard-check`     |
| Appointments         | `calendar-clock`      |
| UA / Drug Testing    | `test-tubes`          |
| Housing              | `home`                |
| Court / Probation    | `gavel`               |
| Audit Logs           | `scroll-text`         |
| Consent Records      | `file-signature`      |
| Standard Reports     | `bar-chart-3`         |
| State / DHHS Reports | `landmark`            |
| Export               | `download`            |
| Profile              | `circle-user`         |

---

## Access Control Enforcement

| Control                        | Implementation                                              |
|--------------------------------|-------------------------------------------------------------|
| Read-Only Enforcement          | All API endpoints return 403 on POST/PUT/PATCH/DELETE        |
| 42 CFR Part 2 Consent Gate     | Client data visible ONLY with active, valid consent          |
| No Client Contact              | Messaging module completely hidden                           |
| No Document Upload             | Document section is view/download only                       |
| No Configuration Changes       | Settings and config are completely hidden                    |
| PHI Access Logging             | Every client record view is logged with timestamp and IP     |
| Session Restrictions           | Shorter session timeout (15 min idle, 4 hr absolute)        |
| Export Watermarking             | Exported reports include auditor ID and timestamp            |
| IP Restriction (Optional)      | Can be restricted to State network IP ranges                 |
| No Mobile Access               | Role excluded from Flutter mobile app authentication         |

---

## Key Differences from All Other Roles

| Aspect                   | Auditor                             | All Other Roles                     |
|--------------------------|-------------------------------------|-------------------------------------|
| Write Access             | None — strictly read-only           | Role-appropriate write access       |
| Client Data Access       | Consent-gated, aggregated preferred | Direct access per role scope        |
| Messaging                | No access                           | Available per role                  |
| Document Management      | View / download only                | Upload / manage per role            |
| Configuration            | No access                           | Available to admins                 |
| Audit Trail Access       | Full tenant audit visibility        | Limited or no access                |
| Reporting Depth          | Deepest reporting access            | Role-scoped reports                 |
| Mobile App               | No access                           | Available for providers & clients   |
| Session Timeout          | 15 min idle / 4 hr absolute         | 30 min idle / 8 hr absolute        |
| Export Controls          | Watermarked with auditor ID         | Standard exports                    |
| PHI Access               | Logged and consent-verified         | Logged per HIPAA                    |

---

## 42 CFR Part 2 — Consent Verification Flow

```
Auditor requests client data
         │
         ▼
┌─────────────────────┐
│ Active consent for   │──── No ───▶ ACCESS DENIED
│ this auditor/agency? │             (Record ID visible,
└─────────┬───────────┘              data redacted)
          │
         Yes
          │
          ▼
┌─────────────────────┐
│ Consent covers       │──── No ───▶ PARTIAL ACCESS
│ requested data type? │             (Only authorized
└─────────┬───────────┘              categories shown)
          │
         Yes
          │
          ▼
┌─────────────────────┐
│ Consent not expired  │──── No ───▶ ACCESS DENIED
│ or revoked?          │             (Renewal required)
└─────────┬───────────┘
          │
         Yes
          │
          ▼
    ACCESS GRANTED
    (PHI access logged)
```

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned*
