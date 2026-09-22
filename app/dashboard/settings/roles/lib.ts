'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type PermissionLevel = 'no_access' | 'view' | 'create' | 'edit' | 'approve' | 'delete' | 'manage';

export const LEVEL_WEIGHTS: Record<PermissionLevel, number> = {
  no_access: 0,
  view: 1,
  create: 2,
  edit: 3,
  approve: 4,
  delete: 5,
  manage: 6,
};

export const LEVEL_OPTIONS: { value: PermissionLevel; label: string; color: string; borderColor: string }[] = [
  { value: 'no_access', label: 'No Access', color: 'bg-gray-600', borderColor: 'border-gray-600' },
  { value: 'view', label: 'View', color: 'bg-blue-500', borderColor: 'border-blue-500' },
  { value: 'create', label: 'Create', color: 'bg-sky-500', borderColor: 'border-sky-500' },
  { value: 'edit', label: 'Edit', color: 'bg-amber-500', borderColor: 'border-amber-500' },
  { value: 'approve', label: 'Approve', color: 'bg-purple-500', borderColor: 'border-purple-500' },
  { value: 'delete', label: 'Delete', color: 'bg-red-500', borderColor: 'border-red-500' },
  { value: 'manage', label: 'Manage', color: 'bg-emerald-500', borderColor: 'border-emerald-500' },
];

export interface Permission {
  id: string;
  key: string;
  label: string;
  module: string;
  icon: string | null;
  description: string | null;
}

export interface Role {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Record<string, PermissionLevel>;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role_id: string;
  company_id: string;
  assigned_at: string;
  assigned_by: string | null;
  is_primary: boolean;
  role?: Role;
  user?: { id: string; first_name: string | null; last_name: string | null; email: string | null };
}

export interface Site {
  id: string;
  name: string;
  region: string | null;
  address: string | null;
}

export interface UserSiteAccessRecord {
  id: string;
  user_id: string;
  company_id: string;
  site_id: string | null;
  access_type: 'all' | 'selected' | 'region' | 'own';
  region: string | null;
}

export const MODULE_ORDER = ['Dashboard','Staff','Sites','Rotas','Operations','Compliance','Client','Reports','AI','workforce','recruitment','vetting','hr','training','compliance','billing','finance','pay_run','rate_card','timesheet','expense','credit_note','dispute','integrations','api','webhooks','exports','imports','Settings','Site Notice Board'];

export function useRolesManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [userSiteAccess, setUserSiteAccess] = useState<UserSiteAccessRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const init = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).maybeSingle();
    if (userData?.company_id) setCompanyId(userData.company_id);
  }, []);

  useEffect(() => { init(); }, [init]);

  const loadPermissions = useCallback(async () => {
    const { data } = await supabase.from('permissions').select('*').order('module,label');
    if (data) setPermissions(data);
  }, []);

  const loadSites = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from('sites').select('id,site_name,region,address').eq('company_id', companyId).order('site_name');
    if (data) setSites(data.map((s) => ({ id: s.id, name: s.site_name, region: s.region, address: s.address })));
  }, [companyId]);

  const loadUserSiteAccess = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from('user_site_access').select('*').eq('company_id', companyId);
    if (data) setUserSiteAccess(data || []);
  }, [companyId]);

  const loadRoles = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data: rolesData, error } = await supabase
      .from('roles')
      .select('*')
      .eq('company_id', companyId)
      .order('is_system', { ascending: false })
      .order('name');
    if (error || !rolesData || rolesData.length === 0) { setLoading(false); return; }

    const { data: permsData } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('company_id', companyId)
      .in('role_id', rolesData.map(r => r.id));

    const permsMap: Record<string, Record<string, PermissionLevel>> = {};
    (permsData || []).forEach((p: any) => {
      if (!permsMap[p.role_id]) permsMap[p.role_id] = {};
      permsMap[p.role_id][p.permission_key] = p.level;
    });

    setRoles(rolesData.map(r => ({ ...r, permissions: permsMap[r.id] || {} })));
    setLoading(false);
  }, [companyId]);

  const loadUsers = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from('users').select('id,first_name,last_name,email,status,role').eq('company_id', companyId).order('last_name');
    if (data) setUsers(data);
  }, [companyId]);

  const loadUserRoles = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from('user_roles')
      .select('*, role:roles(*), user:users(id,first_name,last_name,email)')
      .eq('company_id', companyId);
    if (data) setUserRoles(data || []);
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      loadPermissions();
      loadRoles();
      loadUsers();
      loadUserRoles();
      loadSites();
      loadUserSiteAccess();
    }
  }, [companyId, loadPermissions, loadRoles, loadUsers, loadUserRoles, loadSites, loadUserSiteAccess]);

  const createRole = async (name: string, description: string, isDefault: boolean) => {
    if (!companyId) return false;
    setSaving(true);
    const { data, error } = await supabase.from('roles').insert({
      company_id: companyId,
      name,
      description,
      is_system: false,
      is_default: isDefault,
    }).select().maybeSingle();

    if (!error && data) {
      if (isDefault) {
        await supabase.from('roles').update({ is_default: false }).eq('company_id', companyId).neq('id', data.id);
        setRoles(prev => prev.map(r => ({ ...r, is_default: false })));
      }
      setRoles(prev => [...prev, { ...data, permissions: {} }]);
    }
    setSaving(false);
    return !error && !!data;
  };

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    if (!companyId) return false;
    setSaving(true);
    const { error } = await supabase.from('roles').update(updates).eq('id', roleId);
    if (!error) setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updates } : r));
    setSaving(false);
    return !error;
  };

  const deleteRole = async (roleId: string) => {
    if (!companyId) return;
    const role = roles.find(r => r.id === roleId);
    if (role?.is_system) return;
    await supabase.from('role_permissions').delete().eq('role_id', roleId);
    await supabase.from('user_roles').delete().eq('role_id', roleId);
    const { error } = await supabase.from('roles').delete().eq('id', roleId);
    if (!error) setRoles(prev => prev.filter(r => r.id !== roleId));
  };

  const updateRolePermissions = async (roleId: string, perms: Record<string, PermissionLevel>) => {
    if (!companyId) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('role_permissions')
      .select('permission_key')
      .eq('role_id', roleId)
      .eq('company_id', companyId);

    const existingKeys = new Set((existing || []).map((e: any) => e.permission_key));
    const inserts: any[] = [];

    for (const [key, level] of Object.entries(perms)) {
      if (existingKeys.has(key)) {
        await supabase.from('role_permissions')
          .update({ level })
          .eq('role_id', roleId)
          .eq('company_id', companyId)
          .eq('permission_key', key);
      } else {
        inserts.push({ role_id: roleId, company_id: companyId, permission_key: key, level });
      }
    }

    if (inserts.length > 0) await supabase.from('role_permissions').insert(inserts);

    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: { ...(r.permissions || {}), ...perms } } : r));
    setSaving(false);
  };

  const assignRole = async (userId: string, roleId: string, isPrimary: boolean) => {
    if (!companyId) return false;
    setSaving(true);
    const { data, error } = await supabase.from('user_roles').insert({
      user_id: userId, role_id: roleId, company_id: companyId, is_primary: isPrimary,
    }).select('*, role:roles(*), user:users(id,first_name,last_name,email)').maybeSingle();
    if (!error && data) setUserRoles(prev => [...prev, data]);
    setSaving(false);
    return !error && !!data;
  };

  const removeUserRole = async (userRoleId: string) => {
    if (!companyId) return;
    const { error } = await supabase.from('user_roles').delete().eq('id', userRoleId);
    if (!error) setUserRoles(prev => prev.filter(ur => ur.id !== userRoleId));
  };

  const updateUserSiteAccess = async (
    userId: string,
    accessType: 'all' | 'selected' | 'region' | 'own',
    selectedSiteIds?: string[],
    regionValue?: string
  ) => {
    if (!companyId) return;
    setSaving(true);

    await supabase.from('user_site_access').delete().eq('user_id', userId).eq('company_id', companyId);

    if (accessType === 'selected' && selectedSiteIds && selectedSiteIds.length > 0) {
      const inserts = selectedSiteIds.map(siteId => ({
        user_id: userId, company_id: companyId, site_id: siteId,
        access_type: accessType, region: null,
      }));
      await supabase.from('user_site_access').insert(inserts);
    } else {
      await supabase.from('user_site_access').insert({
        user_id: userId, company_id: companyId, site_id: null,
        access_type: accessType,
        region: accessType === 'region' ? regionValue || null : null,
      });
    }

    const { data } = await supabase.from('user_site_access').select('*').eq('company_id', companyId);
    if (data) setUserSiteAccess(data || []);
    setSaving(false);
  };

  const getRoleUsers = (roleId: string) => userRoles.filter(ur => ur.role_id === roleId);
  const getUserSiteAccess = (userId: string) => userSiteAccess.filter(usa => usa.user_id === userId);

  const refresh = useCallback(() => {
    loadRoles();
    loadUserRoles();
    loadUserSiteAccess();
  }, [loadRoles, loadUserRoles, loadUserSiteAccess]);

  return {
    roles, permissions, userRoles, users, sites, userSiteAccess,
    companyId, loading, saving,
    createRole, updateRole, deleteRole,
    updateRolePermissions,
    assignRole, removeUserRole,
    updateUserSiteAccess,
    getRoleUsers, getUserSiteAccess,
    refresh,
  };
}

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setReady(true); return; }
      setUserId(user.id);
      const { data: userData } = await supabase.from('users').select('company_id, role').eq('id', user.id).maybeSingle();
      if (userData?.company_id) setCompanyId(userData.company_id);
      const adminRoles = ['super_admin','company_admin','operations_manager','admin','owner'];
      setIsAdmin(adminRoles.includes(userData?.role || ''));
      setReady(true);
    }
    init();
  }, []);

  return { userId, companyId, isAdmin, ready };
}

export function hasPermission(
  rolePermissions: Record<string, PermissionLevel>,
  permissionKey: string,
  requiredLevel: PermissionLevel
): boolean {
  const perms = rolePermissions || {};
  const actual = perms[permissionKey] || 'no_access';
  return LEVEL_WEIGHTS[actual] >= LEVEL_WEIGHTS[requiredLevel];
}