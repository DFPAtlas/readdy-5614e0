'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface OpsSummary {
  activeGuards: number;
  sitesCovered: number;
  totalSites: number;
  openIncidents: number;
  criticalIncidents: number;
  welfareAlerts: number;
  missedCheckCalls: number;
  patrolCompletion: number;
  gpsTrackedGuards: number;
  gpsOfflineGuards: number;
  unreadNotifications: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  atRiskSubscriptions: number;
  mrrPence: number;
  monthlyRevenuePence: number;
}

export interface WelfareAlert {
  id: string;
  guardName: string;
  siteName: string;
  companyName: string;
  type: string;
  severity: string;
  description: string;
  timestamp: string;
}

export interface PatrolStatus {
  siteName: string;
  companyName: string;
  completed: number;
  total: number;
  percentage: number;
  status: string;
  lastPatrolAt: string | null;
}

export interface GPSStatus {
  guardId: string;
  guardName: string;
  siteName: string;
  companyName: string;
  lastLat: number | null;
  lastLng: number | null;
  lastCheckIn: string | null;
  online: boolean;
}

export interface ClientNotification {
  id: string;
  companyName: string;
  siteName: string;
  type: string;
  title: string;
  severity: string;
  createdAt: string;
}

export interface SubscriptionInfo {
  companyId: string;
  companyName: string;
  planName: string;
  status: string;
  trialEndsAt: string | null;
  periodEnd: string | null;
}

export interface AIInsight {
  id: string;
  category: 'high_risk_site' | 'missing_patrol' | 'staff_shortage' | 'compliance_failure';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  siteName?: string;
  companyName?: string;
}

export interface OpsCompany {
  id: string;
  name: string;
  status: string;
}

export interface OpsSite {
  id: string;
  site_name: string;
  company_id: string;
  company_name: string;
}

export interface UseOperationsCommandReturn {
  summary: OpsSummary;
  welfareAlerts: WelfareAlert[];
  patrolStatuses: PatrolStatus[];
  gpsStatuses: GPSStatus[];
  clientNotifications: ClientNotification[];
  subscriptions: SubscriptionInfo[];
  aiInsights: AIInsight[];
  companies: OpsCompany[];
  sites: OpsSite[];
  selectedCompanyId: string | null;
  selectedSiteId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  setSelectedSiteId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

const defaultSummary: OpsSummary = {
  activeGuards: 0,
  sitesCovered: 0,
  totalSites: 0,
  openIncidents: 0,
  criticalIncidents: 0,
  welfareAlerts: 0,
  missedCheckCalls: 0,
  patrolCompletion: 0,
  gpsTrackedGuards: 0,
  gpsOfflineGuards: 0,
  unreadNotifications: 0,
  activeSubscriptions: 0,
  trialingSubscriptions: 0,
  atRiskSubscriptions: 0,
  mrrPence: 0,
  monthlyRevenuePence: 0,
};

export function useOperationsCommand(): UseOperationsCommandReturn {
  const { profile, companyId } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  const [summary, setSummary] = useState<OpsSummary>(defaultSummary);
  const [welfareAlerts, setWelfareAlerts] = useState<WelfareAlert[]>([]);
  const [patrolStatuses, setPatrolStatuses] = useState<PatrolStatus[]>([]);
  const [gpsStatuses, setGPSStatuses] = useState<GPSStatus[]>([]);
  const [clientNotifications, setClientNotifications] = useState<ClientNotification[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [companies, setCompanies] = useState<OpsCompany[]>([]);
  const [sites, setSites] = useState<OpsSite[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLoaded = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!profile?.id) return;

    try {
      if (!hasLoaded.current) setLoading(true);
      setError(null);

      const now = new Date().toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStartIso = todayStart.toISOString();

      let allowedCompanyIds: string[] = [];

      if (isSuperAdmin) {
        const { data: allCompanies } = await supabase
          .from('companies')
          .select('id, name, account_status')
          .order('name');
        if (allCompanies) {
          setCompanies(allCompanies.map((c) => ({
            id: c.id,
            name: c.name || 'Unknown',
            status: c.account_status || 'active',
          })));
          if (selectedCompanyId) {
            allowedCompanyIds = [selectedCompanyId];
          } else {
            allowedCompanyIds = allCompanies.map((c) => c.id);
          }
        }
      } else if (companyId) {
        allowedCompanyIds = [companyId];
        const { data: compData } = await supabase
          .from('companies')
          .select('id, name, account_status')
          .eq('id', companyId)
          .maybeSingle();
        if (compData) {
          setCompanies([{
            id: compData.id,
            name: compData.name || 'Company',
            status: compData.account_status || 'active',
          }]);
        }
      }

      if (allowedCompanyIds.length === 0) {
        setLoading(false);
        hasLoaded.current = true;
        return;
      }

      const [
        shiftsRes, sitesRes, incidentsRes, sessionsRes,
        patrolRes, notificationsRes, subsRes, mrrRes, revenueRes,
        wellbeingRes, riskRes, openShiftsRes, complianceRes,
      ] = await Promise.allSettled([
        supabase.from('shifts')
          .select('id, site_id, guard_id, status, company_id')
          .in('company_id', allowedCompanyIds)
          .eq('status', 'active')
          .lte('start_time', now)
          .gte('end_time', now),
        supabase.from('sites')
          .select('id, site_name, company_id, risk_level')
          .in('company_id', allowedCompanyIds),
        supabase.from('incidents')
          .select('id, severity, status, site_id, company_id')
          .in('company_id', allowedCompanyIds)
          .in('status', ['open', 'reviewing']),
        supabase.from('lone_worker_sessions')
          .select('id, guard_id, site_id, company_id, missed_check_ins, alarm_triggered_at, alarm_acknowledged_at, escalation_level, last_lat, last_lng, last_check_in_at, session_start')
          .in('company_id', allowedCompanyIds)
          .gte('session_start', todayStartIso)
          .order('session_start', { ascending: false }),
        supabase.from('patrol_logs')
          .select('id, site_id, company_id, checkpoints_total, checkpoints_completed, status, end_time')
          .in('company_id', allowedCompanyIds)
          .gte('start_time', todayStartIso),
        supabase.from('notifications')
          .select('id, company_id, title, type, severity, created_at')
          .in('company_id', allowedCompanyIds)
          .is('read_at', null)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('companies')
          .select('id, name, subscription_plan, plan_name, account_status, subscription_status, trial_ends_at, subscription_period_end')
          .in('id', allowedCompanyIds),
        supabase.from('v_billing_mrr_current').select('*'),
        supabase.from('v_billing_revenue_monthly')
          .select('*')
          .order('month', { ascending: false })
          .limit(1),
        supabase.from('guard_wellbeing_checkins')
          .select('id, guard_id, site_id, company_id, flagged_for_review, overall_score, created_at')
          .in('company_id', allowedCompanyIds)
          .gte('created_at', todayStartIso),
        supabase.from('site_risk_scores')
          .select('site_id, score, level, ai_narrative, company_id')
          .in('company_id', allowedCompanyIds)
          .order('score', { ascending: false })
          .limit(20),
        supabase.from('shifts')
          .select('id, site_id, company_id')
          .in('company_id', allowedCompanyIds)
          .eq('status', 'scheduled')
          .is('guard_id', null)
          .gte('start_time', now)
          .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('compliance_documents')
          .select('id, company_id, entity_type, entity_id, status')
          .in('company_id', allowedCompanyIds)
          .eq('status', 'expired'),
      ]);

      const getData = (result: PromiseSettledResult<any>) =>
        result.status === 'fulfilled' ? (result.value.data || []) : [];

      const shifts = getData(shiftsRes);
      const allSites = getData(sitesRes);
      const incidents = getData(incidentsRes);
      const sessions = getData(sessionsRes);
      const patrols = getData(patrolRes);
      const notifs = getData(notificationsRes);
      const subs = getData(subsRes);
      const mrrData = getData(mrrRes);
      const revenueData = getData(revenueRes);
      const wellbeing = getData(wellbeingRes);
      const riskScores = getData(riskRes);
      const openShifts = getData(openShiftsRes);
      const expiredCompliance = getData(complianceRes);

      const activeShifts = shifts.filter((s: any) => s.guard_id);
      const activeGuardIds = [...new Set(activeShifts.map((s: any) => s.guard_id).filter(Boolean))];

      let guardMap: Record<string, { first_name: string; last_name: string }> = {};
      let siteMap: Record<string, string> = {};
      let companyMap: Record<string, string> = {};

      if (activeGuardIds.length > 0) {
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name, company_id')
          .in('id', activeGuardIds);
        (guardsData || []).forEach((g: any) => {
          guardMap[g.id] = { first_name: g.first_name || '', last_name: g.last_name || '' };
        });
      }

      allSites.forEach((s: any) => { siteMap[s.id] = s.site_name || 'Unknown'; });
      const compsForMap = subs.length > 0 ? subs : companies;
      compsForMap.forEach((c: any) => { companyMap[c.id] = c.name || 'Unknown'; });

      let filteredSites = allSites;
      let filteredShifts = activeShifts;
      let filteredIncidents = incidents;
      let filteredPatrols = patrols;
      let filteredSessions = sessions;

      if (selectedSiteId) {
        filteredSites = allSites.filter((s: any) => s.id === selectedSiteId);
        filteredShifts = activeShifts.filter((s: any) => s.site_id === selectedSiteId);
        filteredIncidents = incidents.filter((i: any) => i.site_id === selectedSiteId);
        filteredPatrols = patrols.filter((p: any) => p.site_id === selectedSiteId);
        filteredSessions = sessions.filter((s: any) => s.site_id === selectedSiteId);
      }

      const openIncidentsList = filteredIncidents.filter(
        (i: any) => i.status === 'open' || i.status === 'reviewing'
      );
      const criticalIncidents = openIncidentsList.filter(
        (i: any) => i.severity === 'critical' || i.severity === 'high'
      );

      const welfareFlagged = wellbeing.filter((w: any) => w.flagged_for_review);
      const alarmSessions = filteredSessions.filter(
        (s: any) => s.alarm_triggered_at && !s.alarm_acknowledged_at
      );
      const missedChecks = filteredSessions.reduce(
        (sum: number, s: any) => sum + (s.missed_check_ins || 0), 0
      );

      const totalCP = filteredPatrols.reduce(
        (sum: number, p: any) => sum + (p.checkpoints_total || 0), 0
      );
      const completedCP = filteredPatrols.reduce(
        (sum: number, p: any) => sum + (p.checkpoints_completed || 0), 0
      );
      const patrolComp = totalCP > 0 ? Math.round((completedCP / totalCP) * 100) : 100;

      const gpsOnline = filteredSessions.filter(
        (s: any) =>
          s.last_lat &&
          s.last_lng &&
          s.last_check_in_at &&
          new Date(s.last_check_in_at).getTime() > Date.now() - 30 * 60 * 1000
      );
      const gpsOffline = filteredSessions.filter(
        (s: any) =>
          !s.last_lat ||
          !s.last_lng ||
          !s.last_check_in_at ||
          new Date(s.last_check_in_at).getTime() <= Date.now() - 30 * 60 * 1000
      );

      let activeSubs = 0;
      let trialingSubs = 0;
      let atRiskSubs = 0;
      if (isSuperAdmin && !selectedCompanyId) {
        const mrrRow = mrrData.find((r: any) => r.subscription_billing === 'stripe');
        activeSubs = Number(mrrRow?.active_subs || 0);
        trialingSubs = Number(mrrRow?.trialing_subs || 0);
        atRiskSubs = Number(mrrRow?.at_risk_subs || 0);
      } else {
        subs.forEach((s: any) => {
          if (s.subscription_status === 'active') activeSubs++;
          else if (s.subscription_status === 'trialing') trialingSubs++;
          else if (s.subscription_status === 'past_due' || s.subscription_status === 'unpaid') atRiskSubs++;
        });
      }

      const monthlyRev = revenueData.length > 0 ? Number(revenueData[0].gross_pence || 0) : 0;

      setSummary({
        activeGuards: filteredShifts.length,
        sitesCovered: new Set(filteredShifts.map((s: any) => s.site_id)).size,
        totalSites: filteredSites.length,
        openIncidents: openIncidentsList.length,
        criticalIncidents: criticalIncidents.length,
        welfareAlerts: welfareFlagged.length + alarmSessions.length,
        missedCheckCalls: missedChecks,
        patrolCompletion: patrolComp,
        gpsTrackedGuards: gpsOnline.length,
        gpsOfflineGuards: gpsOffline.length,
        unreadNotifications: notifs.length,
        activeSubscriptions: activeSubs,
        trialingSubscriptions: trialingSubs,
        atRiskSubscriptions: atRiskSubs,
        mrrPence: 0,
        monthlyRevenuePence: monthlyRev,
      });

      const sessionGuardIds = [
        ...new Set(filteredSessions.map((s: any) => s.guard_id).filter(Boolean)),
      ];
      let sessionGuardMap: Record<string, { first_name: string; last_name: string }> = {};
      if (sessionGuardIds.length > 0) {
        const { data: sgData } = await supabase
          .from('guards')
          .select('id, first_name, last_name')
          .in('id', sessionGuardIds);
        (sgData || []).forEach((g: any) => {
          sessionGuardMap[g.id] = { first_name: g.first_name || '', last_name: g.last_name || '' };
        });
      }

      const alertsList: WelfareAlert[] = [
        ...alarmSessions.map((s: any) => {
          const g = sessionGuardMap[s.guard_id] || { first_name: 'Guard', last_name: '' };
          return {
            id: `alarm-${s.id}`,
            guardName: `${g.first_name} ${g.last_name}`.trim() || 'Unknown Guard',
            siteName: siteMap[s.site_id] || 'Unknown',
            companyName: companyMap[s.company_id] || 'Unknown',
            type: 'panic_alarm',
            severity: 'critical',
            description: `Panic alarm triggered — escalation level ${s.escalation_level || 0}`,
            timestamp: s.alarm_triggered_at || s.session_start,
          };
        }),
        ...welfareFlagged.map((w: any) => {
          const g = sessionGuardMap[w.guard_id] || { first_name: 'Guard', last_name: '' };
          return {
            id: `welfare-${w.id}`,
            guardName: `${g.first_name} ${g.last_name}`.trim() || 'Unknown Guard',
            siteName: siteMap[w.site_id] || 'Unknown',
            companyName: companyMap[w.company_id] || 'Unknown',
            type: 'wellbeing_flagged',
            severity: 'high',
            description: `Wellbeing check flagged — score ${w.overall_score || 'N/A'}`,
            timestamp: w.created_at || now,
          };
        }),
      ];
      alertsList.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setWelfareAlerts(alertsList.slice(0, 20));

      const patrolList: PatrolStatus[] = filteredPatrols.map((p: any) => ({
        siteName: siteMap[p.site_id] || 'Unknown',
        companyName: companyMap[p.company_id] || 'Unknown',
        completed: p.checkpoints_completed || 0,
        total: p.checkpoints_total || 0,
        percentage:
          p.checkpoints_total > 0
            ? Math.round(((p.checkpoints_completed || 0) / p.checkpoints_total) * 100)
            : 0,
        status: p.status || 'unknown',
        lastPatrolAt: p.end_time || null,
      }));
      patrolList.sort((a, b) => a.percentage - b.percentage);
      setPatrolStatuses(patrolList.slice(0, 15));

      const gpsList: GPSStatus[] = filteredSessions.map((s: any) => {
        const g = sessionGuardMap[s.guard_id] || { first_name: 'Guard', last_name: '' };
        return {
          guardId: s.guard_id,
          guardName: `${g.first_name} ${g.last_name}`.trim() || 'Unknown Guard',
          siteName: siteMap[s.site_id] || 'Unknown',
          companyName: companyMap[s.company_id] || 'Unknown',
          lastLat: s.last_lat,
          lastLng: s.last_lng,
          lastCheckIn: s.last_check_in_at,
          online:
            s.last_check_in_at &&
            new Date(s.last_check_in_at).getTime() > Date.now() - 30 * 60 * 1000,
        };
      });
      setGPSStatuses(gpsList.slice(0, 20));

      setClientNotifications(
        notifs.slice(0, 30).map((n: any) => ({
          id: n.id,
          companyName: companyMap[n.company_id] || 'Unknown',
          siteName: '',
          type: n.type || 'general',
          title: n.title || '',
          severity: n.severity || 'info',
          createdAt: n.created_at,
        }))
      );

      setSubscriptions(
        subs.map((s: any) => ({
          companyId: s.id,
          companyName: s.name || 'Unknown',
          planName: s.plan_name || s.subscription_plan || 'Unknown',
          status: s.subscription_status || s.account_status || 'unknown',
          trialEndsAt: s.trial_ends_at,
          periodEnd: s.subscription_period_end,
        }))
      );

      const dedupedRisks: Record<string, any> = {};
      riskScores.forEach((r: any) => {
        if (!dedupedRisks[r.site_id] || r.score > (dedupedRisks[r.site_id].score || 0)) {
          dedupedRisks[r.site_id] = r;
        }
      });

      const insights: AIInsight[] = [];

      Object.values(dedupedRisks)
        .filter((r: any) => r.level === 'high' || r.level === 'critical')
        .slice(0, 5)
        .forEach((r: any) => {
          insights.push({
            id: `risk-${r.site_id}`,
            category: 'high_risk_site',
            title: `High-risk site: ${siteMap[r.site_id] || 'Unknown'}`,
            description: r.ai_narrative || `Risk score: ${r.score}/100`,
            severity: r.level === 'critical' ? 'critical' : 'high',
            siteName: siteMap[r.site_id],
            companyName: companyMap[r.company_id] || 'Unknown',
          });
        });

      filteredPatrols
        .filter(
          (p: any) =>
            p.checkpoints_total > 0 && (p.checkpoints_completed || 0) === 0
        )
        .slice(0, 5)
        .forEach((p: any) => {
          insights.push({
            id: `missed-patrol-${p.id}`,
            category: 'missing_patrol',
            title: `Missing patrol: ${siteMap[p.site_id] || 'Unknown'}`,
            description: `0 of ${p.checkpoints_total} checkpoints completed`,
            severity: 'high',
            siteName: siteMap[p.site_id],
            companyName: companyMap[p.company_id] || 'Unknown',
          });
        });

      openShifts.slice(0, 5).forEach((s: any) => {
        insights.push({
          id: `shortage-${s.id}`,
          category: 'staff_shortage',
          title: `Staff shortage: ${siteMap[s.site_id] || 'Unknown'}`,
          description: 'Unfilled shift — no guard assigned',
          severity: 'medium',
          siteName: siteMap[s.site_id],
          companyName: companyMap[s.company_id] || 'Unknown',
        });
      });

      expiredCompliance.slice(0, 5).forEach((c: any) => {
        const cSiteId = c.entity_type === 'site' ? c.entity_id : null;
        insights.push({
          id: `compliance-${c.id}`,
          category: 'compliance_failure',
          title: `Compliance expired: ${siteMap[cSiteId] || 'Unknown'}`,
          description: 'Document expired and needs renewal',
          severity: 'high',
          siteName: siteMap[cSiteId],
          companyName: companyMap[c.company_id] || 'Unknown',
        });
      });

      const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      insights.sort((a, b) => (sevOrder[a.severity] || 3) - (sevOrder[b.severity] || 3));

      setAIInsights(insights.slice(0, 12));

      const processedSites: OpsSite[] = allSites.map((s: any) => ({
        id: s.id,
        site_name: s.site_name || 'Unknown',
        company_id: s.company_id,
        company_name: companyMap[s.company_id] || 'Unknown',
      }));
      setSites(processedSites);

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load operations data');
    } finally {
      setLoading(false);
      hasLoaded.current = true;
    }
  }, [profile?.id, companyId, isSuperAdmin, selectedCompanyId, selectedSiteId, companies]);

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  useEffect(() => {
    if (!isSuperAdmin && !companyId) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    channels.push(
      supabase
        .channel('ops-cmd-shifts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => fetchAll())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('ops-cmd-incidents')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => fetchAll())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('ops-cmd-sessions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lone_worker_sessions' }, () => fetchAll())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('ops-cmd-patrols')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patrol_logs' }, () => fetchAll())
        .subscribe()
    );
    channels.push(
      supabase
        .channel('ops-cmd-notifs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => fetchAll())
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [isSuperAdmin, companyId, fetchAll]);

  return {
    summary,
    welfareAlerts,
    patrolStatuses,
    gpsStatuses,
    clientNotifications,
    subscriptions,
    aiInsights,
    companies,
    sites,
    selectedCompanyId,
    selectedSiteId,
    setSelectedCompanyId: (id) => {
      setSelectedCompanyId(id);
      setSelectedSiteId(null);
    },
    setSelectedSiteId,
    loading,
    error,
    lastUpdated,
    refetch: fetchAll,
  };
}