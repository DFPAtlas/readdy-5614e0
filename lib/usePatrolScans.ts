'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface PatrolScan {
  id: string;
  company_id: string;
  site_id: string;
  checkpoint_id: string;
  guard_id: string | null;
  rota_id: string | null;
  scanned_at: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_accuracy: number | null;
  distance_from_checkpoint: number | null;
  status: string;
  device_info: string | null;
  notes: string | null;
  checkpoint_name?: string;
  checkpoint_code?: string;
  site_name?: string;
  guard_name?: string;
  scheduled_patrol_time?: string | null;
}

export function usePatrolScans(siteId?: string | null, checkpointId?: string | null) {
  const { companyId } = useAuth();
  const [scans, setScans] = useState<PatrolScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScans = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    let query = supabase
      .from('patrol_scans')
      .select(`
        *,
        patrol_checkpoints(name, checkpoint_code),
        sites(site_name),
        guards(first_name, last_name)
      `)
      .eq('company_id', companyId)
      .order('scanned_at', { ascending: false })
      .limit(500);

    if (siteId) query = query.eq('site_id', siteId);
    if (checkpointId) query = query.eq('checkpoint_id', checkpointId);

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
      setScans([]);
    } else {
      setScans((data || []).map((row: any) => ({
        ...row,
        checkpoint_name: row.patrol_checkpoints?.name || '',
        checkpoint_code: row.patrol_checkpoints?.checkpoint_code || '',
        site_name: row.sites?.site_name || '',
        guard_name: row.guards?.first_name && row.guards?.last_name
          ? `${row.guards.first_name} ${row.guards.last_name}`
          : row.guards?.first_name || row.guards?.last_name || 'Unknown',
      })));
    }
    setLoading(false);
  }, [companyId, siteId, checkpointId]);

  useEffect(() => {
    if (!companyId) return;
    loadScans();
    const interval = setInterval(() => loadScans(), 30000);
    return () => clearInterval(interval);
  }, [companyId, loadScans]);

  return { scans, loading, error, refetch: loadScans };
}

export function useGuardPatrolScans(guardId: string | null) {
  const { companyId } = useAuth();
  const [scans, setScans] = useState<PatrolScan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScans = useCallback(async () => {
    if (!guardId || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('patrol_scans')
      .select(`
        *,
        patrol_checkpoints(name, checkpoint_code),
        sites(site_name)
      `)
      .eq('guard_id', guardId)
      .eq('company_id', companyId)
      .order('scanned_at', { ascending: false })
      .limit(50);
    setScans((data || []).map((row: any) => ({
      ...row,
      checkpoint_name: row.patrol_checkpoints?.name || '',
      checkpoint_code: row.patrol_checkpoints?.checkpoint_code || '',
      site_name: row.sites?.site_name || '',
    })));
    setLoading(false);
  }, [guardId, companyId]);

  useEffect(() => {
    if (!guardId || !companyId) return;
    loadScans();
  }, [guardId, companyId, loadScans]);

  return { scans, loading, refetch: loadScans };
}