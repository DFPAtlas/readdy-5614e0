'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface AdminSite {
  id: string;
  site_name: string;
  address: string | null;
  client_name: string | null;
  client_id: string | null;
  risk_level: string | null;
  check_call_interval: number | null;
  status: string | null;
  created_at: string;
  guard_count?: number;
}

export interface AdminClient {
  id: string;
  name: string;
  contact_email: string | null;
  contact_person: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
  site_count?: number;
  guard_count?: number;
  user_count?: number;
}

export interface AdminGuard {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  sia_licence: string | null;
  sia_expiry: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  status: string | null;
  created_at: string;
  site_names?: string[];
  site_ids?: string[];
}

export function useAdminData() {
  const { companyId, profile } = useAuth();
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [guards, setGuards] = useState<AdminGuard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile && ['super_admin', 'company_admin', 'operations_manager'].includes(profile.role);

  const fetchSites = useCallback(async () => {
    if (!companyId || !isAdmin) return;
    const { data, error } = await supabase
      .from('sites')
      .select('id, site_name, address, client_name, client_id, risk_level, check_call_interval, created_at')
      .eq('company_id', companyId)
      .order('site_name');
    if (error) throw error;

    // Get unique guard counts per site via shifts
    const siteIds = (data || []).map(s => s.id);
    let guardCounts: Record<string, number> = {};
    if (siteIds.length > 0) {
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('site_id, guard_id')
        .in('site_id', siteIds)
        .eq('company_id', companyId);
      const siteGuardSet: Record<string, Set<string>> = {};
      (shiftData || []).forEach((s: any) => {
        if (s.site_id && s.guard_id) {
          if (!siteGuardSet[s.site_id]) siteGuardSet[s.site_id] = new Set();
          siteGuardSet[s.site_id].add(s.guard_id);
        }
      });
      Object.entries(siteGuardSet).forEach(([sid, set]) => {
        guardCounts[sid] = set.size;
      });
    }

    setSites((data || []).map(s => ({ ...s, guard_count: guardCounts[s.id] || 0 })));
  }, [companyId, isAdmin]);

  const fetchClients = useCallback(async () => {
    if (!companyId || !isAdmin) return;
    const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name, contact_email, contact_person, contact_phone, status, created_at')
        .eq('company_id', companyId)
        .order('name');
    if (clientError) throw clientError;

    const clientList = clientData || [];
    const clientIds = clientList.map(c => c.id);

    // Site counts per client
    let siteCounts: Record<string, number> = {};
    if (clientIds.length > 0) {
      const { data: siteData } = await supabase
        .from('sites')
        .select('client_id')
        .in('client_id', clientIds)
        .eq('company_id', companyId);
      (siteData || []).forEach(s => {
        if (s.client_id) siteCounts[s.client_id] = (siteCounts[s.client_id] || 0) + 1;
      });
    }

    // User counts per client
    let userCounts: Record<string, number> = {};
    if (clientIds.length > 0) {
      const { data: cuData } = await supabase
        .from('client_users')
        .select('client_id')
        .in('client_id', clientIds);
      (cuData || []).forEach(cu => {
        if (cu.client_id) userCounts[cu.client_id] = (userCounts[cu.client_id] || 0) + 1;
      });
    }

    // Guard counts per client (unique guards at client's sites)
    let guardCounts: Record<string, number> = {};
    if (clientIds.length > 0) {
      const { data: siteIdsData } = await supabase
        .from('sites')
        .select('id, client_id')
        .in('client_id', clientIds)
        .eq('company_id', companyId);
      const clientSiteMap: Record<string, string[]> = {};
      (siteIdsData || []).forEach((s: any) => {
        if (s.client_id) {
          clientSiteMap[s.client_id] = clientSiteMap[s.client_id] || [];
          clientSiteMap[s.client_id].push(s.id);
        }
      });
      const allSiteIds = Object.values(clientSiteMap).flat();
      if (allSiteIds.length > 0) {
        const { data: shiftData } = await supabase
          .from('shifts')
          .select('site_id, guard_id')
          .in('site_id', allSiteIds)
          .eq('company_id', companyId);
        const clientGuardSet: Record<string, Set<string>> = {};
        (shiftData || []).forEach((s: any) => {
          if (s.site_id && s.guard_id) {
            Object.entries(clientSiteMap).forEach(([cid, sids]) => {
              if (sids.includes(s.site_id)) {
                if (!clientGuardSet[cid]) clientGuardSet[cid] = new Set();
                clientGuardSet[cid].add(s.guard_id);
              }
            });
          }
        });
        Object.entries(clientGuardSet).forEach(([cid, set]) => {
          guardCounts[cid] = set.size;
        });
      }
    }

    setClients(clientList.map(c => ({
      ...c,
      site_count: siteCounts[c.id] || 0,
      user_count: userCounts[c.id] || 0,
      guard_count: guardCounts[c.id] || 0,
    })));
  }, [companyId, isAdmin]);

  const fetchGuards = useCallback(async () => {
    if (!companyId || !isAdmin) return;
    const { data, error } = await supabase
      .from('guards')
      .select('id, user_id, first_name, last_name, email, phone, sia_licence, sia_expiry, hourly_rate, skills, status, created_at')
      .eq('company_id', companyId)
      .order('last_name', { ascending: true });
    if (error) throw error;

    // Get site assignments
    const guardIds = (data || []).map(g => g.id);
    let siteMap: Record<string, { name: string; id: string }[]> = {};
    if (guardIds.length > 0) {
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('guard_id, site_id, sites!shifts_site_id_fkey(site_name)')
        .in('guard_id', guardIds)
        .eq('company_id', companyId);
      (shiftData || []).forEach((s: any) => {
        if (s.guard_id && s.site_id) {
          const siteName = s.sites?.site_name || 'Unknown Site';
          siteMap[s.guard_id] = siteMap[s.guard_id] || [];
          if (!siteMap[s.guard_id].find((x: any) => x.id === s.site_id)) {
            siteMap[s.guard_id].push({ name: siteName, id: s.site_id });
          }
        }
      });
    }

    setGuards((data || []).map(g => ({
      ...g,
      site_names: siteMap[g.id]?.map(s => s.name) || [],
      site_ids: siteMap[g.id]?.map(s => s.id) || [],
    })));
  }, [companyId, isAdmin]);

  const refresh = useCallback(async () => {
    if (!companyId || !isAdmin) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchSites(), fetchClients(), fetchGuards()]);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [companyId, isAdmin, fetchSites, fetchClients, fetchGuards]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createSite = async (siteData: Partial<AdminSite>) => {
    if (!companyId) return { error: 'No company' };
    const { data, error } = await supabase
      .from('sites')
      .insert({ ...siteData, company_id: companyId })
      .select()
      .maybeSingle();
    if (error) return { error: error.message };
    await fetchSites();
    return { data, error: null };
  };

  const updateSite = async (id: string, updates: Partial<AdminSite>) => {
    const { error } = await supabase.from('sites').update(updates).eq('id', id);
    if (error) return { error: error.message };
    await fetchSites();
    return { error: null };
  };

  const deleteSite = async (id: string) => {
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (error) return { error: error.message };
    await fetchSites();
    return { error: null };
  };

  const createClient = async (clientData: Partial<AdminClient>) => {
    if (!companyId) return { error: 'No company' };
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...clientData, company_id: companyId, status: 'active' })
      .select()
      .maybeSingle();
    if (error) return { error: error.message };
    await fetchClients();
    return { data, error: null };
  };

  const updateClient = async (id: string, updates: Partial<AdminClient>) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', id);
    if (error) return { error: error.message };
    await fetchClients();
    return { error: null };
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) return { error: error.message };
    await fetchClients();
    return { error: null };
  };

  const createGuard = async (guardData: Partial<AdminGuard>) => {
    if (!companyId) return { error: 'No company' };
    const { data, error } = await supabase
      .from('guards')
      .insert({ ...guardData, company_id: companyId, status: 'active' })
      .select()
      .maybeSingle();
    if (error) return { error: error.message };
    await fetchGuards();
    return { data, error: null };
  };

  const updateGuard = async (id: string, updates: Partial<AdminGuard>) => {
    const { error } = await supabase.from('guards').update(updates).eq('id', id);
    if (error) return { error: error.message };
    await fetchGuards();
    return { error: null };
  };

  const deleteGuard = async (id: string) => {
    const { error } = await supabase.from('guards').delete().eq('id', id);
    if (error) return { error: error.message };
    await fetchGuards();
    return { error: null };
  };

  const getGuardsByClient = (clientId: string): AdminGuard[] => {
    const clientSiteIds = sites.filter(s => s.client_id === clientId).map(s => s.id);
    return guards.filter(g => g.site_ids?.some(sid => clientSiteIds.includes(sid)));
  };

  const getSitesByClient = (clientId: string): AdminSite[] => {
    return sites.filter(s => s.client_id === clientId);
  };

  return {
    sites,
    clients,
    guards,
    loading,
    error,
    refresh,
    createSite,
    updateSite,
    deleteSite,
    createClient,
    updateClient,
    deleteClient,
    createGuard,
    updateGuard,
    deleteGuard,
    getGuardsByClient,
    getSitesByClient,
  };
}