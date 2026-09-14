import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface GuardShift {
  id: string;
  site_name: string | null;
  start_time: string;
  end_time: string;
  shift_type: string | null;
  status: string | null;
}

export interface GuardIncident {
  id: string;
  incident_number: string | null;
  title: string | null;
  incident_type: string | null;
  site_name: string | null;
  occurred_at: string | null;
  severity: string | null;
  status: string | null;
}

export interface GuardDoc {
  id: string;
  document_title: string;
  document_type: string;
  status: string;
  review_status: string;
  expiry_date: string | null;
}

export function useGuardProfile(guardId: string | null) {
  const { companyId } = useAuth();
  const [shifts, setShifts] = useState<GuardShift[]>([]);
  const [incidents, setIncidents] = useState<GuardIncident[]>([]);
  const [docs, setDocs] = useState<GuardDoc[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [shiftsError, setShiftsError] = useState<string | null>(null);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);
  const [docsError, setDocsError] = useState<string | null>(null);

  const loadShifts = useCallback(async () => {
    if (!guardId || !companyId) return;
    setShiftsLoading(true);
    setShiftsError(null);
    const { data, error } = await supabase
      .from('shifts')
      .select('id, start_time, end_time, shift_type, status, sites(site_name)')
      .eq('company_id', companyId)
      .eq('guard_id', guardId)
      .order('start_time', { ascending: false })
      .limit(20);
    if (error) {
      setShiftsError(error.message);
      setShifts([]);
    } else {
      setShifts(
        (data || []).map((r: any) => ({
          id: r.id,
          site_name: r.sites?.site_name || null,
          start_time: r.start_time,
          end_time: r.end_time,
          shift_type: r.shift_type,
          status: r.status,
        }))
      );
    }
    setShiftsLoading(false);
  }, [guardId, companyId]);

  const loadIncidents = useCallback(async () => {
    if (!guardId || !companyId) return;
    setIncidentsLoading(true);
    setIncidentsError(null);
    const { data, error } = await supabase
      .from('incidents')
      .select('id, incident_number, title, incident_type, severity, status, occurred_at, sites(site_name)')
      .eq('company_id', companyId)
      .eq('guard_id', guardId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      setIncidentsError(error.message);
      setIncidents([]);
    } else {
      setIncidents(
        (data || []).map((r: any) => ({
          id: r.id,
          incident_number: r.incident_number,
          title: r.title,
          incident_type: r.incident_type,
          site_name: r.sites?.site_name || null,
          occurred_at: r.occurred_at,
          severity: r.severity,
          status: r.status,
        }))
      );
    }
    setIncidentsLoading(false);
  }, [guardId, companyId]);

  const loadDocs = useCallback(async () => {
    if (!guardId || !companyId) return;
    setDocsLoading(true);
    setDocsError(null);
    const { data, error } = await supabase
      .from('compliance_documents')
      .select('id, document_title, document_type, status, review_status, expiry_date')
      .eq('company_id', companyId)
      .eq('entity_type', 'guard')
      .eq('entity_id', guardId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      setDocsError(error.message);
      setDocs([]);
    } else {
      setDocs(
        (data || []).map((r: any) => ({
          id: r.id,
          document_title: r.document_title,
          document_type: r.document_type,
          status: r.status,
          review_status: r.review_status,
          expiry_date: r.expiry_date,
        }))
      );
    }
    setDocsLoading(false);
  }, [guardId, companyId]);

  useEffect(() => {
    setShifts([]);
    setIncidents([]);
    setDocs([]);
    setShiftsError(null);
    setIncidentsError(null);
    setDocsError(null);
    if (!guardId || !companyId) return;
    loadShifts();
    loadIncidents();
    loadDocs();
  }, [guardId, companyId, loadShifts, loadIncidents, loadDocs]);

  return {
    shifts,
    incidents,
    docs,
    shiftsLoading,
    incidentsLoading,
    docsLoading,
    shiftsError,
    incidentsError,
    docsError,
    refetchShifts: loadShifts,
    refetchIncidents: loadIncidents,
    refetchDocs: loadDocs,
  };
}