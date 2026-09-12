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

export interface FeatureRequirement {
  featureKey: keyof PlanEntitlements;
  displayName: string;
  description: string;
  minPlanSlug: PlanSlug;
  icon: string;
}

export type PlanSlug = 'sentinel-starter' | 'sentinel' | 'command' | 'titan';

export type ACSTier = 'locked' | 'basic-checklist' | 'document-tracking' | 'full-acs' | 'titan-audit';

export interface ACSEntitlements {
  tier: ACSTier;
  tierLabel: string;
  hasBasicChecklist: boolean;
  hasDocumentExpiry: boolean;
  hasFullACSCentre: boolean;
  hasAIAuditor: boolean;
  hasEvidencePacks: boolean;
  hasSecureShareLinks: boolean;
  hasActionCentre: boolean;
  hasAuditWizard: boolean;
}

export interface PlanTierDef {
  name: string;
  slug: PlanSlug;
  tier: number;
  displayPrice: string;
}

export const PLAN_TIERS: PlanTierDef[] = [
  { name: 'Guardian-Hub Starter', slug: 'sentinel-starter', tier: 0, displayPrice: '£49' },
  { name: 'Guardian-Hub Sentinel', slug: 'sentinel', tier: 1, displayPrice: '£99' },
  { name: 'Guardian-Hub Command', slug: 'command', tier: 2, displayPrice: '£399' },
  { name: 'Guardian-Hub Titan', slug: 'titan', tier: 3, displayPrice: 'Custom' },
];

export const YEARLY_PRICES: Record<string, string> = {
  'sentinel-starter': '£39',
  'sentinel': '£79',
  'command': '£319',
};

export const FEATURE_REQUIREMENTS: FeatureRequirement[] = [
  {
    featureKey: 'hasCompliance',
    displayName: 'Compliance Management',
    description: 'Document expiry tracking, guard certifications, vetting records, and ACS evidence management',
    minPlanSlug: 'command',
    icon: 'ri-file-shield-line',
  },
  {
    featureKey: 'hasClientPortal',
    displayName: 'Client Portal',
    description: 'Branded client dashboard with live site status, incident visibility, reports, and messaging',
    minPlanSlug: 'command',
    icon: 'ri-briefcase-line',
  },
  {
    featureKey: 'hasPatrolManagement',
    displayName: 'Patrol Management',
    description: 'QR/NFC checkpoint scanning, GPS-verified patrol tracking, and live patrol monitoring dashboards',
    minPlanSlug: 'command',
    icon: 'ri-route-line',
  },
  {
    featureKey: 'hasGpsTracking',
    displayName: 'GPS Tracking',
    description: 'Real-time guard GPS location tracking, geofencing, and patrol route verification',
    minPlanSlug: 'command',
    icon: 'ri-map-pin-line',
  },
  {
    featureKey: 'hasAiRota',
    displayName: 'AI Rota Generation',
    description: 'AI-powered shift scheduling, sick cover suggestions, conflict detection, and staffing optimisation',
    minPlanSlug: 'command',
    icon: 'ri-robot-2-line',
  },
  {
    featureKey: 'hasAiReports',
    displayName: 'AI Report Writer',
    description: 'Automated weekly site reports, AI-generated incident summaries, and client-ready PDF exports',
    minPlanSlug: 'command',
    icon: 'ri-file-chart-line',
  },
  {
    featureKey: 'hasPrioritySupport',
    displayName: 'Priority Support',
    description: 'Dedicated priority support queue with faster response times and escalation handling',
    minPlanSlug: 'command',
    icon: 'ri-customer-service-2-line',
  },
  {
    featureKey: 'hasLeaveAutomation',
    displayName: 'Leave & Sickness Automation',
    description: 'Automated leave request workflows, sick cover matching, and shift swap management',
    minPlanSlug: 'command',
    icon: 'ri-calendar-close-line',
  },
  {
    featureKey: 'hasWhiteLabel',
    displayName: 'White-Label Branding',
    description: 'Custom domain, fully branded client portal, remove GuardianHub branding, custom email templates',
    minPlanSlug: 'titan',
    icon: 'ri-paint-brush-line',
  },
  {
    featureKey: 'hasApiAccess',
    displayName: 'API Access',
    description: 'Full REST API access for custom integrations, webhook support, and developer tools',
    minPlanSlug: 'titan',
    icon: 'ri-code-s-slash-line',
  },
  {
    featureKey: 'hasDedicatedManager',
    displayName: 'Dedicated Account Manager',
    description: 'Named account manager, quarterly business reviews, priority onboarding, and custom SLA',
    minPlanSlug: 'titan',
    icon: 'ri-user-star-line',
  },
];

export function getPlanTier(slug: string): PlanTierDef | undefined {
  return PLAN_TIERS.find((p) => p.slug === slug);
}

export function getTierNumber(slug: string): number {
  return getPlanTier(slug)?.tier ?? -1;
}

export function getFeatureRequirement(featureKey: keyof PlanEntitlements): FeatureRequirement | undefined {
  return FEATURE_REQUIREMENTS.find((f) => f.featureKey === featureKey);
}

export function getRequiredPlanForFeature(featureKey: keyof PlanEntitlements): PlanTierDef | undefined {
  const req = getFeatureRequirement(featureKey);
  if (!req) return undefined;
  return PLAN_TIERS.find((p) => p.slug === req.minPlanSlug);
}

export function getFeatureUnlocks(planSlug: PlanSlug): FeatureRequirement[] {
  const targetTier = getTierNumber(planSlug);
  return FEATURE_REQUIREMENTS.filter((f) => {
    const minTier = getTierNumber(f.minPlanSlug);
    return minTier === targetTier;
  });
}

export function getUpgradePath(currentSlug: string, featureKey: keyof PlanEntitlements): {
  currentPlan: PlanTierDef | undefined;
  requiredPlan: PlanTierDef | undefined;
  unlocks: FeatureRequirement[];
  allFeaturesInTier: FeatureRequirement[];
} | null {
  const req = getFeatureRequirement(featureKey);
  if (!req) return null;

  const currentPlan = getPlanTier(currentSlug);
  const requiredPlan = getPlanTier(req.minPlanSlug);

  if (!currentPlan || !requiredPlan) return null;

  if (currentPlan.tier >= requiredPlan.tier) return null;

  const unlocks = FEATURE_REQUIREMENTS.filter((f) => {
    const fMinTier = getTierNumber(f.minPlanSlug);
    const curTier = getTierNumber(currentSlug);
    return fMinTier > curTier && fMinTier <= requiredPlan.tier;
  });

  const allFeaturesInTier = getFeatureUnlocks(requiredPlan.slug);

  return { currentPlan, requiredPlan, unlocks, allFeaturesInTier };
}

export function getACSEntitlements(planSlug: string): ACSEntitlements {
  const tier = getTierNumber(planSlug);

  if (tier >= 3) {
    return {
      tier: 'titan-audit', tierLabel: 'Titan',
      hasBasicChecklist: true, hasDocumentExpiry: true,
      hasFullACSCentre: true, hasAIAuditor: true,
      hasEvidencePacks: true, hasSecureShareLinks: true,
      hasActionCentre: true, hasAuditWizard: true,
    };
  }
  if (tier >= 2) {
    return {
      tier: 'full-acs', tierLabel: 'Command',
      hasBasicChecklist: true, hasDocumentExpiry: true,
      hasFullACSCentre: true, hasAIAuditor: false,
      hasEvidencePacks: false, hasSecureShareLinks: false,
      hasActionCentre: true, hasAuditWizard: true,
    };
  }
  if (tier >= 1) {
    return {
      tier: 'document-tracking', tierLabel: 'Sentinel',
      hasBasicChecklist: true, hasDocumentExpiry: true,
      hasFullACSCentre: false, hasAIAuditor: false,
      hasEvidencePacks: false, hasSecureShareLinks: false,
      hasActionCentre: false, hasAuditWizard: false,
    };
  }
  if (tier >= 0) {
    return {
      tier: 'basic-checklist', tierLabel: 'Sentinel Starter',
      hasBasicChecklist: true, hasDocumentExpiry: false,
      hasFullACSCentre: false, hasAIAuditor: false,
      hasEvidencePacks: false, hasSecureShareLinks: false,
      hasActionCentre: false, hasAuditWizard: false,
    };
  }
  return {
    tier: 'locked', tierLabel: 'None',
    hasBasicChecklist: false, hasDocumentExpiry: false,
    hasFullACSCentre: false, hasAIAuditor: false,
    hasEvidencePacks: false, hasSecureShareLinks: false,
    hasActionCentre: false, hasAuditWizard: false,
  };
}

export function getACSRequiredPlan(requiredTier: ACSTier): PlanTierDef | undefined {
  switch (requiredTier) {
    case 'basic-checklist': return PLAN_TIERS.find(p => p.slug === 'sentinel-starter');
    case 'document-tracking': return PLAN_TIERS.find(p => p.slug === 'sentinel');
    case 'full-acs': return PLAN_TIERS.find(p => p.slug === 'command');
    case 'titan-audit': return PLAN_TIERS.find(p => p.slug === 'titan');
    default: return undefined;
  }
}

export function isACSTierSufficient(current: ACSTier, required: ACSTier): boolean {
  const tierOrder: ACSTier[] = ['locked', 'basic-checklist', 'document-tracking', 'full-acs', 'titan-audit'];
  return tierOrder.indexOf(current) >= tierOrder.indexOf(required);
}

const CORE_FEATURES_BY_TIER: Record<number, string[]> = {
  0: [
    'Basic rota system',
    'Guard management (up to 10)',
    '1 site',
    'Incident reports',
    'Digital occurrence book',
    'Mobile guard portal',
  ],
  1: [
    'Everything in Starter',
    'Up to 25 guards',
    'Up to 3 sites',
    'Basic KPI dashboard',
    'Limited AI usage',
  ],
  2: [
    'AI rota generation',
    'Leave and sickness automation',
    'Client portal',
    'Patrol management',
    'GPS tracking',
    'Compliance management',
    'AI report writer',
    'Priority support',
  ],
  3: [
    'Unlimited guards & sites',
    'White-label branding',
    'API access',
    'Dedicated account manager',
    'Custom integrations',
    'Advanced AI automation',
  ],
};

export function getCoreFeaturesForTier(tier: number): string[] {
  return CORE_FEATURES_BY_TIER[tier] || [];
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
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5000;

export async function getCompanyEntitlements(companyId: string): Promise<PlanEntitlements> {
  const now = Date.now();
  if (cachedEntitlements && cacheKey === companyId && (now - cacheTimestamp) < CACHE_TTL_MS) {
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
    cacheTimestamp = now;
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
    cacheTimestamp = now;
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
  cacheTimestamp = now;
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
  cacheTimestamp = 0;
}

export async function checkServerEntitlement(featureKey?: string, limitKey?: string): Promise<{ allowed: boolean; reason?: string; limit?: number; usage?: number }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return { allowed: false, reason: 'Not authenticated' };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/enforce-entitlement`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ feature_key: featureKey, limit_key: limitKey }),
      }
    );

    const data = await response.json();
    return data;
  } catch {
    return { allowed: false, reason: 'Entitlement check unavailable' };
  }
}

export async function assertServerEntitlement(featureKey: string): Promise<{ allowed: boolean; message: string }> {
  const result = await checkServerEntitlement(featureKey);
  if (result.allowed) return { allowed: true, message: '' };

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
    message: result.reason || `"${featureNames[featureKey] || featureKey}" requires an upgrade.`,
  };
}

export async function checkServerLimit(limitKey: string): Promise<{ allowed: boolean; limit: number | null; usage: number | null }> {
  const result = await checkServerEntitlement(undefined, limitKey);
  return {
    allowed: result.allowed,
    limit: result.limit ?? null,
    usage: result.usage ?? null,
  };
}