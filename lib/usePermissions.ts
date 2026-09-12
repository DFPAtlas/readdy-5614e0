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

export interface RolePermission {
  id: string;
  role_id: string;
  company_id: string;
  permission_key: string;
  level: PermissionLevel;
}

export interface UserRole {
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

export interface UserSiteAccess {
  id: string;
  user_id: string;
  company_id: string;
  site_id: string | null;
  access_type: 'all' | 'selected' | 'region' | 'own';
  region: string | null;
}

export interface Site {
  id: string;
  name: string;
  region: string | null;
  address: string | null;
}

const DEFAULT_ROLES = [
  { name: 'Account Owner', description: 'Full access to all features and company management', is_system: true, is_default: false },
  { name: 'Superuser', description: 'Full access to all features except billing', is_system: true, is_default: false },
  { name: 'Area Manager', description: 'Manage multiple sites, rotas, staff and incidents', is_system: true, is_default: true },
  { name: 'Site Manager', description: 'Manage a single site, rotas, and incidents', is_system: true, is_default: false },
  { name: 'Control Room Staff', description: 'Monitor operations, incidents, and check calls', is_system: true, is_default: false },
  { name: 'Security Officer', description: 'View patrols, incidents, and SOPs for assigned site', is_system: true, is_default: false },
  { name: 'Client Viewer', description: 'View reports, incidents and client portal data only', is_system: true, is_default: false },
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, PermissionLevel>> = {
  'Account Owner': {
    dashboard: 'manage', staff: 'manage', sites: 'manage', rotas: 'manage',
    shift_patterns: 'manage', book_on_off: 'manage', occurrence_book: 'manage',
    incidents: 'manage', patrols: 'manage', check_calls: 'manage',
    risk_assessments: 'manage', sop_documents: 'manage', assignment_instructions: 'manage',
    client_portal: 'manage', reports: 'manage', ai_tools: 'manage',
    billing: 'manage', settings: 'manage', roles: 'manage',
  },
  'Superuser': {
    dashboard: 'manage', staff: 'manage', sites: 'manage', rotas: 'manage',
    shift_patterns: 'manage', book_on_off: 'manage', occurrence_book: 'manage',
    incidents: 'manage', patrols: 'manage', check_calls: 'manage',
    risk_assessments: 'manage', sop_documents: 'manage', assignment_instructions: 'manage',
    client_portal: 'manage', reports: 'manage', ai_tools: 'manage',
    billing: 'view', settings: 'manage', roles: 'manage',
  },
  'Area Manager': {
    dashboard: 'manage', staff: 'manage', sites: 'edit', rotas: 'manage',
    shift_patterns: 'edit', book_on_off: 'view', occurrence_book: 'edit',
    incidents: 'edit', patrols: 'view', check_calls: 'view',
    risk_assessments: 'edit', sop_documents: 'edit', assignment_instructions: 'edit',
    client_portal: 'view', reports: 'view', ai_tools: 'view',
    billing: 'no_access', settings: 'view', roles: 'no_access',
  },
  'Site Manager': {
    dashboard: 'view', staff: 'view', sites: 'view', rotas: 'manage',
    shift_patterns: 'view', book_on_off: 'view', occurrence_book: 'edit',
    incidents: 'edit', patrols: 'view', check_calls: 'view',
    risk_assessments: 'view', sop_documents: 'view', assignment_instructions: 'view',
    client_portal: 'no_access', reports: 'view', ai_tools: 'no_access',
    billing: 'no_access', settings: 'no_access', roles: 'no_access',
  },
  'Control Room Staff': {
    dashboard: 'manage', staff: 'view', sites: 'view', rotas: 'view',
    shift_patterns: 'no_access', book_on_off: 'manage', occurrence_book: 'edit',
    incidents: 'edit', patrols: 'view', check_calls: 'manage',
    risk_assessments: 'no_access', sop_documents: 'view', assignment_instructions: 'no_access',
    client_portal: 'no_access', reports: 'view', ai_tools: 'no_access',
    billing: 'no_access', settings: 'no_access', roles: 'no_access',
  },
  'Security Officer': {
    dashboard: 'view', staff: 'no_access', sites: 'view', rotas: 'view',
    shift_patterns: 'no_access', book_on_off: 'create', occurrence_book: 'create',
    incidents: 'create', patrols: 'create', check_calls: 'view',
    risk_assessments: 'no_access', sop_documents: 'view', assignment_instructions: 'view',
    client_portal: 'no_access', reports: 'no_access', ai_tools: 'no_access',
    billing: 'no_access', settings: 'no_access', roles: 'no_access',
  },
  'Client Viewer': {
    dashboard: 'view', staff: 'no_access', sites: 'view', rotas: 'no_access',
    shift_patterns: 'no_access', book_on_off: 'no_access', occurrence_book: 'no_access',
    incidents: 'view', patrols: 'view', check_calls: 'no_access',
    risk_assessments: 'view', sop_documents: 'view', assignment_instructions: 'no_access',
    client_portal: 'view', reports: 'view', ai_tools: 'no_access',
    billing: 'no_access', settings: 'no_access', roles: 'no_access',
  },
};

export function usePermissions(companyId: string | null) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [userSiteAccess, setUserSiteAccess] = useState<UserSiteAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPermissions = useCallback(async () => {
    const { data, error } = await supabase.from('permissions').select('*').order('module,label');
    if (!error) setPermissions(data || []);
  }, []);

  const loadSites = useCallback(async () => {
    if (!companyId) return;
    const { data, error } = await supabase
      .from('sites')
      .select('id, name, region, address')
      .eq('company_id', companyId)
      .order('name');
    if (!error && data) setSites(data);
  }, [companyId]);

  const loadUserSiteAccess = useCallback(async () => {
    if (!companyId) return;
    const { data, error } = await supabase
      .from('user_site_access')
      .select('*')
      .eq('company_id', companyId);
    if (!error && data) setUserSiteAccess(data || []);
  }, [companyId]);

  const setDefaultRole = async (roleId: string) => {
    if (!companyId) return;
    setSaving(true);
    await supabase
      .from('roles')
      .update({ is_default: false })
      .eq('company_id', companyId)
      .neq('id', roleId);
    const { error } = await supabase
      .from('roles')
      .update({ is_default: true })
      .eq('id', roleId)
      .eq('company_id', companyId);
    if (!error) {
      setRoles(prev => prev.map(r => ({ ...r, is_default: r.id === roleId })));
    }
    setSaving(false);
  };

  const updateUserSiteAccess = async (
    userId: string,
    accessType: 'all' | 'selected' | 'region' | 'own',
    selectedSiteIds?: string[],
    regionValue?: string
  ) => {
    if (!companyId) return;
    setSaving(true);

    await supabase
      .from('user_site_access')
      .delete()
      .eq('user_id', userId)
      .eq('company_id', companyId);

    if (accessType === 'selected' && selectedSiteIds && selectedSiteIds.length > 0) {
      const inserts = selectedSiteIds.map(siteId => ({
        user_id: userId,
        company_id: companyId,
        site_id: siteId,
        access_type: accessType,
        region: null,
      }));
      await supabase.from('user_site_access').insert(inserts);
    } else {
      await supabase.from('user_site_access').insert({
        user_id: userId,
        company_id: companyId,
        site_id: null,
        access_type: accessType,
        region: accessType === 'region' ? regionValue || null : null,
      });
    }

    await loadUserSiteAccess();
    setSaving(false);
  };

  const getUserSiteAccess = (userId: string): UserSiteAccess[] => {
    return userSiteAccess.filter(usa => usa.user_id === userId);
  };

  const loadRoles = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data: rolesData, error } = await supabase
      .from('roles')
      .select('*')
      .eq('company_id', companyId)
      .order('is_system', { ascending: false })
      .order('name');

    if (error) { setLoading(false); return; }

    if (!rolesData || rolesData.length === 0) {
      await seedDefaultRoles(companyId);
      const { data: seeded } = await supabase.from('roles').select('*').eq('company_id', companyId).order('is_system', { ascending: false }).order('name');
      if (seeded) {
        const rolePerms = await loadRolePermissions(seeded);
        setRoles(rolePerms);
      }
    } else {
      const rolePerms = await loadRolePermissions(rolesData);
      setRoles(rolePerms);
    }
    setLoading(false);
  }, [companyId]);

  const loadRolePermissions = async (rolesList: Role[]): Promise<Role[]> => {
    if (!companyId || rolesList.length === 0) return rolesList;
    const { data: permsData } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('company_id', companyId)
      .in('role_id', rolesList.map(r => r.id));

    const permsMap: Record<string, Record<string, PermissionLevel>> = {};
    (permsData || []).forEach((p: RolePermission) => {
      if (!permsMap[p.role_id]) permsMap[p.role_id] = {};
      permsMap[p.role_id][p.permission_key] = p.level;
    });

    return rolesList.map(r => ({ ...r, permissions: permsMap[r.id] || {} }));
  };

  const seedDefaultRoles = async (cid: string) => {
    const { data: createdRoles } = await supabase.from('roles').insert(
      DEFAULT_ROLES.map(d => ({ ...d, company_id: cid }))
    ).select('*');

    if (!createdRoles) return;

    const rpInserts: any[] = [];
    for (const role of createdRoles) {
      const perms = DEFAULT_PERMISSIONS[role.name];
      if (perms) {
        for (const [key, level] of Object.entries(perms)) {
          rpInserts.push({
            role_id: role.id,
            company_id: cid,
            permission_key: key,
            level,
          });
        }
      }
    }

    if (rpInserts.length > 0) {
      await supabase.from('role_permissions').insert(rpInserts);
    }
  };

  const createRole = async (name: string, description: string, baseRoleId?: string | null) => {
    if (!companyId) return;
    setSaving(true);
    const baseRole = baseRoleId ? roles.find(r => r.id === baseRoleId) : null;
    const { data, error } = await supabase.from('roles').insert({
      company_id: companyId,
      name,
      description,
      is_system: false,
      is_default: false,
    }).select().maybeSingle();

    if (error || !data) { setSaving(false); return; }

    const perms: Record<string, PermissionLevel> = baseRole?.permissions || {};
    const rpInserts = Object.entries(perms).map(([key, level]) => ({
      role_id: data.id,
      company_id: companyId,
      permission_key: key,
      level,
    }));

    if (rpInserts.length > 0) {
      await supabase.from('role_permissions').insert(rpInserts);
    }

    setRoles(prev => [...prev, { ...data, permissions: perms }]);
    setSaving(false);
  };

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from('roles').update(updates).eq('id', roleId);
    if (!error) {
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updates } : r));
    }
    setSaving(false);
  };

  const updateRolePermissions = async (roleId: string, perms: Record<string, PermissionLevel>) => {
    if (!companyId) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('role_permissions')
      .select('permission_key')
      .eq('role_id', roleId)
      .eq('company_id', companyId);

    const existingKeys = new Set((existing || []).map(e => e.permission_key));
    const inserts: any[] = [];
    const updates: any[] = [];

    for (const [key, level] of Object.entries(perms)) {
      if (existingKeys.has(key)) {
        updates.push({ role_id: roleId, company_id: companyId, permission_key: key, level });
      } else {
        inserts.push({ role_id: roleId, company_id: companyId, permission_key: key, level });
      }
    }

    if (inserts.length > 0) await supabase.from('role_permissions').insert(inserts);

    for (const u of updates) {
      await supabase.from('role_permissions')
        .update({ level: u.level })
        .eq('role_id', roleId)
        .eq('company_id', companyId)
        .eq('permission_key', u.permission_key);
    }

    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: { ...(r.permissions || {}), ...perms } } : r));
    setSaving(false);
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

  const loadUsers = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from('users').select('id,first_name,last_name,email,status').eq('company_id', companyId).order('last_name');
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

  const assignRole = async (userId: string, roleId: string, isPrimary: boolean = false) => {
    if (!companyId) return;
    setSaving(true);
    const { data, error } = await supabase.from('user_roles').insert({
      user_id: userId, role_id: roleId, company_id: companyId, is_primary: isPrimary,
    }).select('*, role:roles(*), user:users(id,first_name,last_name,email)').maybeSingle();
    if (!error && data) setUserRoles(prev => [...prev, data]);
    setSaving(false);
  };

  const removeUserRole = async (userRoleId: string) => {
    if (!companyId) return;
    const { error } = await supabase.from('user_roles').delete().eq('id', userRoleId);
    if (!error) setUserRoles(prev => prev.filter(ur => ur.id !== userRoleId));
  };

  const setPrimaryRole = async (userRoleId: string, userId: string) => {
    if (!companyId) return;
    await supabase.from('user_roles').update({ is_primary: false }).eq('user_id', userId).eq('company_id', companyId);
    await supabase.from('user_roles').update({ is_primary: true }).eq('id', userRoleId);
    setUserRoles(prev => prev.map(ur => ({ ...ur, is_primary: ur.id === userRoleId })));
  };

  const getRoleUsers = (roleId: string): UserRole[] => userRoles.filter(ur => ur.role_id === roleId);

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

  return {
    roles, permissions, userRoles, users, sites, userSiteAccess,
    loading, saving,
    createRole, updateRole, deleteRole, setDefaultRole,
    updateRolePermissions,
    assignRole, removeUserRole, setPrimaryRole,
    getRoleUsers,
    updateUserSiteAccess, getUserSiteAccess,
    refresh: loadRoles,
  };
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

export function useMyPermissions(userId: string | null, companyId: string | null) {
  const [myPerms, setMyPerms] = useState<Record<string, PermissionLevel>>({});
  const [myRoles, setMyRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    if (!userId || !companyId) { setMyPerms({}); setMyRoles([]); return; }
    setLoading(true);
    try {
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (!userRoleData || userRoleData.length === 0) {
        const { data: user } = await supabase.from('users').select('role').eq('id', userId).maybeSingle();
        const adminRoles = ['admin', 'owner', 'super_admin', 'company_admin', 'operations_manager'];
        if (user?.role && adminRoles.includes(user.role)) {
          setMyPerms({
            dashboard: 'manage', staff: 'manage', sites: 'manage', rotas: 'manage',
            shift_patterns: 'manage', book_on_off: 'manage', occurrence_book: 'manage',
            incidents: 'manage', patrols: 'manage', check_calls: 'manage',
            risk_assessments: 'manage', sop_documents: 'manage', assignment_instructions: 'manage',
            client_portal: 'manage', reports: 'manage', ai_tools: 'manage',
            billing: 'manage', settings: 'manage', roles: 'manage',
            'integrations.view': 'manage', 'integrations.manage': 'manage', 'integrations.approve': 'manage',
            'api.view': 'manage', 'api.manage': 'manage',
            'webhooks.view': 'manage', 'webhooks.manage': 'manage',
            'exports.view': 'manage', 'exports.manage': 'manage', 'imports.manage': 'manage',
            'workforce.view': 'manage',
          });
        } else {
          setMyPerms({});
        }
        setLoading(false);
        return;
      }

      const roleIds = userRoleData.map(ur => ur.role_id);
      const { data: rpData } = await supabase
        .from('role_permissions')
        .select('permission_key,level')
        .in('role_id', roleIds)
        .eq('company_id', companyId);

      const merged: Record<string, PermissionLevel> = {};
      (rpData || []).forEach((p: any) => {
        const existing = merged[p.permission_key];
        if (!existing || LEVEL_WEIGHTS[p.level] > LEVEL_WEIGHTS[existing]) {
          merged[p.permission_key] = p.level;
        }
      });

      const { data: roleData } = await supabase
        .from('roles')
        .select('*')
        .in('id', roleIds);

      setMyPerms(merged);
      setMyRoles(roleData || []);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useMyPermissions] check error:', err);
      }
      setMyPerms({});
      setMyRoles([]);
    }
    setLoading(false);
  }, [userId, companyId]);

  useEffect(() => { check(); }, [check]);

  const can = useCallback((key: string, level: PermissionLevel = 'view'): boolean => {
    if (myRoles.some(r => r.name === 'Account Owner')) return true;
    const perms = myPerms || {};
    return hasPermission(perms, key, level);
  }, [myPerms, myRoles]);

  return { myPerms, myRoles, loading, can, refresh: check };
}