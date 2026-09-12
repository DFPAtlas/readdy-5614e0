
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShiftInfo {
  id: string;
  site_id: string;
  guard_id: string;
  start_time: string;
  end_time: string;
  status: string;
  company_id: string;
  site_name: string;
  guard_name: string;
  guard_user_id: string | null;
}

interface CheckpointInfo {
  id: string;
  site_id: string;
  name: string;
  checkpoint_code: string;
  is_active: boolean;
  patrol_frequency: string | null;
  patrol_time: string | null;
}

interface ScanRecord {
  checkpoint_id: string;
  scanned_at: string;
}

interface SiteCheckpointStatus {
  checkpoint_id: string;
  checkpoint_name: string;
  checkpoint_code: string;
  scanned: boolean;
  last_scanned_at: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => null);
    const secret = Deno.env.get("PATROL_MISSED_SCHEDULER_SECRET");
    if (secret && (!body || body.secret !== secret)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    const { data: activeShifts, error: shiftError } = await supabase
      .from("shifts")
      .select("id, site_id, guard_id, start_time, end_time, status, company_id")
      .lte("start_time", nowIso)
      .gte("end_time", nowIso)
      .in("status", ["confirmed", "active", "in_progress"])
      .not("guard_id", "is", null);

    if (shiftError || !activeShifts || activeShifts.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No active shifts with guards found",
          shifts_checked: 0,
          missed: 0,
          notifications_sent: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Also check shifts that ended in the last 45 minutes (final missed patrol sweep)
    const fortyFiveAgo = new Date(now.getTime() - 45 * 60 * 1000).toISOString();
    const { data: recentlyEndedShifts, error: recentError } = await supabase
      .from("shifts")
      .select("id, site_id, guard_id, start_time, end_time, status, company_id")
      .lt("end_time", nowIso)
      .gte("end_time", fortyFiveAgo)
      .in("status", ["confirmed", "active", "in_progress", "completed"])
      .not("guard_id", "is", null);

    const allCandidateShifts = [
      ...(activeShifts || []),
      ...(recentlyEndedShifts || []),
    ];

    // Deduplicate by shift id
    const uniqueShiftIds = new Set<string>();
    const uniqueShifts: typeof allCandidateShifts = [];
    for (const s of allCandidateShifts) {
      if (!uniqueShiftIds.has(s.id)) {
        uniqueShiftIds.add(s.id);
        uniqueShifts.push(s);
      }
    }

    // Enrich with site and guard names
    const siteIds = [...new Set(uniqueShifts.map((s) => s.site_id))];
    const guardIds = [...new Set(uniqueShifts.map((s) => s.guard_id))];

    const { data: sites } = await supabase
      .from("sites")
      .select("id, site_name")
      .in("id", siteIds);

    const { data: guards } = await supabase
      .from("guards")
      .select("id, user_id, first_name, last_name")
      .in("id", guardIds);

    const siteMap = new Map(sites?.map((s: any) => [s.id, s.site_name]) || []);
    const guardMap = new Map(
      (guards || []).map((g: any) => [
        g.id,
        { name: `${g.first_name || ""} ${g.last_name || ""}`.trim(), user_id: g.user_id },
      ]),
    );

    const enrichedShifts: ShiftInfo[] = uniqueShifts.map((s) => ({
      ...s,
      site_name: siteMap.get(s.site_id) || "Unknown Site",
      guard_name: guardMap.get(s.guard_id)?.name || "Unknown Guard",
      guard_user_id: guardMap.get(s.guard_id)?.user_id || null,
    }));

    // For each site, get active checkpoints
    const uniqueSiteIds = [...new Set(enrichedShifts.map((s) => s.site_id))];
    const { data: allCheckpoints } = await supabase
      .from("patrol_checkpoints")
      .select("id, site_id, name, checkpoint_code, is_active, patrol_frequency, patrol_time")
      .in("site_id", uniqueSiteIds)
      .eq("is_active", true);

    if (!allCheckpoints || allCheckpoints.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No active patrol checkpoints found for candidate sites",
          shifts_checked: enrichedShifts.length,
          missed: 0,
          notifications_sent: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const checkpointsBySite = new Map<string, CheckpointInfo[]>();
    for (const cp of allCheckpoints) {
      const list = checkpointsBySite.get(cp.site_id) || [];
      list.push(cp as CheckpointInfo);
      checkpointsBySite.set(cp.site_id, list);
    }

    let totalMissed = 0;
    let notificationsSent = 0;
    const details: any[] = [];

    for (const shift of enrichedShifts) {
      const siteCheckpoints = checkpointsBySite.get(shift.site_id);
      if (!siteCheckpoints || siteCheckpoints.length === 0) continue;

      const shiftStart = new Date(shift.start_time);
      const shiftEnd = new Date(shift.end_time);
      const minutesIntoShift = (now.getTime() - shiftStart.getTime()) / 60000;
      const shiftDuration = (shiftEnd.getTime() - shiftStart.getTime()) / 60000;

      // Only alert if at least 25% into shift for active shifts, or shift has ended
      const isActiveShift = new Date(shift.end_time) >= now;
      const isRecentlyEnded = !isActiveShift;

      if (isActiveShift && minutesIntoShift < shiftDuration * 0.25) {
        continue; // Too early to flag
      }

      // Get all scans during this shift window
      const { data: scans } = await supabase
        .from("patrol_scans")
        .select("checkpoint_id, scanned_at")
        .eq("site_id", shift.site_id)
        .gte("scanned_at", shift.start_time)
        .lte("scanned_at", shiftEnd.toISOString())
        .order("scanned_at", { ascending: false });

      const scanMap = new Map<string, ScanRecord[]>();
      for (const scan of scans || []) {
        const list = scanMap.get(scan.checkpoint_id) || [];
        list.push(scan as ScanRecord);
        scanMap.set(scan.checkpoint_id, list);
      }

      // Determine which checkpoints are unscanned
      const statuses: SiteCheckpointStatus[] = siteCheckpoints.map((cp) => {
        const cpScans = scanMap.get(cp.id);
        return {
          checkpoint_id: cp.id,
          checkpoint_name: cp.name,
          checkpoint_code: cp.checkpoint_code,
          scanned: cpScans && cpScans.length > 0,
          last_scanned_at: cpScans && cpScans.length > 0 ? cpScans[0].scanned_at : null,
        };
      });

      const missed = statuses.filter((s) => !s.scanned);
      if (missed.length === 0) continue;

      totalMissed += missed.length;

      // Update or create patrol_log for this shift
      const { data: existingLog } = await supabase
        .from("patrol_logs")
        .select("id")
        .eq("shift_id", shift.id)
        .maybeSingle();

      const checkpointsTotal = siteCheckpoints.length;
      const checkpointsCompleted = statuses.filter((s) => s.scanned).length;

      if (existingLog) {
        await supabase
          .from("patrol_logs")
          .update({
            checkpoints_total: checkpointsTotal,
            checkpoints_completed: checkpointsCompleted,
            status: checkpointsCompleted === 0 ? "missed" : checkpointsCompleted < checkpointsTotal ? "incomplete" : "completed",
            end_time: isRecentlyEnded ? shift.end_time : undefined,
          })
          .eq("id", existingLog.id);
      } else if (isActiveShift) {
        // Create patrol log if it doesn't exist yet
        await supabase.from("patrol_logs").insert({
          company_id: shift.company_id,
          site_id: shift.site_id,
          shift_id: shift.id,
          guard_id: shift.guard_id,
          start_time: shift.start_time,
          end_time: shift.end_time,
          status: checkpointsCompleted === 0 ? "missed" : "incomplete",
          checkpoints_total: checkpointsTotal,
          checkpoints_completed: checkpointsCompleted,
        });
      }

      // Create notifications for company admins
      const { data: adminUsers } = await supabase
        .from("users")
        .select("id")
        .eq("company_id", shift.company_id)
        .in("role", ["company_admin", "operations_manager"]);

      if (!adminUsers || adminUsers.length === 0) continue;

      for (const missedCp of missed) {
        // Dedup: check if notification already sent for this checkpoint+shift in last 4 hours
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
        const { data: existingNotif } = await supabase
          .from("notifications")
          .select("id")
          .eq("company_id", shift.company_id)
          .eq("type", "patrol_missed")
          .eq("related_id", missedCp.checkpoint_id)
          .gte("created_at", fourHoursAgo)
          .maybeSingle();

        if (existingNotif) continue;

        const severity = isRecentlyEnded ? "critical" : "warning";
        const title = isRecentlyEnded
          ? `Missed patrol: ${missedCp.checkpoint_name}`
          : `Overdue patrol: ${missedCp.checkpoint_name}`;
        const body = isRecentlyEnded
          ? `${missedCp.checkpoint_name} was not scanned during ${shift.guard_name}'s shift at ${shift.site_name}.`
          : `${missedCp.checkpoint_name} has not been scanned. ${shift.guard_name} is on shift at ${shift.site_name} (ends ${shiftEnd.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}).`;

        for (const admin of adminUsers) {
          const { error: notifError } = await supabase.from("notifications").insert({
            company_id: shift.company_id,
            user_id: admin.id,
            type: "patrol_missed",
            title,
            body,
            severity,
            link: `/dashboard/patrol-monitoring?site=${shift.site_id}`,
            related_id: missedCp.checkpoint_id,
            related_type: "patrol_checkpoint",
          });

          if (!notifError) {
            notificationsSent++;
          }
        }

        details.push({
          shift_id: shift.id,
          site: shift.site_name,
          guard: shift.guard_name,
          checkpoint: missedCp.checkpoint_name,
          status: isRecentlyEnded ? "missed" : "overdue",
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Patrol missed check complete",
        timestamp: nowIso,
        shifts_checked: enrichedShifts.length,
        sites_with_checkpoints: uniqueSiteIds.length,
        checkpoints_checked: allCheckpoints.length,
        total_missed: totalMissed,
        notifications_sent: notificationsSent,
        details,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders },
    );
  }
});
