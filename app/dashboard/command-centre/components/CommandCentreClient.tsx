'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/lib/useDashboard';
import { useNotifications } from '@/lib/useNotifications';
import { useSupportTickets } from '@/lib/useSupportTickets';
import { useAllRiskScores } from '@/lib/useRiskScores';
import { useAuth } from '@/lib/auth';
import { usePanicMode } from '@/app/dashboard/components/PanicModeContext';
import { callAgent } from '@/lib/guardianhubAgents';
import AgentStatusBar from '@/components/AgentStatusBar';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
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

  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any>(null);

  const fetchAgent = useCallback(async () => {
    if (!profile?.id) return;
    setAgentLoading(true);
    setAgentError(null);
    try {
      const result = await callAgent(
        'command_centre',
        {
          active_sites: sites.filter(s => s.shift_status === 'active').length,
          guards_on_duty: guardsOnShift.length,
          open_incidents: kpis.openIncidents,
          missed_patrols: kpis.missedPatrols,
        },
        {
          clientId: profile.company_id,
          userId: profile.id,
          requestedPage: '/dashboard/command-centre',
          requestedFeature: 'command_centre',
        }
      );
      if (result.error) setAgentError(result.error);
      setAgentData(result.data);
    } catch (err: any) {
      setAgentError(err.message || 'Agent call failed');
    } finally {
      setAgentLoading(false);
    }
  }, [profile?.id, profile?.company_id, kpis.openIncidents, kpis.missedPatrols, sites.length, guardsOnShift.length]);

  useEffect(() => {
    if (profile?.id && !dashLoading) {
      fetchAgent();
    }
  }, [profile?.id, dashLoading]);

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

      <WidgetBoundary widgetName="CommandCentreAgent" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <AgentStatusBar
          agentKey="command_centre"
          loading={agentLoading}
          error={agentError}
          data={agentData}
          onRetry={fetchAgent}
        />
      </WidgetBoundary>

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

      <WidgetBoundary widgetName="QuickActionBar" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <QuickActionBar />
      </WidgetBoundary>

      <WidgetBoundary widgetName="StatusCards" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
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
      </WidgetBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WidgetBoundary widgetName="PriorityAlertFeed" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
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
          </WidgetBoundary>
        </div>
        <div>
          <WidgetBoundary widgetName="SitesNeedingAttention" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
            <SitesNeedingAttentionPanel sites={sites} riskScores={riskScores} />
          </WidgetBoundary>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetBoundary widgetName="GuardWelfarePanel" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <GuardWelfarePanel
            guardsOnShift={guardsOnShift}
            missingGuards={missingGuards}
            staffingAlerts={staffingAlerts}
            notifications={notifications}
          />
        </WidgetBoundary>
        <WidgetBoundary widgetName="HandoverSummary" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
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
        </WidgetBoundary>
      </div>

      <WidgetBoundary widgetName="AIOperationsCopilot" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <AITooledOperationsCopilot />
      </WidgetBoundary>
    </div>
  );
}