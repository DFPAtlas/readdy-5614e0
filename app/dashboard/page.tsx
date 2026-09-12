'use client';

import { useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { usePanicMode } from './components/PanicModeContext';
import CommandCentreHeader from './components/CommandCentreHeader';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import OperationalStatusRow from './components/OperationalStatusRow';
import AttentionPanel from './components/AttentionPanel';
import GuardCoveragePanel from './components/GuardCoveragePanel';
import AIOperationsPanel from './components/AIOperationsPanel';
import WeeklySummary from './components/WeeklySummary';
import SiteStatusGrid from './components/SiteStatusGrid';
import RecentIncidentsFeed from './components/RecentIncidentsFeed';
import LiveOccurrenceFeed from './components/LiveOccurrenceFeed';
import ACSReadinessCard from './components/ACSReadinessCard';
import { useACSCompliance } from '@/lib/useACSCompliance';

export default function DashboardPage() {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const hasLoadedOnce = useRef(false);
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

  const {
    overallScore: acsScore,
    auditFindings,
    governanceItems,
    loading: acsLoading,
  } = useACSCompliance();

  usePanicMode();

  useEffect(() => {
    if (!loading && !hasLoadedOnce.current) {
      hasLoadedOnce.current = true;
    }
  }, [loading]);

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

  if (loading && !hasLoadedOnce.current) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const onboardingComplete = company?.onboarding_status === 'completed';
  const companyName = company?.name || 'Your Company';

  const wrap = (widgetName: string, node: ReactNode) => (
    <WidgetBoundary widgetName={widgetName} pagePath="/dashboard" clientId={profile?.company_id || null} userId={profile?.id || null}>
      {node}
    </WidgetBoundary>
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        {wrap('CommandCentreHeader', (
          <CommandCentreHeader
            kpis={kpis}
            lastUpdated={lastUpdated}
            onRefresh={refetch}
          />
        ))}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-error-warning-line"></i>
            </div>
            {error}
          </div>
        )}

        {!onboardingComplete && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <i className="ri-rocket-line text-amber-400 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-400">Finish setting up {companyName}</p>
                <p className="text-xs text-gray-400 mt-0.5">Complete your company profile, add your first site, and invite guards.</p>
              </div>
            </div>
            <Link
              href="/dashboard/setup-wizard"
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Continue Setup
            </Link>
          </div>
        )}

        {wrap('OperationalStatusRow', (
          <OperationalStatusRow
            kpis={kpis}
            sites={sites}
            aiAlerts={aiAlerts}
            patrolSummary={patrolSummary}
            weekShifts={weekShifts}
            missingGuards={missingGuards}
          />
        ))}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-2 space-y-6">
            {wrap('LiveOccurrenceFeed', (
              <LiveOccurrenceFeed occurrences={liveOccurrences} />
            ))}

            {wrap('RecentIncidentsFeed', (
              <RecentIncidentsFeed incidents={recentIncidents} />
            ))}

            {wrap('SiteStatusGrid', (
              <SiteStatusGrid sites={sites} />
            ))}
          </div>

          <div className="space-y-6">
            {wrap('AttentionPanel', (
              <AttentionPanel
                missingGuards={missingGuards}
                staffingAlerts={staffingAlerts}
                aiAlerts={aiAlerts}
                patrolSummary={patrolSummary}
              />
            ))}

            {wrap('GuardCoveragePanel', (
              <GuardCoveragePanel guardsOnShift={guardsOnShift} missingGuards={missingGuards} />
            ))}

            {wrap('AIOperationsPanel', (
              <AIOperationsPanel aiAlerts={aiAlerts} />
            ))}

            <ACSReadinessCard
              overallScore={acsScore}
              topIssues={auditFindings.filter(f => f.status === 'open').slice(0, 3).map(f => f.finding || f.title || f.category)}
              nextExpiryLabel={governanceItems.find(g => g.expiry_date)?.title || null}
              nextExpiryDate={governanceItems.find(g => g.expiry_date)?.expiry_date || null}
              loading={acsLoading}
            />
          </div>
        </div>

        {wrap('WeeklySummary', (
          <WeeklySummary weekShifts={weekShifts} kpis={kpis} />
        ))}
      </div>
    </div>
  );
}