
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const n8nBaseUrl = Deno.env.get("N8N_GUARDIANHUB_BASE_URL") || "";

    if (!n8nBaseUrl) {
      return new Response(
        JSON.stringify({ error: "N8N_GUARDIANHUB_BASE_URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { agent_key, payload = {} } = body;

    if (!agent_key) {
      return new Response(
        JSON.stringify({ error: "agent_key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: agent } = await supabase
      .from("agent_registry")
      .select("*")
      .eq("agent_key", agent_key)
      .eq("is_active", true)
      .maybeSingle();

    if (!agent) {
      return new Response(
        JSON.stringify({ error: `Agent "${agent_key}" not found or inactive` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = `${n8nBaseUrl}${agent.webhook_path}`;

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        agent_key,
        source: "guardianhub_edge_function",
        forwarded_at: new Date().toISOString(),
      }),
    });

    const responseText = await n8nResponse.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!n8nResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `n8n returned ${n8nResponse.status}`,
          agent: agent.agent_name,
          webhook_path: agent.webhook_path,
          n8n_response: responseData,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        agent: agent.agent_name,
        data: responseData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
