import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PlatformRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
}

export interface PlatformRoleAssignment {
  id: string;
  user_id: string;
  platform_role_id: string;
  granted_by: string | null;
  grant_reason: string | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  mfa_verified_at: string | null;
  platform_role?: PlatformRole;
  grantor_profile?: { first_name: string | null; last_name: string | null; email: string | null };
  user_profile?: { id: string; first_name: string | null; last_name: string | null; email: string | null };
}

export interface PlatformPermission {
  permission_key: string;
  level: string;
}

export function usePlatformAccess(userId: string | null) {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [assignments, setAssignments] = useState<PlatformRoleAssignment[]>([]);
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isPlatformStaff, setIsPlatformStaff] = useState(false);

  const loadRoles = useCallback(async () => {
    const { data } = await supabase.from('platform_roles').select('*').order('name');
    if (data) setRoles(data);
  }, []);

  const loadAssignments = useCallback(async () => {
    const { data } = await supabase
      .from('platform_role_assignments')
      .select('*, platform_role:platform_roles(*)')
      .order('created_at', { ascending: false });

    if (data) {
      const userIds = [...new Set(data.map((a: any) => [a.user_id, a.granted_by]).flat().filter(Boolean))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('users').select('id,first_name,last_name,email').in('id', userIds)
        : { data: [] };

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

      const enriched = data.map((a: any) => ({
        ...a,
        grantor_profile: a.granted_by ? profileMap[a.granted_by] || null : null,
        user_profile: a.user_id ? profileMap[a.user_id] || null : null,
      }));

      const active = enriched.filter((a: any) => {
        if (!a.is_active) return false;
        if (a.expires_at && new Date(a.expires_at) < new Date()) return false;
        return true;
      });
      setAssignments(enriched);
      setIsPlatformStaff(active.length > 0);
    }
  }, []);

  const loadMyPermissions = useCallback(async () => {
    if (!userId) return;
    const { data: myAssignments } = await supabase
      .from('platform_role_assignments')
      .select('platform_role_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!myAssignments || myAssignments.length === 0) { setPermissions({}); return; }

    const roleIds = myAssignments.map((a: any) => a.platform_role_id);
    const { data: perms } = await supabase
      .from('platform_role_permissions')
      .select('permission_key, level')
      .in('platform_role_id', roleIds);

    const merged: Record<string, string> = {};
    const levels: Record<string, number> = { no_access: 0, view: 1, create: 2, edit: 3, approve: 4, delete: 5, manage: 6 };
    (perms || []).forEach((p: any) => {
      const existing = merged[p.permission_key];
      if (!existing || (levels[p.level] || 0) > (levels[existing] || 0)) {
        merged[p.permission_key] = p.level;
      }
    });
    setPermissions(merged);
  }, [userId]);

  const can = useCallback((key: string, level: string = 'view'): boolean => {
    const levels: Record<string, number> = { no_access: 0, view: 1, create: 2, edit: 3, approve: 4, delete: 5, manage: 6 };
    return (levels[permissions[key]] || 0) >= (levels[level] || 1);
  }, [permissions]);

  const grantRole = async (targetUserId: string, platformRoleId: string, reason: string, expiresAt?: string | null) => {
    const { data, error } = await supabase.from('platform_role_assignments').insert({
      user_id: targetUserId,
      platform_role_id: platformRoleId,
      granted_by: userId,
      grant_reason: reason,
      expires_at: expiresAt || null,
      is_active: true,
    }).select('*, platform_role:platform_roles(*), user_profile:users!platform_role_assignments_user_id_fkey(id,first_name,last_name,email)').maybeSingle();

    if (!error && data) {
      setAssignments(prev => [data, ...prev]);
      await supabase.from('platform_audit_log').insert({
        actor_id: userId,
        effective_actor_id: userId,
        action: 'platform_role_granted',
        resource_type: 'platform_role_assignment',
        resource_id: data.id,
        reason,
        new_state: { platform_role_id: platformRoleId, target_user_id: targetUserId, expires_at: expiresAt },
      });
    }
    return { data, error };
  };

  const revokeRole = async (assignmentId: string, reason: string) => {
    const { error } = await supabase.from('platform_role_assignments')
      .update({ is_active: false, expires_at: new Date().toISOString() })
      .eq('id', assignmentId);

    if (!error) {
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, is_active: false } : a));
      await supabase.from('platform_audit_log').insert({
        actor_id: userId,
        effective_actor_id: userId,
        action: 'platform_role_revoked',
        resource_type: 'platform_role_assignment',
        resource_id: assignmentId,
        reason,
      });
    }
    return { error };
  };

  const verifyMfa = async (assignmentId: string) => {
    const { error } = await supabase.from('platform_role_assignments')
      .update({ mfa_verified_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .eq('user_id', userId);

    if (!error) {
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, mfa_verified_at: new Date().toISOString() } : a));
    }
    return { error };
  };

  useEffect(() => {
    loadRoles();
    loadAssignments();
  }, [loadRoles, loadAssignments]);

  useEffect(() => {
    if (userId) loadMyPermissions();
  }, [userId, loadMyPermissions]);

  return {
    roles, assignments, permissions, loading, isPlatformStaff,
    can, grantRole, revokeRole, verifyMfa,
    refresh: loadAssignments,
  };
}