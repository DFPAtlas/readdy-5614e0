
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

const PROVIDER_NAMES: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
};

async function verifyProvider(provider: string, apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (provider === "openai") {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: "Hi" }], max_tokens: 5 }),
      });
      if (!resp.ok) return { ok: false, error: `HTTP ${resp.status}` };
      return { ok: true };
    }
    if (provider === "anthropic") {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 10, messages: [{ role: "user", content: "Hi" }] }),
      });
      if (!resp.ok) return { ok: false, error: `HTTP ${resp.status}` };
      return { ok: true };
    }
    return { ok: false, error: "Unknown provider" };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabaseAuth
      .from("users")
      .select("company_id, role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "active") {
      return new Response(JSON.stringify({ error: "Account is not active" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (!["super_admin", "company_admin", "operations_manager"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Guards and clients cannot manage API keys" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const companyId = profile.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let body: any = {};
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { provider, api_key } = body;
    if (!provider || !api_key || typeof api_key !== "string") {
      return new Response(JSON.stringify({ error: "Provider and API key are required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const secretName = PROVIDER_NAMES[provider];
    if (!secretName) {
      return new Response(JSON.stringify({ error: "Unsupported provider" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    await supabaseService
      .from("company_secrets")
      .upsert({
        company_id: companyId,
        secret_name: secretName,
        secret_value: api_key,
        updated_at: new Date().toISOString(),
      }, { onConflict: "company_id,secret_name" });

    const verify = await verifyProvider(provider, api_key);

    await supabaseService.from("admin_activity_log").insert({
      user_id: user.id,
      company_id: companyId,
      action: "save_api_key",
      target_type: "company_secret",
      target_id: secretName,
      details: {
        provider,
        verified: verify.ok,
        outcome: "success",
        key_last_four: api_key.slice(-4),
      },
    });

    if (!verify.ok) {
      return new Response(JSON.stringify({
        saved: true,
        verified: false,
        error: `Key saved but verification test failed. Please check the key is valid.`,
      }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      saved: true,
      verified: true,
      provider,
      key_last_four: api_key.slice(-4),
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("save-api-key error:", err.message);
    return new Response(JSON.stringify({ error: "An error occurred saving the API key" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
