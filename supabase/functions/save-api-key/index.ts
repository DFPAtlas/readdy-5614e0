import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROVIDER_NAMES: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
};

async function verifyProvider(provider: string, apiKey: string): Promise<{ ok: boolean; error?: string }> {
  if (provider === "openai") {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: "Hi" }], max_tokens: 5 }),
    });
    if (!resp.ok) return { ok: false, error: await resp.text() };
    return { ok: true };
  }
  if (provider === "anthropic") {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 10, messages: [{ role: "user", content: "Hi" }] }),
    });
    if (!resp.ok) return { ok: false, error: await resp.text() };
    return { ok: true };
  }
  if (provider === "google") {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] }),
    });
    if (!resp.ok) return { ok: false, error: await resp.text() };
    return { ok: true };
  }
  if (provider === "deepseek") {
    const resp = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: "Hi" }], max_tokens: 5 }),
    });
    if (!resp.ok) return { ok: false, error: await resp.text() };
    return { ok: true };
  }
  if (provider === "groq") {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: "Hi" }], max_tokens: 5 }),
    });
    if (!resp.ok) return { ok: false, error: await resp.text() };
    return { ok: true };
  }
  return { ok: false, error: "Unknown provider" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: profile } = await supabase.from("users").select("company_id, role").eq("id", user.id).maybeSingle();
    const companyId = profile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { provider, api_key } = body;
    if (!provider || !api_key || typeof api_key !== "string") {
      return new Response(JSON.stringify({ error: "Provider and API key required" }), { status: 400, headers: corsHeaders });
    }

    const secretName = PROVIDER_NAMES[provider];
    if (!secretName) {
      return new Response(JSON.stringify({ error: "Unsupported provider" }), { status: 400, headers: corsHeaders });
    }

    await supabaseService
      .from("company_secrets")
      .upsert({ company_id: companyId, secret_name: secretName, secret_value: api_key, updated_at: new Date().toISOString() }, { onConflict: "company_id,secret_name" });

    const verify = await verifyProvider(provider, api_key);

    if (!verify.ok) {
      return new Response(JSON.stringify({ saved: true, verified: false, error: `Key saved but ${provider} test failed: ${verify.error}` }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ saved: true, verified: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
