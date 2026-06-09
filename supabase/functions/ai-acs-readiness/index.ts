import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id } = await req.json();
    if (!company_id) {
      return new Response(JSON.stringify({ error: "Missing company_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: evidence } = await supabase.from("acs_evidence").select("*").eq("company_id", company_id);
    const { data: staff } = await supabase.from("acs_staff_compliance").select("*").eq("company_id", company_id);
    const { data: policies } = await supabase.from("acs_policies").select("*").eq("company_id", company_id);
    const { data: criteria } = await supabase.from("acs_criteria").select("*").eq("company_id", company_id);
    const { data: actions } = await supabase.from("acs_corrective_actions").select("*").eq("company_id", company_id);
    const { data: sites } = await supabase.from("acs_site_compliance").select("*").eq("company_id", company_id);

    const expiredEvidence = (evidence || []).filter((e: any) => e.expiry_date && e.expiry_date < now);
    const expiringEvidence = (evidence || []).filter((e: any) => e.expiry_date && e.expiry_date >= now && e.expiry_date <= thirtyDays);
    const expiredStaff = (staff || []).filter((s: any) => (s.sia_expiry && s.sia_expiry < now) || (s.right_to_work_expiry && s.right_to_work_expiry < now));
    const missingCriteria = (criteria || []).filter((c: any) => c.status !== "ready" && c.status !== "complete");
    const overdueActions = (actions || []).filter((a: any) => a.status === "open" && a.due_date && a.due_date < now);

    const totalChecks =
      (evidence || []).length +
      (staff || []).length +
      (policies || []).length +
      (criteria || []).length +
      (sites || []).length;

    const passedChecks =
      (evidence || []).filter((e: any) => e.status === "current" && (!e.expiry_date || e.expiry_date >= now)).length +
      (staff || []).filter((s: any) => s.status === "compliant").length +
      (policies || []).filter((p: any) => p.status === "approved").length +
      (criteria || []).filter((c: any) => c.status === "ready" || c.status === "complete").length +
      (sites || []).filter((s: any) => s.status === "compliant").length;

    const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    const areas = [
      {
        name: "Evidence Library",
        score: (evidence || []).length > 0 ? Math.round((((evidence || []).length - expiredEvidence.length - expiringEvidence.length) / (evidence || []).length) * 100) : 0,
        issues: [
          ...(expiredEvidence.length > 0 ? [`${expiredEvidence.length} expired documents`] : []),
          ...(expiringEvidence.length > 0 ? [`${expiringEvidence.length} documents expiring soon`] : []),
        ],
        recommendations: [
          expiredEvidence.length > 0 ? "Renew expired evidence immediately" : "",
          expiringEvidence.length > 0 ? "Schedule renewals for documents expiring within 30 days" : "",
        ].filter(Boolean),
      },
      {
        name: "Staff Compliance",
        score: (staff || []).length > 0 ? Math.round((((staff || []).length - expiredStaff.length) / (staff || []).length) * 100) : 0,
        issues: expiredStaff.map((s: any) => `${s.staff_name}: expired ${s.sia_expiry && s.sia_expiry < now ? "SIA licence" : "RTW check"}`),
        recommendations: [
          expiredStaff.length > 0 ? "Contact staff with expired documents and arrange renewals" : "",
          "Schedule annual vetting reviews for all active staff",
        ].filter(Boolean),
      },
      {
        name: "Site Compliance",
        score: (sites || []).length > 0 ? Math.round(((sites || []).filter((s: any) => s.status === "compliant").length / (sites || []).length) * 100) : 0,
        issues: (sites || [])
          .filter((s: any) => !s.assignment_instructions_url || (s.assignment_instructions_expiry && s.assignment_instructions_expiry < now))
          .map(() => "Site missing or expired assignment instructions"),
        recommendations: [
          "Ensure all sites have current assignment instructions",
          "Complete risk assessments for every active site",
        ],
      },
      {
        name: "Policies",
        score: (policies || []).length > 0 ? Math.round(((policies || []).filter((p: any) => p.status === "approved").length / (policies || []).length) * 100) : 0,
        issues: (policies || []).filter((p: any) => p.status !== "approved").map((p: any) => `Policy "${p.title}" is ${p.status}`),
        recommendations: [
          (policies || []).filter((p: any) => p.status === "draft").length > 0 ? "Approve draft policies before assessment" : "",
          "Ensure all staff have acknowledged key policies",
        ].filter(Boolean),
      },
      {
        name: "ACS Criteria",
        score: (criteria || []).length > 0 ? Math.round(((criteria || []).filter((c: any) => c.status === "ready" || c.status === "complete").length / (criteria || []).length) * 100) : 0,
        issues: missingCriteria.slice(0, 5).map((c: any) => `${c.criterion_code}: ${c.criterion_title}`),
        recommendations: [
          missingCriteria.length > 0 ? `Update ${missingCriteria.length} criteria to Ready status` : "",
          "Link evidence to each criterion where possible",
        ].filter(Boolean),
      },
    ];

    const report = {
      overall_score: overallScore,
      status: overallScore >= 85 ? "green" : overallScore >= 60 ? "amber" : "red",
      summary: `Your ACS readiness is at ${overallScore}%. ${overdueActions.length} corrective actions are open, ${missingCriteria.length} criteria need attention, and ${expiredEvidence.length + expiredStaff.length} documents or licences have expired.`,
      areas,
      urgent_actions: [
        ...(overdueActions.length > 0 ? [`${overdueActions.length} overdue corrective actions require immediate attention`] : []),
        ...(expiredEvidence.length > 0 ? [`${expiredEvidence.length} evidence documents have expired`] : []),
        ...(expiredStaff.length > 0 ? [`${expiredStaff.length} staff members have expired compliance records`] : []),
        ...(missingCriteria.length > 0 ? [`${missingCriteria.length} ACS criteria are not ready`] : []),
      ],
      expired_items: [
        ...expiredEvidence.map((e: any) => ({ type: "Evidence", name: e.title, expiry: e.expiry_date })),
        ...expiredStaff.map((s: any) => ({
          type: "Staff",
          name: s.staff_name,
          expiry: s.sia_expiry && s.sia_expiry < now ? s.sia_expiry : s.right_to_work_expiry,
        })),
      ],
      missing_evidence: missingCriteria.slice(0, 10).map((c: any) => ({
        area: c.acs_area,
        criterion: c.criterion_code,
        description: c.criterion_title,
      })),
    };

    if (OPENAI_API_KEY) {
      try {
        const prompt = `You are an SIA ACS compliance expert. Review this security company's ACS readiness data and provide a concise professional assessment in 2-3 paragraphs. Overall score: ${overallScore}%. Areas: ${areas.map((a) => `${a.name}: ${a.score}%`).join(", ")}. Urgent issues: ${report.urgent_actions.join("; ") || "None"}.`;
        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: "You are an SIA Approved Contractor Scheme compliance assessor." }, { role: "user", content: prompt }], temperature: 0.3 }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          report.summary = aiData.choices?.[0]?.message?.content || report.summary;
        }
      } catch {
        // AI fallback to local summary
      }
    }

    return new Response(JSON.stringify({ report }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
