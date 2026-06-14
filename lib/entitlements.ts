import { supabase } from './supabase';

export interface PlanEntitlements {
  planName: string;
  planSlug: string;
  maxGuards: number;
  maxSites: number;
  hasAiRota: boolean;
  hasAiReports: boolean;
  hasClientPortal: boolean;
  hasPatrolManagement: boolean;
  hasGpsTracking: boolean;
  hasCompliance: boolean;
  hasPrioritySupport: boolean;
  hasWhiteLabel: boolean;
  hasApiAccess: boolean;
  hasDedicatedManager: boolean;
  hasLeaveAutomation: boolean;
  maxAiUsage: number;
}

const defaultEntitlements: PlanEntitlements = {
  planName: 'None',
  planSlug: 'none',
  maxGuards: 0,
  maxSites: 0,
  hasAiRota: false,
  hasAiReports: false,
  hasClientPortal: false,
  hasPatrolManagement: false,
  hasGpsTracking: false,
  hasCompliance: false,
  hasPrioritySupport: false,
  hasWhiteLabel: false,
  hasApiAccess: false,
  hasDedicatedManager: false,
  hasLeaveAutomation: false,
  maxAiUsage: 0,
};

let cachedEntitlements: PlanEntitlements | null = null;
let cacheKey: string | null = null;

export async function getCompanyEntitlements(companyId: string): Promise<PlanEntitlements> {
  if (cachedEntitlements && cacheKey === companyId) {
    return cachedEntitlements;
  }

  const { data: company } = await supabase
    .from('companies')
    .select('subscription_plan, subscription_status')
    .eq('id', companyId)
    .maybeSingle();

  const planSlug = company?.subscription_plan || 'none';
  const status = company?.subscription_status;

  if (status !== 'active' && status !== 'trialing') {
    cachedEntitlements = { ...defaultEntitlements, planSlug: 'none', planName: 'Inactive' };
    cacheKey = companyId;
    return cachedEntitlements;
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('slug', planSlug)
    .maybeSingle();

  if (!plan) {
    cachedEntitlements = { ...defaultEntitlements, planSlug, planName: planSlug };
    cacheKey = companyId;
    return cachedEntitlements;
  }

  cachedEntitlements = {
    planName: plan.name,
    planSlug: plan.slug,
    maxGuards: plan.max_guards,
    maxSites: plan.max_sites,
    hasAiRota: plan.has_ai_rota,
    hasAiReports: plan.has_ai_reports,
    hasClientPortal: plan.has_client_portal,
    hasPatrolManagement: plan.has_patrol_management,
    hasGpsTracking: plan.has_gps_tracking,
    hasCompliance: plan.has_compliance,
    hasPrioritySupport: plan.has_priority_support,
    hasWhiteLabel: plan.has_white_label,
    hasApiAccess: plan.has_api_access,
    hasDedicatedManager: plan.has_dedicated_manager,
    hasLeaveAutomation: plan.has_leave_automation,
    maxAiUsage: plan.max_ai_usage,
  };
  cacheKey = companyId;
  return cachedEntitlements;
}

export async function getCompanyPlan(companyId: string) {
  const { data: company } = await supabase
    .from('companies')
    .select('subscription_plan, subscription_status, plan_name')
    .eq('id', companyId)
    .maybeSingle();
  return company;
}

export async function getPlanFeatures(planSlug: string) {
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('slug', planSlug)
    .maybeSingle();
  if (!plan) return [];
  const { data } = await supabase
    .from('plan_features')
    .select('feature_key, feature_name, included')
    .eq('plan_id', plan.id);
  return data || [];
}

export async function checkCompanyEntitlement(companyId: string, featureKey: string): Promise<boolean> {
  const { data: company } = await supabase
    .from('companies')
    .select('subscription_plan, subscription_status')
    .eq('id', companyId)
    .maybeSingle();

  if (!company || (company.subscription_status !== 'active' && company.subscription_status !== 'trialing')) {
    return false;
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('slug', company.subscription_plan)
    .maybeSingle();

  if (!plan) return false;

  const { data: feature } = await supabase
    .from('plan_features')
    .select('included')
    .eq('plan_id', plan.id)
    .eq('feature_key', featureKey)
    .maybeSingle();

  return feature?.included === true;
}

export async function getPlanLimit(companyId: string, limitKey: string): Promise<number | null> {
  const ents = await getCompanyEntitlements(companyId);
  switch (limitKey) {
    case 'max_sites': return ents.maxSites;
    case 'max_guards': return ents.maxGuards;
    case 'max_ai_usage': return ents.maxAiUsage;
    default: return null;
  }
}

export async function assertCompanyCanUseFeature(companyId: string, featureKey: string): Promise<{ allowed: boolean; message: string }> {
  const canUse = await checkCompanyEntitlement(companyId, featureKey);
  if (canUse) return { allowed: true, message: '' };

  const featureNames: Record<string, string> = {
    ai_rota_generation: 'AI Rota Generation',
    ai_report_writer: 'AI Report Writer',
    module_client_portal: 'Client Portal',
    module_patrols: 'Patrol Management',
    gps_tracking: 'GPS Tracking',
    module_sop_builder: 'SOP Builder',
    priority_support: 'Priority Support',
    leave_automation: 'Leave Automation',
    advanced_reports: 'Advanced Reports',
    reports_export: 'Reports Export',
    white_label: 'White-Label Branding',
    api_access: 'API Access',
    dedicated_account_manager: 'Dedicated Account Manager',
  };

  return {
    allowed: false,
    message: `"${featureNames[featureKey] || featureKey}" requires an upgrade. Available on Command or Titan plans.`,
  };
}

export async function checkModuleEnabled(companyId: string, moduleSlug: string): Promise<boolean> {
  const { data: modules } = await supabase
    .from('modules')
    .select('id')
    .eq('slug', moduleSlug)
    .maybeSingle();

  if (!modules) return false;

  const { data: enabled } = await supabase
    .from('company_enabled_modules')
    .select('enabled')
    .eq('company_id', companyId)
    .eq('module_id', modules.id)
    .maybeSingle();

  return enabled?.enabled === true;
}

export function clearEntitlementsCache() {
  cachedEntitlements = null;
  cacheKey = null;
}