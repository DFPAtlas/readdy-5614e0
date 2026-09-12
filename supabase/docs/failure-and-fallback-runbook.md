# Failure & Fallback Runbook — GuardianHub

## Purpose

This runbook describes what happens under failure conditions in GuardianHub's safety-critical systems. Control room staff and platform operators should be familiar with these scenarios.

---

## SOS / Panic Alarm

### Normal Flow
1. Guard presses and holds panic button for 3 seconds
2. Client-side OB entry created immediately (fire-and-forget)
3. SOS edge function invoked with guard identity from JWT
4. Server validates guard, company, resolves shift/site
5. Server creates incident record (severity: critical)
6. Server creates server-side OB entry
7. Server queries all company_admin + operations_manager users
8. Server creates critical notifications for each admin
9. Guard sees "Panic Alarm Sent" confirmation

### What If: Network Down
- Client-side OB entry written to offline queue
- SOS edge function call fails
- Guard sees "Sending emergency alert" but no server confirmation
- **Guard must use telephone fallback (999 or company emergency number)**
- When network returns, queued actions sync
- Incident may need manual creation by control room

### What If: Edge Function Error
- SOS edge function returns 500
- Incident may not be created
- OB entry already created client-side
- **Manual check required**: control room must verify incident created
- If not created, control room creates incident manually

### What If: Notification Delivery Fails
- Incident and OB entry created successfully
- Notifications may not be delivered to all admins
- **Incident is still visible in command centre PriorityAlertFeed and GuardianWelfarePanel**
- Control room should check for unacknowledged SOS events

### Cancellation (Accidental Activation)
- If guard releases before 3-second countdown: no SOS triggered
- If guard short-presses: confirmation dialog shown
- If guard triggers SOS accidentally: control room marks as "false alarm" in incident status
- **Never delete SOS events** — mark resolved with reason "accidental activation"

---

## Lone Worker Monitoring

### Normal Flow
1. Guard starts lone worker session (sets check-in interval)
2. Guard performs periodic check-ins (safe/support/emergency)
3. Each check-in updates next_check_in_due_at
4. Scheduler (lone-worker-check Edge Function) runs periodically
5. Scheduler finds sessions where next_check_in_due_at < NOW()
6. Based on delay: warning (15m), overdue (30m), critical (60m)
7. Notifications created for company admins
8. Escalation level increased on session

### What If: Scheduler Doesn't Run
- Sessions will not auto-escalate
- Guard's missed check-ins still accumulate in the session record
- **Check agent_execution_logs** for last lone_worker_check run
- Manually trigger via Supabase Dashboard → Edge Functions → lone-worker-check → Invoke
- Set up Supabase Cron with `*/5 * * * *` schedule

### What If: Guard's Phone Dies
- Guard cannot check in
- Scheduler detects overdue after configured threshold
- Escalation proceeds normally
- Control room receives critical notification at 60+ minutes overdue
- **Control room should attempt alternative contact** (phone, site phone, emergency contact)

### What If: Guard Closes Session Without Book-Off
- Guard ends lone worker session from /guard/lone-worker
- Session status becomes "ended"
- Scheduler ignores ended sessions
- If guard forgets to end session and leaves site: scheduler will escalate
- **Managers can end sessions via Supabase Dashboard if needed**

---

## Patrol Scanning

### Normal Flow
1. Guard starts patrol from /guard/patrol
2. Patrol log created (status: active)
3. Guard scans checkpoints via QR codes
4. Each scan calls guard-scan-checkpoint Edge Function
5. Edge function validates: checkpoint exists, guard assigned, GPS proximity
6. Scan recorded with GPS status (verified/outside_radius/gps_unavailable/etc.)
7. Guard ends patrol; summary stats persisted

### What If: GPS Unavailable
- Scan proceeds without GPS
- Status: "gps_unavailable"
- Scan flagged "manual_review"
- Control room notification created (if configured)

### What If: Outside GPS Radius
- Scan proceeds
- Status: "outside_radius"
- Flagged "manual_review"
- Control room notification created
- Distance recorded in scan

### What If: QR Code Compromised
- Checkpoint codes should be rotated
- Deactivate old checkpoint, create new one with new code
- Historical scans linked to old checkpoint preserved
- Guard scanning old code will get "Checkpoint not found"

### What If: Missed Patrol (Scheduler)
- patrol-missed-check scheduler runs periodically
- Finds shifts where active checkpoints were not scanned
- Creates patrol_missed notifications for company admins
- Deduplicates: won't re-alert for same checkpoint within 4 hours

---

## Book On/Off

### Normal Flow
1. Guard opens /guard, sees today's shift
2. Guard taps "Book On" — GPS captured, attendance_log created
3. Shift status updated to "active"
4. OB entry created ("Shift commenced")
5. Guard taps "Book Off" — attendance_log updated with clock_out
6. Shift status updated to "completed"
7. OB handover entry created

### What If: GPS Fails During Book-On
- Book-on proceeds without GPS
- GPS coordinates are null in attendance_log
- Guard confirmed to be on site (attendance record exists)

### What If: Duplicate Book-On Attempt
- Supabase unique constraint prevents duplicate open attendance records
- Error shown to guard

### What If: Book-On Outside Time Window
- UI disables Book On button
- Shows "Clock in opens at XX:XX" or "Shift has ended"

### What If: Book-Off Without Active Attendance
- UI should not show Book Off button if no active attendance
- Guard may need manual manager correction

---

## Offline Action Queue

### Normal Flow
1. Guard performs action while offline
2. Action queued in localStorage with idempotency key
3. Network status indicator shows "Offline"
4. Pending count shown in sync banner
5. When online, actions auto-sync in order
6. Synced actions removed from queue
7. Failed actions remain with retry option

### What If: Queue Grows Too Large
- Queue limited to 50 entries
- Oldest entries dropped if limit exceeded

### What If: Conflicting Server State
- If record already exists (e.g., clock-in already recorded), Supabase may reject duplicate
- Action marked as failed
- Guard can dismiss failed action

### What If: localStorage Cleared
- Queue lost
- **Guard should verify critical actions** (clock-in, SOS) with control room
- Actions must be re-performed

---

## Realtime / Live Updates

### Normal Flow
- Command centre subscribes to Postgres changes on key tables
- Changes reflected in near-real-time

### What If: Realtime Disconnects
- Polling fallback: data refreshes every 30 seconds
- Connection indicator may show reconnecting state
- No data lost — next poll catches up

---

## Emergency Contacts

### Always Available
- UK Emergency Services: **999**
- UK Police Non-Emergency: **101**
- UK NHS: **111**

### Company-Specific
- Configured per company in site_contacts and emergency procedures
- Visible on guard home screen when clocked in

---

## Platform Operator Actions

### Check Scheduler Health
```sql
SELECT agent_key, status, created_at, details
FROM agent_execution_logs
WHERE agent_key IN ('lone_worker_check', 'patrol_missed_check')
ORDER BY created_at DESC
LIMIT 10;
```

### Find Active SOS Events
```sql
SELECT i.id, i.title, i.occurred_at, i.status, s.site_name, g.first_name, g.last_name
FROM incidents i
JOIN sites s ON i.site_id = s.id
JOIN guards g ON i.guard_id = g.id
WHERE i.incident_type ILIKE '%sos%' OR i.incident_type ILIKE '%panic%'
AND i.status IN ('open', 'reviewing')
ORDER BY i.occurred_at DESC;
```

### Find Overdue Lone Worker Sessions
```sql
SELECT lws.id, g.first_name, g.last_name, s.site_name,
  lws.next_check_in_due_at, lws.missed_check_ins, lws.escalation_level
FROM lone_worker_sessions lws
JOIN guards g ON lws.guard_id = g.id
LEFT JOIN sites s ON lws.site_id = s.id
WHERE lws.status = 'active'
AND lws.next_check_in_due_at < NOW()
ORDER BY lws.next_check_in_due_at ASC;
```

### Force-End Lone Worker Session
```sql
UPDATE lone_worker_sessions
SET status = 'ended', session_end = NOW()
WHERE id = '<session_id>'
AND status = 'active';
```