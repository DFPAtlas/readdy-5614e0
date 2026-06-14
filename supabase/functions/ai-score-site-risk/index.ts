import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: userProfile } = await supabase.from("users").select("company_id, role").eq("id", user.id).maybeSingle();
    const companyId = userProfile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { site_id, period_days = 30 } = body;
    if (!site_id || !isValidUUID(site_id)) {
      return new Response(JSON.stringify({ error: "site_id required" }), { status: 400, headers: corsHeaders });
    }

    const { data: site } = await supabase
      .from("sites")
      .select("id, site_name, risk_level, required_skills, company_id")
      .eq("id", site_id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (!site) {
      return new Response(JSON.stringify({ error: "Site not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - period_days);
    const periodStartStr = periodStart.toISOString();
    const periodEndStr = periodEnd.toISOString();
    const prevPeriodStart = new Date(periodStart);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - period_days);

    const { data: incidentsCurrent } = await supabase
      .from("incidents")
      .select("severity, incident_type, status, occurred_at, response_time_minutes")
      .eq("site_id", site_id)
      .eq("company_id", companyId)
      .gte("occurred_at", periodStartStr)
      .lte("occurred_at", periodEndStr);

    const { data: incidentsPrev } = await supabase
      .from("incidents")
      .select("severity")
      .eq("site_id", site_id)
      .eq("company_id", companyId)
      .gte("occurred_at", prevPeriodStart.toISOString())
      .lt("occurred_at", periodStartStr);

    const currentCount = incidentsCurrent?.length || 0;
    const prevCount = incidentsPrev?.length || 0;
    const severityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    const typeDistribution: Record<string, number> = {};
    const hourDistribution: Record<number, number> = {};
    const dayDistribution: Record<number, number> = {};
    const openIncidents: any[] = [];
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    for (const inc of (incidentsCurrent || [])) {
      if (inc.severity) severityCounts[inc.severity as keyof typeof severityCounts] = (severityCounts[inc.severity as keyof typeof severityCounts] || 0) + 1;
      if (inc.incident_type) typeDistribution[inc.incident_type] = (typeDistribution[inc.incident_type] || 0) + 1;
      if (inc.occurred_at) {
        const d = new Date(inc.occurred_at);
        const hour = d.getHours();
        const day = d.getDay();
        hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
        dayDistribution[day] = (dayDistribution[day] || 0) + 1;
      }
      if (inc.status === "open") {
        const ageDays = inc.occurred_at ? Math.floor((Date.now() - new Date(inc.occurred_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        openIncidents.push({ age_days: ageDays });
      }
      if (inc.response_time_minutes) {
        totalResponseTime += inc.response_time_minutes;
        responseTimeCount++;
      }
    }

    const avgResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : null;

    const { data: patrolLogs } = await supabase
      .from("patrol_logs")
      .select("status, start_time")
      .eq("site_id", site_id)
      .eq("company_id", companyId)
      .gte("start_time", periodStartStr)
      .lte("start_time", periodEndStr);

    const patrolsTotal = patrolLogs?.length || 0;
    const patrolsCompleted = patrolLogs?.filter((p: any) => p.status === "completed").length || 0;
    const patrolCompletionRate = patrolsTotal > 0 ? Math.round((patrolsCompleted / patrolsTotal) * 100) : null;

    const { data: openShifts } = await supabase
      .from("shifts")
      .select("id, start_time, end_time, guard_id")
      .eq("site_id", site_id)
      .eq("company_id", companyId)
      .is("guard_id", null)
      .lte("end_time", periodEndStr)
      .gte("start_time", periodStartStr);

    const staffingGapCount = openShifts?.length || 0;

    const { data: assignedGuards } = await supabase
      .from("shifts")
      .select("guard_id")
      .eq("site_id", site_id)
      .eq("company_id", companyId)
      .not("guard_id", "is", null)
      .gte("start_time", periodStartStr);

    const guardIds = [...new Set((assignedGuards || []).map((s: any) => s.guard_id).filter(Boolean))];
    let siaExpiriesImminent = 0;
    if (guardIds.length > 0) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const { data: guards } = await supabase
        .from("guards")
        .select("sia_expiry")
        .in("id", guardIds)
        .eq("company_id", companyId)
        .lte("sia_expiry", thirtyDaysFromNow.toISOString());
      siaExpiriesImminent = guards?.length || 0;
    }

    if (currentCount === 0 && patrolsTotal === 0 && staffingGapCount === 0 && openIncidents.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_activity" }), { status: 200, headers: corsHeaders });
    }

    const signals = {
      site_name: site.site_name,
      stated_risk_level: site.risk_level,
      period_days,
      period_start: periodStartStr,
      period_end: periodEndStr,
      incident_volume: {
        current_period_count: currentCount,
        previous_period_count: prevCount,
        trend: currentCount > prevCount ? "increasing" : currentCount < prevCount ? "decreasing" : "stable",
        severity_breakdown: severityCounts,
        open_incidents_count: openIncidents.length,
        oldest_open_incident_days: openIncidents.length > 0 ? Math.max(...openIncidents.map((i) => i.age_days)) : 0,
      },
      incident_types: typeDistribution,
      temporal_patterns: {
        hour_distribution: hourDistribution,
        day_distribution: dayDistribution,
      },
      operational_health: {
        patrol_completion_rate: patrolCompletionRate,
        patrols_scheduled: patrolsTotal,
        average_response_time_minutes: avgResponseTime,
      },
      staffing: {
        unfilled_shifts_in_period: staffingGapCount,
        guards_with_sia_expiring_soon: siaExpiriesImminent,
      },
    };

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OpenAI not configured" }), { status: 500, headers: corsHeaders });
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a UK security risk analyst. You will receive operational data about a single site over a recent period. Produce a risk assessment.

Output JSON only:
{
  score: 0-100,
  level: 'low'|'medium'|'high'|'critical',
  factors: {
    incident_volume: { value: number, weight: 0-1, note: string },
    incident_severity: { value: number, weight: 0-1, note: string },
    pattern_concerns: { value: number, weight: 0-1, note: string },
    operational_health: { value: number, weight: 0-1, note: string },
    staffing_gaps: { value: number, weight: 0-1, note: string }
  },
  narrative: 'A 2-3 sentence explanation in plain English suitable for an ops manager to read.',
  recommendations: [
    'Specific actionable suggestions, max 5, each one short.'
  ]
}

Scoring guidance:
- 0-25 = low: routine activity, no patterns of concern
- 26-50 = medium: some concerns but manageable
- 51-75 = high: clear patterns or trends needing attention
- 76-100 = critical: urgent intervention required

Rules:
- Base every claim on the data given.
- Do NOT invent incidents or trends not in the data.
- If data is sparse (new site, few incidents), default to medium and note the limitation.
- British English. Calm, factual tone — never alarmist.`,
          },
          {
            role: "user",
            content: `Analyse this site for the last ${period_days} days:\n\n${JSON.stringify(signals, null, 2)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    const openaiData = await resp.json();
    const rawContent = openaiData.choices?.[0]?.message?.content?.trim() || "";
    if (!rawContent) {
      return new Response(JSON.stringify({ error: "OpenAI returned empty response" }), { status: 500, headers: corsHeaders });
    }

    let assessment: any;
    try {
      assessment = JSON.parse(rawContent);
    } catch {
      return new Response(JSON.stringify({ error: "OpenAI returned invalid JSON" }), { status: 500, headers: corsHeaders });
    }

    const score = typeof assessment.score === "number" ? Math.max(0, Math.min(100, Math.round(assessment.score))) : 50;
    let level = assessment.level || "medium";
    if (!["low", "medium", "high", "critical"].includes(level)) {
      level = score <= 25 ? "low" : score <= 50 ? "medium" : score <= 75 ? "high" : "critical";
    }
    const expectedLevel = score <= 25 ? "low" : score <= 50 ? "medium" : score <= 75 ? "high" : "critical";
    if (level !== expectedLevel) level = expectedLevel;

    const recommendations = Array.isArray(assessment.recommendations)
      ? assessment.recommendations.slice(0, 5).map((r: any) => String(r))
      : [];

    const factors = assessment.factors || {};
    const validFactors: any = {};
    for (const key of ["incident_volume", "incident_severity", "pattern_concerns", "operational_health", "staffing_gaps"]) {
      const f = factors[key];
      if (f && typeof f.value === "number" && typeof f.weight === "number") {
        validFactors[key] = {
          value: Math.max(0, Math.min(1, f.value)),
          weight: Math.max(0, Math.min(1, f.weight)),
          note: String(f.note || "").slice(0, 200),
        };
      } else {
        validFactors[key] = { value: 0.5, weight: 0.2, note: "No data available" };
      }
    }

    const { data: saved, error: saveErr } = await supabase
      .from("site_risk_scores")
      .insert({
        company_id: companyId,
        site_id: site_id,
        score,
        level,
        factors: validFactors,
        ai_narrative: String(assessment.narrative || "").slice(0, 500),
        recommendations,
        period_start: periodStartStr,
        period_end: periodEndStr,
      })
      .select("id")
      .single();

    if (saveErr) {
      return new Response(JSON.stringify({ error: saveErr.message }), { status: 500, headers: corsHeaders });
    }

    if (site.risk_level !== level) {
      await supabase.from("sites").update({ risk_level: level }).eq("id", site_id).eq("company_id", companyId);
    }

    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "site_risk_score",
      details: { site_id, score, level, period_days, factors: validFactors, site_risk_score_id: saved?.id },
    });

    return new Response(
      JSON.stringify({ id: saved?.id, score, level, factors: validFactors, narrative: assessment.narrative, recommendations }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
