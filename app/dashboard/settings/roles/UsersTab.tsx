'use client';

import { useState } from 'react';
import { type Role, type UserRoleRecord } from './lib';

interface Props {
  users: any[];
  roles: Role[];
  userRoles: UserRoleRecord[];
  saving: boolean;
  onAssignRole: (userId: string, roleId: string, isPrimary: boolean) => Promise<void>;
  onRemoveRole: (userRoleId: string) => Promise<void>;
  refresh: () => void;
}

export default function UsersTab({ users, roles, userRoles, saving, onAssignRole, onRemoveRole, refresh }: Props) {
  const [showAssign, setShowAssign] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const userMap = new Map(users.map(u => [u.id, u]));
  const roleMap = new Map(roles.map(r => [r.id, r]));

  const assignmentsByUser = new Map<string, UserRoleRecord[]>();
  for (const ur of userRoles) {
    const list = assignmentsByUser.get(ur.user_id) || [];
    list.push(ur);
    assignmentsByUser.set(ur.user_id, list);
  }

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) return;
    await onAssignRole(selectedUser, selectedRole, isPrimary);
    setShowAssign(false);
    setSelectedUser('');
    setSelectedRole('');
    setIsPrimary(false);
    refresh();
  };

  const handleRemove = async (userRoleId: string) => {
    setRemovingId(userRoleId);
    await onRemoveRole(userRoleId);
    setRemovingId(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">User Role Assignments</h2>
          <p className="text-sm text-gray-400 mt-1">{userRoles.length} assignment{userRoles.length !== 1 ? 's' : ''} across {users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowAssign(true)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-user-add-line"></i>
          </div>
          Assign Role
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Assigned Roles</th>
                <th className="px-4 py-3">Primary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map(u => {
                const assignments = assignmentsByUser.get(u.id) || [];
                return (
                  <tr key={u.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 text-xs font-semibold shrink-0">
                          {(u.first_name?.[0] || '') + (u.last_name?.[0] || '') || '?'}
                        </div>
                        <span className="text-white font-medium whitespace-nowrap">
                          {u.first_name || ''} {u.last_name || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{u.email || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {assignments.map(ur => {
                          const r = roleMap.get(ur.role_id);
                          return (
                            <span key={ur.id} className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              ur.is_primary ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' : 'bg-gray-700/50 text-gray-300'
                            }`}>
                              {r?.name || 'Unknown'}
                            </span>
                          );
                        })}
                        {assignments.length === 0 && (
                          <span className="text-gray-500 text-xs">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {assignments.find(ur => ur.is_primary) ? (
                        <span className="text-xs text-blue-400 font-medium">
                          {roleMap.get(assignments.find(ur => ur.is_primary)!.role_id)?.name || '-'}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {assignments.length > 0 && (
                        <div className="flex gap-1 justify-end">
                          {assignments.map(ur => (
                            <button
                              key={ur.id}
                              onClick={() => handleRemove(ur.id)}
                              disabled={removingId === ur.id}
                              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-600/10 cursor-pointer"
                              title="Remove role"
                            >
                              {removingId === ur.id ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-close-line"></i>}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">No users found in your company</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Assign Role to User</h3>
              <button onClick={() => { setShowAssign(false); setSelectedUser(''); setSelectedRole(''); setIsPrimary(false); }} className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">User <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={e => setSelectedUser(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none pr-8"
                  >
                    <option value="">Select a user</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.first_name || ''} {u.last_name || ''} — {u.email}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-500">
                    <i className="ri-arrow-down-s-line"></i>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none pr-8"
                  >
                    <option value="">Select a role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}{r.is_system ? ' (System)' : ''}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-500">
                    <i className="ri-arrow-down-s-line"></i>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={e => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Set as primary role</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowAssign(false); setSelectedUser(''); setSelectedRole(''); setIsPrimary(false); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button
                onClick={handleAssign}
                disabled={saving || !selectedUser || !selectedRole}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer"
              >
                {saving ? <i className="ri-loader-4-line animate-spin mr-1"></i> : null}
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}