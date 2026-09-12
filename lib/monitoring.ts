export type AlertSeverity = "P1" | "P2" | "P3" | "P4";

interface CaptureOptions {
  severity?: AlertSeverity;
  source?: string;
  event?: string;
  context?: Record<string, unknown>;
}

const SENSITIVE_KEYS = [
  "password", "passwd", "token", "secret", "api_key", "apikey", "api-key",
  "authorization", "cookie", "card", "cvc", "cvv", "ssn", "private_key",
  "private-key", "license", "licence", "evidence", "medical", "signature",
  "signing", "webhook_secret", "webhook-secret",
];

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[max-depth]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((v) => redactValue(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lower = k.toLowerCase();
      out[k] = SENSITIVE_KEYS.some((s) => lower.includes(s)) ? "[REDACTED]" : redactValue(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function newCorrelationId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getPageCorrelationId(): string {
  try {
    if (typeof window !== "undefined") {
      const existing = window.sessionStorage.getItem("gh_correlation_id");
      if (existing) return existing;
      const id = newCorrelationId();
      window.sessionStorage.setItem("gh_correlation_id", id);
      return id;
    }
  } catch {
    return newCorrelationId();
  }
  return newCorrelationId();
}

const recentKeys = new Set<string>();
let recentTimer: ReturnType<typeof setTimeout> | null = null;

function shouldSend(key: string): boolean {
  if (recentKeys.has(key)) return false;
  recentKeys.add(key);
  if (recentKeys.size > 200) recentKeys.clear();
  if (recentTimer) clearTimeout(recentTimer);
  recentTimer = setTimeout(() => recentKeys.clear(), 60000);
  return true;
}

async function post(payload: unknown): Promise<void> {
  try {
    const base = getSupabaseUrl();
    if (!base) return;
    await fetch(`${base}/functions/v1/report-error`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    return;
  }
}

export async function captureException(error: unknown, opts: CaptureOptions = {}): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  const key = `${opts.source || "unknown"}:${err.message}`;
  if (!shouldSend(key)) return;

  await post({
    environment: process.env.NEXT_PUBLIC_APP_ENV || "local",
    severity: opts.severity || "P3",
    source: opts.source || "client",
    event: opts.event || "unhandled_exception",
    message: err.message,
    stack: err.stack ? err.stack.slice(0, 2000) : undefined,
    correlation_id: getPageCorrelationId(),
    context: redactValue(opts.context || {}),
  });
}

export function captureEvent(event: string, opts: CaptureOptions = {}): void {
  void post({
    environment: process.env.NEXT_PUBLIC_APP_ENV || "local",
    severity: opts.severity || "P4",
    source: opts.source || "client",
    event,
    message: event,
    correlation_id: getPageCorrelationId(),
    context: redactValue(opts.context || {}),
  });
}