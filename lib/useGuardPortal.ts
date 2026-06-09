'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface GuardShift {
  id: string;
  site_id: string;
  guard_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  site: {
    id: string;
    site_name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    check_call_interval: number | null;
    assignment_instructions: string | null;
    client_name: string | null;
    client_contact_name: string | null;
    client_contact_email: string | null;
    site_contact_phone: string | null;
  } | null;
}

export interface AttendanceLog {
  id: string;
  shift_id: string;
  guard_id: string;
  clock_in: string | null;
  clock_out: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
}

export interface PatrolLog {
  id: string;
  site_id: string;
  shift_id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  checkpoints_total: number;
  checkpoints_completed: number;
}

export interface GuardPortalState {
  todayShift: GuardShift | null;
  nextShift: GuardShift | null;
  activeAttendance: AttendanceLog | null;
  activePatrol: PatrolLog | null;
  guardId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGuardPortal(userId: string | null, companyId: string | null): GuardPortalState {
  const [todayShift, setTodayShift] = useState<GuardShift | null>(null);
  const [nextShift, setNextShift] = useState<GuardShift | null>(null);
  const [activeAttendance, setActiveAttendance] = useState<AttendanceLog | null>(null);
  const [activePatrol, setActivePatrol] = useState<PatrolLog | null>(null);
  const [guardId, setGuardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: guardData } = await supabase
        .from('guards')
        .select('id')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!guardData) {
        setLoading(false);
        return;
      }
      const gId = guardData.id;
      setGuardId(gId);

      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      const sevenDaysLater = new Date(now);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      const [shiftsRes, attendanceRes, patrolRes] = await Promise.all([
        supabase
          .from('shifts')
          .select('id, site_id, guard_id, start_time, end_time, status, notes')
          .eq('guard_id', gId)
          .eq('company_id', companyId)
          .gte('end_time', todayStart.toISOString())
          .lte('start_time', sevenDaysLater.toISOString())
          .order('start_time', { ascending: true }),
        supabase
          .from('attendance_logs')
          .select('*')
          .eq('guard_id', gId)
          .eq('company_id', companyId)
          .is('clock_out', null)
          .order('clock_in', { ascending: false })
          .limit(1),
        supabase
          .from('patrol_logs')
          .select('*')
          .eq('guard_id', gId)
          .eq('company_id', companyId)
          .eq('status', 'active')
          .order('start_time', { ascending: false })
          .limit(1),
      ]);

      const shifts = shiftsRes.data || [];

      const todayShiftRaw = shifts.find((s) => {
        const start = new Date(s.start_time);
        const end = new Date(s.end_time);
        return start <= todayEnd && end >= todayStart;
      }) || null;

      const futureShifts = shifts.filter((s) => {
        const start = new Date(s.start_time);
        return start > todayEnd;
      });
      const nextShiftRaw = futureShifts[0] || null;

      if (todayShiftRaw) {
        const { data: siteData } = await supabase
          .from('sites')
          .select('id, site_name, address, latitude, longitude, check_call_interval, assignment_instructions, client_name, client_contact_name, client_contact_email, site_contact_phone')
          .eq('id', todayShiftRaw.site_id)
          .eq('company_id', companyId)
          .maybeSingle();
        setTodayShift({ ...todayShiftRaw, site: siteData });
      } else {
        setTodayShift(null);
      }

      if (nextShiftRaw) {
        const { data: siteData } = await supabase
          .from('sites')
          .select('id, site_name, address, latitude, longitude, check_call_interval, assignment_instructions, client_name, client_contact_name, client_contact_email, site_contact_phone')
          .eq('id', nextShiftRaw.site_id)
          .eq('company_id', companyId)
          .maybeSingle();
        setNextShift({ ...nextShiftRaw, site: siteData });
      } else {
        setNextShift(null);
      }

      setActiveAttendance(attendanceRes.data?.[0] || null);
      setActivePatrol(patrolRes.data?.[0] || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [userId, companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { todayShift, nextShift, activeAttendance, activePatrol, guardId, loading, error, refetch: fetchData };
}