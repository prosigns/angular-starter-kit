# BPDS CareTrack™ — Client (Participant) Sidebar Menu

**Role:** Client (Program Participant)
**Access Level:** Self-scoped — own data only, no access to other clients or system configuration
**Platform:** Mobile App (Flutter) — Primary | Web Portal (Angular 18+) — Secondary
**Design Principle:** Low barrier, high stress, low tech users — plain language, minimal steps, intuitive navigation

---

## 1. HOME

### Dashboard
- Welcome / Daily Summary
- Today's Tasks
- Next Appointment
- Check-In Streak
- Compliance Status (Visual Indicator)
- Unread Messages Badge
- Motivational Milestone Card

---

## 2. CHECK-INS

### Daily Check-In
- Submit Daily Check-In
- Weekly Check-In
- Check-In History
- My Streaks & Milestones

---

## 3. MY APPOINTMENTS

### Appointments
- Upcoming Appointments
- Past Appointments
- Missed Appointments

---

## 4. MY DOCUMENTS

### Documents
- Upload Document
- My Uploads
- UA Results
- Attendance Verification
- Required Documents

---

## 5. MY PROGRAM

### Program Info
- My Program Details
- My Case Manager
- My Provider
- Program Rules & Expectations
- My Compliance Status

### Housing (If Enrolled)
- My Housing Info
- Meeting Schedule
- Rent Balance
- Housing Rules

### Court / Probation (If Enrolled)
- My Conditions
- Upcoming Hearings
- Compliance Status

---

## 6. MESSAGES

### Messaging
- Inbox
- Send Message
- Conversations with My Team

---

## 7. MY PROGRESS

### Progress
- Compliance Timeline
- Milestones Achieved
- Streak History
- Program Completion Progress

---

## 8. MY ACCOUNT

### Profile
- My Profile
- Change Password
- Notification Preferences
- Consent & Privacy
- Terms of Service

---

## Menu Summary

| Group                | Parent Items | Sub Items | Total Pages |
|----------------------|:------------:|:---------:|:-----------:|
| Home                 | 1            | 7         | 8           |
| Check-Ins            | 1            | 4         | 5           |
| My Appointments      | 1            | 3         | 4           |
| My Documents         | 1            | 5         | 6           |
| My Program           | 3            | 12        | 15          |
| Messages             | 1            | 3         | 4           |
| My Progress          | 1            | 4         | 5           |
| My Account           | 1            | 5         | 6           |
| **Total**            | **10**       | **43**    | **53**      |

---

## Icon Suggestions (Lucide / Material Icons)

| Menu Item            | Icon                  |
|----------------------|-----------------------|
| Home                 | `home`                |
| Check-Ins            | `clipboard-check`     |
| Appointments         | `calendar-clock`      |
| Documents            | `file-up`             |
| Program Info         | `info`                |
| Housing              | `home`                |
| Court / Probation    | `gavel`               |
| Messages             | `message-square`      |
| Progress             | `trophy`              |
| Profile              | `circle-user`         |

---

## Mobile App (Flutter) — Client View (Primary Interface)

The Client mobile app is the **primary interface** for this role. Most clients will never use the web portal.

### Bottom Navigation Bar (5 items)
| Tab          | Icon               | Screen                    |
|--------------|--------------------|---------------------------|
| Home         | `home`             | Dashboard                 |
| Check-In     | `clipboard-check`  | Submit Daily Check-In     |
| Messages     | `message-square`   | Inbox                     |
| Progress     | `trophy`           | Compliance Timeline       |
| Menu         | `menu`             | Full menu (hamburger)     |

### Hamburger Menu (Secondary)
- My Appointments
- My Documents
- My Program
- Housing Info
- Court Info
- My Profile
- Notification Preferences
- Consent & Privacy
- Help / FAQ

---

## Accessibility & UX Considerations

| Principle                    | Implementation                                          |
|------------------------------|---------------------------------------------------------|
| Plain Language               | No jargon — "Check-In" not "Compliance Submission"      |
| Minimal Required Steps       | Check-in completable in under 60 seconds                |
| Visual Status Indicators     | Green / Yellow / Red for compliance at a glance          |
| Large Touch Targets          | 48px minimum for all interactive elements                |
| SMS Fallback                 | Reminders via SMS for users without reliable data        |
| Offline Capability           | Check-ins queued offline, synced when connected          |
| Motivational Design          | Streaks, milestones, progress bars — positive framing    |
| Low Data Usage               | Lightweight assets, compressed images                   |
| Font Size                    | 16px minimum body text, scalable                        |
| Contrast Ratio               | WCAG 2.1 AA minimum (4.5:1 for text)                   |

---

## Conditional Menu Visibility

Not all clients are enrolled in every program. Menu sections appear **only when applicable**:

| Condition                          | Menu Section Shown         |
|------------------------------------|----------------------------|
| Enrolled in Recovery Housing       | Housing (under My Program) |
| Enrolled in Drug Court             | Court / Probation          |
| Enrolled in Probation / Parole     | Court / Probation          |
| UA Testing Required                | UA Results (under Docs)    |
| Housing Rent Applicable            | Rent Balance               |

---

*BPDS CareTrack™ — Brittany Pelletier Document Studio, LLC | Prosigns Technical Partner*
*HIPAA / 42 CFR Part 2 Compliant | NIST 800-53 Aligned | WCAG 2.1 AA Accessible*
