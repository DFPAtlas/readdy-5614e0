import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!stripeSecret || !supabaseUrl) {
    return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY or SUPABASE_URL" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
  const webhookUrl = `${supabaseUrl}/functions/v1/stripe-webhook`;

  const requiredEvents = [
    "checkout.session.completed",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "customer.subscription.created",
    "charge.succeeded",
    "charge.failed",
    "invoice.created",
  ];

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const existing = endpoints.data.find((e) => e.url === webhookUrl);

    if (existing) {
      const missing = requiredEvents.filter((ev) => !existing.enabled_events.includes(ev));
      if (missing.length > 0) {
        const updated = await stripe.webhookEndpoints.update(existing.id, {
          enabled_events: Array.from(new Set([...existing.enabled_events, ...missing])),
        });
        return new Response(
          JSON.stringify({
            message: "Webhook endpoint already existed. Added missing events.",
            id: updated.id,
            url: updated.url,
            enabled_events: updated.enabled_events,
            secret_exists: !!existing.secret,
            note: "The webhook signing secret was already generated. Find it in your Stripe Dashboard → Developers → Webhooks if you need to re-copy it.",
          }, null, 2),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Webhook endpoint already registered with all required events.",
          id: existing.id,
          url: existing.url,
          enabled_events: existing.enabled_events,
          note: "If you need the signing secret, retrieve it from Stripe Dashboard → Developers → Webhooks.",
        }, null, 2),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const created = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: requiredEvents,
      description: "GuardianHub billing webhooks",
    });

    return new Response(
      JSON.stringify({
        message: "Webhook endpoint created successfully.",
        id: created.id,
        url: created.url,
        enabled_events: created.enabled_events,
        signing_secret: created.secret,
        next_steps: [
          "1. Copy the signing_secret above",
          "2. Save it as a Supabase Edge Function secret named STRIPE_WEBHOOK_SECRET",
          "3. The webhook handler is now live",
        ],
      }, null, 2),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message, type: err.type }, null, 2),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
