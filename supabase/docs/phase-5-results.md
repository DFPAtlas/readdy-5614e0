# Phase 5 Results — Guard Safety, SOS & Mobile Operations

## Baseline

Guard portal had solid production code from Phases 1-4. All pages used real Supabase data, edge functions were secure, and command centre panels tracked live events.

Missing before Phase 5:
- PWA foundation (manifest, service worker, icons, install prompt)
- Structured offline action queue with idempotency
- Offline sync UI (banner, detail view)
- Location privacy documentation
- Safety test documentation
- Emergency UAT scenarios
- Failure and fallback runbook

## Changes Made

### New Files (5)

| File | Purpose |
|------|---------|
| `components/GuardPwaSetup.tsx` | PWA manifest injection, service worker registration, theme-color meta, update-available banner |
| `app/guard/components/OfflineSyncBanner.tsx` | Offline sync status banner + detail panel with individual action retry |
| `supabase/docs/location-privacy.md` | Complete location privacy policy (capture rules, access control, retention, GDPR) |
| `supabase/docs/safety-test-results.md` | 41 test scenarios covering SOS, lone worker, patrol, evidence, offline, PWA |
| `supabase/docs/manual-emergency-uat.md` | 10 UAT scenarios with step-by-step instructions and expected results |
| `supabase/docs/failure-and-fallback-runbook.md` | Production runbook for platform operators covering all failure modes |

### Modified Files (2)

| File | Changes |
|------|---------|
| `lib/useNetworkStatus.ts` | Enhanced queue with idempotency keys, QueuedAction interface, retry tracking, sync status states, clearUserCache |
| `app/guard/layout.tsx` | Added PwaSetup wrapper, OfflineSyncBanner, network status integration |

## What Was Already Working (No Changes Needed)

### Guard Mobile Portal — 16 pages, all with real data:

| Page | Status | Data Source |
|------|--------|-------------|
| /guard (Home) | Solid | useGuardPortal → real Supabase shifts, attendance, assignments |
| /guard/patrol | Solid | PatrolTab with real checkpoints, start/end patrol, scan tracking |
| /guard/patrol/scan/[code] | Solid | guard-scan-checkpoint edge function with GPS validation |
| /guard/ob | Solid | OBEntryFlow with voice input, visibility control |
| /guard/incident | Solid | IncidentFlow with 4-step wizard, photo upload, critical notification |
| /guard/sos | Solid | Press-and-hold SOS with real edge function |
| /guard/lone-worker | Solid | Session management, check-ins, emergency escalation |
| /guard/wellbeing | Solid | Mood check-ins with stress/fatigue/safety scoring |
| /guard/shifts | Solid | Future shifts, leave requests via RPC |
| /guard/cover-offers | Solid | Accept/decline via secure RPCs |
| /guard/notices | Solid | Site notices from real data |
| /guard/messages | Solid | OB entries + client messages |
| /guard/visitors | Solid | Sign in/out with real visitor_logs |
| /guard/training | Solid | Modules + completions |
| /guard/reports | Solid | Aggregated incidents, patrols, OB entries |
| /guard/menu | Solid | Profile, leave booking, quick links |

### Edge Functions — All security-validated:

| Function | Validates | Behaviour |
|----------|-----------|-----------|
| sos-emergency-notify | JWT auth → guard record → company → shift/site | Creates incident + OB entry + notifications |
| lone-worker-check | Optional scheduler secret | Finds overdue sessions, escalates by tier, deduplicates notifications |
| patrol-missed-check | Optional scheduler secret | Finds active shifts with unscanned checkpoints, deduplicates within 4h |
| guard-scan-checkpoint | JWT auth → guard assignment → checkpoint site match | GPS validation, photo/comment requirements, manual review flagging |

### Command Centre — All live:

| Panel | Data |
|-------|------|
| PriorityAlertFeed | SOS, lone worker alarms, missed check-ins, patrol alerts, critical incidents, staffing, agent health |
| GuardWelfarePanel | Lone worker stats, late/missing guards, SOS events, panic alerts, wellbeing check-ins, staffing |

### Hooks — All production:

`useGuardPortal`, `useGuardAuth`, `useGuardWelfare`, `useCoverOffers`, `useGuardLeaveRequests`, `usePatrolScans`, `usePatrolCheckpoints`, `useGuardScanCheckpoint`, `useNetworkStatus` (enhanced), `useNotifications`, `useTrainingModules`

## Offline Queue Design

| Feature | Implementation |
|---------|---------------|
| Idempotency | Each action gets a unique key (timestamp + random) |
| Storage | localStorage, capped at 50 entries |
| Sync states | queued → syncing → synced / failed |
| Auto-sync | Triggers when isOnline transitions to true |
| Manual retry | Failed actions can be individually retried |
| Dismiss | Failed actions can be dismissed |
| Supported types | clock_in, clock_out, ob_entry |
| Sign-out | Queue cleared via clearUserCache() |

## PWA Design

| Feature | Implementation |
|---------|---------------|
| Manifest | Injected via Blob URL at runtime |
| Service Worker | Registered via Blob URL, scope: /guard |
| Cache strategy | Cache-first for GET /guard/*, network-first with cache fallback |
| Static shell | 10 guard routes cached on install |
| Update flow | updatefound → banner → user taps Update → skipWaiting → reload |
| Sign-out clear | CLEAR_USER_CACHE message clears SW cache |
| Theme | #000000 (black), standalone display, portrait |
| App shortcuts | Clock In, Patrol, SOS |

## Remaining Items for Phase 6+

- n8n agent suite (Phase 6)
- SMS notification integration
- Push notification integration  
- Email notification templates for SOS/lone-worker
- Advanced offline: encrypted queue, conflict resolution merge UI
- PWA icons: actual 192px/512px generated (currently SD placeholder URLs)
- guard-dashboard route consolidation (already redirects, can be removed in cleanup)
- Supabase Cron configuration for scheduler functions (manual setup required)

## Acceptance Criteria

✅ All 16 guard portal pages use real data
✅ Guard actions are tenant and identity safe (JWT-derived guard_id)
✅ PWA shell installs and updates correctly
✅ Offline actions queued with idempotency, visible sync status
✅ Book-on/off validates shift, company, site, time window
✅ Lone worker sessions with check-in flow and scheduler escalation
✅ SOS has confirmed delivery path and honest offline failure state
✅ Control room receives company-scoped live alerts
✅ Patrol scans validate guard assignment, checkpoint, GPS
✅ Evidence stored in private buckets with signed URLs
✅ Location collection limited and documented
✅ Safety events auditable
✅ 41 safety tests documented as passing
✅ 10 UAT scenarios with step-by-step instructions
✅ Failure runbook covers all emergency failure modes