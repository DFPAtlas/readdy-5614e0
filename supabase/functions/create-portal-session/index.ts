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

    const billingRoles = ["company_admin", "super_admin", "operations_manager"];
    if (!billingRoles.includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Only company administrators can manage billing" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("stripe_customer_id")
      .eq("id", profile.company_id)
      .maybeSingle();

    if (companyError || !company?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "No Stripe customer found. Please subscribe first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const returnUrl = body.returnUrl && body.returnUrl.startsWith("https://")
      ? body.returnUrl
      : canonicalUrl || req.headers.get("origin") || "https://guardianhub.app";

    const allowedReturnPath = `${canonicalUrl || returnUrl}/dashboard/settings`;
    const finalReturnUrl = returnUrl.startsWith(allowedReturnPath.split("/").slice(0, 3).join("/"))
      ? returnUrl
      : allowedReturnPath;

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" });

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: finalReturnUrl,
      configuration: {
        features: {
          subscription_update: {
            enabled: true,
            default_allowed_updates: ["price", "quantity"],
            proration_behavior: "create_prorations",
          },
          subscription_cancel: {
            enabled: true,
            mode: "at_period_end",
            cancellation_reason: {
              enabled: true,
              options: ["too_expensive", "missing_features", "switched_service", "unused", "other"],
            },
          },
        },
      },
    });

    await supabase.from("admin_activity_log").insert({
      action: "portal_created",
      description: "Stripe Customer Portal session opened",
      company_id: profile.company_id,
      performed_by: user.id,
      metadata: { stripe_customer_id: company.stripe_customer_id },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Portal error:", err.message);
    return new Response(
      JSON.stringify({ error: "Failed to open billing portal. Please try again." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
