// SERVER-SIDE ONLY — DO NOT IMPORT IN BROWSER CODE.
// Sync utilities for Stripe billing data. Used by edge functions or CLI tools.
// Requires STRIPE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY.

import { getStripe } from "./stripe";
import { getSupabaseAdmin } from "./supabase-admin";

export async function syncInvoice(stripeInvoiceId: string) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();

  const inv = await stripe.invoices.retrieve(stripeInvoiceId);

  const companyRes = await admin
    .from("companies")
    .select("id")
    .eq("stripe_customer_id", inv.customer as string)
    .maybeSingle();

  const companyId = companyRes.data?.id || null;

  const row = {
    stripe_invoice_id: inv.id,
    stripe_customer_id: inv.customer as string,
    stripe_subscription_id: inv.subscription as string | null,
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
    paid_at: inv.status_transitions?.paid_at
      ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
      : null,
    voided_at: inv.status_transitions?.voided_at
      ? new Date(inv.status_transitions.voided_at * 1000).toISOString()
      : null,
    hosted_invoice_url: inv.hosted_invoice_url,
    invoice_pdf_url: inv.invoice_pdf,
    attempt_count: inv.attempt_count ?? null,
    next_payment_attempt: inv.next_payment_attempt
      ? new Date(inv.next_payment_attempt * 1000).toISOString()
      : null,
    raw: inv as any,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("billing_invoices")
    .upsert(row, { onConflict: "stripe_invoice_id" });

  if (error) throw error;
}

export async function syncPayment(stripeChargeId: string) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();

  const ch = await stripe.charges.retrieve(stripeChargeId);

  const companyRes = await admin
    .from("companies")
    .select("id")
    .eq("stripe_customer_id", ch.customer as string)
    .maybeSingle();

  const companyId = companyRes.data?.id || null;

  const pm = ch.payment_method_details?.card;

  const row = {
    stripe_charge_id: ch.id,
    stripe_payment_intent_id: ch.payment_intent as string | null,
    stripe_invoice_id: ch.invoice as string | null,
    stripe_customer_id: ch.customer as string | null,
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
    raw: ch as any,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("billing_payments")
    .upsert(row, { onConflict: "stripe_charge_id" });

  if (error) throw error;
}

export async function syncRefund(stripeRefundId: string) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();

  const ref = await stripe.refunds.retrieve(stripeRefundId);

  const companyRes = await admin
    .from("companies")
    .select("id")
    .eq("stripe_customer_id", (ref.charge as string))
    .maybeSingle();

  const companyId = companyRes.data?.id || null;

  const row = {
    stripe_refund_id: ref.id,
    stripe_charge_id: ref.charge as string | null,
    stripe_payment_intent_id: ref.payment_intent as string | null,
    company_id: companyId,
    amount: ref.amount,
    currency: ref.currency,
    status: ref.status,
    reason: ref.reason,
    failure_reason: ref.failure_reason,
    refunded_at: ref.created ? new Date(ref.created * 1000).toISOString() : null,
    raw: ref as any,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("billing_refunds")
    .upsert(row, { onConflict: "stripe_refund_id" });

  if (error) throw error;
}

export async function syncDispute(stripeDisputeId: string) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();

  const dsp = await stripe.disputes.retrieve(stripeDisputeId);

  const companyRes = await admin
    .from("companies")
    .select("id")
    .eq("stripe_customer_id", (dsp.charge as string))
    .maybeSingle();

  const companyId = companyRes.data?.id || null;

  const row = {
    stripe_dispute_id: dsp.id,
    stripe_charge_id: dsp.charge as string,
    company_id: companyId,
    amount: dsp.amount,
    currency: dsp.currency,
    status: dsp.status,
    reason: dsp.reason,
    evidence_due_by: dsp.evidence_details?.due_by
      ? new Date(dsp.evidence_details.due_by * 1000).toISOString()
      : null,
    is_charge_refundable: dsp.is_charge_refundable,
    raw: dsp as any,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("billing_disputes")
    .upsert(row, { onConflict: "stripe_dispute_id" });

  if (error) throw error;
}

export async function logSubscriptionEvent(event: {
  stripe_event_id?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  company_id?: string | null;
  event_type: string;
  previous_status?: string;
  new_status?: string;
  previous_plan?: string;
  new_plan?: string;
  cancel_at?: string | null;
  canceled_at?: string | null;
  notes?: string;
  raw: any;
}) {
  const admin = getSupabaseAdmin();

  const { error } = await admin.from("billing_subscription_events").insert({
    stripe_event_id: event.stripe_event_id,
    stripe_subscription_id: event.stripe_subscription_id,
    stripe_customer_id: event.stripe_customer_id,
    company_id: event.company_id,
    event_type: event.event_type,
    previous_status: event.previous_status,
    new_status: event.new_status,
    previous_plan: event.previous_plan,
    new_plan: event.new_plan,
    cancel_at: event.cancel_at,
    canceled_at: event.canceled_at,
    notes: event.notes,
    raw: event.raw,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}