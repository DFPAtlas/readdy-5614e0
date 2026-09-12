
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin === o);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase
      .from("users").select("company_id, role, status").eq("id", user.id).maybeSingle();

    if (!profile || profile.status !== "active") {
      return new Response(JSON.stringify({ error: "Account is not active" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let body: any = {};
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const companyId = body.company_id || profile.company_id;

    if (profile.role !== "super_admin" && companyId !== profile.company_id) {
      return new Response(JSON.stringify({ error: "You can only audit your own company" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (!companyId) {
      return new Response(JSON.stringify({ error: "Missing company_id" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    await supabase.from("admin_activity_log").insert({
      user_id: user.id,
      company_id: companyId,
      action: "acs_audit_run",
      target_type: "acs_audit",
      target_id: null,
      details: { outcome: "started", requested_by: user.id },
    });

    const now = new Date().toISOString();
    const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString();

    const [evidence, staff, policies, criteria, actions, sites, guardCerts, guardVetting, guards, complianceDocs] = await Promise.all([
      supabase.from("acs_evidence").select("*").eq("company_id", companyId),
      supabase.from("acs_staff_compliance").select("*").eq("company_id", companyId),
      supabase.from("acs_policies").select("*").eq("company_id", companyId),
      supabase.from("acs_criteria").select("*").eq("company_id", companyId),
      supabase.from("acs_corrective_actions").select("*").eq("company_id", companyId),
      supabase.from("acs_site_compliance").select("*").eq("company_id", companyId),
      supabase.from("guard_certifications").select("*").eq("company_id", companyId),
      supabase.from("guard_vetting_records").select("*").eq("company_id", companyId),
      supabase.from("guards").select("id, first_name, last_name, sia_licence, sia_expiry, emergency_contact_name").eq("company_id", companyId),
      supabase.from("compliance_documents").select("*").eq("company_id", companyId),
    ]);

    const allEvidence = evidence.data || [];
    const allStaff = staff.data || [];
    const allPolicies = policies.data || [];
    const allCriteria = criteria.data || [];
    const allSites = sites.data || [];
    const allCerts = guardCerts.data || [];
    const allVetting = guardVetting.data || [];
    const allGuards = guards.data || [];
    const allDocs = complianceDocs.data || [];

    const findings: { category: string; subcategory: string; finding: string; severity: string }[] = [];

    allEvidence.filter((e: any) => e.expiry_date && e.expiry_date < now).forEach((e: any) => {
      findings.push({ category: "Evidence", subcategory: "Expired", finding: `Expired: ${e.title}`, severity: "critical" });
    });

    allStaff.forEach((s: any) => {
      if (s.sia_expiry && s.sia_expiry < now) findings.push({ category: "Personnel", subcategory: "SIA Licence", finding: `${s.staff_name}: SIA licence expired`, severity: "critical" });
    });

    allGuards.forEach((g: any) => {
      const vet = allVetting.find((v: any) => v.guard_id === g.id);
      if (!vet || vet.vetting_status !== "complete") findings.push({ category: "Personnel", subcategory: "BS7858", finding: `${g.first_name || ""} ${g.last_name || ""}: BS7858 screening incomplete`, severity: "high" });
    });

    allPolicies.filter((p: any) => p.review_date && p.review_date < now).forEach((p: any) => {
      findings.push({ category: "Policies", subcategory: "Review Overdue", finding: `Policy "${p.title}": review overdue`, severity: "high" });
    });

    allCriteria.filter((c: any) => c.status !== "ready" && c.status !== "complete").forEach((c: any) => {
      findings.push({ category: "ACS Criteria", subcategory: "Not Ready", finding: `${c.criterion_code}: ${c.criterion_title}`, severity: "high" });
    });

    allSites.forEach((s: any) => {
      if (!s.assignment_instructions_url) findings.push({ category: "Site", subcategory: "Assignment Instructions", finding: `Site missing assignment instructions`, severity: "critical" });
      if (!s.risk_assessment_url) findings.push({ category: "Site", subcategory: "Risk Assessment", finding: `Site missing risk assessment`, severity: "critical" });
    });

    const totalChecks = allEvidence.length + allStaff.length + allPolicies.length + allCriteria.length + allSites.length + allCerts.length + allGuards.length;
    const passedChecks = allEvidence.filter((e: any) => !e.expiry_date || e.expiry_date >= now).length + allStaff.filter((s: any) => s.status === "compliant").length + allPolicies.filter((p: any) => p.status === "approved").length + allCriteria.filter((c: any) => c.status === "ready" || c.status === "complete").length + allSites.filter((s: any) => s.status === "compliant").length + allCerts.filter((c: any) => !c.expiry_date || c.expiry_date >= now).length;
    const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
    const criticalCount = findings.filter((f) => f.severity === "critical").length;

    return new Response(JSON.stringify({
      overall_score: overallScore,
      status: overallScore >= 85 ? "green" : overallScore >= 60 ? "amber" : "red",
      critical_count: criticalCount,
      total_findings: findings.length,
      findings: findings.slice(0, 50),
      priority_list: findings.filter((f) => f.severity === "critical").slice(0, 5).map((f) => f.finding),
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "An error occurred during the ACS audit" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
