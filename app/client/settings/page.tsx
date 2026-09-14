'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useClientTeam, type TeamMember, type AssignedGuard } from '@/lib/useClientTeam';
import NotificationSettings from '@/app/dashboard/settings/NotificationSettings';

type Tab = 'users' | 'guards' | 'notifications' | 'security';

type Role = 'admin' | 'manager' | 'viewer';

interface InvitePayload {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

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

function maskSia(licence: string | null): string | null {
  if (!licence) return null;
  const last4 = licence.replace(/\s+/g, '').slice(-4);
  if (!last4) return null;
  return `•••• ${last4}`;
}

function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 animate-fadeSlide ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
      <div className="w-4 h-4 flex items-center justify-center">
        <i className={type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss notification" className="ml-2 w-5 h-5 flex items-center justify-center hover:bg-white/5 rounded cursor-pointer">
        <i className="ri-close-line text-xs"></i>
      </button>
    </div>
  );
}

function Dialog({ open, onClose, labelledBy, children }: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f172a] border border-white/10 rounded-xl p-6 w-full shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}

function InviteModal({ open, onClose, onInvite, isLoading }: {
  open: boolean;
  onClose: () => void;
  onInvite: (data: InvitePayload) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<InvitePayload>({ email: '', firstName: '', lastName: '', role: 'viewer' });
  const [errors, setErrors] = useState<Partial<Record<keyof InvitePayload, string>>>({});

  const validate = (): boolean => {
    const e: Partial<Record<keyof InvitePayload, string>> = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (key: keyof InvitePayload) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = () => {
    if (isLoading) return;
    if (!validate()) return;
    onInvite(form);
    setForm({ email: '', firstName: '', lastName: '', role: 'viewer' });
    setErrors({});
  };

  const roleOptions: { id: Role; label: string; desc: string }[] = [
    { id: 'admin', label: 'Admin', desc: 'Full access' },
    { id: 'manager', label: 'Manager', desc: 'Can view all' },
    { id: 'viewer', label: 'Viewer', desc: 'Read-only' },
  ];

  return (
    <Dialog open={open} onClose={onClose} labelledBy="invite-title">
      <h3 id="invite-title" className="text-lg font-semibold text-white mb-1">Invite Portal User</h3>
      <p className="text-sm text-gray-400 mb-5">Send an invite to join your client portal. They&apos;ll receive an email with login instructions.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="invite-first" className="block text-sm font-medium text-gray-300 mb-1.5">First Name *</label>
            <input
              id="invite-first"
              type="text"
              value={form.firstName}
              onChange={(e) => { setForm((p) => ({ ...p, firstName: e.target.value })); clearError('firstName'); }}
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${errors.firstName ? 'border-red-500/50' : 'border-white/10'}`}
              placeholder="John"
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="invite-last" className="block text-sm font-medium text-gray-300 mb-1.5">Last Name *</label>
            <input
              id="invite-last"
              type="text"
              value={form.lastName}
              onChange={(e) => { setForm((p) => ({ ...p, lastName: e.target.value })); clearError('lastName'); }}
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${errors.lastName ? 'border-red-500/50' : 'border-white/10'}`}
              placeholder="Smith"
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="invite-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
          <input
            id="invite-email"
            type="email"
            value={form.email}
            onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); clearError('email'); }}
            className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
            placeholder="colleague@company.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-300 mb-1.5">Role</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Role">
            {roleOptions.map((r) => (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={form.role === r.id}
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
        </fieldset>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
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
    </Dialog>
  );
}

function DeleteConfirmModal({ open, name, onConfirm, onClose, isLoading }: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onClose={isLoading ? () => {} : onClose} labelledBy="delete-title">
      <h3 id="delete-title" className="text-lg font-semibold text-white mb-2">Remove team member?</h3>
      <p className="text-sm text-gray-400 mb-5">
        {name} will lose access to the client portal immediately. This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <div className="w-4 h-4 flex items-center justify-center"><i className="ri-loader-4-line animate-spin"></i></div>}
          {isLoading ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </Dialog>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 text-center">
      <div className="w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-full mx-auto mb-3">
        <i className="ri-error-warning-line text-red-400 text-xl"></i>
      </div>
      <p className="text-gray-300 text-sm font-medium">Couldn&apos;t load this section</p>
      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
        Try again
      </button>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
      <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
        <i className={`${icon} text-gray-500 text-xl`}></i>
      </div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function MemberTableRow({ m, isSelf, isAdmin, onRemove }: {
  m: TeamMember;
  isSelf: boolean;
  isAdmin: boolean;
  onRemove: (id: string, name: string) => void;
}) {
  const name = `${m.user?.first_name || ''} ${m.user?.last_name || ''}`.trim() || 'Unknown user';
  const initials = `${m.user?.first_name?.[0] || ''}${m.user?.last_name?.[0] || ''}`.toUpperCase() || '?';
  const joined = m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-white/10 shrink-0">
            {initials}
          </div>
          <span className="text-white font-medium">{name}</span>
          {isSelf && (
            <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">You</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-gray-400">{m.user?.email || '—'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${ROLE_COLORS[m.role] || ROLE_COLORS.viewer}`}>
          {m.role}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-400 text-xs">{joined}</td>
      <td className="px-4 py-3 text-right">
        {isAdmin && !isSelf && (
          <button
            onClick={() => onRemove(m.id, name)}
            aria-label={`Remove ${name}`}
            title="Remove"
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
        )}
      </td>
    </tr>
  );
}

function MemberCard({ m, isSelf, isAdmin, onRemove }: {
  m: TeamMember;
  isSelf: boolean;
  isAdmin: boolean;
  onRemove: (id: string, name: string) => void;
}) {
  const name = `${m.user?.first_name || ''} ${m.user?.last_name || ''}`.trim() || 'Unknown user';
  const initials = `${m.user?.first_name?.[0] || ''}${m.user?.last_name?.[0] || ''}`.toUpperCase() || '?';
  const joined = m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-white/10 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium truncate">{name}</p>
            {isSelf && <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded shrink-0">You</span>}
          </div>
          <p className="text-xs text-gray-400 truncate">{m.user?.email || '—'}</p>
        </div>
        {isAdmin && !isSelf && (
          <button
            onClick={() => onRemove(m.id, name)}
            aria-label={`Remove ${name}`}
            title="Remove"
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${ROLE_COLORS[m.role] || ROLE_COLORS.viewer}`}>
          {m.role}
        </span>
        <span className="text-xs text-gray-500">Joined {joined}</span>
      </div>
    </div>
  );
}

function GuardCard({ g }: { g: AssignedGuard }) {
  const siaMasked = maskSia(g.sia_licence);
  const initials = `${g.first_name?.[0] || ''}${g.last_name?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{g.first_name} {g.last_name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize ${STATUS_COLORS[g.status] || STATUS_COLORS.active}`}>
              {g.status || 'Active'}
            </span>
            {siaMasked && (
              <span className="text-[10px] text-gray-500" title="SIA licence">SIA {siaMasked}</span>
            )}
          </div>
        </div>
      </div>

      {g.phone && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0"><i className="ri-phone-line"></i></div>
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
          {g.assigned_sites.length > 0 ? (
            g.assigned_sites.map((site) => (
              <Link
                key={site.site_id}
                href={`/client/sites/${site.site_id}`}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="text-sm text-gray-300 truncate">{site.site_name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize shrink-0 ml-2 ${RISK_COLORS[site.risk_level] || RISK_COLORS.low}`}>
                  {site.risk_level}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-xs text-gray-500">No active site assignments</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientSettingsPage() {
  const { profile, company, signOut } = useAuth();
  const { members, guards, loading, membersError, guardsError, toast, isAdmin, inviteMember, removeMember, refresh, dismissToast } = useClientTeam();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const brandColor = company?.brand_color || '#2563eb';
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'C';

  const handleInvite = async (data: InvitePayload) => {
    setInviteLoading(true);
    const result = await inviteMember(data);
    setInviteLoading(false);
    if (!result.error) {
      setInviteOpen(false);
    }
  };

  const openDelete = (id: string, name: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setRemoveLoading(true);
    const result = await removeMember(deletingId);
    setRemoveLoading(false);
    if (!result.error) {
      setDeleteOpen(false);
      setDeletingId(null);
    }
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
            <p className="font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-sm text-gray-400 truncate">{profile?.email}</p>
          </div>
          <div className="text-right hidden sm:block shrink-0">
            <p className="text-sm text-white font-medium">{company?.name || '—'}</p>
            <p className="text-xs text-gray-500">Client Portal</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="Settings" className="flex items-center gap-1 bg-[#0f172a]/50 border border-white/10 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={activeTab === t.id}
            aria-controls={`panel-${t.id}`}
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
        <div role="tabpanel" id="panel-users" aria-labelledby="tab-users" className="animate-fadeSlide">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Portal Users</h2>
              <p className="text-sm text-gray-400">Manage who can access your client portal</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-add-line"></i></div>
                Invite User
              </button>
            )}
          </div>

          {loading ? (
            <LoadingState />
          ) : membersError ? (
            <ErrorState message={membersError} onRetry={refresh} />
          ) : members.length === 0 ? (
            <EmptyState
              icon="ri-team-line"
              title="No portal users yet"
              description="Invite your team to access reports and site data"
            />
          ) : (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
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
                      <MemberTableRow
                        key={m.id}
                        m={m}
                        isSelf={m.user_id === profile?.id}
                        isAdmin={isAdmin}
                        onRemove={openDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-white/5">
                {members.map((m) => (
                  <MemberCard
                    key={m.id}
                    m={m}
                    isSelf={m.user_id === profile?.id}
                    isAdmin={isAdmin}
                    onRemove={openDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {members.length > 0 && !membersError && (
            <div className="mt-3 text-xs text-gray-500">
              {members.length} user{members.length !== 1 ? 's' : ''} with portal access
            </div>
          )}
        </div>
      )}

      {/* === ASSIGNED GUARDS === */}
      {activeTab === 'guards' && (
        <div role="tabpanel" id="panel-guards" aria-labelledby="tab-guards" className="animate-fadeSlide">
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
            <LoadingState />
          ) : guardsError ? (
            <ErrorState message={guardsError} onRetry={refresh} />
          ) : guards.length === 0 ? (
            <EmptyState
              icon="ri-shield-user-line"
              title="No guards assigned yet"
              description="Guards will appear here once shifts are scheduled at your sites"
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guards.map((g) => (
                <GuardCard key={g.id} g={g} />
              ))}
            </div>
          )}

          {guards.length > 0 && !guardsError && (
            <div className="mt-3 text-xs text-gray-500">
              {guards.length} officer{guards.length !== 1 ? 's' : ''} assigned across your sites
            </div>
          )}
        </div>
      )}

      {/* === NOTIFICATIONS === */}
      {activeTab === 'notifications' && (
        <div role="tabpanel" id="panel-notifications" aria-labelledby="tab-notifications" className="animate-fadeSlide space-y-4 max-w-2xl">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Notification Preferences</h2>
            <p className="text-sm text-gray-400">Choose what you want to be notified about</p>
          </div>

          <NotificationSettings />
        </div>
      )}

      {/* === SECURITY === */}
      {activeTab === 'security' && (
        <div role="tabpanel" id="panel-security" aria-labelledby="tab-security" className="animate-fadeSlide max-w-2xl space-y-4">
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
                Sign out of this device
              </button>
            </div>
          </div>

          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 shrink-0">
                <i className="ri-lock-2-line text-gray-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm text-gray-300">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 mt-1">
                  Multi-factor authentication is managed by your security provider. Contact your administrator to enable it for your account.
                </p>
              </div>
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
      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)} labelledBy="logout-title">
        <h3 id="logout-title" className="text-lg font-semibold text-white mb-2">Sign out?</h3>
        <p className="text-sm text-gray-400 mb-5">You&apos;ll be signed out of this device and need to sign in again to access your portal.</p>
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
      </Dialog>

      {/* Invite modal */}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} isLoading={inviteLoading} />

      {/* Delete confirm */}
      <DeleteConfirmModal
        open={deleteOpen}
        name={members.find((m) => m.id === deletingId)?.user ? `${members.find((m) => m.id === deletingId)?.user?.first_name || ''} ${members.find((m) => m.id === deletingId)?.user?.last_name || ''}`.trim() : ''}
        onConfirm={handleDelete}
        onClose={() => { setDeleteOpen(false); setDeletingId(null); }}
        isLoading={removeLoading}
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  );
}