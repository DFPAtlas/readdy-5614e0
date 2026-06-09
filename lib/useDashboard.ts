'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { fetchDashboard, type DashboardKPIs, type DashboardSite, type RecentIncident, type LiveOccurrence, type WeekShift, type AIAlert, type GuardOnShift, type MissingGuard, type PatrolSummary, type StaffingAlert } from '@/lib/dashboardFetch';

interface DashboardData {
  kpis: DashboardKPIs;
  sites: DashboardSite[];
  recentIncidents: RecentIncident[];
  liveOccurrences: LiveOccurrence[];
  weekShifts: WeekShift[];
  aiAlerts: AIAlert[];
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  patrolSummary: PatrolSummary[];
  staffingAlerts: StaffingAlert[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

const defaultKPIs: DashboardKPIs = {
  activeGuards: 0,
  activeGuardsYesterday: 0,
  openIncidents: 0,
  highCriticalIncidents: 0,
  patrolCompletion: 0,
  patrolCompletionPrev: 0,
  openShifts: 0,
  nextOpenShift: null,
  lateGuards: 0,
  missedPatrols: 0,
  staffingShortageSites: 0,
  avgRiskScore: 0,
};

export function useDashboard(): DashboardData {
  const { companyId } = useAuth();
  const [kpis, setKpis] = useState<DashboardKPIs>(defaultKPIs);
  const [sites, setSites] = useState<DashboardSite[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<RecentIncident[]>([]);
  const [liveOccurrences, setLiveOccurrences] = useState<LiveOccurrence[]>([]);
  const [weekShifts, setWeekShifts] = useState<WeekShift[]>([]);
  const [aiAlerts, setAiAlerts] = useState<AIAlert[]>([]);
  const [guardsOnShift, setGuardsOnShift] = useState<GuardOnShift[]>([]);
  const [missingGuards, setMissingGuards] = useState<MissingGuard[]>([]);
  const [patrolSummary, setPatrolSummary] = useState<PatrolSummary[]>([]);
  const [staffingAlerts, setStaffingAlerts] = useState<StaffingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const result = await fetchDashboard(companyId);
      setKpis(result.kpis);
      setSites(result.sites);
      setRecentIncidents(result.recentIncidents);
      setLiveOccurrences(result.liveOccurrences);
      setWeekShifts(result.weekShifts);
      setAiAlerts(result.aiAlerts);
      setGuardsOnShift(result.guardsOnShift);
      setMissingGuards(result.missingGuards);
      setPatrolSummary(result.patrolSummary);
      setStaffingAlerts(result.staffingAlerts);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  useEffect(() => {
    if (!companyId) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    channels.push(
      supabase
        .channel('dashboard-incidents')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `company_id=eq.${companyId}` }, () => {
          fetchData();
        })
        .subscribe()
    );

    channels.push(
      supabase
        .channel('dashboard-ob')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'occurrence_books', filter: `company_id=eq.${companyId}` }, () => {
          fetchData();
        })
        .subscribe()
    );

    channels.push(
      supabase
        .channel('dashboard-shifts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts', filter: `company_id=eq.${companyId}` }, () => {
          fetchData();
        })
        .subscribe()
    );

    channels.push(
      supabase
        .channel('dashboard-patrol')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patrol_logs', filter: `company_id=eq.${companyId}` }, () => {
          fetchData();
        })
        .subscribe()
    );

    channels.push(
      supabase
        .channel('dashboard-attendance')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs', filter: `company_id=eq.${companyId}` }, () => {
          fetchData();
        })
        .subscribe()
    );

    channels.push(
      supabase
        .channel('dashboard-ai')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_activity_logs', filter: `company_id=eq.${companyId}` }, () => {
          fetchData();
        })
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [companyId, fetchData]);

  return {
    kpis,
    sites,
    recentIncidents,
    liveOccurrences,
    weekShifts,
    aiAlerts,
    guardsOnShift,
    missingGuards,
    patrolSummary,
    staffingAlerts,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}

export type { DashboardKPIs, DashboardSite, RecentIncident, LiveOccurrence, WeekShift, AIAlert, GuardOnShift, MissingGuard, PatrolSummary, StaffingAlert } from '@/lib/dashboardFetch';