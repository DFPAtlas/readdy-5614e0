'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface LoneWorkerAlert {
  id: string;
  guard_name: string;
  site_name: string;
  status: string;
  missed_check_ins: number;
  last_check_in_at: string | null;
  next_check_in_due_at: string | null;
  alarm_triggered: boolean;
  escalation_level: number;
}

export interface UnreadClientMessage {
  id: string;
  subject: string;
  from_client_name: string;
  site_name: string;
  created_at: string;
  is_from_client: boolean;
}

export interface PendingLeaveRequest {
  id: string;
  guard_name: string;
  site_name: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface ComplianceExpiry {
  id: string;
  document_title: string;
  document_type: string;
  entity_type: string;
  expiry_date: string;
  days_remaining: number;
  status: string;
}

export interface AgentHealth {
  registered_agents: number;
  last_execution_at: string | null;
  last_execution_status: string | null;
  failed_executions_24h: number;
  pending_webhook_events: number;
  agents: { agent_key: string; agent_name: string; is_active: boolean }[];
}

export interface CommandCentreExtendedData {
  loneWorkerAlerts: LoneWorkerAlert[];
  unreadClientMessages: UnreadClientMessage[];
  pendingLeaveRequests: PendingLeaveRequest[];
  complianceExpiries: ComplianceExpiry[];
  agentHealth: AgentHealth | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCommandCentreExtended(): CommandCentreExtendedData {
  const { companyId } = useAuth();
  const [loneWorkerAlerts, setLoneWorkerAlerts] = useState<LoneWorkerAlert[]>([]);
  const [unreadClientMessages, setUnreadClientMessages] = useState<UnreadClientMessage[]>([]);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<PendingLeaveRequest[]>([]);
  const [complianceExpiries, setComplianceExpiries] = useState<ComplianceExpiry[]>([]);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const results = await Promise.allSettled([
        supabase.from('lone_worker_sessions')
          .select('id, guard_id, site_id, status, missed_check_ins, last_check_in_at, next_check_in_due_at, alarm_triggered_at, escalation_level, guards(first_name, last_name), sites(site_name)')
          .eq('company_id', companyId)
          .eq('status', 'active')
          .order('alarm_triggered_at', { ascending: false, nullsFirst: false })
          .limit(20),

        supabase.from('client_messages')
          .select('id, subject, site_id, is_from_client, created_at, read_at, sites(site_name), clients(name)')
          .eq('company_id', companyId)
          .is('read_at', null)
          .order('created_at', { ascending: false })
          .limit(20),

        supabase.from('leave_requests')
          .select('id, guard_id, site_id, start_time, end_time, reason, status, created_at, guards(first_name, last_name), sites(site_name)')
          .eq('company_id', companyId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(20),

        supabase.from('compliance_documents')
          .select('id, document_title, document_type, entity_type, expiry_date, status')
          .eq('company_id', companyId)
          .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .gte('expiry_date', now.toISOString().split('T')[0])
          .order('expiry_date', { ascending: true })
          .limit(20),

        supabase.from('agent_registry')
          .select('agent_key, agent_name, is_active')
          .order('agent_key', { ascending: true }),

        supabase.from('agent_execution_logs')
          .select('id, agent_key, status, created_at')
          .eq('client_id', companyId)
          .order('created_at', { ascending: false })
          .limit(50),

        supabase.from('agent_webhook_events')
          .select('id, agent_key, processed, created_at')
          .eq('client_id', companyId)
          .eq('processed', false)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const [loneRes, msgsRes, leaveRes, compRes, agentRegRes, agentExecRes, agentWebhookRes] = results.map(
        (r: any) => r.status === 'fulfilled' ? r.value : { data: [], error: null }
      );

      const lwAlerts: LoneWorkerAlert[] = (loneRes.data || []).map((s: any) => ({
        id: s.id,
        guard_name: s.guards ? `${s.guards.first_name || ''} ${s.guards.last_name || ''}`.trim() || 'Unknown Guard' : 'Unknown Guard',
        site_name: s.sites?.site_name || 'Unknown Site',
        status: s.status,
        missed_check_ins: s.missed_check_ins || 0,
        last_check_in_at: s.last_check_in_at,
        next_check_in_due_at: s.next_check_in_due_at,
        alarm_triggered: !!s.alarm_triggered_at,
        escalation_level: s.escalation_level || 0,
      }));

      const msgs: UnreadClientMessage[] = (msgsRes.data || []).map((m: any) => ({
        id: m.id,
        subject: m.subject,
        from_client_name: m.clients?.name || (m.is_from_client ? 'Client' : 'Internal'),
        site_name: m.sites?.site_name || 'Unknown',
        created_at: m.created_at,
        is_from_client: m.is_from_client,
      }));

      const leaves: PendingLeaveRequest[] = (leaveRes.data || []).map((l: any) => ({
        id: l.id,
        guard_name: l.guards ? `${l.guards.first_name || ''} ${l.guards.last_name || ''}`.trim() || 'Unknown Guard' : 'Unknown Guard',
        site_name: l.sites?.site_name || 'Unknown',
        start_time: l.start_time,
        end_time: l.end_time,
        reason: l.reason || 'Not specified',
        status: l.status,
        created_at: l.created_at,
      }));

      const comps: ComplianceExpiry[] = (compRes.data || []).map((d: any) => {
        const expDate = new Date(d.expiry_date);
        const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: d.id,
          document_title: d.document_title,
          document_type: d.document_type,
          entity_type: d.entity_type,
          expiry_date: d.expiry_date,
          days_remaining: daysRemaining,
          status: d.status,
        };
      });

      const agents = agentRegRes.data || [];
      const execLogs = agentExecRes.data || [];
      const webhookEvents = agentWebhookRes.data || [];

      const failed24h = execLogs.filter((e: any) =>
        e.status === 'failed' && new Date(e.created_at) > twentyFourHoursAgo
      ).length;

      const lastExec = execLogs.length > 0 ? execLogs[0] : null;

      setAgentHealth({
        registered_agents: agents.length,
        last_execution_at: lastExec?.created_at || null,
        last_execution_status: lastExec?.status || null,
        failed_executions_24h: failed24h,
        pending_webhook_events: webhookEvents.length,
        agents: agents.map((a: any) => ({
          agent_key: a.agent_key,
          agent_name: a.agent_name,
          is_active: a.is_active,
        })),
      });

      setLoneWorkerAlerts(lwAlerts);
      setUnreadClientMessages(msgs);
      setPendingLeaveRequests(leaves);
      setComplianceExpiries(comps);
    } catch (err: any) {
      setError(err.message || 'Failed to load extended data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    loneWorkerAlerts,
    unreadClientMessages,
    pendingLeaveRequests,
    complianceExpiries,
    agentHealth,
    loading,
    error,
    refetch: fetchData,
  };
}