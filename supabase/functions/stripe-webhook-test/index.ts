import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
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

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await supabaseClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden — super_admin role required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: any = {};
  try { body = await req.json(); } catch {}

  const companyId = body.company_id;
  const testEvent = body.test_event || "checkout.session.completed";

  if (!companyId) {
    return new Response(JSON.stringify({ error: "company_id is required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: company, error: companyErr } = await admin
    .from("companies")
    .select("id, name, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_billing")
    .eq("id", companyId)
    .maybeSingle();

  if (companyErr) {
    return new Response(JSON.stringify({ error: companyErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!company) {
    return new Response(JSON.stringify({ error: "Company not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const before = {
    subscription_status: company.subscription_status,
    stripe_subscription_id: company.stripe_subscription_id,
    subscription_billing: company.subscription_billing,
  };

  let expectedStatus = company.subscription_status;
  let expectedSubId = company.stripe_subscription_id;
  let expectedBilling = company.subscription_billing;
  let notes: string[] = [];

  if (testEvent === "checkout.session.completed") {
    expectedStatus = "active";
    expectedSubId = "sub_test_" + crypto.randomUUID().slice(0, 8);
    notes.push("Simulated checkout.session.completed");
  } else if (testEvent === "customer.subscription.updated") {
    expectedStatus = body.new_status || "active";
    expectedSubId = company.stripe_subscription_id || "sub_test_" + crypto.randomUUID().slice(0, 8);
    expectedBilling = body.subscription_billing || company.subscription_billing || "month";
    notes.push(`Simulated subscription updated to ${expectedStatus}`);
  } else if (testEvent === "invoice.payment_failed") {
    expectedStatus = "past_due";
    notes.push("Simulated invoice.payment_failed");
  } else if (testEvent === "customer.subscription.deleted") {
    expectedStatus = "canceled";
    notes.push("Simulated subscription deleted");
  } else {
    notes.push("Unknown test_event, no changes applied");
  }

  const updates: Record<string, any> = {
    subscription_status: expectedStatus,
    updated_at: new Date().toISOString(),
  };
  if (expectedSubId) updates.stripe_subscription_id = expectedSubId;
  if (expectedBilling) updates.subscription_billing = expectedBilling;

  const { error: updateErr } = await admin.from("companies").update(updates).eq("id", companyId);

  if (updateErr) {
    return new Response(JSON.stringify({ error: updateErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await admin.from("admin_activity_log").insert({
    action: "webhook_test",
    description: `Test webhook "${testEvent}" applied to ${company.name}`,
    company_id: companyId,
    performed_by: user.id,
    metadata: { test_event: testEvent, before, updates },
  });

  const { data: after } = await admin
    .from("companies")
    .select("subscription_status, stripe_subscription_id, subscription_billing")
    .eq("id", companyId)
    .maybeSingle();

  return new Response(
    JSON.stringify({
      test_event: testEvent,
      company_id: companyId,
      company_name: company.name,
      before,
      after,
      expected: {
        subscription_status: expectedStatus,
        stripe_subscription_id: expectedSubId,
        subscription_billing: expectedBilling,
      },
      notes,
      passed:
        after?.subscription_status === expectedStatus &&
        after?.stripe_subscription_id === expectedSubId,
    }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
