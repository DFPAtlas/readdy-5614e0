import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Missing token");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { worker_id, site_id, shift_start, shift_end } = await req.json();

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id, company_id, roles!inner(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!roles || roles.length === 0) throw new Error("No company membership");

    const companyId = roles[0].company_id;

    const { data: wp } = await supabase
      .from("workforce_profiles")
      .select("*")
      .eq("id", worker_id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (!wp) throw new Error("Worker not found");

    const reasons: string[] = [];
    const warnings: string[] = [];
    let eligible = true;

    if (!["active", "restricted"].includes(wp.employment_status)) {
      reasons.push(`Worker status is ${wp.employment_status}, not active`);
      eligible = false;
    }

    const { data: licences } = await supabase
      .from("sia_licences")
      .select("*")
      .eq("worker_id", worker_id)
      .eq("company_id", companyId);

    const validLicence = (licences || []).some((l: any) =>
      l.status === "verified_valid" &&
      l.expiry_date &&
      new Date(l.expiry_date) > new Date()
    );

    if (!validLicence && wp.employment_status === "active") {
      warnings.push("No valid SIA licence on file");
    }

    const { data: training } = await supabase
      .from("training_completions")
      .select("*, training_modules!inner(is_mandatory)")
      .eq("guard_id", wp.guard_id)
      .eq("company_id", companyId);

    const expiredMandatory = (training || []).filter((t: any) =>
      t.training_modules?.is_mandatory &&
      t.expires_at &&
      new Date(t.expires_at) < new Date()
    );

    if (expiredMandatory.length > 0) {
      reasons.push(`${expiredMandatory.length} mandatory training(s) expired`);
      eligible = false;
    }

    const { data: screening } = await supabase
      .from("screening_items")
      .select("*, screening_requirements!inner(is_mandatory)")
      .eq("worker_id", worker_id)
      .eq("company_id", companyId);

    const failedScreening = (screening || []).filter((s: any) =>
      s.screening_requirements?.is_mandatory &&
      !["completed", "resolved", "waived"].includes(s.status)
    );

    if (failedScreening.length > 0) {
      reasons.push(`${failedScreening.length} mandatory screening(s) incomplete`);
      eligible = false;
    }

    const { data: rtw } = await supabase
      .from("identity_rtw_checks")
      .select("*")
      .eq("worker_id", worker_id)
      .eq("company_id", companyId)
      .eq("check_type", "right_to_work")
      .order("check_date", { ascending: false })
      .limit(1);

    if (!rtw || rtw.length === 0 || rtw[0].outcome !== "passed") {
      reasons.push("Right-to-work check not passed");
      eligible = false;
    } else if (rtw[0].expiry_date && new Date(rtw[0].expiry_date) < new Date()) {
      reasons.push("Right-to-work check expired");
      eligible = false;
    }

    return new Response(
      JSON.stringify({
        eligible: eligible && reasons.length === 0,
        status: eligible && reasons.length === 0 ? (warnings.length > 0 ? "eligible_with_warning" : "eligible") : "ineligible",
        reasons,
        warnings,
        checked_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
