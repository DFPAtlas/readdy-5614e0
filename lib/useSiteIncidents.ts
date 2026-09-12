'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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

export interface SiteIncidentsData {
  incidents: DashboardIncident[];
  openIncidents: DashboardIncident[];
}

export function useSiteIncidents(siteId: string, companyId: string | null, enabled: boolean) {
  const [data, setData] = useState<SiteIncidentsData>({
    incidents: [],
    openIncidents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      const { data: incidentsData, error: err } = await supabase
        .from('incidents')
        .select('id, incident_type, severity, description, ai_rewritten_report, status, created_at, occurred_at, incident_number')
        .eq('site_id', siteId)
        .eq('client_visible', true)
        .gte('created_at', ninetyDaysAgo)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const incidents = (incidentsData || []) as DashboardIncident[];
      setData({
        incidents,
        openIncidents: incidents.filter((i) => i.status === 'open'),
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchIncidents();
  }, [enabled, fetchIncidents]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(fetchIncidents, 30000);
    const handleVisible = () => {
      if (document.visibilityState === 'visible') fetchIncidents();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [enabled, fetchIncidents]);

  return { ...data, loading, error, refresh: fetchIncidents };
}