'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteComplianceData {
  riskLevel: string | null;
  riskScore: number | null;
  riskFactors: any | null;
  riskNarrative: string | null;
  hasAssignmentInstructions: boolean;
  hasEmergencyProcedures: boolean;
  hasSOP: boolean;
  riskAssessmentUrl: string | null;
  riskAssessmentExpiry: string | null;
  assignmentInstructionsExpiry: string | null;
  overallScore: number | null;
  sopStatus: string;
  emergencyStatus: string;
  sopsCurrent: boolean;
  patrolLogAvailable: boolean;
  checkCallLogAvailable: boolean;
  incidentRecordsStatus: string;
  patrolRouteStatus: string;
  dobRecordsStatus: string;
  clientSlaStatus: string;
}

export interface CertificationExpiry {
  guard_name: string;
  cert_type: string;
  cert_name: string;
  expiry_date: string;
  status: string;
  daysUntilExpiry: number;
}

export interface TrainingExpiry {
  guard_name: string;
  module_title: string;
  expires_at: string;
  passed: boolean;
  daysUntilExpiry: number;
}

export function useSiteCompliance(siteId: string, companyId: string | null, enabled: boolean) {
  const [compliance, setCompliance] = useState<SiteComplianceData>({
    riskLevel: null,
    riskScore: null,
    riskFactors: null,
    riskNarrative: null,
    hasAssignmentInstructions: false,
    hasEmergencyProcedures: false,
    hasSOP: false,
    riskAssessmentUrl: null,
    riskAssessmentExpiry: null,
    assignmentInstructionsExpiry: null,
    overallScore: null,
    sopStatus: 'unknown',
    emergencyStatus: 'unknown',
    sopsCurrent: false,
    patrolLogAvailable: false,
    checkCallLogAvailable: false,
    incidentRecordsStatus: 'unknown',
    patrolRouteStatus: 'unknown',
    dobRecordsStatus: 'unknown',
    clientSlaStatus: 'unknown',
  });
  const [certExpiries, setCertExpiries] = useState<CertificationExpiry[]>([]);
  const [trainingExpiries, setTrainingExpiries] = useState<TrainingExpiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompliance = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const [
        siteResult,
        acsResult,
        riskScoreResult,
        certsResult,
        trainingResult,
      ] = await Promise.allSettled([
        supabase
          .from('sites')
          .select('risk_level, assignment_instructions, emergency_procedures')
          .eq('id', siteId)
          .maybeSingle(),

        supabase
          .from('acs_site_compliance')
          .select('*')
          .eq('site_id', siteId)
          .eq('company_id', companyId)
          .maybeSingle(),

        supabase
          .from('site_risk_scores')
          .select('*')
          .eq('site_id', siteId)
          .order('generated_at', { ascending: false })
          .limit(1),

        supabase
          .from('guard_certifications')
          .select('guard_id, cert_type, cert_name, expiry_date, status')
          .eq('company_id', companyId)
          .in('status', ['active', 'expiring', 'expired'])
          .order('expiry_date'),

        supabase
          .from('training_completions')
          .select('guard_id, module_id, expires_at, passed')
          .eq('company_id', companyId)
          .not('expires_at', 'is', null)
          .order('expires_at'),
      ]);

      const site = siteResult.status === 'fulfilled' && !siteResult.value.error ? siteResult.value.data : null;
      const acs = acsResult.status === 'fulfilled' && !acsResult.value.error ? acsResult.value.data : null;
      const riskScores = riskScoreResult.status === 'fulfilled' && !riskScoreResult.value.error ? (riskScoreResult.value.data || []) : [];
      const certs = certsResult.status === 'fulfilled' && !certsResult.value.error ? (certsResult.value.data || []) : [];
      const trainings = trainingResult.status === 'fulfilled' && !trainingResult.value.error ? (trainingResult.value.data || []) : [];

      const latestRisk = riskScores[0] || null;

      const now = new Date();

      const allGuardIds = [...new Set([
        ...(certs as any[]).map((c: any) => c.guard_id),
        ...(trainings as any[]).map((t: any) => t.guard_id),
      ].filter(Boolean))] as string[];

      let guardsMap: Record<string, string> = {};
      if (allGuardIds.length > 0) {
        const { data: guardsData } = await supabase
          .from('guards')
          .select('id, first_name, last_name')
          .in('id', allGuardIds);
        (guardsData || []).forEach((g: any) => {
          guardsMap[g.id] = `${g.first_name} ${g.last_name}`.trim();
        });
      }

      const certExpiries: CertificationExpiry[] = (certs as any[])
        .map((c: any) => {
          const days = c.expiry_date ? Math.ceil((new Date(c.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;
          return {
            guard_name: guardsMap[c.guard_id] || 'Unknown',
            cert_type: c.cert_type,
            cert_name: c.cert_name,
            expiry_date: c.expiry_date,
            status: c.status,
            daysUntilExpiry: days,
          };
        })
        .filter((c) => c.daysUntilExpiry <= 90)
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

      let moduleIds = [...new Set((trainings as any[]).map((t: any) => t.module_id).filter(Boolean))] as string[];
      let modulesMap: Record<string, string> = {};
      if (moduleIds.length > 0) {
        const { data: modsData } = await supabase
          .from('training_modules')
          .select('id, title')
          .in('id', moduleIds);
        (modsData || []).forEach((m: any) => {
          modulesMap[m.id] = m.title;
        });
      }

      const trainingExpiries: TrainingExpiry[] = (trainings as any[])
        .map((t: any) => {
          const days = t.expires_at ? Math.ceil((new Date(t.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;
          return {
            guard_name: guardsMap[t.guard_id] || 'Unknown',
            module_title: modulesMap[t.module_id] || 'Training Module',
            expires_at: t.expires_at,
            passed: t.passed,
            daysUntilExpiry: days,
          };
        })
        .filter((t) => t.daysUntilExpiry <= 90)
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

      setCompliance({
        riskLevel: site?.risk_level || null,
        riskScore: latestRisk?.score || null,
        riskFactors: latestRisk?.factors || null,
        riskNarrative: latestRisk?.ai_narrative || null,
        hasAssignmentInstructions: !!site?.assignment_instructions,
        hasEmergencyProcedures: !!site?.emergency_procedures,
        hasSOP: acs?.sops_current || false,
        riskAssessmentUrl: acs?.risk_assessment_url || null,
        riskAssessmentExpiry: acs?.risk_assessment_expiry || null,
        assignmentInstructionsExpiry: acs?.assignment_instructions_expiry || null,
        overallScore: acs?.overall_score || null,
        sopStatus: acs?.sops_current ? 'current' : 'missing',
        emergencyStatus: acs?.emergency_procedures_status || 'unknown',
        sopsCurrent: acs?.sops_current || false,
        patrolLogAvailable: acs?.patrol_log_available || false,
        checkCallLogAvailable: acs?.check_call_log_available || false,
        incidentRecordsStatus: acs?.incident_records_status || 'unknown',
        patrolRouteStatus: acs?.patrol_route_status || 'unknown',
        dobRecordsStatus: acs?.dob_records_status || 'unknown',
        clientSlaStatus: acs?.client_sla_status || 'unknown',
      });
      setCertExpiries(certExpiries.slice(0, 10));
      setTrainingExpiries(trainingExpiries.slice(0, 10));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchCompliance();
  }, [enabled, fetchCompliance]);

  return { compliance, certExpiries, trainingExpiries, loading, error, refresh: fetchCompliance };
}