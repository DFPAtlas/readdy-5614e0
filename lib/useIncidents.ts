import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface Incident {
  id: string;
  company_id: string | null;
  site_id: string | null;
  guard_id: string | null;
  user_id: string | null;
  shift_id: string | null;
  incident_number: string | null;
  incident_type: string | null;
  severity: string | null;
  title: string | null;
  description: string | null;
  location: string | null;
  status: string | null;
  occurred_at: string | null;
  reported_at: string | null;
  resolved_at: string | null;
  created_at: string | null;
  client_visible: boolean;
  requires_follow_up: boolean;
  follow_up_status: string | null;
  linked_evidence_count: number | null;
  site_name?: string | null;
  guard_name?: string | null;
}

export interface IncidentForm {
  site_id: string;
  guard_id: string | null;
  shift_id: string | null;
  incident_type: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  status: string;
  occurred_at: string;
  client_visible: boolean;
  requires_follow_up: boolean;
}

export interface IncidentFilters {
  search?: string;
  site_id?: string;
  severity?: string[];
  status?: string[];
  from?: string;
  to?: string;
}

export function useIncidents(filters?: IncidentFilters) {
  const { companyId } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIncidentToast, setNewIncidentToast] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let query = supabase
      .from('incidents')
      .select(`
        *,
        sites(site_name),
        guards(first_name, last_name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.from) query = query.gte('occurred_at', filters.from);
    if (filters?.to) query = query.lt('occurred_at', filters.to);

    const { data, error: err } = await query;

    if (err) { setError(err.message); setIncidents([]); }
    else {
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        company_id: row.company_id,
        site_id: row.site_id,
        guard_id: row.guard_id,
        user_id: row.user_id,
        shift_id: row.shift_id,
        incident_number: row.incident_number,
        incident_type: row.incident_type,
        severity: row.severity,
        title: row.title,
        description: row.description,
        location: row.location,
        status: row.status,
        occurred_at: row.occurred_at,
        reported_at: row.reported_at,
        resolved_at: row.resolved_at,
        created_at: row.created_at,
        client_visible: row.client_visible ?? true,
        requires_follow_up: row.requires_follow_up ?? false,
        follow_up_status: row.follow_up_status,
        linked_evidence_count: row.linked_evidence_count,
        site_name: row.sites?.site_name || null,
        guard_name: row.guards?.first_name && row.guards?.last_name
          ? `${row.guards.first_name} ${row.guards.last_name}`
          : row.guards?.first_name || row.guards?.last_name || null,
      }));

      let result = mapped;
      const q = filters?.search?.trim().toLowerCase();
      if (q) {
        result = result.filter(
          (i) =>
            (i.description || '').toLowerCase().includes(q) ||
            (i.incident_type || '').toLowerCase().includes(q)
        );
      }
      if (filters?.site_id) {
        result = result.filter((i) => i.site_id === filters.site_id);
      }
      if (filters?.severity?.length) {
        result = result.filter((i) => filters.severity!.includes(i.severity || ''));
      }
      if (filters?.status?.length) {
        result = result.filter((i) => filters.status!.includes(i.status || ''));
      }

      setIncidents(result);
    }
    setLoading(false);
  }, [companyId, JSON.stringify(filters)]);

  useEffect(() => {
    if (!companyId) return;
    loadIncidents();
  }, [companyId, loadIncidents]);

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel('incidents-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents', filter: `company_id=eq.${companyId}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const siteName = payload.new?.sites?.site_name || 'a site';
            const sev = payload.new?.severity || 'medium';
            setNewIncidentToast(`New incident logged at ${siteName} — ${sev}`);
          }
          loadIncidents();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, loadIncidents]);

  const addIncident = async (payload: IncidentForm) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        company_id: companyId,
        site_id: payload.site_id,
        guard_id: payload.guard_id || null,
        shift_id: payload.shift_id || null,
        incident_type: payload.incident_type,
        severity: payload.severity,
        title: payload.title || payload.incident_type,
        description: payload.description,
        location: payload.location || null,
        status: payload.status || 'open',
        occurred_at: payload.occurred_at,
        client_visible: payload.client_visible ?? true,
        requires_follow_up: payload.requires_follow_up ?? false,
        reported_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    return { data, error };
  };

  const updateIncident = async (id: string, payload: Partial<IncidentForm>) => {
    const { data, error } = await supabase
      .from('incidents')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    return { data, error };
  };

  return { incidents, loading, error, refetch: loadIncidents, addIncident, updateIncident, newIncidentToast, dismissToast: () => setNewIncidentToast(null) };
}

export const INCIDENT_TYPES = [
  'Trespass',
  'Theft',
  'Vandalism',
  'Assault',
  'Medical',
  'Fire/Smoke',
  'Suspicious Activity',
  'Lost Property',
  'Health & Safety',
  'Equipment Failure',
  'Property Damage',
  'Other',
];

export const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
};