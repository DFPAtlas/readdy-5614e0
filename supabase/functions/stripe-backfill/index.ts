import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !supabaseUrl || !supabaseServiceKey) {
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

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden: super_admin required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" });

  const results = { invoices: 0, charges: 0, refunds: 0, disputes: 0, plans_reconciled: 0 };

  try {
    const invoices = await stripe.invoices.list({ limit: 100 });
    for (const inv of invoices.data) {
      const { data: company } = await admin.from("companies").select("id").eq("stripe_customer_id", inv.customer as string).maybeSingle();
      await admin.from("billing_invoices").upsert({
        stripe_invoice_id: inv.id,
        stripe_customer_id: inv.customer as string,
        stripe_subscription_id: inv.subscription as string | null,
        company_id: company?.id || null,
        number: inv.number,
        status: inv.status,
        collection_method: inv.collection_method,
        currency: inv.currency,
        subtotal: inv.subtotal,
        tax: inv.tax ?? 0,
        total: inv.total,
        amount_paid: inv.amount_paid,
        amount_due: inv.amount_due,
        amount_remaining: inv.amount_remaining ?? 0,
        invoice_date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
        due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
        paid_at: inv.status_transitions?.paid_at ? new Date(inv.status_transitions.paid_at * 1000).toISOString() : null,
        voided_at: inv.status_transitions?.voided_at ? new Date(inv.status_transitions.voided_at * 1000).toISOString() : null,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf_url: inv.invoice_pdf,
        attempt_count: inv.attempt_count ?? null,
        next_payment_attempt: inv.next_payment_attempt ? new Date(inv.next_payment_attempt * 1000).toISOString() : null,
        raw: inv as any,
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_invoice_id" });
    }
    results.invoices = invoices.data.length;

    const charges = await stripe.charges.list({ limit: 100 });
    for (const ch of charges.data) {
      const { data: company } = await admin.from("companies").select("id").eq("stripe_customer_id", ch.customer as string).maybeSingle();
      const pm = ch.payment_method_details?.card;
      await admin.from("billing_payments").upsert({
        stripe_charge_id: ch.id,
        stripe_payment_intent_id: ch.payment_intent as string | null,
        stripe_invoice_id: ch.invoice as string | null,
        stripe_customer_id: ch.customer as string | null,
        company_id: company?.id || null,
        status: ch.status,
        failure_code: ch.failure_code,
        failure_message: ch.failure_message,
        currency: ch.currency,
        amount: ch.amount,
        amount_captured: ch.amount_captured ?? null,
        amount_refunded: ch.amount_refunded ?? null,
        payment_method_type: ch.payment_method_details?.type || null,
        card_brand: pm?.brand || null,
        card_last4: pm?.last4 || null,
        card_country: pm?.country || null,
        receipt_url: ch.receipt_url,
        description: ch.description,
        paid_at: ch.paid && ch.created ? new Date(ch.created * 1000).toISOString() : null,
        raw: ch as any,
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_charge_id" });
    }
    results.charges = charges.data.length;

    const refunds = await stripe.refunds.list({ limit: 100 });
    for (const ref of refunds.data) {
      await admin.from("billing_refunds").upsert({
        stripe_refund_id: ref.id,
        stripe_charge_id: ref.charge as string | null,
        stripe_payment_intent_id: ref.payment_intent as string | null,
        company_id: null,
        amount: ref.amount,
        currency: ref.currency,
        status: ref.status,
        reason: ref.reason,
        failure_reason: ref.failure_reason,
        refunded_at: ref.created ? new Date(ref.created * 1000).toISOString() : null,
        raw: ref as any,
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_refund_id" });
    }
    results.refunds = refunds.data.length;

    const disputes = await stripe.disputes.list({ limit: 100 });
    for (const dsp of disputes.data) {
      await admin.from("billing_disputes").upsert({
        stripe_dispute_id: dsp.id,
        stripe_charge_id: dsp.charge as string,
        company_id: null,
        amount: dsp.amount,
        currency: dsp.currency,
        status: dsp.status,
        reason: dsp.reason,
        evidence_due_by: dsp.evidence_details?.due_by ? new Date(dsp.evidence_details.due_by * 1000).toISOString() : null,
        is_charge_refundable: dsp.is_charge_refundable,
        raw: dsp as any,
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_dispute_id" });
    }
    results.disputes = disputes.data.length;

    const { data: plans } = await admin.from("plans").select("*").eq("is_active", true);
    if (plans) {
      for (const plan of plans) {
        for (const interval of ["monthly", "yearly"]) {
          const col = interval === "yearly" ? "stripe_price_id_yearly" : "stripe_price_id_monthly";
          const existingId = (plan as any)[col];
          const lookupKey = `${plan.slug}-${interval}`;

          if (!existingId) {
            const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
            if (prices.data.length > 0) {
              await admin.from("plans").update({ [col]: prices.data[0].id, updated_at: new Date().toISOString() }).eq("id", plan.id);
              results.plans_reconciled++;
            }
          } else {
            try {
              const price = await stripe.prices.retrieve(existingId);
              if (!price.active) {
                await admin.from("plans").update({ [col]: null, updated_at: new Date().toISOString() }).eq("id", plan.id);
              }
            } catch {
              await admin.from("plans").update({ [col]: null, updated_at: new Date().toISOString() }).eq("id", plan.id);
            }
          }
        }
      }
    }

    await admin.from("admin_activity_log").insert({
      action: "billing_backfill",
      description: `Stripe backfill completed: ${results.invoices} invoices, ${results.charges} charges, ${results.refunds} refunds, ${results.disputes} disputes, ${results.plans_reconciled} plans reconciled`,
      company_id: null,
      performed_by: user.id,
      metadata: results,
    });

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
