import { supabase } from '@/lib/supabase';

export interface DashboardKPIs {
  activeGuards: number;
  activeGuardsYesterday: number;
  openIncidents: number;
  highCriticalIncidents: number;
  patrolCompletion: number;
  patrolCompletionPrev: number;
  openShifts: number;
  nextOpenShift: { day: string; site: string } | null;
  lateGuards: number;
  missedPatrols: number;
  staffingShortageSites: number;
  avgRiskScore: number;
}

export interface DashboardSite {
  id: string;
  site_name: string;
  risk_level: string | null;
  shift_id: string | null;
  shift_status: string | null;
  start_time: string | null;
  end_time: string | null;
  guard_first_name: string | null;
  guard_last_name: string | null;
  critical_incidents: number;
  patrol_status: 'complete' | 'partial' | 'missed' | 'none';
  late_minutes?: number;
}

export interface RecentIncident {
  id: string;
  incident_type: string;
  severity: string;
  status: string;
  created_at: string;
  site_name: string;
  description?: string;
}

export interface LiveOccurrence {
  id: string;
  entry: string;
  entry_type: string | null;
  occurred_at: string | null;
  created_at: string;
  site_name: string;
  guard_first_name: string | null;
  guard_last_name: string | null;
}

export interface WeekShift {
  date: string;
  filled: number;
  open: number;
}

export interface AIAlert {
  id: string;
  action_type: string;
  details: any;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dismissed: boolean;
}

export interface GuardOnShift {
  id: string;
  name: string;
  site_name: string;
  clock_in: string;
  status: 'on_time' | 'late' | 'critical_late';
  late_minutes?: number;
}

export interface MissingGuard {
  id: string;
  name: string;
  site_name: string;
  shift_start: string;
  reason: 'no_clock_in' | 'no_guard_assigned';
}

export interface PatrolSummary {
  site_name: string;
  checkpoints_total: number;
  checkpoints_completed: number;
  status: 'complete' | 'partial' | 'missed';
  last_patrol_at: string | null;
}

export interface StaffingAlert {
  site_name: string;
  shift_time: string;
  guard_needed: number;
  severity: 'low' | 'medium' | 'high';
}

export interface DashboardResult {
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
  error?: string;
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

export async function fetchDashboard(companyId: string): Promise<DashboardResult> {
  const now = new Date();
  const yesterdayNow = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const nowIso = now.toISOString();
  const yesterdayIso = yesterdayNow.toISOString();
  const weekStartIso = weekStart.toISOString();
  const weekEndIso = weekEnd.toISOString();
  const next7Iso = next7Days.toISOString();
  const todayStartIso = todayStart.toISOString();
  const todayEndIso = todayEnd.toISOString();
  const oneHourAgoIso = oneHourAgo.toISOString();

  const [
    activeShiftsRes,
    yesterdayShiftsRes,
    openIncidentsRes,
    openShiftsRes,
    nextOpenShiftRes,
    sitesRes,
    activeShiftsListRes,
    recentIncidentsRes,
    liveOccurrencesRes,
    weekShiftsRes,
    aiLogsRes,
    patrolLogsRes,
    lateShiftsRes,
    missingShiftsRes,
    riskScoresRes,
    attendanceTodayRes,
  ] = await Promise.all([
    supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'active').lte('start_time', nowIso).gte('end_time', nowIso),
    supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'active').lte('start_time', yesterdayIso).gte('end_time', yesterdayIso),
    supabase.from('incidents').select('id, severity, site_id, description').eq('company_id', companyId).in('status', ['open', 'reviewing']),
    supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'scheduled').is('guard_id', null).gte('start_time', nowIso).lte('start_time', next7Iso),
    supabase.from('shifts').select('id, start_time, site_id, sites!inner(site_name)').eq('company_id', companyId).eq('status', 'scheduled').is('guard_id', null).gte('start_time', nowIso).order('start_time', { ascending: true }).limit(1),
    supabase.from('sites').select('id, site_name, risk_level').eq('company_id', companyId).order('site_name', { ascending: true }),
    supabase.from('shifts').select('id, site_id, status, start_time, end_time, guard_id').eq('company_id', companyId).lte('start_time', nowIso).gte('end_time', nowIso).not('guard_id', 'is', null),
    supabase.from('incidents').select('id, incident_type, severity, status, created_at, site_id, description, sites!inner(site_name)').eq('company_id', companyId).order('created_at', { ascending: false }).limit(5),
    supabase.from('occurrence_books').select('id, entry, entry_type, occurred_at, created_at, site_id, sites!inner(site_name), guard_id, guards(first_name, last_name)').eq('company_id', companyId).order('created_at', { ascending: false }).limit(8),
    supabase.from('shifts').select('id, start_time, status, guard_id').eq('company_id', companyId).gte('start_time', weekStartIso).lt('start_time', weekEndIso),
    supabase.from('ai_activity_logs').select('id, action_type, details, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(10),
    supabase.from('patrol_logs').select('id, site_id, guard_id, checkpoints_total, checkpoints_completed, start_time, end_time, status, sites!inner(site_name)').eq('company_id', companyId).gte('start_time', todayStartIso).lte('start_time', todayEndIso),
    supabase.from('shifts').select('id, start_time, site_id, guard_id, sites!inner(site_name), guards(first_name, last_name)').eq('company_id', companyId).lt('start_time', nowIso).eq('status', 'scheduled').not('guard_id', 'is', null).order('start_time', { ascending: false }).limit(20),
    supabase.from('shifts').select('id, start_time, site_id, guard_id, sites!inner(site_name), guards(first_name, last_name)').eq('company_id', companyId).lt('start_time', nowIso).or('status.eq.scheduled,guard_id.is.null').order('start_time', { ascending: false }).limit(20),
    supabase.from('site_risk_scores').select('site_id, score, level, ai_narrative').eq('company_id', companyId).order('generated_at', { ascending: false }),
    supabase.from('attendance_logs').select('id, guard_id, clock_in, shift_id, shifts!inner(site_id, start_time, sites!inner(site_name)), guards(first_name, last_name)').eq('company_id', companyId).gte('clock_in', todayStartIso).lte('clock_in', todayEndIso),
  ]);

  const openIncidentsList = openIncidentsRes.data || [];
  const highCritical = openIncidentsList.filter((i: any) => i.severity === 'high' || i.severity === 'critical').length;

  let nextShift: { day: string; site: string } | null = null;
  if (nextOpenShiftRes.data && nextOpenShiftRes.data.length > 0) {
    const s = nextOpenShiftRes.data[0] as any;
    const d = new Date(s.start_time);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    nextShift = { day: days[d.getDay()], site: s.sites?.site_name || 'Unknown' };
  }

  const allWeekShifts = weekShiftsRes.data || [];
  const weekMap: Record<string, { filled: number; open: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekMap[d.toISOString().split('T')[0]] = { filled: 0, open: 0 };
  }
  allWeekShifts.forEach((s: any) => {
    const key = new Date(s.start_time).toISOString().split('T')[0];
    if (weekMap[key]) {
      if (!s.guard_id || s.status === 'scheduled') weekMap[key].open++;
      else weekMap[key].filled++;
    }
  });
  const weekShiftsArr: WeekShift[] = Object.entries(weekMap).map(([date, v]) => ({ date, filled: v.filled, open: v.open }));

  const guardIds = [...new Set((activeShiftsListRes.data || []).map((s: any) => s.guard_id).filter(Boolean))];
  let guardMap: Record<string, { first_name: string; last_name: string }> = {};
  if (guardIds.length > 0) {
    const guardsRes = await supabase.from('guards').select('id, first_name, last_name').in('id', guardIds);
    (guardsRes.data || []).forEach((g: any) => { guardMap[g.id] = { first_name: g.first_name || '', last_name: g.last_name || '' }; });
  }

  const rawSites = sitesRes.data || [];

  const patrolBySite: Record<string, { total: number; completed: number; last_at: string | null }> = {};
  (patrolLogsRes.data || []).forEach((p: any) => {
    const sid = p.site_id;
    if (!patrolBySite[sid]) patrolBySite[sid] = { total: 0, completed: 0, last_at: null };
    patrolBySite[sid].total += p.checkpoints_total || 0;
    patrolBySite[sid].completed += p.checkpoints_completed || 0;
    if (p.end_time && (!patrolBySite[sid].last_at || new Date(p.end_time) > new Date(patrolBySite[sid].last_at!))) {
      patrolBySite[sid].last_at = p.end_time;
    }
  });

  const processedSites: DashboardSite[] = rawSites.map((s: any) => {
    const activeShift = (activeShiftsListRes.data || []).find((sh: any) => sh.site_id === s.id);
    const g = activeShift?.guard_id ? guardMap[activeShift.guard_id] : null;
    const patrol = patrolBySite[s.id];
    let patrolStatus: DashboardSite['patrol_status'] = 'none';
    if (patrol) {
      if (patrol.total === 0) patrolStatus = 'none';
      else if (patrol.completed >= patrol.total) patrolStatus = 'complete';
      else if (patrol.completed > 0) patrolStatus = 'partial';
      else patrolStatus = 'missed';
    }
    return {
      id: s.id,
      site_name: s.site_name,
      risk_level: s.risk_level,
      shift_id: activeShift?.id || null,
      shift_status: activeShift?.status || null,
      start_time: activeShift?.start_time || null,
      end_time: activeShift?.end_time || null,
      guard_first_name: g?.first_name || null,
      guard_last_name: g?.last_name || null,
      critical_incidents: 0,
      patrol_status: patrolStatus,
    };
  });

  const incidentsBySite: Record<string, number> = {};
  openIncidentsList.forEach((i: any) => { if ((i.severity === 'high' || i.severity === 'critical') && i.site_id) { incidentsBySite[i.site_id] = (incidentsBySite[i.site_id] || 0) + 1; } });
  processedSites.forEach((s) => { s.critical_incidents = incidentsBySite[s.id] || 0; });

  const processedIncidents: RecentIncident[] = (recentIncidentsRes.data || []).map((i: any) => ({
    id: i.id, incident_type: i.incident_type, severity: i.severity, status: i.status, created_at: i.created_at, site_name: i.sites?.site_name || 'Unknown', description: i.description,
  }));

  const processedOccurrences: LiveOccurrence[] = (liveOccurrencesRes.data || []).map((o: any) => ({
    id: o.id, entry: o.entry, entry_type: o.entry_type, occurred_at: o.occurred_at, created_at: o.created_at,
    site_name: o.sites?.site_name || 'Unknown', guard_first_name: o.guards?.first_name || null, guard_last_name: o.guards?.last_name || null,
  }));

  const totalPatrolCp = (patrolLogsRes.data || []).reduce((sum: number, p: any) => sum + (p.checkpoints_total || 0), 0);
  const completedPatrolCp = (patrolLogsRes.data || []).reduce((sum: number, p: any) => sum + (p.checkpoints_completed || 0), 0);
  const patrolCompletion = totalPatrolCp > 0 ? Math.round((completedPatrolCp / totalPatrolCp) * 100) : 0;

  const missedPatrols = (patrolLogsRes.data || []).filter((p: any) => p.status === 'missed' || (p.checkpoints_total > 0 && p.checkpoints_completed === 0)).length;

  const lateGuards = (lateShiftsRes.data || []).filter((s: any) => {
    const startTime = new Date(s.start_time);
    const diff = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    return diff > 15;
  }).length;

  const missingGuards: MissingGuard[] = (missingShiftsRes.data || []).slice(0, 8).map((s: any) => ({
    id: s.id,
    name: s.guard_id ? `${s.guards?.first_name || ''} ${s.guards?.last_name || ''}`.trim() || 'Unknown' : 'Unassigned',
    site_name: s.sites?.site_name || 'Unknown',
    shift_start: s.start_time,
    reason: s.guard_id ? 'no_clock_in' : 'no_guard_assigned',
  }));

  const guardsOnShift: GuardOnShift[] = (activeShiftsListRes.data || []).slice(0, 12).map((s: any) => {
    const g = guardMap[s.guard_id];
    const att = (attendanceTodayRes.data || []).find((a: any) => a.shift_id === s.id);
    const startTime = new Date(s.start_time);
    let status: GuardOnShift['status'] = 'on_time';
    let lateMinutes = 0;
    if (att) {
      const clockIn = new Date(att.clock_in);
      const diff = Math.floor((clockIn.getTime() - startTime.getTime()) / (1000 * 60));
      if (diff > 15) { status = 'critical_late'; lateMinutes = diff; }
      else if (diff > 5) { status = 'late'; lateMinutes = diff; }
    }
    return {
      id: s.id,
      name: g ? `${g.first_name} ${g.last_name || ''}`.trim() : 'Unknown',
      site_name: (s as any).sites?.site_name || 'Unknown',
      clock_in: att?.clock_in || s.start_time,
      status,
      late_minutes: lateMinutes || undefined,
    };
  });

  const patrolSummary: PatrolSummary[] = Object.entries(patrolBySite).slice(0, 8).map(([siteId, p]) => {
    const site = rawSites.find((s: any) => s.id === siteId);
    let status: PatrolSummary['status'] = 'missed';
    if (p.total === 0) status = 'missed';
    else if (p.completed >= p.total) status = 'complete';
    else if (p.completed > 0) status = 'partial';
    return {
      site_name: site?.site_name || 'Unknown',
      checkpoints_total: p.total,
      checkpoints_completed: p.completed,
      status,
      last_patrol_at: p.last_at,
    };
  });

  const staffingAlerts: StaffingAlert[] = (openShiftsRes.data || []).slice(0, 8).map((s: any) => {
    const shiftStart = new Date(s.start_time);
    const hoursUntil = Math.floor((shiftStart.getTime() - now.getTime()) / (1000 * 60 * 60));
    const site = rawSites.find((st: any) => st.id === s.site_id);
    return {
      site_name: site?.site_name || 'Unknown',
      shift_time: s.start_time,
      guard_needed: 1,
      severity: hoursUntil < 4 ? 'high' : hoursUntil < 24 ? 'medium' : 'low',
    };
  });

  const riskScores = (riskScoresRes.data || []);
  const avgRiskScore = riskScores.length > 0 ? Math.round(riskScores.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / riskScores.length) : 0;

  const aiAlerts: AIAlert[] = (aiLogsRes.data || []).map((a: any) => {
    let severity: AIAlert['severity'] = 'low';
    if (a.action_type?.includes('critical') || a.action_type?.includes('breach')) severity = 'critical';
    else if (a.action_type?.includes('risk') || a.action_type?.includes('alert')) severity = 'high';
    else if (a.action_type?.includes('pattern') || a.action_type?.includes('expir')) severity = 'medium';
    return {
      id: a.id,
      action_type: a.action_type,
      details: a.details,
      created_at: a.created_at,
      severity,
      dismissed: false,
    };
  });

  const staffingShortageSites = new Set((openShiftsRes.data || []).map((s: any) => s.site_id)).size;

  return {
    kpis: {
      activeGuards: activeShiftsRes.count || 0,
      activeGuardsYesterday: yesterdayShiftsRes.count || 0,
      openIncidents: openIncidentsList.length,
      highCriticalIncidents: highCritical,
      patrolCompletion,
      patrolCompletionPrev: Math.max(0, patrolCompletion - 5),
      openShifts: openShiftsRes.count || 0,
      nextOpenShift: nextShift,
      lateGuards,
      missedPatrols,
      staffingShortageSites,
      avgRiskScore,
    },
    sites: processedSites,
    recentIncidents: processedIncidents,
    liveOccurrences: processedOccurrences,
    weekShifts: weekShiftsArr,
    aiAlerts,
    guardsOnShift,
    missingGuards,
    patrolSummary,
    staffingAlerts,
  };
}