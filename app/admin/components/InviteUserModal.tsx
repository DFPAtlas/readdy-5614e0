'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

interface InviteUserModalProps {
  companies: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin', color: 'text-red-400' },
  { value: 'company_admin', label: 'Company Admin', color: 'text-indigo-400' },
  { value: 'operations_manager', label: 'Operations Manager', color: 'text-blue-400' },
  { value: 'guard', label: 'Guard', color: 'text-amber-400' },
  { value: 'client', label: 'Client', color: 'text-emerald-400' },
];

export default function InviteUserModal({ companies, onClose, onSuccess }: InviteUserModalProps) {
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('company_admin');
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = session?.access_token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,
            role,
            company_id: companyId || null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite user');

      setMessage({ type: 'success', text: data.message || 'User invited successfully' });
      setEmail('');
      setFirstName('');
      setLastName('');
      setRole('company_admin');
      setCompanyId('');
      onSuccess();
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold text-sm">Invite New User</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {message && (
            <div
              className={`px-3 py-2 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-600/20'
                  : 'bg-red-500/10 text-red-400 border border-red-600/20'
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              className="w-full bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Access Level (Role)</label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                    role === r.value
                      ? 'border-indigo-500 bg-indigo-600/10 text-white'
                      : 'border-gray-700/60 bg-gray-800/40 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${r.color.replace('text-', 'bg-')}`} />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {role !== 'super_admin' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Company</label>
              <div className="relative">
                <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <i className="ri-building-line text-xs" />
                </div>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required={role !== 'super_admin'}
                  className="w-full bg-gray-800/40 border border-gray-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#111827]">
                    Select a company...
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111827]">
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <i className="ri-arrow-down-s-line text-xs" />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800/40 hover:bg-gray-700/40 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}