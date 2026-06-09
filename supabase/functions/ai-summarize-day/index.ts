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

    const { data: userProfile } = await supabase.from("users").select("company_id, role").eq("id", user.id).maybeSingle();
    const companyId = userProfile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { site_id, date } = body;
    if (!site_id || !date) {
      return new Response(JSON.stringify({ error: "site_id and date required" }), { status: 400, headers: corsHeaders });
    }

    const { data: site } = await supabase.from("sites").select("id, site_name, company_id").eq("id", site_id).maybeSingle();
    if (!site || site.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Site not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    const dayStart = `${date}T00:00:00Z`;
    const dayEnd = `${date}T23:59:59Z`;

    const { data: obEntries } = await supabase
      .from("occurrence_books")
      .select("id, entry, entry_type, ai_summary, occurred_at")
      .eq("site_id", site_id)
      .eq("company_id", companyId)
      .gte("occurred_at", dayStart)
      .lte("occurred_at", dayEnd)
      .order("occurred_at", { ascending: true });

    const { data: incidents } = await supabase
      .from("incidents")
      .select("id, incident_type, severity, status, description, ai_rewritten_report, occurred_at")
      .eq("site_id", site_id)
      .eq("company_id", companyId)
      .gte("occurred_at", dayStart)
      .lte("occurred_at", dayEnd)
      .order("occurred_at", { ascending: true });

    const obList = (obEntries || []).map((o) => ({
      time: o.occurred_at ? new Date(o.occurred_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "\u2014",
      type: o.entry_type || "Note",
      text: (o.ai_summary || o.entry || "").slice(0, 200),
    }));

    const incList = (incidents || []).map((i) => ({
      time: i.occurred_at ? new Date(i.occurred_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "\u2014",
      type: i.incident_type || "Incident",
      severity: i.severity || "low",
      status: i.status || "open",
      text: (i.ai_rewritten_report || i.description || "").slice(0, 200),
    }));

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
            content: `You are summarising a security shift's activity at a UK site. Produce a 3-4 sentence digest covering: routine activity, any notable events, current outstanding issues. Calm and factual tone.`,
          },
          {
            role: "user",
            content: `Site: ${site.site_name}\nDate: ${date}\n\nOccurrence Book Entries (${obList.length}):\n${obList.map((o, idx) => `${idx + 1}. ${o.time} \u2014 ${o.type}: ${o.text}`).join("\n")}\n\nIncidents (${incList.length}):\n${incList.map((i, idx) => `${idx + 1}. ${i.time} \u2014 ${i.type} (${i.severity}, ${i.status}): ${i.text}`).join("\n")}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    const openaiData = await resp.json();
    const summary = openaiData.choices?.[0]?.message?.content?.trim() || "";

    if (!summary) {
      return new Response(JSON.stringify({ error: "OpenAI returned empty summary" }), { status: 500, headers: corsHeaders });
    }

    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "day_summary",
      details: { site_id, date, ob_count: obList.length, incident_count: incList.length },
    });

    return new Response(JSON.stringify({ summary }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
