'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { usePanicMode } from './components/PanicModeContext';
import CommandCentreHeader from './components/CommandCentreHeader';
import AITooledOperationsCopilot from './components/AITooledOperationsCopilot';
import GuardStatusWidget from './components/GuardStatusWidget';
import IncidentStatusWidget from './components/IncidentStatusWidget';
import PatrolStatusWidget from './components/PatrolStatusWidget';
import StaffingAlertWidget from './components/StaffingAlertWidget';
import AIAlertsWidget from './components/AIAlertsWidget';
import RiskScoreWidget from './components/RiskScoreWidget';
import LiveOccurrenceFeed from './components/LiveOccurrenceFeed';
import WeekAtGlance from './components/WeekAtGlance';
import SiteStatusGrid from './components/SiteStatusGrid';
import OnboardingTour from './components/OnboardingTour';
import PanicDim from './components/PanicDim';
import SpotlightCard from './components/SpotlightCard';
import DashboardNoticesWidget from './components/DashboardNoticesWidget';
import TrialBanner from './components/TrialBanner';
import SubscriptionBanner from './components/SubscriptionBanner';

const MODULE_CARDS = [
  {
    title: 'Sites',
    description: 'Manage all your sites and locations',
    icon: 'ri-building-line',
    href: '/sites',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    countLabel: 'sites',
  },
  {
    title: 'Guards & Staff',
    description: 'Officers, certifications, availability',
    icon: 'ri-shield-user-line',
    href: '/guards',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    countLabel: 'guards',
  },
  {
    title: 'Rotas',
    description: 'Shift planning and AI rota generation',
    icon: 'ri-calendar-event-line',
    href: '/rotas',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    countLabel: 'shifts',
  },
  {
    title: 'Daily Occurrence Book',
    description: 'Log and track daily site activities',
    icon: 'ri-book-line',
    href: '/occurrence-book',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    countLabel: 'entries',
  },
  {
    title: 'Incident Reports',
    description: 'Report, track, and resolve incidents',
    icon: 'ri-alarm-warning-line',
    href: '/incidents',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    countLabel: 'open incidents',
  },
  {
    title: 'Patrols & Checkpoints',
    description: 'Patrol routes and NFC checkpoint scans',
    icon: 'ri-route-line',
    href: '/dashboard/patrol-monitoring',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    countLabel: 'patrols',
  },
  {
    title: 'Check Calls',
    description: 'Guard check-in monitoring and alerts',
    icon: 'ri-phone-line',
    href: '/dashboard/ops-room',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    countLabel: 'check-ins',
  },
  {
    title: 'Risk Assessments',
    description: 'Site risk scores and AI assessments',
    icon: 'ri-shield-star-line',
    href: '/dashboard/ai-automation',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    countLabel: 'assessments',
  },
  {
    title: 'SOP Documents',
    description: 'Standard operating procedures library',
    icon: 'ri-book-open-line',
    href: '/sops',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    countLabel: 'documents',
  },
  {
    title: 'Notices Board',
    description: 'Site notices and announcements',
    icon: 'ri-notification-3-line',
    href: '/dashboard/notices',
    color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    countLabel: 'notices',
  },
  {
    title: 'Reports & KPIs',
    description: 'Analytics, reports, and performance',
    icon: 'ri-bar-chart-box-line',
    href: '/reports',
    color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    countLabel: 'reports',
  },
  {
    title: 'Settings',
    description: 'Account, billing, and team settings',
    icon: 'ri-settings-3-line',
    href: '/dashboard/settings',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    countLabel: '',
  },
];

function EmptyModuleCard({ title, description, icon, href }: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/30 hover:bg-[#0f172a] transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/10 transition-colors">
          <i className={`${icon} text-gray-400 group-hover:text-blue-400 text-lg transition-colors`}></i>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className="w-5 h-5 flex items-center justify-center text-gray-600 group-hover:text-blue-400 flex-shrink-0 transition-colors">
          <i className="ri-arrow-right-line"></i>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    kpis,
    sites,
    recentIncidents,
    liveOccurrences,
    weekShifts,
    aiAlerts,
    guardsOnShift,
    missingGuards,
    patrolSummary,
    staffingAlerts,
    loading,
    error,
    lastUpdated,
    refetch,
  } = useDashboard();

  const { panicMode } = usePanicMode();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace('/login');
      } else if (profile && !['super_admin', 'company_admin', 'operations_manager'].includes(profile.role)) {
        if (profile.role === 'guard') router.replace('/guard');
        else if (profile.role === 'client') router.replace('/client');
      }
    }
  }, [currentUser, profile, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500"></span>
          </div>
          <p className="text-xs text-gray-500">Loading command centre...</p>
        </div>
      </div>
    );
  }

  const criticalIncidents = recentIncidents.filter((i) => i.severity === 'critical');

  const moduleCards = MODULE_CARDS.map((mod) => {
    let count = 0;
    if (mod.countLabel === 'sites') count = sites.length;
    if (mod.countLabel === 'guards') count = kpis.activeGuards;
    if (mod.countLabel === 'shifts') count = weekShifts.length;
    if (mod.countLabel === 'open incidents') count = kpis.openIncidents;
    if (mod.countLabel === 'patrols') count = kpis.patrolCompletion;
    return { ...mod, count };
  });

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <OnboardingTour />

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        <CommandCentreHeader
          kpis={kpis}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
        />

        <TrialBanner
          trialEndsAt={company?.trial_ends_at || null}
          companyName={company?.name || null}
        />

        <SubscriptionBanner />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-error-warning-line"></i>
            </div>
            {error}
          </div>
        )}

        {/* Top row: Status widgets */}
        <div className="grid lg:grid-cols-12 gap-5 mb-5">
          <div className="lg:col-span-3">
            <PanicDim>
              <GuardStatusWidget
                guardsOnShift={guardsOnShift}
                missingGuards={missingGuards}
                totalActive={kpis.activeGuards}
              />
            </PanicDim>
          </div>
          <div className="lg:col-span-3">
            <SpotlightCard essential severity={criticalIncidents.length > 0 ? 'critical' : 'high'}>
              <IncidentStatusWidget
                incidents={recentIncidents}
                totalOpen={kpis.openIncidents}
                highCritical={kpis.highCriticalIncidents}
              />
            </SpotlightCard>
          </div>
          <div className="lg:col-span-3">
            <PanicDim>
              <PatrolStatusWidget
                patrols={patrolSummary}
                completionPct={kpis.patrolCompletion}
                missedCount={kpis.missedPatrols}
              />
            </PanicDim>
          </div>
          <div className="lg:col-span-3">
            <PanicDim>
              <StaffingAlertWidget
                alerts={staffingAlerts}
                shortageSites={kpis.staffingShortageSites}
              />
            </PanicDim>
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-apps-line text-blue-400"></i>
            </div>
            Operations Modules
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {moduleCards.map((mod) => (
              <EmptyModuleCard
                key={mod.title}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                href={mod.href}
              />
            ))}
          </div>
        </div>

        {/* Middle row: Notices + Risk + Live Activity */}
        <div className="grid lg:grid-cols-12 gap-5 mb-5">
          <div className="lg:col-span-3">
            <DashboardNoticesWidget />
          </div>
          <div className="lg:col-span-3">
            <PanicDim>
              <RiskScoreWidget sites={sites} avgRiskScore={kpis.avgRiskScore} />
            </PanicDim>
          </div>
          <div className="lg:col-span-6">
            <PanicDim>
              <LiveOccurrenceFeed occurrences={liveOccurrences} />
            </PanicDim>
          </div>
        </div>

        {/* Site status grid */}
        <div className="mb-5">
          <PanicDim>
            <SiteStatusGrid sites={sites} />
          </PanicDim>
        </div>

        {/* Week at glance */}
        <PanicDim>
          <WeekAtGlance shifts={weekShifts} />
        </PanicDim>
      </div>

      <AITooledOperationsCopilot />

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes flashCritical {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 20px 4px rgba(239, 68, 68, 0.3); }
        }
        .animate-flash-critical {
          animation: flashCritical 2s ease-in-out infinite;
        }
        @keyframes pulseRedBanner {
          0%, 100% { border-color: rgba(239, 68, 68, 0.6); }
          50% { border-color: rgba(239, 68, 68, 1); }
        }
        .animate-pulse-red-banner {
          animation: pulseRedBanner 1.5s ease-in-out infinite;
        }
        @keyframes panicGlow {
          0%, 100% { border-color: rgba(239, 68, 68, 0.1); }
          50% { border-color: rgba(239, 68, 68, 0.35); }
        }
        .animate-panic-glow {
          animation: panicGlow 2s ease-in-out infinite;
        }
        @keyframes spotlightPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.08); }
          50% { box-shadow: 0 0 60px rgba(239, 68, 68, 0.2); }
        }
        .animate-spotlight-pulse {
          animation: spotlightPulse 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}