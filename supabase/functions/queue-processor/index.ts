import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const N8N_BASE_URL = Deno.env.get("N8N_GUARDIANHUB_BASE_URL") || "";
const N8N_SIGNING_SECRET = Deno.env.get("N8N_GUARDIANHUB_SIGNING_SECRET") || "";
const QUEUE_CRON_SECRET = Deno.env.get("QUEUE_CRON_SECRET") || "";
const MAX_BATCH_SIZE = 25;
const MAX_RETRIES = 5;
const REQUEST_TIMEOUT_MS = 30000;

async function createHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function backoffMs(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 300000);
}

serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (QUEUE_CRON_SECRET && token !== QUEUE_CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    const { data: pendingEvents } = await supabase
      .from("agent_webhook_events")
      .select("*")
      .eq("processed", false)
      .or("status.eq.pending,status.is.null")
      .lt("retry_count", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(MAX_BATCH_SIZE);

    if (!pendingEvents || pendingEvents.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "No pending events" }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }

    let processed = 0;
    let failed = 0;

    for (const event of pendingEvents) {
      const { data: agent } = await supabase
        .from("agent_registry")
        .select("webhook_path, is_active")
        .eq("agent_key", event.agent_key)
        .maybeSingle();

      if (!agent || !agent.is_active) {
        await supabase.from("agent_webhook_events").update({
          status: "skipped", processed: true, processed_at: now,
          last_error: "Agent not found or inactive",
        }).eq("id", event.id);
        processed++;
        continue;
      }

      const correlationId = crypto.randomUUID();
      const timestamp = Date.now().toString();
      const nonce = crypto.randomUUID();

      const signedPayload = {
        agent_key: event.agent_key,
        event_type: event.event_type,
        company_id: event.company_id,
        timestamp,
        nonce,
        correlation_id: correlationId,
        version: "1.0.0",
        payload: event.event_payload || {},
      };

      const payloadStr = JSON.stringify(signedPayload);
      const signature = N8N_SIGNING_SECRET
        ? await createHmacSignature(payloadStr, N8N_SIGNING_SECRET)
        : null;

      const webhookUrl = `${N8N_BASE_URL}${agent.webhook_path}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-GH-Timestamp": timestamp,
        "X-GH-Correlation-Id": correlationId,
        "X-GH-Nonce": nonce,
        "X-GH-Company-Id": event.company_id || "",
      };
      if (signature) headers["X-GH-Signature"] = signature;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const n8nResponse = await fetch(webhookUrl, {
          method: "POST", headers, body: payloadStr, signal: controller.signal,
        });
        clearTimeout(timeout);

        if (n8nResponse.ok) {
          await supabase.from("agent_webhook_events").update({
            processed: true, processed_at: now, status: "completed",
          }).eq("id", event.id);
          processed++;
        } else {
          const retryCount = (event.retry_count || 0) + 1;
          const isDeadLetter = retryCount >= MAX_RETRIES;
          await supabase.from("agent_webhook_events").update({
            retry_count: retryCount,
            last_error: `n8n returned ${n8nResponse.status}`,
            status: isDeadLetter ? "dead_letter" : "retrying",
            ...(isDeadLetter ? { processed: true, processed_at: now } : {}),
          }).eq("id", event.id);
          failed++;
        }
      } catch (e: any) {
        clearTimeout(timeout);
        const retryCount = (event.retry_count || 0) + 1;
        const isDeadLetter = retryCount >= MAX_RETRIES;
        await supabase.from("agent_webhook_events").update({
          retry_count: retryCount,
          last_error: `n8n unreachable: ${e.message}`,
          status: isDeadLetter ? "dead_letter" : "retrying",
          ...(isDeadLetter ? { processed: true, processed_at: now } : {}),
        }).eq("id", event.id);
        failed++;
      }
    }

    return new Response(JSON.stringify({
      processed, failed, total: pendingEvents.length,
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Queue processing failed" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
});