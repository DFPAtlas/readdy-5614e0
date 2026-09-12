
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

Deno.serve(async (req: Request) => {
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("company_id, role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "active") {
      return new Response(JSON.stringify({ error: "Account is not active" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const userId = user.id;
    const companyId = profile.company_id;
    const { permission_key } = body;

    if (!permission_key) {
      return new Response(JSON.stringify({ error: 'Missing permission_key' }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (profile.role === 'super_admin') {
      return new Response(JSON.stringify({ has_permission: true, highest_level: 'manage', is_owner: true }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (!companyId) {
      return new Response(JSON.stringify({ has_permission: false, highest_level: 'no_access', is_owner: false }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: userRoles } = await supabaseService
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .eq('company_id', companyId);

    const roleIds = (userRoles || []).map((r: any) => r.role_id);
    if (roleIds.length === 0) {
      return new Response(JSON.stringify({ has_permission: false, highest_level: 'no_access', is_owner: false }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: perms } = await supabaseService
      .from('role_permissions')
      .select('level,roles!inner(name)')
      .eq('company_id', companyId)
      .eq('permission_key', permission_key)
      .in('role_id', roleIds);

    const hasOwner = perms?.some((p: any) => p.roles?.name === 'Account Owner');
    const hasAccess = perms?.some((p: any) => p.level !== 'no_access');

    const levelWeights: Record<string, number> = {
      no_access: 0, view: 1, create: 2, edit: 3, approve: 4, delete: 5, manage: 6,
    };

    let highest = 'no_access';
    (perms || []).forEach((p: any) => {
      if (levelWeights[p.level] > levelWeights[highest]) highest = p.level;
    });

    return new Response(JSON.stringify({ has_permission: hasOwner || hasAccess, highest_level: highest, is_owner: hasOwner }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "An error occurred checking permissions" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
