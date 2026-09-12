import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateIdempotencyKey(companyId: string, plan: string, billing: string): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 13);
  return `ck_${companyId.slice(0, 8)}_${plan}_${billing}_${datePart}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const canonicalUrl = Deno.env.get("CANONICAL_APP_URL");

    if (!stripeSecret || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("company_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.company_id) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.role === "suspended" || profile.role === "removed") {
      return new Response(
        JSON.stringify({ error: "Account is not active" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let checkoutBody: any;
    try { checkoutBody = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { plan, billing, returnUrl } = checkoutBody;

    if (!plan || !billing) {
      return new Response(
        JSON.stringify({ error: "Missing plan or billing parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planLower = plan.toLowerCase();
    const billingLower = billing.toLowerCase();

    if (!["monthly", "yearly"].includes(billingLower)) {
      return new Response(
        JSON.stringify({ error: "Invalid billing interval" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: planRecord, error: planQueryError } = await supabase
      .from("plans")
      .select("id, name, slug, stripe_price_id_monthly, stripe_price_id_yearly, is_contact_only, is_active, monthly_price, yearly_price")
      .eq("slug", planLower)
      .maybeSingle();

    if (planQueryError || !planRecord) {
      return new Response(
        JSON.stringify({ error: `Plan "${planLower}" not found in database` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!planRecord.is_active) {
      return new Response(
        JSON.stringify({ error: `Plan "${planLower}" is not currently available` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (planRecord.is_contact_only) {
      return new Response(
        JSON.stringify({ error: `Plan "${planLower}" requires contacting sales. Please visit /contact.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" });
    const priceIdColumn = billingLower === "yearly" ? "stripe_price_id_yearly" : "stripe_price_id_monthly";
    let resolvedPriceId = (planRecord as any)[priceIdColumn] || null;

    if (resolvedPriceId) {
      try {
        const price = await stripe.prices.retrieve(resolvedPriceId);
        if (!price.active) {
          resolvedPriceId = null;
        }
        if (price.recurring?.interval !== (billingLower === "yearly" ? "year" : "month")) {
          resolvedPriceId = null;
        }
        if (price.currency !== "gbp") {
          resolvedPriceId = null;
        }
      } catch {
        resolvedPriceId = null;
      }
    }

    if (!resolvedPriceId) {
      const lookupKey = `${planLower}-${billingLower}`;
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        active: true,
        limit: 1,
      });

      if (!prices.data.length) {
        return new Response(
          JSON.stringify({
            error: `No ${billingLower} price configured for ${planRecord.name}. Please create a Stripe price with lookup_key "${lookupKey}" or contact support.`
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      resolvedPriceId = prices.data[0].id;

      await supabase
        .from("plans")
        .update({ [priceIdColumn]: resolvedPriceId, updated_at: new Date().toISOString() })
        .eq("id", planRecord.id);
    }

    const origin = returnUrl && returnUrl.startsWith("https://")
      ? returnUrl
      : canonicalUrl || req.headers.get("origin") || "https://guardianhub.app";

    const { data: company } = await supabase
      .from("companies")
      .select("stripe_customer_id, subscription_status, stripe_subscription_id")
      .eq("id", profile.company_id)
      .maybeSingle();

    if (!company) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const activeStatuses = ["active", "trialing", "past_due"];
    if (company.subscription_status && activeStatuses.includes(company.subscription_status)) {
      return new Response(
        JSON.stringify({
          error: "You already have an active subscription. Use the Customer Portal to change your plan.",
          code: "DUPLICATE",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let customerId = company.stripe_customer_id || undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { company_id: profile.company_id, user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("companies")
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", profile.company_id);
    }

    const idempotencyKey = generateIdempotencyKey(profile.company_id, planLower, billingLower);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer: customerId,
      metadata: {
        company_id: profile.company_id,
        user_id: user.id,
        selected_plan: planLower,
        billing_interval: billingLower,
        stripe_price_id: resolvedPriceId,
        stripe_customer_id: customerId,
      },
      subscription_data: {
        metadata: {
          company_id: profile.company_id,
          selected_plan: planLower,
        },
      },
    };

    const isNewCustomer = !company.stripe_customer_id;
    if (isNewCustomer) {
      sessionParams.subscription_data!.trial_period_days = 15;
    }

    const session = await stripe.checkout.sessions.create(sessionParams, {
      idempotencyKey,
    });

    await supabase.from("admin_activity_log").insert({
      action: "checkout_created",
      description: `Checkout session created for plan ${planRecord.name} (${billingLower})`,
      company_id: profile.company_id,
      performed_by: user.id,
      metadata: {
        plan: planLower,
        billing: billingLower,
        session_id: session.id,
        stripe_price_id: resolvedPriceId,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Checkout error:", err.message);
    return new Response(
      JSON.stringify({ error: "Checkout failed. Please try again or contact support." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
