import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const N8N_BASE_URL = Deno.env.get("N8N_GUARDIANHUB_BASE_URL") || "";
const N8N_SIGNING_SECRET = Deno.env.get("N8N_GUARDIANHUB_SIGNING_SECRET") || "";
const APP_ENV = Deno.env.get("APP_ENV") || "staging";
const MAX_PAYLOAD_SIZE = 512 * 1024;
const REQUEST_TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:3000,http://localhost:3001")
  .split(",").map((s) => s.trim()).filter(Boolean);

const ALLOWED_EVENT_TYPES = [
  "incident.created", "incident.escalated", "incident.resolved",
  "sos.activated", "sos.acknowledged", "sos.resolved",
  "attendance.late", "attendance.missed", "attendance.early_checkout",
  "attendance.geofence_mismatch", "attendance.unassigned_shift",
  "rota.assistance_request", "rota.cover_needed",
  "compliance.expiry_warning", "compliance.expired",
  "report.generate_daily", "report.generate_weekly", "report.generate_incident",
  "notification.escalate", "notification.reminder", "notification.retry",
  "billing.invoice_overdue", "billing.subscription_mismatch",
  "retention.run_requested", "integrity.report",
  "agent.test", "health.ping", "health.status",
  "lone_worker.overdue", "lone_worker.checkin_missed",
  "patrol.missed_checkpoint", "patrol.overdue",
  "leave.approved", "leave.denied",
  "cover_offer.accepted", "cover_offer.declined",
  "timesheet.reminder", "training.renewal",
];

const SENSITIVE_KEYS = ["evidence_data", "private_notes", "medical_info", "password", "token", "secret", "api_key", "access_token", "refresh_token", "card", "iban", "sort_code"];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => o === origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : (ALLOWED_ORIGINS[0] || "http://localhost:3000"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

async function hmac(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeSummary(input: unknown): unknown {
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(safeSummary);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s))) { out[k] = "[redacted]"; continue; }
    out[k] = safeSummary(v);
  }
  return out;
}

function backoffMs(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

async function isPlatformStaff(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("is_platform_staff");
  if (data === true) return true;
  const { data: prof } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  return prof?.role === "super_admin";
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const startedAt = Date.now();
  const correlationId = crypto.randomUUID();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase.from("users")
      .select("company_id, role, status").eq("id", user.id).maybeSingle();
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

    const {
      agent_key, event_type, payload = {}, idempotency_key,
      trigger_type = "manual", triggering_record_id = null,
      company_id: requestedCompanyId = null, pre_approved = false, approval_id = null,
    } = body;

    if (!agent_key || typeof agent_key !== "string") {
      return new Response(JSON.stringify({ error: "agent_key is required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (!ALLOWED_EVENT_TYPES.includes(event_type)) {
      return new Response(JSON.stringify({ error: `Event type "${event_type}" is not allowed` }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: agent } = await supabase.from("agent_registry")
      .select("*").eq("agent_key", agent_key).maybeSingle();
    if (!agent) {
      return new Response(JSON.stringify({ error: `Agent "${agent_key}" not found` }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const staff = await isPlatformStaff(supabase, user.id);

    if (agent.enabled_environment && agent.enabled_environment !== APP_ENV) {
      return new Response(JSON.stringify({ error: `Agent not enabled for environment "${APP_ENV}"` }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (!agent.is_active && !(staff && event_type === "agent.test")) {
      return new Response(JSON.stringify({ error: `Agent "${agent_key}" is disabled` }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let companyId = profile.company_id;
    if (requestedCompanyId) {
      if (requestedCompanyId !== profile.company_id && !staff) {
        return new Response(JSON.stringify({ error: "Cross-tenant request denied" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
      }
      companyId = requestedCompanyId;
    }

    if (agent.requires_approval && !pre_approved) {
      const { data: approval } = await supabase.from("automation_approvals").insert({
        company_id: companyId,
        run_id: correlationId,
        requested_action: `${agent_key}:${event_type}`,
        safe_preview: { agent: agent.agent_name, event_type, summary: safeSummary(payload) },
        risk_level: agent.risk_level,
        reason: "Agent requires approval for this action",
        expected_effect: { agent_key, event_type },
        status: "pending",
        requested_by: user.id,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }).select("id").maybeSingle();

      return new Response(JSON.stringify({ status: "approval_required", approval_id: approval?.id, message: `Agent "${agent.agent_name}" requires approval.` }), { status: 202, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (pre_approved && approval_id) {
      const { data: ap } = await supabase.from("automation_approvals")
        .select("status, requested_by, expiry").eq("id", approval_id).maybeSingle();
      if (!ap || ap.status !== "approved" || (ap.expiry && new Date(ap.expiry) < new Date())) {
        return new Response(JSON.stringify({ error: "Approval is not valid or has expired" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
      }
    }

    const effectiveIdempotencyKey = idempotency_key || `${agent_key}:${event_type}:${triggering_record_id || correlationId}`;

    const { data: existing } = await supabase.from("agent_execution_logs")
      .select("id, status, response_payload, error_message")
      .eq("agent_key", agent_key).eq("idempotency_key", effectiveIdempotencyKey).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ success: existing.status === "succeeded", duplicated: true, run_id: existing.id, status: existing.status, data: existing.response_payload }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: runInsert } = await supabase.from("agent_execution_logs").insert({
      agent_key, company_id: companyId, user_id: user.id,
      status: "processing", source: "n8n_gateway",
      request_payload: { event_type, payload: safeSummary(payload) },
      safe_input_summary: safeSummary(payload),
      idempotency_key: effectiveIdempotencyKey,
      correlation_id: correlationId,
      trigger_type, triggering_record_id,
      priority: agent.risk_level === "critical" ? "critical" : "normal",
      environment: APP_ENV, version: agent.version,
      attempt_count: 1, max_attempts: MAX_RETRIES + 1,
      started_at: new Date(startedAt).toISOString(),
    }).select("id").maybeSingle();
    const runId = runInsert?.id || correlationId;

    await supabase.from("automation_audit_log").insert({
      actor: user.id, company_id: companyId, agent_key, run_id: runId,
      action: "gateway_request", safe_metadata: { event_type, trigger_type },
    });

    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID();
    const signedPayload = {
      agent_key, event_type, user_id: user.id, company_id: companyId,
      role: profile.role, timestamp, nonce, correlation_id: correlationId, run_id: runId, version: agent.version || "1.0.0",
      ...payload,
    };
    const payloadStr = JSON.stringify(signedPayload);
    const signature = N8N_SIGNING_SECRET ? await hmac(payloadStr, N8N_SIGNING_SECRET) : null;

    const webhookUrl = `${N8N_BASE_URL}${agent.webhook_path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-GH-Timestamp": timestamp,
      "X-GH-Nonce": nonce,
      "X-GH-Correlation-Id": correlationId,
      "X-GH-User-Id": user.id,
      "X-GH-Company-Id": companyId || "",
    };
    if (signature) headers["X-GH-Signature"] = signature;

    let lastError = "";
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const n8nResponse = await fetch(webhookUrl, { method: "POST", headers, body: payloadStr, signal: controller.signal });
        clearTimeout(timeout);
        const completedAt = Date.now();
        const responseText = await n8nResponse.text();
        let responseData: any;
        try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText.slice(0, 500) }; }

        if (n8nResponse.ok) {
          await supabase.from("agent_execution_logs").update({
            status: "succeeded", response_payload: responseData,
            safe_output_summary: safeSummary(responseData),
            completed_at: new Date(completedAt).toISOString(),
            duration_ms: completedAt - startedAt, attempt_count: attempt + 1,
            n8n_execution_ref: responseData?.executionId || null,
          }).eq("id", runId);
          await supabase.from("agent_registry").update({ last_run_at: new Date(completedAt).toISOString(), last_status: "succeeded" }).eq("agent_key", agent_key);
          return new Response(JSON.stringify({ success: true, agent: agent.agent_name, run_id: runId, correlation_id: correlationId, data: responseData }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
        }
        lastError = `n8n returned ${n8nResponse.status}: ${responseText.slice(0, 200)}`;
      } catch (e: any) {
        clearTimeout(timeout);
        lastError = `n8n unreachable (attempt ${attempt + 1}): ${e.message}`;
      }
      if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, backoffMs(attempt)));
    }

    const failedAt = new Date().toISOString();
    await supabase.from("agent_execution_logs").update({
      status: "failed", error_message: lastError, error_code: "N8N_DISPATCH_FAILED",
      completed_at: failedAt, duration_ms: Date.now() - startedAt, attempt_count: MAX_RETRIES + 1,
    }).eq("id", runId);
    await supabase.from("agent_registry").update({ last_run_at: failedAt, last_status: "failed" }).eq("agent_key", agent_key);
    await supabase.from("agent_dead_letters").insert({
      agent_key, company_id: companyId, execution_id: runId, event_type,
      safe_payload: safeSummary(payload), error_code: "N8N_DISPATCH_FAILED",
      error_message: lastError.slice(0, 500), attempt_count: MAX_RETRIES + 1, status: "dead_lettered",
    });
    await supabase.from("automation_audit_log").insert({
      actor: user.id, company_id: companyId, agent_key, run_id: runId,
      action: "gateway_dead_lettered", safe_metadata: { error: lastError.slice(0, 200) },
    });

    return new Response(JSON.stringify({ error: "Agent execution failed after retries and was dead-lettered", agent: agent.agent_name, run_id: runId }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
