# Location Privacy — GuardianHub

## Policy

GuardianHub captures device location only when operationally required. Location data is treated as sensitive personal data and protected accordingly.

## When Location Is Captured

| Operation | Required | Purpose |
|-----------|----------|---------|
| Clock in / Clock out | Optional | Verify guard is at assigned site |
| Patrol checkpoint scan | Optional | Verify checkpoint proximity |
| SOS / Panic alarm | Optional | Provide guard location to control room |
| Lone worker check-in | Optional | Provide guard location during safety monitoring |
| Welfare check-in | Optional | Context for wellbeing assessment |
| Occurrence book entry | Optional | Record location context for entries |

Location is *never* captured:
- Outside an active shift
- In the background without explicit user action
- From logged-out users
- For continuous tracking purposes

## Permission Model

1. **Browser permission** is requested at the point of need — when the user presses a button that requires location (clock in, scan checkpoint, SOS).
2. **Permission denial** does not crash any workflow. Operations proceed without GPS but are flagged for review.
3. **Guard consent**: before any location is captured, the guard initiates the action. No passive background collection.
4. **Permission is not persisted** — each location capture requires the browser's active permission state.

## Data Quality & Accuracy

- GPS accuracy (meters) is stored alongside every coordinate pair.
- Device timestamp and server timestamp are recorded separately.
- Low accuracy readings (< 100m) are recorded but flagged as "gps_low_accuracy".
- GPS-denied readings are recorded as "gps_unavailable".
- Location is *never* presented as proof of attendance or position. It is an operational aid only.

## Access Control

| Role | Precise Location Access |
|------|------------------------|
| Guard (self) | Own recent location only |
| Company Admin | All guards in their company |
| Operations Manager | All guards in their company |
| Super Admin | All guards across companies |
| Client | **No precise location** — only site-level presence (on site / not on site) |

## Storage & Retention

- Location data is stored in the relevant operational record (attendance_logs, patrol_scans, lone_worker_sessions, incidents, occurrence_books).
- Default retention: **90 days** for routine operational location data.
- Emergency location data (SOS events): **7 years** (audit requirement).
- Location data is purged from records older than retention period. Historical records retain the fact that location was captured but coordinates are removed.
- Company admins may configure shorter retention periods (minimum 30 days).

## Audit

All access to precise location data is logged:
- Who accessed it
- When
- From which IP
- For which guard
- Related incident/event ID

Audit logs are retained for 1 year minimum.

## Client Visibility

Clients (client role users) see only:
- Whether a guard is on site (derived from attendance, not GPS)
- Site-level patrol completion status
- No precise guard coordinates
- No guard movement history

## Configuration

Company admins can configure via Settings:
- Require GPS for clock-in (on/off)
- GPS radius tolerance for site (meters)
- Location retention period (days, min 30)
- Whether to store location on OB entries

These settings are audited on change.

## Failure Behaviour

| Scenario | Behaviour |
|----------|-----------|
| GPS denied by browser | Operation proceeds, flagged "gps_unavailable" |
| GPS timeout (>15s) | Operation proceeds, flagged "gps_unavailable" |
| Low accuracy (>100m) | Operation proceeds, flagged "gps_low_accuracy" |
| Browser doesn't support GPS | Operation proceeds, flagged "gps_unavailable" |
| Device in airplane mode | Operation proceeds, location marked null |

## Regulatory

- Complies with UK GDPR and DPA 2018.
- Lawful basis: legitimate interest (safety of lone workers, security operations) with explicit consent model (browser permission).
- Data Protection Impact Assessment (DPIA) should be completed by each company before deployment.
- Subject Access Requests: location data is included in standard SAR response for guards.
- Right to erasure: routine location data can be deleted per retention policy. Emergency/critical incident location data cannot be erased while the incident record exists.