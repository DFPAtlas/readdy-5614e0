'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { usePlatformAccess } from '@/lib/usePlatformAccess';

export default function PlatformRolesPage() {
  const { profile } = useAuth();
  const { roles, assignments, can, grantRole, revokeRole } = usePlatformAccess(profile?.id || null);
  const [users, setUsers] = useState<any[]>([]);
  const [showGrant, setShowGrant] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [grantReason, setGrantReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from('users').select('id,first_name,last_name,email,role').order('last_name');
      if (data) setUsers(data);
    };
    loadUsers();
  }, []);

  const handleGrant = async () => {
    if (!selectedUser || !selectedRole || !grantReason) {
      setMessage({ text: 'All fields are required', type: 'error' });
      return;
    }
    const { error } = await grantRole(selectedUser, selectedRole, grantReason, expiresAt || null);
    if (error) {
      setMessage({ text: 'Failed to grant role', type: 'error' });
    } else {
      setMessage({ text: 'Role granted successfully', type: 'success' });
      setShowGrant(false);
      setSelectedUser('');
      setSelectedRole('');
      setGrantReason('');
      setExpiresAt('');
    }
  };

  const handleRevoke = async (assignmentId: string) => {
    const reason = prompt('Reason for revocation:');
    if (!reason) return;
    const { error } = await revokeRole(assignmentId, reason);
    setMessage(error ? { text: 'Failed to revoke role', type: 'error' } : { text: 'Role revoked', type: 'success' });
  };

  if (!can('roles.platform.view')) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-red-400"><i className="ri-lock-line text-3xl"></i></div>
        <h2 className="text-lg font-semibold text-white">Access Denied</h2>
        <p className="text-sm text-gray-400 mt-1">Only Platform Owners can manage platform roles.</p>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    platform_owner: 'bg-purple-600/15 text-purple-400',
    platform_superadmin: 'bg-indigo-600/15 text-indigo-400',
    platform_support: 'bg-blue-600/15 text-blue-400',
    platform_finance: 'bg-emerald-600/15 text-emerald-400',
    platform_security: 'bg-red-600/15 text-red-400',
    platform_operations: 'bg-amber-600/15 text-amber-400',
    platform_auditor: 'bg-gray-600/15 text-gray-400',
    platform_readonly: 'bg-slate-600/15 text-slate-400',
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Roles</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage platform-level access for staff members</p>
        </div>
        {can('roles.platform.manage') && (
          <button onClick={() => setShowGrant(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-add-line"></i></div>
            Grant Role
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-600/10 border border-emerald-600/20 text-emerald-400' : 'bg-red-600/10 border border-red-600/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {showGrant && (
        <div className="mb-6 bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Grant Platform Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">User</label>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                <option value="">Select role...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Reason</label>
              <input type="text" value={grantReason} onChange={(e) => setGrantReason(e.target.value)} placeholder="Why is this role being granted?" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Expires (optional)</label>
              <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleGrant} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">Confirm Grant</button>
            <button onClick={() => setShowGrant(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Platform Roles</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {roles.map((role) => (
              <div key={role.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{role.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleColors[role.slug] || 'bg-gray-600/15 text-gray-400'}`}>{role.slug}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                </div>
                <div className="text-xs text-gray-600">{role.is_system ? 'System' : 'Custom'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Current Assignments</h3>
          </div>
          <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
            {assignments.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-gray-500">No platform role assignments yet</div>
            )}
            {assignments.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">
                      {a.user_profile?.first_name} {a.user_profile?.last_name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleColors[a.platform_role?.slug || ''] || 'bg-gray-600/15 text-gray-400'}`}>
                      {a.platform_role?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    {!a.is_active && <span className="text-red-400">Revoked</span>}
                    {a.expires_at && new Date(a.expires_at) > new Date() && (
                      <span>Expires {new Date(a.expires_at).toLocaleDateString('en-GB')}</span>
                    )}
                    {a.expires_at && new Date(a.expires_at) <= new Date() && (
                      <span className="text-red-400">Expired</span>
                    )}
                    {a.mfa_verified_at && <span className="text-emerald-400">MFA Verified</span>}
                    {!a.mfa_verified_at && <span className="text-amber-400">MFA Pending</span>}
                  </div>
                </div>
                {a.is_active && can('roles.platform.manage') && (
                  <button onClick={() => handleRevoke(a.id)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-600/10 cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-circle-line"></i></div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}