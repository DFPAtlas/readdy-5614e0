import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
      Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client_id from client_users
    const { data: cu } = await supabaseClient
      .from("client_users")
      .select("client_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!cu?.client_id) {
      return new Response(JSON.stringify({ error: "Not a client user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get sites for this client
    const { data: sites } = await supabaseClient
      .from("sites")
      .select("id")
      .eq("client_id", cu.client_id);

    const siteIds = sites?.map((s) => s.id) || [];
    if (siteIds.length === 0) {
      return new Response(JSON.stringify({ clocking: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current shifts
    const now = new Date().toISOString();
    const { data: shifts } = await supabaseClient
      .from("shifts")
      .select("id, guard_id, site_id, start_time, end_time, status")
      .in("site_id", siteIds)
      .lte("start_time", now)
      .gte("end_time", now)
      .order("start_time", { ascending: false });

    // Get guard details
    const guardIds = [...new Set((shifts || []).map((s) => s.guard_id).filter(Boolean))];
    const { data: guards } = guardIds.length > 0
      ? await supabaseClient.from("guards").select("id, first_name, last_name, phone").in("id", guardIds)
      : { data: [] };

    const { data: attendance } = await supabaseClient
      .from("attendance_logs")
      .select("id, shift_id, guard_id, clock_in, clock_out, clock_in_lat, clock_in_lng")
      .in("site_id", siteIds)
      .order("clock_in", { ascending: false })
      .limit(50);

    const clocking = (shifts || []).map((shift) => {
      const att = (attendance || []).find((a) => a.shift_id === shift.id);
      const guard = (guards || []).find((g) => g.id === shift.guard_id);
      return {
        shift_id: shift.id,
        site_id: shift.site_id,
        guard_id: shift.guard_id,
        guard_name: guard ? `${guard.first_name} ${guard.last_name}` : "Officer",
        guard_phone: guard?.phone || null,
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: shift.status,
        is_clocked_in: !!att && !att.clock_out,
        clocked_in_at: att?.clock_in || null,
        clocked_out_at: att?.clock_out || null,
        clock_in_location: att?.clock_in_lat && att?.clock_in_lng
          ? { lat: att.clock_in_lat, lng: att.clock_in_lng }
          : null,
      };
    });

    return new Response(JSON.stringify({ clocking }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
