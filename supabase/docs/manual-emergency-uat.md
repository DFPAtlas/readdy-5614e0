# Manual Emergency UAT — GuardianHub Phase 5

## Purpose

This document guides manual User Acceptance Testing for GuardianHub's safety-critical features. Testers must complete each scenario and record results.

## Prerequisites

- A test company with at least 2 admin users
- A test guard account with active shifts at a site with patrol checkpoints
- A mobile phone with a real SIM card (not WiFi only for some tests)
- The guard portal open on the mobile phone
- The command centre dashboard open on a desktop

---

## Scenario 1: No Mobile Signal

**Setup:** Enable airplane mode on the guard's phone.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 1.1 | Guard opens /guard | Guard portal loads from cache (if PWA installed) or shows offline indicator | |
| 1.2 | Guard taps "Book On" | Offline action queued; banner shows 1 pending action | |
| 1.3 | Guard taps SOS (hold 3s) | SOS screen shows with offline warning; "Sending emergency alert" displayed locally | |
| 1.4 | Disable airplane mode | Pending actions auto-sync; SOS incident appears in command centre | |
| 1.5 | Check command centre | SOS alert visible in PriorityAlertFeed; incident created with correct guard/site | |
| 1.6 | Check occurrence book | OB entry created with SOS type | |

**Pass/Fail:**

---

## Scenario 2: Slow Connection (2G/3G simulation)

**Setup:** Use Chrome DevTools to throttle network to "Slow 3G".

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 2.1 | Guard scans checkpoint | Loading spinner shown; eventual success or retry option | |
| 2.2 | Guard submits incident with photo | Photo uploads progress shown; incident created with photo | |
| 2.3 | Guard checks in (lone worker) | Check-in confirmed even with delay | |
| 2.4 | Check no duplicate records | Each action creates exactly one record | |

**Pass/Fail:**

---

## Scenario 3: Location Denied

**Setup:** In browser settings, deny location permission for the site.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 3.1 | Guard opens /guard | GPS indicator shows red "GPS Unavailable" | |
| 3.2 | Guard taps "Book On" | Proceeds without GPS; attendance_log created with null coordinates | |
| 3.3 | Guard scans checkpoint | Scan proceeds; status "gps_unavailable"; flagged "manual_review" | |
| 3.4 | Guard triggers SOS | SOS created; GPS field null; control room sees "GPS: Not available" | |
| 3.5 | Check command centre | Missing GPS noted in incident details | |

**Pass/Fail:**

---

## Scenario 4: Expired Session

**Setup:** Manually delete the Supabase auth token from browser storage.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 4.1 | Guard is on /guard | Redirected to /login/guard | |
| 4.2 | Guard logs in again | Returns to /guard with fresh session | |
| 4.3 | Guard attempts action | All data loads correctly; no stale state | |

**Pass/Fail:**

---

## Scenario 5: Duplicate Tap (Race Condition)

**Setup:** Guard is clocked in with active shift.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 5.1 | Guard rapidly taps "Book Off" 5 times | Only one clock_out written to attendance_logs; no error shown | |
| 5.2 | Guard rapidly taps SOS 3 times | Multiple SOS events may be created (each is a separate activation); no crash | |
| 5.3 | Guard rapidly taps "Check In" on lone worker | Each check-in creates a record; no duplicate same-second check-ins from UI debounce | |
| 5.4 | Guard rapidly taps "Start Patrol" | Only one active patrol created | |

**Pass/Fail:**

---

## Scenario 6: Browser Closed During Sync

**Setup:** Guard queues an offline action (e.g., clock in while in airplane mode).

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 6.1 | Guard books on while offline | Action queued in localStorage | |
| 6.2 | Close browser tab completely | Queue persists in localStorage | |
| 6.3 | Reopen /guard, go online | Queued action appears in sync banner; auto-syncs | |
| 6.4 | Check attendance_logs | Clock in recorded with correct timestamp | |

**Pass/Fail:**

---

## Scenario 7: Realtime Disconnected

**Setup:** Open command centre dashboard on desktop.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 7.1 | Guard performs SOS | SOS appears in command centre via polling fallback within 30s | |
| 7.2 | Guard checks in (lone worker) | Data refreshes on next poll | |
| 7.3 | Guard ends patrol | Patrol status updates in command centre | |
| 7.4 | Connection health indicator | Shows reconnecting state if realtime drops | |

**Pass/Fail:**

---

## Scenario 8: Scheduler Stopped

**Setup:** This tests the scheduler monitoring, not actual scheduler failure. Simulate by checking what happens when the scheduler hasn't run in 60+ minutes.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 8.1 | Guard starts lone worker session, misses check-in | After grace period, alert appears | |
| 8.2 | Check agent_execution_logs | Last lone_worker_check run timestamp visible | |
| 8.3 | Manual trigger of scheduler (via Supabase dashboard) | Scheduler catches up; processes overdue sessions | |

**Pass/Fail:**

---

## Scenario 9: Notification Provider Unavailable

**Setup:** This tests graceful degradation. The SOS edge function handles notification failure gracefully.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 9.1 | Guard triggers SOS | Edge function creates incident and OB entry even if notification sending partially fails | |
| 9.2 | Check incident created | Incident exists with correct data | |
| 9.3 | Check OB entry created | OB entry exists | |
| 9.4 | Check command centre | SOS visible in GuardianWelfarePanel SOS events list | |

**Pass/Fail:**

---

## Scenario 10: Evidence Upload Failure

**Setup:** Guard attempts incident report with photos. Simulate upload failure by using a very large file or network throttle.

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 10.1 | Guard selects 50MB photo for incident | Upload rejected or shows error | |
| 10.2 | Incident still submitted | Incident created without photo; guard informed | |
| 10.3 | Guard retries with valid photo | Photo uploads and links to incident | |
| 10.4 | Check incident_media table | Photo record created with correct incident_id | |

**Pass/Fail:**

---

## Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Tester | | | |
| Operations Manager | | | |
| Company Admin | | | |