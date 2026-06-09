import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export const OB_ENTRY_TYPES = [
  'Shift Start',
  'Shift End',
  'Patrol Check',
  'Visitor',
  'Delivery',
  'Incident',
  'Maintenance',
  'Communication',
  'Health & Safety',
  'Lost Property',
  'Note',
  'Other',
];

export const OB_TYPE_ICON: Record<string, string> = {
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
};

export const OB_TYPE_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
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
};

export interface OBEntry {
  id: string;
  company_id: string | null;
  site_id: string | null;
  guard_id: string | null;
  entry: string;
  entry_type: string | null;
  ai_summary: string | null;
  occurred_at: string | null;
  created_at: string | null;
  edited_at: string | null;
  reporter_name?: string | null;
  site_name?: string | null;
}

export interface OBFilters {
  entryType?: string;
  guardId?: string;
  search?: string;
  from?: string;
  to?: string;
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
      ai_summary: row.ai_summary,
      occurred_at: row.occurred_at,
      created_at: row.created_at,
      edited_at: row.edited_at,
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
  }) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('occurrence_books')
      .insert({ company_id: companyId, ...payload })
      .select()
      .single();
    return { data, error };
  };

  const updateEntry = async (id: string, payload: Partial<any>) => {
    const { data, error } = await supabase
      .from('occurrence_books')
      .update({ ...payload, edited_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
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