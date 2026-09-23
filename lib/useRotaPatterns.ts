import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import type { ShiftType } from './useShiftTypes';

export interface PatternDay {
  day_offset: number;
  shift_type: string;
  start_time: string | null;
  end_time: string | null;
  guards_required: number;
}

export interface RotaPattern {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  cycle_length: number;
  days: PatternDay[];
  site_id: string | null;
  status: 'active' | 'archived' | 'draft';
  required_staff: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RotaConflict {
  id: string;
  company_id: string;
  shift_id: string | null;
  conflict_type: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  guard_id: string | null;
  site_id: string | null;
  conflict_date: string | null;
  resolved: boolean;
  created_at: string;
}

const CYCLE_PRESETS = [
  { label: '7 Days', value: 7 },
  { label: '8 Days', value: 8 },
  { label: '14 Days', value: 14 },
  { label: '21 Days', value: 21 },
  { label: '28 Days', value: 28 },
  { label: 'Custom', value: 0 },
];

export const COMMON_TEMPLATES = [
  {
    name: '4 Days On / 4 Days Off',
    cycle_length: 8,
    days: [
      { day_offset: 0, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 1, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 2, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 3, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
    ],
  },
  {
    name: '4 Nights On / 4 Days Off',
    cycle_length: 8,
    days: [
      { day_offset: 0, shift_type: 'night', start_time: '20:00', end_time: '08:00', guards_required: 1 },
      { day_offset: 1, shift_type: 'night', start_time: '20:00', end_time: '08:00', guards_required: 1 },
      { day_offset: 2, shift_type: 'night', start_time: '20:00', end_time: '08:00', guards_required: 1 },
      { day_offset: 3, shift_type: 'night', start_time: '20:00', end_time: '08:00', guards_required: 1 },
    ],
  },
  {
    name: '2 Days / 2 Nights / 4 Off',
    cycle_length: 8,
    days: [
      { day_offset: 0, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 1, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 2, shift_type: 'night', start_time: '20:00', end_time: '08:00', guards_required: 1 },
      { day_offset: 3, shift_type: 'night', start_time: '20:00', end_time: '08:00', guards_required: 1 },
    ],
  },
  {
    name: 'Monday to Friday',
    cycle_length: 7,
    days: [
      { day_offset: 0, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 1, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 2, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 3, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 4, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
    ],
  },
  {
    name: 'Weekends Only',
    cycle_length: 7,
    days: [
      { day_offset: 5, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 6, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
    ],
  },
  {
    name: '7 Days Continuous',
    cycle_length: 7,
    days: [
      { day_offset: 0, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 1, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 2, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 3, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 4, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 5, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
      { day_offset: 6, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
    ],
  },
];

export function useRotaPatterns() {
  const { companyId } = useAuth();
  const [patterns, setPatterns] = useState<RotaPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('shift_pattern_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    if (err) { setError(err.message); setPatterns([]); }
    else {
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        company_id: row.company_id,
        name: row.name,
        description: row.description,
        cycle_length: row.cycle_length || (Array.isArray(row.slots) ? row.slots.length + 1 : 7),
        days: Array.isArray(row.slots) ? row.slots.map((s: any) => ({
          day_offset: s.day_offset ?? 0,
          shift_type: s.shift_type || 'day',
          start_time: s.start_time || '08:00',
          end_time: s.end_time || '20:00',
          guards_required: s.guards_required ?? 1,
        })) : [],
        site_id: null,
        status: 'active',
        required_staff: Math.max(1, ...(Array.isArray(row.slots) ? row.slots.map((s: any) => s.guards_required || 1) : [1])),
        tags: [row.pattern_type || 'custom'],
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as RotaPattern[];
      setPatterns(mapped);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => { if (!companyId) return; load(); }, [companyId, load]);

  const create = async (pattern: Omit<RotaPattern, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) return { data: null, error: new Error('No company') };
    const payload = {
      company_id: companyId,
      name: pattern.name,
      description: pattern.description,
      pattern_type: pattern.tags?.[0] || 'custom',
      cycle_length: pattern.cycle_length,
      slots: pattern.days.map((d) => ({
        day_offset: d.day_offset,
        shift_type: d.shift_type,
        start_time: d.start_time,
        end_time: d.end_time,
        guards_required: d.guards_required,
      })),
    };
    const { data, error } = await supabase.from('shift_pattern_templates').insert(payload).select().maybeSingle();
    if (!error) load();
    return { data, error };
  };

  const update = async (id: string, pattern: Partial<RotaPattern>) => {
    const payload: any = {};
    if (pattern.name !== undefined) payload.name = pattern.name;
    if (pattern.description !== undefined) payload.description = pattern.description;
    if (pattern.cycle_length !== undefined) payload.cycle_length = pattern.cycle_length;
    if (pattern.days !== undefined) {
      payload.slots = pattern.days.map((d) => ({
        day_offset: d.day_offset,
        shift_type: d.shift_type,
        start_time: d.start_time,
        end_time: d.end_time,
        guards_required: d.guards_required,
      }));
    }
    const { data, error } = await supabase.from('shift_pattern_templates').update(payload).eq('id', id).select().maybeSingle();
    if (!error) load();
    return { data, error };
  };

  const duplicate = async (id: string) => {
    const original = patterns.find((p) => p.id === id);
    if (!original || !companyId) return { data: null, error: new Error('Not found') };
    return create({
      ...original,
      name: original.name + ' (Copy)',
      description: original.description,
      days: original.days.map((d) => ({ ...d })),
    });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('shift_pattern_templates').delete().eq('id', id);
    if (!error) setPatterns((prev) => prev.filter((p) => p.id !== id));
    return { error };
  };

  const archive = async (id: string) => {
    const { error } = await update(id, { status: 'archived' as any });
    return { error };
  };

  const applyPattern = async (
    pattern: RotaPattern,
    startDate: string,
    weekCount: number,
    siteId: string,
    guardId: string | null,
    publish: boolean
  ): Promise<{ count: number; conflicts: number; error: any }> => {
    if (!companyId) return { count: 0, conflicts: 0, error: new Error('No company') };

    const start = new Date(startDate + 'T00:00:00');
    const shiftsToInsert: any[] = [];

    for (let week = 0; week < weekCount; week++) {
      const weekOffset = week * 7;
      for (const day of pattern.days) {
        const dayOffset = day.day_offset + weekOffset;
        const date = new Date(start);
        date.setDate(date.getDate() + dayOffset);
        const dateStr = format(date, 'yyyy-MM-dd');

        if (!day.start_time || !day.end_time || day.shift_type === 'off' || day.shift_type === 'holiday' || day.shift_type === 'sick') continue;

        const sDate = new Date(`${dateStr}T${day.start_time}:00`);
        let eDate = new Date(`${dateStr}T${day.end_time}:00`);
        if (eDate <= sDate) eDate.setDate(eDate.getDate() + 1);

        for (let g = 0; g < day.guards_required; g++) {
          shiftsToInsert.push({
            company_id: companyId,
            site_id: siteId,
            guard_id: guardId,
            start_time: sDate.toISOString(),
            end_time: eDate.toISOString(),
            shift_type: day.shift_type,
            status: publish ? 'published' : 'draft',
            notes: `From pattern: ${pattern.name} (Week ${week + 1})`,
          });
        }
      }
    }

    if (shiftsToInsert.length === 0) return { count: 0, conflicts: 0, error: null };

    const { error } = await supabase.from('shifts').insert(shiftsToInsert);

    const conflictCount = await validateConflicts(companyId, shiftsToInsert.map((s) => s.start_time.slice(0, 10)));

    return { count: shiftsToInsert.length, conflicts: conflictCount, error };
  };

  return {
    patterns,
    loading,
    error,
    refetch: load,
    create,
    update,
    remove,
    duplicate,
    archive,
    applyPattern,
  };
}

export function useRotaConflicts() {
  const { companyId } = useAuth();
  const [conflicts, setConflicts] = useState<RotaConflict[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (dateFrom?: string, dateTo?: string) => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    let query = supabase
      .from('rota_conflicts')
      .select('*')
      .eq('company_id', companyId)
      .eq('resolved', false)
      .order('created_at', { ascending: false });
    if (dateFrom) query = query.gte('conflict_date', dateFrom);
    if (dateTo) query = query.lte('conflict_date', dateTo);
    const { data, error } = await query;
    if (!error) setConflicts((data || []) as RotaConflict[]);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { if (!companyId) return; load(); }, [companyId, load]);

  const resolve = async (id: string) => {
    const { error } = await supabase.from('rota_conflicts').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
    if (!error) setConflicts((prev) => prev.filter((c) => c.id !== id));
    return { error };
  };

  return { conflicts, loading, refetch: load, resolve };
}

async function validateConflicts(companyId: string, dates: string[]): Promise<number> {
  const { data: existing } = await supabase
    .from('shifts')
    .select('id, guard_id, start_time, end_time, site_id')
    .eq('company_id', companyId)
    .in('start_time', dates.map((d) => `${d}T00:00:00`));
  let count = 0;
  if (existing && existing.length > 0) {
    for (const shift of existing) {
      if (!shift.guard_id) continue;
      const sameGuard = existing.filter((s) => s.id !== shift.id && s.guard_id === shift.guard_id);
      const sStart = new Date(shift.start_time);
      const sEnd = new Date(shift.end_time);
      for (const other of sameGuard) {
        const oStart = new Date(other.start_time);
        const oEnd = new Date(other.end_time);
        if (sStart < oEnd && sEnd > oStart) {
          count++;
        }
      }
    }
  }
  return count;
}

export function generateMonthPreview(
  pattern: RotaPattern,
  monthDate: Date,
  shiftTypes: ShiftType[]
): Array<{ date: Date; shift: PatternDay | null; dayOfMonth: number }> {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const days: Array<{ date: Date; shift: PatternDay | null; dayOfMonth: number }> = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const dayOffset = d.getDay();
    const normalizedOffset = dayOffset === 0 ? 6 : dayOffset - 1;
    const shift = pattern.days.find((pd) => pd.day_offset === normalizedOffset % pattern.cycle_length) || null;
    days.push({ date: new Date(d), shift, dayOfMonth: d.getDate() });
  }
  return days;
}

export { CYCLE_PRESETS };