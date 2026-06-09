'use client';

import Link from 'next/link';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
  pending_setup: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending Setup' },
  suspended: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Suspended' },
  cancelled: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Cancelled' },
  archived: { color: 'text-gray-500', bg: 'bg-gray-600/10', label: 'Archived' },
  client_created: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Client Created' },
  client_status_change: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Status Changed' },
  client_edited: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Client Edited' },
  plan_changed: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Plan Changed' },
  admin_note_added: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Note Added' },
  billing_status_changed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Billing Changed' },
  client_suspend: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Client Suspended' },
  client_reactivate: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Client Reactivated' },
  client_archive: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Client Archived' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.archived;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {cfg.label}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: string | null }) {
  const planColors: Record<string, string> = {
    sentinel: 'text-blue-400 bg-blue-500/10',
    watcher: 'text-purple-400 bg-purple-500/10',
    guardian: 'text-amber-400 bg-amber-500/10',
    enterprise: 'text-indigo-400 bg-indigo-500/10',
  };
  const cls = planColors[plan || 'sentinel'] || planColors.sentinel;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize ${cls}`}>
      {plan || 'Sentinel'}
    </span>
  );
}

export function SubscriptionStatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: 'text-emerald-400 bg-emerald-500/10', label: 'Active' },
    trialing: { cls: 'text-blue-400 bg-blue-500/10', label: 'Trialing' },
    past_due: { cls: 'text-amber-400 bg-amber-500/10', label: 'Past Due' },
    cancelled: { cls: 'text-red-400 bg-red-500/10', label: 'Cancelled' },
    unpaid: { cls: 'text-red-400 bg-red-500/10', label: 'Unpaid' },
    incomplete: { cls: 'text-gray-400 bg-gray-500/10', label: 'Incomplete' },
  };
  const s = map[status || 'incomplete'] || map.incomplete;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  href?: string;
}) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: 'bg-indigo-600/10', text: 'text-indigo-400', border: 'border-indigo-600/20' },
    emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-600/20' },
    amber: { bg: 'bg-amber-600/10', text: 'text-amber-400', border: 'border-amber-600/20' },
    red: { bg: 'bg-red-600/10', text: 'text-red-400', border: 'border-red-600/20' },
    blue: { bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-600/20' },
    purple: { bg: 'bg-purple-600/10', text: 'text-purple-400', border: 'border-purple-600/20' },
    gray: { bg: 'bg-gray-600/10', text: 'text-gray-400', border: 'border-gray-600/20' },
  };
  const c = colors[color] || colors.indigo;
  const Wrapper = href ? Link : 'div';
  const props = href ? { href, className: `group` } : {};

  return (
    <Wrapper
      {...props}
      className={`bg-[#111827] border ${c.border} rounded-xl p-5 hover:border-gray-700 transition-all ${href ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <div className={`w-5 h-5 flex items-center justify-center ${c.text}`}>
            <i className={icon}></i>
          </div>
        </div>
        {href && (
          <div className="w-6 h-6 flex items-center justify-center text-gray-600 group-hover:text-gray-400 transition-colors">
            <i className="ri-arrow-right-line"></i>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </Wrapper>
  );
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 flex items-center justify-center text-gray-600 mb-3">
        <i className={`${icon} text-2xl`}></i>
      </div>
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-xs text-gray-600 mt-1 max-w-xs">{description}</p>
    </div>
  );
}