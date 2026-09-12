'use client';

import Link from 'next/link';
import type { MissingGuard, StaffingAlert, AIAlert, PatrolSummary } from '@/lib/dashboardFetch';

type Sev = 'critical' | 'high' | 'medium' | 'low';

const sevRank: Record<Sev, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const sevDot: Record<Sev, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};
const sevText: Record<Sev, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-blue-400',
};

interface AttentionItem {
  id: string;
  severity: Sev;
  title: string;
  site: string;
  detail: string;
  href: string;
}

interface AttentionPanelProps {
  missingGuards: MissingGuard[];
  staffingAlerts: StaffingAlert[];
  aiAlerts: AIAlert[];
  patrolSummary: PatrolSummary[];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function summarizeDetails(details: any): string {
  if (!details) return '';
  if (typeof details === 'string') return details;
  if (typeof details === 'object') {
    const pick = details.summary || details.message || details.reason || details.title || details.action;
    if (typeof pick === 'string') return pick;
    try { return JSON.stringify(details).slice(0, 120); } catch { return ''; }
  }
  return String(details).slice(0, 120);
}

export default function AttentionPanel({
  missingGuards, staffingAlerts, aiAlerts, patrolSummary,
}: AttentionPanelProps) {
  const items: AttentionItem[] = [];

  missingGuards.forEach((m) => {
    const noGuard = m.reason === 'no_guard_assigned';
    items.push({
      id: `mg-${m.id}`,
      severity: noGuard ? 'critical' : 'high',
      title: noGuard ? 'No guard assigned' : 'Guard missing clock-in',
      site: m.site_name,
      detail: noGuard ? `Shift starts ${formatTime(m.shift_start)}` : `${m.name} has not clocked in`,
      href: noGuard ? '/rotas' : '/guards',
    });
  });

  staffingAlerts.forEach((a) => {
    items.push({
      id: `sa-${a.site_name}-${a.shift_time}`,
      severity: a.severity === 'high' ? 'high' : a.severity === 'medium' ? 'medium' : 'low',
      title: 'Shift unfilled',
      site: a.site_name,
      detail: `${a.guard_needed} guard needed · ${formatTime(a.shift_time)}`,
      href: '/rotas',
    });
  });

  aiAlerts.forEach((a) => {
    if (a.severity !== 'high' && a.severity !== 'critical') return;
    items.push({
      id: `ai-${a.id}`,
      severity: a.severity,
      title: formatAction(a.action_type),
      site: 'Automation',
      detail: summarizeDetails(a.details),
      href: '/dashboard/ai-automation',
    });
  });

  patrolSummary.forEach((p) => {
    if (p.status === 'complete') return;
    items.push({
      id: `pt-${p.site_name}`,
      severity: p.status === 'missed' ? 'critical' : 'high',
      title: p.status === 'missed' ? 'Patrol missed' : 'Patrol incomplete',
      site: p.site_name,
      detail: `${p.checkpoints_completed}/${p.checkpoints_total} checkpoints done`,
      href: '/dashboard/patrol-monitoring',
    });
  });

  items.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  const visible = items.slice(0, 9);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-alert-line"></i>
          </span>
          Attention Required
        </h2>
        {items.length > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            {items.length}
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-5 text-center text-gray-500 text-sm">
          No items require attention.
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl overflow-hidden">
          {visible.map((item, i) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-start gap-3 px-3.5 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer ${i !== visible.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sevDot[item.severity]}`}></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-200 truncate">{item.title}</span>
                  <span className={`text-[10px] font-semibold uppercase ${sevText[item.severity]} shrink-0`}>{item.severity}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{item.site}</p>
                {item.detail && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.detail}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}