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

    const body = await req.json().catch(() => null);
    const secret = Deno.env.get("WEEKLY_REPORT_SCHEDULER_SECRET");
    if (secret && body && body.secret !== secret) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // Previous week: Monday 00:00 to Sunday 23:59
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

    const { data: sites } = await supabase
      .from("sites")
      .select("id, site_name, company_id, client_name");

    if (!sites || sites.length === 0) {
      return new Response(JSON.stringify({ message: "No sites found" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any[] = [];
    const failed: any[] = [];
    const funcUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-weekly-site-report`;

    for (const site of sites) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("company_id", site.company_id)
        .in("role", ["admin", "ops_manager"])
        .limit(1)
        .maybeSingle();

      if (!user) {
        failed.push({ site_id: site.id, reason: "No admin found" });
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
        results.push({ site_id: site.id, site_name: site.site_name, report_id: data.report_id });
      } else {
        const err = await res.json().catch(() => null);
        failed.push({ site_id: site.id, reason: err?.error || res.statusText });
      }
    }

    return new Response(
      JSON.stringify({
        period: { start: periodStart, end: periodEnd },
        generated: results.length,
        failed: failed.length,
        results,
        failures: failed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
