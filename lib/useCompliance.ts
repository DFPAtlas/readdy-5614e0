'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ComplianceFramework = {
  id: string;
  slug: string;
  name: string;
  framework_type: string;
  description: string | null;
  status: string;
  is_published: boolean;
  review_due_at: string | null;
};

export type Subprocessor = {
  id: string;
  provider_name: string;
  service: string | null;
  data_processed: string | null;
  processing_location: string | null;
  transfer_countries: string | null;
  contract_status: string;
  security_review_status: string;
  transfer_mechanism: string | null;
  is_published: boolean;
};

export type PolicyDocument = {
  id: string;
  slug: string;
  title: string;
  category: string;
  version: string;
  status: string;
  is_published: boolean;
  effective_date: string | null;
  reviewed_date: string | null;
  review_due_date: string | null;
  change_summary: string | null;
  body: string | null;
};

export type AiAutomationEntry = {
  id: string;
  system_name: string;
  purpose: string | null;
  data_used: string | null;
  model_provider: string | null;
  decision_type: string | null;
  human_involvement: string | null;
  impact_on_individuals: string | null;
  explanation_available: boolean;
  dpia_status: string | null;
  bias_testing: string | null;
  approval_status: string;
  is_published: boolean;
};

export type ProcessingActivity = {
  id: string;
  company_id: string | null;
  slug: string | null;
  name: string;
  purpose: string | null;
  data_subjects: string | null;
  personal_data_categories: string | null;
  sensitive_data_category: string | null;
  lawful_basis: string | null;
  article9_condition: string | null;
  criminal_offence_condition: string | null;
  controller_role: string;
  processor_role: string | null;
  retention_period: string | null;
  status: string;
  review_date: string | null;
};

export type LawfulBasisRecord = {
  id: string;
  company_id: string | null;
  processing_activity_id: string | null;
  basis_type: string;
  purpose: string | null;
  necessity_assessment: string | null;
  decision_owner_id: string | null;
  decision_notes: string | null;
  recorded_at: string;
};

export type DpiaAssessment = {
  id: string;
  company_id: string | null;
  is_template: boolean;
  title: string;
  processing_description: string | null;
  systematic_monitoring: boolean;
  automated_decisions: boolean;
  international_transfers: boolean;
  residual_risk: string;
  escalation_recorded: boolean;
  approval_status: string;
  review_date: string | null;
};

export type BreachCase = {
  id: string;
  company_id: string;
  reference: string | null;
  discovery_time: string | null;
  awareness_time: string | null;
  description: string | null;
  data_affected: string | null;
  subjects_affected: string | null;
  approx_volume: number | null;
  cia_impact: string | null;
  risk_to_individuals: string | null;
  reportability_assessment: string;
  regulator_notification_deadline: string | null;
  status: string;
  created_at: string;
};

export type ReviewTask = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
};

export type LocationTrackingConfig = {
  id: string;
  company_id: string;
  purpose: string | null;
  lawful_basis: string | null;
  tracked_subjects: string | null;
  tracking_start: string | null;
  tracking_stop: string | null;
  background_tracking_enabled: boolean;
  precision_required: string | null;
  retention_days: number | null;
  viewer_roles: string | null;
  emergency_rules: string | null;
  worker_notice_version: string | null;
  dpia_status: string;
  contact_name: string | null;
  is_active: boolean;
};

export type AcsRecord = {
  id: string;
  company_id: string;
  acs_status: string;
  approved_activities: string[] | null;
  approval_reference: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  display_authorised: boolean;
  assessor: string | null;
};

export type SiaLicence = {
  id: string;
  company_id: string;
  worker_id: string | null;
  licence_number: string | null;
  licence_type: string | null;
  licence_activity: string | null;
  status: string;
  expiry_date: string | null;
  last_checked_date: string | null;
  check_source: string | null;
  assignment_eligibility: string;
  verification_method: string | null;
};

export function useCompliance() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [subprocessors, setSubprocessors] = useState<Subprocessor[]>([]);
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [aiRegister, setAiRegister] = useState<AiAutomationEntry[]>([]);
  const [activities, setActivities] = useState<ProcessingActivity[]>([]);
  const [lawfulBases, setLawfulBases] = useState<LawfulBasisRecord[]>([]);
  const [dpias, setDpias] = useState<DpiaAssessment[]>([]);
  const [breaches, setBreaches] = useState<BreachCase[]>([]);
  const [reviewTasks, setReviewTasks] = useState<ReviewTask[]>([]);
  const [locationConfig, setLocationConfig] = useState<LocationTrackingConfig | null>(null);
  const [acsRecord, setAcsRecord] = useState<AcsRecord | null>(null);
  const [siaLicences, setSiaLicences] = useState<SiaLicence[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      f, s, p, ai, a, lb, dp, b, t, lc, acs, sia, cid,
    ] = await Promise.all([
      supabase.from('compliance_frameworks').select('*').order('name'),
      supabase.from('subprocessors').select('*').order('provider_name'),
      supabase.from('policy_documents').select('*').order('title'),
      supabase.from('ai_automation_register').select('*').order('system_name'),
      supabase.from('processing_activities').select('*').order('name'),
      supabase.from('lawful_basis_records').select('*').order('recorded_at', { ascending: false }),
      supabase.from('dpia_assessments').select('*').order('title'),
      supabase.from('data_breach_cases').select('*').order('created_at', { ascending: false }),
      supabase.from('compliance_review_tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('location_tracking_configs').select('*').limit(1).maybeSingle(),
      supabase.from('company_acs_records').select('*').limit(1).maybeSingle(),
      supabase.from('sia_licences').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.rpc('get_my_company_id'),
    ]);

    setFrameworks(f.data || []);
    setSubprocessors(s.data || []);
    setPolicies(p.data || []);
    setAiRegister(ai.data || []);
    setActivities(a.data || []);
    setLawfulBases(lb.data || []);
    setDpias(dp.data || []);
    setBreaches(b.data || []);
    setReviewTasks(t.data || []);
    setLocationConfig(lc.data || null);
    setAcsRecord(acs.data || null);
    setSiaLicences(sia.data || []);
    setCompanyId(typeof cid.data === 'string' ? (cid.data as string) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveLocationConfig = async (cfg: Partial<LocationTrackingConfig>) => {
    if (!companyId) return { error: { message: 'No company context' } };
    const payload = { ...cfg, company_id: companyId };
    if (locationConfig?.id) {
      const { error } = await supabase.from('location_tracking_configs').update(payload).eq('id', locationConfig.id);
      if (!error) await load();
      return { error };
    }
    const { error } = await supabase.from('location_tracking_configs').insert(payload);
    if (!error) await load();
    return { error };
  };

  const saveAcsRecord = async (rec: Partial<AcsRecord>) => {
    if (!companyId) return { error: { message: 'No company context' } };
    const payload = { ...rec, company_id: companyId };
    if (acsRecord?.id) {
      const { error } = await supabase.from('company_acs_records').update(payload).eq('id', acsRecord.id);
      if (!error) await load();
      return { error };
    }
    const { error } = await supabase.from('company_acs_records').insert(payload);
    if (!error) await load();
    return { error };
  };

  const createBreach = async (data: Partial<BreachCase>) => {
    if (!companyId) return { error: { message: 'No company context' } };
    const { error } = await supabase.from('data_breach_cases').insert({
      ...data,
      company_id: companyId,
      reference: data.reference || `BR-${Date.now().toString().slice(-6)}`,
      status: data.status || 'open',
    });
    if (!error) await load();
    return { error };
  };

  const updateBreach = async (id: string, data: Partial<BreachCase>) => {
    const { error } = await supabase.from('data_breach_cases').update(data).eq('id', id);
    if (!error) await load();
    return { error };
  };

  const createDpia = async (data: Partial<DpiaAssessment>) => {
    const payload = { ...data, company_id: companyId, is_template: false };
    const { error } = await supabase.from('dpia_assessments').insert(payload);
    if (!error) await load();
    return { error };
  };

  const updateDpia = async (id: string, data: Partial<DpiaAssessment>) => {
    const { error } = await supabase.from('dpia_assessments').update(data).eq('id', id);
    if (!error) await load();
    return { error };
  };

  const createProcessingActivity = async (data: Partial<ProcessingActivity>) => {
    const { error } = await supabase.from('processing_activities').insert({
      ...data,
      company_id: companyId,
      status: data.status || 'legal_review',
    });
    if (!error) await load();
    return { error };
  };

  const createLawfulBasis = async (data: Partial<LawfulBasisRecord>) => {
    const { error } = await supabase.from('lawful_basis_records').insert({ ...data, company_id: companyId });
    if (!error) await load();
    return { error };
  };

  const createReviewTask = async (data: Partial<ReviewTask>) => {
    const { error } = await supabase.from('compliance_review_tasks').insert(data);
    if (!error) await load();
    return { error };
  };

  const updateReviewTask = async (id: string, data: Partial<ReviewTask>) => {
    const { error } = await supabase.from('compliance_review_tasks').update(data).eq('id', id);
    if (!error) await load();
    return { error };
  };

  return {
    loading,
    frameworks,
    subprocessors,
    policies,
    aiRegister,
    activities,
    lawfulBases,
    dpias,
    breaches,
    reviewTasks,
    locationConfig,
    acsRecord,
    siaLicences,
    companyId,
    load,
    saveLocationConfig,
    saveAcsRecord,
    createBreach,
    updateBreach,
    createDpia,
    updateDpia,
    createProcessingActivity,
    createLawfulBasis,
    createReviewTask,
    updateReviewTask,
  };
}