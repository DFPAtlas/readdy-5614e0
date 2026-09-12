
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const startedAt = new Date().toISOString();

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("company_id, role, status, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "active") {
      return new Response(JSON.stringify({ error: "Account is not active" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const companyId = profile.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: guard } = await supabase
      .from("guards")
      .select("id, first_name, last_name")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (!guard) {
      return new Response(JSON.stringify({ error: "Guard profile not found" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const guardId = guard.id;
    const guardName = `${guard.first_name || profile.first_name || ""} ${guard.last_name || profile.last_name || ""}`.trim() || "Unknown Guard";

    let body: any = {};
    try { body = await req.json(); } catch { }

    const siteId = body.site_id || null;
    const shiftId = body.shift_id || null;
    const lat = body.lat || null;
    const lng = body.lng || null;

    let siteName = "Unknown Site";
    if (siteId) {
      const { data: site } = await supabase
        .from("sites")
        .select("site_name, company_id")
        .eq("id", siteId)
        .eq("company_id", companyId)
        .maybeSingle();
      if (site) siteName = site.site_name;
    }

    const now = new Date();

    const { data: incident, error: incError } = await supabase
      .from("incidents")
      .insert({
        company_id: companyId,
        site_id: siteId,
        guard_id: guardId,
        shift_id: shiftId,
        incident_type: "SOS / Panic Alarm",
        severity: "critical",
        title: `SOS Emergency: ${guardName}`,
        description: `SOS panic alarm activated by ${guardName} at ${siteName} on ${now.toLocaleString("en-GB")}. GPS: ${lat ? `${lat}, ${lng}` : "Not available"}. Immediate response required.`,
        status: "open",
        occurred_at: now.toISOString(),
        gps_latitude: lat || null,
        gps_longitude: lng || null,
        client_visible: false,
      })
      .select("id")
      .maybeSingle();

    if (incError) console.error("Failed to create SOS incident:", incError.message);

    await supabase.from("occurrence_books").insert({
      company_id: companyId,
      site_id: siteId,
      guard_id: guardId,
      entry_type: "SOS / Emergency",
      entry: `EMERGENCY SOS ALERT: Panic alarm activated by ${guardName} at ${siteName}. GPS: ${lat ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}` : "Not available"}.`,
      occurred_at: now.toISOString(),
    });

    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      guard_id: guardId,
      action_type: "sos_panic_alarm",
      details: {
        guard_name: guardName,
        site_name: siteName,
        site_id: siteId,
        shift_id: shiftId,
        gps: lat ? { lat, lng } : null,
        time: startedAt,
        incident_id: incident?.id || null,
      },
    });

    const { data: adminUsers } = await supabase
      .from("users")
      .select("id")
      .eq("company_id", companyId)
      .in("role", ["company_admin", "operations_manager"])
      .eq("status", "active");

    let notificationsSent = 0;
    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        const { error: notifError } = await supabase.from("notifications").insert({
          company_id: companyId,
          user_id: admin.id,
          type: "sos_panic_alarm",
          title: `SOS EMERGENCY: ${guardName} at ${siteName}`,
          body: `Panic alarm activated by ${guardName}. Location: ${siteName}${lat ? ` (GPS: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})` : ""}. Incident #${incident?.id?.slice(0, 8) || "N/A"}.`,
          severity: "critical",
          link: incident?.id ? `/incidents/${incident.id}` : `/dashboard/command-centre`,
          related_id: incident?.id || null,
          related_type: "incident",
        });
        if (!notifError) notificationsSent++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      incident_id: incident?.id || null,
      notifications_sent: notificationsSent,
      message: `SOS alert processed. ${notificationsSent} admins notified.`,
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("SOS emergency error:", err.message);
    return new Response(JSON.stringify({ error: "An error occurred processing the emergency alert" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
