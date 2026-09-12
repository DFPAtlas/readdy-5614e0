import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  company_id: string;
  site_id?: string | null;
  client_id?: string | null;
  user_id: string;
  user_role: string;
  evidence_file_id?: string | null;
  incident_id?: string | null;
  document_id?: string | null;
  action: 'view' | 'download' | 'preview' | 'export' | 'upload' | 'delete' | 'share' | 'signed_url_created' | 'access_denied';
  source_route?: string | null;
  metadata?: Record<string, any>;
}

export async function logEvidenceAccess(entry: AuditLogEntry) {
  try {
    const { error } = await supabase.from('evidence_access_logs').insert({
      company_id: entry.company_id,
      site_id: entry.site_id || null,
      client_id: entry.client_id || null,
      user_id: entry.user_id,
      user_role: entry.user_role,
      evidence_file_id: entry.evidence_file_id || null,
      incident_id: entry.incident_id || null,
      document_id: entry.document_id || null,
      action: entry.action,
      source_route: entry.source_route || (typeof window !== 'undefined' ? window.location.pathname : null),
      metadata: entry.metadata || {},
    });
    if (error) {
      console.error('Failed to log evidence access:', error.message);
    }
  } catch (err: any) {
    console.error('Evidence audit log error:', err?.message || err);
  }
}

export async function logPageAccess(entry: {
  company_id: string;
  site_id?: string | null;
  client_id?: string | null;
  user_id: string;
  user_role: string;
  source_route?: string | null;
  metadata?: Record<string, any>;
}) {
  return logEvidenceAccess({
    ...entry,
    action: 'view',
    metadata: { ...entry.metadata, page_access: true },
  });
}

export async function logAccessDenied(entry: {
  company_id: string;
  user_id: string;
  user_role: string;
  target_type: 'evidence_file' | 'incident_media' | 'client_document' | 'acs_evidence' | 'export';
  target_id?: string | null;
  source_route?: string | null;
}) {
  return logEvidenceAccess({
    company_id: entry.company_id,
    user_id: entry.user_id,
    user_role: entry.user_role,
    evidence_file_id: entry.target_type === 'evidence_file' ? entry.target_id : null,
    incident_id: entry.target_type === 'incident_media' ? entry.target_id : null,
    document_id: entry.target_type === 'client_document' || entry.target_type === 'acs_evidence' ? entry.target_id : null,
    action: 'access_denied',
    source_route: entry.source_route,
    metadata: { target_type: entry.target_type },
  });
}