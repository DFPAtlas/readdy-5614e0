import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const N8N_BASE_URL = Deno.env.get("N8N_GUARDIANHUB_BASE_URL") || "";
const N8N_SIGNING_SECRET = Deno.env.get("N8N_GUARDIANHUB_SIGNING_SECRET") || "";
const MAX_PAYLOAD_SIZE = 512 * 1024;
const REQUEST_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

interface AgentRecord {
  id: string;
  agent_key: string;
  agent_name: string;
  webhook_path: string;
  is_active: boolean;
  risk_level: string;
  requires_approval: boolean;
  category: string;
}

const ALLOWED_EVENT_TYPES = [
  "incident.created", "incident.escalated", "incident.resolved",
  "sos.activated", "sos.acknowledged", "sos.resolved",
  "attendance.late", "attendance.missed", "attendance.early_checkout",
  "attendance.geofence_mismatch", "attendance.unassigned_shift",
  "rota.assistance_request", "rota.cover_needed",
  "compliance.expiry_warning", "compliance.expired",
  "report.generate_daily", "report.generate_weekly", "report.generate_incident",
  "notification.escalate", "notification.reminder",
  "health.ping", "health.status",
  "lone_worker.overdue", "lone_worker.checkin_missed",
  "patrol.missed_checkpoint", "patrol.overdue",
  "leave.approved", "leave.denied",
  "cover_offer.accepted", "cover_offer.declined",
];

async function createHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function insertAudit(supabase: any, actor: string | null, companyId: string | null, agentKey: string, runId: string | null, action: string, metadata: Record<string, unknown>) {
  try {
    await supabase.from("automation_audit_log").insert({
      actor, company_id: companyId, agent_key: agentKey,
      run_id: runId, action, safe_metadata: metadata,
    });
  } catch { /* non-blocking */ }
}

serve(async (req: Request) => {
  const startedAt = Date.now();
  const correlationId = crypto.randomUUID();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { "Content-Type": "application/json" }
      });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("company_id, role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "active") {
      return new Response(JSON.stringify({ error: "Account is not active" }), {
        status: 403, headers: { "Content-Type": "application/json" }
      });
    }

    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > MAX_PAYLOAD_SIZE) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413, headers: { "Content-Type": "application/json" }
      });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const { agent_key, event_type, payload = {}, idempotency_key } = body;

    if (!agent_key || typeof agent_key !== "string") {
      return new Response(JSON.stringify({ error: "agent_key is required" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    if (!ALLOWED_EVENT_TYPES.includes(event_type)) {
      await insertAudit(supabase, user.id, profile.company_id, agent_key, null, "rejected_invalid_event", { event_type });
      return new Response(JSON.stringify({ error: `Event type "${event_type}" is not allowed` }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const { data: agent } = await supabase
      .from("agent_registry")
      .select("*")
      .eq("agent_key", agent_key)
      .eq("is_active", true)
      .maybeSingle();

    if (!agent) {
      return new Response(JSON.stringify({ error: `Agent "${agent_key}" not found or inactive` }), {
        status: 404, headers: { "Content-Type": "application/json" }
      });
    }

    if (agent.requires_approval) {
      const safePayload = typeof payload === "object" ? { ...payload } : {};
      delete safePayload.evidence_data;
      delete safePayload.private_notes;
      delete safePayload.medical_info;

      const { data: approval } = await supabase
        .from("automation_approvals")
        .insert({
          company_id: profile.company_id,
          run_id: correlationId,
          requested_action: `${agent_key}:${event_type}`,
          safe_preview: { agent: agent.agent_name, event_type, summary: safePayload },
          status: "pending",
          requested_by: user.id,
          expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id")
        .maybeSingle();

      await insertAudit(supabase, user.id, profile.company_id, agent_key, correlationId, "approval_requested", {
        approval_id: approval?.id, event_type,
      });

      return new Response(JSON.stringify({
        status: "approval_required",
        approval_id: approval?.id,
        message: `Agent "${agent.agent_name}" requires approval for this action.`,
      }), { status: 202, headers: { "Content-Type": "application/json" } });
    }

    const effectiveIdempotencyKey = idempotency_key || `${agent_key}:${event_type}:${correlationId}`;

    const { data: existingRun } = await supabase
      .from("agent_execution_logs")
      .select("id, status")
      .eq("agent_key", agent_key)
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: runInsert } = await supabase
      .from("agent_execution_logs")
      .insert({
        agent_key,
        company_id: profile.company_id,
        user_id: user.id,
        status: "running",
        request_payload: { event_type, idempotency_key: effectiveIdempotencyKey, payload: typeof payload === "object" ? payload : {} },
        source: "automation_gateway",
        started_at: new Date(startedAt).toISOString(),
      })
      .select("id")
      .maybeSingle();

    const runId = runInsert?.id || correlationId;

    await insertAudit(supabase, user.id, profile.company_id, agent_key, runId, "gateway_request", {
      event_type, source: profile.role,
    });

    const timestamp = Date.now().toString();
    const requestId = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    const signedPayload = {
      agent_key,
      event_type,
      user_id: user.id,
      company_id: profile.company_id,
      role: profile.role,
      timestamp,
      request_id: requestId,
      nonce,
      correlation_id: correlationId,
      run_id: runId,
      version: "1.0.0",
      ...payload,
    };

    const payloadStr = JSON.stringify(signedPayload);
    const signature = N8N_SIGNING_SECRET
      ? await createHmacSignature(payloadStr, N8N_SIGNING_SECRET)
      : null;

    const webhookUrl = `${N8N_BASE_URL}${agent.webhook_path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-GH-Timestamp": timestamp,
      "X-GH-Request-Id": requestId,
      "X-GH-Nonce": nonce,
      "X-GH-Correlation-Id": correlationId,
      "X-GH-User-Id": user.id,
      "X-GH-Company-Id": profile.company_id,
    };
    if (signature) headers["X-GH-Signature"] = signature;

    let lastError = "";
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const n8nResponse = await fetch(webhookUrl, {
          method: "POST", headers, body: payloadStr, signal: controller.signal,
        });
        clearTimeout(timeout);
        const completedAt = Date.now();
        const durationMs = completedAt - startedAt;
        const responseText = await n8nResponse.text();
        let responseData: any;
        try { responseData = JSON.parse(responseText); } catch {
          responseData = { raw: responseText.slice(0, 500) };
        }

        if (n8nResponse.ok) {
          await supabase.from("agent_execution_logs").update({
            status: "completed", response_payload: responseData,
            completed_at: new Date(completedAt).toISOString(), duration_ms: durationMs,
          }).eq("id", runId);

          await insertAudit(supabase, user.id, profile.company_id, agent_key, runId, "gateway_success", { duration_ms: durationMs });

          return new Response(JSON.stringify({
            success: true, agent: agent.agent_name, run_id: runId, correlation_id: correlationId,
            data: responseData,
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        lastError = `n8n returned ${n8nResponse.status}: ${responseText.slice(0, 200)}`;
      } catch (e: any) {
        clearTimeout(timeout);
        lastError = `n8n unreachable (attempt ${attempt + 1}): ${e.message}`;
      }
    }

    await supabase.from("agent_execution_logs").update({
      status: "failed", error_message: lastError,
      completed_at: new Date().toISOString(), duration_ms: Date.now() - startedAt,
    }).eq("id", runId);

    await insertAudit(supabase, user.id, profile.company_id, agent_key, runId, "gateway_failed", { error: lastError.slice(0, 200) });

    return new Response(JSON.stringify({
      error: "Agent execution failed after retries", agent: agent.agent_name, run_id: runId,
    }), { status: 502, headers: { "Content-Type": "application/json" } });

  } catch (err: any) {
    return new Response(JSON.stringify({
      error: "An unexpected error occurred",
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});