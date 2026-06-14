'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  usePermissions,
  useMyPermissions,
  type Permission,
  type PermissionLevel,
  type Role,
  LEVEL_WEIGHTS,
} from '@/lib/usePermissions';

const LEVEL_OPTIONS: { value: PermissionLevel; label: string; color: string }[] = [
  { value: 'no_access', label: 'No Access', color: 'bg-gray-500' },
  { value: 'view', label: 'View', color: 'bg-blue-400' },
  { value: 'create', label: 'Create', color: 'bg-blue-500' },
  { value: 'edit', label: 'Edit', color: 'bg-amber-500' },
  { value: 'approve', label: 'Approve', color: 'bg-purple-500' },
  { value: 'delete', label: 'Delete', color: 'bg-red-500' },
  { value: 'manage', label: 'Manage', color: 'bg-green-500' },
];

const MODULE_ORDER = ['Dashboard','Staff','Sites','Rotas','Operations','Compliance','Client','Reports','AI','Settings'];

export default function RolesAndPermissions() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'roles' | 'permissions' | 'users'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [baseRoleId, setBaseRoleId] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string>('Dashboard');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).maybeSingle();
      if (userData?.company_id) setCompanyId(userData.company_id);
    }
    init();
  }, []);

  const {
    roles, permissions, userRoles, users,
    loading, saving,
    createRole, updateRole, deleteRole,
    updateRolePermissions,
    assignRole, removeUserRole, setPrimaryRole,
    getRoleUsers,
  } = usePermissions(companyId);

  const { can } = useMyPermissions(userId, companyId);
  const canManage = can('roles', 'manage');

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreate = async () => {
    if (!newRoleName.trim() || !canManage) return;
    await createRole(newRoleName.trim(), newRoleDesc.trim(), baseRoleId || null);
    setNewRoleName('');
    setNewRoleDesc('');
    setBaseRoleId('');
    setShowCreate(false);
    setToast('Role created successfully');
  };

  const handleDuplicate = async (role: Role) => {
    if (!canManage) return;
    await createRole(role.name + ' (Copy)', role.description || '', role.id);
    setToast('Role duplicated');
  };

  const handleDelete = async () => {
    if (!roleToDelete || roleToDelete.is_system || !canManage) return;
    await deleteRole(roleToDelete.id);
    setShowDelete(false);
    setRoleToDelete(null);
    setSelectedRole(null);
    setToast('Role deleted');
  };

  const handleSavePermissions = async () => {
    if (!editingRole || !canManage) return;
    await updateRolePermissions(editingRole.id, editingRole.permissions || {});
    setEditingRole(null);
    setSelectedRole(null);
    setToast('Permissions saved');
  };

  const setPermissionLevel = (key: string, level: PermissionLevel) => {
    if (!editingRole) return;
    setEditingRole({
      ...editingRole,
      permissions: { ...editingRole.permissions, [key]: level },
    });
  };

  const handleAssign = async () => {
    if (!assignUserId || !assignRoleId || !canManage) return;
    await assignRole(assignUserId, assignRoleId, false);
    setShowAssign(false);
    setAssignUserId('');
    setAssignRoleId('');
    setToast('Role assigned');
  };

  const allUsersWithRoles = users.map(u => ({
    ...u,
    roles: userRoles.filter(ur => ur.user_id === u.id).map(ur => ur.role),
    userRolesList: userRoles.filter(ur => ur.user_id === u.id),
  }));

  if (!can('roles', 'view')) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-800 rounded-full">
          <i className="ri-lock-line text-2xl text-gray-500"></i>
        </div>
        <p>You do not have permission to view Roles &amp; Permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Roles &amp; Permissions</h2>
          <p className="text-sm text-gray-400 mt-1">Define roles, set permissions, and assign users</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line"></i>
            </div>
            Create Role
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg w-fit">
        {[
          { id: 'roles', label: 'Roles', icon: 'ri-shield-user-line' },
          { id: 'permissions', label: 'Permissions', icon: 'ri-key-line' },
          { id: 'users', label: 'User Assignments', icon: 'ri-user-add-line' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeView === tab.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={tab.icon}></i>
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      )}

      {!loading && activeView === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map(role => {
            const userCount = getRoleUsers(role.id).length;
            const isSelected = selectedRole?.id === role.id;
            return (
              <div
                key={role.id}
                onClick={() => { setSelectedRole(role); setEditingRole(null); }}
                className={`relative bg-[#111827] border rounded-lg p-5 cursor-pointer transition-all hover:border-gray-600 ${
                  isSelected ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                      <i className="ri-shield-user-line text-blue-400"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{role.name}</h3>
                      <p className="text-xs text-gray-500">
                        {role.is_system ? 'System role' : 'Custom role'} &middot; {userCount} user{userCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {role.is_default && (
                    <span className="px-2 py-0.5 bg-blue-600/15 text-blue-400 text-xs font-medium rounded-full">Default</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{role.description || 'No description'}</p>

                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(role.permissions || {})
                    .filter(([,level]) => level !== 'no_access')
                    .slice(0, 5)
                    .map(([key, level]) => {
                      const p = permissions.find(x => x.key === key);
                      const opt = LEVEL_OPTIONS.find(o => o.value === level);
                      return (
                        <span key={key} className={`px-2 py-0.5 ${opt?.color || 'bg-gray-500'}/15 text-xs font-medium rounded-full text-white/80`}>
                          {p?.label || key} &middot; {opt?.label || level}
                        </span>
                      );
                    })}
                  {Object.values(role.permissions || {}).filter(l => l !== 'no_access').length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                      +{Object.values(role.permissions || {}).filter(l => l !== 'no_access').length - 5} more
                    </span>
                  )}
                </div>

                {isSelected && canManage && (
                  <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingRole(role); setActiveView('permissions'); }}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-600/10 rounded-md hover:bg-blue-600/20 whitespace-nowrap cursor-pointer"
                    >
                      Edit Permissions
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(role); }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-700/50 rounded-md hover:bg-gray-700 whitespace-nowrap cursor-pointer"
                    >
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-file-copy-line"></i></div>
                    </button>
                    {!role.is_system && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setRoleToDelete(role); setShowDelete(true); }}
                        className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-600/10 rounded-md hover:bg-red-600/20 whitespace-nowrap cursor-pointer"
                      >
                        <div className="w-3 h-3 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && activeView === 'permissions' && (
        <div className="flex gap-6">
          {/* Module sidebar */}
          <div className="w-48 shrink-0 space-y-1">
            {MODULE_ORDER.map(mod => {
              const hasPerms = groupedPerms[mod]?.length > 0;
              if (!hasPerms) return null;
              return (
                <button
                  key={mod}
                  onClick={() => setActiveModule(mod)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeModule === mod
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {mod}
                </button>
              );
            })}
          </div>

          {/* Permission editor */}
          <div className="flex-1">
            {editingRole ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{editingRole.name}</h3>
                    <span className="text-xs text-gray-500">{editingRole.is_system ? 'System role' : 'Custom role'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingRole(null)}
                      className="px-4 py-2 text-sm text-gray-400 bg-gray-700/50 rounded-lg hover:bg-gray-700 whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                      {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
                      Save Permissions
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {groupedPerms[activeModule]?.map(perm => {
                    const current = editingRole.permissions?.[perm.key] || 'no_access';
                    return (
                      <div key={perm.key} className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-gray-400">
                            <i className={perm.icon || 'ri-circle-line'}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{perm.label}</p>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {LEVEL_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setPermissionLevel(perm.key, opt.value)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                                current === opt.value
                                  ? `${opt.color} text-white shadow-sm`
                                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                              }`}
                              title={opt.label}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }) || (
                    <p className="text-gray-500 text-sm py-8 text-center">No permissions in this module</p>
                  )}
                </div>
              </div>
            ) : selectedRole ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{selectedRole.name}</h3>
                  {canManage && (
                    <button
                      onClick={() => setEditingRole(selectedRole)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 bg-blue-600/10 rounded-lg hover:bg-blue-600/20 whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-edit-line"></i>
                      Edit Permissions
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {groupedPerms[activeModule]?.map(perm => {
                    const level = selectedRole.permissions?.[perm.key] || 'no_access';
                    const opt = LEVEL_OPTIONS.find(o => o.value === level);
                    return (
                      <div key={perm.key} className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-gray-400">
                            <i className={perm.icon || 'ri-circle-line'}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{perm.label}</p>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${opt?.color || 'bg-gray-500'} text-white`}>
                          {opt?.label || 'No Access'}
                        </span>
                      </div>
                    );
                  }) || (
                    <p className="text-gray-500 text-sm py-8 text-center">Select a role to view its permissions</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 bg-gray-800 rounded-full">
                  <i className="ri-shield-user-line text-xl"></i>
                </div>
                <p>Select a role from the Roles tab to view or edit permissions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && activeView === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">User Assignments</h3>
            {canManage && (
              <button
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer"
              >
                <i className="ri-user-add-line"></i>
                Assign Role
              </button>
            )}
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Assigned Roles</th>
                  <th className="px-4 py-3">Primary Role</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {allUsersWithRoles.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 text-xs font-semibold">
                          {(u.first_name?.[0] || '') + (u.last_name?.[0] || '') || '?'}
                        </div>
                        <span className="text-white font-medium">
                          {u.first_name || ''} {u.last_name || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.email || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r: Role) => (
                          <span key={r.id} className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                            {r.name}
                          </span>
                        ))}
                        {u.roles.length === 0 && (
                          <span className="text-gray-500 text-xs">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.userRolesList.find((ur: any) => ur.is_primary)?.role?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canManage && u.userRolesList.length > 0 && (
                        <button
                          onClick={() => {
                            const first = u.userRolesList[0];
                            removeUserRole(first.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {allUsersWithRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Create New Role</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role Name</label>
                <input
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Shift Supervisor"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief description of this role"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Copy permissions from (optional)</label>
                <select
                  value={baseRoleId}
                  onChange={e => setBaseRoleId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-8"
                >
                  <option value="">Start from blank</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!newRoleName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && roleToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 flex items-center justify-center mx-auto bg-red-600/10 rounded-full">
              <i className="ri-alert-line text-red-400 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Delete Role?</h3>
              <p className="text-sm text-gray-400 mt-1">
                This will remove <span className="text-white font-medium">{roleToDelete.name}</span> and all its user assignments.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Assign Role to User</h3>
              <button onClick={() => setShowAssign(false)} className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">User</label>
                <select
                  value={assignUserId}
                  onChange={e => setAssignUserId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-8"
                >
                  <option value="">Select user</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name || ''} {u.last_name || ''} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select
                  value={assignRoleId}
                  onChange={e => setAssignRoleId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-8"
                >
                  <option value="">Select role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button
                onClick={handleAssign}
                disabled={!assignUserId || !assignRoleId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] border border-gray-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-checkbox-circle-line text-green-400"></i>
          <span className="text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
}