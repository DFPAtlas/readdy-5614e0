import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENSITIVE_KEYS = ["password","token","secret","api_key","apikey","authorization","cookie","card","cvc","cvv","ssn","private_key","license","evidence","medical","signature","signing","webhook_secret"];
const RETENTION_CRON_SECRET = Deno.env.get("RETENTION_CRON_SECRET") || "";

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
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (RETENTION_CRON_SECRET && token !== RETENTION_CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    { auth: { persistSession: false } }
  );

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "dry_run";

  const { data: configs } = await supabase.from("retention_config").select("*").eq("is_enabled", true);
  if (!configs || configs.length === 0) {
    return new Response(JSON.stringify({ ok: true, mode, categories: {} }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const { data: holds } = await supabase.from("legal_holds").select("record_categories").is("released_at", null);
  const heldCategories = new Set((holds || []).flatMap((h: any) => h.record_categories || []));

  const result: Record<string, any> = {};

  for (const cfg of configs) {
    const days = cfg.retention_days;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const category = cfg.record_category;

    if (heldCategories.has(category)) {
      result[category] = { retention_days: days, candidates: 0, action: "hold_skipped" };
      continue;
    }

    if (category === "automation_payloads") {
      const { count } = await supabase.from("agent_execution_logs").select("id", { count: "exact", head: true }).lt("created_at", cutoff);
      result[category] = { retention_days: days, candidates: count || 0, action: "clear_payloads" };
      if (mode === "apply" && count) {
        await supabase.from("agent_execution_logs").update({ request_payload: {}, response_payload: null }).lt("created_at", cutoff);
      }
    } else if (category === "notification_logs") {
      const { count } = await supabase.from("notification_jobs").select("id", { count: "exact", head: true }).in("status", ["sent", "failed", "cancelled"]).lt("created_at", cutoff);
      result[category] = { retention_days: days, candidates: count || 0, action: "delete_terminal_jobs" };
      if (mode === "apply" && count) {
        await supabase.from("notification_jobs").delete().in("status", ["sent", "failed", "cancelled"]).lt("created_at", cutoff);
      }
    } else if (category === "export_files") {
      const { count } = await supabase.from("data_requests").select("id", { count: "exact", head: true }).not("export_expires_at", "is", null).lt("export_expires_at", cutoff);
      result[category] = { retention_days: days, candidates: count || 0, action: "expire_exports" };
      if (mode === "apply" && count) {
        await supabase.from("data_requests").update({ export_file_path: null }).not("export_expires_at", "is", null).lt("export_expires_at", cutoff);
      }
    } else {
      result[category] = { retention_days: days, candidates: 0, action: "manual_review" };
    }
  }

  log({ severity: "info", service: "retention-runner", event: "retention_run", correlation_id: correlationId, status: "success", mode });

  return new Response(JSON.stringify({ ok: true, mode, categories: result }), { status: 200, headers: { "Content-Type": "application/json" } });
});
