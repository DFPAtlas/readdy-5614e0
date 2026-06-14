import type { PlanEntitlements } from './entitlements';

export interface DashboardFeature {
  label: string;
  route: string;
  featureKey: keyof PlanEntitlements | null;
  limitKey: 'maxGuards' | 'maxSites' | 'maxAiUsage' | null;
  description: string;
}

export const DASHBOARD_FEATURES: Record<string, DashboardFeature> = {
  dashboard: {
    label: 'Dashboard',
    route: '/dashboard',
    featureKey: null,
    limitKey: null,
    description: 'Command centre overview',
  },
  commandCentre: {
    label: 'Command Centre',
    route: '/dashboard/command-centre',
    featureKey: null,
    limitKey: null,
    description: 'Central operations view',
  },
  guardWelfare: {
    label: 'Guard Welfare',
    route: '/dashboard/guard-welfare',
    featureKey: null,
    limitKey: null,
    description: 'Guard wellbeing and check-ins',
  },
  evidenceVault: {
    label: 'Evidence Vault',
    route: '/dashboard/evidence-vault',
    featureKey: null,
    limitKey: null,
    description: 'Secure evidence storage',
  },
  siteAssignments: {
    label: 'Site Assignments',
    route: '/dashboard/site-assignments',
    featureKey: null,
    limitKey: null,
    description: 'Guard site assignment matrix',
  },
  compliance: {
    label: 'Compliance',
    route: '/dashboard/compliance/documents',
    featureKey: 'hasCompliance',
    limitKey: null,
    description: 'Document compliance and expiry tracking',
  },
  clientSLA: {
    label: 'Client SLA',
    route: '/dashboard/client-sla',
    featureKey: null,
    limitKey: null,
    description: 'Client service level agreements',
  },
  sites: {
    label: 'Sites',
    route: '/sites',
    featureKey: null,
    limitKey: 'maxSites',
    description: 'Site management and setup',
  },
  clients: {
    label: 'Clients',
    route: '/dashboard/clients',
    featureKey: 'hasClientPortal',
    limitKey: null,
    description: 'Client portal and management',
  },
  patrolCheckpoints: {
    label: 'Patrol Checkpoints',
    route: '/dashboard/patrol-checkpoints',
    featureKey: 'hasPatrolManagement',
    limitKey: null,
    description: 'NFC checkpoint configuration',
  },
  patrolMonitoring: {
    label: 'Patrol Monitoring',
    route: '/dashboard/patrol-monitoring',
    featureKey: 'hasPatrolManagement',
    limitKey: null,
    description: 'Live patrol tracking and GPS',
  },
  notices: {
    label: 'Notices',
    route: '/dashboard/notices',
    featureKey: null,
    limitKey: null,
    description: 'Site notices and announcements',
  },
  incidents: {
    label: 'Incidents',
    route: '/incidents',
    featureKey: null,
    limitKey: null,
    description: 'Incident reporting and tracking',
  },
  occurrenceBook: {
    label: 'Occurrence Book',
    route: '/occurrence-book',
    featureKey: null,
    limitKey: null,
    description: 'Daily site activity log',
  },
  guards: {
    label: 'Guards',
    route: '/guards',
    featureKey: null,
    limitKey: 'maxGuards',
    description: 'Guard management and credentials',
  },
  leaveRequests: {
    label: 'Leave Requests',
    route: '/dashboard/leave-requests',
    featureKey: 'hasLeaveAutomation',
    limitKey: null,
    description: 'Shift leave and cover management',
  },
  rotas: {
    label: 'Rotas',
    route: '/rotas',
    featureKey: null,
    limitKey: null,
    description: 'Shift scheduling and planning',
  },
  patternBuilder: {
    label: 'Pattern Builder',
    route: '/rotas/patterns',
    featureKey: null,
    limitKey: null,
    description: 'Shift pattern templates',
  },
  reports: {
    label: 'Reports',
    route: '/reports',
    featureKey: null,
    limitKey: null,
    description: 'Report generation and history',
  },
  weeklyReports: {
    label: 'Weekly Reports',
    route: '/dashboard/reports/client-weekly',
    featureKey: 'hasAiReports',
    limitKey: null,
    description: 'AI-powered weekly site reports',
  },
  sopBuilder: {
    label: 'SOP Builder',
    route: '/sop-builder',
    featureKey: null,
    limitKey: null,
    description: 'Standard operating procedures',
  },
  sopLibrary: {
    label: 'SOP Library',
    route: '/sops',
    featureKey: null,
    limitKey: null,
    description: 'SOP document library',
  },
  aiAutomation: {
    label: 'AI Automation Hub',
    route: '/dashboard/ai-automation',
    featureKey: 'hasAiRota',
    limitKey: null,
    description: 'AI-powered operations tools',
  },
  staff: {
    label: 'Staff',
    route: '/dashboard/staff',
    featureKey: null,
    limitKey: null,
    description: 'Staff management overview',
  },
  settings: {
    label: 'Settings',
    route: '/dashboard/settings',
    featureKey: null,
    limitKey: null,
    description: 'Account and system settings',
  },
};

export function getFeatureByRoute(pathname: string): DashboardFeature | undefined {
  const sorted = Object.values(DASHBOARD_FEATURES).sort((a, b) => b.route.length - a.route.length);
  return sorted.find((f) => pathname === f.route || pathname.startsWith(f.route + '/'));
}

export const NON_ACTIVE_STATUSES = ['past_due', 'unpaid', 'canceled', 'incomplete', 'inactive'];

export function isSubscriptionActive(status: string | null | undefined): boolean {
  if (!status) return false;
  return status === 'active' || status === 'trialing';
}

const TITAN_MAX = 9999;

export function isTitanOrUnlimited(value: number | null | undefined): boolean {
  if (value == null) return true;
  if (value <= 0) return true;
  if (value >= TITAN_MAX) return true;
  return false;
}