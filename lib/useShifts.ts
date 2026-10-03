import { useCallback, useEffect, useState } from 'react';
import { phaseOneSupabase as supabase } from '@/lib/phaseOneSupabase';
import { useAuth } from '@/lib/auth';
import { format, startOfWeek } from 'date-fns';

export interface Shift {
  id: string;
  company_id: string | null;
  site_id: string | null;
  guard_id: string | null;
  start_time: string;
  end_time: string;
  status: string | null;
  shift_type: string | null;
  notes: string | null;
  created_at: string;
  site_name?: string | null;
  risk_level?: string | null;
  guard_name?: string | null;
}

export interface ShiftForm {
  site_id: string;
  guard_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
  notes: string;
}

export function useShifts(weekStart: Date, weekEnd: Date) {
  const { companyId, profile } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShifts = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('shifts')
      .select(`
        *,
        sites(site_name, risk_level),
        guards(first_name, last_name)
      `)
      .eq('company_id', companyId)
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString())
      .order('start_time');
    if (err) { setError(err.message); setShifts([]); }
    else {
      setShifts((data || []).map((row: any) => ({
        id: row.id,
        company_id: row.company_id,
        site_id: row.site_id,
        guard_id: row.guard_id,
        start_time: row.start_time,
        end_time: row.end_time,
        status: row.status,
        shift_type: row.shift_type,
        notes: row.notes,
        created_at: row.created_at,
        site_name: row.sites?.site_name || null,
        risk_level: row.sites?.risk_level || null,
        guard_name: row.guards?.first_name && row.guards?.last_name
          ? `${row.guards.first_name} ${row.guards.last_name}`
          : row.guards?.first_name || row.guards?.last_name || null,
      })));
    }
    setLoading(false);
  }, [companyId, weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => { if (!companyId) return; loadShifts(); }, [companyId, loadShifts]);

  useEffect(() => {
    if (!companyId) return;
    const interval = setInterval(() => loadShifts(), 30000);
    return () => clearInterval(interval);
  }, [companyId, loadShifts]);

  const checkPublishedWeek = async (dates: string[]) => {
    if (!companyId || !profile) return new Error('Your session has expired.');
    if (['company_admin', 'super_admin'].includes(profile.role)) return null;
    const weeks = [...new Set(dates.map(value => format(startOfWeek(new Date(value), { weekStartsOn: 1 }), 'yyyy-MM-dd')))];
    const result = await supabase.from('rota_published_weeks').select('id').eq('company_id', companyId).in('week_start', weeks).is('unpublished_at', null).limit(1);
    if (result.error) return new Error('Could not verify whether the rota is locked. Please retry.');
    return result.data?.length ? new Error('This rota is published. Contact an admin to make changes.') : null;
  };

  const createShift = async (payload: Omit<ShiftForm, 'status'> & { status?: string }) => {
    if (!companyId) return { error: new Error('No company') };
    const startDate = new Date(`${payload.date}T${payload.start_time}`);
    let endDate = new Date(`${payload.date}T${payload.end_time}`);
    if (endDate <= startDate) { endDate.setDate(endDate.getDate() + 1); }
    const lockError = await checkPublishedWeek([startDate.toISOString()]);
    if (lockError) return { error: lockError };
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        company_id: companyId,
        site_id: payload.site_id,
        guard_id: payload.guard_id || null,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: payload.status || 'scheduled',
        shift_type: payload.shift_type,
        notes: payload.notes || null,
      })
      .select()
      .maybeSingle();
    return { data, error };
  };

  const updateShift = async (id: string, payload: Partial<ShiftForm>) => {
    if (!companyId) return { error: new Error('No company') };
    const original = await supabase.from('shifts').select('start_time').eq('id', id).eq('company_id', companyId).single();
    if (original.error || !original.data) return { error: new Error('Shift not found or access denied.') };
    const lockError = await checkPublishedWeek([original.data.start_time, ...(payload.date ? [payload.date + 'T' + (payload.start_time || '00:00')] : [])]);
    if (lockError) return { error: lockError };
    const updates: any = {};
    if (payload.site_id != null) updates.site_id = payload.site_id;
    if (payload.guard_id !== undefined) updates.guard_id = payload.guard_id;
    if (payload.status != null) updates.status = payload.status;
    if (payload.shift_type != null) updates.shift_type = payload.shift_type;
    if (payload.notes !== undefined) updates.notes = payload.notes;
    if (payload.date && payload.start_time && payload.end_time) {
      const startDate = new Date(`${payload.date}T${payload.start_time}`);
      let endDate = new Date(`${payload.date}T${payload.end_time}`);
      if (endDate <= startDate) { endDate.setDate(endDate.getDate() + 1); }
      updates.start_time = startDate.toISOString();
      updates.end_time = endDate.toISOString();
    }
    const { data, error } = await supabase.from('shifts').update(updates).eq('id', id).eq('company_id', companyId).select().maybeSingle();
    return { data, error };
  };

  const deleteShift = async (id: string) => {
    if (!companyId) return { error: new Error('No company') };
    const { error } = await supabase.from('shifts').delete().eq('id', id).eq('company_id', companyId);
    return { error };
  };

  const assignGuard = async (shiftId: string, guardId: string | null) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase.from('shifts').update({ guard_id: guardId }).eq('id', shiftId).eq('company_id', companyId).select().maybeSingle();
    return { data, error };
  };

  const clearShifts = async (siteId?: string | null) => {
    if (!companyId) return { error: new Error('No company') };
    let query = supabase
      .from('shifts')
      .delete()
      .eq('company_id', companyId)
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString());
    if (siteId) query = query.eq('site_id', siteId);
    const { error } = await query;
    return { error };
  };

  return { shifts, loading, error, refetch: loadShifts, createShift, updateShift, deleteShift, assignGuard, clearShifts };
}