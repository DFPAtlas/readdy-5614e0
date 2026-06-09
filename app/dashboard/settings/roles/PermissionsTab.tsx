'use client';

import { useState } from 'react';
import { LEVEL_OPTIONS, type Role, type PermissionLevel } from './lib';

interface Props {
  roles: Role[];
  permissions: { key: string; label: string; module: string; icon: string | null; description: string | null }[];
  groupedPerms: Record<string, typeof permissions>;
  sortedModules: string[];
  editingRole: Role | null;
  saving: boolean;
  onSelectRole: (role: Role | null) => void;
  onSavePermissions: (roleId: string, perms: Record<string, PermissionLevel>) => Promise<void>;
}

export default function PermissionsTab({ roles, permissions, groupedPerms, sortedModules, editingRole, saving, onSelectRole, onSavePermissions }: Props) {
  const [activeModule, setActiveModule] = useState(sortedModules[0] || 'Dashboard');
  const [draftPerms, setDraftPerms] = useState<Record<string, PermissionLevel>>();

  const selectRole = (role: Role) => {
    onSelectRole(role);
    setDraftPerms(role.permissions || {});
  };

  const setLevel = (key: string, level: PermissionLevel) => {
    setDraftPerms(prev => ({ ...prev, [key]: level }));
  };

  const handleSave = async () => {
    if (!editingRole) return;
    await onSavePermissions(editingRole.id, draftPerms);
    onSelectRole(null);
  };

  const handleCancel = () => {
    onSelectRole(null);
    setDraftPerms({});
  };

  const currentRole = editingRole;
  const isEditing = !!currentRole;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Permission Matrix</h2>
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-400 bg-gray-700/50 rounded-lg hover:bg-gray-700 whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer"
            >
              {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Role selector sidebar */}
        <div className="lg:w-56 shrink-0 space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Select a role</p>
          {roles.map(role => {
            const active = currentRole?.id === role.id;
            const activePerms = Object.values(role.permissions || {}).filter(l => l !== 'no_access').length;
            return (
              <button
                key={role.id}
                onClick={() => selectRole(role)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{role.name}</span>
                  <span className="text-[10px] text-gray-600 ml-2 shrink-0">{activePerms}</span>
                </div>
                {role.is_system && (
                  <span className="text-[10px] text-gray-500 mt-0.5 block">System role</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Permission grid */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base font-semibold text-white">{currentRole.name}</h3>
                <span className="text-xs text-gray-500">{currentRole.is_system ? 'System role' : 'Custom role'}</span>
              </div>

              {/* Module tabs */}
              <div className="flex flex-wrap gap-1">
                {sortedModules.map(mod => {
                  const count = groupedPerms[mod]?.length || 0;
                  const hasAccess = (groupedPerms[mod] || []).some(p => (draftPerms[p.key] || 'no_access') !== 'no_access');
                  return (
                    <button
                      key={mod}
                      onClick={() => setActiveModule(mod)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                        activeModule === mod
                          ? 'bg-gray-700 text-white'
                          : hasAccess
                            ? 'text-blue-400 hover:bg-gray-800'
                            : 'text-gray-500 hover:bg-gray-800'
                      }`}
                    >
                      {mod} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {(groupedPerms[activeModule] || []).map(perm => {
                  const level = draftPerms[perm.key] || 'no_access';
                  const opt = LEVEL_OPTIONS.find(o => o.value === level);
                  return (
                    <div key={perm.key} className="bg-[#111827] border border-gray-800 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-gray-400 shrink-0">
                            <i className={perm.icon || 'ri-circle-line'}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{perm.label}</p>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {LEVEL_OPTIONS.map(lvl => {
                            const active = level === lvl.value;
                            return (
                              <button
                                key={lvl.value}
                                onClick={() => setLevel(perm.key, lvl.value)}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap cursor-pointer border ${
                                  active
                                    ? `${lvl.color} text-white border-transparent shadow-sm`
                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700'
                                }`}
                                title={lvl.label}
                              >
                                {lvl.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!(groupedPerms[activeModule]?.length > 0) && (
                  <p className="text-gray-500 text-sm py-8 text-center">No permissions in this module</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-800 rounded-full">
                <i className="ri-key-line text-xl"></i>
              </div>
              <p className="text-sm">Select a role from the sidebar to edit its permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}