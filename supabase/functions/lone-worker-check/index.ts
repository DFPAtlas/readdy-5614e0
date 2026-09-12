import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActiveSession {
  id: string;
  company_id: string;
  guard_id: string;
  site_id: string | null;
  shift_id: string | null;
  check_in_interval_minutes: number;
  status: string;
  last_check_in_at: string | null;
  next_check_in_due_at: string | null;
  missed_check_ins: number;
  escalation_level: number;
  alarm_triggered_at: string | null;
  alarm_acknowledged_at: string | null;
  guard_name: string;
  site_name: string;
}

const WARNING_MINUTES = 15;
const OVERDUE_MINUTES = 30;
const CRITICAL_MINUTES = 60;

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
    const secret = Deno.env.get("LONE_WORKER_SCHEDULER_SECRET");
    if (secret && (!body || body.secret !== secret)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    const { data: activeSessions, error: sessionError } = await supabase
      .from("lone_worker_sessions")
      .select(`
        id, company_id, guard_id, site_id, shift_id,
        check_in_interval_minutes, status, last_check_in_at,
        next_check_in_due_at, missed_check_ins, escalation_level,
        alarm_triggered_at, alarm_acknowledged_at
      `)
      .eq("status", "active")
      .not("next_check_in_due_at", "is", null);

    if (sessionError || !activeSessions || activeSessions.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No active lone worker sessions to check",
          sessions_checked: 0,
          warnings: 0,
          overdue: 0,
          critical: 0,
          notifications_sent: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const guardIds = [...new Set(activeSessions.map((s: any) => s.guard_id))];
    const siteIds = [...new Set(activeSessions.map((s: any) => s.site_id).filter(Boolean))];

    const { data: guards } = await supabase
      .from("guards")
      .select("id, first_name, last_name")
      .in("id", guardIds);

    const { data: sites } = await supabase
      .from("sites")
      .select("id, site_name")
      .in("id", siteIds);

    const guardMap = new Map((guards || []).map((g: any) => [g.id, `${g.first_name || ""} ${g.last_name || ""}`.trim()]));
    const siteMap = new Map((sites || []).map((s: any) => [s.id, s.site_name]));

    const enrichedSessions: ActiveSession[] = activeSessions.map((s: any) => ({
      ...s,
      guard_name: guardMap.get(s.guard_id) || "Unknown Guard",
      site_name: siteMap.get(s.site_id) || "Unknown Site",
    }));

    let warnings = 0;
    let overdue = 0;
    let critical = 0;
    let notificationsSent = 0;
    const details: any[] = [];

    for (const session of enrichedSessions) {
      if (!session.next_check_in_due_at) continue;

      const dueTime = new Date(session.next_check_in_due_at);
      const minutesPastDue = Math.floor((now.getTime() - dueTime.getTime()) / 60000);

      if (minutesPastDue <= 0) continue;

      const sessionMissed = (session.missed_check_ins || 0) + 1;
      let newEscalationLevel = session.escalation_level || 0;
      let newAlarmTriggered = session.alarm_triggered_at;
      let notificationType = "";
      let notificationTitle = "";
      let notificationBody = "";
      let notificationSeverity = "";

      if (minutesPastDue >= CRITICAL_MINUTES) {
        critical++;
        newEscalationLevel = Math.max(newEscalationLevel, 3);
        if (!session.alarm_triggered_at) {
          newAlarmTriggered = nowIso;
        }
        notificationType = "lone_worker_critical";
        notificationTitle = `CRITICAL: ${session.guard_name} — lost contact`;
        notificationBody = `${session.guard_name} at ${session.site_name} has not checked in for ${minutesPastDue} minutes. ${sessionMissed} missed check-ins. Immediate response required.`;
        notificationSeverity = "critical";
      } else if (minutesPastDue >= OVERDUE_MINUTES) {
        overdue++;
        newEscalationLevel = Math.max(newEscalationLevel, 2);
        notificationType = "lone_worker_overdue";
        notificationTitle = `${session.guard_name} — overdue check-in`;
        notificationBody = `${session.guard_name} at ${session.site_name} is ${minutesPastDue} minutes past due. ${sessionMissed} missed check-ins. Supervisor attention needed.`;
        notificationSeverity = "high";
      } else if (minutesPastDue >= WARNING_MINUTES) {
        warnings++;
        newEscalationLevel = Math.max(newEscalationLevel, 1);
        notificationType = "lone_worker_warning";
        notificationTitle = `${session.guard_name} — check-in warning`;
        notificationBody = `${session.guard_name} at ${session.site_name} is ${minutesPastDue} minutes late for check-in.`;
        notificationSeverity = "warning";
      }

      await supabase
        .from("lone_worker_sessions")
        .update({
          missed_check_ins: sessionMissed,
          escalation_level: newEscalationLevel,
          alarm_triggered_at: newAlarmTriggered || undefined,
        })
        .eq("id", session.id);

      const { data: adminUsers } = await supabase
        .from("users")
        .select("id")
        .eq("company_id", session.company_id)
        .in("role", ["company_admin", "operations_manager"]);

      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          const { error: notifError } = await supabase.from("notifications").insert({
            company_id: session.company_id,
            user_id: admin.id,
            type: notificationType,
            title: notificationTitle,
            body: notificationBody,
            severity: notificationSeverity,
            link: `/dashboard/guard-welfare`,
            related_id: session.id,
            related_type: "lone_worker_session",
          });

          if (!notifError) notificationsSent++;
        }
      }

      details.push({
        session_id: session.id,
        guard: session.guard_name,
        site: session.site_name,
        minutes_past_due: minutesPastDue,
        missed_check_ins: sessionMissed,
        escalation_level: newEscalationLevel,
        alarm_triggered: !!newAlarmTriggered,
      });
    }

    await supabase.from("agent_execution_logs").insert({
      agent_key: "lone_worker_check",
      client_id: null,
      status: "success",
      details: {
        sessions_checked: enrichedSessions.length,
        warnings,
        overdue,
        critical,
        notifications_sent: notificationsSent,
        timestamp: nowIso,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Lone worker check complete",
        timestamp: nowIso,
        sessions_checked: enrichedSessions.length,
        warnings,
        overdue,
        critical,
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