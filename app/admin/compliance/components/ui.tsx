'use client';

export function Pill({ value }: { value: string | null | undefined }) {
  const s = String(value || '').toLowerCase();
  let cls = 'text-gray-400 bg-white/5 border-white/10';
  if (['approved', 'published', 'ready', 'passed', 'active', 'eligible', 'verified', 'closed', 'resolved'].includes(s)) {
    cls = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
  } else if (['draft', 'under_review', 'legal_review', 'not_started', 'not_approved', 'not_reviewed', 'unassessed', 'open', 'pending_review', 'review', 'template', 'preparing', 'in_progress'].includes(s)) {
    cls = 'text-amber-300 bg-amber-500/10 border-amber-500/20';
  } else if (['failed', 'blocked', 'expired', 'suspended', 'revoked', 'ineligible', 'critical', 'high', 'not_held'].includes(s)) {
    cls = 'text-red-300 bg-red-500/10 border-red-500/20';
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls} whitespace-nowrap`}>
      {String(value || '').replace(/_/g, ' ')}
    </span>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#111827]/80 border border-gray-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function PanelHeader({ title, subtitle, count }: { title: string; subtitle?: string; count?: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-gray-500">{count} record{count === 1 ? '' : 's'}</span>
      )}
    </div>
  );
}