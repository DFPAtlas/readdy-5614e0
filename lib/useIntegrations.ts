'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface IntegrationCatalogueItem {
  id: string;
  integration_key: string;
  name: string;
  category: string;
  description: string | null;
  supported_capabilities: string[];
  required_plan: string | null;
  status: string;
  configuration_schema: any;
  documentation_url: string | null;
  version: string;
}

export interface CompanyIntegration {
  id: string;
  company_id: string;
  integration_key: string;
  enabled: boolean;
  environment: string;
  authorized_capabilities: string[];
  health_status: string;
  last_synced_at: string | null;
  last_verified_at: string | null;
  connected_by: string | null;
  external_organisation_id: string | null;
  catalogue?: IntegrationCatalogueItem;
}

export interface ApiCredential {
  id: string;
  company_id: string;
  name: string;
  client_id: string;
  scopes: string[];
  allowed_ip_ranges: string[];
  environment: string;
  status: string;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  company_id: string;
  url: string;
  enabled_events: string[];
  status: string;
  last_delivery_at: string | null;
  failure_count: number;
  created_at: string;
  created_by: string | null;
}

export interface WebhookDelivery {
  id: string;
  webhook_endpoint_id: string;
  event_id: string;
  event_type: string;
  status: string;
  attempt_count: number;
  response_code: number | null;
  response_body: string | null;
  created_at: string;
  last_attempt_at: string | null;
}

export interface SyncRun {
  id: string;
  company_id: string;
  integration_key: string;
  direction: string;
  resource_type: string;
  status: string;
  records_processed: number;
  records_succeeded: number;
  records_failed: number;
  sanitized_error: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface ApiAccessLog {
  id: string;
  company_id: string;
  endpoint: string;
  method: string;
  scopes_used: string[];
  response_code: number | null;
  duration_ms: number | null;
  ip_address: string | null;
  created_at: string;
}

export function useIntegrations(companyId: string | null) {
  const [catalogue, setCatalogue] = useState<IntegrationCatalogueItem[]>([]);
  const [companyIntegrations, setCompanyIntegrations] = useState<CompanyIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCatalogue = useCallback(async () => {
    const { data } = await supabase.from('integration_catalogue').select('*').order('category').order('name');
    if (data) setCatalogue(data);
  }, []);

  const loadCompanyIntegrations = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('company_integrations')
      .select('*')
      .eq('company_id', companyId);
    if (data) {
      const enriched = data.map((ci: any) => ({
        ...ci,
        catalogue: catalogue.find(c => c.integration_key === ci.integration_key),
      }));
      setCompanyIntegrations(enriched);
    }
    setLoading(false);
  }, [companyId, catalogue]);

  useEffect(() => { loadCatalogue(); }, [loadCatalogue]);
  useEffect(() => { if (catalogue.length > 0) loadCompanyIntegrations(); }, [catalogue, loadCompanyIntegrations]);

  const connectIntegration = async (integrationKey: string, capabilities: string[], externalOrgId?: string) => {
    if (!companyId) return false;
    setSaving(true);
    const { data, error } = await supabase.from('company_integrations').insert({
      company_id: companyId,
      integration_key: integrationKey,
      enabled: true,
      authorized_capabilities: capabilities,
      external_organisation_id: externalOrgId || null,
      health_status: 'connected',
    }).select().maybeSingle();
    if (!error && data) {
      setCompanyIntegrations(prev => [...prev, { ...data, catalogue: catalogue.find(c => c.integration_key === integrationKey) }]);
    }
    setSaving(false);
    return !error;
  };

  const disconnectIntegration = async (integrationId: string) => {
    if (!companyId) return;
    setSaving(true);
    await supabase.from('company_integrations').update({ enabled: false, health_status: 'disconnected', updated_at: new Date().toISOString() }).eq('id', integrationId);
    setCompanyIntegrations(prev => prev.map(ci => ci.id === integrationId ? { ...ci, enabled: false, health_status: 'disconnected' } : ci));
    setSaving(false);
  };

  const updateIntegrationHealth = async (integrationId: string, health: string) => {
    await supabase.from('company_integrations').update({ health_status: health, updated_at: new Date().toISOString() }).eq('id', integrationId);
    setCompanyIntegrations(prev => prev.map(ci => ci.id === integrationId ? { ...ci, health_status: health } : ci));
  };

  return { catalogue, companyIntegrations, loading, saving, connectIntegration, disconnectIntegration, updateIntegrationHealth, refresh: loadCompanyIntegrations };
}

export function useApiCredentials(companyId: string | null) {
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [accessLogs, setAccessLogs] = useState<ApiAccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCredentials = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('api_credentials').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
    if (data) setCredentials(data);
    setLoading(false);
  }, [companyId]);

  const loadAccessLogs = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from('api_access_logs').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100);
    if (data) setAccessLogs(data);
  }, [companyId]);

  useEffect(() => { loadCredentials(); loadAccessLogs(); }, [loadCredentials, loadAccessLogs]);

  const createCredential = async (name: string, scopes: string[], environment: string): Promise<{ clientId: string; secret: string } | null> => {
    if (!companyId) return null;
    setSaving(true);
    const clientId = `gh_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const secret = `ghs_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const secretHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('api_credentials').insert({
      company_id: companyId,
      name,
      client_id: clientId,
      secret_hash: secretHash,
      scopes,
      environment,
      status: 'active',
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

    setSaving(false);
    if (!error) {
      loadCredentials();
      return { clientId, secret };
    }
    return null;
  };

  const revokeCredential = async (credentialId: string) => {
    if (!companyId) return;
    setSaving(true);
    await supabase.from('api_credentials').update({ status: 'revoked', updated_at: new Date().toISOString() }).eq('id', credentialId);
    setCredentials(prev => prev.map(c => c.id === credentialId ? { ...c, status: 'revoked' } : c));
    setSaving(false);
  };

  return { credentials, accessLogs, loading, saving, createCredential, revokeCredential, refresh: loadCredentials };
}

export function useWebhooks(companyId: string | null) {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadEndpoints = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('webhook_endpoints').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
    if (data) setEndpoints(data);
    setLoading(false);
  }, [companyId]);

  const loadDeliveries = useCallback(async () => {
    if (!companyId) return;
    const endpointIds = endpoints.map(e => e.id);
    if (endpointIds.length === 0) return;
    const { data } = await supabase.from('webhook_deliveries').select('*').in('webhook_endpoint_id', endpointIds).order('created_at', { ascending: false }).limit(50);
    if (data) setDeliveries(data);
  }, [companyId, endpoints]);

  useEffect(() => { loadEndpoints(); }, [loadEndpoints]);
  useEffect(() => { loadDeliveries(); }, [loadDeliveries]);

  const createEndpoint = async (url: string, enabledEvents: string[]) => {
    if (!companyId) return false;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('webhook_endpoints').insert({
      company_id: companyId,
      url,
      enabled_events: enabledEvents,
      status: 'active',
      created_by: user?.id,
    });
    setSaving(false);
    if (!error) loadEndpoints();
    return !error;
  };

  const toggleEndpoint = async (endpointId: string, active: boolean) => {
    if (!companyId) return;
    await supabase.from('webhook_endpoints').update({ status: active ? 'active' : 'paused', updated_at: new Date().toISOString() }).eq('id', endpointId);
    setEndpoints(prev => prev.map(e => e.id === endpointId ? { ...e, status: active ? 'active' : 'paused' } : e));
  };

  const deleteEndpoint = async (endpointId: string) => {
    if (!companyId) return;
    await supabase.from('webhook_deliveries').delete().eq('webhook_endpoint_id', endpointId);
    await supabase.from('webhook_endpoints').delete().eq('id', endpointId);
    setEndpoints(prev => prev.filter(e => e.id !== endpointId));
  };

  return { endpoints, deliveries, loading, saving, createEndpoint, toggleEndpoint, deleteEndpoint, refresh: loadEndpoints };
}

export function useSyncRuns(companyId: string | null) {
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSyncRuns = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('integration_sync_runs').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(50);
    if (data) setSyncRuns(data);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadSyncRuns(); }, [loadSyncRuns]);

  return { syncRuns, loading, refresh: loadSyncRuns };
}

export const AVAILABLE_SCOPES = [
  { key: 'sites:read', label: 'Read Sites', description: 'View site names, addresses and status' },
  { key: 'guards:read_limited', label: 'Read Guards (Limited)', description: 'View guard names, SIA numbers and status' },
  { key: 'shifts:read', label: 'Read Shifts', description: 'View shift schedules' },
  { key: 'shifts:write', label: 'Write Shifts', description: 'Create and update shift records' },
  { key: 'attendance:read', label: 'Read Attendance', description: 'View check-in/out records' },
  { key: 'incidents:read_client_safe', label: 'Read Incidents (Client Safe)', description: 'View client-appropriate incident summaries' },
  { key: 'reports:read', label: 'Read Reports', description: 'View generated reports' },
  { key: 'timesheets:read_approved', label: 'Read Approved Timesheets', description: 'View approved timesheet records' },
  { key: 'invoices:read', label: 'Read Invoices', description: 'View issued invoices' },
  { key: 'webhooks:manage', label: 'Manage Webhooks', description: 'Configure and manage webhook endpoints' },
  { key: 'integrations:read', label: 'Read Integrations', description: 'View integration status' },
  { key: 'integrations:manage', label: 'Manage Integrations', description: 'Connect and configure integrations' },
];

export const WEBHOOK_EVENT_TYPES = [
  { key: 'shift.created', label: 'Shift Created', category: 'Shifts' },
  { key: 'shift.updated', label: 'Shift Updated', category: 'Shifts' },
  { key: 'assignment.created', label: 'Assignment Created', category: 'Assignments' },
  { key: 'assignment.canceled', label: 'Assignment Canceled', category: 'Assignments' },
  { key: 'attendance.checked_in', label: 'Guard Checked In', category: 'Attendance' },
  { key: 'attendance.checked_out', label: 'Guard Checked Out', category: 'Attendance' },
  { key: 'attendance.exception', label: 'Attendance Exception', category: 'Attendance' },
  { key: 'patrol.completed', label: 'Patrol Completed', category: 'Patrols' },
  { key: 'incident.client_published', label: 'Incident Published to Client', category: 'Incidents' },
  { key: 'report.published', label: 'Report Published', category: 'Reports' },
  { key: 'invoice.issued', label: 'Invoice Issued', category: 'Finance' },
  { key: 'invoice.paid', label: 'Invoice Paid', category: 'Finance' },
  { key: 'worker.compliance_warning', label: 'Worker Compliance Warning', category: 'Compliance' },
  { key: 'integration.health_changed', label: 'Integration Health Changed', category: 'System' },
];