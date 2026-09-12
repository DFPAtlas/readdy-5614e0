-- Phase 14 Data Integrity Checks
-- Read-only diagnostics. Run in the Supabase SQL Editor.

-- Orphaned shifts (site missing)
SELECT count(*) AS orphaned_shifts
FROM public.shifts s
LEFT JOIN public.sites site ON site.id = s.site_id
WHERE s.site_id IS NOT NULL AND site.id IS NULL;
-- EXPECT: 0

-- Assignments without valid guards
SELECT count(*) AS orphaned_assignments
FROM public.guard_site_assignments a
LEFT JOIN public.guards g ON g.id = a.guard_id
WHERE g.id IS NULL;
-- EXPECT: 0

-- Attendance without valid shifts
SELECT count(*) AS orphaned_attendance
FROM public.attendance_logs a
LEFT JOIN public.shifts s ON s.id = a.shift_id
WHERE a.shift_id IS NOT NULL AND s.id IS NULL;
-- EXPECT: 0

-- Duplicate webhook events (by Stripe event id)
SELECT stripe_event_id, count(*)
FROM public.billing_webhook_events
GROUP BY stripe_event_id
HAVING count(*) > 1;
-- EXPECT: 0 rows

-- Incidents with evidence count but no evidence file link
SELECT count(*) AS missing_evidence_refs
FROM public.incidents i
WHERE i.linked_evidence_count > 0
  AND NOT EXISTS (SELECT 1 FROM public.evidence_files e WHERE e.incident_id = i.id);
-- EXPECT: 0 (review — evidence may live in incident_media instead)

-- Stuck automation events (retried to max but not dead-lettered)
SELECT count(*) AS stuck_automation
FROM public.agent_webhook_events
WHERE processed = false AND retry_count >= 5 AND status IS DISTINCT FROM 'dead_letter';
-- EXPECT: 0

-- Failed notification jobs missing an error record
SELECT count(*) AS failed_notifications_missing_error
FROM public.notification_jobs
WHERE status = 'failed' AND (error IS NULL OR error = '');
-- EXPECT: 0

-- Support access sessions past expiry but still active
SELECT count(*) AS expired_support_access
FROM public.support_access_logs
WHERE status = 'active' AND expires_at < now();
-- EXPECT: 0

-- Active legal holds (must never be auto-deleted by retention)
SELECT id, company_id, hold_reason, applied_at
FROM public.legal_holds
WHERE released_at IS NULL
ORDER BY applied_at;
-- EXPECT: review only — tenants listed are exempt from retention deletion