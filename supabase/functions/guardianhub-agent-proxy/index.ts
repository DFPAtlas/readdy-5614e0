
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const N8N_BASE_URL = Deno.env.get("N8N_GUARDIANHUB_BASE_URL") || "";
const N8N_SIGNING_SECRET = Deno.env.get("N8N_GUARDIANHUB_SIGNING_SECRET") || "";

const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

const MAX_PAYLOAD_SIZE = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30000;

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

function validateWebhookPath(path: string): string | null {
  if (!path || path.length === 0) return "Webhook path is required";
  if (!path.startsWith("/")) return "Webhook path must start with /";
  if (path.includes("..") || path.includes("//")) return "Path traversal detected";
  const blocked = ["http://", "https://", "file://", "ftp://"];
  if (blocked.some((p) => path.startsWith(p))) return "Absolute URLs not allowed";
  return null;
}

async function createHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const startedAt = Date.now();
  let logId: string | null = null;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
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

    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > MAX_PAYLOAD_SIZE) {
      return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { agent_key, payload = {} } = body;
    if (!agent_key) {
      return new Response(JSON.stringify({ error: "agent_key is required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: agent } = await supabase
      .from("agent_registry")
      .select("*")
      .eq("agent_key", agent_key)
      .eq("is_active", true)
      .maybeSingle();

    if (!agent) {
      return new Response(JSON.stringify({ error: `Agent "${agent_key}" not found or inactive` }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const pathError = validateWebhookPath(agent.webhook_path);
    if (pathError) {
      return new Response(JSON.stringify({ error: pathError }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: inserted } = await supabase
      .from("agent_execution_logs")
      .insert({
        agent_key,
        company_id: profile.company_id,
        user_id: user.id,
        status: "running",
        request_payload: { agent: agent.agent_name, source: "edge_function" },
        source: "edge_function",
        started_at: new Date(startedAt).toISOString(),
      })
      .select("id")
      .maybeSingle();

    logId = inserted?.id || null;

    const timestamp = Date.now().toString();
    const requestId = crypto.randomUUID();
    const webhookUrl = `${N8N_BASE_URL}${agent.webhook_path}`;

    const signedPayload = {
      agent_key,
      user_id: user.id,
      company_id: profile.companyId,
      role: profile.role,
      timestamp,
      request_id: requestId,
      ...payload,
    };

    const payloadStr = JSON.stringify(signedPayload);
    const signature = N8N_SIGNING_SECRET
      ? await createHmacSignature(payloadStr, N8N_SIGNING_SECRET)
      : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-GH-Timestamp": timestamp,
      "X-GH-Request-Id": requestId,
      "X-GH-User-Id": user.id,
    };
    if (signature) headers["X-GH-Signature"] = signature;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(webhookUrl, { method: "POST", headers, body: payloadStr, signal: controller.signal });
    } catch (e: any) {
      clearTimeout(timeout);
      if (logId) {
        await supabase.from("agent_execution_logs").update({
          status: "failed",
          error_message: `n8n unreachable: ${e.message}`,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startedAt,
        }).eq("id", logId);
      }
      return new Response(JSON.stringify({ error: "Agent service unavailable" }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
    clearTimeout(timeout);

    const completedAt = Date.now();
    const durationMs = completedAt - startedAt;
    const responseText = await n8nResponse.text();
    let responseData: any;
    try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText.slice(0, 1000) }; }

    if (logId) {
      await supabase.from("agent_execution_logs").update({
        status: n8nResponse.ok ? "completed" : "failed",
        response_payload: responseData,
        error_message: n8nResponse.ok ? null : `n8n returned ${n8nResponse.status}`,
        completed_at: new Date(completedAt).toISOString(),
        duration_ms: durationMs,
      }).eq("id", logId);
    }

    if (!n8nResponse.ok) {
      return new Response(JSON.stringify({
        error: "Agent execution failed",
        agent: agent.agent_name,
      }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      success: true,
      agent: agent.agent_name,
      data: responseData,
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    if (logId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await supabase.from("agent_execution_logs").update({
        status: "failed",
        error_message: "Internal error",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startedAt,
      }).eq("id", logId);
    }
    return new Response(JSON.stringify({ error: "An error occurred processing the agent request" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
