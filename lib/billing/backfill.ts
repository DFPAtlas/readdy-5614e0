import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function backfillInvoices() {
  console.log("Backfilling invoices...");
  const invoices = await stripe.invoices.list({ limit: 100 });
  for (const inv of invoices.data) {
    const { data: company } = await admin
      .from("companies")
      .select("id")
      .eq("stripe_customer_id", inv.customer as string)
      .maybeSingle();

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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_invoice_id" });
  }
  console.log(`Synced ${invoices.data.length} invoices`);
}

async function backfillCharges() {
  console.log("Backfilling charges...");
  const charges = await stripe.charges.list({ limit: 100 });
  for (const ch of charges.data) {
    const { data: company } = await admin
      .from("companies")
      .select("id")
      .eq("stripe_customer_id", ch.customer as string)
      .maybeSingle();

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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_charge_id" });
  }
  console.log(`Synced ${charges.data.length} charges`);
}

async function backfillRefunds() {
  console.log("Backfilling refunds...");
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_refund_id" });
  }
  console.log(`Synced ${refunds.data.length} refunds`);
}

async function backfillDisputes() {
  console.log("Backfilling disputes...");
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_dispute_id" });
  }
  console.log(`Synced ${disputes.data.length} disputes`);
}

async function main() {
  console.log("Starting Stripe backfill...");
  await backfillInvoices();
  await backfillCharges();
  await backfillRefunds();
  await backfillDisputes();
  console.log("Backfill complete!");
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});