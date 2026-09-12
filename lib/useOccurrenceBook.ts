import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export const OB_ENTRY_TYPES = [
  'general_note',
  'handover',
  'incident_note',
  'patrol_note',
  'visitor_note',
  'maintenance_issue',
  'health_safety',
  'client_update',
  'security_alert',
  'lost_property',
  'key_log',
  'other',
];

export const OB_ENTRY_TYPE_LABELS: Record<string, string> = {
  general_note: 'General Note',
  handover: 'Handover',
  incident_note: 'Incident Note',
  patrol_note: 'Patrol Note',
  visitor_note: 'Visitor Note',
  maintenance_issue: 'Maintenance Issue',
  health_safety: 'Health & Safety',
  client_update: 'Client Update',
  security_alert: 'Security Alert',
  lost_property: 'Lost Property',
  key_log: 'Key Log',
  other: 'Other',
};

export const OB_TYPE_ICON: Record<string, string> = {
  general_note: 'ri-sticky-note-line',
  handover: 'ri-arrow-left-right-line',
  incident_note: 'ri-alarm-warning-line',
  patrol_note: 'ri-route-line',
  visitor_note: 'ri-user-add-line',
  maintenance_issue: 'ri-tools-line',
  health_safety: 'ri-first-aid-kit-line',
  client_update: 'ri-chat-1-line',
  security_alert: 'ri-shield-flash-line',
  lost_property: 'ri-search-line',
  key_log: 'ri-key-2-line',
  other: 'ri-more-line',
  'Shift Start': 'ri-login-box-line',
  'Shift End': 'ri-logout-box-line',
  'Patrol Check': 'ri-route-line',
  'Visitor': 'ri-user-add-line',
  'Delivery': 'ri-truck-line',
  'Incident': 'ri-alarm-warning-line',
  'Maintenance': 'ri-tools-line',
  'Communication': 'ri-chat-1-line',
  'Health & Safety': 'ri-first-aid-kit-line',
  'Lost Property': 'ri-search-line',
  'Note': 'ri-sticky-note-line',
  'Other': 'ri-more-line',
  'General': 'ri-file-list-line',
  'shift_start': 'ri-login-box-line',
};

export const OB_TYPE_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  general_note: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  handover: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  incident_note: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  patrol_note: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  visitor_note: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-500' },
  maintenance_issue: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  health_safety: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  client_update: { bg: 'bg-sky-500/10', text: 'text-sky-400', dot: 'bg-sky-500' },
  security_alert: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-500' },
  lost_property: { bg: 'bg-sky-500/10', text: 'text-sky-400', dot: 'bg-sky-500' },
  key_log: { bg: 'bg-teal-500/10', text: 'text-teal-400', dot: 'bg-teal-500' },
  other: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  'Shift Start': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  'Shift End': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  'Patrol Check': { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  'Visitor': { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-500' },
  'Delivery': { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-500' },
  'Incident': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  'Maintenance': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  'Communication': { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  'Health & Safety': { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  'Lost Property': { bg: 'bg-sky-500/10', text: 'text-sky-400', dot: 'bg-sky-500' },
  'Note': { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  'Other': { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  'General': { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  'shift_start': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
};

export const OB_VISIBILITY_OPTIONS = [
  { value: 'internal', label: 'Internal Only', icon: 'ri-lock-line', desc: 'Visible to ops team only' },
  { value: 'client_visible', label: 'Client Visible', icon: 'ri-eye-line', desc: 'Visible in client reports and portal' },
  { value: 'handover', label: 'Handover Note', icon: 'ri-arrow-left-right-line', desc: 'Visible to next shift guard and ops' },
];

export interface OBEntry {
  id: string;
  company_id: string | null;
  site_id: string | null;
  guard_id: string | null;
  entry: string;
  entry_type: string | null;
  title: string | null;
  ai_summary: string | null;
  occurred_at: string | null;
  created_at: string | null;
  edited_at: string | null;
  shift_id: string | null;
  attendance_log_id: string | null;
  client_visible: boolean;
  visibility: string | null;
  reporter_name?: string | null;
  site_name?: string | null;
}

export interface OBFilters {
  entryType?: string;
  guardId?: string;
  search?: string;
  from?: string;
  to?: string;
  visibility?: string;
  clientVisibleOnly?: boolean;
}

export function useOccurrenceBook(siteId: string | null, filters?: OBFilters) {
  const { companyId } = useAuth();
  const [entries, setEntries] = useState<OBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 50;

  const loadEntries = useCallback(async (reset = false) => {
    if (!companyId || !siteId) {
      setEntries([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);
    const currentOffset = reset ? 0 : offset;

    let query = supabase
      .from('occurrence_books')
      .select(`
        *,
        guards(first_name, last_name),
        sites(site_name)
      `)
      .eq('company_id', companyId)
      .eq('site_id', siteId);

    if (filters?.entryType) query = query.eq('entry_type', filters.entryType);
    if (filters?.guardId) query = query.eq('guard_id', filters.guardId);
    if (filters?.from) query = query.gte('occurred_at', `${filters.from}T00:00:00Z`);
    if (filters?.to) query = query.lt('occurred_at', `${filters.to}T23:59:59Z`);
    if (filters?.visibility) query = query.eq('visibility', filters.visibility);
    if (filters?.clientVisibleOnly) query = query.eq('client_visible', true);

    const { data, error: err } = await query
      .order('occurred_at', { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      company_id: row.company_id,
      site_id: row.site_id,
      guard_id: row.guard_id,
      entry: row.entry,
      entry_type: row.entry_type,
      title: row.title,
      ai_summary: row.ai_summary,
      occurred_at: row.occurred_at,
      created_at: row.created_at,
      edited_at: row.edited_at,
      shift_id: row.shift_id,
      attendance_log_id: row.attendance_log_id,
      client_visible: row.client_visible || false,
      visibility: row.visibility,
      reporter_name: row.guards?.first_name && row.guards?.last_name
        ? `${row.guards.first_name} ${row.guards.last_name}`
        : row.guards?.first_name || row.guards?.last_name || 'Staff',
      site_name: row.sites?.site_name || null,
    }));

    const q = filters?.search?.trim().toLowerCase();
    const filtered = q ? mapped.filter((e: OBEntry) => e.entry.toLowerCase().includes(q)) : mapped;

    setEntries((prev) => (reset ? filtered : [...prev, ...filtered]));
    setHasMore(filtered.length === PAGE_SIZE);
    setOffset(currentOffset + PAGE_SIZE);
    setLoading(false);
  }, [companyId, siteId, JSON.stringify(filters), offset]);

  const refetch = useCallback(() => {
    setOffset(0);
    loadEntries(true);
  }, [loadEntries]);

  useEffect(() => {
    if (!companyId || !siteId) return;
    setOffset(0);
    loadEntries(true);
  }, [companyId, siteId, JSON.stringify(filters)]);

  useEffect(() => {
    if (!companyId || !siteId) return;
    const channel = supabase
      .channel(`ob-${siteId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'occurrence_books', filter: `site_id=eq.${siteId}` },
        () => refetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, siteId, refetch]);

  const addEntry = async (payload: {
    site_id: string;
    guard_id: string | null;
    entry_type: string;
    entry: string;
    occurred_at: string;
    title?: string | null;
    shift_id?: string | null;
    attendance_log_id?: string | null;
    client_visible?: boolean;
    visibility?: string | null;
  }) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('occurrence_books')
      .insert({
        company_id: companyId,
        ...payload,
        client_visible: payload.client_visible ?? false,
        visibility: payload.visibility ?? 'internal',
      })
      .select()
      .maybeSingle();
    return { data, error };
  };

  const updateEntry = async (id: string, payload: Partial<any>) => {
    const { data, error } = await supabase
      .from('occurrence_books')
      .update({ ...payload, edited_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    return { data, error };
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('occurrence_books').delete().eq('id', id);
    return { error };
  };

  return {
    entries,
    loading,
    error,
    hasMore,
    refetch,
    loadMore: () => loadEntries(false),
    addEntry,
    updateEntry,
    deleteEntry,
  };
}