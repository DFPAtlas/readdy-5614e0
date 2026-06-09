'use client';

import { useDashboard } from '@/lib/useDashboard';
import { useNotifications } from '@/lib/useNotifications';
import { useSupportTickets } from '@/lib/useSupportTickets';
import { useAllRiskScores } from '@/lib/useRiskScores';
import { useAuth } from '@/lib/auth';
import { usePanicMode } from '@/app/dashboard/components/PanicModeContext';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';
import CommandCentreHeader from '@/app/dashboard/components/CommandCentreHeader';
import StatusCards from './StatusCards';
import PriorityAlertFeed from './PriorityAlertFeed';
import SitesNeedingAttentionPanel from './SitesNeedingAttentionPanel';
import GuardWelfarePanel from './GuardWelfarePanel';
import HandoverSummary from './HandoverSummary';
import QuickActionBar from './QuickActionBar';
import LoadingState from './LoadingState';

export default function CommandCentreClient() {
  const { profile } = useAuth();
  const {
    kpis,
    sites,
    recentIncidents,
    liveOccurrences,
    guardsOnShift,
    missingGuards,
    patrolSummary,
    staffingAlerts,
    aiAlerts,
    loading: dashLoading,
    error: dashError,
    lastUpdated,
    refetch,
  } = useDashboard();

  const { notifications } = useNotifications(profile?.id || null);
  const { tickets } = useSupportTickets();
  const { scores: riskScores } = useAllRiskScores();

  if (dashLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Operations Command Centre</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE
          </span>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommandCentreHeader kpis={kpis} lastUpdated={lastUpdated} onRefresh={refetch} />

      {dashError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-error-warning-line"></i>
            </div>
            {dashError}
          </div>
        </div>
      )}

      <QuickActionBar />

      <StatusCards
        activeSites={sites.filter(s => s.shift_status === 'active').length}
        totalSites={sites.length}
        guardsOnDuty={guardsOnShift.length}
        lateGuards={guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late').length}
        missingGuards={missingGuards.length}
        openIncidents={kpis.openIncidents}
        missedPatrols={kpis.missedPatrols}
        highRiskSites={riskScores.filter(s => s.level === 'high' || s.level === 'critical').length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriorityAlertFeed
            incidents={recentIncidents}
            notifications={notifications}
            aiAlerts={aiAlerts}
            tickets={tickets}
            patrolSummary={patrolSummary}
            missingGuards={missingGuards}
            guardsOnShift={guardsOnShift}
            staffingAlerts={staffingAlerts}
          />
        </div>
        <div>
          <SitesNeedingAttentionPanel sites={sites} riskScores={riskScores} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuardWelfarePanel
          guardsOnShift={guardsOnShift}
          missingGuards={missingGuards}
          staffingAlerts={staffingAlerts}
          notifications={notifications}
        />
        <HandoverSummary
          kpis={kpis}
          sites={sites}
          guardsOnShift={guardsOnShift}
          missingGuards={missingGuards}
          recentIncidents={recentIncidents}
          patrolSummary={patrolSummary}
          liveOccurrences={liveOccurrences}
          staffingAlerts={staffingAlerts}
        />
      </div>

      <AITooledOperationsCopilot />
    </div>
  );
}