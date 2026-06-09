'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useClientTeam } from '@/lib/useClientTeam';
import NotificationSettings from '@/app/dashboard/settings/NotificationSettings';

type Tab = 'users' | 'guards' | 'notifications' | 'security';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'users', label: 'Portal Users', icon: 'ri-team-line' },
  { id: 'guards', label: 'Assigned Guards', icon: 'ri-shield-user-line' },
  { id: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
  { id: 'security', label: 'Security', icon: 'ri-shield-keyhole-line' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  manager: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  viewer: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/15 text-red-400 border-red-500/20',
  on_leave: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

const RISK_COLORS: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/15 text-red-400 border-red-500/20',
};

function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 animate-fadeSlide ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
      <div className="w-4 h-4 flex items-center justify-center">
        <i className={type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 w-5 h-5 flex items-center justify-center hover:bg-white/5 rounded cursor-pointer">
        <i className="ri-close-line text-xs"></i>
      </button>
    </div>
  );
}

function InviteModal({ open, onClose, onInvite, isLoading }: {
  open: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; firstName: string; lastName: string; role: 'admin' | 'manager' | 'viewer' }) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', role: 'viewer' as const });
  const [errors, setErrors] = useState<Record<string, string>>();

  if (!open) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onInvite(form);
    setForm({ email: '', firstName: '', lastName: '', role: 'viewer' });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-1">Invite Portal User</h3>
        <p className="text-sm text-gray-400 mb-5">Send an invite to join your client portal. They&apos;ll receive an email with login instructions.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => { setForm((p) => ({ ...p, firstName: e.target.value })); setErrors((prev) => { const n = { ...prev }; delete n.firstName; return n; }); }}
                className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${errors.firstName ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="John"
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => { setForm((p) => ({ ...p, lastName: e.target.value })); setErrors((prev) => { const n = { ...prev }; delete n.lastName; return n; }); }}
                className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${errors.lastName ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="Smith"
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((prev) => { const n = { ...prev }; delete n.email; return n; }); }}
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
              placeholder="colleague@company.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'admin', label: 'Admin', desc: 'Full access' },
                { id: 'manager', label: 'Manager', desc: 'Can view all' },
                { id: 'viewer', label: 'Viewer', desc: 'Read-only' },
              ] as { id: 'admin' | 'manager' | 'viewer'; label: string; desc: string }[]).map((r) => (
                <button
                  key={r.id}
                  onClick={() => setForm((p) => ({ ...p, role: r.id }))}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                    form.role === r.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <p>{r.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-loader-4-line animate-spin"></i></div>
                Sending...
              </>
            ) : (
              <>
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-send-line"></i></div>
                Send Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ open, name, onConfirm, onClose }: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-2">Remove team member?</h3>
        <p className="text-sm text-gray-400 mb-5">
          {name} will lose access to the client portal immediately. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientSettingsPage() {
  const { profile, company, signOut } = useAuth();
  const { members, guards, loading, toast, isAdmin, inviteMember, removeMember, refresh, dismissToast } = useClientTeam();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [showNotifs, setShowNotifs] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const brandColor = company?.brand_color || '#2563eb';
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'C';

  const handleInvite = async (data: { email: string; firstName: string; lastName: string; role: 'admin' | 'manager' | 'viewer' }) => {
    setInviteLoading(true);
    await inviteMember(data);
    setInviteLoading(false);
    setInviteOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeMember(deletingId);
    setDeleteOpen(false);
    setDeletingId(null);
  };

  const openDelete = (id: string, name: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  return (
    <div className="max-w-5xl">
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlide { animation: fadeSlide 0.25s ease-out both; }
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your portal users, assigned guards, and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-sm text-gray-400">{profile?.email}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-white font-medium">{company?.name || '—'}</p>
            <p className="text-xs text-gray-500">Client Portal</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-[#0f172a]/50 border border-white/10 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className={t.icon}></i></div>
            {t.label}
          </button>
        ))}
      </div>

      {/* === PORTAL USERS === */}
      {activeTab === 'users' && (
        <div className="animate-fadeSlide">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Portal Users</h2>
              <p className="text-sm text-gray-400">Manage who can access your client portal</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-add-line"></i></div>
                Invite User
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
                <i className="ri-team-line text-gray-500 text-xl"></i>
              </div>
              <p className="text-gray-400 text-sm font-medium">No portal users yet</p>
              <p className="text-xs text-gray-500 mt-1">Invite your team to access reports and site data</p>
            </div>
          ) : (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-white/10">
                              {m.user?.first_name?.[0] || ''}{m.user?.last_name?.[0] || ''}
                            </div>
                            <span className="text-white font-medium">
                              {m.user?.first_name} {m.user?.last_name}
                            </span>
                            {m.user_id === profile?.id && (
                              <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">You</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{m.user?.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${ROLE_COLORS[m.role] || ROLE_COLORS.viewer}`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isAdmin && m.user_id !== profile?.id && (
                            <button
                              onClick={() => openDelete(m.id, `${m.user?.first_name} ${m.user?.last_name}`)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {members.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              {members.length} user{members.length !== 1 ? 's' : ''} with portal access
            </div>
          )}
        </div>
      )}

      {/* === ASSIGNED GUARDS === */}
      {activeTab === 'guards' && (
        <div className="animate-fadeSlide">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Assigned Guards</h2>
              <p className="text-sm text-gray-400">Officers assigned to your sites</p>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : guards.length === 0 ? (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
                <i className="ri-shield-user-line text-gray-500 text-xl"></i>
              </div>
              <p className="text-gray-400 text-sm font-medium">No guards assigned yet</p>
              <p className="text-xs text-gray-500 mt-1">Guards will appear here once shifts are scheduled at your sites</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guards.map((g) => (
                <div key={g.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
                      {g.first_name?.[0] || ''}{g.last_name?.[0] || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{g.first_name} {g.last_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${STATUS_COLORS[g.status] || STATUS_COLORS.active}`}>
                          {g.status || 'Active'}
                        </span>
                        {g.sia_licence && (
                          <span className="text-[10px] text-gray-500">SIA {g.sia_licence}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {g.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-phone-line"></i></div>
                      {g.phone}
                    </div>
                  )}

                  {g.skills && g.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {g.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-gray-400 rounded border border-white/10">
                          {skill}
                        </span>
                      ))}
                      {g.skills.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-gray-500">+{g.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Assigned Sites</p>
                    <div className="space-y-1.5">
                      {g.assigned_sites.map((site) => (
                        <Link
                          key={site.site_id}
                          href={`/client/sites/${site.site_id}`}
                          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <span className="text-sm text-gray-300 truncate">{site.site_name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${RISK_COLORS[site.risk_level] || RISK_COLORS.low}`}>
                            {site.risk_level}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {guards.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              {guards.length} officer{guards.length !== 1 ? 's' : ''} assigned across your sites
            </div>
          )}
        </div>
      )}

      {/* === NOTIFICATIONS === */}
      {activeTab === 'notifications' && (
        <div className="animate-fadeSlide space-y-4 max-w-2xl">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Notification Preferences</h2>
            <p className="text-sm text-gray-400">Choose what you want to be notified about</p>
          </div>

          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="text-sm font-semibold text-white">Email Settings</h3>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                {showNotifs ? 'Hide' : 'Configure'}
              </button>
            </div>
            {showNotifs && (
              <div className="px-6 pb-6">
                <NotificationSettings />
              </div>
            )}
            {!showNotifs && (
              <div className="px-6 pb-6 space-y-3">
                {[
                  { label: 'Email me when a new incident is reported', desc: 'Immediate alert for high or critical severity incidents', defaultOn: true },
                  { label: 'Email me when weekly reports are ready', desc: 'Every Monday morning when the weekly report is published', defaultOn: true },
                  { label: 'Email me for patrol completion summaries', desc: 'Daily digest of patrol activity across all sites', defaultOn: false },
                ].map((pref) => (
                  <label key={pref.label} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={pref.defaultOn} className="mt-0.5 w-4 h-4 rounded border-white/10 bg-[#0f172a] text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <div>
                      <p className="text-sm font-medium text-white">{pref.label}</p>
                      <p className="text-xs text-gray-500">{pref.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-2">In-App Alerts</h3>
            {[
              { label: 'Show badge for unread messages', defaultOn: true },
              { label: 'Show incident severity badges', defaultOn: true },
              { label: 'Show site status updates in real time', defaultOn: true },
            ].map((pref) => (
              <label key={pref.label} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={pref.defaultOn} className="mt-0.5 w-4 h-4 rounded border-white/10 bg-[#0f172a] text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <p className="text-sm text-gray-300">{pref.label}</p>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* === SECURITY === */}
      {activeTab === 'security' && (
        <div className="animate-fadeSlide max-w-2xl space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Security</h2>
            <p className="text-sm text-gray-400">Account security and session management</p>
          </div>

          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-white mb-1">Active Session</p>
              <p className="text-xs text-gray-500">Signed in as {profile?.email} on this device</p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => setConfirmLogout(true)}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-line"></i></div>
                Sign out of all devices
              </button>
            </div>
          </div>

          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 mt-0.5">Coming soon</p>
              </div>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">Coming Soon</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-8 pb-4">
        <p>Powered by {company?.name || 'your security provider'}</p>
        <p className="mt-1">GuardianHub Client Portal</p>
      </div>

      {/* Logout confirmation */}
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Sign out?</h3>
            <p className="text-sm text-gray-400 mb-5">You&apos;ll need to sign in again to access your portal.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmLogout(false); signOut(); }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} isLoading={inviteLoading} />

      {/* Delete confirm */}
      <DeleteConfirmModal
        open={deleteOpen}
        name={members.find((m) => m.id === deletingId)?.user?.first_name || ''}
        onConfirm={handleDelete}
        onClose={() => { setDeleteOpen(false); setDeletingId(null); }}
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  );
}