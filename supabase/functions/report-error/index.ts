import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENSITIVE_KEYS = ["password","token","secret","api_key","apikey","authorization","cookie","card","cvc","cvv","ssn","private_key","license","evidence","medical","signature","signing","webhook_secret"];
const MAX_BODY_BYTES = 16 * 1024;

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

serve(async (req: Request) => {
  const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    { auth: { persistSession: false } }
  );

  const ok = (code = 200) => new Response(JSON.stringify({ ok: true }), { status: code, headers: { "Content-Type": "application/json" } });

  if (req.method !== "POST") return ok(405);

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) return ok(200);

  let body: any;
  try { body = await req.json(); } catch { return ok(200); }

  const safe = redact(body || {}) as Record<string, any>;
  const clientIp = (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown").slice(0, 64);

  const { count } = await supabase
    .from("ops_error_events")
    .select("id", { count: "exact", head: true })
    .eq("ip", clientIp)
    .gte("created_at", new Date(Date.now() - 60000).toISOString());

  if ((count || 0) > 60) return ok(200);

  const severity = String(safe.severity || "P3").slice(0, 8);
  const source = String(safe.source || "client").slice(0, 128);
  const event = String(safe.event || "unhandled").slice(0, 128);
  const message = String(safe.message || "").slice(0, 1000);
  const stack = String(safe.stack || "").slice(0, 4000);

  await supabase.from("ops_error_events").insert({
    environment: String(safe.environment || "unknown").slice(0, 32),
    severity,
    source,
    event,
    message,
    stack: stack || null,
    correlation_id: String(safe.correlation_id || correlationId).slice(0, 128),
    context: safe.context || null,
    ip: clientIp,
    user_agent: (req.headers.get("user-agent") || "").slice(0, 256),
  });

  log({ severity: severity === "P1" || severity === "P2" ? "error" : "warn", service: "report-error", event: "error_received", correlation_id: correlationId, status: "success" });

  return ok(200);
});
