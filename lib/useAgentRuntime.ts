'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface RuntimeAgent {
  id: string;
  agent_key: string;
  agent_name: string;
  description: string | null;
  webhook_path: string;
  is_active: boolean;
  paused: boolean;
  version: string | null;
  category: string | null;
  risk_level: string | null;
  requires_approval: boolean | null;
  schedule: string | null;
  enabled_environment: string | null;
  last_run_at: string | null;
  last_status: string | null;
}

export interface DeadLetter {
  id: string;
  agent_key: string;
  company_id: string | null;
  event_type: string | null;
  error_code: string | null;
  error_message: string | null;
  attempt_count: number;
  status: string;
  created_at: string;
}

export interface CredentialStatus {
  id: string;
  agent_key: string;
  provider: string;
  status: string;
  secret_reference: string | null;
  environment: string;
}

export interface PendingApproval {
  id: string;
  agent_key: string;
  requested_action: string;
  risk_level: string | null;
  status: string;
  requested_by: string | null;
  created_at: string;
  expiry: string | null;
}

interface ExecStats {
  total: number;
  succeeded: number;
  failed: number;
  avg_duration_ms: number | null;
  last_status: string | null;
  last_run_at: string | null;
  recent_failures: number;
}

export function useAgentRuntime() {
  const [agents, setAgents] = useState<RuntimeAgent[]>([]);
  const [deadLetters, setDeadLetters] = useState<DeadLetter[]>([]);
  const [credentials, setCredentials] = useState<CredentialStatus[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [stats, setStats] = useState<Record<string, ExecStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [agentsRes, deadRes, credRes, apprRes, execRes] = await Promise.all([
        supabase.from('agent_registry').select('*').order('agent_name'),
        supabase.from('agent_dead_letters').select('*').eq('status', 'dead_lettered').order('created_at', { ascending: false }),
        supabase.from('agent_credentials_status').select('*').order('agent_key'),
        supabase.from('automation_approvals').select('id, requested_action, risk_level, status, requested_by, created_at, expiry').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('agent_execution_logs').select('agent_key, status, duration_ms, created_at').order('created_at', { ascending: false }).limit(600),
      ]);

      if (agentsRes.error) throw new Error(agentsRes.error.message);
      setAgents(agentsRes.data || []);
      setDeadLetters(deadRes.data || []);
      setCredentials(credRes.data || []);

      const approvals = (apprRes.data || []).map((a: any) => ({
        id: a.id,
        agent_key: (a.requested_action || '').split(':')[0],
        requested_action: a.requested_action,
        risk_level: a.risk_level,
        status: a.status,
        requested_by: a.requested_by,
        created_at: a.created_at,
        expiry: a.expiry,
      }));
      setPendingApprovals(approvals);

      const execs = execRes.data || [];
      const map: Record<string, ExecStats> = {};
      for (const e of execs) {
        const s = map[e.agent_key] || { total: 0, succeeded: 0, failed: 0, avg_duration_ms: null, last_status: null, last_run_at: null, recent_failures: 0 };
        s.total += 1;
        if (e.status === 'succeeded' || e.status === 'completed') s.succeeded += 1;
        if (e.status === 'failed' || e.status === 'dead_lettered') s.failed += 1;
        if (!s.last_run_at) { s.last_run_at = e.created_at; s.last_status = e.status; }
        if (e.status === 'failed' || e.status === 'dead_lettered') s.recent_failures += 1;
        map[e.agent_key] = s;
      }
      setStats(map);
    } catch (err: any) {
      setError(err.message || 'Failed to load agent runtime data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleEnabled = useCallback(async (agentKey: string, enabled: boolean, reason?: string) => {
    const { error } = await supabase.from('agent_registry').update({ is_active: enabled }).eq('agent_key', agentKey);
    if (error) return { error };
    await supabase.from('automation_audit_log').insert({
      actor: null, company_id: null, agent_key: agentKey, run_id: null,
      action: enabled ? 'agent_enabled' : 'agent_disabled',
      safe_metadata: { reason: reason || null },
    });
    await load();
    return { error: null };
  }, [load]);

  const togglePaused = useCallback(async (agentKey: string, paused: boolean, reason?: string) => {
    const { error } = await supabase.from('agent_registry').update({ paused }).eq('agent_key', agentKey);
    if (error) return { error };
    await supabase.from('automation_audit_log').insert({
      actor: null, company_id: null, agent_key: agentKey, run_id: null,
      action: paused ? 'agent_schedule_paused' : 'agent_schedule_resumed',
      safe_metadata: { reason: reason || null },
    });
    await load();
    return { error: null };
  }, [load]);

  const runTest = useCallback(async (agentKey: string) => {
    const { data, error } = await supabase.functions.invoke('n8n-gateway', {
      body: { agent_key: agentKey, event_type: 'agent.test', payload: { test: true, source: 'operations_console' }, trigger_type: 'manual_test' },
    });
    return { success: !error && data?.success === true, data, error: error?.message || data?.error || null };
  }, []);

  const replayDeadLetter = useCallback(async (deadLetter: DeadLetter) => {
    const { data, error } = await supabase.functions.invoke('n8n-gateway', {
      body: {
        agent_key: deadLetter.agent_key,
        event_type: deadLetter.event_type || 'agent.test',
        payload: deadLetter.safe_payload || {},
        idempotency_key: `replay:${deadLetter.id}`,
        trigger_type: 'manual_replay',
      },
    });
    if (!error) {
      await supabase.from('agent_dead_letters').update({ status: 'replayed', resolved_at: new Date().toISOString() }).eq('id', deadLetter.id);
      await load();
    }
    return { success: !error && data?.success === true, error: error?.message || data?.error || null };
  }, [load]);

  const markResolved = useCallback(async (deadLetterId: string, resolution: string) => {
    const { error } = await supabase.from('agent_dead_letters').update({
      status: 'manually_resolved', resolved_at: new Date().toISOString(), resolution,
    }).eq('id', deadLetterId);
    if (!error) await load();
    return { error };
  }, [load]);

  return {
    agents, deadLetters, credentials, pendingApprovals, stats, loading, error,
    load, toggleEnabled, togglePaused, runTest, replayDeadLetter, markResolved,
  };
}