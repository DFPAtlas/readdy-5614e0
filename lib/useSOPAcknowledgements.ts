'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface SOPAcknowledgement {
  id: string;
  company_id: string;
  sop_id: string;
  guard_id: string;
  site_id: string | null;
  version_number: number;
  acknowledged_at: string;
  device_info: string | null;
  ip_address: string | null;
  created_at: string;
  sop_title?: string;
  guard_name?: string;
  site_name?: string;
}

export function useSOPAcknowledgements(sopId?: string, guardId?: string) {
  const { companyId } = useAuth();
  const [acks, setAcks] = useState<SOPAcknowledgement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let q = supabase
      .from('sop_acknowledgements')
      .select('*, built_sops:sop_id(title), guards:guard_id(first_name,last_name), sites:site_id(site_name)')
      .eq('company_id', companyId)
      .order('acknowledged_at', { ascending: false });

    if (sopId) q = q.eq('sop_id', sopId);
    if (guardId) q = q.eq('guard_id', guardId);

    const { data, error: err } = await q;
    if (err) {
      setError(err.message);
    } else {
      const mapped = (data || []).map((d: any) => ({
        ...d,
        sop_title: d.built_sops?.title,
        guard_name: d.guards ? `${d.guards.first_name} ${d.guards.last_name}` : null,
        site_name: d.sites?.site_name,
      }));
      setAcks(mapped);
    }
    setLoading(false);
  }, [companyId, sopId, guardId]);

  useEffect(() => {
    if (!companyId) return;
    load();
  }, [companyId, sopId, guardId, load]);

  const hasAcknowledged = useCallback(async (sopId: string, guardId: string, versionNumber?: number) => {
    let q = supabase
      .from('sop_acknowledgements')
      .select('id')
      .eq('sop_id', sopId)
      .eq('guard_id', guardId);

    if (versionNumber !== undefined) {
      q = q.eq('version_number', versionNumber);
    }

    const { data } = await q.maybeSingle();
    return !!data;
  }, []);

  const acknowledge = async (sopId: string, guardId: string, siteId: string | null, versionNumber: number) => {
    if (!companyId) return { error: new Error('Not authenticated') };

    const deviceInfo = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

    const { data, error: err } = await supabase
      .from('sop_acknowledgements')
      .insert({
        company_id: companyId,
        sop_id: sopId,
        guard_id: guardId,
        site_id: siteId,
        version_number: versionNumber,
        acknowledged_at: new Date().toISOString(),
        device_info: deviceInfo,
        ip_address: null,
      })
      .select()
      .maybeSingle();

    if (!err) await load();
    return { data, error: err };
  };

  const stats = useMemo(() => {
    if (!companyId) return null;
    const totalGuards = new Set(acks.map(a => a.guard_id)).size;
    const ackedGuards = new Set(acks.filter(a => !!a.acknowledged_at).map(a => a.guard_id)).size;
    const totalAcks = acks.length;
    const pendingCount = totalGuards > 0 ? totalGuards - ackedGuards : 0;
    const ackRate = totalGuards > 0 ? (ackedGuards / totalGuards) * 100 : 0;
    return {
      total_guards: totalGuards,
      acked_guards: ackedGuards,
      pending_count: pendingCount,
      total_acks: totalAcks,
      acknowledgement_rate: ackRate,
    };
  }, [acks, companyId]);

  return {
    acks, loading, error, refetch: load, stats,
    hasAcknowledged, acknowledge,
  };
}