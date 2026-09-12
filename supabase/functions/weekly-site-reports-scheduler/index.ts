import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const startedAt = new Date().toISOString();
  let generatedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => null);
    const secret = Deno.env.get("WEEKLY_REPORT_SCHEDULER_SECRET");
    if (secret && (!body || body.secret !== secret)) {
      await logExecution(supabaseAdmin, startedAt, 0, 0, ["Forbidden: invalid secret"]);
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const now = new Date();
    const day = now.getDay();
    const diff = day === 1 ? 7 : (day === 0 ? 1 : day - 1);
    const prevMon = new Date(now);
    prevMon.setDate(prevMon.getDate() - diff);
    prevMon.setHours(0, 0, 0, 0);

    const prevSun = new Date(prevMon);
    prevSun.setDate(prevSun.getDate() + 6);
    prevSun.setHours(23, 59, 59, 999);

    const periodStart = prevMon.toISOString();
    const periodEnd = prevSun.toISOString();

    const { data: sites } = await supabaseAdmin
      .from("sites")
      .select("id, site_name, company_id, client_name");

    if (!sites || sites.length === 0) {
      await logExecution(supabaseAdmin, startedAt, 0, 0, ["No sites found"]);
      return new Response(JSON.stringify({ message: "No sites found", period: { start: periodStart, end: periodEnd } }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any[] = [];
    const failed: any[] = [];
    const funcUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-weekly-site-report`;

    for (const site of sites) {
      try {
        const { data: existingReport } = await supabaseAdmin
          .from("reports")
          .select("id")
          .eq("company_id", site.company_id)
          .eq("site_id", site.id)
          .eq("report_type", "weekly_site")
          .gte("period_start", periodStart)
          .lte("period_start", periodEnd)
          .maybeSingle();

        if (existingReport) {
          results.push({ site_id: site.id, site_name: site.site_name, status: "skipped", reason: "already exists" });
          continue;
        }

        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("company_id", site.company_id)
          .in("role", ["admin", "ops_manager"])
          .limit(1)
          .maybeSingle();

        if (!user) {
          failed.push({ site_id: site.id, site_name: site.site_name, reason: "No admin found" });
          failedCount++;
          continue;
        }

        const res = await fetch(funcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "X-User-Id": user.id,
          },
          body: JSON.stringify({
            site_id: site.id,
            period_start: periodStart,
            period_end: periodEnd,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          generatedCount++;
          results.push({ site_id: site.id, site_name: site.site_name, report_id: data.report_id });
        } else {
          const err = await res.json().catch(() => null);
          const reason = err?.error || res.statusText;
          failed.push({ site_id: site.id, site_name: site.site_name, reason });
          failedCount++;
          errors.push(`${site.site_name}: ${reason}`);
        }
      } catch (e: any) {
        failed.push({ site_id: site.id, site_name: site.site_name, reason: e.message });
        failedCount++;
        errors.push(`${site.site_name}: ${e.message}`);
      }
    }

    await logExecution(supabaseAdmin, startedAt, generatedCount, failedCount, errors);

    return new Response(
      JSON.stringify({
        period: { start: periodStart, end: periodEnd },
        generated: generatedCount,
        failed: failedCount,
        skipped: results.filter((r) => r.status === "skipped").length,
        results,
        failures: failed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await logExecution(supabaseAdmin, startedAt, generatedCount, failedCount, [err.message]);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

async function logExecution(
  supabase: any,
  startedAt: string,
  generated: number,
  failed: number,
  errors: string[],
) {
  try {
    const completedAt = new Date().toISOString();
    const status = errors.length === 0 ? "success" : failed > 0 && generated > 0 ? "partial" : "failed";

    await supabase.from("agent_execution_logs").insert({
      agent_type: "weekly_report_scheduler",
      status,
      started_at: startedAt,
      completed_at: completedAt,
      result: {
        generated,
        failed,
        errors: errors.slice(0, 10),
      },
    });
  } catch {
    // Silently fail - logging is best-effort
  }
}