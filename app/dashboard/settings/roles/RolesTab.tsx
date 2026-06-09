'use client';

import { useState } from 'react';
import { LEVEL_OPTIONS, type Role, type UserRoleRecord } from './lib';

interface Props {
  roles: Role[];
  permissions: { key: string; label: string }[];
  saving: boolean;
  onCreateRole: (name: string, description: string, isDefault: boolean) => Promise<boolean>;
  onUpdateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
  getRoleUsers: (roleId: string) => UserRoleRecord[];
  onEditPermissions: (role: Role) => void;
}

export default function RolesTab({ roles, permissions, saving, onCreateRole, onUpdateRole, onDeleteRole, getRoleUsers, onEditPermissions }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDefault, setNewDefault] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDefault, setEditDefault] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const ok = await onCreateRole(newName.trim(), newDesc.trim(), newDefault);
    if (ok) {
      setNewName('');
      setNewDesc('');
      setNewDefault(false);
      setShowCreate(false);
    }
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setEditName(role.name);
    setEditDesc(role.description || '');
    setEditDefault(role.is_default);
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRole || !editName.trim()) return;
    await onUpdateRole(editingRole.id, { name: editName.trim(), description: editDesc.trim(), is_default: editDefault });
    setShowEdit(false);
    setEditingRole(null);
  };

  const openDelete = (role: Role) => {
    setEditingRole(role);
    setShowDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingRole) return;
    await onDeleteRole(editingRole.id);
    setShowDelete(false);
    setEditingRole(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">All Roles</h2>
          <p className="text-sm text-gray-400 mt-1">{roles.length} role{roles.length !== 1 ? 's' : ''} defined for your company</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-add-line"></i>
          </div>
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map(role => {
          const userCount = getRoleUsers(role.id).length;
          const activeCount = Object.values(role.permissions || {}).filter(l => l !== 'no_access').length;
          return (
            <div key={role.id} className="bg-[#111827] border border-gray-800 rounded-lg p-5 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                    <i className="ri-shield-user-line text-blue-400"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{role.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {role.is_system && (
                        <span className="px-1.5 py-0.5 bg-gray-700/50 text-gray-400 text-[10px] font-medium rounded uppercase tracking-wide">System</span>
                      )}
                      {role.is_default && (
                        <span className="px-1.5 py-0.5 bg-blue-600/15 text-blue-400 text-[10px] font-medium rounded uppercase tracking-wide">Default</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-3 line-clamp-2 min-h-[32px]">{role.description || 'No description'}</p>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-user-line"></i>
                  </div>
                  {userCount} user{userCount !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-key-line"></i>
                  </div>
                  {activeCount} permission{activeCount !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-800">
                <button
                  onClick={() => onEditPermissions(role)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-600/10 rounded-md hover:bg-blue-600/20 whitespace-nowrap cursor-pointer"
                >
                  Edit Permissions
                </button>
                <button
                  onClick={() => openEdit(role)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-700/50 rounded-md hover:bg-gray-700 whitespace-nowrap cursor-pointer"
                >
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-edit-line"></i>
                  </div>
                </button>
                {!role.is_system && (
                  <button
                    onClick={() => openDelete(role)}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-600/10 rounded-md hover:bg-red-600/20 whitespace-nowrap cursor-pointer"
                  >
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-delete-bin-line"></i>
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 bg-gray-800 rounded-full">
            <i className="ri-shield-user-line text-xl"></i>
          </div>
          <p>No roles found. Create your first custom role.</p>
        </div>
      )}

      {/* Create Modal */}
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
                <label className="block text-sm text-gray-400 mb-1">Role Name <span className="text-red-400">*</span></label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Shift Supervisor"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief description"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newDefault}
                  onChange={e => setNewDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Set as default role for new users</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer"
              >
                {saving ? <i className="ri-loader-4-line animate-spin mr-1"></i> : null}
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editingRole && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit Role</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role Name <span className="text-red-400">*</span></label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editDefault}
                  onChange={e => setEditDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Set as default role for new users</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && editingRole && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 flex items-center justify-center mx-auto bg-red-600/10 rounded-full">
              <i className="ri-alert-line text-red-400 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Delete Role?</h3>
              <p className="text-sm text-gray-400 mt-1">
                This will permanently remove <span className="text-white font-medium">{editingRole.name}</span> and all its user assignments.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer">Delete Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}