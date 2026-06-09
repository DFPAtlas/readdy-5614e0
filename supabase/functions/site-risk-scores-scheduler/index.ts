import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Optional secret check
    const body = await req.json().catch(() => null);
    const secret = Deno.env.get("SITE_RISK_SCHEDULER_SECRET");
    if (secret && body && body.secret !== secret) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // Period: last 30 days
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 30);
    const periodStartStr = periodStart.toISOString();
    const periodEndStr = periodEnd.toISOString();

    // Get all active sites across all companies
    const { data: sites } = await supabase
      .from("sites")
      .select("id, site_name, company_id");

    if (!sites || sites.length === 0) {
      return new Response(JSON.stringify({ message: "No sites found" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any[] = [];
    const skipped: any[] = [];
    const failed: any[] = [];
    const funcUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-score-site-risk`;

    for (const site of sites) {
      // Check for any activity in period to avoid scoring empty data
      const { count: incCount } = await supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("site_id", site.id)
        .eq("company_id", site.company_id)
        .gte("occurred_at", periodStartStr)
        .lte("occurred_at", periodEndStr);

      const { count: patrolCount } = await supabase
        .from("patrol_logs")
        .select("id", { count: "exact", head: true })
        .eq("site_id", site.id)
        .eq("company_id", site.company_id)
        .gte("start_time", periodStartStr)
        .lte("start_time", periodEndStr);

      const { count: openShiftCount } = await supabase
        .from("shifts")
        .select("id", { count: "exact", head: true })
        .eq("site_id", site.id)
        .eq("company_id", site.company_id)
        .is("guard_id", null)
        .gte("start_time", periodStartStr)
        .lte("end_time", periodEndStr);

      const totalActivity = (incCount || 0) + (patrolCount || 0) + (openShiftCount || 0);
      if (totalActivity === 0) {
        skipped.push({ site_id: site.id, site_name: site.site_name, reason: "no_activity" });
        continue;
      }

      // Find an admin user for this company to get a valid auth token
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("company_id", site.company_id)
        .in("role", ["super_admin", "company_admin", "operations_manager"])
        .limit(1)
        .maybeSingle();

      if (!user) {
        skipped.push({ site_id: site.id, site_name: site.site_name, reason: "no_admin_user" });
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
          period_days: 30,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.skipped) {
          skipped.push({ site_id: site.id, site_name: site.site_name, reason: data.reason });
        } else {
          results.push({ site_id: site.id, site_name: site.site_name, score: data.score, level: data.level });
        }
      } else {
        const err = await res.json().catch(() => null);
        failed.push({ site_id: site.id, site_name: site.site_name, reason: err?.error || res.statusText });
      }
    }

    return new Response(
      JSON.stringify({
        period: { start: periodStartStr, end: periodEndStr },
        scored: results.length,
        skipped: skipped.length,
        failed: failed.length,
        results,
        skipped_sites: skipped,
        failures: failed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});