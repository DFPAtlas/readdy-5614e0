import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================================
// SOLE ACTIVE STRIPE WEBHOOK — PRODUCTION
// ============================================================================
// This is the ONLY Stripe webhook endpoint configured for live/production use.
// There is no "enhanced-stripe-webhook" — that name does not exist in this
// codebase. Do NOT create a second webhook endpoint in the Stripe dashboard
// unless you also deploy its matching edge function here first.
//
// The stripe-webhook-test function is an admin-only testing tool (protected by
// SuperAdminGate on the frontend) and is NOT a real webhook receiver.
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await admin
    .from("billing_webhook_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ received: true, idempotent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let planSlugCache: Map<string, string> = new Map();

  async function getPlanSlugFromPriceId(priceId: string): Promise<string | null> {
    if (planSlugCache.has(priceId)) return planSlugCache.get(priceId) || null;
    const { data: plans } = await admin.from("plans").select("slug, stripe_price_id_monthly, stripe_price_id_yearly");
    if (!plans) return null;
    for (const p of plans) {
      if (p.stripe_price_id_monthly === priceId) {
        planSlugCache.set(priceId, p.slug);
        return p.slug;
      }
      if (p.stripe_price_id_yearly === priceId) {
        planSlugCache.set(priceId, p.slug);
        return p.slug;
      }
    }
    planSlugCache.set(priceId, "");
    return null;
  }

  function planSlugToLabel(slug: string): string {
    switch (slug) {
      case 'sentinel-starter': return 'Sentinel Starter';
      case 'sentinel': return 'GuardianHub Sentinel';
      case 'command': return 'GuardianHub Command';
      case 'titan': return 'GuardianHub Titan';
      default: return slug.charAt(0).toUpperCase() + slug.slice(1);
    }
  }

  async function syncCompanyModules(companyId: string, planSlug: string) {
    if (!companyId || !planSlug) return;

    const { data: planData } = await admin
      .from("plans")
      .select("id")
      .eq("slug", planSlug)
      .maybeSingle();

    if (!planData) return;

    const { data: features } = await admin
      .from("plan_features")
      .select("feature_key, included")
      .eq("plan_id", planData.id);

    const moduleFeatures = (features || []).filter((f) => f.feature_key.startsWith("module_"));

    const { data: modules } = await admin.from("modules").select("id, slug");

    if (!modules) return;

    for (const mf of moduleFeatures) {
      const moduleSlug = mf.feature_key.replace("module_", "");
      const module = modules.find((m) => m.slug === moduleSlug);
      if (!module) continue;

      const { data: existing } = await admin
        .from("company_enabled_modules")
        .select("id")
        .eq("company_id", companyId)
        .eq("module_id", module.id)
        .maybeSingle();

      if (mf.included) {
        if (!existing) {
          await admin.from("company_enabled_modules").insert({
            company_id: companyId,
            module_id: module.id,
            enabled: true,
            enabled_at: new Date().toISOString(),
          });
        } else {
          await admin.from("company_enabled_modules")
            .update({ enabled: true, enabled_at: new Date().toISOString() })
            .eq("id", existing.id);
        }
      } else {
        if (existing) {
          await admin.from("company_enabled_modules")
            .update({ enabled: false })
            .eq("id", existing.id);
        }
      }
    }
  }

  async function disablePremiumModules(companyId: string) {
    if (!companyId) return;
    const premiumSlugs = ['ai_assistant', 'client_portal', 'patrols', 'sop_builder'];
    const { data: modules } = await admin.from("modules").select("id, slug");
    if (!modules) return;
    const premiumIds = modules.filter((m) => premiumSlugs.includes(m.slug)).map((m) => m.id);
    if (premiumIds.length === 0) return;
    await admin
      .from("company_enabled_modules")
      .update({ enabled: false })
      .eq("company_id", companyId)
      .in("module_id", premiumIds);
  }

  try {
    const logRow = {
      stripe_event_id: event.id,
      type: event.type,
      livemode: event.livemode,
      raw: event as any,
      received_at: new Date().toISOString(),
    };

    const { error: logErr } = await admin.from("billing_webhook_events").insert(logRow);
    if (logErr) throw logErr;

    const companyLookup = async (customerId: string) => {
      const { data } = await admin.from("companies").select("id").eq("stripe_customer_id", customerId).maybeSingle();
      return data?.id || null;
    };

    const updateCompanySubscription = async (customerId: string, updates: Record<string, any>) => {
      const { data: company } = await admin
        .from("companies")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (!company) return;
      const { error } = await admin.from("companies").update(updates).eq("id", company.id);
      if (error) throw error;
      return company.id;
    };

    const handleInvoice = async (inv: any) => {
      const companyId = await companyLookup(inv.customer);
      const row = {
        stripe_invoice_id: inv.id,
        stripe_customer_id: inv.customer,
        stripe_subscription_id: inv.subscription || null,
        company_id: companyId,
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
        raw: inv,
        updated_at: new Date().toISOString(),
      };
      await admin.from("billing_invoices").upsert(row, { onConflict: "stripe_invoice_id" });

      if (inv.subscription && inv.status === "open" && (inv.attempt_count ?? 0) > 0) {
        await updateCompanySubscription(inv.customer, { subscription_status: "past_due", updated_at: new Date().toISOString() });
        const cid = await companyLookup(inv.customer);
        if (cid) await disablePremiumModules(cid);
      }
      if (inv.subscription && inv.status === "paid") {
        await updateCompanySubscription(inv.customer, { subscription_status: "active", updated_at: new Date().toISOString() });
      }
    };

    const handleCharge = async (ch: any) => {
      const companyId = ch.customer ? await companyLookup(ch.customer) : null;
      const pm = ch.payment_method_details?.card;
      const row = {
        stripe_charge_id: ch.id,
        stripe_payment_intent_id: ch.payment_intent || null,
        stripe_invoice_id: ch.invoice || null,
        stripe_customer_id: ch.customer || null,
        company_id: companyId,
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
        raw: ch,
        updated_at: new Date().toISOString(),
      };
      await admin.from("billing_payments").upsert(row, { onConflict: "stripe_charge_id" });
    };

    const handleRefund = async (ref: any) => {
      const row = {
        stripe_refund_id: ref.id,
        stripe_charge_id: ref.charge || null,
        stripe_payment_intent_id: ref.payment_intent || null,
        company_id: null,
        amount: ref.amount,
        currency: ref.currency,
        status: ref.status,
        reason: ref.reason,
        failure_reason: ref.failure_reason,
        refunded_at: ref.created ? new Date(ref.created * 1000).toISOString() : null,
        raw: ref,
        updated_at: new Date().toISOString(),
      };
      await admin.from("billing_refunds").upsert(row, { onConflict: "stripe_refund_id" });
    };

    const handleDispute = async (dsp: any) => {
      const row = {
        stripe_dispute_id: dsp.id,
        stripe_charge_id: dsp.charge,
        company_id: null,
        amount: dsp.amount,
        currency: dsp.currency,
        status: dsp.status,
        reason: dsp.reason,
        evidence_due_by: dsp.evidence_details?.due_by ? new Date(dsp.evidence_details.due_by * 1000).toISOString() : null,
        is_charge_refundable: dsp.is_charge_refundable,
        raw: dsp,
        updated_at: new Date().toISOString(),
      };
      await admin.from("billing_disputes").upsert(row, { onConflict: "stripe_dispute_id" });
    };

    const handleSubscriptionEvent = async (sub: any, type: string) => {
      const companyId = sub.customer ? await companyLookup(sub.customer) : null;
      const prev = (event.data as any).previous_attributes || {};
      const priceId = sub.items?.data?.[0]?.plan?.id || null;

      await admin.from("billing_subscription_events").insert({
        stripe_event_id: event.id,
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer || null,
        company_id,
        event_type: type,
        previous_status: prev.status || null,
        new_status: sub.status || null,
        previous_plan: prev.plan?.id || null,
        new_plan: priceId,
        cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        notes: null,
        raw: sub,
        created_at: new Date().toISOString(),
      });

      if (sub.customer && sub.status) {
        const updates: Record<string, any> = {
          subscription_status: sub.status,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer,
          updated_at: new Date().toISOString(),
        };
        const interval = sub.items?.data?.[0]?.plan?.interval;
        if (interval) {
          updates.subscription_billing = interval;
        }
        if (sub.current_period_end) {
          updates.subscription_period_end = new Date(sub.current_period_end * 1000).toISOString();
        }
        if (sub.cancel_at) {
          updates.subscription_cancel_at = new Date(sub.cancel_at * 1000).toISOString();
        }
        if (priceId) {
          const slug = await getPlanSlugFromPriceId(priceId);
          if (slug) {
            updates.subscription_plan = slug;
            updates.plan_name = planSlugToLabel(slug);
          }
        }
        await updateCompanySubscription(sub.customer, updates);

        if (priceId) {
          const slug = await getPlanSlugFromPriceId(priceId);
          if (slug && companyId) {
            if (sub.status === 'active' || sub.status === 'trialing') {
              await syncCompanyModules(companyId, slug);
            } else if (sub.status === 'canceled' || sub.status === 'past_due' || sub.status === 'unpaid') {
              await disablePremiumModules(companyId);
            }
          }
        }
      }
    };

    const handleCheckoutSession = async (session: any) => {
      if (session.customer && session.subscription) {
        const meta = session.metadata || {};
        const updates: Record<string, any> = {
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        };
        if (meta.selected_plan) {
          updates.subscription_plan = meta.selected_plan;
          updates.plan_name = planSlugToLabel(meta.selected_plan);
        }
        if (meta.billing_interval) {
          updates.subscription_billing = meta.billing_interval;
        }

        const sub = await stripe.subscriptions.retrieve(session.subscription);
        if (sub.current_period_end) {
          updates.subscription_period_end = new Date(sub.current_period_end * 1000).toISOString();
        }
        if (sub.cancel_at) {
          updates.subscription_cancel_at = new Date(sub.cancel_at * 1000).toISOString();
        }

        await updateCompanySubscription(session.customer, updates);

        const companyId = await companyLookup(session.customer);
        if (companyId && meta.selected_plan) {
          await syncCompanyModules(companyId, meta.selected_plan);
        }
      }
    };

    if (event.type === "checkout.session.completed") {
      await handleCheckoutSession(event.data.object);
    } else if (event.type.startsWith("invoice.")) {
      await handleInvoice(event.data.object);
    } else if (event.type.startsWith("charge.")) {
      await handleCharge(event.data.object);
    } else if (event.type.startsWith("refund.")) {
      await handleRefund(event.data.object);
    } else if (event.type.startsWith("charge.dispute.")) {
      await handleDispute(event.data.object);
    } else if (event.type.startsWith("customer.subscription.")) {
      await handleSubscriptionEvent(event.data.object, event.type);
    }

    await admin
      .from("billing_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    await admin
      .from("billing_webhook_events")
      .update({ error: err.message, processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
