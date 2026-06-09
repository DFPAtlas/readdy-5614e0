'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  useRolesManager,
  useCurrentUser,
  MODULE_ORDER,
  type PermissionLevel,
  type Role,
} from './lib';
import RolesTab from './RolesTab';
import PermissionsTab from './PermissionsTab';
import UsersTab from './UsersTab';
import SiteAccessTab from './SiteAccessTab';

const TABS = [
  { id: 'roles', label: 'Roles', icon: 'ri-shield-user-line' },
  { id: 'permissions', label: 'Permissions', icon: 'ri-key-line' },
  { id: 'users', label: 'User Assignments', icon: 'ri-user-add-line' },
  { id: 'sites', label: 'Site Access', icon: 'ri-map-pin-line' },
];

export default function RolesManagementPage() {
  const [activeTab, setActiveTab] = useState('roles');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const {
    roles, permissions, userRoles, users, sites, userSiteAccess,
    companyId, loading, saving,
    createRole, updateRole, deleteRole,
    updateRolePermissions,
    assignRole, removeUserRole,
    updateUserSiteAccess,
    getRoleUsers, getUserSiteAccess,
    refresh,
  } = useRolesManager();

  const { isAdmin, ready } = useCurrentUser();

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-800 rounded-full">
            <i className="ri-lock-line text-2xl text-gray-500"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm">You need admin privileges to manage roles and permissions.</p>
          <Link href="/dashboard" className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg cursor-pointer">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const sortedModules = MODULE_ORDER.filter(m => groupedPerms[m]?.length > 0);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/dashboard/settings?tab=roles" className="hover:text-white transition-colors cursor-pointer">Settings</Link>
            <span>/</span>
            <span className="text-white">Roles &amp; Permissions</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Role Management</h1>
          <p className="text-sm text-gray-400 mt-1">Define roles, configure permissions, assign users, and control site access</p>
        </div>

        <div className="flex flex-wrap gap-1 p-1 bg-gray-800/50 rounded-lg w-fit mb-6">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setEditingRole(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                  active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={tab.icon}></i>
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
          </div>
        )}

        {!loading && activeTab === 'roles' && (
          <RolesTab
            roles={roles}
            permissions={permissions}
            saving={saving}
            onCreateRole={async (name, desc, isDefault) => {
              const ok = await createRole(name, desc, isDefault);
              showToast(ok ? 'Role created successfully' : 'Failed to create role', ok ? 'success' : 'error');
              return ok;
            }}
            onUpdateRole={async (id, updates) => {
              const ok = await updateRole(id, updates);
              showToast(ok ? 'Role updated' : 'Failed to update role', ok ? 'success' : 'error');
            }}
            onDeleteRole={async (id) => {
              await deleteRole(id);
              showToast('Role deleted', 'success');
            }}
            getRoleUsers={getRoleUsers}
            onEditPermissions={(role) => { setEditingRole(role); setActiveTab('permissions'); }}
          />
        )}

        {!loading && activeTab === 'permissions' && (
          <PermissionsTab
            roles={roles}
            permissions={permissions}
            groupedPerms={groupedPerms}
            sortedModules={sortedModules}
            editingRole={editingRole}
            saving={saving}
            onSelectRole={setEditingRole}
            onSavePermissions={async (roleId, perms) => {
              await updateRolePermissions(roleId, perms);
              showToast('Permissions saved', 'success');
            }}
          />
        )}

        {!loading && activeTab === 'users' && (
          <UsersTab
            users={users}
            roles={roles}
            userRoles={userRoles}
            saving={saving}
            onAssignRole={async (userId, roleId, isPrimary) => {
              const ok = await assignRole(userId, roleId, isPrimary);
              showToast(ok ? 'Role assigned' : 'Failed to assign role', ok ? 'success' : 'error');
            }}
            onRemoveRole={async (userRoleId) => {
              await removeUserRole(userRoleId);
              showToast('Role removed', 'success');
            }}
            refresh={refresh}
          />
        )}

        {!loading && activeTab === 'sites' && (
          <SiteAccessTab
            users={users}
            sites={sites}
            userSiteAccess={userSiteAccess}
            saving={saving}
            getUserSiteAccess={getUserSiteAccess}
            onUpdateAccess={async (userId, type, siteIds, region) => {
              await updateUserSiteAccess(userId, type, siteIds, region);
              showToast('Site access updated', 'success');
            }}
          />
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm font-medium border ${
          toast.type === 'success' ? 'bg-[#111827] border-emerald-500/30 text-white' : 'bg-[#111827] border-red-500/30 text-white'
        }`}>
          <i className={toast.type === 'success' ? 'ri-checkbox-circle-line text-emerald-400' : 'ri-error-warning-line text-red-400'}></i>
          {toast.message}
        </div>
      )}
    </div>
  );
}