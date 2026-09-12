import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENSITIVE_KEYS = ["password","token","secret","api_key","apikey","authorization","cookie","card","cvc","cvv","ssn","private_key","license","evidence","medical","signature","signing","webhook_secret"];

function redact(v: any, depth = 0): any {
  if (depth > 6) return "[max-depth]";
  if (v === null || v === undefined || typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.map((x) => redact(x, depth + 1));
  if (typeof v === "object") {
    const out: Record<string, any> = {};
    for (const [k, val] of Object.entries(v)) {
      const lower = k.toLowerCase();
      out[k] = SENSITIVE_KEYS.some((s) => lower.includes(s)) ? "[REDACTED]" : redact(val, depth + 1);
    }
    return out;
  }
  return String(v);
}

function log(fields: Record<string, any>) {
  const entry = { timestamp: new Date().toISOString(), environment: Deno.env.get("APP_ENV") || "unknown", ...redact(fields) };
  const line = JSON.stringify(entry);
  if (entry.severity === "error") console.error(line);
  else if (entry.severity === "warn") console.warn(line);
  else console.log(line);
}

function safeCode(e: unknown) {
  if (e && typeof e === "object" && "code" in e) return String((e as any).code).slice(0, 64);
  return "unknown";
}

type CheckState = "healthy" | "degraded" | "unavailable" | "not_configured";

serve(async (req: Request) => {
  const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();
  const url = new URL(req.url);
  let mode = url.searchParams.get("mode") || "ready";
  if (req.method === "POST") {
    try { const b = await req.json(); if (b && b.mode) mode = b.mode; } catch {}
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    { auth: { persistSession: false } }
  );

  if (mode === "live") {
    return new Response(JSON.stringify({ status: "healthy", mode: "live", timestamp: new Date().toISOString() }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  const checks: Record<string, { state: CheckState; detail?: string }> = {};

  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getUser(token);
    userId = data?.user?.id || null;
    checks.auth = { state: userId ? "healthy" : "unavailable" };
  } catch (e) {
    checks.auth = { state: "unavailable", detail: safeCode(e) };
  }

  if (!userId) {
    return new Response(JSON.stringify({ status: "unavailable", mode: "ready", checks }), {
      status: 401, headers: { "Content-Type": "application/json" }
    });
  }

  const { data: assignments } = await supabase
    .from("platform_role_assignments")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1);

  let isStaff = (assignments || []).length > 0;
  if (!isStaff) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
    isStaff = profile?.role === "super_admin";
  }

  if (!isStaff) {
    return new Response(JSON.stringify({ status: "unavailable", mode: "ready", checks }), {
      status: 403, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { error } = await supabase.from("plans").select("id").limit(1);
    checks.database = { state: error ? "unavailable" : "healthy", detail: error ? safeCode(error) : undefined };
  } catch (e) {
    checks.database = { state: "unavailable", detail: safeCode(e) };
  }

  try {
    const { error } = await supabase.storage.listBuckets();
    checks.storage = { state: error ? "unavailable" : "healthy", detail: error ? safeCode(error) : undefined };
  } catch (e) {
    checks.storage = { state: "unavailable", detail: safeCode(e) };
  }

  checks.edge_functions = { state: Deno.env.get("SUPABASE_URL") ? "healthy" : "not_configured" };
  checks.stripe = { state: Deno.env.get("STRIPE_SECRET_KEY") ? "healthy" : "not_configured" };
  checks.n8n = { state: (Deno.env.get("N8N_GUARDIANHUB_BASE_URL") && Deno.env.get("N8N_GUARDIANHUB_SIGNING_SECRET")) ? "healthy" : "not_configured" };
  checks.email = { state: (Deno.env.get("RESEND_API_KEY") && Deno.env.get("RESEND_FROM_DOMAIN")) ? "healthy" : "not_configured" };
  checks.sms = { state: (Deno.env.get("TWILIO_ACCOUNT_SID") || Deno.env.get("SMS_PROVIDER_KEY")) ? "healthy" : "not_configured" };
  checks.push = { state: "not_configured" };
  checks.maps = { state: Deno.env.get("GOOGLE_MAPS_API_KEY") ? "healthy" : "not_configured" };

  const states = Object.values(checks).map((c) => c.state);
  const hasUnavailable = states.includes("unavailable");
  const hasNotConfigured = states.includes("not_configured");
  const overall: CheckState = checks.database.state === "unavailable"
    ? "unavailable"
    : hasUnavailable || hasNotConfigured
      ? "degraded"
      : "healthy";

  log({ severity: "info", service: "health-check", event: "health_check_completed", correlation_id: correlationId, status: "success" });

  return new Response(JSON.stringify({ status: overall, mode: "ready", timestamp: new Date().toISOString(), checks }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
});
