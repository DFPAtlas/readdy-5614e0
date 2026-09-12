import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
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

    const admin = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await admin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { feature_key, limit_key, company_id: bodyCompanyId } = body || {};

    const { data: profile } = await admin
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.company_id) {
      return new Response(JSON.stringify({ allowed: false, reason: "No company membership" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const companyId = profile.company_id;

    const { data: company } = await admin
      .from("companies")
      .select("subscription_plan, subscription_status, account_status")
      .eq("id", companyId)
      .maybeSingle();

    if (!company) {
      return new Response(JSON.stringify({ allowed: false, reason: "Company not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (company.account_status === "suspended") {
      return new Response(JSON.stringify({ allowed: false, reason: "Company account is suspended" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!company.subscription_plan || !["active", "trialing"].includes(company.subscription_status || "")) {
      return new Response(JSON.stringify({ allowed: false, reason: "No active subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (limit_key) {
      const limitChecks: Record<string, { table: string; planField: string }> = {
        max_sites: { table: "sites", planField: "max_sites" },
        max_guards: { table: "guards", planField: "max_guards" },
      };

      const check = limitChecks[limit_key];
      if (check) {
        const { data: plan } = await admin
          .from("plans")
          .select(check.planField)
          .eq("slug", company.subscription_plan)
          .maybeSingle();

        const limit = plan?.[check.planField] ?? 0;
        if (limit <= 0 || limit >= 9999) {
          return new Response(JSON.stringify({ allowed: true, limit: null, usage: null, unlimited: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { count } = await admin
          .from(check.table)
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId);

        const usage = count || 0;
        if (usage >= limit) {
          return new Response(JSON.stringify({ allowed: false, reason: `Limit reached: ${usage}/${limit}`, limit, usage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ allowed: true, limit, usage }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (feature_key) {
      const { data: plan } = await admin
        .from("plans")
        .select("id")
        .eq("slug", company.subscription_plan)
        .maybeSingle();

      if (!plan) {
        return new Response(JSON.stringify({ allowed: false, reason: "Plan not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: feature } = await admin
        .from("plan_features")
        .select("included")
        .eq("plan_id", plan.id)
        .eq("feature_key", feature_key)
        .maybeSingle();

      if (!feature?.included) {
        const { data: moduleFeature } = await admin
          .from("plan_features")
          .select("included")
          .eq("plan_id", plan.id)
          .eq("feature_key", `module_${feature_key}`)
          .maybeSingle();

        if (!moduleFeature?.included) {
          return new Response(JSON.stringify({ allowed: false, reason: `Feature "${feature_key}" not included in current plan` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ allowed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
