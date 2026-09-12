'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface Site {
  id: string;
  company_id: string | null;
  client_id: string | null;
  site_name: string;
  client_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  risk_level: string | null;
  check_call_interval: number | null;
  client_logo_url: string | null;
  client_contact_email: string | null;
  client_contact_name: string | null;
  created_at: string;
  required_skills?: string[] | null;
  banned_guard_ids?: string[] | null;
  preferred_guard_ids?: string[] | null;
  assignment_instructions?: string | null;
  site_contact_phone?: string | null;
  region?: string | null;
  site_contact_name?: string | null;
  site_contact_email?: string | null;
  emergency_contact?: string | null;
  patrol_enabled?: boolean | null;
  patrol_interval?: number | null;
  status?: string | null;
  site_type?: string | null;
  postcode?: string | null;
}

export function useSites() {
  const { companyId } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSites = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('sites')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setSites((data || []).filter((d): d is Site => d != null && typeof d === 'object' && 'id' in d && 'site_name' in d));
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    loadSites();
    const channel = supabase
      .channel('sites-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sites', filter: `company_id=eq.${companyId}` },
        () => loadSites()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, loadSites]);

  const addSite = async (payload: Omit<Site, 'id' | 'company_id' | 'created_at'>) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase.from('sites').insert({ ...payload, company_id: companyId }).select().maybeSingle();
    return { data, error };
  };

  const updateSite = async (id: string, payload: Partial<Omit<Site, 'id' | 'company_id' | 'created_at'>>) => {
    const { data, error } = await supabase.from('sites').update(payload).eq('id', id).select().maybeSingle();
    return { data, error };
  };

  const deleteSite = async (id: string) => {
    const { error } = await supabase.from('sites').delete().eq('id', id);
    return { error };
  };

  return { sites, loading, error, refetch: loadSites, addSite, updateSite, deleteSite };
}