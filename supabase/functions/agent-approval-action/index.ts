import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DECISIONS: Record<string, string> = {
  approve: "approved",
  reject: "rejected",
  request_changes: "changes_requested",
};

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const supabaseAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { approval_id, decision, note } = body;
    if (!approval_id || !DECISIONS[decision]) {
      return new Response(JSON.stringify({ error: "approval_id and a valid decision are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { data: approval } = await supabase.from("automation_approvals")
      .select("*").eq("id", approval_id).maybeSingle();
    if (!approval) {
      return new Response(JSON.stringify({ error: "Approval not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    if (approval.status !== "pending") {
      return new Response(JSON.stringify({ error: "Approval has already been decided" }), { status: 409, headers: { "Content-Type": "application/json" } });
    }
    if (approval.expiry && new Date(approval.expiry) < new Date()) {
      return new Response(JSON.stringify({ error: "Approval has expired" }), { status: 409, headers: { "Content-Type": "application/json" } });
    }

    const { data: staff } = await supabase.rpc("is_platform_staff");
    const { data: prof } = await supabase.from("users").select("role, company_id").eq("id", user.id).maybeSingle();
    const isSuper = prof?.role === "super_admin";
    const isOperator = staff === true || isSuper;

    if (approval.requested_by === user.id) {
      return new Response(JSON.stringify({ error: "You cannot approve your own request (separation of duties)" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    if (!isOperator && approval.company_id !== prof?.company_id) {
      return new Response(JSON.stringify({ error: "Cross-tenant approval denied" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const newStatus = DECISIONS[decision];

    await supabase.from("automation_approvals").update({
      status: newStatus,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
      review_note: note || null,
    }).eq("id", approval_id);

    if (approval.run_id) {
      await supabase.from("agent_execution_logs").update({
        approval_status: newStatus,
      }).eq("id", approval.run_id);
    }

    await supabase.from("automation_audit_log").insert({
      actor: user.id, company_id: approval.company_id,
      agent_key: (approval.requested_action || "").split(":")[0],
      run_id: approval.run_id, action: `approval_${newStatus}`,
      safe_metadata: { approval_id, decision, note: (note || "").slice(0, 500) },
    });

    return new Response(JSON.stringify({ success: true, status: newStatus, approval_id }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Approval action failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
