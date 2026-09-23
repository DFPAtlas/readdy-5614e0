'use client';

import { supabase } from '@/lib/supabase';

interface AgentInfo {
  id: string;
  agent_key: string;
  agent_name: string;
  description: string | null;
  webhook_path: string;
  is_active: boolean;
  category?: string;
  risk_level?: string;
  requires_approval?: boolean;
  version?: string;
}

interface AgentCallContext {
  siteId?: string | null;
  guardId?: string | null;
  requestedPage?: string | null;
  requestedFeature?: string | null;
}

interface AgentCallResult {
  success: boolean;
  data: any;
  error: string | null;
  logId: string | null;
  approvalRequired?: boolean;
  approvalId?: string | null;
}

let cachedAgents: AgentInfo[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 1000;

export async function loadAgentRegistry(): Promise<AgentInfo[]> {
  if (cachedAgents && Date.now() < cacheExpiry) return cachedAgents;

  const { data } = await supabase
    .from('agent_registry')
    .select('*')
    .eq('is_active', true)
    .order('agent_name');

  cachedAgents = data || [];
  cacheExpiry = Date.now() + CACHE_TTL;
  return cachedAgents;
}

export function clearAgentCache() {
  cachedAgents = null;
  cacheExpiry = 0;
}

export async function callAgent(
  agentKey: string,
  eventType: string,
  payload: Record<string, any> = {},
  context: AgentCallContext = {}
): Promise<AgentCallResult> {
  const agents = await loadAgentRegistry();
  const agent = agents.find((a) => a.agent_key === agentKey);

  if (!agent) {
    return { success: false, data: null, error: `Agent "${agentKey}" not registered`, logId: null };
  }

  const idempotencyKey = `${agentKey}:${eventType}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { data, error } = await supabase.functions.invoke('n8n-gateway', {
      body: {
        agent_key: agentKey,
        event_type: eventType,
        payload: {
          ...payload,
          site_id: context.siteId,
          guard_id: context.guardId,
          requested_page: context.requestedPage,
          requested_feature: context.requestedFeature,
        },
        idempotency_key: idempotencyKey,
      },
    });

    if (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Gateway invocation failed',
        logId: null,
      };
    }

    if (data?.status === 'approval_required') {
      return {
        success: false,
        data: data,
        error: 'Approval required for this action',
        logId: null,
        approvalRequired: true,
        approvalId: data.approval_id,
      };
    }

    return {
      success: data?.success === true,
      data: data?.data || data,
      error: data?.success === true ? null : (data?.error || 'Agent returned an error'),
      logId: data?.run_id || null,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err.message || 'Network error',
      logId: null,
    };
  }
}

export async function callAgentWithApproval(
  agentKey: string,
  eventType: string,
  approvalId: string,
  payload: Record<string, any> = {}
): Promise<AgentCallResult> {
  try {
    const { data, error } = await supabase.functions.invoke('n8n-gateway', {
      body: {
        agent_key: agentKey,
        event_type: eventType,
        payload: { ...payload },
        pre_approved: true,
        approval_id: approvalId,
      },
    });

    if (error) {
      return { success: false, data: null, error: error.message, logId: null };
    }

    return {
      success: data?.success === true,
      data: data?.data || data,
      error: data?.success === true ? null : (data?.error || 'Agent returned an error'),
      logId: data?.run_id || null,
    };
  } catch (err: any) {
    return { success: false, data: null, error: err.message, logId: null };
  }
}

export async function logWebhookEvent(
  agentKey: string,
  eventType: string,
  eventPayload: Record<string, any>,
  companyId?: string | null
): Promise<void> {
  await supabase.from('agent_webhook_events').insert({
    agent_key: agentKey,
    company_id: companyId || null,
    event_type: eventType,
    event_payload: eventPayload,
    processed: false,
    status: 'pending',
  });
}

export type { AgentInfo, AgentCallContext, AgentCallResult };