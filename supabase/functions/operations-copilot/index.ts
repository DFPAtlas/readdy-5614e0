
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function detectQueryType(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("site") && (q.includes("attention") || q.includes("need") || q.includes("problem"))) return "sites_needing_attention";
  if (q.includes("late") || q.includes("missed check")) return "late_guards";
  if (q.includes("missed patrol") || q.includes("patrol")) return "missed_patrols";
  if (q.includes("handover") || q.includes("shift summary")) return "shift_handover";
  if (q.includes("incident") && (q.includes("open") || q.includes("summary"))) return "open_incidents";
  if (q.includes("document") && q.includes("expir")) return "expiring_docs";
  if (q.includes("client") && (q.includes("issue") || q.includes("problem"))) return "client_issues";
  if (q.includes("client update") || q.includes("summary")) return "client_summary";
  if (q.includes("who") && q.includes("duty")) return "guards_on_duty";
  if (q.includes("risk")) return "risk_summary";
  if (q.includes("staffing") || q.includes("shortage")) return "staffing_alerts";
  if (q.includes("welfare") || q.includes("check")) return "welfare_check";
  return "general";
}

async function fetchDataForQuery(type: string, companyId: string, userId: string, role: string, supabase: ReturnType<typeof createClient>) {
  const isSuperAdmin = role === "super_admin";
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  switch (type) {
    case "sites_needing_attention": {
      const { data: sites } = await supabase.from("sites").select("id, site_name, risk_level, check_call_interval, patrol_enabled").eq("company_id", companyId);
      const { data: alerts } = await supabase.from("ai_activity_logs").select("action_type, details, created_at").eq("company_id", companyId).gte("created_at", yesterday).order("created_at", { ascending: false }).limit(10);
      return {
        sites: sites || [],
        alerts: alerts || [],
        highRisk: (sites || []).filter((s: any) => s.risk_level === "high").length,
      };
    }
    case "late_guards": {
      const { data: shifts } = await supabase.from("shifts").select("*, guard:guards(first_name, last_name)").eq("company_id", companyId).gte("shift_start", today).in("status", ["late", "critical_late"]);
      return { lateShifts: shifts || [] };
    }
    case "missed_patrols": {
      const { data: patrols } = await supabase.from("patrol_logs").select("*, site:sites(site_name)").eq("company_id", companyId).gte("created_at", yesterday).eq("status", "missed").order("created_at", { ascending: false }).limit(10);
      return { missedPatrols: patrols || [] };
    }
    case "open_incidents": {
      const { data: incidents } = await supabase.from("incidents").select("id, title, severity, status, site_id, site:sites(site_name), created_at").eq("company_id", companyId).eq("status", "open").order("created_at", { ascending: false }).limit(10);
      return { incidents: incidents || [] };
    }
    case "guards_on_duty": {
      const { data: guards } = await supabase.from("shifts").select("*, guard:guards(first_name, last_name, phone, sia_licence), site:sites(site_name)").eq("company_id", companyId).eq("status", "active").gte("shift_start", today);
      return { guards: guards || [] };
    }
    default: {
      return { kpis: [], incidents: [], sites: [] };
    }
  }
}

function generateResponse(type: string, data: any): any {
  const responses: Record<string, any> = {
    sites_needing_attention: {
      title: "Sites Needing Attention",
      summary: `Found ${data.highRisk || 0} high-risk sites and ${(data.alerts || []).length} recent alerts.`,
      items: (data.sites || []).map((s: any) => ({ label: s.site_name, value: s.risk_level, status: s.risk_level === "high" ? "critical" : s.risk_level === "medium" ? "warning" : "ok", link: `/sites/${s.id}` })),
    },
    late_guards: {
      title: "Late Guards Today",
      summary: `${(data.lateShifts || []).length} guard(s) currently late or critically late.`,
      items: (data.lateShifts || []).map((s: any) => ({ label: `${s.guard?.first_name || ""} ${s.guard?.last_name || ""}`, value: s.status, status: s.status === "critical_late" ? "critical" : "warning" })),
    },
    general: { title: "Operations Overview", summary: "Here's your current operational status.", items: [{ label: "Active Shifts", value: "N/A", status: "ok" }] },
  };
  return responses[type] || responses.general;
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } }
    });
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("company_id, role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "active") {
      return new Response(JSON.stringify({ error: "Account is not active" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const companyId = profile.company_id;
    if (!companyId && profile.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const { query } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const queryType = detectQueryType(query);
    const data = await fetchDataForQuery(queryType, companyId, user.id, profile.role, supabaseService);

    if (profile.role === "guard" && data.guards) {
      data.guards = data.guards.filter((g: any) => g.guard_id === user.id);
    }

    const response = generateResponse(queryType, data);

    return new Response(JSON.stringify({
      type: queryType,
      query,
      response,
      generatedAt: new Date().toISOString(),
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
