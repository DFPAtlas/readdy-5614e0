'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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

export function useSiteReports(siteId: string, companyId: string | null, enabled: boolean) {
  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('reports')
        .select('id, title, file_url, status, report_type, ai_summary, generated_at, period_start, period_end')
        .eq('site_id', siteId)
        .in('report_type', ['weekly_site', 'incident', 'patrol_summary', 'compliance'])
        .eq('client_visible', true)
        .order('generated_at', { ascending: false });

      if (err) throw err;

      setReports(((data || []) as any[]).filter((r: any) => r.status === 'sent'));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchReports();
  }, [enabled, fetchReports]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(fetchReports, 30000);
    const handleVisible = () => {
      if (document.visibilityState === 'visible') fetchReports();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [enabled, fetchReports]);

  return { reports, loading, error, refresh: fetchReports };
}