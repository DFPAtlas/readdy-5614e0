'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthorizedClientSite, type AuthorizedSite } from '@/lib/useAuthorizedClientSite';

export interface DashboardShift {
  id: string;
  site_id: string;
  guard_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
  shift_type: string | null;
  notes: string | null;
  guard_name: string;
  guard_phone: string | null;
}

export interface ShiftPattern {
  id: string;
  site_id: string;
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
  day_name?: string;
}

export interface DashboardCheckpoint {
  id: string;
  name: string;
  checkpoint_code: string;
  is_active: boolean;
  allowed_radius_meters: number;
  lat: number | null;
  lng: number | null;
  description: string | null;
}

export interface DashboardPatrolLog {
  id: string;
  guard_id: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  checkpoints_total: number;
  checkpoints_completed: number;
  missed_checkpoints: number;
  gps_verified_count: number;
  out_of_radius_count: number;
  needs_review_count: number;
  duration_seconds: number | null;
  guard_name: string;
}

export interface DashboardPatrolScan {
  id: string;
  checkpoint_id: string;
  guard_id: string | null;
  scanned_at: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_accuracy: number | null;
  distance_from_checkpoint: number | null;
  scan_status: string | null;
  gps_verified: boolean;
  notes: string | null;
  checkpoint_name: string;
  checkpoint_code: string;
  guard_name: string;
}

export interface DashboardIncident {
  id: string;
  incident_type: string;
  severity: string;
  description: string | null;
  ai_rewritten_report: string | null;
  status: string;
  created_at: string;
  occurred_at: string;
  incident_number: string | null;
}

export interface DashboardOBEntry {
  id: string;
  entry_type: string;
  entry: string;
  title: string | null;
  created_at: string;
  occurred_at: string;
  guard_name: string;
}

export interface DashboardReport {
  id: string;
  title: string;
  file_url: string | null;
  status: string;
  report_type: string;
  ai_summary: string | null;
  generated_at: string;
  period_start: string | null;
  period_end: string | null;
}

export interface DashboardClocking {
  shift_id: string;
  guard_id: string;
  guard_name: string;
  start_time: string;
  end_time: string;
  shift_status: string;
  clocked_in_at: string | null;
  clocked_out_at: string | null;
  is_clocked_in: boolean;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
}

export interface ClientSiteDashboardData {
  site: AuthorizedSite | null;
  siteIds: string[];
  clientId: string | null;
  companyId: string | null;
  loading: boolean;
  accessDenied: boolean;
  notFound: boolean;
  error: string | null;

  currentShifts: DashboardShift[];
  todayShifts: DashboardShift[];
  upcomingShifts: DashboardShift[];
  shiftPatterns: ShiftPattern[];

  patrolCheckpoints: DashboardCheckpoint[];
  patrolLogs: DashboardPatrolLog[];
  patrolScans: DashboardPatrolScan[];
  patrolCompletionPct: number;
  activeCheckpointsCount: number;

  incidents: DashboardIncident[];
  openIncidents: DashboardIncident[];

  obEntries: DashboardOBEntry[];

  reports: DashboardReport[];

  clocking: DashboardClocking[];

  isCountyHall: boolean;

  refresh: () => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function useClientSiteDashboard(siteId: string): ClientSiteDashboardData {
  const auth = useAuthorizedClientSite(siteId);

  const [currentShifts, setCurrentShifts] = useState<DashboardShift[]>([]);
  const [todayShifts, setTodayShifts] = useState<DashboardShift[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<DashboardShift[]>([]);
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([]);

  const [patrolCheckpoints, setPatrolCheckpoints] = useState<DashboardCheckpoint[]>([]);
  const [patrolLogs, setPatrolLogs] = useState<DashboardPatrolLog[]>([]);
  const [patrolScans, setPatrolScans] = useState<DashboardPatrolScan[]>([]);

  const [incidents, setIncidents] = useState<DashboardIncident[]>([]);
  const [obEntries, setObEntries] = useState<DashboardOBEntry[]>([]);
  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [clocking, setClocking] = useState<DashboardClocking[]>([]);

  const [dataLoading, setDataLoading] = useState(true);

  const isCountyHall = auth.site?.site_name?.toLowerCase().includes('county hall') ?? false;

  const fetchDashboardData = useCallback(async () => {
    if (!auth.site || !auth.companyId || !auth.clientId) {
      setDataLoading(false);
      return;
    }

    const now = new Date();
    const nowISO = now.toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const next7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const [
        shiftsResult,
        patternsResult,
        checkpointsResult,
        patrolLogsResult,
        patrolScansResult,
        incidentsResult,
        obResult,
        reportsResult,
      ] = await Promise.all([
        supabase
          .from('shifts')
          .select('id, site_id, guard_id, start_time, end_time, status, shift_type, notes')
          .eq('site_id', siteId)
          .eq('company_id', auth.companyId)
          .or(`and(start_time.lte.${nowISO},end_time.gte.${nowISO}),and(start_time.gte.${todayStart},start_time.lt.${next7Days})`)
          .order('start_time'),

        supabase
          .from('site_shift_patterns')
          .select('id, site_id, day_of_week, shift_type, start_time, end_time, guards_required')
          .eq('site_id', siteId)
          .order('day_of_week')
          .order('start_time'),

        supabase
          .from('patrol_checkpoints')
          .select('id, name, checkpoint_code, is_active, allowed_radius_meters, lat, lng, description')
          .eq('site_id', siteId)
          .eq('company_id', auth.companyId)
          .order('name'),

        supabase
          .from('patrol_logs')
          .select('id, guard_id, start_time, end_time, status, checkpoints_total, checkpoints_completed, missed_checkpoints, gps_verified_count, out_of_radius_count, needs_review_count, duration_seconds')
          .eq('site_id', siteId)
          .eq('company_id', auth.companyId)
          .gte('start_time', todayStart)
          .order('start_time', { ascending: false })
          .limit(20),

        supabase
          .from('patrol_scans')
          .select('id, checkpoint_id, guard_id, scanned_at, gps_latitude, gps_longitude, gps_accuracy, distance_from_checkpoint, scan_status, gps_verified, notes')
          .eq('site_id', siteId)
          .eq('company_id', auth.companyId)
          .gte('scanned_at', todayStart)
          .order('scanned_at', { ascending: false })
          .limit(50),

        supabase
          .from('incidents')
          .select('id, incident_type, severity, description, ai_rewritten_report, status, created_at, occurred_at, incident_number')
          .eq('site_id', siteId)
          .eq('client_visible', true)
          .gte('created_at', ninetyDaysAgo)
          .order('created_at', { ascending: false }),

        supabase
          .from('occurrence_books')
          .select('id, entry_type, entry, title, created_at, occurred_at, guard_id, shift_id')
          .eq('site_id', siteId)
          .eq('client_visible', true)
          .order('occurred_at', { ascending: false })
          .limit(30),

        supabase
          .from('reports')
          .select('id, title, file_url, status, report_type, ai_summary, generated_at, period_start, period_end')
          .eq('site_id', siteId)
          .in('report_type', ['weekly_site', 'incident', 'patrol_summary', 'compliance'])
          .eq('client_visible', true)
          .order('generated_at', { ascending: false }),
      ]);

      const allShifts = (shiftsResult.data || []) as any[];

      const guardIdsFromShifts = [...new Set(allShifts.map((s: any) => s.guard_id).filter(Boolean))];
      const guardIdsFromPatrolLogs = [...new Set((patrolLogsResult.data || []).map((p: any) => p.guard_id).filter(Boolean))];
      const guardIdsFromScans = [...new Set((patrolScansResult.data || []).map((s: any) => s.guard_id).filter(Boolean))];
      const guardIdsFromOB = [...new Set((obResult.data || []).map((o: any) => o.guard_id).filter(Boolean))];
      const allGuardIds = [...new Set([...guardIdsFromShifts, ...guardIdsFromPatrolLogs, ...guardIdsFromScans, ...guardIdsFromOB])];

      let guardsMap: Record<string, { first_name: string; last_name: string; phone: string | null }> = {};
      if (allGuardIds.length > 0) {
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name, phone')
          .in('id', allGuardIds);
        (guardsData || []).forEach((g: any) => {
          guardsMap[g.id] = { first_name: g.first_name, last_name: g.last_name, phone: g.phone };
        });
      }

      const getGuardName = (guardId: string | null) => {
        if (!guardId || !guardsMap[guardId]) return 'Officer';
        const g = guardsMap[guardId];
        return `${g.first_name} ${g.last_name}`.trim() || 'Officer';
      };
      const getGuardPhone = (guardId: string | null) => guardsMap[guardId]?.phone || null;

      // Shifts
      const nowTime = now.getTime();
      const nowEnd = new Date(now).toISOString();
      const todayStartTime = new Date(todayStart).getTime();
      const todayEndTime = new Date(todayEnd).getTime();
      const next7DaysTime = new Date(next7Days).getTime();

      const current = allShifts.filter((s: any) => {
        const start = new Date(s.start_time).getTime();
        const end = new Date(s.end_time).getTime();
        return start <= nowTime && end >= nowTime;
      });

      const today = allShifts.filter((s: any) => {
        const start = new Date(s.start_time).getTime();
        return start >= todayStartTime && start < todayEndTime;
      });

      const upcoming = allShifts.filter((s: any) => {
        const start = new Date(s.start_time).getTime();
        return start >= nowTime && start < next7DaysTime;
      });

      const mapShift = (s: any): DashboardShift => ({
        id: s.id,
        site_id: s.site_id,
        guard_id: s.guard_id,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status || 'scheduled',
        shift_type: s.shift_type,
        notes: s.notes,
        guard_name: getGuardName(s.guard_id),
        guard_phone: getGuardPhone(s.guard_id),
      });

      setCurrentShifts(current.map(mapShift));
      setTodayShifts(today.map(mapShift));
      setUpcomingShifts(upcoming.map(mapShift));

      // Shift patterns
      setShiftPatterns((patternsResult.data || []).map((p: any) => ({
        ...p,
        day_name: DAY_NAMES[p.day_of_week] || 'Unknown',
      })));

      // Patrol checkpoints
      const checkpoints = (checkpointsResult.data || []) as DashboardCheckpoint[];
      setPatrolCheckpoints(checkpoints);

      const activeCheckpoints = checkpoints.filter((c) => c.is_active);
      const activeCheckpointIds = activeCheckpoints.map((c) => c.id);

      // Patrol logs
      const logs = (patrolLogsResult.data || []).map((p: any): DashboardPatrolLog => ({
        id: p.id,
        guard_id: p.guard_id,
        start_time: p.start_time,
        end_time: p.end_time,
        status: p.status || 'in_progress',
        checkpoints_total: p.checkpoints_total || 0,
        checkpoints_completed: p.checkpoints_completed || 0,
        missed_checkpoints: p.missed_checkpoints || 0,
        gps_verified_count: p.gps_verified_count || 0,
        out_of_radius_count: p.out_of_radius_count || 0,
        needs_review_count: p.needs_review_count || 0,
        duration_seconds: p.duration_seconds,
        guard_name: getGuardName(p.guard_id),
      }));
      setPatrolLogs(logs);

      // Patrol scans
      const scans = (patrolScansResult.data || []).map((s: any): DashboardPatrolScan => {
        const cp = checkpoints.find((c) => c.id === s.checkpoint_id);
        return {
          id: s.id,
          checkpoint_id: s.checkpoint_id,
          guard_id: s.guard_id,
          scanned_at: s.scanned_at,
          gps_latitude: s.gps_latitude,
          gps_longitude: s.gps_longitude,
          gps_accuracy: s.gps_accuracy,
          distance_from_checkpoint: s.distance_from_checkpoint,
          scan_status: s.scan_status,
          gps_verified: s.gps_verified || false,
          notes: s.notes,
          checkpoint_name: cp?.name || 'Unknown checkpoint',
          checkpoint_code: cp?.checkpoint_code || '',
          guard_name: getGuardName(s.guard_id),
        };
      });
      setPatrolScans(scans);

      // Patrol completion pct
      const totalCompleted = logs.reduce((sum: number, l: any) => sum + (l.checkpoints_completed || 0), 0);
      const totalExpected = logs.reduce((sum: number, l: any) => sum + (l.checkpoints_total || 0), 0);
      const patrolCompletionPct = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

      // Incidents
      setIncidents((incidentsResult.data || []) as DashboardIncident[]);

      // OB entries with guard names
      setObEntries((obResult.data || []).map((o: any): DashboardOBEntry => ({
        id: o.id,
        entry_type: o.entry_type,
        entry: o.entry,
        title: o.title,
        created_at: o.created_at,
        occurred_at: o.occurred_at,
        guard_name: getGuardName(o.guard_id),
      })));

      // Reports
      setReports(((reportsResult.data || []) as any[]).filter((r: any) => r.status === 'sent'));

      // Clocking - get attendance_logs for current shifts
      const currentShiftIds = current.map((s: any) => s.id);
      if (currentShiftIds.length > 0) {
        const { data: attData } = await supabase
          .from('attendance_logs')
          .select('id, shift_id, guard_id, clock_in, clock_out, clock_in_lat, clock_in_lng')
          .in('shift_id', currentShiftIds)
          .order('clock_in', { ascending: false });

        setClocking(current.map((shift: any): DashboardClocking => {
          const att = (attData || []).find((a: any) => a.shift_id === shift.id);
          return {
            shift_id: shift.id,
            guard_id: shift.guard_id,
            guard_name: getGuardName(shift.guard_id),
            start_time: shift.start_time,
            end_time: shift.end_time,
            shift_status: shift.status || 'scheduled',
            clocked_in_at: att?.clock_in || null,
            clocked_out_at: att?.clock_out || null,
            is_clocked_in: !!att && !att.clock_out,
            clock_in_lat: att?.clock_in_lat || null,
            clock_in_lng: att?.clock_in_lng || null,
          };
        }));
      } else {
        setClocking([]);
      }
    } catch {
      // Silently handle errors
    } finally {
      setDataLoading(false);
    }
  }, [auth.site, auth.companyId, auth.clientId, siteId]);

  useEffect(() => {
    if (auth.site && auth.companyId) {
      setDataLoading(true);
      fetchDashboardData();
    }
  }, [auth.site, auth.companyId, fetchDashboardData]);

  const refresh = useCallback(() => {
    auth.refresh();
    fetchDashboardData();
  }, [auth, fetchDashboardData]);

  useEffect(() => {
    if (!auth.site || !auth.companyId) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    const handleVisible = () => {
      if (document.visibilityState === 'visible') fetchDashboardData();
    };
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [auth.site, auth.companyId, fetchDashboardData]);

  const activeCheckpoints = patrolCheckpoints.filter((c) => c.is_active);
  const totalCompleted = patrolLogs.reduce((sum, l) => sum + (l.checkpoints_completed || 0), 0);
  const totalExpected = patrolLogs.reduce((sum, l) => sum + (l.checkpoints_total || 0), 0);
  const patrolCompletionPct = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

  return {
    site: auth.site,
    siteIds: auth.siteIds,
    clientId: auth.clientId,
    companyId: auth.companyId,
    loading: auth.loading || (auth.site !== null && dataLoading),
    accessDenied: auth.accessDenied,
    notFound: auth.notFound,
    error: auth.error,

    currentShifts,
    todayShifts,
    upcomingShifts,
    shiftPatterns,

    patrolCheckpoints,
    patrolLogs,
    patrolScans,
    patrolCompletionPct,
    activeCheckpointsCount: activeCheckpoints.length,

    incidents,
    openIncidents: incidents.filter((i) => i.status === 'open'),

    obEntries,

    reports,

    clocking,

    isCountyHall,

    refresh,
  };
}