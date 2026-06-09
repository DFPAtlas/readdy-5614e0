'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface GuardAvailability {
  guard_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface GuardTimeOff {
  id: string;
  guard_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  approved: boolean;
  status: string;
}

export function useGuardAvailability() {
  const { companyId } = useAuth();
  const [availability, setAvailability] = useState<GuardAvailability[]>([]);
  const [timeOff, setTimeOff] = useState<GuardTimeOff[]>([]);
  const [allTimeOff, setAllTimeOff] = useState<GuardTimeOff[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [guards, setGuards] = useState<{ id: string; first_name: string | null; last_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);

    const { data: guardList } = await supabase
      .from('guards')
      .select('id, first_name, last_name')
      .eq('company_id', companyId)
      .eq('status', 'active');

    const guardIds = (guardList || []).map((g) => g.id);
    setGuards(guardList || []);

    let availData: any[] = [];
    let offData: any[] = [];

    if (guardIds.length > 0) {
      const today = new Date().toISOString().slice(0, 10);

      const [{ data: a }, { data: approved }, { data: all }] = await Promise.all([
        supabase
          .from('guard_availability')
          .select('guard_id, day_of_week, start_time, end_time, is_available')
          .in('guard_id', guardIds)
          .order('guard_id')
          .order('day_of_week'),
        supabase
          .from('guard_time_off')
          .select('id, guard_id, start_date, end_date, reason, approved, status')
          .in('guard_id', guardIds)
          .gte('end_date', today)
          .eq('approved', true)
          .order('guard_id')
          .order('start_date'),
        supabase
          .from('guard_time_off')
          .select('id, guard_id, start_date, end_date, reason, approved, status')
          .in('guard_id', guardIds)
          .gte('end_date', today)
          .order('guard_id')
          .order('start_date'),
      ]);
      availData = a || [];
      offData = approved || [];
      setAllTimeOff((all || []).map((t: any) => ({
        id: t.id,
        guard_id: t.guard_id,
        start_date: t.start_date,
        end_date: t.end_date,
        reason: t.reason || 'Time off',
        approved: t.approved ?? false,
        status: t.status || 'pending',
      })));
      setPendingCount((all || []).filter((x: any) => x.status === 'pending' || !x.approved).length);
    }

    setAvailability(availData.map((a: any) => ({
      guard_id: a.guard_id,
      day_of_week: normalizeDay(a.day_of_week),
      start_time: a.start_time?.slice(0, 5) || '00:00',
      end_time: a.end_time?.slice(0, 5) || '23:59',
      is_available: a.is_available ?? true,
    })));

    setTimeOff(offData.map((t: any) => ({
      id: t.id,
      guard_id: t.guard_id,
      start_date: t.start_date,
      end_date: t.end_date,
      reason: t.reason || 'Time off',
      approved: t.approved ?? true,
      status: t.status || 'approved',
    })));

    setLoading(false);
  }, [companyId]);

  useEffect(() => { if (companyId) load(); }, [companyId, load]);

  return { availability, timeOff, allTimeOff, pendingCount, guards, loading, refetch: load };
}

export async function addTimeOff(guardId: string, startDate: string, endDate: string, reason: string) {
  const { data, error } = await supabase
    .from('guard_time_off')
    .insert({ guard_id: guardId, start_date: startDate, end_date: endDate, reason, approved: false, status: 'pending' })
    .select()
    .maybeSingle();
  return { data, error };
}

export async function approveTimeOff(id: string, approve: boolean) {
  const { data, error } = await supabase
    .from('guard_time_off')
    .update({ approved: approve, status: approve ? 'approved' : 'rejected' })
    .eq('id', id)
    .select()
    .maybeSingle();
  return { data, error };
}

export async function deleteTimeOff(id: string) {
  const { error } = await supabase.from('guard_time_off').delete().eq('id', id);
  return { error };
}

export async function setGuardAvailability(
  guardId: string,
  patterns: Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>
) {
  const { error: delErr } = await supabase.from('guard_availability').delete().eq('guard_id', guardId);
  if (delErr) return { error: delErr };
  if (patterns.length === 0) return { error: null };
  const { error } = await supabase.from('guard_availability').insert(
    patterns.map((p) => ({ ...p, guard_id: guardId }))
  );
  return { error };
}

function normalizeDay(d: number): number {
  if (d >= 1 && d <= 7) return d - 1;
  if (d >= 0 && d <= 6) return d;
  return 0;
}

export function isGuardAvailable(
  guardId: string,
  date: Date,
  startTime: string,
  endTime: string,
  availability: GuardAvailability[]
): boolean {
  const day = date.getDay();
  const weekDay = day === 0 ? 6 : day - 1;
  const patterns = availability.filter((a) => a.guard_id === guardId && a.day_of_week === weekDay);
  if (patterns.length === 0) return true;
  const availablePatterns = patterns.filter((a) => a.is_available);
  if (availablePatterns.length === 0) return false;
  return availablePatterns.some((p) => p.start_time <= startTime.slice(0, 5) && p.end_time >= endTime.slice(0, 5));
}

export function isGuardOnLeave(
  guardId: string,
  dateStr: string,
  timeOff: GuardTimeOff[]
): GuardTimeOff | null {
  return timeOff.find((t) =>
    t.guard_id === guardId &&
    t.start_date <= dateStr &&
    t.end_date >= dateStr &&
    (t.status === 'approved' || t.approved === true)
  ) || null;
}

export function isGuardPendingLeave(
  guardId: string,
  dateStr: string,
  timeOff: GuardTimeOff[]
): GuardTimeOff | null {
  return timeOff.find((t) =>
    t.guard_id === guardId &&
    t.start_date <= dateStr &&
    t.end_date >= dateStr &&
    t.status === 'pending'
  ) || null;
}


export function getGuardWeeklyHours(
  guardId: string,
  shifts: Array<{ guard_id: string | null; start_time: string; end_time: string }>,
  weekStart: Date
): number {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  let total = 0;
  for (const s of shifts) {
    if (s.guard_id !== guardId) continue;
    const st = new Date(s.start_time);
    const en = new Date(s.end_time);
    if (st >= start && st < end) {
      total += (en.getTime() - st.getTime()) / (1000 * 60 * 60);
    }
  }
  return Math.round(total * 10) / 10;
}

export const OVERTIME_THRESHOLD = 48;
export const WARNING_THRESHOLD = 40;