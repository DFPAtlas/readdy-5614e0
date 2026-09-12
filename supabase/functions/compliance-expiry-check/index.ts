
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin === o);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-scheduler-secret",
    "Vary": "Origin",
  };
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let companyId: string | null = null;

    const scheduledSecret = req.headers.get("x-scheduler-secret");
    const isScheduled = scheduledSecret && scheduledSecret === Deno.env.get("SCHEDULER_SECRET");

    if (!isScheduled) {
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
      );

      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      }

      const { data: profile } = await supabase
        .from("users").select("company_id, role, status").eq("id", user.id).maybeSingle();

      if (!profile || profile.status !== "active") {
        return new Response(JSON.stringify({ error: "Account is not active" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
      }
      companyId = profile.company_id || null;
    } else {
      let body: Record<string, unknown> = {};
      try { body = await req.json(); } catch { /* empty body is ok */ }
      companyId = (body.company_id as string) || null;
    }

    if (!companyId) {
      return new Response(JSON.stringify({ error: "company_id required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const now = new Date();
    const notifications: any[] = [];
    let expiryCount = 0;

    const { data: compDocs } = await supabase
      .from("compliance_documents")
      .select("id, document_title, document_type, expiry_date, company_id")
      .eq("company_id", companyId)
      .not("expiry_date", "is", null);

    if (compDocs) {
      for (const doc of compDocs) {
        const expiry = new Date(doc.expiry_date);
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
        if (expiry < now) {
          expiryCount++;
          notifications.push({ company_id: companyId, type: "compliance", title: `Document Expired: ${doc.document_title}`, body: `${doc.document_type.replace(/_/g, " ")} expired on ${expiry.toLocaleDateString("en-GB")}`, severity: "critical", related_id: doc.id, related_type: "compliance_document", link: "/dashboard/compliance/documents" });
        } else if (daysLeft <= 7) {
          expiryCount++;
          notifications.push({ company_id: companyId, type: "compliance", title: `Expiring Soon: ${doc.document_title}`, body: `Expires in ${daysLeft} day(s)`, severity: "warning", related_id: doc.id, related_type: "compliance_document", link: "/dashboard/compliance/documents" });
        }
      }
    }

    const { data: certs } = await supabase
      .from("guard_certifications")
      .select("id, cert_name, cert_type, expiry_date, company_id")
      .eq("company_id", companyId)
      .not("expiry_date", "is", null);

    if (certs) {
      for (const cert of certs) {
        const expiry = new Date(cert.expiry_date);
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
        if (expiry < now) {
          expiryCount++;
          notifications.push({ company_id: companyId, type: "compliance", title: `Certification Expired: ${cert.cert_name}`, body: `${cert.cert_type} certification has expired`, severity: "critical", related_id: cert.id, related_type: "guard_certification", link: "/dashboard/compliance/documents" });
        } else if (daysLeft <= 30) {
          notifications.push({ company_id: companyId, type: "compliance", title: `Certification Expiring: ${cert.cert_name}`, body: `Expires in ${daysLeft} days`, severity: daysLeft <= 7 ? "warning" : "info", related_id: cert.id, related_type: "guard_certification", link: "/dashboard/compliance/documents" });
        }
      }
    }

    const { data: adminUsers } = await supabase
      .from("users")
      .select("id")
      .eq("company_id", companyId)
      .in("role", ["company_admin", "operations_manager"])
      .eq("status", "active");

    const userIds = (adminUsers || []).map((u: any) => u.id);

    for (const notif of notifications) {
      for (const uid of userIds) {
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("related_id", notif.related_id)
          .eq("related_type", notif.related_type)
          .eq("user_id", uid)
          .eq("type", notif.type)
          .gte("created_at", new Date(Date.now() - 86400000).toISOString())
          .maybeSingle();

        if (!existing) {
          await supabase.from("notifications").insert({ ...notif, user_id: uid });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, notifications_created: notifications.length * userIds.length, expiry_count: expiryCount }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "An error occurred during compliance check" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
