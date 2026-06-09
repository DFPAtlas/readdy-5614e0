'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface PendingLeave {
  id: string;
  guard_id: string;
  first_name: string | null;
  last_name: string | null;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

export function usePendingLeave() {
  const { companyId } = useAuth();
  const [pending, setPending] = useState<PendingLeave[]>([]);
  const [history, setHistory] = useState<PendingLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);

    const { data: guards } = await supabase
      .from('guards')
      .select('id, first_name, last_name')
      .eq('company_id', companyId);

    const guardIds = (guards || []).map((g) => g.id);
    if (guardIds.length === 0) {
      setPending([]);
      setHistory([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('guard_time_off')
      .select('id, guard_id, start_date, end_date, reason, status, created_at')
      .in('guard_id', guardIds)
      .order('created_at', { ascending: false });

    const rows = (data || []).map((t: any) => {
      const g = guards?.find((x) => x.id === t.guard_id);
      return {
        id: t.id,
        guard_id: t.guard_id,
        first_name: g?.first_name || null,
        last_name: g?.last_name || null,
        start_date: t.start_date,
        end_date: t.end_date,
        reason: t.reason || 'Time off',
        status: t.status || 'pending',
        created_at: t.created_at,
      };
    });

    setPending(rows.filter((r) => r.status === 'pending'));
    setHistory(rows.filter((r) => r.status !== 'pending'));
    setLoading(false);
  }, [companyId]);

  useEffect(() => { if (companyId) load(); }, [companyId, load]);

  const approve = useCallback(async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('guard_time_off')
      .update({ approved: true, status: 'approved' })
      .eq('id', id);
    setActionLoading(null);
    if (!error) await load();
    return { error };
  }, [load]);

  const reject = useCallback(async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('guard_time_off')
      .update({ approved: false, status: 'rejected' })
      .eq('id', id);
    setActionLoading(null);
    if (!error) await load();
    return { error };
  }, [load]);

  return { pending, history, loading, actionLoading, approve, reject, refetch: load };
}