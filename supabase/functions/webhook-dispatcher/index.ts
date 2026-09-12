import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const BLOCKED_HOSTS = [
  "localhost", "127.0.0.1", "0.0.0.0", "::1",
  "169.254.", "10.", "172.16.", "172.17.", "172.18.", "172.19.",
  "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.",
  "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.",
  "192.168.", "metadata.google.internal",
];

function isPrivateHost(hostname: string): boolean {
  return BLOCKED_HOSTS.some(h => hostname.includes(h) || hostname === h);
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function dispatchWebhook(
  supabase: any,
  endpoint: any,
  eventType: string,
  eventId: string,
  payload: Record<string, unknown>,
  signingSecret: string,
) {
  const url = endpoint.url;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") {
      const allowedTestDomains = Deno.env.get("WEBHOOK_TEST_DOMAINS")?.split(",") || [];
      if (!allowedTestDomains.includes(parsedUrl.hostname)) {
        return { success: false, code: 0, body: "HTTPS required in production" };
      }
    }
    if (isPrivateHost(parsedUrl.hostname)) {
      return { success: false, code: 0, body: "Private network destinations blocked" };
    }
  } catch {
    return { success: false, code: 0, body: "Invalid URL" };
  }

  const webhookPayload = {
    event_id: eventId,
    event_type: eventType,
    timestamp: new Date().toISOString(),
    version: "1.0",
    data: payload,
  };

  const rawBody = JSON.stringify(webhookPayload);
  const signature = await signPayload(rawBody, signingSecret);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-guardianhub-event": eventType,
        "x-guardianhub-signature": `sha256=${signature}`,
        "x-guardianhub-event-id": eventId,
        "x-guardianhub-delivery": crypto.randomUUID(),
      },
      body: rawBody,
    });

    const responseBody = await response.text();
    return {
      success: response.ok,
      code: response.status,
      body: responseBody.substring(0, 1000),
    };
  } catch (err) {
    return { success: false, code: 0, body: err instanceof Error ? err.message : "Network error" };
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { company_id, event_type, event_data } = body;

    if (!company_id || !event_type || !event_data) {
      return new Response(JSON.stringify({ error: "Missing company_id, event_type, or event_data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: endpoints, error: endpointError } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .eq("company_id", company_id)
      .eq("status", "active");

    if (endpointError || !endpoints) {
      return new Response(JSON.stringify({ dispatched: 0, error: "No endpoints found" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const matchingEndpoints = endpoints.filter((ep: any) =>
      ep.enabled_events && ep.enabled_events.includes(event_type)
    );

    if (matchingEndpoints.length === 0) {
      return new Response(JSON.stringify({ dispatched: 0, message: "No matching endpoints for event" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhookSecret = Deno.env.get("WEBHOOK_SIGNING_SECRET") || "guardianhub-webhook-default";
    const eventId = crypto.randomUUID();
    let successCount = 0;
    let failCount = 0;

    for (const endpoint of matchingEndpoints) {
      if (endpoint.failure_count >= 20) continue;

      const { data: deliveries } = await supabase
        .from("webhook_deliveries")
        .select("id")
        .eq("event_id", eventId)
        .eq("webhook_endpoint_id", endpoint.id);

      if (deliveries && deliveries.length > 0) continue;

      const { data: delivery } = await supabase
        .from("webhook_deliveries")
        .insert({
          webhook_endpoint_id: endpoint.id,
          event_id: eventId,
          event_type: event_type,
          status: "pending",
          attempt_count: 0,
        })
        .select("id")
        .maybeSingle();

      if (!delivery) continue;

      const endpointSecret = endpoint.signing_secret_ref
        ? (Deno.env.get(endpoint.signing_secret_ref) || webhookSecret)
        : webhookSecret;

      const result = await dispatchWebhook(supabase, endpoint, event_type, eventId, event_data, endpointSecret);

      await supabase
        .from("webhook_deliveries")
        .update({
          status: result.success ? "delivered" : "failed",
          attempt_count: 1,
          response_code: result.code,
          response_body: result.body,
          last_attempt_at: new Date().toISOString(),
          completed_at: result.success ? new Date().toISOString() : null,
        })
        .eq("id", delivery.id);

      await supabase
        .from("webhook_endpoints")
        .update({
          last_delivery_at: new Date().toISOString(),
          failure_count: result.success ? 0 : endpoint.failure_count + 1,
          status: endpoint.failure_count >= 19 && !result.success ? "paused" : endpoint.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", endpoint.id);

      if (result.success) successCount++;
      else failCount++;
    }

    return new Response(JSON.stringify({ dispatched: successCount, failed: failCount, event_id: eventId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", details: err instanceof Error ? err.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});