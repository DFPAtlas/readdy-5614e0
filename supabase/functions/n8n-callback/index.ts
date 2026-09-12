import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SIGNING_SECRET = Deno.env.get("N8N_CALLBACK_SIGNING_SECRET") || Deno.env.get("N8N_GUARDIANHUB_SIGNING_SECRET") || "";
const TOLERANCE_MS = 5 * 60 * 1000;

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!secret) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sigBytes = new Uint8Array((signature.match(/.{1,2}/g) || []).map((b: string) => parseInt(b, 16)));
  if (sigBytes.length === 0) return false;
  return await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(body));
}

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const signature = req.headers.get("X-GH-Signature") || "";
    const timestamp = req.headers.get("X-GH-Timestamp") || "";
    const nonce = req.headers.get("X-GH-Nonce") || "";
    const correlationId = req.headers.get("X-GH-Correlation-Id") || "";

    const body = await req.text();

    if (SIGNING_SECRET) {
      const isValid = await verifySignature(body, signature, SIGNING_SECRET);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
      }
    }

    const ts = parseInt(timestamp);
    if (isNaN(ts) || Math.abs(Date.now() - ts) > TOLERANCE_MS) {
      return new Response(JSON.stringify({ error: "Request expired or invalid timestamp" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (!nonce) {
      return new Response(JSON.stringify({ error: "nonce is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { error: nonceErr } = await supabase.from("agent_replay_nonces")
      .insert({ nonce, expires_at: new Date(ts + TOLERANCE_MS).toISOString() });
    if (nonceErr) {
      return new Response(JSON.stringify({ error: "Replayed nonce rejected" }), { status: 409, headers: { "Content-Type": "application/json" } });
    }

    let payload: any;
    try { payload = JSON.parse(body); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { run_id, status, result, error: callbackError, agent_key, company_id, event_type } = payload;

    if (!run_id) {
      return new Response(JSON.stringify({ error: "run_id is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { data: existingRun } = await supabase.from("agent_execution_logs")
      .select("id, status").eq("id", run_id).maybeSingle();

    if (!existingRun) {
      await supabase.from("agent_execution_logs").insert({
        id: run_id, agent_key: agent_key || "unknown", company_id: company_id || null,
        status: status || "succeeded", response_payload: result || {}, error_message: callbackError || null,
        source: "n8n_callback", completed_at: new Date().toISOString(),
      });
      return new Response(JSON.stringify({ received: true, run_id, action: "created" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (existingRun.status === "succeeded" && status === "succeeded") {
      return new Response(JSON.stringify({ received: true, run_id, action: "skipped_already_completed" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const updateData: Record<string, unknown> = {
      status: status || "succeeded",
      response_payload: result || {},
      completed_at: new Date().toISOString(),
    };
    if (callbackError) updateData.error_message = callbackError;

    await supabase.from("agent_execution_logs").update(updateData).eq("id", run_id);
    await supabase.from("agent_registry").update({ last_run_at: new Date().toISOString(), last_status: status || "succeeded" }).eq("agent_key", agent_key);

    if (agent_key && company_id) {
      await supabase.from("automation_audit_log").insert({
        actor: null, company_id, agent_key, run_id,
        action: `n8n_callback_${status || "succeeded"}`,
        safe_metadata: { event_type, correlation_id: correlationId },
      });
    }

    if (event_type && agent_key) {
      await supabase.from("agent_webhook_events").update({
        processed: true, processed_at: new Date().toISOString(), status: status || "succeeded",
      }).eq("agent_key", agent_key).eq("event_type", event_type).eq("processed", false);
    }

    return new Response(JSON.stringify({ received: true, run_id, action: "updated" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Callback processing failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
