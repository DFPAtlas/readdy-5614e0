import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface ShiftType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  start_time: string | null;
  end_time: string | null;
  color: string;
  is_paid: boolean;
  break_duration_minutes: number;
  notes: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_COLORS = [
  '#F59E0B', '#6366F1', '#10B981', '#EC4899', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#64748B',
  '#D946EF', '#14B8A6', '#FB923C', '#A855F7', '#E11D48',
];

export function useShiftTypes() {
  const { companyId } = useAuth();
  const [types, setTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('shift_types')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (err) { setError(err.message); setTypes([]); }
    else { setTypes((data || []) as ShiftType[]); }
    setLoading(false);
  }, [companyId]);

  useEffect(() => { if (!companyId) return; load(); }, [companyId, load]);

  const create = async (partial: Partial<ShiftType>) => {
    if (!companyId) return { data: null, error: new Error('No company') };
    const nextColor = DEFAULT_COLORS[types.length % DEFAULT_COLORS.length];
    const maxSort = types.length > 0 ? Math.max(...types.map((t) => t.sort_order)) : 0;
    const payload = {
      company_id: companyId,
      name: partial.name || 'New Shift Type',
      code: partial.code || partial.name?.toLowerCase().replace(/\s+/g, '_') || 'custom',
      start_time: partial.start_time || '08:00',
      end_time: partial.end_time || '16:00',
      color: partial.color || nextColor,
      is_paid: partial.is_paid ?? true,
      break_duration_minutes: partial.break_duration_minutes ?? 30,
      notes: partial.notes || null,
      sort_order: maxSort + 1,
      is_active: true,
    };
    const { data, error } = await supabase.from('shift_types').insert(payload).select().single();
    if (!error) load();
    return { data, error };
  };

  const update = async (id: string, partial: Partial<ShiftType>) => {
    const { data, error } = await supabase.from('shift_types').update(partial).eq('id', id).select().single();
    if (!error) load();
    return { data, error };
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('shift_types').update({ is_active: false }).eq('id', id);
    if (!error) setTypes((prev) => prev.filter((t) => t.id !== id));
    return { error };
  };

  const getColorByCode = useCallback(
    (code: string) => types.find((t) => t.code === code)?.color || '#64748B',
    [types]
  );

  const getNameByCode = useCallback(
    (code: string) => types.find((t) => t.code === code)?.name || code,
    [types]
  );

  return { types, loading, error, refetch: load, create, update, remove, getColorByCode, getNameByCode };
}