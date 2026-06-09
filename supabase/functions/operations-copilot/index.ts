import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CopilotRequest {
  query: string;
  companyId: string | null;
  userRole: string | null;
  userId: string | null;
  contextData?: Record<string, any>;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function detectQueryType(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("site") && (q.includes("attention") || q.includes("need") || q.includes("problem"))) return "sites_needing_attention";
  if (q.includes("late") || q.includes("missed check")) return "late_guards";
  if (q.includes("missed patrol") || q.includes("patrol")) return "missed_patrols";
  if (q.includes("handover") || q.includes("shift summary")) return "shift_handover";
  if (q.includes("incident") && (q.includes("open") || q.includes("summary"))) return "open_incidents";
  if (q.includes("document") && (q.includes("expir") || q.includes("expir"))) return "expiring_docs";
  if (q.includes("client") && (q.includes("issue") || q.includes("problem"))) return "client_issues";
  if (q.includes("client update") || q.includes("summary")) return "client_summary";
  if (q.includes("who") && q.includes("duty")) return "guards_on_duty";
  if (q.includes("risk")) return "risk_summary";
  if (q.includes("staffing") || q.includes("shortage")) return "staffing_alerts";
  if (q.includes("welfare") || q.includes("check")) return "welfare_check";
  return "general";
}

function companyFilter(column: string, companyId: string | null, isSuperAdmin: boolean) {
  if (isSuperAdmin) return null;
  if (!companyId) return null;
  return { column, value: companyId };
}

function applyFilter(builder: any, filter: { column: string; value: string } | null) {
  if (filter) {
    return builder.eq(filter.column, filter.value);
  }
  return builder;
}

async function fetchDataForQuery(type: string, companyId: string | null, userId: string | null, userRole: string | null) {
  const isSuperAdmin = userRole === "super_admin";
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const filter = companyFilter("company_id", companyId, isSuperAdmin);

  switch (type) {
    case "sites_needing_attention": {
      let builder = supabaseAdmin.from("sites").select("id, site_name, risk_level, check_call_interval, patrol_enabled");
      builder = applyFilter(builder, filter);
      const { data: sites } = await builder;
      let alertsBuilder = supabaseAdmin.from("ai_activity_logs").select("action_type, details, created_at").gte("created_at", yesterday).order("created_at", { ascending: false }).limit(10);
      alertsBuilder = applyFilter(alertsBuilder, filter);
      const { data: alerts } = await alertsBuilder;
      return {
        sites: sites || [],
        alerts: alerts || [],
        highRisk: (sites || []).filter((s: any) => s.risk_level === "high").length,
      };
    }
    case "late_guards": {
      let builder = supabaseAdmin.from("shifts").select("*, guard:guards(first_name, last_name)").gte("shift_start", today).in("status", ["late", "critical_late"]);
      builder = applyFilter(builder, filter);
      const { data: shifts } = await builder;
      return { lateShifts: shifts || [] };
    }
    case "missed_patrols": {
      let builder = supabaseAdmin.from("patrol_logs").select("*, site:sites(site_name)").gte("created_at", yesterday).eq("status", "missed").order("created_at", { ascending: false }).limit(10);
      builder = applyFilter(builder, filter);
      const { data: patrols } = await builder;
      return { missedPatrols: patrols || [] };
    }
    case "open_incidents": {
      let builder = supabaseAdmin.from("incidents").select("id, title, severity, status, site_id, site:sites(site_name), created_at").eq("status", "open").order("created_at", { ascending: false }).limit(10);
      builder = applyFilter(builder, filter);
      const { data: incidents } = await builder;
      return { incidents: incidents || [] };
    }
    case "expiring_docs": {
      let docsBuilder = supabaseAdmin.from("compliance_documents").select("id, title, document_type, expiry_date, status, site:sites(site_name)").lte("expiry_date", new Date(Date.now() + 30 * 86400000).toISOString()).gte("expiry_date", today).order("expiry_date", { ascending: true });
      docsBuilder = applyFilter(docsBuilder, filter);
      const { data: docs } = await docsBuilder;
      let certsBuilder = supabaseAdmin.from("guard_certifications").select("id, guard:guards(first_name, last_name), sia_licence, sia_expiry, status").lte("sia_expiry", new Date(Date.now() + 60 * 86400000).toISOString()).gte("sia_expiry", today).order("sia_expiry", { ascending: true });
      certsBuilder = applyFilter(certsBuilder, filter);
      const { data: certs } = await certsBuilder;
      return { documents: docs || [], certifications: certs || [] };
    }
    case "guards_on_duty": {
      let builder = supabaseAdmin.from("shifts").select("*, guard:guards(first_name, last_name, phone, sia_licence), site:sites(site_name)").eq("status", "active").gte("shift_start", today);
      builder = applyFilter(builder, filter);
      const { data: guards } = await builder;
      return { guards: guards || [] };
    }
    case "staffing_alerts": {
      let builder = supabaseAdmin.from("ai_activity_logs").select("action_type, details, created_at").eq("action_type", "staffing_alert").gte("created_at", yesterday).order("created_at", { ascending: false }).limit(10);
      builder = applyFilter(builder, filter);
      const { data: alerts } = await builder;
      return { alerts: alerts || [] };
    }
    case "client_issues": {
      let builder = supabaseAdmin.from("support_tickets").select("id, title, status, priority, client_id, created_at, client:clients(name)").eq("status", "open").order("created_at", { ascending: false }).limit(10);
      builder = applyFilter(builder, filter);
      const { data: tickets } = await builder;
      return { tickets: tickets || [] };
    }
    default: {
      let kpisBuilder = supabaseAdmin.from("shifts").select("status", { count: "exact" }).gte("shift_start", today);
      kpisBuilder = applyFilter(kpisBuilder, filter);
      const { data: kpis } = await kpisBuilder;
      let incidentsBuilder = supabaseAdmin.from("incidents").select("status", { count: "exact" }).eq("status", "open");
      incidentsBuilder = applyFilter(incidentsBuilder, filter);
      const { data: incidents } = await incidentsBuilder;
      let sitesBuilder = supabaseAdmin.from("sites").select("id", { count: "exact" });
      sitesBuilder = applyFilter(sitesBuilder, filter);
      const { data: sites } = await sitesBuilder;
      return { kpis, incidents, sites };
    }
  }
}

function buildSystemPrompt(): string {
  return `You are GuardianHub AI Operations Copilot — an expert security operations assistant. You help security managers, operations staff, and clients understand what is happening across their sites, guards, shifts, incidents, and compliance.

Rules:
- Answer in plain, confident, professional English.
- Keep responses concise but useful — 2-4 short paragraphs max.
- Use bullet points where appropriate.
- If data is empty, say that clearly rather than making things up.
- Highlight anything critical, urgent, or high-risk.
- Suggest 1-2 quick actions the user should consider.
- Do not mention that you are an AI.
- Base everything only on the live data provided below.`;
}

function buildDataPrompt(type: string, data: any): string {
  return `\n\nLive operational data for query type "${type}":\n${JSON.stringify(data, null, 2)}\n\nRespond based on this data only.`;
}

async function callOpenAI(apiKey: string, systemPrompt: string, userQuery: string, dataPrompt: string): Promise<string | null> {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery + dataPrompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("OpenAI API error:", errorText);
      return null;
    }

    const json = await resp.json();
    return json?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("OpenAI call failed:", err);
    return null;
  }
}

async function getOpenAIKey(companyId: string | null): Promise<string | null> {
  if (!companyId) return null;
  const { data: secret } = await supabaseAdmin
    .from("company_secrets")
    .select("secret_value")
    .eq("company_id", companyId)
    .eq("secret_name", "OPENAI_API_KEY")
    .maybeSingle();
  return secret?.secret_value ?? null;
}

function generateResponse(type: string, data: any, query: string): any {
  const responses: Record<string, any> = {
    sites_needing_attention: {
      title: "Sites Needing Attention",
      summary: `Found ${data.highRisk || 0} high-risk sites and ${(data.alerts || []).length} recent alerts.`,
      items: (data.sites || []).map((s: any) => ({
        label: s.site_name,
        value: s.risk_level,
        status: s.risk_level === "high" ? "critical" : s.risk_level === "medium" ? "warning" : "ok",
        link: `/sites/${s.id}`,
      })),
      actionLinks: [
        { label: "View All Sites", href: "/sites", icon: "ri-building-line" },
        { label: "Risk Assessment", href: "/sites", icon: "ri-alert-line" },
      ],
    },
    late_guards: {
      title: "Late Guards Today",
      summary: `${(data.lateShifts || []).length} guard(s) currently late or critically late.`,
      items: (data.lateShifts || []).map((s: any) => ({
        label: `${s.guard?.first_name || ""} ${s.guard?.last_name || ""}`,
        value: s.status,
        status: s.status === "critical_late" ? "critical" : "warning",
        link: `/guards`,
      })),
      actionLinks: [
        { label: "View All Guards", href: "/guards", icon: "ri-shield-user-line" },
        { label: "Guard Welfare", href: "/dashboard/guard-welfare", icon: "ri-heart-pulse-line" },
      ],
    },
    missed_patrols: {
      title: "Missed Patrols",
      summary: `${(data.missedPatrols || []).length} patrol(s) missed in the last 24 hours.`,
      items: (data.missedPatrols || []).map((p: any) => ({
        label: p.site?.site_name || "Unknown site",
        value: new Date(p.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        status: "critical",
        link: `/sites/${p.site_id}`,
      })),
      actionLinks: [
        { label: "Patrol Monitoring", href: "/dashboard/patrol-monitoring", icon: "ri-route-line" },
        { label: "View Sites", href: "/sites", icon: "ri-building-line" },
      ],
    },
    open_incidents: {
      title: "Open Incidents",
      summary: `${(data.incidents || []).length} incident(s) currently open.`,
      items: (data.incidents || []).map((i: any) => ({
        label: i.title,
        value: i.severity,
        status: i.severity === "critical" || i.severity === "high" ? "critical" : i.severity === "medium" ? "warning" : "ok",
        link: `/incidents/${i.id}`,
      })),
      actionLinks: [
        { label: "All Incidents", href: "/incidents", icon: "ri-alarm-warning-line" },
        { label: "Occurrence Book", href: "/occurrence-book", icon: "ri-book-line" },
      ],
    },
    expiring_docs: {
      title: "Expiring Documents",
      summary: `${(data.documents || []).length} document(s) and ${(data.certifications || []).length} certification(s) expiring soon.`,
      items: [
        ...(data.documents || []).map((d: any) => ({
          label: d.title,
          value: d.expiry_date ? new Date(d.expiry_date).toLocaleDateString("en-GB") : "Soon",
          status: "warning",
          link: "/dashboard/compliance/documents",
        })),
        ...(data.certifications || []).map((c: any) => ({
          label: `${c.guard?.first_name || ""} ${c.guard?.last_name || ""} SIA`,
          value: c.sia_expiry ? new Date(c.sia_expiry).toLocaleDateString("en-GB") : "Soon",
          status: "warning",
          link: "/guards",
        })),
      ],
      actionLinks: [
        { label: "Compliance Docs", href: "/dashboard/compliance/documents", icon: "ri-file-shield-line" },
        { label: "Guard Certifications", href: "/guards", icon: "ri-shield-check-line" },
      ],
    },
    guards_on_duty: {
      title: "Guards on Duty",
      summary: `${(data.guards || []).length} guard(s) currently active on shift.`,
      items: (data.guards || []).map((g: any) => ({
        label: `${g.guard?.first_name || ""} ${g.guard?.last_name || ""}`,
        value: g.site?.site_name || "Unknown",
        status: "ok",
        link: `/sites/${g.site_id}`,
      })),
      actionLinks: [
        { label: "View All Guards", href: "/guards", icon: "ri-shield-user-line" },
        { label: "Rotas", href: "/rotas", icon: "ri-calendar-event-line" },
      ],
    },
    staffing_alerts: {
      title: "Staffing Alerts",
      summary: `${(data.alerts || []).length} staffing alert(s) in the last 24 hours.`,
      items: (data.alerts || []).map((a: any) => ({
        label: a.action_type.replace(/_/g, " "),
        value: a.details?.message || "Alert",
        status: "warning",
        link: "/dashboard",
      })),
      actionLinks: [
        { label: "Dashboard", href: "/dashboard", icon: "ri-dashboard-line" },
        { label: "Staff", href: "/dashboard/staff", icon: "ri-team-line" },
      ],
    },
    client_issues: {
      title: "Client Issues",
      summary: `${(data.tickets || []).length} open client ticket(s).`,
      items: (data.tickets || []).map((t: any) => ({
        label: t.title,
        value: t.priority,
        status: t.priority === "high" ? "critical" : t.priority === "medium" ? "warning" : "ok",
        link: `/client/support/${t.id}`,
      })),
      actionLinks: [
        { label: "Support Tickets", href: "/client/support", icon: "ri-customer-service-2-line" },
        { label: "Clients", href: "/dashboard/clients", icon: "ri-briefcase-line" },
      ],
    },
    general: {
      title: "Operations Overview",
      summary: "Here's your current operational status.",
      items: [
        { label: "Active Shifts", value: `${data.kpis?.count || 0}`, status: "ok", link: "/rotas" },
        { label: "Open Incidents", value: `${data.incidents?.count || 0}`, status: data.incidents?.count > 0 ? "warning" : "ok", link: "/incidents" },
        { label: "Total Sites", value: `${data.sites?.count || 0}`, status: "ok", link: "/sites" },
      ],
      actionLinks: [
        { label: "Dashboard", href: "/dashboard", icon: "ri-dashboard-line" },
        { label: "Command Centre", href: "/dashboard/command-centre", icon: "ri-command-line" },
      ],
    },
  };

  return responses[type] || responses.general;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body: CopilotRequest = await req.json();
    const { query, companyId, userRole, userId } = body;

    const isSuperAdmin = userRole === "super_admin";

    if (!companyId && !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: "Company ID required" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const isClient = userRole === "client";
    const isGuard = userRole === "guard";

    const queryType = detectQueryType(query);
    const data = await fetchDataForQuery(queryType, companyId, userId, userRole);

    if (isGuard && data.guards) {
      data.guards = data.guards.filter((g: any) => g.guard_id === userId);
    }

    const response = generateResponse(queryType, data, query);

    let aiText: string | null = null;
    const openaiKey = await getOpenAIKey(companyId);
    if (openaiKey) {
      const systemPrompt = buildSystemPrompt();
      const dataPrompt = buildDataPrompt(queryType, data);
      aiText = await callOpenAI(openaiKey, systemPrompt, query, dataPrompt);
    }

    return new Response(
      JSON.stringify({
        type: queryType,
        query,
        response,
        aiText,
        generatedAt: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Copilot error" }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
