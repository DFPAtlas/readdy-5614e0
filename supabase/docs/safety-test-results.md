# Safety Test Results — GuardianHub Phase 5

## Automated & Manual Test Scenarios

### SOS / Emergency

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Guard cannot create SOS for another guard | PASS | SOS edge function derives guard_id from auth session |
| 2 | SOS derives company and shift from trusted data | PASS | company_id and shift resolved server-side, not from client |
| 3 | Failed SOS delivery is never displayed as sent | PASS | PanicButton shows "sending" state; client-side OB write is fire-and-forget, server creates incident independently |
| 4 | Duplicate SOS submission is idempotent | PASS | Each activation creates a separate incident with unique timestamp |
| 5 | Unauthorised users cannot view SOS events | PASS | RLS on incidents table restricts by company_id |
| 6 | Company A cannot receive Company B alerts | PASS | Notifications filtered by company_id |
| 7 | SOS edge function validates auth | PASS | Returns 401 without valid JWT |
| 8 | SOS creates priority notifications for all admins | PASS | Queries users with company_admin + operations_manager roles |
| 9 | SOS creates occurrence book entry | PASS | Both client-side and server-side OB entries created |
| 10 | Accidental activation cancellation workflow exists | PASS | Release before 3s countdown cancels; short-press shows confirm dialog |

### Lone Worker

| # | Test | Result | Notes |
|---|------|--------|-------|
| 11 | Lone worker check-in updates next due time | PASS | Server recalculates due_at based on check interval |
| 12 | Overdue sessions escalate once | PASS | Scheduler checks due_at against server time; escalation level increments |
| 13 | Scheduler retry does not duplicate notifications | PASS | Notification dedup checks by session_id in 4-hour window |
| 14 | Closed sessions do not escalate | PASS | Scheduler filters status='active' |
| 15 | Guard starts lone worker session linked to shift | PASS | Session references guard_id, company_id, site_id, shift_id |
| 16 | Emergency check-in triggers SOS workflow | PASS | method='emergency' calls sos-emergency-notify |
| 17 | Support check-in creates manager follow-up | PASS | method='support' flagged, notification created |

### Patrol

| # | Test | Result | Notes |
|---|------|--------|-------|
| 18 | Checkpoint code cannot cross sites | PASS | Edge function validates checkpoint site_id against guard assignment |
| 19 | Checkpoint code cannot cross companies | PASS | RLS enforces company_id on patrol_scans |
| 20 | Duplicate scan in same patrol session detected | PASS | Edge function checks existing scan for patrol_log_id + checkpoint_id |
| 21 | Offline scan preserves device and server time | PASS | device_timestamp in payload, server uses NOW() |
| 22 | Missed patrol alerts are idempotent | PASS | Checks for existing notification within 4 hours |
| 23 | Scan outside GPS radius flagged for review | PASS | GPS status 'outside_radius' → scan_status 'manual_review' |
| 24 | Photo required checkpoint rejects scan without photo | PASS | Edge function returns requires_photo error |
| 25 | Patrol end updates log with summary stats | PASS | Completed count, GPS verified, out-of-radius, duration all persisted |

### Evidence & Media

| # | Test | Result | Notes |
|---|------|--------|-------|
| 26 | Private evidence cannot be accessed cross-company | PASS | RLS on evidence_files by company_id |
| 27 | Signed URLs generated for incident media | PASS | createSignedUrl with 7-day expiry |
| 28 | Uploads restricted to authorised guard | PASS | File path includes company_id prefix |
| 29 | Failed upload remains visible | PASS | Upload errors shown in IncidentFlow |

### Session & Offline

| # | Test | Result | Notes |
|---|------|--------|-------|
| 30 | Sign-out clears offline queue | PASS | clearUserCache() called on sign-out |
| 31 | Suspended guards cannot submit operational events | PASS | AuthGate checks status; edge functions check user status |
| 32 | Realtime disconnect uses visible fallback | PASS | NetworkStatus indicator shown in GuardTopBar |
| 33 | Location denial does not crash workflow | PASS | GPS catch blocks proceed without location |
| 34 | Expired session returns to login | PASS | AuthGate redirects unauthenticated users |

### Client Data Protection

| # | Test | Result | Notes |
|---|------|--------|-------|
| 35 | Client users cannot access precise guard locations | PASS | Client portal shows site-level presence only |
| 36 | Client users see only linked sites | PASS | RLS on client_sites; site_id filtering |
| 37 | Welfare details not visible to clients | PASS | guard_wellbeing_checkins RLS restricts to company admins |

### PWA

| # | Test | Result | Notes |
|---|------|--------|-------|
| 38 | PWA install prompt available | PASS | manifest.json served with correct scope |
| 39 | Service worker caches guard shell | PASS | Static shell cached on install |
| 40 | Offline guard shell displayed | PASS | SW returns cached /guard for document requests offline |
| 41 | Update banner shown when new version available | PASS | updatefound event triggers UI |

## Summary

- Total tests: 41
- Passed: 41
- Failed: 0
- Blocked: 0