'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardCheckpoint {
  id: string;
  name: string;
  checkpoint_code: string;
  is_active: boolean;
  allowed_radius_meters: number;
  lat: number | null;
  lng: number | null;
  description: string | null;
}

export interface DashboardPatrolLog {
  id: string;
  guard_id: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  checkpoints_total: number;
  checkpoints_completed: number;
  missed_checkpoints: number;
  gps_verified_count: number;
  out_of_radius_count: number;
  needs_review_count: number;
  duration_seconds: number | null;
  guard_name: string;
}

export interface DashboardPatrolScan {
  id: string;
  checkpoint_id: string;
  guard_id: string | null;
  scanned_at: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_accuracy: number | null;
  distance_from_checkpoint: number | null;
  scan_status: string | null;
  gps_verified: boolean;
  notes: string | null;
  checkpoint_name: string;
  checkpoint_code: string;
  guard_name: string;
}

export interface SitePatrolsData {
  checkpoints: DashboardCheckpoint[];
  logs: DashboardPatrolLog[];
  scans: DashboardPatrolScan[];
  completionPct: number;
  activeCheckpointsCount: number;
}

export function useSitePatrols(siteId: string, companyId: string | null, enabled: boolean) {
  const [data, setData] = useState<SitePatrolsData>({
    checkpoints: [],
    logs: [],
    scans: [],
    completionPct: 0,
    activeCheckpointsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatrols = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    try {
      const [checkpointsResult, patrolLogsResult, patrolScansResult] = await Promise.all([
        supabase
          .from('patrol_checkpoints')
          .select('id, name, checkpoint_code, is_active, allowed_radius_meters, lat, lng, description')
          .eq('site_id', siteId)
          .eq('company_id', companyId)
          .order('name'),

        supabase
          .from('patrol_logs')
          .select('id, guard_id, start_time, end_time, status, checkpoints_total, checkpoints_completed, missed_checkpoints, gps_verified_count, out_of_radius_count, needs_review_count, duration_seconds')
          .eq('site_id', siteId)
          .eq('company_id', companyId)
          .gte('start_time', todayStart)
          .order('start_time', { ascending: false })
          .limit(20),

        supabase
          .from('patrol_scans')
          .select('id, checkpoint_id, guard_id, scanned_at, gps_latitude, gps_longitude, gps_accuracy, distance_from_checkpoint, scan_status, gps_verified, notes')
          .eq('site_id', siteId)
          .eq('company_id', companyId)
          .gte('scanned_at', todayStart)
          .order('scanned_at', { ascending: false })
          .limit(50),
      ]);

      if (checkpointsResult.error) throw checkpointsResult.error;
      if (patrolLogsResult.error) throw patrolLogsResult.error;
      if (patrolScansResult.error) throw patrolScansResult.error;

      const checkpoints = (checkpointsResult.data || []) as DashboardCheckpoint[];

      const guardIdsFromLogs = [...new Set((patrolLogsResult.data || []).map((p: any) => p.guard_id).filter(Boolean))] as string[];
      const guardIdsFromScans = [...new Set((patrolScansResult.data || []).map((s: any) => s.guard_id).filter(Boolean))] as string[];
      const allGuardIds = [...new Set([...guardIdsFromLogs, ...guardIdsFromScans])];

      let guardsMap: Record<string, { first_name: string; last_name: string }> = {};
      if (allGuardIds.length > 0) {
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name')
          .in('id', allGuardIds);
        (guardsData || []).forEach((g: any) => {
          guardsMap[g.id] = { first_name: g.first_name, last_name: g.last_name };
        });
      }

      const getGuardName = (guardId: string | null) => {
        if (!guardId || !guardsMap[guardId]) return 'Officer';
        const g = guardsMap[guardId];
        return `${g.first_name} ${g.last_name}`.trim() || 'Officer';
      };

      const logs = (patrolLogsResult.data || []).map((p: any): DashboardPatrolLog => ({
        id: p.id,
        guard_id: p.guard_id,
        start_time: p.start_time,
        end_time: p.end_time,
        status: p.status || 'in_progress',
        checkpoints_total: p.checkpoints_total || 0,
        checkpoints_completed: p.checkpoints_completed || 0,
        missed_checkpoints: p.missed_checkpoints || 0,
        gps_verified_count: p.gps_verified_count || 0,
        out_of_radius_count: p.out_of_radius_count || 0,
        needs_review_count: p.needs_review_count || 0,
        duration_seconds: p.duration_seconds,
        guard_name: getGuardName(p.guard_id),
      }));

      const scans = (patrolScansResult.data || []).map((s: any): DashboardPatrolScan => {
        const cp = checkpoints.find((c) => c.id === s.checkpoint_id);
        return {
          id: s.id,
          checkpoint_id: s.checkpoint_id,
          guard_id: s.guard_id,
          scanned_at: s.scanned_at,
          gps_latitude: s.gps_latitude,
          gps_longitude: s.gps_longitude,
          gps_accuracy: s.gps_accuracy,
          distance_from_checkpoint: s.distance_from_checkpoint,
          scan_status: s.scan_status,
          gps_verified: s.gps_verified || false,
          notes: s.notes,
          checkpoint_name: cp?.name || 'Unknown checkpoint',
          checkpoint_code: cp?.checkpoint_code || '',
          guard_name: getGuardName(s.guard_id),
        };
      });

      const totalCompleted = logs.reduce((sum, l) => sum + (l.checkpoints_completed || 0), 0);
      const totalExpected = logs.reduce((sum, l) => sum + (l.checkpoints_total || 0), 0);
      const completionPct = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

      const active = checkpoints.filter((c) => c.is_active);

      setData({
        checkpoints,
        logs,
        scans,
        completionPct,
        activeCheckpointsCount: active.length,
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load patrol data');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchPatrols();
  }, [enabled, fetchPatrols]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(fetchPatrols, 30000);
    const handleVisible = () => {
      if (document.visibilityState === 'visible') fetchPatrols();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [enabled, fetchPatrols]);

  return { ...data, loading, error, refresh: fetchPatrols };
}