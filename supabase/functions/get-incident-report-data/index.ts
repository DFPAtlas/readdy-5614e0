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
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const incidentId = body.incident_id;
    if (!incidentId) {
      return new Response(JSON.stringify({ error: "incident_id required" }), { status: 400, headers: corsHeaders });
    }

    const { data: userProfile } = await supabase.from("users").select("company_id, first_name, last_name, role").eq("id", user.id).maybeSingle();
    const companyId = userProfile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    const { data: incident } = await supabase
      .from("incidents")
      .select("*, sites!inner(site_name, address, risk_level), guards!left(first_name, last_name, sia_licence)")
      .eq("id", incidentId)
      .maybeSingle();

    if (!incident || incident.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Incident not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    const { data: media } = await supabase.from("incident_media").select("*").eq("incident_id", incidentId);
    const { data: company } = await supabase.from("companies").select("name, logo_url, address, brand_color").eq("id", companyId).maybeSingle();

    const site = Array.isArray(incident.sites) ? incident.sites[0] : incident.sites;
    const guard = Array.isArray(incident.guards) ? incident.guards[0] : incident.guards;

    const reportData = {
      incident: {
        id: incident.id,
        incident_type: incident.incident_type,
        severity: incident.severity,
        status: incident.status,
        description: incident.description,
        ai_rewritten_report: incident.ai_rewritten_report,
        occurred_at: incident.occurred_at,
        created_at: incident.created_at,
      },
      site: {
        name: site?.site_name,
        address: site?.address,
        risk_level: site?.risk_level,
      },
      guard: {
        name: guard ? `${guard.first_name || ""} ${guard.last_name || ""}`.trim() : null,
        sia_licence: guard?.sia_licence,
      },
      company: {
        name: company?.name || "GuardianHub",
        logo_url: company?.logo_url,
        address: company?.address,
        brand_color: company?.brand_color || "#3b82f6",
      },
      media: media || [],
      generated_by: {
        name: `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`.trim() || "Operations Manager",
        role: userProfile?.role || "operations_manager",
      },
    };

    return new Response(
      JSON.stringify({ report: reportData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
