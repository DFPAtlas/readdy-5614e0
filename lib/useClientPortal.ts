'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface ClientSite {
  id: string;
  site_name: string;
  address: string;
  risk_level: string;
  latitude: number | null;
  longitude: number | null;
  client_id: string;
  company_id: string;
  assignment_instructions: string | null;
}

export interface ClientIncident {
  id: string;
  site_id: string;
  guard_id: string;
  incident_number: string | null;
  incident_type: string;
  severity: string;
  description: string | null;
  ai_rewritten_report: string | null;
  status: string;
  client_visible: boolean;
  created_at: string;
  occurred_at: string;
  resolved_at: string | null;
  site_name?: string;
  officer_name?: string;
  officer_sia?: string;
}

export interface ClientReport {
  id: string;
  site_id: string;
  title: string;
  file_url: string | null;
  status: string;
  ai_summary: string | null;
  generated_at: string;
  period_start: string | null;
  period_end: string | null;
  site_name?: string;
}

export interface ClientActivity {
  id: string;
  type: 'incident' | 'patrol' | 'ob' | 'report' | 'shift';
  title: string;
  description: string;
  site_name: string;
  site_id: string;
  occurred_at: string;
  severity?: string;
  status?: string;
}

export interface ClientMessage {
  id: string;
  subject: string;
  body: string;
  is_from_client: boolean;
  status: string;
  created_at: string;
  site_name?: string;
  incident_id?: string;
}

export interface CurrentShift {
  id: string;
  guard_id: string;
  site_id: string;
  start_time: string;
  end_time: string;
  status: string;
  guard_name?: string;
  guard_phone?: string;
}

export interface ClockingLog {
  shift_id: string;
  site_id: string;
  guard_id: string;
  guard_name: string;
  guard_phone: string | null;
  start_time: string;
  end_time: string;
  status: string;
  is_clocked_in: boolean;
  clocked_in_at: string | null;
  clocked_out_at: string | null;
  clock_in_location: { lat: number; lng: number } | null;
}

export interface TodayShift {
  id: string;
  guard_id: string | null;
  site_id: string;
  start_time: string;
  end_time: string;
  status: string;
  shift_type: string | null;
  guard_name: string;
  site_name: string;
}

export interface ClientOBEntry {
  id: string;
  site_id: string;
  entry_type: string;
  entry: string;
  title: string | null;
  created_at: string;
  occurred_at: string;
  guard_name: string;
  site_name: string;
}

export interface SitePatrolSummary {
  site_id: string;
  site_name: string;
  activeCheckpoints: number;
  totalCheckpoints: number;
  scansToday: number;
  missedCheckpoints: number;
  lastScanTime: string | null;
  patrolCompletionPct: number;
  gpsIssueCount: number;
  activePatrols: number;
  patrolsToday: number;
}

export interface ClientSiteNotice {
  id: string;
  site_id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  site_name: string;
}

export interface SiteHealthStatus {
  site_id: string;
  site_name: string;
  hasInstructions: boolean;
  hasRiskLevel: boolean;
  hasPatrolCheckpoints: boolean;
  hasActiveShifts: boolean;
  hasClientReports: boolean;
  dashboardLinked: boolean;
  status: 'Complete' | 'Needs setup' | 'Missing patrols' | 'Missing rota' | 'Missing instructions';
  score: number;
}

interface ClientPortalData {
  sites: ClientSite[];
  incidents: ClientIncident[];
  reports: ClientReport[];
  activities: ClientActivity[];
  messages: ClientMessage[];
  currentShifts: CurrentShift[];
  unreadMessages: number;
  isLoading: boolean;
  companyId: string | null;
  clocking: ClockingLog[];
  todayShifts: TodayShift[];
  obEntries: ClientOBEntry[];
  patrolSummary: SitePatrolSummary[];
  siteNotices: ClientSiteNotice[];
  siteHealth: SiteHealthStatus[];
  refresh: () => void;
  markMessageRead: (id: string) => Promise<void>;
  sendMessage: (data: { subject: string; body: string; site_id?: string; incident_id?: string }) => Promise<{ error: any }>;
}

const Ctx = createContext<ClientPortalData | undefined>(undefined);

export function ClientPortalProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, companyId } = useAuth();
  const pathname = usePathname();
  const isStandaloneSite = /^\/client\/sites\/(?!new$)[^/]+$/.test(pathname || '');

  const [sites, setSites] = useState<ClientSite[]>([]);
  const [incidents, setIncidents] = useState<ClientIncident[]>([]);
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [currentShifts, setCurrentShifts] = useState<CurrentShift[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [clocking, setClocking] = useState<ClockingLog[]>([]);
  const [todayShifts, setTodayShifts] = useState<TodayShift[]>([]);
  const [obEntries, setObEntries] = useState<ClientOBEntry[]>([]);
  const [patrolSummary, setPatrolSummary] = useState<SitePatrolSummary[]>([]);
  const [siteNotices, setSiteNotices] = useState<ClientSiteNotice[]>([]);
  const [siteHealth, setSiteHealth] = useState<SiteHealthStatus[]>([]);

  const fetchData = useCallback(async () => {
    if (!currentUser || !companyId) return;
    setIsLoading(true);

    const now = new Date().toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: clientUser } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    const clientId = clientUser?.client_id;
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    const { data: sitesData } = await supabase
      .from('sites')
      .select('id, site_name, address, risk_level, latitude, longitude, client_id, company_id, assignment_instructions')
      .eq('client_id', clientId)
      .eq('company_id', companyId);
    const mySites = sitesData || [];
    setSites(mySites);
    const siteIds = mySites.map((s) => s.id);

    let shifts: CurrentShift[] = [];
    if (siteIds.length > 0) {
      const { data: shiftsData } = await supabase
        .from('shifts')
        .select('id, guard_id, site_id, start_time, end_time, status')
        .in('site_id', siteIds)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .lte('start_time', now)
        .gte('end_time', now);

      if (shiftsData && shiftsData.length > 0) {
        const guardIds = [...new Set(shiftsData.map((s) => s.guard_id).filter(Boolean))];
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name, phone')
          .in('id', guardIds);

        shifts = shiftsData.map((s) => {
          const g = guardsData?.find((gd) => gd.id === s.guard_id);
          return {
            ...s,
            guard_name: g ? `${g.first_name} ${g.last_name}` : 'Officer',
            guard_phone: g?.phone || null,
          };
        });
      }
    }
    setCurrentShifts(shifts);

    let incs: ClientIncident[] = [];
    if (siteIds.length > 0) {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const { data: incData } = await supabase
        .from('incidents')
        .select('id, site_id, guard_id, incident_type, severity, description, ai_rewritten_report, status, created_at, occurred_at, resolved_at, client_visible, incident_number')
        .in('site_id', siteIds)
        .eq('company_id', companyId)
        .eq('client_visible', true)
        .gte('created_at', ninetyDaysAgo)
        .order('created_at', { ascending: false });

      if (incData) {
        const guardIds = [...new Set(incData.map((i) => i.guard_id).filter(Boolean))];
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name, sia_licence')
          .in('id', guardIds);

        incs = incData.map((i) => {
          const g = guardsData?.find((gd) => gd.id === i.guard_id);
          return {
            ...i,
            site_name: mySites.find((s) => s.id === i.site_id)?.site_name || '',
            officer_name: g ? `${g.first_name} ${g.last_name}` : 'Officer',
            officer_sia: g?.sia_licence || null,
          };
        });
      }
    }
    setIncidents(incs);

    let reps: ClientReport[] = [];
    if (siteIds.length > 0) {
      const { data: repData } = await supabase
        .from('reports')
        .select('id, site_id, title, file_url, status, ai_summary, generated_at, period_start, period_end')
        .in('site_id', siteIds)
        .eq('company_id', companyId)
        .in('report_type', ['weekly_site', 'incident', 'patrol_summary', 'compliance'])
        .eq('client_visible', true)
        .order('generated_at', { ascending: false });

      reps = (repData || []).map((r) => ({
        ...r,
        site_name: mySites.find((s) => s.id === r.site_id)?.site_name || '',
      }));
    }
    setReports(reps);

    const activityList: ClientActivity[] = [];
    incs.slice(0, 5).forEach((i) => {
      activityList.push({
        id: `inc-${i.id}`,
        type: 'incident',
        title: i.incident_type,
        description: i.ai_rewritten_report || (i.description?.slice(0, 120) + '...') || 'Incident reported',
        site_name: i.site_name || '',
        site_id: i.site_id,
        occurred_at: i.created_at,
        severity: i.severity,
        status: i.status,
      });
    });

    if (siteIds.length > 0) {
      const { data: obData } = await supabase
        .from('occurrence_books')
        .select('id, site_id, entry, entry_type, created_at')
        .in('site_id', siteIds)
        .eq('company_id', companyId)
        .eq('client_visible', true)
        .order('created_at', { ascending: false })
        .limit(5);

      (obData || []).forEach((ob) => {
        activityList.push({
          id: `ob-${ob.id}`,
          type: 'ob',
          title: ob.entry_type,
          description: (ob.entry?.slice(0, 120) || '') + (ob.entry && ob.entry.length > 120 ? '...' : ''),
          site_name: mySites.find((s) => s.id === ob.site_id)?.site_name || '',
          site_id: ob.site_id,
          occurred_at: ob.created_at,
        });
      });
    }

    if (siteIds.length > 0) {
      const { data: patrolData } = await supabase
        .from('patrol_logs')
        .select('id, site_id, start_time, ended_at')
        .in('site_id', siteIds)
        .eq('company_id', companyId)
        .not('ended_at', 'is', null)
        .gte('ended_at', weekAgo)
        .order('ended_at', { ascending: false })
        .limit(5);

      (patrolData || []).forEach((p) => {
        activityList.push({
          id: `patrol-${p.id}`,
          type: 'patrol',
          title: 'Patrol completed',
          description: 'Security patrol completed successfully',
          site_name: mySites.find((s) => s.id === p.site_id)?.site_name || '',
          site_id: p.site_id,
          occurred_at: p.ended_at,
        });
      });
    }

    reps.filter((r) => r.status === 'sent').slice(0, 3).forEach((r) => {
      activityList.push({
        id: `report-${r.id}`,
        type: 'report',
        title: 'Report published',
        description: r.title,
        site_name: r.site_name || '',
        site_id: r.site_id,
        occurred_at: r.generated_at,
      });
    });

    activityList.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
    setActivities(activityList.slice(0, 12));

    const { data: msgData } = await supabase
      .from('client_messages')
      .select('id, subject, body, is_from_client, status, created_at, site_id, incident_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    const msgEnriched = (msgData || []).map((m) => ({
      ...m,
      site_name: mySites.find((s) => s.id === m.site_id)?.site_name || '',
    }));
    setMessages(msgEnriched);
    setUnreadMessages(msgEnriched.filter((m) => m.status === 'unread' && !m.is_from_client).length);
    setIsLoading(false);

    // Fetch clocking data via edge function
    let clockingData: ClockingLog[] = [];
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-client-clocking`;
      if (token && siteIds.length > 0) {
        const res = await fetch(funcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const body = await res.json();
          clockingData = body.clocking || [];
        }
      }
    } catch {
      // Edge function unavailable, silently skip
    }
    setClocking(clockingData);

    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString();
    const todayEnd = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).toISOString();

    let tsData: TodayShift[] = [];
    let obData: ClientOBEntry[] = [];
    let patrolData: SitePatrolSummary[] = [];
    let noticeData: ClientSiteNotice[] = [];
    let healthData: SiteHealthStatus[] = [];

    if (siteIds.length > 0) {
      const allGuardIds = new Set<string>();

      const [
        tShiftsResult,
        obResult,
        checkpointsResult,
        scansResult,
        logsResult,
        noticesResult,
      ] = await Promise.all([
        supabase
          .from('shifts')
          .select('id, guard_id, site_id, start_time, end_time, status, shift_type')
          .in('site_id', siteIds)
          .eq('company_id', companyId)
          .gte('start_time', todayStart)
          .lt('start_time', todayEnd)
          .order('start_time'),
        supabase
          .from('occurrence_books')
          .select('id, site_id, entry_type, entry, title, created_at, occurred_at, guard_id')
          .in('site_id', siteIds)
          .eq('company_id', companyId)
          .eq('client_visible', true)
          .order('occurred_at', { ascending: false })
          .limit(20),
        supabase
          .from('patrol_checkpoints')
          .select('id, site_id, is_active')
          .in('site_id', siteIds)
          .eq('company_id', companyId),
        supabase
          .from('patrol_scans')
          .select('id, site_id, scanned_at, gps_verified, gps_status')
          .in('site_id', siteIds)
          .eq('company_id', companyId)
          .gte('scanned_at', todayStart)
          .order('scanned_at', { ascending: false }),
        supabase
          .from('patrol_logs')
          .select('id, site_id, checkpoints_total, checkpoints_completed, missed_checkpoints, gps_verified_count, out_of_radius_count, start_time, status')
          .in('site_id', siteIds)
          .eq('company_id', companyId)
          .gte('start_time', todayStart)
          .order('start_time', { ascending: false }),
        supabase
          .from('site_notices')
          .select('id, site_id, title, body, category, priority, status, created_at')
          .in('site_id', siteIds)
          .eq('company_id', companyId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const tShiftsRaw = (tShiftsResult.data || []) as any[];
      const obRaw = (obResult.data || []) as any[];
      const checkpointsRaw = (checkpointsResult.data || []) as any[];
      const scansRaw = (scansResult.data || []) as any[];
      const logsRaw = (logsResult.data || []) as any[];
      const noticesRaw = (noticesResult.data || []) as any[];

      tShiftsRaw.forEach((s: any) => { if (s.guard_id) allGuardIds.add(s.guard_id); });
      obRaw.forEach((o: any) => { if (o.guard_id) allGuardIds.add(o.guard_id); });

      let guardsMap: Record<string, { first_name: string; last_name: string }> = {};
      if (allGuardIds.size > 0) {
        const { data: gData } = await supabase
          .from('guards')
          .select('id, first_name, last_name')
          .in('id', [...allGuardIds]);
        (gData || []).forEach((g: any) => {
          guardsMap[g.id] = { first_name: g.first_name, last_name: g.last_name };
        });
      }

      const getGuardName = (guardId: string | null) => {
        if (!guardId || !guardsMap[guardId]) return 'Officer';
        const g = guardsMap[guardId];
        return `${g.first_name} ${g.last_name}`.trim() || 'Officer';
      };

      tsData = tShiftsRaw.map((s: any): TodayShift => ({
        id: s.id,
        guard_id: s.guard_id,
        site_id: s.site_id,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status || 'scheduled',
        shift_type: s.shift_type,
        guard_name: getGuardName(s.guard_id),
        site_name: mySites.find((site) => site.id === s.site_id)?.site_name || '',
      }));

      obData = obRaw.map((o: any): ClientOBEntry => ({
        id: o.id,
        site_id: o.site_id,
        entry_type: o.entry_type,
        entry: o.entry,
        title: o.title,
        created_at: o.created_at,
        occurred_at: o.occurred_at,
        guard_name: getGuardName(o.guard_id),
        site_name: mySites.find((site) => site.id === o.site_id)?.site_name || '',
      }));

      patrolData = mySites.map((site): SitePatrolSummary => {
        const siteCheckpoints = checkpointsRaw.filter((c: any) => c.site_id === site.id);
        const activeCps = siteCheckpoints.filter((c: any) => c.is_active);
        const siteScans = scansRaw.filter((s: any) => s.site_id === site.id);
        const siteLogs = logsRaw.filter((l: any) => l.site_id === site.id);
        const totalCompleted = siteLogs.reduce((sum: number, l: any) => sum + (l.checkpoints_completed || 0), 0);
        const totalExpected = siteLogs.reduce((sum: number, l: any) => sum + (l.checkpoints_total || 0), 0);
        const totalMissed = siteLogs.reduce((sum: number, l: any) => sum + (l.missed_checkpoints || 0), 0);
        const gpsIssues = siteLogs.reduce((sum: number, l: any) => sum + (l.out_of_radius_count || 0), 0);
        const activePatrols = siteLogs.filter((l: any) => l.status === 'in_progress' || l.status === 'active').length;
        return {
          site_id: site.id,
          site_name: site.site_name,
          activeCheckpoints: activeCps.length,
          totalCheckpoints: siteCheckpoints.length,
          scansToday: siteScans.length,
          missedCheckpoints: totalMissed,
          lastScanTime: siteScans[0]?.scanned_at || null,
          patrolCompletionPct: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0,
          gpsIssueCount: gpsIssues,
          activePatrols,
          patrolsToday: siteLogs.length,
        };
      });

      noticeData = noticesRaw.map((n: any): ClientSiteNotice => ({
        id: n.id,
        site_id: n.site_id,
        title: n.title,
        body: n.body,
        category: n.category,
        priority: n.priority,
        status: n.status,
        created_at: n.created_at,
        site_name: mySites.find((site) => site.id === n.site_id)?.site_name || '',
      }));

      healthData = mySites.map((site): SiteHealthStatus => {
        const hasInstructions = !!site.assignment_instructions;
        const hasRiskLevel = !!site.risk_level;
        const siteCheckpoints = checkpointsRaw.filter((c: any) => c.site_id === site.id && c.is_active);
        const hasPatrolCheckpoints = siteCheckpoints.length > 0;
        const siteShifts = shifts.filter((s) => s.site_id === site.id);
        const hasActiveShifts = siteShifts.length > 0;
        const siteReports = reps.filter((r) => r.site_id === site.id);
        const hasClientReports = siteReports.length > 0;

        let score = 0;
        if (hasInstructions) score += 20;
        if (hasRiskLevel) score += 15;
        if (hasPatrolCheckpoints) score += 25;
        if (hasActiveShifts) score += 25;
        if (hasClientReports) score += 15;

        let status: SiteHealthStatus['status'] = 'Complete';
        if (score >= 80) status = 'Complete';
        else if (!hasPatrolCheckpoints && !hasActiveShifts) status = 'Needs setup';
        else if (!hasPatrolCheckpoints) status = 'Missing patrols';
        else if (!hasActiveShifts) status = 'Missing rota';
        else if (!hasInstructions) status = 'Missing instructions';
        else status = 'Needs setup';

        return {
          site_id: site.id,
          site_name: site.site_name,
          hasInstructions,
          hasRiskLevel,
          hasPatrolCheckpoints,
          hasActiveShifts,
          hasClientReports,
          dashboardLinked: true,
          status,
          score,
        };
      });
    }

    setTodayShifts(tsData);
    setObEntries(obData);
    setPatrolSummary(patrolData);
    setSiteNotices(noticeData);
    setSiteHealth(healthData);
  }, [currentUser, companyId]);

  useEffect(() => {
    if (currentUser && companyId && !isStandaloneSite) {
      fetchData();
    } else if (isStandaloneSite) {
      setIsLoading(false);
    }
  }, [currentUser, companyId, fetchData, isStandaloneSite]);

  useEffect(() => {
    if (!currentUser || !companyId || isStandaloneSite) return;

    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    const handleVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [currentUser, companyId, fetchData]);

  const markMessageRead = async (id: string) => {
    await supabase.from('client_messages').update({ status: 'read', read_at: new Date().toISOString() }).eq('id', id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m)));
    setUnreadMessages((prev) => Math.max(0, prev - 1));
  };

  const sendMessage = async (data: { subject: string; body: string; site_id?: string; incident_id?: string }) => {
    const { data: clientUser } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', currentUser?.id)
      .maybeSingle();

    if (!clientUser?.client_id || !companyId) return { error: new Error('Not authenticated') };

    const insertResult = await supabase.from('client_messages').insert({
      company_id: companyId,
      client_id: clientUser.client_id,
      site_id: data.site_id || null,
      incident_id: data.incident_id || null,
      from_user_id: currentUser?.id,
      subject: data.subject,
      body: data.body,
      is_from_client: true,
      status: 'unread',
    });

    if (!insertResult.error) fetchData();
    return { error: insertResult.error };
  };

  const val: ClientPortalData = {
    sites,
    incidents,
    reports,
    activities,
    messages,
    currentShifts,
    clocking,
    todayShifts,
    obEntries,
    patrolSummary,
    siteNotices,
    siteHealth,
    unreadMessages,
    isLoading,
    companyId,
    refresh: fetchData,
    markMessageRead,
    sendMessage,
  };

  return React.createElement(Ctx.Provider, { value: val }, children);
}

export function useClientPortal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useClientPortal must be used within ClientPortalProvider');
  return ctx;
}