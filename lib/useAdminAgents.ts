'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface AdminAgentDetail {
  agent_key: string;
  agent_name: string;
  description: string | null;
  webhook_path: string;
  is_active: boolean;
  last_run_at: string | null;
  last_status: string | null;
  failed_24h: number;
  total_runs: number;
  avg_duration_ms: number | null;
  pending_webhooks: number;
  last_error: string | null;
  health: 'healthy' | 'warning' | 'failed' | 'not_connected' | 'unknown';
}

export interface AdminAgentExecution {
  id: string;
  agent_key: string;
  status: string;
  error_message: string | null;
  requested_page: string | null;
  requested_feature: string | null;
  duration_ms: number | null;
  client_id: string | null;
  created_at: string;
}

export interface AdminAgentWebhook {
  id: string;
  agent_key: string;
  event_type: string;
  status: string;
  processed: boolean;
  retry_count: number;
  last_error: string | null;
  created_at: string;
}

function computeHealth(agent: {
  last_status: string | null;
  failed_24h: number;
  last_run_at: string | null;
}): AdminAgentDetail['health'] {
  if (!agent.last_run_at) return 'not_connected';
  if (!agent.last_status) return 'unknown';
  if (agent.last_status === 'failed') return 'failed';
  if (agent.failed_24h > 0) return 'warning';
  if (agent.last_status === 'success' || agent.last_status === 'completed') return 'healthy';
  return 'unknown';
}

export function useAdminAgents() {
  const [agents, setAgents] = useState<AdminAgentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: registry } = await supabase
          .from('agent_registry')
          .select('*')
          .order('agent_key');

        const { data: allLogs } = await supabase
          .from('agent_execution_logs')
          .select('id, agent_key, status, error_message, duration_ms, created_at')
          .order('created_at', { ascending: false })
          .limit(5000);

        const { data: pendingWebhooks } = await supabase
          .from('agent_webhook_events')
          .select('id, agent_key, processed')
          .eq('processed', false);

        const now = Date.now();
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

        const whCounts: Record<string, number> = {};
        (pendingWebhooks || []).forEach((w: any) => {
          whCounts[w.agent_key] = (whCounts[w.agent_key] || 0) + 1;
        });

        const agentLogs: Record<string, any[]> = {};
        (allLogs || []).forEach((l: any) => {
          if (!agentLogs[l.agent_key]) agentLogs[l.agent_key] = [];
          agentLogs[l.agent_key].push(l);
        });

        const details: AdminAgentDetail[] = (registry || []).map((a: any) => {
          const logs = agentLogs[a.agent_key] || [];
          const lastLog = logs[0] || null;
          const failed24h = logs.filter((l: any) =>
            l.status === 'failed' && new Date(l.created_at) > twentyFourHoursAgo
          ).length;
          const completedLogs = logs.filter((l: any) => l.duration_ms != null && l.duration_ms > 0);
          const avgDuration = completedLogs.length > 0
            ? Math.round(completedLogs.reduce((s: number, l: any) => s + l.duration_ms, 0) / completedLogs.length)
            : null;

          const lastErrorLog = logs.find((l: any) => l.error_message);

          const health = computeHealth({
            last_status: lastLog?.status || null,
            failed_24h: failed24h,
            last_run_at: lastLog?.created_at || null,
          });

          return {
            agent_key: a.agent_key,
            agent_name: a.agent_name,
            description: a.description,
            webhook_path: a.webhook_path,
            is_active: a.is_active,
            last_run_at: lastLog?.created_at || null,
            last_status: lastLog?.status || null,
            failed_24h: failed24h,
            total_runs: logs.length,
            avg_duration_ms: avgDuration,
            pending_webhooks: whCounts[a.agent_key] || 0,
            last_error: lastErrorLog?.error_message || null,
            health,
          };
        });

        setAgents(details);
      } catch {}
      setLoading(false);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  return { agents, loading };
}

export function useAdminAgentExecutions(agentKey: string | null) {
  const [executions, setExecutions] = useState<AdminAgentExecution[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!agentKey) { setExecutions([]); return; }
    const fetchExecs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('agent_execution_logs')
        .select('id, agent_key, status, error_message, requested_page, requested_feature, duration_ms, client_id, created_at')
        .eq('agent_key', agentKey)
        .order('created_at', { ascending: false })
        .limit(100);
      setExecutions(data || []);
      setLoading(false);
    };
    fetchExecs();
  }, [agentKey]);

  return { executions, loading };
}

export function useAdminAgentWebhooks(agentKey: string | null) {
  const [webhooks, setWebhooks] = useState<AdminAgentWebhook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!agentKey) { setWebhooks([]); return; }
    const fetchWh = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('agent_webhook_events')
        .select('id, agent_key, event_type, status, processed, retry_count, last_error, created_at')
        .eq('agent_key', agentKey)
        .order('created_at', { ascending: false })
        .limit(50);
      setWebhooks(data || []);
      setLoading(false);
    };
    fetchWh();
  }, [agentKey]);

  return { webhooks, loading };
}

export async function runAgentTest(agentKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('guardianhub-agent-proxy', {
      body: {
        agent_key: agentKey,
        payload: { test: true, source: 'admin_manual_test', timestamp: new Date().toISOString() },
      },
    });

    if (error) {
      await supabase.from('agent_execution_logs').insert({
        agent_key: agentKey,
        status: 'failed',
        error_message: error.message || 'Test invocation failed',
        source: 'admin_manual_test',
        request_payload: { test: true },
      });
      return { success: false, message: error.message || 'Test failed' };
    }

    await supabase.from('agent_execution_logs').insert({
      agent_key: agentKey,
      status: data?.success !== false ? 'completed' : 'failed',
      response_payload: data || {},
      source: 'admin_manual_test',
      request_payload: { test: true },
    });

    return {
      success: data?.success !== false,
      message: data?.success !== false ? `Agent "${agentKey}" responded successfully` : (data?.error || 'Agent returned an error'),
    };
  } catch (err: any) {
    await supabase.from('agent_execution_logs').insert({
      agent_key: agentKey,
      status: 'failed',
      error_message: err.message || 'Network error',
      source: 'admin_manual_test',
      request_payload: { test: true },
    });
    return { success: false, message: err.message || 'Network error' };
  }
}