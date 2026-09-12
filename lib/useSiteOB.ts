'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardOBEntry {
  id: string;
  entry_type: string;
  entry: string;
  title: string | null;
  created_at: string;
  occurred_at: string;
  guard_name: string;
}

export function useSiteOB(siteId: string, companyId: string | null, enabled: boolean) {
  const [entries, setEntries] = useState<DashboardOBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOB = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data: obData, error: err } = await supabase
        .from('occurrence_books')
        .select('id, entry_type, entry, title, created_at, occurred_at, guard_id')
        .eq('site_id', siteId)
        .eq('client_visible', true)
        .order('occurred_at', { ascending: false })
        .limit(30);

      if (err) throw err;

      const guardIds = [...new Set((obData || []).map((o: any) => o.guard_id).filter(Boolean))] as string[];
      let guardsMap: Record<string, { first_name: string; last_name: string }> = {};
      if (guardIds.length > 0) {
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name')
          .in('id', guardIds);
        (guardsData || []).forEach((g: any) => {
          guardsMap[g.id] = { first_name: g.first_name, last_name: g.last_name };
        });
      }

      const getGuardName = (guardId: string | null) => {
        if (!guardId || !guardsMap[guardId]) return 'Officer';
        const g = guardsMap[guardId];
        return `${g.first_name} ${g.last_name}`.trim() || 'Officer';
      };

      setEntries((obData || []).map((o: any): DashboardOBEntry => ({
        id: o.id,
        entry_type: o.entry_type,
        entry: o.entry,
        title: o.title,
        created_at: o.created_at,
        occurred_at: o.occurred_at,
        guard_name: getGuardName(o.guard_id),
      })));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load OB entries');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchOB();
  }, [enabled, fetchOB]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(fetchOB, 30000);
    const handleVisible = () => {
      if (document.visibilityState === 'visible') fetchOB();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [enabled, fetchOB]);

  return { entries, loading, error, refresh: fetchOB };
}