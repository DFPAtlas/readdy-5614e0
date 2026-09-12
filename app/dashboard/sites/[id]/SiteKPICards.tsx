'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteKPIs {
  activeGuards: number;
  totalAssigned: number;
  openIncidents: number;
  patrolCompletion: number;
  obEntriesToday: number;
  reportsThisWeek: number;
  riskScore: number;
  completedPatrols: number;
  missedCheckpoints: number;
}

export interface SiteKPICardsProps {
  siteId: string;
}

function MiniBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${pct}%` }}
      ></div>
    </div>
  );
}

function PatrolMiniBar({ value }: { value: number }) {
  const barColor = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}

export default function SiteKPICards({ siteId }: SiteKPICardsProps) {
  const [kpis, setKpis] = useState<SiteKPIs>({
    activeGuards: 0,
    totalAssigned: 0,
    openIncidents: 0,
    patrolCompletion: 0,
    obEntriesToday: 0,
    reportsThisWeek: 0,
    riskScore: 0,
    completedPatrols: 0,
    missedCheckpoints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

      const settled = await Promise.allSettled([
        supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active').lte('start_time', now.toISOString()).gte('end_time', now.toISOString()),
        supabase.from('guard_site_assignments').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active'),
        supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('site_id', siteId).in('status', ['open', 'in_progress', 'reviewing']),
        supabase.from('patrol_logs').select('checkpoints_total, checkpoints_completed, status').eq('site_id', siteId).gte('start_time', todayStart).lte('start_time', todayEnd),
        supabase.from('occurrence_books').select('id', { count: 'exact', head: true }).eq('site_id', siteId).gte('created_at', todayStart).lte('created_at', todayEnd),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('site_id', siteId).gte('generated_at', weekAgo),
        supabase.from('site_risk_scores').select('score').eq('site_id', siteId).order('generated_at', { ascending: false }).limit(1),
        supabase.from('patrol_logs').select('status, missed_checkpoints').eq('site_id', siteId).order('start_time', { ascending: false }).limit(20),
      ]);

      const [activeShifts, assignedGuards, openIncidents, patrolLogs, obEntries, reports, riskScores, allPatrols] = settled.map((r: any) =>
        r.status === 'fulfilled' ? r.value : { data: [], count: 0 }
      );

      const patrols = patrolLogs.data || [];
      const totalCp = patrols.reduce((s: number, p: any) => s + (p.checkpoints_total || 0), 0);
      const completedCp = patrols.reduce((s: number, p: any) => s + (p.checkpoints_completed || 0), 0);
      const patrolCompletion = totalCp > 0 ? Math.round((completedCp / totalCp) * 100) : 0;

      const allPatrolsData = allPatrols.data || [];
      const completedPatrols = allPatrolsData.filter((p: any) => p.status === 'completed').length;
      const missedCheckpoints = allPatrolsData.reduce((s: number, p: any) => s + (p.missed_checkpoints || 0), 0);

      const riskData = riskScores.data;
      const riskScore = riskData && riskData.length > 0 ? riskData[0].score : 0;

      setKpis({
        activeGuards: activeShifts.count || 0,
        totalAssigned: assignedGuards.count || 0,
        openIncidents: openIncidents.count || 0,
        patrolCompletion,
        obEntriesToday: obEntries.count || 0,
        reportsThisWeek: reports.count || 0,
        riskScore,
        completedPatrols,
        missedCheckpoints,
      });
      setLoading(false);
    }
    load();
  }, [siteId]);

  const cards = [
    {
      label: 'Active Guards',
      value: kpis.activeGuards,
      sub: kpis.totalAssigned > 0 ? `${kpis.activeGuards}/${kpis.totalAssigned} on shift` : `${kpis.activeGuards} on shift`,
      icon: 'ri-shield-user-line',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      barMax: Math.max(kpis.totalAssigned, 1),
      barValue: kpis.activeGuards,
      barColor: 'bg-emerald-500',
    },
    {
      label: 'Open Incidents',
      value: kpis.openIncidents,
      sub: kpis.openIncidents > 0 ? `${kpis.openIncidents} need attention` : 'All clear',
      icon: 'ri-error-warning-line',
      color: kpis.openIncidents > 0 ? 'text-red-400' : 'text-gray-400',
      bg: kpis.openIncidents > 0 ? 'bg-red-500/10' : 'bg-gray-500/10',
      border: kpis.openIncidents > 0 ? 'border-red-500/20' : 'border-gray-500/20',
      barMax: Math.max(kpis.openIncidents, 5),
      barValue: kpis.openIncidents,
      barColor: kpis.openIncidents > 0 ? 'bg-red-500' : 'bg-gray-600',
    },
    {
      label: 'Patrol Completion',
      value: `${kpis.patrolCompletion}%`,
      sub: `${kpis.completedPatrols} completed · ${kpis.missedCheckpoints} missed CP`,
      icon: 'ri-route-line',
      color: kpis.patrolCompletion >= 80 ? 'text-emerald-400' : kpis.patrolCompletion >= 50 ? 'text-amber-400' : 'text-red-400',
      bg: kpis.patrolCompletion >= 80 ? 'bg-emerald-500/10' : kpis.patrolCompletion >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10',
      border: kpis.patrolCompletion >= 80 ? 'border-emerald-500/20' : kpis.patrolCompletion >= 50 ? 'border-amber-500/20' : 'border-red-500/20',
      isPatrolBar: true,
      barColor: kpis.patrolCompletion >= 80 ? 'bg-emerald-500' : kpis.patrolCompletion >= 50 ? 'bg-amber-500' : 'bg-red-500',
    },
    {
      label: 'OB Entries Today',
      value: kpis.obEntriesToday,
      sub: kpis.obEntriesToday > 0 ? `${kpis.obEntriesToday} entries logged` : 'No entries yet',
      icon: 'ri-book-open-line',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      barMax: Math.max(kpis.obEntriesToday, 10),
      barValue: kpis.obEntriesToday,
      barColor: 'bg-blue-500',
    },
    {
      label: 'Reports This Week',
      value: kpis.reportsThisWeek,
      sub: kpis.reportsThisWeek > 0 ? `${kpis.reportsThisWeek} generated` : 'None this week',
      icon: 'ri-file-chart-line',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      barMax: Math.max(kpis.reportsThisWeek, 7),
      barValue: kpis.reportsThisWeek,
      barColor: 'bg-purple-500',
    },
    {
      label: 'Risk Score',
      value: `${kpis.riskScore}/100`,
      sub: kpis.riskScore >= 70 ? 'High risk' : kpis.riskScore >= 40 ? 'Medium risk' : 'Low risk',
      icon: 'ri-speed-mini-line',
      color: kpis.riskScore >= 70 ? 'text-red-400' : kpis.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400',
      bg: kpis.riskScore >= 70 ? 'bg-red-500/10' : kpis.riskScore >= 40 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      border: kpis.riskScore >= 70 ? 'border-red-500/20' : kpis.riskScore >= 40 ? 'border-amber-500/20' : 'border-emerald-500/20',
      barMax: 100,
      barValue: kpis.riskScore,
      barColor: kpis.riskScore >= 70 ? 'bg-red-500' : kpis.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {loading
        ? cards.map((_, i) => (
            <div key={i} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-white/5 rounded w-20 mb-3"></div>
              <div className="h-8 bg-white/5 rounded w-12 mb-2"></div>
              <div className="h-2 bg-white/5 rounded w-16 mb-3"></div>
              <div className="h-1 bg-white/5 rounded w-full"></div>
            </div>
          ))
        : cards.map((card) => (
            <div key={card.label} className={`bg-[#0f172a]/70 backdrop-blur-sm border ${card.border} rounded-xl p-5 flex flex-col`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <i className={`${card.icon} ${card.color} text-sm`}></i>
                </div>
              </div>
              <div className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</div>
              <div className="text-xs text-gray-400 mb-3">{card.label}</div>
              {card.isPatrolBar ? (
                <PatrolMiniBar value={kpis.patrolCompletion} />
              ) : card.barMax !== undefined && card.barValue !== undefined ? (
                <MiniBar value={card.barValue} max={card.barMax} colorClass={card.barColor} />
              ) : null}
              <div className="text-[10px] text-gray-500 mt-1.5">{card.sub}</div>
            </div>
          ))}
    </div>
  );
}