import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.company_id) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { plan, billing, returnUrl } = await req.json();

    const priceKey = `STRIPE_PRICE_${plan.toUpperCase()}_${billing.toUpperCase()}`;
    const priceId = Deno.env.get(priceKey);

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `Price not configured for ${plan} ${billing}. Ask your admin to set the ${priceKey} secret in Supabase.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
    const origin = returnUrl || req.headers.get("origin") || "https://guardin-hub.uk";

    // Validate the price exists before creating a session
    try {
      await stripe.prices.retrieve(priceId);
    } catch (priceErr: any) {
      if (priceErr?.message?.includes("No such price")) {
        return new Response(
          JSON.stringify({
            error: `The Stripe price ID "${priceId}" does not exist in your Stripe account. This usually means:\n1. The price was created in Test mode but your secret key is Live (or vice versa)\n2. The price was deleted from Stripe\n3. You're using the wrong Stripe account\n\nTo fix: go to your Stripe Dashboard → Products → find the product → copy the correct Price ID, then update the "${priceKey}" secret in Supabase Edge Function secrets.`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw priceErr;
    }

    const { data: company } = await supabase
      .from("companies")
      .select("stripe_customer_id")
      .eq("id", profile.company_id)
      .maybeSingle();

    const customerId = company?.stripe_customer_id || undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer: customerId,
      customer_creation: customerId ? undefined : "always",
      metadata: {
        company_id: profile.company_id,
        user_id: user.id,
        plan,
        billing,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});