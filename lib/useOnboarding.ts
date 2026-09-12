'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface OnboardingStep {
  id: string;
  step_order: number;
  title: string;
  description: string | null;
  feature_key: string;
  is_required: boolean;
  help_article_slug: string | null;
  status: 'completed' | 'in_progress' | 'not_started' | 'blocked' | 'skipped';
}

export interface OnboardingBlocker {
  id: string;
  blocker_type: string;
  title: string;
  description: string | null;
  severity: 'info' | 'warning' | 'critical';
}

export interface ImplementationTask {
  id: string;
  title: string;
  status: string;
  owner_role: string | null;
  due_date: string | null;
}

export interface Snapshot {
  companyComplete: boolean;
  adminCount: number;
  teamCount: number;
  clients: number;
  sites: number;
  guards: number;
  sia: number;
  shiftTypes: number;
  notificationPrefs: number;
  clientProfiles: number;
  integrations: number;
  automationRules: number;
  trainingCompletions: number;
  hasSubscription: boolean;
}

function statusForStep(key: string, snap: Snapshot, allRequiredDone: boolean): OnboardingStep['status'] {
  const done = (() => {
    switch (key) {
      case 'company-profile': return snap.companyComplete;
      case 'security-account': return snap.adminCount >= 1;
      case 'team-roles': return snap.teamCount >= 2;
      case 'clients': return snap.clients >= 1;
      case 'sites': return snap.sites >= 1;
      case 'guards': return snap.guards >= 1;
      case 'sia-compliance': return snap.sia >= 1;
      case 'shift-templates': return snap.shiftTypes >= 1;
      case 'notifications': return snap.notificationPrefs >= 1;
      case 'payroll-billing': return snap.hasSubscription;
      case 'client-portal': return snap.clientProfiles >= 1;
      case 'integrations': return snap.integrations >= 1;
      case 'agent-configuration': return snap.automationRules >= 1;
      case 'data-import': return snap.guards >= 1 || snap.sites >= 1;
      case 'training': return snap.trainingCompletions >= 1;
      case 'go-live-review': return allRequiredDone;
      default: return false;
    }
  })();
  return done ? 'completed' : 'not_started';
}

export function useOnboarding() {
  const { companyId, company } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [blockers, setBlockers] = useState<OnboardingBlocker[]>([]);
  const [tasks, setTasks] = useState<ImplementationTask[]>([]);
  const [project, setProject] = useState<{ id: string; assigned_contact: string | null; go_live_target: string | null; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [programRes, progressRes, blockerRes, projectRes, snapshotRes] = await Promise.all([
        supabase.from('onboarding_programs').select('*').eq('slug', 'guardianhub-go-live').eq('is_active', true).maybeSingle(),
        supabase.from('onboarding_steps').select('*').order('step_order', { ascending: true }),
        supabase.from('onboarding_blockers').select('*').eq('company_id', companyId).eq('resolved', false).order('created_at', { ascending: false }),
        supabase.from('implementation_projects').select('*').eq('company_id', companyId).order('created_at', { ascending: true }).limit(1),
        Promise.all([
          supabase.from('users').select('id, role').eq('company_id', companyId),
          supabase.from('clients').select('id').eq('company_id', companyId),
          supabase.from('sites').select('id').eq('company_id', companyId),
          supabase.from('guards').select('id').eq('company_id', companyId),
          supabase.from('sia_licences').select('id').eq('company_id', companyId),
          supabase.from('shift_types').select('id').eq('company_id', companyId),
          supabase.from('notification_preferences').select('id').eq('company_id', companyId),
          supabase.from('client_profiles').select('id').eq('company_id', companyId),
          supabase.from('company_integrations').select('id').eq('company_id', companyId),
          supabase.from('automation_rules').select('id').eq('company_id', companyId),
          supabase.from('training_completions').select('id').eq('company_id', companyId),
        ]),
      ]);

      const allSteps: any[] = (progressRes.data || []);
      const [usersR, clientsR, sitesR, guardsR, siaR, shiftR, notifR, clientProfR, integR, autoR, trainingR] = snapshotRes;

      const users = (usersR.data || []);
      const adminCount = users.filter((u: any) => ['super_admin', 'company_admin'].includes(u.role)).length;
      const teamCount = users.length;

      const snap: Snapshot = {
        companyComplete: Boolean(company?.name && company?.address),
        adminCount,
        teamCount,
        clients: (clientsR.data || []).length,
        sites: (sitesR.data || []).length,
        guards: (guardsR.data || []).length,
        sia: (siaR.data || []).length,
        shiftTypes: (shiftR.data || []).length,
        notificationPrefs: (notifR.data || []).length,
        clientProfiles: (clientProfR.data || []).length,
        integrations: (integR.data || []).length,
        automationRules: (autoR.data || []).length,
        trainingCompletions: (trainingR.data || []).length,
        hasSubscription: Boolean(company?.subscription_status),
      };

      const required = allSteps.filter((s) => s.is_required);
      const allRequiredDone = required.every((s) => statusForStep(s.feature_key, snap, true) === 'completed');

      const enriched: OnboardingStep[] = allSteps.map((s) => ({
        id: s.id,
        step_order: s.step_order,
        title: s.title,
        description: s.description,
        feature_key: s.feature_key,
        is_required: s.is_required,
        help_article_slug: s.help_article_slug,
        status: statusForStep(s.feature_key, snap, allRequiredDone),
      }));

      setSteps(enriched);
      setSnapshot(snap);
      setBlockers((blockerRes.data || []).map((b: any) => ({
        id: b.id,
        blocker_type: b.blocker_type,
        title: b.title,
        description: b.description,
        severity: b.severity,
      })));
      setProject(projectRes.data ? {
        id: projectRes.data.id,
        assigned_contact: projectRes.data.assigned_contact,
        go_live_target: projectRes.data.go_live_target,
        status: projectRes.data.status,
      } : null);
    } catch {
      setSteps([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, company]);

  useEffect(() => { load(); }, [load]);

  const loadTasks = useCallback(async (projectId: string) => {
    const { data } = await supabase.from('implementation_tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
    setTasks((data || []).map((t: any) => ({ id: t.id, title: t.title, status: t.status, owner_role: t.owner_role, due_date: t.due_date })));
  }, []);

  const resolvedBlockers = blockers.filter((b) => b.severity === 'critical');

  return {
    steps,
    blockers,
    tasks,
    project,
    snapshot,
    loading,
    resolvedBlockers,
    refresh: load,
    loadTasks,
  };
}

export function useOnboardingStats(steps: OnboardingStep[]) {
  const total = steps.length;
  const required = steps.filter((s) => s.is_required);
  const requiredDone = required.filter((s) => s.status === 'completed').length;
  const totalDone = steps.filter((s) => s.status === 'completed').length;
  const percent = total > 0 ? Math.round((totalDone / total) * 100) : 0;
  const requiredPercent = required.length > 0 ? Math.round((requiredDone / required.length) * 100) : 0;
  const goLiveReady = required.every((s) => s.status === 'completed');
  return { total, totalDone, requiredDone, requiredTotal: required.length, percent, requiredPercent, goLiveReady };
}