import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-id, x-api-key, content-type, x-idempotency-key, x-request-id, accept-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface ApiError {
  error: string;
  code: string;
  details?: string;
  request_id: string;
}

function apiError(code: string, message: string, requestId: string, details?: string): ApiError {
  return { error: message, code, details, request_id: requestId };
}

const SCOPE_RESOURCES: Record<string, { table: string; select: string; method: string; writeable: boolean }[]> = {
  "sites:read": [{ table: "sites", select: "id,name,address,region,status,risk_level,created_at", method: "GET", writeable: false }],
  "guards:read_limited": [{ table: "guards", select: "id,first_name,last_name,sia_badge_number,status,role", method: "GET", writeable: false }],
  "shifts:read": [{ table: "shifts", select: "id,site_id,guard_id,start_time,end_time,status,shift_type", method: "GET", writeable: false }],
  "shifts:write": [{ table: "shifts", select: "id,site_id,guard_id,start_time,end_time,status,shift_type", method: "POST", writeable: true }],
  "attendance:read": [{ table: "attendance_logs", select: "id,shift_id,guard_id,check_in,check_out,status,site_id", method: "GET", writeable: false }],
  "incidents:read_client_safe": [{ table: "incidents", select: "id,title,severity,status,occurred_at,site_id,description", method: "GET", writeable: false }],
  "reports:read": [{ table: "reports", select: "id,title,type,status,created_at,site_id", method: "GET", writeable: false }],
  "timesheets:read_approved": [{ table: "finance_work_records", select: "id,guard_id,site_id,payable_hours,status,period_start,period_end", method: "GET", writeable: false }],
  "invoices:read": [{ table: "client_invoices", select: "id,client_id,invoice_number,net_total,vat_total,gross_total,status,issued_at,due_date", method: "GET", writeable: false }],
};

function validateScopes(requested: string[], required: string[]): boolean {
  return required.every(r => requested.includes(r));
}

async function resolveCredential(supabase: SupabaseClient, clientId: string, apiKey: string): Promise<{ company_id: string; scopes: string[]; credential_id: string } | null> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const { data: cred } = await supabase
    .from("api_credentials")
    .select("id,company_id,scopes,secret_hash,status,expires_at")
    .eq("client_id", clientId)
    .eq("status", "active")
    .maybeSingle();

  if (!cred || cred.secret_hash !== hashHex) return null;
  if (cred.expires_at && new Date(cred.expires_at) < new Date()) return null;

  return { company_id: cred.company_id, scopes: cred.scopes || [], credential_id: cred.id };
}

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

serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/v1\/?/, "");

  if (!path) {
    return new Response(JSON.stringify(apiError("invalid_path", "No API path specified", requestId)), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const clientId = req.headers.get("x-client-id") || "";
  const apiKey = req.headers.get("x-api-key") || "";
  const idempotencyKey = req.headers.get("x-idempotency-key") || "";

  if (!clientId || !apiKey) {
    return new Response(JSON.stringify(apiError("unauthorized", "Missing x-client-id or x-api-key header", requestId)), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cred = await resolveCredential(supabase, clientId, apiKey);
  if (!cred) {
    return new Response(JSON.stringify(apiError("unauthorized", "Invalid or expired credentials", requestId)), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parts = path.split("/");
  const resource = parts[0];

  let matchedPermissions: string[] = [];
  let queryTable = "";
  let querySelect = "*";
  let isWrite = false;

  for (const [scope, resources] of Object.entries(SCOPE_RESOURCES)) {
    for (const r of resources) {
      if (r.table === resource || resource.startsWith(r.table)) {
        if (cred.scopes.includes(scope)) {
          matchedPermissions.push(scope);
          queryTable = r.table;
          querySelect = r.select;
          if (r.writeable) isWrite = true;
        }
      }
    }
  }

  if (matchedPermissions.length === 0) {
    return new Response(JSON.stringify(apiError("forbidden", "Insufficient scope for this resource", requestId)), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !isWrite) {
    return new Response(JSON.stringify(apiError("forbidden", "Write access not granted for this resource", requestId)), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let result: any = null;
    let responseCode = 200;

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const offset = (page - 1) * limit;

    switch (req.method) {
      case "GET": {
        const resourceId = parts[1];
        let query = supabase.from(queryTable).select(querySelect).eq("company_id", cred.company_id);

        if (resourceId) {
          query = query.eq("id", resourceId).maybeSingle();
        } else {
          query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) {
          responseCode = 400;
          result = apiError("query_error", "Database query failed", requestId);
        } else {
          result = data;
        }
        break;
      }

      case "POST": {
        if (!isWrite) {
          responseCode = 403;
          result = apiError("forbidden", "Write not permitted for this resource", requestId);
          break;
        }

        const body = await req.json();
        const cleanBody: Record<string, unknown> = {};
        const allowedFields = querySelect.replace(/\s/g, "").split(",").filter(f => f !== "id" && f !== "created_at");

        for (const field of allowedFields) {
          if (field in body) cleanBody[field] = body[field];
        }
        cleanBody.company_id = cred.company_id;

        if (idempotencyKey) {
          const { data: existing } = await supabase
            .from("integration_sync_runs")
            .select("id")
            .eq("idempotency_key", idempotencyKey)
            .eq("company_id", cred.company_id)
            .maybeSingle();
          if (existing) {
            responseCode = 200;
            result = { idempotent: true, message: "Resource already created" };
            break;
          }
        }

        const { data: created, error } = await supabase.from(queryTable).insert(cleanBody).select(querySelect).maybeSingle();

        if (error) {
          responseCode = 400;
          result = apiError("create_error", error.message, requestId);
        } else {
          responseCode = 201;
          result = created;

          if (idempotencyKey) {
            await supabase.from("integration_sync_runs").insert({
              company_id: cred.company_id,
              integration_key: "api_v1",
              direction: "inbound",
              resource_type: queryTable,
              idempotency_key: idempotencyKey,
              status: "completed",
              records_processed: 1,
              records_succeeded: 1,
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
            });
          }
        }
        break;
      }

      case "PATCH": {
        if (!isWrite) {
          responseCode = 403;
          result = apiError("forbidden", "Write not permitted for this resource", requestId);
          break;
        }
        const resourceId = parts[1];
        if (!resourceId) {
          responseCode = 400;
          result = apiError("missing_id", "Resource ID required for PATCH", requestId);
          break;
        }

        const patchBody = await req.json();
        const cleanPatch: Record<string, unknown> = {};
        const allowedFields = querySelect.replace(/\s/g, "").split(",").filter(f => f !== "id" && f !== "created_at" && f !== "company_id");
        for (const field of allowedFields) {
          if (field in patchBody) cleanPatch[field] = patchBody[field];
        }

        const { data: updated, error } = await supabase
          .from(queryTable)
          .update(cleanPatch)
          .eq("id", resourceId)
          .eq("company_id", cred.company_id)
          .select(querySelect)
          .maybeSingle();

        if (error) {
          responseCode = 400;
          result = apiError("update_error", error.message, requestId);
        } else {
          result = updated;
        }
        break;
      }

      default:
        responseCode = 405;
        result = apiError("method_not_allowed", "Method not allowed", requestId);
    }

    const durationMs = Date.now() - startTime;

    await supabase.from("api_access_logs").insert({
      company_id: cred.company_id,
      credential_id: cred.credential_id,
      endpoint: path,
      method: req.method,
      scopes_used: matchedPermissions,
      response_code: responseCode,
      duration_ms: durationMs,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
      user_agent: req.headers.get("user-agent") || null,
    });

    return new Response(JSON.stringify(result), {
      status: responseCode,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-request-id": requestId,
        "x-api-version": "1.0",
      },
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    await supabase.from("api_access_logs").insert({
      company_id: cred.company_id,
      credential_id: cred.credential_id,
      endpoint: path,
      method: req.method,
      response_code: 500,
      duration_ms: durationMs,
    });

    return new Response(JSON.stringify(apiError("internal_error", "Internal server error", requestId)), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});