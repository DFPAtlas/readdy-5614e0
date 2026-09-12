'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardShift {
  id: string;
  site_id: string;
  guard_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
  shift_type: string | null;
  notes: string | null;
  guard_name: string;
  guard_phone: string | null;
}

export interface ShiftPattern {
  id: string;
  site_id: string;
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
  day_name?: string;
}

export interface DashboardClocking {
  shift_id: string;
  guard_id: string;
  guard_name: string;
  start_time: string;
  end_time: string;
  shift_status: string;
  clocked_in_at: string | null;
  clocked_out_at: string | null;
  is_clocked_in: boolean;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
}

export interface SiteShiftsData {
  currentShifts: DashboardShift[];
  todayShifts: DashboardShift[];
  upcomingShifts: DashboardShift[];
  shiftPatterns: ShiftPattern[];
  clocking: DashboardClocking[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function useSiteShifts(siteId: string, companyId: string | null, enabled: boolean) {
  const [data, setData] = useState<SiteShiftsData>({
    currentShifts: [],
    todayShifts: [],
    upcomingShifts: [],
    shiftPatterns: [],
    clocking: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const nowISO = now.toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const next7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

    try {
      const [shiftsResult, patternsResult] = await Promise.all([
        supabase
          .from('shifts')
          .select('id, site_id, guard_id, start_time, end_time, status, shift_type, notes')
          .eq('site_id', siteId)
          .eq('company_id', companyId)
          .or(`and(start_time.lte.${nowISO},end_time.gte.${nowISO}),and(start_time.gte.${todayStart},start_time.lt.${next7Days})`)
          .order('start_time'),

        supabase
          .from('site_shift_patterns')
          .select('id, site_id, day_of_week, shift_type, start_time, end_time, guards_required')
          .eq('site_id', siteId)
          .order('day_of_week')
          .order('start_time'),
      ]);

      if (shiftsResult.error) throw shiftsResult.error;
      if (patternsResult.error) throw patternsResult.error;

      const allShifts = (shiftsResult.data || []) as any[];

      const guardIds = [...new Set(allShifts.map((s: any) => s.guard_id).filter(Boolean))];
      let guardsMap: Record<string, { first_name: string; last_name: string; phone: string | null }> = {};
      if (guardIds.length > 0) {
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name, phone')
          .in('id', guardIds);
        (guardsData || []).forEach((g: any) => {
          guardsMap[g.id] = { first_name: g.first_name, last_name: g.last_name, phone: g.phone };
        });
      }

      const getGuardName = (guardId: string | null) => {
        if (!guardId || !guardsMap[guardId]) return 'Officer';
        const g = guardsMap[guardId];
        return `${g.first_name} ${g.last_name}`.trim() || 'Officer';
      };
      const getGuardPhone = (guardId: string | null) => guardsMap[guardId]?.phone || null;

      const nowTime = now.getTime();
      const todayStartTime = new Date(todayStart).getTime();
      const todayEndTime = new Date(todayEnd).getTime();
      const next7DaysTime = new Date(next7Days).getTime();

      const current = allShifts.filter((s: any) => {
        const start = new Date(s.start_time).getTime();
        const end = new Date(s.end_time).getTime();
        return start <= nowTime && end >= nowTime;
      });

      const today = allShifts.filter((s: any) => {
        const start = new Date(s.start_time).getTime();
        return start >= todayStartTime && start < todayEndTime;
      });

      const upcoming = allShifts.filter((s: any) => {
        const start = new Date(s.start_time).getTime();
        return start >= nowTime && start < next7DaysTime;
      });

      const mapShift = (s: any): DashboardShift => ({
        id: s.id,
        site_id: s.site_id,
        guard_id: s.guard_id,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status || 'scheduled',
        shift_type: s.shift_type,
        notes: s.notes,
        guard_name: getGuardName(s.guard_id),
        guard_phone: getGuardPhone(s.guard_id),
      });

      const currentShifts = current.map(mapShift);
      const todayShifts = today.map(mapShift);
      const upcomingShifts = upcoming.map(mapShift);

      const shiftPatterns = (patternsResult.data || []).map((p: any) => ({
        ...p,
        day_name: DAY_NAMES[p.day_of_week] || 'Unknown',
      })) as ShiftPattern[];

      const currentShiftIds = current.map((s: any) => s.id);
      let clocking: DashboardClocking[] = [];
      if (currentShiftIds.length > 0) {
        const { data: attData } = await supabase
          .from('attendance_logs')
          .select('id, shift_id, guard_id, clock_in, clock_out, clock_in_lat, clock_in_lng')
          .in('shift_id', currentShiftIds)
          .order('clock_in', { ascending: false });

        clocking = current.map((shift: any): DashboardClocking => {
          const att = (attData || []).find((a: any) => a.shift_id === shift.id);
          return {
            shift_id: shift.id,
            guard_id: shift.guard_id,
            guard_name: getGuardName(shift.guard_id),
            start_time: shift.start_time,
            end_time: shift.end_time,
            shift_status: shift.status || 'scheduled',
            clocked_in_at: att?.clock_in || null,
            clocked_out_at: att?.clock_out || null,
            is_clocked_in: !!att && !att.clock_out,
            clock_in_lat: att?.clock_in_lat || null,
            clock_in_lng: att?.clock_in_lng || null,
          };
        });
      }

      setData({ currentShifts, todayShifts, upcomingShifts, shiftPatterns, clocking });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchShifts();
  }, [enabled, fetchShifts]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(fetchShifts, 30000);
    const handleVisible = () => {
      if (document.visibilityState === 'visible') fetchShifts();
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [enabled, fetchShifts]);

  return { ...data, loading, error, refresh: fetchShifts };
}