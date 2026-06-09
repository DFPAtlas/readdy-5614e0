'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientUsers } from '@/lib/useClientUsers';
import AddUserModal from './AddUserModal';

const roleOptions = [
  { value: 'viewer', label: 'Viewer', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  { value: 'manager', label: 'Manager', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  { value: 'admin', label: 'Admin', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
];

function RoleBadge({ role }: { role: string }) {
  const opt = roleOptions.find((o) => o.value === role) || roleOptions[0];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${opt.color}`}>
      {opt.label}
    </span>
  );
}

function Toast({ toast, onDismiss }: { toast: { message: string; type: 'success' | 'error' }; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = toast.type === 'success';
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        isSuccess
          ? 'bg-[#0f1f15] border-emerald-500/30 text-emerald-400'
          : 'bg-[#1f1515] border-red-500/30 text-red-400'
      }`}
    >
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        <i className={isSuccess ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
      </div>
      <span className="text-sm">{toast.message}</span>
      <button onClick={onDismiss} className="w-5 h-5 flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer">
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
}

interface ClientUsersClientProps {
  clientId: string;
}

export default function ClientUsersClient({ clientId }: ClientUsersClientProps) {
  const {
    clientUsers,
    companyUsers,
    clientName,
    loading,
    error,
    toast,
    isAdmin,
    addClientUser,
    updateClientUserRole,
    removeClientUser,
    dismissToast,
  } = useClientUsers(clientId);

  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRoleChange = useCallback(
    async (cuId: string, newRole: string) => {
      setEditingRoleId(null);
      await updateClientUserRole(cuId, newRole);
    },
    [updateClientUserRole]
  );

  const handleRemove = useCallback(
    async (cuId: string) => {
      setRemovingId(null);
      await removeClientUser(cuId);
    },
    [removeClientUser]
  );

  const alreadyLinkedUserIds = new Set(clientUsers.map((cu) => cu.user_id));
  const availableUsers = companyUsers.filter((u) => !alreadyLinkedUserIds.has(u.id));

  const fullName = (u: any) =>
    [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unnamed';

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/dashboard/sites" className="hover:text-gray-300 transition-colors cursor-pointer">
                Clients
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400">{clientName || 'Client'}</span>
              <span className="text-gray-600">/</span>
              <span>Users</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Client Users</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isAdmin
                ? 'Manage who can access this client portal.'
                : 'Users linked to this client.'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-add-line"></i>
              </div>
              Add User
            </button>
          )}
        </div>

        {!isAdmin && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 text-sm text-amber-400">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-eye-line"></i>
            </div>
            View only — you do not have permission to manage client users.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500"></span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-error-warning-line"></i>
            </div>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && clientUsers.length === 0 && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-10 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                <i className="ri-user-line text-xl"></i>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">No users linked yet</h3>
            <p className="text-sm text-gray-400 mb-4">Add users from your company to this client portal.</p>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line"></i>
                </div>
                Add User
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && clientUsers.length > 0 && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {clientUsers.map((cu) => (
                    <tr key={cu.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600/15 flex items-center justify-center text-blue-400 text-sm font-semibold">
                            {cu.user?.first_name?.[0] || ''}
                            {cu.user?.last_name?.[0] || ''}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {fullName(cu.user)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {cu.user?.role?.replace(/_/g, ' ') || 'User'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {cu.user?.email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {editingRoleId === cu.id && isAdmin ? (
                          <div className="flex items-center gap-2">
                            {roleOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => handleRoleChange(cu.id, opt.value)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                                  cu.role === opt.value
                                    ? opt.color
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                            <button
                              onClick={() => setEditingRoleId(null)}
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-300 cursor-pointer"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => isAdmin && setEditingRoleId(cu.id)}
                            className={`cursor-pointer ${!isAdmin ? 'pointer-events-none' : ''}`}
                          >
                            <RoleBadge role={cu.role} />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(cu.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          {removingId === cu.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-gray-400">Remove?</span>
                              <button
                                onClick={() => handleRemove(cu.id)}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setRemovingId(null)}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRemovingId(cu.id)}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Remove user"
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                <i className="ri-delete-bin-line"></i>
                              </div>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddUserModal
          clientName={clientName}
          availableUsers={availableUsers}
          onAdd={addClientUser}
          onClose={() => setShowAddModal(false)}
          fullName={fullName}
        />
      )}
    </div>
  );
}