'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface AttendanceLog {
  id: string;
  company_id: string | null;
  shift_id: string | null;
  guard_id: string | null;
  clock_in: string | null;
  clock_out: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  created_at: string | null;
  guard_name?: string | null;
  site_name?: string | null;
  shift_start?: string | null;
  shift_end?: string | null;
}

export function useAttendanceLogs(siteId?: string | null, guardId?: string | null) {
  const { companyId } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    let query = supabase
      .from('attendance_logs')
      .select(`
        *,
        guards!guard_id(first_name, last_name),
        shifts!shift_id(start_time, end_time, site_id, sites!inner(site_name))
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (siteId) {
      query = query.eq('shifts.site_id', siteId);
    }
    if (guardId) {
      query = query.eq('guard_id', guardId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setLogs([]);
    } else {
      setLogs((data || []).map((row: any) => ({
        id: row.id,
        company_id: row.company_id,
        shift_id: row.shift_id,
        guard_id: row.guard_id,
        clock_in: row.clock_in,
        clock_out: row.clock_out,
        clock_in_lat: row.clock_in_lat,
        clock_in_lng: row.clock_in_lng,
        clock_out_lat: row.clock_out_lat,
        clock_out_lng: row.clock_out_lng,
        created_at: row.created_at,
        guard_name: row.guards?.first_name && row.guards?.last_name
          ? `${row.guards.first_name} ${row.guards.last_name}`
          : row.guards?.first_name || row.guards?.last_name || null,
        site_name: row.shifts?.sites?.site_name || null,
        shift_start: row.shifts?.start_time || null,
        shift_end: row.shifts?.end_time || null,
      })));
    }
    setLoading(false);
  }, [companyId, siteId, guardId]);

  useEffect(() => {
    if (!companyId) return;
    load();
  }, [companyId, load]);

  useEffect(() => {
    if (!companyId) return;
    const interval = setInterval(() => load(), 30000);
    return () => clearInterval(interval);
  }, [companyId, load]);

  const bookOn = async (shiftId: string, guardId: string, lat?: number, lng?: number) => {
    if (!companyId) return { error: new Error('No company') };

    const { data: existing } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('shift_id', shiftId)
      .eq('guard_id', guardId)
      .is('clock_out', null)
      .maybeSingle();

    if (existing) return { error: new Error('Already booked on for this shift') };

    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({
        company_id: companyId,
        shift_id: shiftId,
        guard_id: guardId,
        clock_in: new Date().toISOString(),
        clock_in_lat: lat || null,
        clock_in_lng: lng || null,
      })
      .select()
      .maybeSingle();

    if (!error) load();
    return { data, error };
  };

  const bookOff = async (logId: string, lat?: number, lng?: number) => {
    const { data: existing } = await supabase
      .from('attendance_logs')
      .select('id, clock_out')
      .eq('id', logId)
      .maybeSingle();

    if (!existing) return { error: new Error('Attendance record not found') };
    if (existing.clock_out) return { error: new Error('Already booked off') };

    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        clock_out: new Date().toISOString(),
        clock_out_lat: lat || null,
        clock_out_lng: lng || null,
      })
      .eq('id', logId)
      .select()
      .maybeSingle();

    if (!error) load();
    return { data, error };
  };

  const manualCorrect = async (logId: string, updates: {
    clock_in?: string;
    clock_out?: string;
    reason?: string;
  }) => {
    const payload: any = {};
    if (updates.clock_in) payload.clock_in = updates.clock_in;
    if (updates.clock_out !== undefined) payload.clock_out = updates.clock_out || null;

    const { data, error } = await supabase
      .from('attendance_logs')
      .update(payload)
      .eq('id', logId)
      .select()
      .maybeSingle();

    if (!error) load();
    return { data, error };
  };

  return {
    logs,
    loading,
    error,
    refetch: load,
    bookOn,
    bookOff,
    manualCorrect,
  };
}