import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization") || "";
  const url = new URL(req.url);
  const requiredPermission = url.searchParams.get("permission") || "";
  const requiredLevel = url.searchParams.get("level") || "view";
  const action = url.searchParams.get("action") || "check";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    { auth: { persistSession: false } }
  );

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ authorized: false, reason: "No token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ authorized: false, reason: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: assignments } = await supabase
    .from("platform_role_assignments")
    .select("id, platform_role_id, is_active, expires_at, mfa_verified_at, platform_role:platform_roles(slug, name)")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const activeAssignments = (assignments || []).filter((a: any) => {
    if (!a.is_active) return false;
    if (a.expires_at && new Date(a.expires_at) < new Date()) return false;
    return true;
  });

  if (activeAssignments.length === 0) {
    if (action === "audit") {
      await logAccessDenied(supabase, user.id, "no_platform_role", requiredPermission, req);
    }
    return new Response(JSON.stringify({
      authorized: false,
      reason: "No active platform role",
      hasMfa: false,
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const mfaVerified = activeAssignments.some((a: any) => a.mfa_verified_at);
  if (!mfaVerified && action !== "check_mfa") {
    return new Response(JSON.stringify({
      authorized: false,
      reason: "MFA not verified for platform access",
      requiresMfa: true,
      hasMfa: false,
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!requiredPermission) {
    return new Response(JSON.stringify({
      authorized: true,
      roles: activeAssignments.map((a: any) => a.platform_role?.slug),
      roleNames: activeAssignments.map((a: any) => a.platform_role?.name),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roleIds = activeAssignments.map((a: any) => a.platform_role_id);
  const { data: perms } = await supabase
    .from("platform_role_permissions")
    .select("permission_key, level")
    .in("platform_role_id", roleIds);

  const levels: Record<string, number> = {
    no_access: 0, view: 1, create: 2, edit: 3, approve: 4, delete: 5, manage: 6,
  };

  let highestLevel = 0;
  (perms || []).forEach((p: any) => {
    if (p.permission_key === requiredPermission) {
      const lvl = levels[p.level] || 0;
      if (lvl > highestLevel) highestLevel = lvl;
    }
  });

  const requiredLvl = levels[requiredLevel] || 1;

  if (highestLevel >= requiredLvl) {
    return new Response(JSON.stringify({
      authorized: true,
      roles: activeAssignments.map((a: any) => a.platform_role?.slug),
      permission: requiredPermission,
      level: highestLevel,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "audit") {
    await logAccessDenied(supabase, user.id, "insufficient_permission", requiredPermission, req);
  }

  return new Response(JSON.stringify({
    authorized: false,
    reason: `Insufficient permission: ${requiredPermission} (have level ${highestLevel}, need ${requiredLvl})`,
    required: requiredPermission,
    hasHighest: highestLevel,
  }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
});

async function logAccessDenied(
  supabase: any,
  userId: string,
  reason: string,
  permission: string,
  req: Request
) {
  try {
    await supabase.from("platform_security_events").insert({
      event_type: "platform_access_denied",
      severity: "low",
      actor_id: userId,
      description: `Platform access denied: ${reason}`,
      safe_metadata: { permission, reason, ip: req.headers.get("x-real-ip") || "unknown" },
    });
  } catch (_) {}
}
