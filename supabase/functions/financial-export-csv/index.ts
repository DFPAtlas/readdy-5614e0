import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatMoney(pence: number, currency = "gbp"): string {
  const symbol = currency.toLowerCase() === "gbp" ? "£" : currency.toUpperCase() === "USD" ? "$" : currency.toUpperCase();
  const val = pence / 100;
  return `${symbol}${val.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function daysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function buildCSV(headers: string[], rows: (string | number | null)[][]): string {
  const escape = (val: string | number | null) => {
    if (val === null || val === undefined) return "";
    const s = String(val).replace(/"/g, '""');
    return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
  };
  const lines = [headers.map(escape).join(",")];
  rows.forEach((row) => lines.push(row.map(escape).join(",")));
  return lines.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden: super_admin required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "overview";
  let filename = "export.csv";
  let csv = "";

  if (type === "invoices") {
    filename = "invoices.csv";
    const { data } = await admin
      .from("billing_invoices")
      .select("*, company:company_id(name)")
      .order("created_at", { ascending: false })
      .limit(5000);
    const rows = (data || []).map((r: any) => [
      r.number, r.company?.name || r.stripe_customer_id, r.stripe_customer_id, r.status,
      formatMoney(r.total, r.currency), formatMoney(r.subtotal, r.currency), formatMoney(r.tax, r.currency),
      r.currency?.toUpperCase(), formatDate(r.due_date), formatDate(r.paid_at), formatDate(r.created_at),
    ]);
    csv = buildCSV(["Invoice Number", "Company", "Stripe Customer ID", "Status", "Gross", "Net", "VAT", "Currency", "Due Date", "Paid Date", "Created"], rows);
  } else if (type === "failed") {
    filename = "failed-overdue.csv";
    const { data } = await admin.from("v_billing_overdue").select("*").order("due_date", { ascending: false }).limit(5000);
    const rows = (data || []).map((r: any) => [
      r.company_name, r.contact_email, r.number,
      formatMoney(r.total, r.currency), formatMoney(r.amount_due, r.currency),
      formatDate(r.due_date), daysOverdue(r.due_date), r.status, r.attempt_count ?? 0,
    ]);
    csv = buildCSV(["Company", "Contact Email", "Invoice", "Total", "Amount Due", "Due Date", "Days Overdue", "Status", "Attempts"], rows);
  } else if (type === "refunds") {
    filename = "refunds.csv";
    const { data } = await admin
      .from("billing_refunds")
      .select("*, company:company_id(name)")
      .order("created_at", { ascending: false })
      .limit(5000);
    const rows = (data || []).map((r: any) => [
      r.stripe_refund_id, r.stripe_charge_id, r.stripe_payment_intent_id,
      formatMoney(r.amount, r.currency), r.reason || "—", r.status, formatDateTime(r.created_at),
    ]);
    csv = buildCSV(["Refund ID", "Charge ID", "Payment Intent", "Amount", "Reason", "Status", "Created"], rows);
  } else if (type === "disputes") {
    filename = "disputes.csv";
    const { data } = await admin
      .from("billing_disputes")
      .select("*, company:company_id(name)")
      .order("created_at", { ascending: false })
      .limit(5000);
    const rows = (data || []).map((r: any) => [
      r.stripe_dispute_id, r.company?.name || "—", formatMoney(r.amount, r.currency),
      r.reason || "—", r.status, formatDate(r.evidence_due_by), formatDateTime(r.created_at),
    ]);
    csv = buildCSV(["Dispute ID", "Company", "Amount", "Reason", "Status", "Evidence Due", "Created"], rows);
  } else if (type === "tax") {
    filename = "vat-report.csv";
    const { data } = await admin.from("v_billing_tax_monthly").select("*").order("month", { ascending: false }).limit(5000);
    const rows = (data || []).map((r: any) => [
      r.month, formatMoney(r.gross_pence, r.currency), formatMoney(r.net_pence, r.currency),
      formatMoney(r.vat_pence, r.currency), r.currency?.toUpperCase(), `${r.effective_vat_pct}%`,
    ]);
    csv = buildCSV(["Month", "Gross Revenue", "Net Revenue", "VAT Collected", "Currency", "Effective VAT %"], rows);
  } else {
    filename = "overview.csv";
    const { data: rev } = await admin.from("v_billing_revenue_monthly").select("*").order("month", { ascending: false }).limit(5000);
    const rows = (rev || []).map((r: any) => [
      r.month, r.invoice_count, formatMoney(r.gross_pence, r.currency),
      formatMoney(r.net_pence, r.currency), formatMoney(r.vat_pence, r.currency), r.currency?.toUpperCase(),
    ]);
    csv = buildCSV(["Month", "Invoice Count", "Gross Revenue", "Net Revenue", "VAT", "Currency"], rows);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...corsHeaders,
    },
  });
});
