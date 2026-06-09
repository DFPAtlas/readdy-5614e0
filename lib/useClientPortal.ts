'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
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
}

export interface ClientIncident {
  id: string;
  site_id: string;
  guard_id: string;
  incident_type: string;
  severity: string;
  description: string;
  ai_rewritten_report: string | null;
  status: string;
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

interface ClientPortalData {
  sites: ClientSite[];
  incidents: ClientIncident[];
  reports: ClientReport[];
  activities: ClientActivity[];
  messages: ClientMessage[];
  currentShifts: CurrentShift[];
  unreadMessages: number;
  isLoading: boolean;
  clocking: ClockingLog[];
  refresh: () => void;
  markMessageRead: (id: string) => Promise<void>;
  sendMessage: (data: { subject: string; body: string; site_id?: string; incident_id?: string }) => Promise<{ error: any }>;
}

const Ctx = createContext<ClientPortalData | undefined>(undefined);

export function ClientPortalProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, companyId } = useAuth();
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [incidents, setIncidents] = useState<ClientIncident[]>([]);
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [currentShifts, setCurrentShifts] = useState<CurrentShift[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [clocking, setClocking] = useState<ClockingLog[]>([]);

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
      .select('id, site_name, address, risk_level, latitude, longitude, client_id, company_id')
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
        .select('id, site_id, guard_id, incident_type, severity, description, ai_rewritten_report, status, created_at, occurred_at, resolved_at')
        .in('site_id', siteIds)
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
        .eq('report_type', 'weekly_site_report')
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
        .select('id, site_id, started_at, completed_at')
        .in('site_id', siteIds)
        .not('completed_at', 'is', null)
        .gte('completed_at', weekAgo)
        .order('completed_at', { ascending: false })
        .limit(5);

      (patrolData || []).forEach((p) => {
        activityList.push({
          id: `patrol-${p.id}`,
          type: 'patrol',
          title: 'Patrol completed',
          description: 'Security patrol completed successfully',
          site_name: mySites.find((s) => s.id === p.site_id)?.site_name || '',
          site_id: p.site_id,
          occurred_at: p.completed_at,
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
  }, [currentUser, companyId]);

  useEffect(() => {
    if (currentUser && companyId) {
      fetchData();
    }
  }, [currentUser, companyId, fetchData]);

  useEffect(() => {
    if (!currentUser || !companyId) return;

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
    unreadMessages,
    isLoading,
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