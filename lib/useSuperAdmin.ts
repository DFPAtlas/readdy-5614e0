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

export interface AdminGuard {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  sia_licence: string | null;
  sia_expiry: string | null;
  hourly_rate: number | null;
  position: string | null;
  company_id: string | null;
  company_name: string | null;
  user_id: string | null;
  created_at: string;
}

export interface SystemHealth {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  activeUsersToday: number;
  totalGuards: number;
  totalSites: number;
  totalTickets: number;
  openTickets: number;
  urgentTickets: number;
  webhookTotal: number;
  webhookFailed: number;
  webhookLast24h: number;
  webhookFailed24h: number;
  failedBilling: number;
  overdueAmount: number;
  edgeFunctions: { name: string; slug: string }[];
  dbResponseMs: number | null;
  healthScore: number;
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

export function useSuperAdminGuards() {
  const [guards, setGuards] = useState<AdminGuard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuards = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('guards')
        .select('*, company:company_id(name)')
        .order('created_at', { ascending: false });

      if (err) throw err;

      setGuards(
        (data || []).map((g: any) => ({
          id: g.id,
          first_name: g.first_name,
          last_name: g.last_name,
          email: g.email,
          phone: g.phone,
          status: g.status || 'active',
          sia_licence: g.sia_licence,
          sia_expiry: g.sia_expiry,
          hourly_rate: g.hourly_rate,
          position: g.position,
          company_id: g.company_id,
          company_name: g.company?.name || null,
          user_id: g.user_id,
          created_at: g.created_at,
        }))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuards();
  }, []);

  return { guards, loading, error, refetch: fetchGuards };
}

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    activeUsersToday: 0,
    totalGuards: 0,
    totalSites: 0,
    totalTickets: 0,
    openTickets: 0,
    urgentTickets: 0,
    webhookTotal: 0,
    webhookFailed: 0,
    webhookLast24h: 0,
    webhookFailed24h: 0,
    failedBilling: 0,
    overdueAmount: 0,
    edgeFunctions: [],
    dbResponseMs: null,
    healthScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const startTime = performance.now();

        const [
          { data: companies },
          { data: users },
          { data: guards },
          { data: sites },
          { count: ticketCount },
          { count: openTicketCount },
          { count: urgentTicketCount },
          { count: webhookTotal },
          { count: webhookFailed },
          { count: webhook24h },
          { count: webhookFailed24h },
          { data: overdueData },
        ] = await Promise.all([
          supabase.from('companies').select('id, account_status, subscription_status'),
          supabase.from('users').select('id, last_sign_in_at'),
          supabase.from('guards').select('id'),
          supabase.from('sites').select('id'),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['new', 'open', 'in_progress']),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('priority', 'urgent').in('status', ['new', 'open', 'in_progress']),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }).not('error', 'is', null),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }).gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }).gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).not('error', 'is', null),
          supabase.from('v_billing_overdue').select('amount_due').limit(5000),
        ]);

        const endTime = performance.now();
        const dbMs = Math.round(endTime - startTime);

        const companyList = companies || [];
        const userList = users || [];
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const activeUsersToday = userList.filter((u: any) => u.last_sign_in_at && u.last_sign_in_at >= todayStart).length;

        const failedBilling = companyList.filter(
          (c: any) => c.subscription_status === 'past_due' || c.subscription_status === 'unpaid'
        ).length;

        const overdueSum = (overdueData || []).reduce((s: number, r: any) => s + (r.amount_due || 0), 0);

        const activeCompanies = companyList.filter((c: any) => c.account_status === 'active').length;

        const totalEvents = webhookTotal || 0;
        const failedEvents = webhookFailed || 0;
        const webhookSuccessRate = totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents) * 100 : 100;
        const billingHealth = companyList.length > 0 ? ((companyList.length - failedBilling) / companyList.length) * 100 : 100;
        const ticketHealth = (ticketCount || 0) > 0 ? Math.max(0, 100 - ((openTicketCount || 0) / (ticketCount || 1)) * 40) : 100;
        const dbHealth = dbMs < 500 ? 100 : dbMs < 1000 ? 80 : dbMs < 2000 ? 60 : 30;
        const healthScore = Math.round((webhookSuccessRate * 0.2 + billingHealth * 0.3 + ticketHealth * 0.2 + dbHealth * 0.15 + (activeCompanies > 0 ? 15 : 0)));

        const knownFunctions = [
          { name: 'Generate Incident PDF', slug: 'generate-incident-pdf' },
          { name: 'Get Incident Report Data', slug: 'get-incident-report-data' },
          { name: 'Generate Weekly Site Report', slug: 'generate-weekly-site-report' },
          { name: 'Weekly Site Reports Scheduler', slug: 'weekly-site-reports-scheduler' },
          { name: 'Get Client Clocking', slug: 'get-client-clocking' },
          { name: 'Ops Signup', slug: 'ops-signup' },
          { name: 'AI Summarize OB Entry', slug: 'ai-summarize-ob-entry' },
          { name: 'AI Summarize Day', slug: 'ai-summarize-day' },
          { name: 'AI Suggest Staffing', slug: 'ai-suggest-staffing' },
          { name: 'AI Score Site Risk', slug: 'ai-score-site-risk' },
          { name: 'Site Risk Scores Scheduler', slug: 'site-risk-scores-scheduler' },
          { name: 'SOP Process Document', slug: 'sop-process-document' },
          { name: 'SOP Query', slug: 'sop-query' },
          { name: 'AI Index SOP Document', slug: 'ai-index-sop-document' },
          { name: 'AI Ask SOP', slug: 'ai-ask-sop' },
          { name: 'Send Notification Email', slug: 'send-notification-email' },
          { name: 'Create Stripe Checkout Session', slug: 'create-checkout-session' },
          { name: 'Create Portal Session', slug: 'create-portal-session' },
          { name: 'AI Sick Cover', slug: 'ai-sick-cover' },
          { name: 'AI Improve SOP', slug: 'ai-improve-sop' },
          { name: 'Has Permission', slug: 'has-permission' },
          { name: 'Test OpenAI Config', slug: 'test-openai-config' },
          { name: 'Save OpenAI Key', slug: 'save-openai-key' },
          { name: 'Client Invite User', slug: 'client-invite-user' },
          { name: 'Create Demo Admin', slug: 'create-demo-admin' },
          { name: 'Seed Admin Data', slug: 'seed-admin-data' },
          { name: 'Save API Key', slug: 'save-api-key' },
          { name: 'Test API Key', slug: 'test-api-key' },
          { name: 'Admin Invite User', slug: 'admin-invite-user' },
          { name: 'Admin Resend Invite', slug: 'admin-resend-invite' },
          { name: 'Stripe Webhook Handler', slug: 'stripe-webhook' },
          { name: 'Financial CSV Export', slug: 'financial-export-csv' },
          { name: 'Financial PDF Export', slug: 'financial-export-pdf' },
          { name: 'Stripe Backfill Data', slug: 'stripe-backfill' },
          { name: 'Ticket AI Check', slug: 'ticket-ai-check' },
          { name: 'Stripe Webhook Test', slug: 'stripe-webhook-test' },
          { name: 'Stripe Setup Webhook', slug: 'stripe-setup-webhook' },
          { name: 'Guard Scan Checkpoint', slug: 'guard-scan-checkpoint' },
          { name: 'AI ACS Readiness Scan', slug: 'ai-acs-readiness' },
          { name: 'AI Operations Copilot', slug: 'operations-copilot' },
          { name: 'Send Welcome Email', slug: 'send-welcome-email' },
          { name: 'GuardianHub Agent Proxy', slug: 'guardianhub-agent-proxy' },
        ];

        setHealth({
          totalCompanies: companyList.length,
          activeCompanies,
          totalUsers: userList.length,
          activeUsersToday,
          totalGuards: guards?.length || 0,
          totalSites: sites?.length || 0,
          totalTickets: ticketCount || 0,
          openTickets: openTicketCount || 0,
          urgentTickets: urgentTicketCount || 0,
          webhookTotal: totalEvents,
          webhookFailed: failedEvents,
          webhookLast24h: webhook24h || 0,
          webhookFailed24h: webhookFailed24h || 0,
          failedBilling,
          overdueAmount: overdueSum,
          edgeFunctions: knownFunctions,
          dbResponseMs: dbMs,
          healthScore,
        });
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  return { health, loading };
}