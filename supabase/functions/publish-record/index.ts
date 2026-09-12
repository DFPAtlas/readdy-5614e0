import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization,x-client-info" };

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization") || "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { action, record_type, record_id, visibility, withdraw_reason } = await req.json();
    if (!action || !record_type || !record_id) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });

    const { data: ur } = await supabase.from("user_roles").select("company_id, roles!inner(name)").eq("user_id", user.id).limit(1).maybeSingle();
    if (!ur || !["company_admin","operations_manager","super_admin"].includes(ur.roles?.name)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), { status: 403, headers: corsHeaders });
    }
    const companyId = ur.company_id;

    if (action === "publish") {
      const { data: rp } = await supabase.from("record_publications").select("id").eq("record_type", record_type).eq("record_id", record_id).eq("company_id", companyId).maybeSingle();

      if (rp) {
        const { error: updErr } = await supabase.from("record_publications").update({
          visibility: visibility || "approved_for_client",
          published_by: user.id,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", rp.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from("record_publications").insert({
          company_id: companyId,
          record_type,
          record_id,
          visibility: visibility || "approved_for_client",
          published_by: user.id,
          published_at: new Date().toISOString(),
        });
        if (insErr) throw insErr;
      }

      if (record_type === "incident") {
        await supabase.from("incidents").update({ client_visible: true }).eq("id", record_id).eq("company_id", companyId);
      } else if (record_type === "occurrence_book") {
        await supabase.from("occurrence_books").update({ client_visible: true }).eq("id", record_id).eq("company_id", companyId);
      } else if (record_type === "report") {
        await supabase.from("reports").update({ client_visible: true, status: "sent" }).eq("id", record_id).eq("company_id", companyId);
      }

      await supabase.from("client_access_log").insert({
        company_id: companyId,
        client_id: null,
        user_id: user.id,
        action: "publish_record",
        resource_type: record_type,
        resource_id: record_id,
        metadata: { visibility },
      });

      return new Response(JSON.stringify({ success: true, action: "published" }), { headers: corsHeaders });
    }

    if (action === "withdraw") {
      const { data: rp } = await supabase.from("record_publications").select("id").eq("record_type", record_type).eq("record_id", record_id).eq("company_id", companyId).maybeSingle();
      if (!rp) return new Response(JSON.stringify({ error: "No publication record found" }), { status: 404, headers: corsHeaders });

      const { error: updErr } = await supabase.from("record_publications").update({
        visibility: "withdrawn",
        withdrawn_by: user.id,
        withdrawn_at: new Date().toISOString(),
        withdraw_reason: withdraw_reason || null,
        updated_at: new Date().toISOString(),
      }).eq("id", rp.id);
      if (updErr) throw updErr;

      if (record_type === "incident") {
        await supabase.from("incidents").update({ client_visible: false }).eq("id", record_id).eq("company_id", companyId);
      } else if (record_type === "occurrence_book") {
        await supabase.from("occurrence_books").update({ client_visible: false }).eq("id", record_id).eq("company_id", companyId);
      } else if (record_type === "report") {
        await supabase.from("reports").update({ client_visible: false }).eq("id", record_id).eq("company_id", companyId);
      }

      await supabase.from("client_access_log").insert({
        company_id: companyId,
        user_id: user.id,
        action: "withdraw_record",
        resource_type: record_type,
        resource_id: record_id,
        metadata: { withdraw_reason },
      });

      return new Response(JSON.stringify({ success: true, action: "withdrawn" }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});