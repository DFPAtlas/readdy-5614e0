'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface AutomationRule {
  id: string;
  company_id: string;
  agent_id: string;
  enabled: boolean;
  trigger_type: string;
  conditions: any;
  allowed_actions: any;
  approval_required: boolean;
  notification_recipients: any;
  quiet_hours: any;
  escalation_timing: any;
  created_at: string;
  agent_name?: string;
  agent_key?: string;
}

export interface AutomationApproval {
  id: string;
  company_id: string;
  run_id: string;
  requested_action: string;
  safe_preview: any;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  requested_by: string;
  reviewed_by: string | null;
  review_note: string | null;
  expiry: string;
  reviewed_at: string | null;
  created_at: string;
  requester_name?: string;
  reviewer_name?: string;
}

export interface AutomationAuditEntry {
  id: string;
  actor: string;
  company_id: string;
  agent_key: string;
  run_id: string;
  action: string;
  safe_metadata: any;
  created_at: string;
}

export interface AutomationStats {
  total_runs: number;
  failed_runs: number;
  pending_approvals: number;
  dead_letter_events: number;
  active_rules: number;
  agents_registered: number;
  agents_active: number;
}

export function useAutomationControl(companyId: string | null) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [approvals, setApprovals] = useState<AutomationApproval[]>([]);
  const [auditLog, setAuditLog] = useState<AutomationAuditEntry[]>([]);
  const [stats, setStats] = useState<AutomationStats>({
    total_runs: 0, failed_runs: 0, pending_approvals: 0,
    dead_letter_events: 0, active_rules: 0, agents_registered: 0, agents_active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);

  const loadAll = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);

    const [
      { data: rulesData },
      { data: approvalsData },
      { data: auditData },
      { data: agentsData },
      { data: runsData },
      { data: deadLetters },
      { data: allRuns },
    ] = await Promise.all([
      supabase.from('automation_rules').select('*, agent:agent_registry(agent_name, agent_key)').eq('company_id', companyId).order('created_at', { ascending: false }),
      supabase.from('automation_approvals').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100),
      supabase.from('automation_audit_log').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100),
      supabase.from('agent_registry').select('*').order('agent_name'),
      supabase.from('agent_execution_logs').select('id,status', { count: 'exact' }).eq('company_id', companyId).eq('status', 'failed'),
      supabase.from('agent_webhook_events').select('id', { count: 'exact' }).eq('company_id', companyId).eq('status', 'dead_letter'),
      supabase.from('agent_execution_logs').select('id', { count: 'exact' }).eq('company_id', companyId),
    ]);

    const mappedRules: AutomationRule[] = (rulesData || []).map((r: any) => ({
      ...r,
      agent_name: r.agent?.agent_name || null,
      agent_key: r.agent?.agent_key || null,
    }));

    setRules(mappedRules);
    setApprovals(approvalsData || []);
    setAuditLog(auditData || []);
    setAgents(agentsData || []);
    setStats({
      total_runs: allRuns?.length || 0,
      failed_runs: runsData?.length || 0,
      pending_approvals: (approvalsData || []).filter((a: any) => a.status === 'pending').length,
      dead_letter_events: deadLetters?.length || 0,
      active_rules: mappedRules.filter((r: any) => r.enabled).length,
      agents_registered: (agentsData || []).length,
      agents_active: (agentsData || []).filter((a: any) => a.is_active).length,
    });
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const approveAction = async (approvalId: string, note?: string) => {
    const { data: approval } = await supabase.from('automation_approvals').select('*').eq('id', approvalId).maybeSingle();
    if (!approval) return { success: false, error: 'Approval not found' };

    const { data: user } = await supabase.auth.getUser();
    await supabase.from('automation_approvals').update({
      status: 'approved', reviewed_by: user.user?.id, review_note: note || null, reviewed_at: new Date().toISOString(),
    }).eq('id', approvalId);

    await supabase.from('automation_audit_log').insert({
      actor: user.user?.id, company_id: companyId,
      action: 'approval_granted', run_id: approval.run_id,
      safe_metadata: { approval_id: approvalId, requested_action: approval.requested_action },
    });

    loadAll();
    return { success: true };
  };

  const rejectAction = async (approvalId: string, reason: string) => {
    const { data: user } = await supabase.auth.getUser();
    await supabase.from('automation_approvals').update({
      status: 'rejected', reviewed_by: user.user?.id, review_note: reason, reviewed_at: new Date().toISOString(),
    }).eq('id', approvalId);

    await supabase.from('automation_audit_log').insert({
      actor: user.user?.id, company_id: companyId,
      action: 'approval_rejected', run_id: null,
      safe_metadata: { approval_id: approvalId, reason },
    });

    loadAll();
    return { success: true };
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    await supabase.from('automation_rules').update({ enabled, updated_at: new Date().toISOString() }).eq('id', ruleId);
    loadAll();
    return { success: true };
  };

  const retryFailedRun = async (runId: string) => {
    const { error } = await supabase.functions.invoke('queue-processor', {});
    if (error) return { success: false, error: error.message };

    await supabase.from('agent_execution_logs').update({
      status: 'retrying',
    }).eq('id', runId);

    loadAll();
    return { success: true };
  };

  const replayDeadLetter = async (eventId: string) => {
    await supabase.from('agent_webhook_events').update({
      processed: false, status: 'pending', retry_count: 0, last_error: null,
    }).eq('id', eventId);

    const { error } = await supabase.functions.invoke('queue-processor', {});
    loadAll();
    return { success: !error, error: error?.message || null };
  };

  return {
    rules, approvals, auditLog, stats, agents, loading,
    approveAction, rejectAction, toggleRule, retryFailedRun, replayDeadLetter, refresh: loadAll,
  };
}