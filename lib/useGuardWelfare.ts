'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface LoneWorkerSession {
  id: string;
  guard_id: string;
  company_id: string;
  site_id: string | null;
  shift_id: string | null;
  check_in_interval_minutes: number;
  session_start: string;
  session_end: string | null;
  status: string | null;
  last_check_in_at: string | null;
  next_check_in_due_at: string | null;
  total_check_ins: number | null;
  missed_check_ins: number | null;
  alarm_triggered_at: string | null;
  alarm_acknowledged_at: string | null;
  alarm_acknowledged_by: string | null;
  escalation_level: number | null;
  last_lat: number | null;
  last_lng: number | null;
  notes: string | null;
  created_at: string;
  guard_name?: string | null;
  site_name?: string | null;
}

export interface WellbeingCheckin {
  id: string;
  guard_id: string;
  company_id: string;
  shift_id: string | null;
  site_id: string | null;
  stress_score: number | null;
  fatigue_score: number | null;
  safety_score: number | null;
  overall_score: number | null;
  concerns: string | null;
  flagged_for_review: boolean | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  manager_notes: string | null;
  created_at: string;
  guard_name?: string | null;
  site_name?: string | null;
}

export interface WelfareGuard {
  id: string;
  company_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  last_clock_in?: string | null;
  last_activity?: string | null;
  on_duty: boolean;
  no_recent_activity?: boolean;
  last_lone_worker_session?: string | null;
  missed_check_ins?: number;
  escalation_level?: number;
  alarm_active?: boolean;
  wellbeing_score?: number | null;
}

export interface WelfareIncident {
  id: string;
  guard_id: string | null;
  site_id: string | null;
  incident_type: string | null;
  severity: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
  guard_name?: string | null;
  site_name?: string | null;
}

export interface WelfareNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  severity: string | null;
  read_at: string | null;
  created_at: string;
  related_id: string | null;
  related_type: string | null;
}

export interface GuardWelfareData {
  sessions: LoneWorkerSession[];
  wellbeingCheckins: WellbeingCheckin[];
  guards: WelfareGuard[];
  welfareIncidents: WelfareIncident[];
  notifications: WelfareNotification[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

export function useGuardWelfare(): GuardWelfareData {
  const { companyId } = useAuth();
  const [sessions, setSessions] = useState<LoneWorkerSession[]>([]);
  const [wellbeingCheckins, setWellbeingCheckins] = useState<WellbeingCheckin[]>([]);
  const [guards, setGuards] = useState<WelfareGuard[]>([]);
  const [welfareIncidents, setWelfareIncidents] = useState<WelfareIncident[]>([]);
  const [notifications, setNotifications] = useState<WelfareNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const now = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartIso = todayStart.toISOString();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    try {
      const [
        sessionsRes,
        wellbeingRes,
        guardsRes,
        incidentsRes,
        notificationsRes,
        attendanceRes,
        activeShiftsRes,
      ] = await Promise.all([
        supabase
          .from('lone_worker_sessions')
          .select(`
            *,
            guards!lone_worker_sessions_guard_id_fkey(first_name, last_name),
            sites!lone_worker_sessions_site_id_fkey(site_name)
          `)
          .eq('company_id', companyId)
          .gte('session_start', todayStartIso)
          .order('session_start', { ascending: false })
          .limit(100),
        supabase
          .from('guard_wellbeing_checkins')
          .select(`
            *,
            guards(first_name, last_name),
            sites(site_name)
          `)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('guards')
          .select('id, company_id, first_name, last_name, email, phone, status')
          .eq('company_id', companyId)
          .eq('status', 'active'),
        supabase
          .from('incidents')
          .select(`
            id, guard_id, site_id, incident_type, severity, description, status, created_at,
            guards(first_name, last_name),
            sites(site_name)
          `)
          .eq('company_id', companyId)
          .in('status', ['open', 'reviewing'])
          .or('incident_type.ilike.%panic%,incident_type.ilike.%sos%,incident_type.ilike.%welfare%,incident_type.ilike.%medical%,incident_type.ilike.%assault%,severity.eq.critical')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('notifications')
          .select('id, type, title, body, severity, read_at, created_at, related_id, related_type')
          .eq('company_id', companyId)
          .or('type.ilike.%panic%,type.ilike.%sos%,type.ilike.%welfare%,type.ilike.%lone_worker%,type.ilike.%check_call%,severity.eq.critical')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('attendance_logs')
          .select('id, guard_id, clock_in, clock_out, shift_id')
          .eq('company_id', companyId)
          .gte('clock_in', todayStartIso)
          .order('clock_in', { ascending: false })
          .limit(200),
        supabase
          .from('shifts')
          .select('id, guard_id, site_id, start_time, end_time, status')
          .eq('company_id', companyId)
          .lte('start_time', now)
          .gte('end_time', now)
          .not('guard_id', 'is', null)
          .order('start_time', { ascending: false })
          .limit(200),
      ]);

      if (sessionsRes.error) throw new Error(sessionsRes.error.message);
      if (wellbeingRes.error) throw new Error(wellbeingRes.error.message);
      if (guardsRes.error) throw new Error(guardsRes.error.message);
      if (incidentsRes.error) throw new Error(incidentsRes.error.message);
      if (notificationsRes.error) throw new Error(notificationsRes.error.message);
      if (attendanceRes.error) throw new Error(attendanceRes.error.message);
      if (activeShiftsRes.error) throw new Error(activeShiftsRes.error.message);

      const processedSessions: LoneWorkerSession[] = (sessionsRes.data || []).map((s: any) => ({
        ...s,
        guard_name: s.guards?.first_name && s.guards?.last_name
          ? `${s.guards.first_name} ${s.guards.last_name}`
          : s.guards?.first_name || 'Unknown',
        site_name: s.sites?.site_name || 'Unknown',
      }));

      const processedWellbeing: WellbeingCheckin[] = (wellbeingRes.data || []).map((w: any) => ({
        ...w,
        guard_name: w.guards?.first_name && w.guards?.last_name
          ? `${w.guards.first_name} ${w.guards.last_name}`
          : w.guards?.first_name || 'Unknown',
        site_name: w.sites?.site_name || 'Unknown',
      }));

      const processedIncidents: WelfareIncident[] = (incidentsRes.data || []).map((i: any) => ({
        id: i.id,
        guard_id: i.guard_id,
        site_id: i.site_id,
        incident_type: i.incident_type,
        severity: i.severity,
        description: i.description,
        status: i.status,
        created_at: i.created_at,
        guard_name: i.guards?.first_name && i.guards?.last_name
          ? `${i.guards.first_name} ${i.guards.last_name}`
          : i.guards?.first_name || 'Unknown',
        site_name: i.sites?.site_name || 'Unknown',
      }));

      const processedNotifications: WelfareNotification[] = (notificationsRes.data || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        severity: n.severity,
        read_at: n.read_at,
        created_at: n.created_at,
        related_id: n.related_id,
        related_type: n.related_type,
      }));

      const guardList = (guardsRes.data || []) as any[];
      const attendanceList = (attendanceRes.data || []) as any[];
      const activeShifts = (activeShiftsRes.data || []) as any[];
      const sessionList = processedSessions;

      const processedGuards: WelfareGuard[] = guardList.map((g) => {
        const guardAttendances = attendanceList.filter((a) => a.guard_id === g.id);
        const lastClockIn = guardAttendances.length > 0 ? guardAttendances[0].clock_in : null;
        const lastClockOut = guardAttendances.length > 0 ? guardAttendances[0].clock_out : null;

        const isOnShift = activeShifts.some((s) => s.guard_id === g.id);
        const guardSessions = sessionList.filter((s) => s.guard_id === g.id);
        const lastSession = guardSessions.length > 0 ? guardSessions[0] : null;
        const missed = guardSessions.reduce((sum: number, s: LoneWorkerSession) => sum + (s.missed_check_ins || 0), 0);
        const maxEscalation = guardSessions.reduce((max: number, s: LoneWorkerSession) => Math.max(max, s.escalation_level || 0), 0);
        const activeAlarm = guardSessions.some((s) => s.alarm_triggered_at && !s.alarm_acknowledged_at);

        const lastWellbeing = processedWellbeing.find((w) => w.guard_id === g.id);
        const overallScore = lastWellbeing?.overall_score ? Math.round(Number(lastWellbeing.overall_score)) : null;

        const lastActivity = lastClockIn || lastSession?.session_start || null;
        const lastActivityTime = lastActivity ? new Date(lastActivity).getTime() : 0;
        const noRecentActivity = lastActivityTime > 0 && lastActivityTime < new Date(fourHoursAgo).getTime();

        return {
          id: g.id,
          company_id: g.company_id,
          first_name: g.first_name,
          last_name: g.last_name,
          email: g.email,
          phone: g.phone,
          status: g.status,
          last_clock_in: lastClockIn,
          last_activity: lastActivity,
          on_duty: isOnShift,
          last_lone_worker_session: lastSession?.session_start || null,
          missed_check_ins: missed,
          escalation_level: maxEscalation,
          alarm_active: activeAlarm,
          wellbeing_score: overallScore,
          no_recent_activity: noRecentActivity,
        };
      });

      setSessions(processedSessions);
      setWellbeingCheckins(processedWellbeing);
      setGuards(processedGuards);
      setWelfareIncidents(processedIncidents);
      setNotifications(processedNotifications);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load guard welfare data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!companyId) return;
    const channels: ReturnType<typeof supabase.channel>[] = [];

    channels.push(
      supabase
        .channel('welfare-sessions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lone_worker_sessions', filter: `company_id=eq.${companyId}` }, () => fetchData())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('welfare-wellbeing')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'guard_wellbeing_checkins', filter: `company_id=eq.${companyId}` }, () => fetchData())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('welfare-incidents')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `company_id=eq.${companyId}` }, () => fetchData())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('welfare-notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `company_id=eq.${companyId}` }, () => fetchData())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('welfare-attendance')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs', filter: `company_id=eq.${companyId}` }, () => fetchData())
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [companyId, fetchData]);

  return {
    sessions,
    wellbeingCheckins,
    guards,
    welfareIncidents,
    notifications,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}