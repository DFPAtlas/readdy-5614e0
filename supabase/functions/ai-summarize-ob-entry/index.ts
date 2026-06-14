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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { occurrence_book_id } = body;
    if (!occurrence_book_id) {
      return new Response(JSON.stringify({ error: "occurrence_book_id required" }), { status: 400, headers: corsHeaders });
    }

    const { data: obEntry } = await supabase
      .from("occurrence_books")
      .select("id, entry, entry_type, site_id, company_id, sites!inner(site_name)")
      .eq("id", occurrence_book_id)
      .maybeSingle();

    if (!obEntry || obEntry.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Entry not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    const entryText = obEntry.entry || "";
    if (entryText.length < 50) {
      return new Response(JSON.stringify({ skipped: true, reason: "too_short" }), { status: 200, headers: corsHeaders });
    }

    const siteName = (obEntry.sites as any)?.site_name || "Site";
    const entryType = obEntry.entry_type || "Note";

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
            content: `You are summarising security occurrence book entries written by officers on duty in the UK. Read the entry and return a single short sentence (maximum 15 words) capturing the key fact. Use British English. Do not editorialise. Do not add facts. If the entry is essentially routine ('all clear', 'no issues'), return exactly that as a four-word summary.`,
          },
          {
            role: "user",
            content: `Type: ${entryType}. Site: ${siteName}. Entry: ${entryText}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 80,
      }),
    });

    const openaiData = await resp.json();
    const summary = openaiData.choices?.[0]?.message?.content?.trim() || "";

    if (!summary) {
      return new Response(JSON.stringify({ error: "OpenAI returned empty summary" }), { status: 500, headers: corsHeaders });
    }

    await supabase
      .from("occurrence_books")
      .update({ ai_summary: summary })
      .eq("id", occurrence_book_id);

    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "ob_summary",
      details: { occurrence_book_id, summary_length: summary.length, site_id: obEntry.site_id },
    });

    return new Response(JSON.stringify({ summary }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
