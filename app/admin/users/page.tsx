'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminUsers, AdminUser } from '@/lib/useSuperAdmin';
import { useSuperAdminCompanies } from '@/lib/useSuperAdmin';
import { EmptyState } from '../components/AdminUI';
import InviteUserModal from '../components/InviteUserModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const roleColors: Record<string, string> = {
  super_admin: 'text-red-400 bg-red-500/10',
  company_admin: 'text-indigo-400 bg-indigo-500/10',
  operations_manager: 'text-blue-400 bg-blue-500/10',
  guard: 'text-amber-400 bg-amber-500/10',
  client: 'text-emerald-400 bg-emerald-500/10',
};

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [resending, setResending] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

  const { users, loading, refetch } = useAdminUsers();
  const { companies } = useSuperAdminCompanies();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-role-dropdown]')) {
        setRoleDropdownOpen(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleResendInvite = async (u: AdminUser) => {
    setResending(u.id);
    setActionMessage(null);
    try {
      const token = session?.access_token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-resend-invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: u.email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend invite');
      setActionMessage({ id: u.id, type: 'success', text: 'Invite resent' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage({ id: u.id, type: 'error', text: err.message });
    } finally {
      setResending(null);
    }
  };

  const handleToggleStatus = async (u: AdminUser) => {
    setTogglingStatus(u.id);
    setActionMessage(null);
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', u.id);
      if (error) throw error;
      await refetch();
      setActionMessage({ id: u.id, type: 'success', text: newStatus === 'active' ? 'User reactivated' : 'User deactivated' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage({ id: u.id, type: 'error', text: err.message || 'Failed' });
    } finally {
      setTogglingStatus(null);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.company_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">All Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} total users across all companies</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-user-add-line" />
          </div>
          Invite User
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-xs" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-gray-800/40 border border-gray-700/60 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>

        <div className="flex items-center gap-1">
          {['all', 'company_admin', 'operations_manager', 'guard', 'client', 'super_admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1.5 rounded text-xs capitalize transition-colors cursor-pointer whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'bg-gray-800/40 text-gray-500 hover:text-gray-300'
              }`}
            >
              {r === 'all' ? 'All Roles' : r.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading users...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="ri-team-line" title="No users found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Signup Date</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-white font-medium">{u.first_name} {u.last_name}</div>
                      {editingRole === u.id && (
                        <span className="text-[10px] text-indigo-400">Updating...</span>
                      )}
                      {updateMessage?.id === u.id && !editingRole && (
                        <span className={`text-[10px] ${updateMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {updateMessage.text}
                        </span>
                      )}
                      {actionMessage?.id === u.id && !resending && !togglingStatus && (
                        <span className={`text-[10px] ${actionMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {actionMessage.text}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{u.email || '-'}</td>
                    <td className="px-5 py-3" data-role-dropdown>
                      <div className="relative">
                        <button
                          onClick={() => setRoleDropdownOpen(roleDropdownOpen === u.id ? null : u.id)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                            roleColors[u.role] || 'text-gray-400 bg-gray-500/10'
                          }`}
                        >
                          {u.role.replace(/_/g, ' ')}
                          <div className="w-3 h-3 flex items-center justify-center opacity-60">
                            <i className="ri-arrow-down-s-line" />
                          </div>
                        </button>

                        {roleDropdownOpen === u.id && (
                          <div className="absolute z-50 mt-1 bg-[#1a2235] border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]">
                            {['super_admin', 'company_admin', 'operations_manager', 'guard', 'client'].map((r) => (
                              <button
                                key={r}
                                onClick={async () => {
                                  setRoleDropdownOpen(null);
                                  if (r === u.role) return;
                                  setEditingRole(u.id);
                                  setUpdateMessage(null);
                                  try {
                                    const { error } = await supabase.from('users').update({ role: r }).eq('id', u.id);
                                    if (error) throw error;
                                    await refetch();
                                    setUpdateMessage({ id: u.id, type: 'success', text: 'Role updated' });
                                    setTimeout(() => setUpdateMessage(null), 2000);
                                  } catch (err: any) {
                                    setUpdateMessage({ id: u.id, type: 'error', text: err.message || 'Failed to update' });
                                  } finally {
                                    setEditingRole(null);
                                  }
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-white/[0.03] transition-colors flex items-center gap-2 ${
                                  u.role === r ? 'text-white' : 'text-gray-400'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${roleColors[r]?.split(' ')[0]?.replace('text-', 'bg-') || 'bg-gray-500'}`} />
                                {r.replace(/_/g, ' ')}
                                {u.role === r && (
                                  <span className="ml-auto text-[10px] text-gray-500">Current</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {u.company_id ? (
                        <Link href={`/admin/clients/detail?id=${u.company_id}`} className="text-indigo-400 hover:text-indigo-300 text-xs cursor-pointer">
                          {u.company_name || 'Unknown'}
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                        u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleResendInvite(u)}
                          disabled={resending === u.id || !u.email}
                          title="Resend invitation"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-600/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {resending === u.id ? (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
                          ) : (
                            <i className="ri-mail-send-line text-xs" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={togglingStatus === u.id}
                          title={u.status === 'active' ? 'Deactivate user' : 'Reactivate user'}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            u.status === 'active'
                              ? 'text-gray-500 hover:text-red-400 hover:bg-red-600/10'
                              : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-600/10'
                          }`}
                        >
                          {togglingStatus === u.id ? (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
                          ) : u.status === 'active' ? (
                            <i className="ri-user-unfollow-line text-xs" />
                          ) : (
                            <i className="ri-user-follow-line text-xs" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {inviteOpen && (
        <InviteUserModal
          companies={companies.map((c) => ({ id: c.id, name: c.name }))}
          onClose={() => setInviteOpen(false)}
          onSuccess={() => refetch?.()}
        />
      )}
    </div>
  );
}