'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export type ACSEvidence = {
  id: string;
  company_id: string;
  title: string;
  acs_area: string;
  acs_criterion: string;
  category: string;
  owner: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  review_date: string | null;
  expiry_date: string | null;
  version: string;
  status: string;
  notes: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
};

export type ACSStaffCompliance = {
  id: string;
  company_id: string;
  guard_id: string | null;
  staff_name: string;
  sia_licence: string | null;
  sia_expiry: string | null;
  right_to_work_status: string | null;
  right_to_work_expiry: string | null;
  right_to_work_file_url: string | null;
  vetting_status: string | null;
  vetting_file_url: string | null;
  reference_status: string | null;
  reference_file_url: string | null;
  employment_history_verified: boolean | null;
  training_records: any[];
  site_induction_date: string | null;
  last_appraisal_date: string | null;
  welfare_notes: string | null;
  disciplinary_records: any[];
  status: string;
  created_at: string;
  updated_at: string;
};

export type ACSPolicy = {
  id: string;
  company_id: string;
  title: string;
  policy_type: string | null;
  version: string | null;
  content: string | null;
  file_url: string | null;
  owner: string | null;
  review_date: string | null;
  approved_at: string | null;
  approved_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ACSPolicyAck = {
  id: string;
  policy_id: string;
  user_id: string;
  acknowledged_at: string | null;
  ip_address: string | null;
  created_at: string;
};

export type ACSCriterion = {
  id: string;
  company_id: string;
  acs_area: string;
  criterion_code: string;
  criterion_title: string;
  sub_criterion: string | null;
  indicator: string | null;
  status: string;
  owner: string | null;
  due_date: string | null;
  notes: string | null;
  evidence_ids: string[];
  created_at: string;
  updated_at: string;
};

export type ACSCorrectiveAction = {
  id: string;
  company_id: string;
  title: string;
  issue: string;
  owner: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  evidence_id: string | null;
  criterion_id: string | null;
  completion_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ACSSiteCompliance = {
  id: string;
  company_id: string;
  site_id: string;
  assignment_instructions_url: string | null;
  assignment_instructions_expiry: string | null;
  sops_current: boolean | null;
  risk_assessment_url: string | null;
  risk_assessment_expiry: string | null;
  patrol_log_available: boolean | null;
  check_call_log_available: boolean | null;
  incident_reports_count: number | null;
  dob_log_available: boolean | null;
  supervisor_audit_date: string | null;
  client_review_notes: string | null;
  status: string | null;
  last_reviewed_at: string | null;
  updated_at: string;
};

export type ACSConfig = {
  id: string;
  company_id: string;
  next_assessment_date: string | null;
  last_assessment_date: string | null;
  assessment_type: string | null;
  acs_number: string | null;
  status: string | null;
  overall_readiness: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export interface ACSData {
  evidence: ACSEvidence[];
  staffCompliance: ACSStaffCompliance[];
  policies: ACSPolicy[];
  policyAcks: ACSPolicyAck[];
  criteria: ACSCriterion[];
  actions: ACSCorrectiveAction[];
  siteCompliance: ACSSiteCompliance[];
  config: ACSConfig | null;
  isLoading: boolean;
  refresh: () => void;
}

const ACSCtx = createContext<ACSData | undefined>(undefined);

export function ACSProvider({ children }: { children: React.ReactNode }) {
  const { companyId } = useAuth();
  const [evidence, setEvidence] = useState<ACSEvidence[]>([]);
  const [staffCompliance, setStaffCompliance] = useState<ACSStaffCompliance[]>([]);
  const [policies, setPolicies] = useState<ACSPolicy[]>([]);
  const [policyAcks, setPolicyAcks] = useState<ACSPolicyAck[]>([]);
  const [criteria, setCriteria] = useState<ACSCriterion[]>([]);
  const [actions, setActions] = useState<ACSCorrectiveAction[]>([]);
  const [siteCompliance, setSiteCompliance] = useState<ACSSiteCompliance[]>([]);
  const [config, setConfig] = useState<ACSConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);

    const { data: ev } = await supabase
      .from('acs_evidence')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setEvidence(ev || []);

    const { data: st } = await supabase
      .from('acs_staff_compliance')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
    setStaffCompliance(st || []);

    const { data: po } = await supabase
      .from('acs_policies')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setPolicies(po || []);

    const { data: pa } = await supabase
      .from('acs_policy_acknowledgements')
      .select('*')
      .in('policy_id', (po || []).map((p) => p.id));
    setPolicyAcks(pa || []);

    const { data: cr } = await supabase
      .from('acs_criteria')
      .select('*')
      .eq('company_id', companyId)
      .order('criterion_code', { ascending: true });
    setCriteria(cr || []);

    const { data: ac } = await supabase
      .from('acs_corrective_actions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setActions(ac || []);

    const { data: sc } = await supabase
      .from('acs_site_compliance')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
    setSiteCompliance(sc || []);

    const { data: cf } = await supabase
      .from('acs_assessment_config')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();
    setConfig(cf || null);

    setIsLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (companyId) fetchAll();
  }, [companyId, fetchAll]);

  const val = {
    evidence,
    staffCompliance,
    policies,
    policyAcks,
    criteria,
    actions,
    siteCompliance,
    config,
    isLoading,
    refresh: fetchAll,
  };

  return React.createElement(ACSCtx.Provider, { value: val }, children);
}

export function useACS() {
  const ctx = useContext(ACSCtx);
  if (!ctx) throw new Error('useACS must be used within ACSProvider');
  return ctx;
}