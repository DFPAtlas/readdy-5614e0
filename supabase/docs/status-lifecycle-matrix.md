# GuardianHub Status & Lifecycle Matrix

## Site Statuses

| Status | Meaning | Transitions To | Rules |
|--------|---------|---------------|-------|
| `active` | Operational site | `archived`, `inactive` | Default new site status |
| `archived` | Hidden from active lists | `active` | Preserves all historical data, warns if future shifts exist |
| `inactive` | Temporarily paused | `active`, `archived` | Guards cannot be assigned, shifts hidden |

## Guard Statuses

| Status | Meaning | Transitions To | Rules |
|--------|---------|---------------|-------|
| `active` | Working guard | `inactive`, `suspended` | Can be assigned to sites and shifts |
| `inactive` | Not currently working | `active` | Cannot be assigned, historical records preserved |
| `suspended` | Disciplinarily suspended | `active`, `inactive` | Blocked from all access, not deletable |

## Guard Assignment Statuses

| Status | Meaning | Rules |
|--------|---------|-------|
| `assigned` | Actively assigned to site | Can receive shifts at this site |
| `approved` | Cleared for site but not assigned | Ready for assignment |
| `not_trained` | Missing required skills/certs | Cannot be assigned until training complete |
| `blocked` | Explicitly blocked from site | Cannot be assigned, override possible |
| `expired_docs` | SIA or certification expired | Cannot be assigned until renewed |

## Shift Statuses

| Status | Meaning | Transitions To | Rules |
|--------|---------|---------------|-------|
| `scheduled` | Planned but not started | `active`, `cancelled` | Editable by managers |
| `active` | Currently in progress | `completed` | Guard has booked on |
| `completed` | Shift finished | — | Immutable historical record |
| `cancelled` | Shift cancelled | — | Retained for audit, no attendance expected |

## Incident Statuses

| Status | Meaning | Transitions To | Rules |
|--------|---------|---------------|-------|
| `draft` | Being written | `open`, deleted | Not yet reported |
| `open` | Reported and active | `in_progress`, `reviewing`, `resolved`, `closed` | Visible to ops |
| `in_progress` | Investigation underway | `reviewing`, `resolved`, `closed` | Investigator assigned |
| `reviewing` | Under management review | `resolved`, `closed`, `open` | Quality check |
| `resolved` | Resolution applied | `closed`, `open` | May be reopened |
| `closed` | Finalised | `open` (reopen) | Requires reason to reopen |

### Incident Severity

| Severity | Meaning | Notification |
|----------|---------|-------------|
| `low` | Minor incident | Standard logging |
| `medium` | Notable incident | Ops notification |
| `high` | Serious incident | Urgent notification |
| `critical` | Major/crisis incident | Emergency escalation |

## Occurrence Book Entry Types

- `general_note` — General operational note
- `handover` — Shift handover notes
- `incident_note` — Incident-related entry
- `patrol_note` — Patrol observation
- `visitor_note` — Visitor log note
- `maintenance_issue` — Equipment/facility issue
- `health_safety` — H&S observation
- `client_update` — Client communication note
- `security_alert` — Security concern
- `lost_property` — Lost/found record
- `key_log` — Key handover record
- `other` — Miscellaneous

### OB Visibility

| Visibility | Meaning |
|-----------|---------|
| `internal` | Ops team only |
| `client_visible` | Visible in client reports |
| `handover` | Visible to next shift |

## Leave Request Statuses

| Status | Meaning | Transitions To |
|--------|---------|---------------|
| `pending` | Awaiting review | `approved`, `rejected`, `pending_cover` |
| `pending_cover` | Approved but needs cover | `approved`, `cancelled` |
| `approved` | Leave approved | `cancelled` |
| `rejected` | Leave denied | — |
| `cancelled` | Guard cancelled request | — |
| `expired` | Past the shift date | — |

## Shift Cover Offer Statuses

| Status | Meaning | Rules |
|--------|---------|-------|
| `pending` | Awaiting guard response | Auto-expires after deadline |
| `accepted` | Guard accepted | Atomically reserves shift, rejects other offers |
| `declined` | Guard declined | Other guards can still accept |
| `expired` | Past response deadline | Treated as declined |

## Company Account Statuses

| Status | Meaning | Effect |
|--------|---------|--------|
| `trial` | Trial period | Full feature access, trial banner shown |
| `active` | Paying subscriber | Full access |
| `past_due` | Payment overdue | Grace period access |
| `suspended` | Account suspended | All users blocked |
| `cancelled` | Subscription cancelled | Billing access only |

## User Account Statuses

| Status | Meaning | Effect |
|--------|---------|--------|
| `invited` | Invited but not accepted | Cannot log in |
| `pending_verification` | Email not confirmed | Limited access |
| `active` | Full access | Normal operation |
| `suspended` | Temporarily blocked | Cannot access private data |
| `removed` | Permanently removed | Cannot log in |