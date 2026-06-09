'use client';

import { useState } from 'react';
import { useGuardWelfare, type WelfareGuard, type LoneWorkerSession, type WellbeingCheckin } from '@/lib/useGuardWelfare';
import GlassCard from '@/app/components/GlassCard';

interface Props {
  guards: WelfareGuard[];
  sessions: LoneWorkerSession[];
  wellbeingCheckins: WellbeingCheckin[];
}

function timeSince(iso: string | null): string {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getWellbeingColor(score: number | null): { text: string; bg: string } {
  if (score === null) return { text: 'text-gray-400', bg: 'bg-gray-500/10' };
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/10' };
  if (score >= 40) return { text: 'text-orange-400', bg: 'bg-orange-500/10' };
  return { text: 'text-red-400', bg: 'bg-red-500/10' };
}

export default function GuardActivityTimeline({ guards, sessions, wellbeingCheckins }: Props) {
  const [tab, setTab] = useState<'activity' | 'wellbeing' | 'inactive'>('activity');

  const activeGuards = guards.filter((g) => g.on_duty);
  const sortedByActivity = [...activeGuards].sort((a, b) => {
    const aTime = a.last_activity ? new Date(a.last_activity).getTime() : 0;
    const bTime = b.last_activity ? new Date(b.last_activity).getTime() : 0;
    return aTime - bTime;
  });

  const wellbeingGuards = [...guards]
    .filter((g) => g.wellbeing_score !== null)
    .sort((a, b) => {
      const aScore = a.wellbeing_score ?? 0;
      const bScore = b.wellbeing_score ?? 0;
      return aScore - bScore;
    });

  const inactiveGuards = guards.filter((g) => (g as any).no_recent_activity && g.on_duty);

  const recentCheckins = [...wellbeingCheckins].slice(0, 10);

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-blue-400">
            <i className="ri-timeline-view text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Guard Activity Timeline</h3>
        </div>
      </div>

      <div className="flex px-5 pb-3 gap-1 overflow-x-auto">
        <button
          onClick={() => setTab('activity')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            tab === 'activity' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          On Duty ({activeGuards.length})
        </button>
        <button
          onClick={() => setTab('wellbeing')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            tab === 'wellbeing' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Wellbeing ({wellbeingGuards.length})
        </button>
        <button
          onClick={() => setTab('inactive')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            tab === 'inactive' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Inactive ({inactiveGuards.length})
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {tab === 'activity' && (
          sortedByActivity.length === 0 ? (
            <div className="px-5 pb-5 text-center text-xs text-gray-500 py-8">
              <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                  <i className="ri-user-forbid-line text-sm"></i>
                </div>
              </div>
              No guards currently on duty.
            </div>
          ) : (
            sortedByActivity.map((g) => {
              const session = sessions.find((s) => s.guard_id === g.id);
              const hasAlarm = session?.alarm_triggered_at && !session.alarm_acknowledged_at;
              const isLate = (g.missed_check_ins || 0) > 0;
              return (
                <div key={g.id} className="px-5 py-3 border-t border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {hasAlarm && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${hasAlarm ? 'bg-red-500' : isLate ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {g.first_name} {g.last_name}
                      </span>
                      {hasAlarm && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 shrink-0">
                          Alarm
                        </span>
                      )}
                      {isLate && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 shrink-0">
                          {g.missed_check_ins} missed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-gray-500">
                        Last activity: <span className="text-gray-400">{timeSince(g.last_activity)}</span>
                      </span>
                      {g.phone && (
                        <span className="text-[10px] text-gray-500">{g.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                      <i className="ri-phone-line text-xs"></i>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer">
                      <i className="ri-message-3-line text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}

        {tab === 'wellbeing' && (
          recentCheckins.length === 0 ? (
            <div className="px-5 pb-5 text-center text-xs text-gray-500 py-8">
              <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                  <i className="ri-heart-pulse-line text-sm"></i>
                </div>
              </div>
              No wellbeing checkins recorded yet.
            </div>
          ) : (
            recentCheckins.map((w) => {
              const score = w.overall_score ? Math.round(Number(w.overall_score)) : null;
              const colors = getWellbeingColor(score);
              return (
                <div key={w.id} className="px-5 py-3 border-t border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                    <span className={`text-xs font-bold ${colors.text}`}>
                      {score ?? '—'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{w.guard_name}</span>
                      {w.flagged_for_review && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 shrink-0">
                          Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{w.site_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {w.stress_score !== null && (
                        <span className="text-[10px] text-gray-500">
                          Stress: <span className="text-gray-400">{w.stress_score}/100</span>
                        </span>
                      )}
                      {w.fatigue_score !== null && (
                        <span className="text-[10px] text-gray-500">
                          Fatigue: <span className="text-gray-400">{w.fatigue_score}/100</span>
                        </span>
                      )}
                      {w.safety_score !== null && (
                        <span className="text-[10px] text-gray-500">
                          Safety: <span className="text-gray-400">{w.safety_score}/100</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-500">{timeSince(w.created_at)}</span>
                  </div>
                </div>
              );
            })
          )
        )}

        {tab === 'inactive' && (
          inactiveGuards.length === 0 ? (
            <div className="px-5 pb-5 text-center text-xs text-gray-500 py-8">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                  <i className="ri-check-line text-sm"></i>
                </div>
              </div>
              All active guards have recent activity.
            </div>
          ) : (
            inactiveGuards.map((g) => (
              <div key={g.id} className="px-5 py-3 border-t border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-500 opacity-50"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-500"></span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {g.first_name} {g.last_name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/10 text-gray-400 shrink-0">
                      Inactive
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last activity: {timeSince(g.last_activity)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                    <i className="ri-phone-line text-xs"></i>
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                    <i className="ri-arrow-up-circle-line text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </GlassCard>
  );
}