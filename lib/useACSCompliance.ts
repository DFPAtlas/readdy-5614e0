'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface AuditRun {
  id: string;
  company_id: string;
  run_type: string;
  audit_name: string | null;
  audit_type: string | null;
  overall_score: number | null;
  status: string;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  initiated_by: string | null;
  started_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  governance_score: number | null;
  personnel_score: number | null;
  training_score: number | null;
  site_score: number | null;
  health_safety_score: number | null;
  customer_service_score: number | null;
  evidence_score: number | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  id: string;
  company_id: string;
  audit_run_id: string | null;
  category: string;
  subcategory: string | null;
  finding: string;
  severity: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  finding_type: string | null;
  title: string | null;
  description: string | null;
  related_table: string | null;
  related_record_id: string | null;
  recommended_action: string | null;
  owner_user_id: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AreaScore {
  name: string;
  score: number;
  total: number;
  ready: number;
  issues: number;
  status: 'green' | 'amber' | 'red';
}

export interface GuardComplianceProfile {
  id: string;
  guard_name: string;
  siaLicence: boolean;
  siaExpiry: string | null;
  rightToWork: boolean;
  rightToWorkExpiry: string | null;
  photoId: boolean;
  addressVerification: boolean;
  employmentHistory: boolean;
  references: boolean;
  bs7858Screening: boolean;
  emergencyContact: boolean;
  employmentContract: boolean;
  trainingCerts: number;
  expiredTraining: number;
  completeness: number;
  status: 'green' | 'amber' | 'red';
}

export interface GovernanceItem {
  id: string;
  title: string;
  category: string;
  status: string;
  expiry_date: string | null;
  review_date: string | null;
  file_url: string | null;
  score_impact: number;
}

export interface SiteComplianceItem {
  id: string;
  site_id: string;
  site_name: string;
  assignmentInstructions: boolean;
  assignmentInstructionsExpiry: string | null;
  riskAssessment: boolean;
  riskAssessmentExpiry: string | null;
  siteSurvey: boolean;
  emergencyProcedures: boolean;
  patrolRoutes: boolean;
  clientSLA: boolean;
  siteContacts: boolean;
  keyRegister: boolean;
  incidentLogs: number;
  dobRecords: boolean;
  patrolRecords: boolean;
  score: number;
  status: 'green' | 'amber' | 'red';
}

export interface HealthSafetyItem {
  id: string;
  title: string;
  category: string;
  status: string;
  review_date: string | null;
  expiry_date: string | null;
}

export interface CustomerServiceItem {
  id: string;
  title: string;
  category: string;
  status: string;
  due_date: string | null;
}

export function useACSCompliance() {
  const { companyId, profile } = useAuth();
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>([]);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [areaScores, setAreaScores] = useState<AreaScore[]>([]);
  const [guardProfiles, setGuardProfiles] = useState<GuardComplianceProfile[]>([]);
  const [governanceItems, setGovernanceItems] = useState<GovernanceItem[]>([]);
  const [siteComplianceItems, setSiteComplianceItems] = useState<SiteComplianceItem[]>([]);
  const [healthSafetyItems, setHealthSafetyItems] = useState<HealthSafetyItem[]>([]);
  const [customerServiceItems, setCustomerServiceItems] = useState<CustomerServiceItem[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [packLoading, setPackLoading] = useState(false);
  const [packResult, setPackResult] = useState<any>(null);
  const [evidencePacks, setEvidencePacks] = useState<any[]>([]);

  const isAdmin = profile?.role && ['super_admin', 'company_admin', 'operations_manager'].includes(profile.role);

  const fetchAll = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const [
        auditRunsRes, auditFindingsRes, acsEvidenceRes, acsStaffRes, acsSiteRes,
        acsPoliciesRes, acsCriteriaRes, acsActionsRes, acsConfigRes,
        guardCertsRes, guardVettingRes, guardsRes, trainingCompletionsRes, trainingModulesRes,
        sitesRes,
      ] = await Promise.all([
        supabase.from('acs_audit_runs').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('acs_audit_findings').select('*').eq('company_id', companyId).order('severity', { ascending: true }),
        supabase.from('acs_evidence').select('*').eq('company_id', companyId),
        supabase.from('acs_staff_compliance').select('*').eq('company_id', companyId),
        supabase.from('acs_site_compliance').select('*, sites!acs_site_compliance_site_id_fkey(id, site_name)').eq('company_id', companyId),
        supabase.from('acs_policies').select('*').eq('company_id', companyId),
        supabase.from('acs_criteria').select('*').eq('company_id', companyId),
        supabase.from('acs_corrective_actions').select('*').eq('company_id', companyId),
        supabase.from('acs_assessment_config').select('*').eq('company_id', companyId).maybeSingle(),
        supabase.from('guard_certifications').select('*').eq('company_id', companyId),
        supabase.from('guard_vetting_records').select('*').eq('company_id', companyId),
        supabase.from('guards').select('id, first_name, last_name, sia_licence, sia_expiry, hire_date, status').eq('company_id', companyId),
        supabase.from('training_completions').select('*').eq('company_id', companyId),
        supabase.from('training_modules').select('*').eq('company_id', companyId),
        supabase.from('sites').select('id, site_name').eq('company_id', companyId),
      ]);

      setAuditRuns(auditRunsRes.data || []);
      setAuditFindings(auditFindingsRes.data || []);

      const evidence = acsEvidenceRes.data || [];
      const staff = acsStaffRes.data || [];
      const siteData = acsSiteRes.data || [];
      const policies = acsPoliciesRes.data || [];
      const criteria = acsCriteriaRes.data || [];
      const actions = acsActionsRes.data || [];
      const config = acsConfigRes.data;
      const guardCerts = guardCertsRes.data || [];
      const guardVetting = guardVettingRes.data || [];
      const guards = guardsRes.data || [];
      const completions = trainingCompletionsRes.data || [];
      const modules = trainingModulesRes.data || [];
      const sites = sitesRes.data || [];

      const evidenceCurrent = evidence.filter((e: any) => !e.expiry_date || e.expiry_date >= now).length;
      const evidenceExpired = evidence.filter((e: any) => e.expiry_date && e.expiry_date < now).length;
      const evidenceScore = evidence.length > 0 ? Math.round((evidenceCurrent / evidence.length) * 100) : 0;

      const staffCompliant = staff.filter((s: any) => s.status === 'compliant').length;
      const staffExpired = staff.filter((s: any) => (s.sia_expiry && s.sia_expiry < now) || (s.right_to_work_expiry && s.right_to_work_expiry < now)).length;
      const staffScore = staff.length > 0 ? Math.round((staffCompliant / staff.length) * 100) : 0;

      const siteCompliantCount = siteData.filter((s: any) => s.status === 'compliant').length;
      const siteScore = siteData.length > 0 ? Math.round((siteCompliantCount / siteData.length) * 100) : 0;

      const policiesApproved = policies.filter((p: any) => p.status === 'approved').length;
      const policiesExpiringSoon = policies.filter((p: any) => p.review_date && p.review_date >= now && p.review_date <= thirtyDays).length;
      const policiesScore = policies.length > 0 ? Math.round((policiesApproved / policies.length) * 100) : 0;

      const criteriaReady = criteria.filter((c: any) => c.status === 'ready' || c.status === 'complete').length;
      const criteriaScore = criteria.length > 0 ? Math.round((criteriaReady / criteria.length) * 100) : 0;

      const actionsOpen = actions.filter((a: any) => a.status === 'open').length;
      const actionsOverdue = actions.filter((a: any) => a.status === 'open' && a.due_date && a.due_date < now).length;

      const totalCerts = guardCerts.length;
      const expiredCerts = guardCerts.filter((c: any) => c.expiry_date && c.expiry_date < now).length;
      const certsExpiringSoon = guardCerts.filter((c: any) => c.expiry_date && c.expiry_date >= now && c.expiry_date <= thirtyDays).length;
      const trainingScore = totalCerts > 0 ? Math.round(((totalCerts - expiredCerts) / totalCerts) * 100) : 0;

      const hnsItemsTotal = evidence.filter((e: any) => e.category === 'health_safety').length;
      const hnsCurrent = evidence.filter((e: any) => e.category === 'health_safety' && (!e.expiry_date || e.expiry_date >= now)).length;
      const hnsScore = hnsItemsTotal > 0 ? Math.round((hnsCurrent / hnsItemsTotal) * 100) : 0;

      const customerItemsTotal = actions.filter((a: any) => a.title?.toLowerCase().includes('customer') || a.title?.toLowerCase().includes('client')).length;
      const customerScore = actions.length > 0 ? Math.round(((actions.length - actionsOpen) / actions.length) * 100) : 0;

      const governanceItemsTotal = policies.filter((p: any) =>
        ['insurance', 'governance', 'business_continuity', 'complaints', 'gdpr', 'equal_opportunities', 'environmental', 'modern_slavery', 'health_safety_policy'].includes(p.policy_type)
      ).length;
      const governanceCurrent = policies.filter((p: any) =>
        ['insurance', 'governance', 'business_continuity', 'complaints', 'gdpr', 'equal_opportunities', 'environmental', 'modern_slavery', 'health_safety_policy'].includes(p.policy_type) && p.status === 'approved'
      ).length;
      const governanceScore = governanceItemsTotal > 0 ? Math.round((governanceCurrent / governanceItemsTotal) * 100) : 0;

      const computedOverall = Math.round(
        (governanceScore + staffScore + trainingScore + siteScore + criteriaScore + hnsScore + evidenceScore + customerScore) /
        ([governanceScore, staffScore, trainingScore, siteScore, criteriaScore, hnsScore, evidenceScore, customerScore].filter((s) => s > 0).length || 8)
      );

      setOverallScore(computedOverall);

      const as: AreaScore[] = [
        { name: 'Company Governance', score: governanceScore, total: governanceItemsTotal, ready: governanceCurrent, issues: governanceItemsTotal - governanceCurrent, status: governanceScore >= 85 ? 'green' : governanceScore >= 60 ? 'amber' : 'red' },
        { name: 'Personnel Records', score: staffScore, total: staff.length, ready: staffCompliant, issues: staffExpired, status: staffScore >= 85 ? 'green' : staffScore >= 60 ? 'amber' : 'red' },
        { name: 'Training Compliance', score: trainingScore, total: totalCerts, ready: totalCerts - expiredCerts, issues: expiredCerts, status: trainingScore >= 85 ? 'green' : trainingScore >= 60 ? 'amber' : 'red' },
        { name: 'Site Documentation', score: siteScore, total: siteData.length, ready: siteCompliantCount, issues: siteData.length - siteCompliantCount, status: siteScore >= 85 ? 'green' : siteScore >= 60 ? 'amber' : 'red' },
        { name: 'Operations Management', score: criteriaScore, total: criteria.length, ready: criteriaReady, issues: criteria.length - criteriaReady, status: criteriaScore >= 85 ? 'green' : criteriaScore >= 60 ? 'amber' : 'red' },
        { name: 'Health & Safety', score: hnsScore, total: hnsItemsTotal, ready: hnsCurrent, issues: hnsItemsTotal - hnsCurrent, status: hnsScore >= 85 ? 'green' : hnsScore >= 60 ? 'amber' : 'red' },
        { name: 'Customer Service', score: customerScore, total: actions.length, ready: actions.length - actionsOpen, issues: actionsOpen + actionsOverdue, status: customerScore >= 85 ? 'green' : customerScore >= 60 ? 'amber' : 'red' },
        { name: 'Evidence Quality', score: evidenceScore, total: evidence.length, ready: evidenceCurrent, issues: evidenceExpired, status: evidenceScore >= 85 ? 'green' : evidenceScore >= 60 ? 'amber' : 'red' },
      ];
      setAreaScores(as);

      const governance: GovernanceItem[] = [
        ...policies.filter((p: any) => p.policy_type === 'insurance').map((p: any) => ({
          id: p.id, title: p.title || 'Insurance Certificate', category: 'Insurance', status: p.status, expiry_date: null, review_date: p.review_date, file_url: p.file_url, score_impact: 5,
        })),
        ...evidence.filter((e: any) => e.category === 'governance').map((e: any) => ({
          id: e.id, title: e.title, category: 'Governance', status: e.status, expiry_date: e.expiry_date, review_date: e.review_date, file_url: e.file_url, score_impact: 3,
        })),
      ];

      if (governance.length === 0) {
        governance.push(
          { id: 'g1', title: 'Company Registration', category: 'Governance', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
          { id: 'g2', title: 'Insurance Certificate', category: 'Insurance', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
          { id: 'g3', title: 'Employers Liability', category: 'Insurance', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
          { id: 'g4', title: 'Public Liability', category: 'Insurance', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
          { id: 'g5', title: 'Professional Indemnity', category: 'Insurance', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
          { id: 'g6', title: 'ISO Certifications', category: 'Certification', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 3 },
          { id: 'g7', title: 'Business Continuity Plan', category: 'Governance', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
          { id: 'g8', title: 'Complaints Procedure', category: 'Governance', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 3 },
          { id: 'g9', title: 'Equal Opportunities Policy', category: 'Policy', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 3 },
          { id: 'g10', title: 'GDPR Policy', category: 'Policy', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
          { id: 'g11', title: 'Environmental Policy', category: 'Policy', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 2 },
          { id: 'g12', title: 'Modern Slavery Policy', category: 'Policy', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 3 },
          { id: 'g13', title: 'Health & Safety Policy', category: 'Policy', status: 'unknown', expiry_date: null, review_date: null, file_url: null, score_impact: 5 },
        );
      }
      setGovernanceItems(governance);

      const siteMap = new Map(sites.map((s: any) => [s.id, s.site_name]));
      const siteItems: SiteComplianceItem[] = siteData.map((sc: any) => {
        const aiExpired = sc.assignment_instructions_expiry && sc.assignment_instructions_expiry < now;
        const raExpired = sc.risk_assessment_expiry && sc.risk_assessment_expiry < now;
        let s = 100;
        if (!sc.assignment_instructions_url) s -= 25;
        if (aiExpired) s -= 25;
        if (!sc.risk_assessment_url) s -= 25;
        if (raExpired) s -= 25;
        return {
          id: sc.id,
          site_id: sc.site_id,
          site_name: sc.sites?.site_name || siteMap.get(sc.site_id) || 'Unknown Site',
          assignmentInstructions: !!sc.assignment_instructions_url && !aiExpired,
          assignmentInstructionsExpiry: sc.assignment_instructions_expiry,
          riskAssessment: !!sc.risk_assessment_url && !raExpired,
          riskAssessmentExpiry: sc.risk_assessment_expiry,
          siteSurvey: false,
          emergencyProcedures: false,
          patrolRoutes: sc.patrol_log_available || false,
          clientSLA: false,
          siteContacts: false,
          keyRegister: false,
          incidentLogs: sc.incident_reports_count || 0,
          dobRecords: sc.dob_log_available || false,
          patrolRecords: sc.patrol_log_available || false,
          score: Math.max(0, s),
          status: Math.max(0, s) >= 85 ? 'green' : Math.max(0, s) >= 60 ? 'amber' : 'red',
        };
      });
      setSiteComplianceItems(siteItems);

      const guardProfilesArr: GuardComplianceProfile[] = guards.map((g: any) => {
        const vet = guardVetting.find((v: any) => v.guard_id === g.id);
        const certs = guardCerts.filter((c: any) => c.guard_id === g.id);
        const expiredTr = certs.filter((c: any) => c.expiry_date && c.expiry_date < now).length;
        const name = `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unknown';
        const items = [
          !!g.sia_licence && (!g.sia_expiry || g.sia_expiry >= now),
          vet?.rtw_verified,
          vet?.id_verified,
          vet?.address_history_complete,
          vet?.employment_history_complete,
          !!(g.reference_1_name || (vet?.reference_1_verified)),
          vet?.vetting_status === 'complete',
          !!g.emergency_contact_name,
          !!g.hire_date,
          certs.filter((c: any) => !c.expiry_date || c.expiry_date >= now).length > 0,
        ];
        const complete = items.filter(Boolean).length;
        const pct = Math.round((complete / items.length) * 100);
        return {
          id: g.id,
          guard_name: name,
          siaLicence: !!g.sia_licence && (!g.sia_expiry || g.sia_expiry >= now),
          siaExpiry: g.sia_expiry || null,
          rightToWork: vet?.rtw_verified || false,
          rightToWorkExpiry: vet?.rtw_expiry || null,
          photoId: vet?.id_verified || false,
          addressVerification: vet?.address_history_complete || false,
          employmentHistory: vet?.employment_history_complete || false,
          references: !!(g.reference_1_name || (vet?.reference_1_verified)),
          bs7858Screening: vet?.vetting_status === 'complete',
          emergencyContact: !!g.emergency_contact_name,
          employmentContract: !!g.hire_date,
          trainingCerts: certs.filter((c: any) => !c.expiry_date || c.expiry_date >= now).length,
          expiredTraining: expiredTr,
          completeness: pct,
          status: pct >= 85 ? 'green' : pct >= 60 ? 'amber' : 'red',
        };
      });
      setGuardProfiles(guardProfilesArr);

      const hns: HealthSafetyItem[] = evidence
        .filter((e: any) => e.category === 'health_safety')
        .map((e: any) => ({ id: e.id, title: e.title, category: e.category, status: e.status, review_date: e.review_date, expiry_date: e.expiry_date }));
      if (hns.length === 0) {
        hns.push(
          { id: 'h1', title: 'Accident Reports', category: 'accident', status: 'unknown', review_date: null, expiry_date: null },
          { id: 'h2', title: 'Near Miss Reports', category: 'near_miss', status: 'unknown', review_date: null, expiry_date: null },
          { id: 'h3', title: 'PPE Records', category: 'ppe', status: 'unknown', review_date: null, expiry_date: null },
          { id: 'h4', title: 'COSHH Records', category: 'coshh', status: 'unknown', review_date: null, expiry_date: null },
          { id: 'h5', title: 'Manual Handling Assessments', category: 'manual_handling', status: 'unknown', review_date: null, expiry_date: null },
          { id: 'h6', title: 'Fire Risk Assessments', category: 'fire', status: 'unknown', review_date: null, expiry_date: null },
          { id: 'h7', title: 'Equipment Inspections', category: 'equipment', status: 'unknown', review_date: null, expiry_date: null },
        );
      }
      setHealthSafetyItems(hns);

      const cs: CustomerServiceItem[] = actions
        .filter((a: any) => a.title?.toLowerCase().includes('customer') || a.title?.toLowerCase().includes('client') || a.title?.toLowerCase().includes('survey') || a.title?.toLowerCase().includes('complaint'))
        .map((a: any) => ({ id: a.id, title: a.title, category: a.title?.toLowerCase().includes('complaint') ? 'complaints' : a.title?.toLowerCase().includes('survey') ? 'survey' : 'general', status: a.status, due_date: a.due_date }));
      if (cs.length === 0) {
        cs.push(
          { id: 'c1', title: 'Client Satisfaction Survey Q1', category: 'survey', status: 'not_started', due_date: null },
          { id: 'c2', title: 'Complaints Register Review', category: 'complaints', status: 'not_started', due_date: null },
          { id: 'c3', title: 'Compliments Log', category: 'compliments', status: 'not_started', due_date: null },
          { id: 'c4', title: 'Site Inspection Reports', category: 'inspection', status: 'not_started', due_date: null },
          { id: 'c5', title: 'Client Meeting Minutes', category: 'meetings', status: 'not_started', due_date: null },
        );
      }
      setCustomerServiceItems(cs);

    } catch (err: any) {
      setError(err.message || 'Failed to load ACS compliance data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runAIAudit = useCallback(async () => {
    if (!companyId) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await supabase.functions.invoke('acs-audit', { body: { company_id: companyId } });
      if (res.error) throw new Error(res.error.message);
      const report = res.data;

      if (report && report.findings) {
        const findingsToInsert = report.findings.map((f: any) => ({
          company_id: companyId,
          category: f.category || 'ai_audit',
          subcategory: f.subcategory || null,
          finding: f.finding,
          severity: f.severity || 'medium',
          status: 'open',
        }));

        const { data: runData } = await supabase.from('acs_audit_runs').insert({
          company_id: companyId,
          run_type: 'ai',
          overall_score: report.overall_score || 0,
          status: 'completed',
          findings_count: report.total_findings || findingsToInsert.length,
          critical_count: report.critical_count || 0,
          high_count: report.high_count || 0,
          medium_count: report.medium_count || 0,
          low_count: report.low_count || 0,
          initiated_by: profile?.id || null,
          completed_at: new Date().toISOString(),
        }).select().maybeSingle();

        if (runData?.id && findingsToInsert.length > 0) {
          await supabase.from('acs_audit_findings').insert(
            findingsToInsert.map((f: any) => ({ ...f, audit_run_id: runData.id }))
          );
        }

        setAiResult(report);
        await fetchAll();
      }
    } catch (err: any) {
      setError(err.message || 'AI audit failed');
    } finally {
      setAiLoading(false);
    }
  }, [companyId, profile?.id, fetchAll]);

  const fetchEvidencePacks = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from('acs_evidence_packs').select('*').eq('company_id', companyId).order('generated_at', { ascending: false });
    setEvidencePacks(data || []);
  }, [companyId]);

  useEffect(() => { if (companyId) { fetchEvidencePacks(); } }, [companyId, fetchEvidencePacks]);

  const generateEvidencePack = useCallback(async () => {
    if (!companyId) return null;
    setPackLoading(true);
    setPackResult(null);
    setError(null);
    try {
      const res = await supabase.functions.invoke('generate-acs-evidence-pack', { body: { } });
      if (res.error) throw new Error(res.error.message);
      setPackResult(res.data);
      await fetchEvidencePacks();
      await fetchAll();
      return res.data;
    } catch (err: any) {
      setError(err.message || 'Evidence pack generation failed');
      return null;
    } finally {
      setPackLoading(false);
    }
  }, [companyId, fetchEvidencePacks, fetchAll]);

  return {
    auditRuns,
    auditFindings,
    areaScores,
    guardProfiles,
    governanceItems,
    siteComplianceItems,
    healthSafetyItems,
    customerServiceItems,
    overallScore,
    loading,
    error,
    aiLoading,
    aiResult,
    isAdmin,
    refetch: fetchAll,
    runAIAudit,
    generateEvidencePack,
    packLoading,
    packResult,
    evidencePacks,
  };
}