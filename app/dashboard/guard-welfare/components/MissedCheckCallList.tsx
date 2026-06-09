'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGuardWelfare, type LoneWorkerSession } from '@/lib/useGuardWelfare';
import GlassCard from '@/app/components/GlassCard';

interface Props {
  sessions: LoneWorkerSession[];
}

function getSeverity(session: LoneWorkerSession): {
  label: string;
  color: string;
  bg: string;
  pulse: boolean;
  level: number;
} {
  const missed = session.missed_check_ins || 0;
  const escalation = session.escalation_level || 0;

  if (escalation >= 3 || (missed >= 3 && !session.alarm_acknowledged_at)) {
    return { label: 'Critical Escalation', color: 'text-red-400', bg: 'bg-red-500/10', pulse: true, level: 3 };
  }
  if (escalation >= 2 || missed >= 2) {
    return { label: 'Supervisor Alert', color: 'text-orange-400', bg: 'bg-orange-500/10', pulse: true, level: 2 };
  }
  if (missed >= 1) {
    return { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10', pulse: false, level: 1 };
  }
  return { label: 'OK', color: 'text-emerald-400', bg: 'bg-emerald-500/10', pulse: false, level: 0 };
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function timeSince(iso: string | null): string {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function MissedCheckCallList({ sessions }: Props) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'supervisor' | 'warning'>('all');

  const withIssues = sessions.filter((s) => {
    const missed = s.missed_check_ins || 0;
    const escalation = s.escalation_level || 0;
    return missed > 0 || escalation > 0 || s.alarm_triggered_at;
  });

  const filtered = withIssues.filter((s) => {
    const sev = getSeverity(s);
    if (filter === 'all') return true;
    if (filter === 'critical') return sev.level >= 3;
    if (filter === 'supervisor') return sev.level === 2;
    if (filter === 'warning') return sev.level === 1;
    return true;
  });

  const counts = {
    all: withIssues.length,
    critical: withIssues.filter((s) => getSeverity(s).level >= 3).length,
    supervisor: withIssues.filter((s) => getSeverity(s).level === 2).length,
    warning: withIssues.filter((s) => getSeverity(s).level === 1).length,
  };

  const tabs = [
    { key: 'all' as const, label: 'All', count: counts.all },
    { key: 'critical' as const, label: 'Critical', count: counts.critical },
    { key: 'supervisor' as const, label: 'Supervisor', count: counts.supervisor },
    { key: 'warning' as const, label: 'Warning', count: counts.warning },
  ];

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-amber-400">
            <i className="ri-phone-lock-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Missed Check Calls</h3>
        </div>
        <Link href="/dashboard/lone-worker" className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
          View All
        </Link>
      </div>

      <div className="flex px-5 pb-3 gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === t.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label} {t.count > 0 && <span className="text-gray-500">({t.count})</span>}
          </button>
        ))}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-5 pb-5 text-center text-xs text-gray-500 py-8">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            No missed check calls. All guards are responding.
          </div>
        ) : (
          filtered.map((session) => {
            const sev = getSeverity(session);
            const isOverdue = session.next_check_in_due_at && new Date(session.next_check_in_due_at) < new Date();
            return (
              <div
                key={session.id}
                className="px-5 py-3 border-t border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {sev.pulse && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sev.bg.replace('/10', '')}`}></span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{session.guard_name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sev.bg} ${sev.color} shrink-0`}>
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{session.site_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-gray-500">
                      Missed: <span className="text-gray-400 font-medium">{session.missed_check_ins || 0}</span>
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Last check: <span className="text-gray-400">{timeSince(session.last_check_in_at)}</span>
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] text-red-400 font-medium">
                        Due: {formatTime(session.next_check_in_due_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div className="flex gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                      <i className="ri-phone-line text-xs"></i>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer">
                      <i className="ri-message-3-line text-xs"></i>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                      <i className="ri-arrow-up-circle-line text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}