'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface ComplianceDoc {
  id: string;
  company_id: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  document_type: string;
  document_title: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  status: string;
  review_status: string;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuardCert {
  id: string;
  guard_id: string;
  guard_name?: string;
  company_id: string;
  cert_type: string;
  cert_name: string;
  issuing_body?: string;
  certificate_number?: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  document_url?: string | null;
  status?: string | null;
  reminder_sent_30d?: boolean;
  reminder_sent_90d?: boolean;
  created_at: string;
}

export interface GuardVetting {
  id: string;
  guard_id: string;
  guard_name?: string;
  company_id: string;
  rtw_verified?: boolean;
  rtw_document_type?: string;
  rtw_document_url?: string;
  rtw_expiry?: string | null;
  dbs_check_type?: string;
  dbs_certificate_number?: string;
  dbs_issue_date?: string | null;
  dbs_document_url?: string;
  dbs_verified_at?: string;
  vetting_expires_at?: string;
  vetting_status?: string;
  created_at: string;
}

export interface ACSEvidence {
  id: string;
  company_id: string;
  title: string;
  acs_area: string;
  acs_criterion?: string;
  category?: string;
  owner?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  review_date?: string | null;
  expiry_date?: string | null;
  version?: string;
  status?: string;
  notes?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientDoc {
  id: string;
  client_id: string;
  client_name?: string;
  site_id?: string | null;
  site_name?: string;
  file_name: string;
  file_type?: string;
  document_category?: string;
  storage_path: string;
  file_size?: number;
  upload_date?: string;
  is_public?: boolean;
  created_at: string;
}

export interface DocSummary {
  expired: number;
  expiring7Days: number;
  expiring30Days: number;
  missing: number;
  awaitingReview: number;
  total: number;
}

export interface ComplianceData {
  complianceDocs: ComplianceDoc[];
  guardCerts: GuardCert[];
  guardVetting: GuardVetting[];
  acsEvidence: ACSEvidence[];
  clientDocs: ClientDoc[];
  summary: DocSummary;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days;
}

function getDocStatus(expiryDate: string | null, existingStatus?: string | null): string {
  if (existingStatus === 'missing' || existingStatus === 'rejected') return existingStatus;
  const days = getDaysUntilExpiry(expiryDate);
  if (days === null) return 'missing';
  if (days < 0) return 'expired';
  if (days <= 7) return 'expiring_7d';
  if (days <= 30) return 'expiring_30d';
  return 'active';
}

export function useComplianceDocuments(): ComplianceData {
  const { companyId } = useAuth();
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDoc[]>([]);
  const [guardCerts, setGuardCerts] = useState<GuardCert[]>([]);
  const [guardVetting, setGuardVetting] = useState<GuardVetting[]>([]);
  const [acsEvidence, setAcsEvidence] = useState<ACSEvidence[]>([]);
  const [clientDocs, setClientDocs] = useState<ClientDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [compRes, certRes, vetRes, acsRes, clientRes, guardsRes, sitesRes, clientsRes] = await Promise.all([
        supabase.from('compliance_documents').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('guard_certifications').select(`*, guards:guard_id(first_name, last_name)`).eq('company_id', companyId).order('expiry_date', { ascending: true }),
        supabase.from('guard_vetting_records').select(`*, guards:guard_id(first_name, last_name)`).eq('company_id', companyId).order('rtw_expiry', { ascending: true }),
        supabase.from('acs_evidence').select('*').eq('company_id', companyId).order('expiry_date', { ascending: true }),
        supabase.from('client_documents').select(`*, clients:client_id(name)`).eq('client_id', (q: any) => q.select('id').from('clients').eq('company_id', companyId)),
        supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active'),
        supabase.from('sites').select('id, site_name').eq('company_id', companyId),
        supabase.from('clients').select('id, name').eq('company_id', companyId),
      ]);

      if (compRes.error) throw new Error(compRes.error.message);
      if (certRes.error) throw new Error(certRes.error.message);
      if (vetRes.error) throw new Error(vetRes.error.message);
      if (acsRes.error) throw new Error(acsRes.error.message);
      if (clientRes.error) throw new Error(clientRes.error.message);
      if (guardsRes.error) throw new Error(guardsRes.error.message);
      if (sitesRes.error) throw new Error(sitesRes.error.message);
      if (clientsRes.error) throw new Error(clientsRes.error.message);

      const guardMap = new Map((guardsRes.data || []).map((g: any) => [g.id, `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unknown']));
      const siteMap = new Map((sitesRes.data || []).map((s: any) => [s.id, s.site_name]));
      const clientMap = new Map((clientsRes.data || []).map((c: any) => [c.id, c.name]));

      const processedCerts: GuardCert[] = (certRes.data || []).map((c: any) => ({
        ...c,
        guard_name: c.guards ? `${c.guards.first_name || ''} ${c.guards.last_name || ''}`.trim() || 'Unknown' : guardMap.get(c.guard_id) || 'Unknown',
      }));

      const processedVetting: GuardVetting[] = (vetRes.data || []).map((v: any) => ({
        ...v,
        guard_name: v.guards ? `${v.guards.first_name || ''} ${v.guards.last_name || ''}`.trim() || 'Unknown' : guardMap.get(v.guard_id) || 'Unknown',
      }));

      const processedClientDocs: ClientDoc[] = (clientRes.data || []).map((d: any) => ({
        ...d,
        client_name: d.clients?.name || clientMap.get(d.client_id) || 'Unknown',
      }));

      const processedComplianceDocs: ComplianceDoc[] = (compRes.data || []).map((d: any) => ({
        ...d,
        entity_name: d.entity_type === 'guard' ? guardMap.get(d.entity_id) || 'Unknown' :
          d.entity_type === 'site' ? siteMap.get(d.entity_id) || 'Unknown' :
          d.entity_type === 'client' ? clientMap.get(d.entity_id) || 'Unknown' :
          'Unknown',
      }));

      setComplianceDocs(processedComplianceDocs);
      setGuardCerts(processedCerts);
      setGuardVetting(processedVetting);
      setAcsEvidence(acsRes.data || []);
      setClientDocs(processedClientDocs);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const summary = (() => {
    let expired = 0;
    let expiring7 = 0;
    let expiring30 = 0;
    let missing = 0;
    let awaiting = 0;
    let total = 0;

    const countDoc = (expiry: string | null, status?: string | null, review?: string | null) => {
      const s = getDocStatus(expiry, status);
      if (s === 'expired') expired++;
      else if (s === 'expiring_7d') expiring7++;
      else if (s === 'expiring_30d') expiring30++;
      else if (s === 'missing') missing++;
      if (review === 'pending') awaiting++;
      total++;
    };

    complianceDocs.forEach(d => countDoc(d.expiry_date, d.status, d.review_status));
    guardCerts.forEach(c => countDoc(c.expiry_date, c.status));
    guardVetting.forEach(v => {
      if (v.rtw_expiry) countDoc(v.rtw_expiry, v.vetting_status);
      if (v.vetting_expires_at) countDoc(v.vetting_expires_at, v.vetting_status);
      if (v.dbs_issue_date) countDoc(v.vetting_expires_at || null, v.vetting_status);
    });
    acsEvidence.forEach(e => countDoc(e.expiry_date, e.status));
    clientDocs.forEach(() => total++);

    return { expired, expiring7Days: expiring7, expiring30Days: expiring30, missing, awaitingReview: awaiting, total };
  })();

  return {
    complianceDocs,
    guardCerts,
    guardVetting,
    acsEvidence,
    clientDocs,
    summary,
    loading,
    error,
    refetch: fetchData,
  };
}

export { getDaysUntilExpiry, getDocStatus };