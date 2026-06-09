import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface PatternSlot {
  day?: number;
  day_offset?: number;
  label?: string;
  start_time: string;
  end_time: string;
  guards_required: number;
  shift_type: 'day' | 'night' | '24h' | 'event' | 'patrol';
  is_rest_day?: boolean;
}

export interface ShiftPatternTemplate {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  pattern_type: string;
  cycle_length: number | null;
  slots: PatternSlot[];
  created_at: string;
  updated_at: string;
}

export const BUILT_IN_PATTERNS: Omit<ShiftPatternTemplate, 'id' | 'company_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Monday to Friday Day',
    description: '5 consecutive day shifts, Mon-Fri, 08:00–20:00',
    pattern_type: 'weekly',
    cycle_length: 7,
    slots: [
      { day: 1, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 2, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 3, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 4, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 5, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
    ],
  },
  {
    name: '4 On / 4 Off Days',
    description: '4 day shifts then 4 rest days, 08:00–20:00',
    pattern_type: 'rotational',
    cycle_length: 8,
    slots: [
      { day: 1, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 2, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 3, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 4, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
    ],
  },
  {
    name: '4 On / 4 Off Nights',
    description: '4 night shifts then 4 rest days, 20:00–08:00',
    pattern_type: 'rotational',
    cycle_length: 8,
    slots: [
      { day: 1, label: 'Night Shift', start_time: '20:00', end_time: '08:00', guards_required: 1, shift_type: 'night' },
      { day: 2, label: 'Night Shift', start_time: '20:00', end_time: '08:00', guards_required: 1, shift_type: 'night' },
      { day: 3, label: 'Night Shift', start_time: '20:00', end_time: '08:00', guards_required: 1, shift_type: 'night' },
      { day: 4, label: 'Night Shift', start_time: '20:00', end_time: '08:00', guards_required: 1, shift_type: 'night' },
    ],
  },
  {
    name: 'Weekend Only',
    description: 'Saturday and Sunday day shifts, 08:00–20:00',
    pattern_type: 'weekly',
    cycle_length: 7,
    slots: [
      { day: 6, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 7, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
    ],
  },
  {
    name: '7 Days Continuous',
    description: 'One guard on site every day, 08:00–20:00',
    pattern_type: 'weekly',
    cycle_length: 7,
    slots: [
      { day: 1, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 2, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 3, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 4, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 5, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 6, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
      { day: 7, label: 'Day Shift', start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' },
    ],
  },
  {
    name: 'Single Day Event',
    description: 'One single day shift, 08:00–18:00',
    pattern_type: 'single',
    cycle_length: 1,
    slots: [
      { day: 1, label: 'Event Shift', start_time: '08:00', end_time: '18:00', guards_required: 1, shift_type: 'event' },
    ],
  },
];

const ADMIN_ROLES = new Set(['super_admin', 'company_admin', 'operations_manager']);

function isAdminRole(role: string | null): boolean {
  return !!role && ADMIN_ROLES.has(role);
}

function normalizeSlot(slot: any): PatternSlot {
  if (!slot || typeof slot !== 'object') {
    return { day: 1, start_time: '08:00', end_time: '20:00', guards_required: 1, shift_type: 'day' };
  }
  const day = slot.day ?? (slot.day_offset != null ? slot.day_offset + 1 : 1);
  return {
    day,
    day_offset: slot.day_offset ?? day - 1,
    label: slot.label || `${slot.shift_type || 'Day'} Shift`,
    start_time: slot.start_time || '08:00',
    end_time: slot.end_time || '20:00',
    guards_required: slot.guards_required ?? 1,
    shift_type: slot.shift_type || 'day',
    is_rest_day: !!slot.is_rest_day,
  };
}

export function useShiftPatternTemplates() {
  const { companyId, role } = useAuth();
  const [templates, setTemplates] = useState<ShiftPatternTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => isAdminRole(role), [role]);
  const canEdit = useMemo(() => isAdminRole(role), [role]);
  const canDelete = useMemo(() => isAdminRole(role), [role]);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('shift_pattern_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    if (err) {
      setError(err.message);
      setTemplates([]);
    } else {
      const mapped = (data || []).filter((d: any) => d && typeof d === 'object').map((row: any) => ({
        id: row.id,
        company_id: row.company_id,
        name: row.name,
        description: row.description,
        pattern_type: row.pattern_type || 'custom',
        cycle_length: row.cycle_length ?? (Array.isArray(row.slots) ? Math.max(...row.slots.map((s: any) => s.day || s.day_offset || 0)) + 1 : 7),
        slots: Array.isArray(row.slots) ? row.slots.map(normalizeSlot) : [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as ShiftPatternTemplate[];
      setTemplates(mapped);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => { if (!companyId) return; load(); }, [companyId, load]);

  const create = async (
    template: Omit<ShiftPatternTemplate, 'id' | 'company_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!companyId) return { data: null, error: new Error('No company') };
    if (!canCreate) return { data: null, error: new Error('Permission denied: only admins can create patterns') };

    const payload = {
      company_id: companyId,
      name: template.name.trim(),
      description: template.description?.trim() || null,
      pattern_type: template.pattern_type || 'custom',
      cycle_length: template.cycle_length ?? 7,
      slots: template.slots.map((s) => ({
        day: s.day ?? (s.day_offset != null ? s.day_offset + 1 : 1),
        label: s.label || `${s.shift_type} Shift`,
        start_time: s.start_time,
        end_time: s.end_time,
        guards_required: s.guards_required,
        shift_type: s.shift_type,
        is_rest_day: !!s.is_rest_day,
      })),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('shift_pattern_templates')
      .insert(payload)
      .select()
      .single();

    if (!error) {
      load();
    } else if (error.code === '42501' || error.message?.toLowerCase().includes('policy')) {
      return { data: null, error: new Error('Permission denied. You do not have access to create shift patterns.') };
    }
    return { data, error };
  };

  const update = async (id: string, template: Partial<ShiftPatternTemplate>) => {
    if (!canEdit) return { data: null, error: new Error('Permission denied: only admins can edit patterns') };

    const payload: any = { updated_at: new Date().toISOString() };
    if (template.name !== undefined) payload.name = template.name.trim();
    if (template.description !== undefined) payload.description = template.description?.trim() || null;
    if (template.pattern_type !== undefined) payload.pattern_type = template.pattern_type;
    if (template.cycle_length !== undefined) payload.cycle_length = template.cycle_length;
    if (template.slots !== undefined) {
      payload.slots = template.slots.map((s) => ({
        day: s.day ?? (s.day_offset != null ? s.day_offset + 1 : 1),
        label: s.label || `${s.shift_type} Shift`,
        start_time: s.start_time,
        end_time: s.end_time,
        guards_required: s.guards_required,
        shift_type: s.shift_type,
        is_rest_day: !!s.is_rest_day,
      }));
    }

    const { data, error } = await supabase
      .from('shift_pattern_templates')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      load();
    } else if (error.code === '42501' || error.message?.toLowerCase().includes('policy')) {
      return { data: null, error: new Error('Permission denied. You do not have access to edit this pattern.') };
    }
    return { data, error };
  };

  const remove = async (id: string) => {
    if (!canDelete) return { error: new Error('Permission denied: only admins can delete patterns') };
    const { error } = await supabase.from('shift_pattern_templates').delete().eq('id', id);
    if (!error) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } else if (error.code === '42501' || error.message?.toLowerCase().includes('policy')) {
      return { error: new Error('Permission denied. You do not have access to delete this pattern.') };
    }
    return { error };
  };

  const seedBuiltIn = async () => {
    if (!companyId || !canCreate) return;
    for (const p of BUILT_IN_PATTERNS) {
      const payload = {
        ...p,
        company_id: companyId,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('shift_pattern_templates').insert(payload);
    }
    load();
  };

  const duplicate = async (id: string) => {
    const original = templates.find((t) => t.id === id);
    if (!original) return { data: null, error: new Error('Template not found') };
    return create({
      ...original,
      name: original.name + ' (Copy)',
      slots: original.slots.map((s) => ({ ...s })),
    });
  };

  return {
    templates,
    loading,
    error,
    refetch: load,
    create,
    update,
    remove,
    seedBuiltIn,
    duplicate,
    canCreate,
    canEdit,
    canDelete,
  };
}

export function generateShiftsFromPattern(
  template: ShiftPatternTemplate,
  siteId: string,
  companyId: string,
  startDate: string,
  weekCount: number,
  guardId?: string | null
): Array<{
  company_id: string;
  site_id: string;
  guard_id: string | null;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
  notes: string;
}> {
  const results: ReturnType<typeof generateShiftsFromPattern> = [];
  const start = new Date(startDate + 'T00:00:00');

  for (let week = 0; week < weekCount; week++) {
    const weekOffset = week * 7;
    for (const slot of template.slots) {
      if (slot.is_rest_day) continue;
      const dayNum = slot.day ?? (slot.day_offset != null ? slot.day_offset + 1 : 1);
      const dayOffset = dayNum - 1 + weekOffset;
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = formatDate(date);

      const sDate = new Date(`${dateStr}T${slot.start_time}:00`);
      let eDate = new Date(`${dateStr}T${slot.end_time}:00`);
      if (eDate <= sDate) eDate.setDate(eDate.getDate() + 1);

      results.push({
        company_id: companyId,
        site_id: siteId,
        guard_id: guardId ?? null,
        start_time: sDate.toISOString(),
        end_time: eDate.toISOString(),
        shift_type: slot.shift_type,
        status: 'scheduled',
        notes: `From pattern: ${template.name}`,
      });
    }
  }

  return results;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}