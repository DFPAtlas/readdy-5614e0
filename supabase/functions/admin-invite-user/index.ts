
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin === o);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

interface AuthContext {
  userId: string;
  companyId: string | null;
  role: string;
}

async function authenticateUser(req: Request, supabase: ReturnType<typeof createClient>): Promise<AuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw Object.assign(new Error("Missing Authorization header"), { status: 401 });

  const token = authHeader.replace("Bearer ", "");
  if (!token || token === authHeader) throw Object.assign(new Error("Invalid Authorization format"), { status: 401 });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw Object.assign(new Error("Invalid or expired session"), { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) throw Object.assign(new Error("User profile not found"), { status: 401 });
  if (profile.status !== "active") throw Object.assign(new Error("Account is not active"), { status: 403 });

  return { userId: user.id, companyId: profile.company_id, role: profile.role };
}

function auditAndReturn(body: Record<string, unknown>, supabaseService: ReturnType<typeof createClient>, ctx: AuthContext, result: unknown, status: number): Response {
  supabaseService.from("admin_activity_log").insert({
    user_id: ctx.userId,
    company_id: ctx.companyId,
    action: "invite_user",
    target_type: "user",
    target_id: body.email || null,
    details: { role: body.role, company_id: body.company_id, outcome: status < 400 ? "success" : "failure" },
  }).then((r: any) => { if (r.error) console.error("Audit log failed:", r.error.message); });
  return new Response(JSON.stringify(result), { status, headers: { "Content-Type": "application/json" } });
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let ctx: AuthContext;
    try { ctx = await authenticateUser(req, supabase); } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: e.status || 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { email, first_name, last_name, role, company_id: submittedCompanyId } = body;

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required' }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const validRoles = ['super_admin', 'company_admin', 'operations_manager', 'guard', 'client'];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (role === 'super_admin' && ctx.role !== 'super_admin') {
      return auditAndReturn(body, supabaseService, ctx, { error: "Only super_admin can invite super_admin users" }, 403);
    }

    const targetCompanyId = ctx.role === 'super_admin'
      ? (submittedCompanyId || ctx.companyId)
      : ctx.companyId;

    if (!targetCompanyId) {
      return new Response(JSON.stringify({ error: "No company context available" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (ctx.role !== 'super_admin' && !['company_admin', 'operations_manager'].includes(ctx.role)) {
      return auditAndReturn(body, supabaseService, ctx, { error: "Only company admins can invite users" }, 403);
    }

    const { data: existingUsers } = await supabaseService.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    if (existingUser) {
      const { data: existingProfile } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', existingUser.id)
        .maybeSingle();

      if (existingProfile?.company_id && existingProfile.company_id !== targetCompanyId && ctx.role !== 'super_admin') {
        return auditAndReturn(body, supabaseService, ctx, { error: "User belongs to another company" }, 403);
      }

      const { error: updateErr } = await supabaseService
        .from('users')
        .update({ role, company_id: targetCompanyId, first_name, last_name })
        .eq('id', existingUser.id);

      if (updateErr) throw updateErr;

      return auditAndReturn(body, supabaseService, ctx, { success: true, message: 'User role updated', user_id: existingUser.id }, 200);
    }

    const { data: inviteData, error: inviteErr } = await supabaseService.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name, role, company_id: targetCompanyId },
    });

    if (inviteErr) throw inviteErr;

    const userId = inviteData?.user?.id;
    if (!userId) throw new Error('No user ID returned from invite');

    const { error: upsertErr } = await supabaseService.from('users').upsert({
      id: userId,
      email,
      first_name: first_name || null,
      last_name: last_name || null,
      role,
      company_id: targetCompanyId,
      status: 'active',
    }, { onConflict: 'id' });

    if (upsertErr) throw upsertErr;

    return auditAndReturn(body, supabaseService, ctx, { success: true, message: 'Invitation sent', user_id: userId }, 200);
  } catch (err: any) {
    console.error("admin-invite-user error:", err.message);
    return new Response(JSON.stringify({ error: "An error occurred processing the invitation" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
