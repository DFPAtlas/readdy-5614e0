'use client';

import { supabase } from '@/lib/supabase';

interface AgentInfo {
  id: string;
  agent_key: string;
  agent_name: string;
  description: string | null;
  webhook_path: string;
  is_active: boolean;
}

interface AgentCallContext {
  clientId?: string | null;
  userId?: string | null;
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
  payload: Record<string, any> = {},
  context: AgentCallContext = {}
): Promise<AgentCallResult> {
  const agents = await loadAgentRegistry();
  const agent = agents.find((a) => a.agent_key === agentKey);

  if (!agent) {
    return { success: false, data: null, error: `Agent "${agentKey}" not registered`, logId: null };
  }

  const logPayload = {
    agent_key: agentKey,
    client_id: context.clientId || null,
    user_id: context.userId || null,
    site_id: context.siteId || null,
    guard_id: context.guardId || null,
    requested_page: context.requestedPage || null,
    requested_feature: context.requestedFeature || null,
    status: 'pending',
    request_payload: payload,
    source: 'guardianhub_web_app',
  };

  const { data: inserted } = await supabase
    .from('agent_execution_logs')
    .insert(logPayload)
    .select('id')
    .maybeSingle();

  const logId = inserted?.id || null;

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_N8N_GUARDIANHUB_BASE_URL || '').trim();
    if (!baseUrl) {
      if (logId) {
        await supabase
          .from('agent_execution_logs')
          .update({ status: 'skipped', error_message: 'N8N base URL not configured' })
          .eq('id', logId);
      }
      return { success: false, data: null, error: 'N8N not configured — set NEXT_PUBLIC_N8N_GUARDIANHUB_BASE_URL', logId };
    }

    const webhookUrl = `${baseUrl}${agent.webhook_path}`;

    const enrichedPayload = {
      ...payload,
      source: 'guardianhub_web_app',
      client_id: context.clientId,
      user_id: context.userId,
      site_id: context.siteId,
      guard_id: context.guardId,
      agent_key: agentKey,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedPayload),
    });

    let responseData: any = null;
    const responseText = await response.text();
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (logId) {
      await supabase
        .from('agent_execution_logs')
        .update({
          status: response.ok ? 'success' : 'failed',
          response_payload: responseData,
          error_message: response.ok ? null : `HTTP ${response.status}: ${responseText.slice(0, 500)}`,
        })
        .eq('id', logId);
    }

    return {
      success: response.ok,
      data: responseData,
      error: response.ok ? null : `HTTP ${response.status}`,
      logId,
    };
  } catch (err: any) {
    if (logId) {
      await supabase
        .from('agent_execution_logs')
        .update({
          status: 'failed',
          error_message: err.message || 'Network error',
        })
        .eq('id', logId);
    }

    return {
      success: false,
      data: null,
      error: err.message || 'Network error',
      logId,
    };
  }
}

export async function logWebhookEvent(
  agentKey: string,
  eventType: string,
  eventPayload: Record<string, any>,
  clientId?: string | null
): Promise<void> {
  await supabase.from('agent_webhook_events').insert({
    agent_key: agentKey,
    client_id: clientId || null,
    event_type: eventType,
    event_payload: eventPayload,
    processed: false,
  });
}

export type { AgentInfo, AgentCallContext, AgentCallResult };