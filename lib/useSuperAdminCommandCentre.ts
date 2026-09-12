'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface CommandCentreFinancials {
  mrrTotal: number;
  activeSubs: number;
  trialingSubs: number;
  atRiskSubs: number;
  revenueThisMonth: number;
  paidInvoices: number;
  failedPayments: number;
  overdueTotal: number;
  refundsThisMonth: number;
  disputesOpen: number;
  vatThisMonth: number;
  webhookTotal: number;
  webhookFailed: number;
  webhookLast24h: number;
  webhookFailed24h: number;
}

export interface CommandCentreAgents {
  registered: number;
  enabled: number;
  failed24h: number;
  pendingWebhooks: number;
  lastSuccess: { agent_key: string; created_at: string } | null;
  lastFailed: { agent_key: string; error_message: string | null; created_at: string } | null;
  agentList: { agent_key: string; agent_name: string; is_active: boolean; description: string | null }[];
}

export interface CommandCentreClientActivity {
  newest: { id: string; name: string; created_at: string; plan_name: string | null }[];
  noSubscription: { id: string; name: string; account_status: string }[];
  failedPayment: { id: string; name: string; subscription_status: string }[];
  noSites: { id: string; name: string; account_status: string }[];
  noGuards: { id: string; name: string; account_status: string }[];
  sitesWithIncidents: { id: string; site_name: string; company_name: string; incident_count: number }[];
}

export interface CommandCentrePlatformHealth {
  dbReachable: boolean;
  authReachable: boolean;
  dbResponseMs: number | null;
  agentFailures24h: number;
  supportBacklog: number;
  emailFailures24h: number;
  recentErrors: { message: string; created_at: string }[];
}

export function useCommandCentreFinancials() {
  const [data, setData] = useState<CommandCentreFinancials>({
    mrrTotal: 0, activeSubs: 0, trialingSubs: 0, atRiskSubs: 0,
    revenueThisMonth: 0, paidInvoices: 0, failedPayments: 0,
    overdueTotal: 0, refundsThisMonth: 0, disputesOpen: 0,
    vatThisMonth: 0, webhookTotal: 0, webhookFailed: 0,
    webhookLast24h: 0, webhookFailed24h: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          { data: mrrData },
          { data: revData },
          { count: paidCount },
          { count: failedCount },
          { data: overdueData },
          { count: disputeCount },
          { count: whTotal },
          { count: whFailed },
          { count: wh24h },
          { count: whFailed24h },
        ] = await Promise.all([
          supabase.from('v_billing_mrr_current').select('*'),
          supabase.from('v_billing_revenue_monthly').select('*').order('month', { ascending: false }).limit(1),
          supabase.from('billing_invoices').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
          supabase.from('billing_invoices').select('*', { count: 'exact', head: true }).in('status', ['open', 'uncollectible']),
          supabase.from('v_billing_overdue').select('amount_due, currency').limit(5000),
          supabase.from('billing_disputes').select('*', { count: 'exact', head: true }).in('status', ['needs_response', 'under_review', 'warning_needs_response', 'warning_under_review']),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }).not('error', 'is', null),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }).gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('billing_webhook_events').select('*', { count: 'exact', head: true }).gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).not('error', 'is', null),
        ]);

        const totalActive = (mrrData || []).reduce((s: number, r: any) => s + (r.active_subs || 0), 0);
        const totalTrialing = (mrrData || []).reduce((s: number, r: any) => s + (r.trialing_subs || 0), 0);
        const totalAtRisk = (mrrData || []).reduce((s: number, r: any) => s + (r.at_risk_subs || 0), 0);
        const currentMonth = revData?.[0];
        const revGross = currentMonth ? currentMonth.gross_pence : 0;
        const revVat = currentMonth ? currentMonth.vat_pence : 0;
        const overdueSum = (overdueData || []).reduce((s: number, r: any) => s + (r.amount_due || 0), 0);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: refundsMonth } = await supabase
          .from('billing_refunds')
          .select('amount')
          .gte('created_at', startOfMonth)
          .limit(5000);
        const refundSum = (refundsMonth || []).reduce((s: number, r: any) => s + (r.amount || 0), 0);

        setData({
          mrrTotal: revGross,
          activeSubs: totalActive,
          trialingSubs: totalTrialing,
          atRiskSubs: totalAtRisk,
          revenueThisMonth: revGross,
          paidInvoices: paidCount || 0,
          failedPayments: failedCount || 0,
          overdueTotal: overdueSum,
          refundsThisMonth: refundSum,
          disputesOpen: disputeCount || 0,
          vatThisMonth: revVat,
          webhookTotal: whTotal || 0,
          webhookFailed: whFailed || 0,
          webhookLast24h: wh24h || 0,
          webhookFailed24h: whFailed24h || 0,
        });
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  return { financials: data, loading };
}

export function useCommandCentreAgents() {
  const [data, setData] = useState<CommandCentreAgents>({
    registered: 0, enabled: 0, failed24h: 0, pendingWebhooks: 0,
    lastSuccess: null, lastFailed: null, agentList: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [{ data: registry }, { data: failedLogs }, { data: successLogs }, { count: pendingCount }] = await Promise.all([
          supabase.from('agent_registry').select('*').order('agent_key'),
          supabase.from('agent_execution_logs').select('agent_key, error_message, created_at').eq('status', 'failed').order('created_at', { ascending: false }).limit(1),
          supabase.from('agent_execution_logs').select('agent_key, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(1),
          supabase.from('agent_webhook_events').select('*', { count: 'exact', head: true }).eq('processed', false),
        ]);

        const { count: fail24hCount } = await supabase
          .from('agent_execution_logs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'failed')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        setData({
          registered: (registry || []).length,
          enabled: (registry || []).filter((a: any) => a.is_active).length,
          failed24h: fail24hCount || 0,
          pendingWebhooks: pendingCount || 0,
          lastSuccess: successLogs?.[0] ? { agent_key: successLogs[0].agent_key, created_at: successLogs[0].created_at } : null,
          lastFailed: failedLogs?.[0] ? { agent_key: failedLogs[0].agent_key, error_message: failedLogs[0].error_message, created_at: failedLogs[0].created_at } : null,
          agentList: (registry || []).map((a: any) => ({
            agent_key: a.agent_key,
            agent_name: a.agent_name,
            is_active: a.is_active,
            description: a.description,
          })),
        });
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  return { agents: data, loading };
}

export function useCommandCentreClientActivity() {
  const [data, setData] = useState<CommandCentreClientActivity>({
    newest: [], noSubscription: [], failedPayment: [], noSites: [], noGuards: [], sitesWithIncidents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, account_status, subscription_status, plan_name, created_at')
          .order('created_at', { ascending: false });

        const { data: sites } = await supabase.from('sites').select('id, site_name, company_id, companies!sites_company_id_fkey(name)');

        const { data: guards } = await supabase.from('guards').select('id, company_id');

        const companyList = companies || [];
        const siteList = sites || [];
        const guardList = guards || [];

        const companySiteCount: Record<string, number> = {};
        siteList.forEach((s: any) => {
          if (s.company_id) companySiteCount[s.company_id] = (companySiteCount[s.company_id] || 0) + 1;
        });
        const companyGuardCount: Record<string, number> = {};
        guardList.forEach((g: any) => {
          if (g.company_id) companyGuardCount[g.company_id] = (companyGuardCount[g.company_id] || 0) + 1;
        });

        const newest = companyList.slice(0, 5).map((c: any) => ({ id: c.id, name: c.name, created_at: c.created_at, plan_name: c.plan_name }));
        const noSubscription = companyList.filter((c: any) => !c.subscription_status || c.subscription_status === 'incomplete').slice(0, 5).map((c: any) => ({ id: c.id, name: c.name, account_status: c.account_status }));
        const failedPayment = companyList.filter((c: any) => c.subscription_status === 'past_due' || c.subscription_status === 'unpaid').slice(0, 5).map((c: any) => ({ id: c.id, name: c.name, subscription_status: c.subscription_status }));
        const noSites = companyList.filter((c: any) => !companySiteCount[c.id]).slice(0, 5).map((c: any) => ({ id: c.id, name: c.name, account_status: c.account_status }));
        const noGuards = companyList.filter((c: any) => !companyGuardCount[c.id]).slice(0, 5).map((c: any) => ({ id: c.id, name: c.name, account_status: c.account_status }));

        const siteIncidentCounts: Record<string, { site_name: string; company_name: string; incident_count: number }> = {};
        const { data: openIncidents } = await supabase
          .from('incidents')
          .select('site_id, sites!incidents_site_id_fkey(site_name, company_id)')
          .in('status', ['new', 'open', 'in_progress'])
          .limit(200);
        const companyIds: Set<string> = new Set();
        (openIncidents || []).forEach((inc: any) => {
          if (inc.sites?.company_id) companyIds.add(inc.sites.company_id);
        });
        const { data: companyData } = companyIds.size > 0
          ? await supabase.from('companies').select('id, name').in('id', Array.from(companyIds))
          : { data: [] };
        const companyMap: Record<string, string> = {};
        (companyData || []).forEach((c: any) => { companyMap[c.id] = c.name; });
        (openIncidents || []).forEach((inc: any) => {
          if (inc.site_id) {
            const sn = inc.sites?.site_name || 'Unknown';
            const cn = companyMap[inc.sites?.company_id] || 'Unknown';
            if (!siteIncidentCounts[inc.site_id]) {
              siteIncidentCounts[inc.site_id] = { site_name: sn, company_name: cn, incident_count: 0 };
            }
            siteIncidentCounts[inc.site_id].incident_count++;
          }
        });
        const sitesWithIncidents = Object.entries(siteIncidentCounts)
          .sort((a, b) => b[1].incident_count - a[1].incident_count)
          .slice(0, 5)
          .map(([id, info]) => ({ id, site_name: info.site_name, company_name: info.company_name, incident_count: info.incident_count }));

        setData({ newest, noSubscription, failedPayment, noSites, noGuards, sitesWithIncidents });
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  return { clientActivity: data, loading };
}

export function useCommandCentrePlatformHealth() {
  const [data, setData] = useState<CommandCentrePlatformHealth>({
    dbReachable: false, authReachable: false, dbResponseMs: null,
    agentFailures24h: 0, supportBacklog: 0, emailFailures24h: 0, recentErrors: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const dbStart = performance.now();
        const { data: dbCheck } = await supabase.from('companies').select('id').limit(1);
        const dbEnd = performance.now();
        const dbMs = Math.round(dbEnd - dbStart);

        const { data: authCheck } = await supabase.from('users').select('id').limit(1);

        const { count: agentFail } = await supabase
          .from('agent_execution_logs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'failed')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const { count: supportBacklog } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .in('status', ['new', 'open']);

        const { data: emailFails } = await supabase
          .from('notification_deliveries')
          .select('id')
          .eq('status', 'failed')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const { data: webhookErrors } = await supabase
          .from('billing_webhook_events')
          .select('error, received_at')
          .not('error', 'is', null)
          .order('received_at', { ascending: false })
          .limit(5);

        setData({
          dbReachable: !!dbCheck,
          authReachable: !!authCheck,
          dbResponseMs: dbMs,
          agentFailures24h: agentFail || 0,
          supportBacklog: supportBacklog || 0,
          emailFailures24h: emailFails?.length || 0,
          recentErrors: (webhookErrors || []).map((e: any) => ({ message: e.error, created_at: e.received_at })),
        });
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  return { platformHealth: data, loading };
}