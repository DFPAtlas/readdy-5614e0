'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface AdminCompany {
  id: string;
  name: string;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  subscription_plan: string | null;
  plan_name: string | null;
  account_status: string;
  onboarding_status: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  subscription_period_end: string | null;
  subscription_cancel_at: string | null;
  suspended_at: string | null;
  cancelled_at: string | null;
  archived_at: string | null;
  created_at: string;
  created_by: string | null;
  brand_color: string | null;
  site_count: number;
  user_count: number;
  guard_count: number;
  last_login: string | null;
  owner_name: string | null;
  owner_email: string | null;
}

export interface AdminSite {
  id: string;
  site_name: string | null;
  address: string | null;
  risk_level: string | null;
  status: string | null;
  company_id: string | null;
  company_name: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  status: string | null;
  company_id: string | null;
  company_name: string | null;
  last_sign_in_at: string | null;
  created_at: string;
}

export interface PlatformStats {
  totalClients: number;
  activeClients: number;
  pendingSetup: number;
  suspended: number;
  cancelled: number;
  archived: number;
  totalSites: number;
  totalUsers: number;
  totalGuards: number;
  recentSignups: number;
  trialCount: number;
  failedBilling: number;
}

export function useSuperAdminCompanies() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('companies')
        .select(`
          *,
          sites:sites(id),
          users:users(id, role, first_name, last_name, email),
          guards:guards(id)
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped: AdminCompany[] = (data || []).map((c: any) => {
        const owner = c.users?.find((u: any) => u.role === 'company_admin') || c.users?.[0];
        return {
          ...c,
          site_count: c.sites?.length || 0,
          user_count: c.users?.length || 0,
          guard_count: c.guards?.length || 0,
          owner_name: owner ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() : null,
          owner_email: owner?.email || null,
          last_login: null,
        };
      });

      setCompanies(mapped);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const updateCompany = async (id: string, updates: Partial<AdminCompany>) => {
    const { error: err } = await supabase.from('companies').update(updates).eq('id', id);
    if (err) throw err;
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  return { companies, loading, error, refetch: fetchCompanies, updateCompany };
}

export function useSuperAdminStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalClients: 0,
    activeClients: 0,
    pendingSetup: 0,
    suspended: 0,
    cancelled: 0,
    archived: 0,
    totalSites: 0,
    totalUsers: 0,
    totalGuards: 0,
    recentSignups: 0,
    trialCount: 0,
    failedBilling: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: companies } = await supabase.from('companies').select('*');
        const { data: sites } = await supabase.from('sites').select('id');
        const { data: users } = await supabase.from('users').select('id, role');
        const { data: guards } = await supabase.from('guards').select('id');

        const list = companies || [];
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setStats({
          totalClients: list.length,
          activeClients: list.filter((c: any) => c.account_status === 'active').length,
          pendingSetup: list.filter((c: any) => c.account_status === 'pending_setup').length,
          suspended: list.filter((c: any) => c.account_status === 'suspended').length,
          cancelled: list.filter((c: any) => c.account_status === 'cancelled').length,
          archived: list.filter((c: any) => c.account_status === 'archived').length,
          totalSites: sites?.length || 0,
          totalUsers: users?.length || 0,
          totalGuards: guards?.length || 0,
          recentSignups: list.filter((c: any) => new Date(c.created_at) > sevenDaysAgo).length,
          trialCount: list.filter((c: any) => c.trial_ends_at && new Date(c.trial_ends_at) > now).length,
          failedBilling: list.filter(
            (c: any) => c.subscription_status === 'past_due' || c.subscription_status === 'unpaid'
          ).length,
        });
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  return { stats, loading };
}

export function useAdminSites() {
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('sites')
        .select('*, company:company_id(name)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (err) {
        setError(err.message);
      } else {
        setSites(
          (data || []).map((s: any) => ({
            id: s.id,
            site_name: s.site_name,
            address: s.address,
            risk_level: s.risk_level,
            status: s.status || 'active',
            company_id: s.company_id,
            company_name: s.company?.name || null,
            created_at: s.created_at,
          }))
        );
      }
      setLoading(false);
    };
    fetchSites();
  }, []);

  return { sites, loading, error };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('users')
      .select('*, companies:company_id(name)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (err) {
      setError(err.message);
    } else {
      setUsers(
        (data || []).map((u: any) => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          role: u.role,
          status: u.status,
          company_id: u.company_id,
          company_name: u.companies?.name || null,
          created_at: u.created_at,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
}

export function useAdminNotes(companyId: string | null) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('admin_notes')
      .select('*, created_by_profile:users(first_name, last_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  };

  const addNote = async (note: string, category: string, createdBy: string) => {
    if (!companyId) return;
    const { data, error } = await supabase
      .from('admin_notes')
      .insert({ company_id: companyId, note, category, created_by: createdBy })
      .select()
      .maybeSingle();
    if (!error && data) setNotes((prev) => [data, ...prev]);
  };

  useEffect(() => {
    fetchNotes();
  }, [companyId]);

  return { notes, loading, addNote, refetch: fetchNotes };
}

export function useAdminActivity(companyId?: string | null) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('admin_activity_log')
      .select('*, performed_by_profile:users(first_name, last_name), company:companies(name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (companyId) query = query.eq('company_id', companyId);
    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  };

  const logAction = async (
    action: string,
    description: string,
    companyId: string | null,
    performedBy: string,
    metadata?: any
  ) => {
    await supabase.from('admin_activity_log').insert({
      action,
      description,
      company_id: companyId,
      performed_by: performedBy,
      metadata,
    });
  };

  useEffect(() => {
    fetchLogs();
  }, [companyId]);

  return { logs, loading, refetch: fetchLogs, logAction };
}

export function useAdminModules(companyId: string | null) {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchModules = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data: allModules } = await supabase.from('modules').select('*').order('name');
    const { data: enabled } = await supabase
      .from('company_enabled_modules')
      .select('module_id, enabled')
      .eq('company_id', companyId);

    const enabledMap = new Map((enabled || []).map((e: any) => [e.module_id, e.enabled]));

    setModules(
      (allModules || []).map((m: any) => ({
        ...m,
        company_enabled: enabledMap.get(m.id) ?? true,
      }))
    );
    setLoading(false);
  };

  const toggleModule = async (moduleId: string, enabled: boolean) => {
    if (!companyId) return;
    if (enabled) {
      await supabase
        .from('company_enabled_modules')
        .upsert({ company_id: companyId, module_id: moduleId, enabled: true }, { onConflict: 'company_id,module_id' });
    } else {
      await supabase
        .from('company_enabled_modules')
        .upsert({ company_id: companyId, module_id: moduleId, enabled: false }, { onConflict: 'company_id,module_id' });
    }
    fetchModules();
  };

  useEffect(() => {
    fetchModules();
  }, [companyId]);

  return { modules, loading, toggleModule, refetch: fetchModules };
}