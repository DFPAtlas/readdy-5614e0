'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { GuardOnShift, MissingGuard, StaffingAlert } from '@/lib/dashboardFetch';
import type { Notification } from '@/lib/useNotifications';
import type { LoneWorkerAlert } from '@/lib/useCommandCentreExtended';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';

interface GuardWelfarePanelProps {
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  staffingAlerts: StaffingAlert[];
  notifications: Notification[];
}

interface WelfareCheckinSummary {
  guard_id: string;
  guard_name: string;
  mood: string;
  overall_score: number | null;
  flagged: boolean;
  created_at: string;
  site_name: string;
}

interface SOSEvent {
  id: string;
  guard_name: string;
  site_name: string;
  occurred_at: string;
  status: string;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getMoodInfo(score: number | null): { label: string; emoji: string; color: string } {
  if (score === null) return { label: 'Unknown', emoji: 'ri-question-line', color: 'text-gray-400' };
  if (score >= 8) return { label: 'Good', emoji: 'ri-emotion-happy-line', color: 'text-emerald-400' };
  if (score >= 5) return { label: 'Tired', emoji: 'ri-emotion-sad-line', color: 'text-amber-400' };
  if (score >= 3) return { label: 'Stressed', emoji: 'ri-emotion-unhappy-line', color: 'text-orange-400' };
  return { label: 'Needs Help', emoji: 'ri-emotion-line', color: 'text-red-400' };
}

export default function GuardWelfarePanel({ guardsOnShift, missingGuards, staffingAlerts, notifications }: GuardWelfarePanelProps) {
  const { companyId } = useAuth();
  const [checkins, setCheckins] = useState<WelfareCheckinSummary[]>([]);
  const [sosEvents, setSosEvents] = useState<SOSEvent[]>([]);
  const [lwStats, setLwStats] = useState({ active: 0, overdue: 0, alarm: 0 });

  useEffect(() => {
    if (!companyId) return;

    supabase
      .from('guard_wellbeing_checkins')
      .select(`
        id, guard_id, overall_score, flagged_for_review, created_at, site_id,
        guards!guard_wellbeing_checkins_guard_id_fkey(first_name, last_name),
        sites(site_name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (!data) return;
        const summaries: WelfareCheckinSummary[] = (data as any[]).map((c) => ({
          guard_id: c.guard_id,
          guard_name: c.guards ? `${c.guards.first_name || ''} ${c.guards.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
          mood: getMoodInfo(c.overall_score ? Math.round(Number(c.overall_score)) : null).label,
          overall_score: c.overall_score ? Math.round(Number(c.overall_score)) : null,
          flagged: !!c.flagged_for_review,
          created_at: c.created_at,
          site_name: c.sites?.site_name || 'Unknown',
        }));
        setCheckins(summaries);
      });

    supabase
      .from('lone_worker_sessions')
      .select('id, status, next_check_in_due_at, alarm_triggered_at, alarm_acknowledged_at, missed_check_ins')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .then(({ data }) => {
        if (!data) return;
        const now = new Date();
        let active = 0, overdue = 0, alarm = 0;
        (data as any[]).forEach((s) => {
          active++;
          if (s.alarm_triggered_at && !s.alarm_acknowledged_at) alarm++;
          else if (s.next_check_in_due_at && new Date(s.next_check_in_due_at) < now) overdue++;
        });
        setLwStats({ active, overdue, alarm });
      });

    supabase
      .from('incidents')
      .select(`
        id, guard_id, site_id, occurred_at, status,
        guards!incidents_guard_id_fkey(first_name, last_name),
        sites(site_name)
      `)
      .eq('company_id', companyId)
      .or('incident_type.ilike.%sos%,incident_type.ilike.%panic%')
      .in('status', ['open', 'reviewing'])
      .order('occurred_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!data) return;
        const events: SOSEvent[] = (data as any[]).map((i) => ({
          id: i.id,
          guard_name: i.guards ? `${i.guards.first_name || ''} ${i.guards.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
          site_name: i.sites?.site_name || 'Unknown',
          occurred_at: i.occurred_at || i.created_at,
          status: i.status,
        }));
        setSosEvents(events);
      });
  }, [companyId]);

  const lateGuards = guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late');
  const panicAlerts = notifications.filter(n =>
    n.severity === 'critical' &&
    (n.title.toLowerCase().includes('panic') || n.title.toLowerCase().includes('sos') || n.title.toLowerCase().includes('emergency'))
  );

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center text-pink-400">
          <i className="ri-heart-pulse-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Guard Welfare</h3>
        <Link href="/dashboard/guard-welfare" className="ml-auto text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">Full dashboard</Link>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Lone Worker Status</h4>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-400">{lwStats.active}</p>
            <p className="text-[10px] text-gray-500">Active</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 text-center">
            <p className={`text-lg font-bold ${lwStats.overdue > 0 ? 'text-amber-400' : 'text-gray-500'}`}>{lwStats.overdue}</p>
            <p className="text-[10px] text-gray-500">Overdue</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2 text-center">
            <p className={`text-lg font-bold ${lwStats.alarm > 0 ? 'text-red-400' : 'text-gray-500'}`}>{lwStats.alarm}</p>
            <p className="text-[10px] text-gray-500">Alarm</p>
          </div>
        </div>
        <Link href="/dashboard/lone-worker" className="block p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center text-purple-400">
              <i className="ri-radar-line text-sm"></i>
            </div>
            <span className="text-xs text-purple-300">Lone Worker Monitoring</span>
            <div className="w-3 h-3 flex items-center justify-center ml-auto text-purple-400">
              <i className="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </Link>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Late / Missing Guards</h4>
        {lateGuards.length === 0 && missingGuards.length === 0 ? (
          <div className="text-center py-3 text-xs text-gray-500">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            All guards accounted for.
          </div>
        ) : (
          <div className="space-y-2">
            {lateGuards.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{g.name}</p>
                  <p className="text-xs text-gray-500">{g.site_name} — +{g.late_minutes}m late</p>
                </div>
              </div>
            ))}
            {missingGuards.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{g.name}</p>
                  <p className="text-xs text-gray-500">{g.site_name} — {g.reason === 'no_clock_in' ? 'No clock-in' : 'Unassigned'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">SOS Events {sosEvents.length > 0 && <span className="text-red-400">({sosEvents.length})</span>}</h4>
        {sosEvents.length === 0 ? (
          <div className="text-center py-3 text-xs text-gray-500">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            No open SOS events.
          </div>
        ) : (
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {sosEvents.map(e => (
              <Link key={e.id} href={`/incidents/detail?id=${e.id}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center text-red-400 shrink-0">
                  <i className="ri-alarm-warning-line text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{e.guard_name}</p>
                  <p className="text-xs text-gray-500">{e.site_name} — {timeAgo(e.occurred_at)}</p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium shrink-0">OPEN</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Panic Alerts</h4>
        {panicAlerts.length === 0 ? (
          <div className="text-center py-3 text-xs text-gray-500">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            No unread panic alerts.
          </div>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {panicAlerts.map(n => (
              <div key={n.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="w-5 h-5 flex items-center justify-center text-red-400 shrink-0">
                  <i className="ri-alarm-warning-line text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 truncate">{n.body}</p>
                </div>
                <span className="text-[10px] text-red-400 font-medium shrink-0">{timeAgo(n.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recent Wellbeing Check-ins</h4>
        {checkins.length === 0 ? (
          <div className="text-center py-3 text-xs text-gray-500">
            <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                <i className="ri-emotion-line text-sm"></i>
              </div>
            </div>
            No wellbeing check-ins recorded.
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {checkins.slice(0, 8).map((c, i) => {
              const moodInfo = getMoodInfo(c.overall_score);
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-7 h-7 rounded-lg ${c.overall_score && c.overall_score >= 7 ? 'bg-emerald-500/10' : c.overall_score && c.overall_score >= 4 ? 'bg-amber-500/10' : 'bg-red-500/10'} flex items-center justify-center shrink-0`}>
                    <i className={`${moodInfo.emoji} ${moodInfo.color} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-white truncate">{c.guard_name}</p>
                      {c.flagged && (
                        <span className="px-1 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-bold shrink-0">!</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{moodInfo.label} — {timeAgo(c.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Staffing Alerts</h4>
        {staffingAlerts.length === 0 ? (
          <div className="text-center py-3 text-xs text-gray-500">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            All shifts staffed.
          </div>
        ) : (
          <div className="space-y-2">
            {staffingAlerts.slice(0, 4).map(s => (
              <Link key={`${s.site_name}-${s.shift_time}`} href="/rotas" className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-all cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center text-blue-400">
                  <i className="ri-team-line text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.site_name}</p>
                  <p className="text-xs text-gray-500">{s.guard_needed} guard needed — {new Date(s.shift_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.severity === 'high' ? 'bg-red-500/10 text-red-400' : s.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {s.severity}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}