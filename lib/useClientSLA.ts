import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface SLAData {
  avgResponseTime: number;
  patrolCompletionRate: number;
  missedPatrols: number;
  incidentClosureTime: number;
  guardPunctuality: number;
  reportCompletionRate: number;
  openClientIssues: number;
  slaBreachCount: number;
  firstResponseBreachCount: number;
  resolutionBreachCount: number;
}

export interface PatrolSLAData {
  siteId: string;
  siteName: string;
  totalPatrols: number;
  completedPatrols: number;
  missedPatrols: number;
  completionRate: number;
  lastPatrolAt: string | null;
}

export interface IncidentSLAData {
  id: string;
  incidentType: string;
  severity: string;
  siteName: string;
  createdAt: string;
  resolvedAt: string | null;
  status: string;
  responseTime: number;
  closureTime: number;
}

export interface AttendanceSLAData {
  guardId: string;
  guardName: string;
  siteName: string;
  clockIn: string;
  shiftStart: string;
  punctualityMinutes: number;
  isLate: boolean;
  isMissing: boolean;
}

export interface OBCoverageData {
  date: string;
  totalEntries: number;
  siteCount: number;
  coverage: number;
}

export interface TicketSLAData {
  id: string;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaFirstResponseDue: string | null;
  slaResolutionDue: string | null;
  slaFirstResponseBreached: boolean;
  slaResolutionBreached: boolean;
}

export interface RiskTrendData {
  siteId: string;
  siteName: string;
  currentScore: number;
  previousScore: number;
  change: number;
  level: string;
}

export interface FilterOptions {
  clientId?: string;
  siteId?: string;
  from?: string;
  to?: string;
  shiftType?: string;
  guardId?: string;
}

export interface FilterState {
  clientId: string;
  siteId: string;
  from: string;
  to: string;
  shiftType: string;
  guardId: string;
}

export const defaultFilters: FilterState = {
  clientId: '',
  siteId: '',
  from: '',
  to: '',
  shiftType: '',
  guardId: '',
};

function useFilterDateRange() {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(now.getDate() - 30);
  return {
    from: defaultFrom.toISOString().split('T')[0],
    to: now.toISOString().split('T')[0],
  };
}

export function useClientSLA(filters: FilterOptions = {}) {
  const { companyId } = useAuth();
  const defaultRange = useFilterDateRange();
  const [summary, setSummary] = useState<SLAData>({
    avgResponseTime: 0,
    patrolCompletionRate: 0,
    missedPatrols: 0,
    incidentClosureTime: 0,
    guardPunctuality: 0,
    reportCompletionRate: 0,
    openClientIssues: 0,
    slaBreachCount: 0,
    firstResponseBreachCount: 0,
    resolutionBreachCount: 0,
  });
  const [patrolData, setPatrolData] = useState<PatrolSLAData[]>([]);
  const [incidentData, setIncidentData] = useState<IncidentSLAData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceSLAData[]>([]);
  const [obData, setObData] = useState<OBCoverageData[]>([]);
  const [ticketData, setTicketData] = useState<TicketSLAData[]>([]);
  const [riskTrendData, setRiskTrendData] = useState<RiskTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fromDate = filters.from || defaultRange.from;
  const toDate = filters.to || defaultRange.to;
  const toDateEnd = `${toDate}T23:59:59.999Z`;
  const fromDateIso = new Date(fromDate).toISOString();
  const toDateIso = new Date(toDateEnd).toISOString();

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);

    try {
      const [
        patrolLogsRes,
        incidentsRes,
        attendanceRes,
        obRes,
        ticketsRes,
        riskScoresRes,
        sitesRes,
      ] = await Promise.all([
        supabase
          .from('patrol_logs')
          .select('id, site_id, start_time, end_time, status, checkpoints_total, checkpoints_completed, sites!inner(site_name)')
          .eq('company_id', companyId)
          .gte('start_time', fromDateIso)
          .lte('start_time', toDateIso),
        supabase
          .from('incidents')
          .select('id, incident_type, severity, status, created_at, resolved_at, site_id, sites!inner(site_name)')
          .eq('company_id', companyId)
          .gte('created_at', fromDateIso)
          .lte('created_at', toDateIso)
          .order('created_at', { ascending: false }),
        supabase
          .from('attendance_logs')
          .select('id, guard_id, clock_in, clock_out, shift_id, shifts!inner(site_id, start_time, sites!inner(site_name)), guards!inner(first_name, last_name)')
          .eq('company_id', companyId)
          .gte('clock_in', fromDateIso)
          .lte('clock_in', toDateIso),
        supabase
          .from('occurrence_books')
          .select('id, site_id, created_at, sites!inner(site_name)')
          .eq('company_id', companyId)
          .gte('created_at', fromDateIso)
          .lte('created_at', toDateIso),
        supabase
          .from('support_tickets')
          .select('id, subject, priority, status, created_at, first_response_at, resolved_at, sla_first_response_due, sla_resolution_due, sla_first_response_breached, sla_resolution_breached')
          .eq('company_id', companyId)
          .gte('created_at', fromDateIso)
          .lte('created_at', toDateIso)
          .order('created_at', { ascending: false }),
        supabase
          .from('site_risk_scores')
          .select('site_id, score, level, generated_at, sites!inner(site_name)')
          .eq('company_id', companyId)
          .order('generated_at', { ascending: false }),
        supabase
          .from('sites')
          .select('id, site_name, client_id')
          .eq('company_id', companyId)
          .order('site_name', { ascending: true }),
      ]);

      const patrolLogs = (patrolLogsRes.data || []).map((p: any) => ({
        ...p,
        site_name: p.sites?.site_name || 'Unknown',
      }));
      const incidents = (incidentsRes.data || []).map((i: any) => ({
        ...i,
        site_name: i.sites?.site_name || 'Unknown',
      }));
      const attendance = (attendanceRes.data || []).map((a: any) => ({
        ...a,
        site_name: a.shifts?.sites?.site_name || 'Unknown',
        shift_start: a.shifts?.start_time,
        guard_name: a.guards?.first_name && a.guards?.last_name
          ? `${a.guards.first_name} ${a.guards.last_name}`
          : a.guards?.first_name || 'Unknown',
      }));
      const obEntries = (obRes.data || []).map((o: any) => ({
        ...o,
        site_name: o.sites?.site_name || 'Unknown',
      }));
      const tickets = (ticketsRes.data || []) as TicketSLAData[];
      const riskScores = (riskScoresRes.data || []).map((r: any) => ({
        ...r,
        site_name: r.sites?.site_name || 'Unknown',
      }));
      const sites = (sitesRes.data || []) as any[];

      const totalPatrols = patrolLogs.length;
      const completedPatrols = patrolLogs.filter((p: any) => (p.checkpoints_completed || 0) >= (p.checkpoints_total || 0) && (p.checkpoints_total || 0) > 0).length;
      const missedPatrols = patrolLogs.filter((p: any) => p.status === 'missed' || ((p.checkpoints_completed || 0) === 0 && (p.checkpoints_total || 0) > 0)).length;
      const patrolCompletionRate = totalPatrols > 0 ? Math.round((completedPatrols / totalPatrols) * 100) : 0;

      const resolvedIncidents = incidents.filter((i: any) => i.resolved_at);
      const closureTimes = resolvedIncidents.map((i: any) => {
        const created = new Date(i.created_at).getTime();
        const resolved = new Date(i.resolved_at).getTime();
        return Math.round((resolved - created) / (1000 * 60));
      });
      const avgClosureTime = closureTimes.length > 0 ? Math.round(closureTimes.reduce((a: number, b: number) => a + b, 0) / closureTimes.length) : 0;

      const openIncidents = incidents.filter((i: any) => i.status === 'open' || i.status === 'reviewing').length;

      const lateClockIns = attendance.filter((a: any) => {
        if (!a.clock_in || !a.shift_start) return false;
        const clockIn = new Date(a.clock_in).getTime();
        const start = new Date(a.shift_start).getTime();
        return (clockIn - start) > 5 * 60 * 1000;
      }).length;
      const guardPunctuality = attendance.length > 0 ? Math.round(((attendance.length - lateClockIns) / attendance.length) * 100) : 0;

      const obByDate: Record<string, { entries: number; sites: Set<string> }> = {};
      obEntries.forEach((o: any) => {
        const d = o.created_at?.split('T')[0] || 'unknown';
        if (!obByDate[d]) obByDate[d] = { entries: 0, sites: new Set() };
        obByDate[d].entries++;
        obByDate[d].sites.add(o.site_id || 'unknown');
      });
      const uniqueDays = Object.keys(obByDate).length;
      const avgEntriesPerDay = uniqueDays > 0 ? Math.round(Object.values(obByDate).reduce((sum, v) => sum + v.entries, 0) / uniqueDays) : 0;
      const reportCompletionRate = Math.min(100, avgEntriesPerDay * 10);

      const openTickets = tickets.filter((t: TicketSLAData) => t.status !== 'resolved' && t.status !== 'closed').length;
      const firstResponseBreaches = tickets.filter((t: TicketSLAData) => t.sla_first_response_breached).length;
      const resolutionBreaches = tickets.filter((t: TicketSLAData) => t.sla_resolution_breached).length;
      const slaBreachCount = firstResponseBreaches + resolutionBreaches;

      const responseTimes = tickets.filter((t: TicketSLAData) => t.first_response_at).map((t: TicketSLAData) => {
        const created = new Date(t.createdAt).getTime();
        const responded = new Date(t.first_response_at!).getTime();
        return Math.round((responded - created) / (1000 * 60));
      });
      const avgResponseTime = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

      const patrolBySite: Record<string, PatrolSLAData> = {};
      patrolLogs.forEach((p: any) => {
        const sid = p.site_id || 'unknown';
        if (!patrolBySite[sid]) {
          patrolBySite[sid] = {
            siteId: sid,
            siteName: p.site_name || 'Unknown',
            totalPatrols: 0,
            completedPatrols: 0,
            missedPatrols: 0,
            completionRate: 0,
            lastPatrolAt: null,
          };
        }
        patrolBySite[sid].totalPatrols++;
        if ((p.checkpoints_completed || 0) >= (p.checkpoints_total || 0) && (p.checkpoints_total || 0) > 0) {
          patrolBySite[sid].completedPatrols++;
        } else if (p.status === 'missed' || ((p.checkpoints_completed || 0) === 0 && (p.checkpoints_total || 0) > 0)) {
          patrolBySite[sid].missedPatrols++;
        }
        if (p.start_time && (!patrolBySite[sid].lastPatrolAt || new Date(p.start_time) > new Date(patrolBySite[sid].lastPatrolAt!))) {
          patrolBySite[sid].lastPatrolAt = p.start_time;
        }
      });
      const patrolDataArr = Object.values(patrolBySite).map((p) => ({
        ...p,
        completionRate: p.totalPatrols > 0 ? Math.round((p.completedPatrols / p.totalPatrols) * 100) : 0,
      }));

      const incidentDataArr: IncidentSLAData[] = incidents.slice(0, 50).map((i: any) => {
        const created = new Date(i.created_at).getTime();
        const responseTime = 0;
        const closureTime = i.resolved_at ? Math.round((new Date(i.resolved_at).getTime() - created) / (1000 * 60)) : 0;
        return {
          id: i.id,
          incidentType: i.incident_type || 'Unknown',
          severity: i.severity || 'medium',
          siteName: i.site_name || 'Unknown',
          createdAt: i.created_at,
          resolvedAt: i.resolved_at,
          status: i.status || 'open',
          responseTime,
          closureTime,
        };
      });

      const attendanceDataArr: AttendanceSLAData[] = attendance.slice(0, 50).map((a: any) => {
        const clockIn = a.clock_in ? new Date(a.clock_in).getTime() : 0;
        const start = a.shift_start ? new Date(a.shift_start).getTime() : 0;
        const diff = clockIn && start ? Math.round((clockIn - start) / (1000 * 60)) : 0;
        return {
          guardId: a.guard_id || 'unknown',
          guardName: a.guard_name || 'Unknown',
          siteName: a.site_name || 'Unknown',
          clockIn: a.clock_in,
          shiftStart: a.shift_start,
          punctualityMinutes: diff,
          isLate: diff > 5,
          isMissing: !a.clock_in,
        };
      });

      const obCoverage: OBCoverageData[] = Object.entries(obByDate).map(([date, v]) => ({
        date,
        totalEntries: v.entries,
        siteCount: v.sites.size,
        coverage: Math.round((v.sites.size / (sites.length || 1)) * 100),
      })).sort((a, b) => a.date.localeCompare(b.date));

      const riskBySite: Record<string, { current: any; previous: any }> = {};
      riskScores.forEach((r: any) => {
        const sid = r.site_id;
        if (!riskBySite[sid]) {
          riskBySite[sid] = { current: r, previous: null };
        } else if (!riskBySite[sid].previous) {
          riskBySite[sid].previous = r;
        }
      });
      const riskTrendArr: RiskTrendData[] = Object.entries(riskBySite).map(([sid, v]) => {
        const current = v.current;
        const previous = v.previous;
        const prevScore = previous?.score || current.score;
        const change = current.score - prevScore;
        return {
          siteId: sid,
          siteName: current.site_name || 'Unknown',
          currentScore: current.score || 0,
          previousScore: prevScore || 0,
          change,
          level: current.level || 'low',
        };
      });

      setSummary({
        avgResponseTime,
        patrolCompletionRate,
        missedPatrols,
        incidentClosureTime: avgClosureTime,
        guardPunctuality,
        reportCompletionRate,
        openClientIssues: openIncidents + openTickets,
        slaBreachCount,
        firstResponseBreachCount: firstResponseBreaches,
        resolutionBreachCount: resolutionBreaches,
      });
      setPatrolData(patrolDataArr);
      setIncidentData(incidentDataArr);
      setAttendanceData(attendanceDataArr);
      setObData(obCoverage);
      setTicketData(tickets.slice(0, 50));
      setRiskTrendData(riskTrendArr);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load SLA data');
    } finally {
      setLoading(false);
    }
  }, [companyId, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!companyId) return;
    const channels: ReturnType<typeof supabase.channel>[] = [];
    channels.push(
      supabase.channel('sla-patrol').on('postgres_changes', { event: '*', schema: 'public', table: 'patrol_logs', filter: `company_id=eq.${companyId}` }, () => fetchData()).subscribe()
    );
    channels.push(
      supabase.channel('sla-incidents').on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `company_id=eq.${companyId}` }, () => fetchData()).subscribe()
    );
    channels.push(
      supabase.channel('sla-attendance').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs', filter: `company_id=eq.${companyId}` }, () => fetchData()).subscribe()
    );
    channels.push(
      supabase.channel('sla-tickets').on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `company_id=eq.${companyId}` }, () => fetchData()).subscribe()
    );
    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [companyId, fetchData]);

  return {
    summary,
    patrolData,
    incidentData,
    attendanceData,
    obData,
    ticketData,
    riskTrendData,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}