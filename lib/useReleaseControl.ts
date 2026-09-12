'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ReleaseVersion = {
  id: string;
  version: string;
  environment: string;
  owner_id: string | null;
  status: string;
  release_notes: string | null;
  target_release_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
};

export type ReleaseSuite = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  component: string | null;
  category: string;
  description: string | null;
  display_order: number;
};

export type ReleaseCase = {
  id: string;
  suite_id: string;
  name: string;
  role: string | null;
  component: string | null;
  steps: string | null;
  expected_result: string | null;
  display_order: number;
};

export type ReleaseResult = {
  id: string;
  case_id: string;
  version_id: string | null;
  result: string;
  tester_id: string | null;
  environment: string;
  notes: string | null;
  screenshot_ref: string | null;
  correlation_id: string | null;
  related_defect_id: string | null;
  browser_device: string | null;
  is_automated: boolean;
  created_at: string;
};

export type ReleaseDefect = {
  id: string;
  reference: string | null;
  title: string;
  description: string | null;
  severity: string;
  affected_role: string | null;
  affected_tenant: string | null;
  environment: string;
  steps_to_reproduce: string | null;
  expected_result: string | null;
  actual_result: string | null;
  evidence: string | null;
  owner_id: string | null;
  status: string;
  linked_test_case_id: string | null;
  fix_version: string | null;
  retest_result: string | null;
  is_tenant_data_leak: boolean;
  accepted_risk_approver_id: string | null;
  accepted_risk_reason: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type ReleaseApproval = {
  id: string;
  version_id: string;
  area: string;
  approver_id: string | null;
  decision: string;
  conditions: string | null;
  evidence_reviewed: string | null;
  decided_at: string | null;
};

export type ReleaseChecklistItem = {
  id: string;
  checklist_id: string;
  key: string;
  title: string;
  owner_id: string | null;
  status: string;
  evidence: string | null;
  verification_date: string | null;
  notes: string | null;
  is_blocker: boolean;
  checklist_name: string;
};

export type ReleaseAgent = {
  id: string;
  agent_key: string;
  name: string;
  purpose: string | null;
  trigger_type: string | null;
  schedule: string | null;
  input_source: string | null;
  output_action: string | null;
  human_approval_required: boolean;
  credentials_configured: boolean;
  last_success: string | null;
  last_failed: string | null;
  retry_status: string;
  owner_id: string | null;
  enabled_environment: string;
  readiness_status: string;
  required_in_production: boolean;
};

export type ReleaseDeployment = {
  id: string;
  version_id: string;
  environment: string;
  commit_sha: string | null;
  deployed_by: string | null;
  status: string;
  backup_confirmed: boolean;
  migration_reviewed: boolean;
  maintenance_window: boolean;
  started_at: string | null;
  completed_at: string | null;
  smoke_test_result: string | null;
  monitoring_confirmed: boolean;
  rollback_decision: string | null;
  notes: string | null;
  created_at: string;
};

export type ReleaseRollback = {
  id: string;
  version_id: string;
  deployment_id: string | null;
  trigger: string | null;
  authoriser_id: string | null;
  rollback_version: string | null;
  db_recovery_approach: string | null;
  external_changes: string | null;
  validation_results: string | null;
  user_communication: string | null;
  incident_ref: string | null;
  created_at: string;
};

export type ReleaseAuditEvent = {
  id: string;
  version_id: string | null;
  actor_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  new_state: any;
  created_at: string;
};

export type LaunchMetric = {
  id: string;
  version_id: string;
  metric_key: string;
  metric_name: string;
  owner_id: string | null;
  watch_window: string;
  escalation_threshold: string | null;
  current_value: number | null;
  status: string;
  notes: string | null;
  updated_at: string;
};

export type NoGoCondition = {
  key: string;
  label: string;
  triggered: boolean;
  detail: string;
};

export type ReleaseState = {
  readiness: number;
  categoryScores: Record<string, { passed: number; total: number; score: number }>;
  recommendation: 'GO' | 'CONDITIONAL GO' | 'NO-GO';
  noGoConditions: NoGoCondition[];
  allApproved: boolean;
  requiredApprovalAreas: string[];
  latestResults: Record<string, ReleaseResult>;
};

const CATEGORY_WEIGHTS: Record<string, number> = {
  security: 25,
  core_operations: 20,
  tenant_isolation: 15,
  guard_safety: 15,
  payments: 10,
  reliability: 10,
  ux: 5,
};

const OPEN_DEFECT_STATUSES = ['open', 'investigating', 'in_progress', 'ready_for_retest'];

function latestResultPerCase(results: ReleaseResult[]): Record<string, ReleaseResult> {
  const map: Record<string, ReleaseResult> = {};
  results.forEach((r) => {
    if (!map[r.case_id]) map[r.case_id] = r;
  });
  return map;
}

export function computeReleaseState(
  version: ReleaseVersion | null,
  suites: ReleaseSuite[],
  cases: ReleaseCase[],
  results: ReleaseResult[],
  defects: ReleaseDefect[],
  approvals: ReleaseApproval[],
  checklistItems: ReleaseChecklistItem[],
  agents: ReleaseAgent[],
): ReleaseState {
  const suiteById = new Map(suites.map((s) => [s.id, s]));
  const caseById = new Map(cases.map((c) => [c.id, c]));
  const latest = latestResultPerCase(results);

  const categoryScores: Record<string, { passed: number; total: number; score: number }> = {};
  Object.keys(CATEGORY_WEIGHTS).forEach((c) => {
    categoryScores[c] = { passed: 0, total: 0, score: 0 };
  });

  cases.forEach((c) => {
    const suite = suiteById.get(c.suite_id);
    if (!suite) return;
    const cat = categoryScores[suite.category];
    if (!cat) return;
    const res = latest[c.id];
    if (!res || res.result === 'not_applicable') return;
    cat.total += 1;
    if (res.result === 'passed') cat.passed += 1;
  });

  let weighted = 0;
  Object.entries(CATEGORY_WEIGHTS).forEach(([cat, weight]) => {
    const s = categoryScores[cat];
    s.score = s.total === 0 ? 0 : Math.round((s.passed / s.total) * 100);
    weighted += (s.score * weight) / 100;
  });

  const readiness = Math.round(weighted);

  const criticalOpen = defects.filter((d) => d.severity === 'critical' && OPEN_DEFECT_STATUSES.includes(d.status));
  const tenantLeak = defects.filter((d) => d.is_tenant_data_leak && OPEN_DEFECT_STATUSES.includes(d.status));

  const getItem = (key: string) => checklistItems.find((i) => i.key === key);

  const failedCases = Object.entries(latest)
    .filter(([, r]) => r.result === 'failed')
    .map(([caseId, r]) => ({ c: caseById.get(caseId), r }));

  const failedByComponent = (component: string) =>
    failedCases.filter(({ c }) => c && c.component === component).length > 0;
  const failedBySuiteCategory = (category: string) =>
    failedCases.filter(({ c }) => c && suiteById.get(c.suite_id)?.category === category).length > 0;

  const noGoConditions: NoGoCondition[] = [
    {
      key: 'critical-defect',
      label: 'Unresolved critical defect',
      triggered: criticalOpen.length > 0,
      detail: criticalOpen.length > 0 ? criticalOpen.map((d) => d.title).join(' · ') : 'No critical defects',
    },
    {
      key: 'tenant-leak',
      label: 'Confirmed tenant data leak',
      triggered: tenantLeak.length > 0,
      detail: tenantLeak.length > 0 ? tenantLeak.map((d) => d.title).join(' · ') : 'No confirmed leaks',
    },
    {
      key: 'sos-failure',
      label: 'SOS journey failure',
      triggered: failedByComponent('sos'),
      detail: failedByComponent('sos') ? 'An SOS test case failed' : 'SOS tests passed',
    },
    {
      key: 'auth-unavailable',
      label: 'Authentication unavailable',
      triggered: failedByComponent('auth'),
      detail: failedByComponent('auth') ? 'An authentication test case failed' : 'Auth tests passed',
    },
    {
      key: 'build-failure',
      label: 'Production build failure',
      triggered: getItem('production-build')?.status === 'failed',
      detail: getItem('production-build')?.status === 'failed' ? 'Production build checklist item failed' : 'Build not marked failed',
    },
    {
      key: 'rls-isolation',
      label: 'Failed RLS isolation tests',
      triggered: failedBySuiteCategory('tenant_isolation'),
      detail: failedBySuiteCategory('tenant_isolation') ? 'A tenant isolation test case failed' : 'Isolation tests passed',
    },
    {
      key: 'unsigned-webhook',
      label: 'Unsigned payment webhook accepted',
      triggered: failedCases.some(({ c }) => c && c.name.toLowerCase().includes('invalid signature')),
      detail: failedCases.some(({ c }) => c && c.name.toLowerCase().includes('invalid signature')) ? 'Stripe invalid-signature rejection test failed' : 'Webhook signature rejection passed',
    },
    {
      key: 'service-role-exposed',
      label: 'Service-role secret exposed',
      triggered: getItem('secret-scan')?.status === 'failed' || criticalOpen.some((d) => d.title.toLowerCase().includes('secret')),
      detail: getItem('secret-scan')?.status === 'failed' ? 'Secret scan failed' : 'No secret exposure defect',
    },
    {
      key: 'backup-restore',
      label: 'No verified backup/restore process',
      triggered: getItem('restore-test')?.status !== 'passed',
      detail: getItem('restore-test')?.status === 'passed' ? 'Restore drill passed' : 'Backup and restore drill not yet passed',
    },
    {
      key: 'agent-not-ready',
      label: 'Required production agent not ready',
      triggered: agents.some((a) => a.required_in_production && a.readiness_status !== 'ready'),
      detail: agents.filter((a) => a.required_in_production && a.readiness_status !== 'ready').map((a) => a.name).join(' · ') || 'All required agents ready',
    },
    {
      key: 'rollback-unavailable',
      label: 'Rollback process unavailable',
      triggered: getItem('rollback-procedure')?.status !== 'passed',
      detail: getItem('rollback-procedure')?.status === 'passed' ? 'Rollback procedure passed' : 'Rollback procedure not yet passed',
    },
  ];

  const anyNoGo = noGoConditions.some((c) => c.triggered);

  const requiredApprovalAreas = ['product', 'engineering', 'security', 'operations', 'finance', 'compliance'];
  const allApproved = requiredApprovalAreas.every((a) => approvals.find((x) => x.area === a)?.decision === 'approved');

  let recommendation: 'GO' | 'CONDITIONAL GO' | 'NO-GO' = 'NO-GO';
  if (anyNoGo) {
    recommendation = 'NO-GO';
  } else if (readiness >= 95 && allApproved) {
    recommendation = 'GO';
  } else if (readiness >= 70) {
    recommendation = 'CONDITIONAL GO';
  }

  return {
    readiness,
    categoryScores,
    recommendation,
    noGoConditions,
    allApproved,
    requiredApprovalAreas,
    latestResults: latest,
  };
}

export function useReleaseControl() {
  const [version, setVersion] = useState<ReleaseVersion | null>(null);
  const [versions, setVersions] = useState<ReleaseVersion[]>([]);
  const [suites, setSuites] = useState<ReleaseSuite[]>([]);
  const [cases, setCases] = useState<ReleaseCase[]>([]);
  const [results, setResults] = useState<ReleaseResult[]>([]);
  const [defects, setDefects] = useState<ReleaseDefect[]>([]);
  const [approvals, setApprovals] = useState<ReleaseApproval[]>([]);
  const [checklists, setChecklists] = useState<{ id: string; name: string }[]>([]);
  const [checklistItems, setChecklistItems] = useState<ReleaseChecklistItem[]>([]);
  const [agents, setAgents] = useState<ReleaseAgent[]>([]);
  const [deployments, setDeployments] = useState<ReleaseDeployment[]>([]);
  const [rollbacks, setRollbacks] = useState<ReleaseRollback[]>([]);
  const [auditEvents, setAuditEvents] = useState<ReleaseAuditEvent[]>([]);
  const [launchMetrics, setLaunchMetrics] = useState<LaunchMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [vRes, suitesRes, casesRes, resultsRes, defectsRes, approvalsRes, checklistsRes, itemsRes, agentsRes, depRes, rbRes, auditRes, metricRes] = await Promise.all([
      supabase.from('release_versions').select('*').order('created_at', { ascending: false }),
      supabase.from('release_test_suites').select('*').order('display_order'),
      supabase.from('release_test_cases').select('*').order('display_order'),
      supabase.from('release_test_results').select('*').order('created_at', { ascending: false }),
      supabase.from('release_defects').select('*').order('created_at', { ascending: false }),
      supabase.from('release_approvals').select('*').order('area'),
      supabase.from('release_checklists').select('*').order('display_order'),
      supabase.from('release_checklist_items').select('*, checklist:release_checklists!inner(name)').order('created_at'),
      supabase.from('release_agent_readiness').select('*').order('agent_key'),
      supabase.from('release_deployments').select('*').order('created_at', { ascending: false }),
      supabase.from('release_rollbacks').select('*').order('created_at', { ascending: false }),
      supabase.from('release_audit_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('release_launch_metrics').select('*').order('watch_window'),
    ]);

    const allVersions = vRes.data || [];
    const current = allVersions.find((v) => v.is_current) || allVersions[0] || null;
    setVersions(allVersions);
    setVersion(current);
    setSuites(suitesRes.data || []);
    setCases(casesRes.data || []);
    setResults(resultsRes.data || []);
    setDefects(defectsRes.data || []);
    setApprovals(approvalsRes.data || []);
    setChecklists(checklistsRes.data || []);
    setChecklistItems((itemsRes.data || []).map((i: any) => ({ ...i, checklist_name: i.checklist?.name || '' })));
    setAgents(agentsRes.data || []);
    setDeployments(depRes.data || []);
    setRollbacks(rbRes.data || []);
    setAuditEvents(auditRes.data || []);
    setLaunchMetrics(metricRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const state = computeReleaseState(version, suites, cases, results, defects, approvals, checklistItems, agents);

  const recordResult = async (caseId: string, result: string, notes: string, browserDevice: string, isAutomated: boolean) => {
    const { error } = await supabase.from('release_test_results').insert({
      case_id: caseId,
      version_id: version?.id || null,
      result,
      notes,
      browser_device: browserDevice || null,
      is_automated: isAutomated,
      environment: version?.environment || 'staging',
    });
    if (!error) await load();
    return { error };
  };

  const createDefect = async (defect: Partial<ReleaseDefect>) => {
    const { error } = await supabase.from('release_defects').insert({
      ...defect,
      reference: defect.reference || `GH-${Date.now().toString().slice(-6)}`,
    });
    if (!error) await load();
    return { error };
  };

  const updateDefect = async (id: string, updates: Partial<ReleaseDefect>) => {
    const { error } = await supabase.from('release_defects').update(updates).eq('id', id);
    if (!error) await load();
    return { error };
  };

  const recordApproval = async (area: string, decision: string, conditions: string, evidence: string, approverId: string) => {
    const { error } = await supabase.from('release_approvals')
      .update({ decision, conditions, evidence_reviewed: evidence, approver_id: approverId, decided_at: new Date().toISOString() })
      .eq('version_id', version?.id).eq('area', area);
    if (!error) await load();
    return { error };
  };

  const updateChecklistItem = async (id: string, updates: Partial<ReleaseChecklistItem>) => {
    const { error } = await supabase.from('release_checklist_items').update(updates).eq('id', id);
    if (!error) await load();
    return { error };
  };

  const updateAgent = async (id: string, updates: Partial<ReleaseAgent>) => {
    const { error } = await supabase.from('release_agent_readiness').update(updates).eq('id', id);
    if (!error) await load();
    return { error };
  };

  const recordDeployment = async (data: Partial<ReleaseDeployment>) => {
    const { error } = await supabase.from('release_deployments').insert({ ...data, version_id: version?.id });
    if (!error) await load();
    return { error };
  };

  const recordRollback = async (data: Partial<ReleaseRollback>) => {
    const { error } = await supabase.from('release_rollbacks').insert({ ...data, version_id: version?.id });
    if (!error) await load();
    return { error };
  };

  const updateMetric = async (id: string, updates: Partial<LaunchMetric>) => {
    const { error } = await supabase.from('release_launch_metrics').update(updates).eq('id', id);
    if (!error) await load();
    return { error };
  };

  const recordDecision = async (decision: string, conditions: string, reasons: any, approverId: string) => {
    const { error } = await supabase.from('release_decisions').insert({
      version_id: version?.id,
      decision,
      readiness_percentage: state.readiness,
      conditions,
      reasons,
      decided_by: approverId,
    });
    if (!error) await load();
    return { error };
  };

  return {
    loading,
    version,
    versions,
    suites,
    cases,
    results,
    defects,
    approvals,
    checklists,
    checklistItems,
    agents,
    deployments,
    rollbacks,
    auditEvents,
    launchMetrics,
    state,
    load,
    recordResult,
    createDefect,
    updateDefect,
    recordApproval,
    updateChecklistItem,
    updateAgent,
    recordDeployment,
    recordRollback,
    updateMetric,
    recordDecision,
  };
}