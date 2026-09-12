import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";

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
    return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY or SUPABASE_URL" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
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

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" });
  const webhookUrl = `${supabaseUrl}/functions/v1/stripe-webhook`;

  const requiredEvents = [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
    "invoice.finalized",
    "invoice.voided",
    "charge.succeeded",
    "charge.failed",
    "charge.dispute.created",
    "charge.dispute.updated",
    "charge.dispute.closed",
    "charge.refund.updated",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
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
            message: "Webhook updated with missing events.",
            id: updated.id,
            url: updated.url,
            enabled_events: updated.enabled_events,
            secret_exists: !!existing.secret,
          }, null, 2),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Webhook already registered with all required events.",
          id: existing.id,
          url: existing.url,
          enabled_events: existing.enabled_events,
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
