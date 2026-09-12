'use client';

import { useDashboard } from '@/lib/useDashboard';
import { useCommandCentreExtended } from '@/lib/useCommandCentreExtended';
import { useNotifications } from '@/lib/useNotifications';
import { useSupportTickets } from '@/lib/useSupportTickets';
import { useAllRiskScores } from '@/lib/useRiskScores';
import { useAuth } from '@/lib/auth';
import { useACSCompliance } from '@/lib/useACSCompliance';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import CommandCentreHeader from '@/app/dashboard/components/CommandCentreHeader';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';
import OperatingStateBanner from './OperatingStateBanner';
import PriorityAlertFeed from './PriorityAlertFeed';
import StatusCards from './StatusCards';
import LoneWorkerAlertsCard from './LoneWorkerAlertsCard';
import ClientMessagesCard from './ClientMessagesCard';
import PendingLeaveCard from './PendingLeaveCard';
import ComplianceExpiryCard from './ComplianceExpiryCard';
import AgentHealthWidget from './AgentHealthWidget';
import TodayShiftsWidget from './TodayShiftsWidget';
import GuardWelfarePanel from './GuardWelfarePanel';
import HandoverSummary from './HandoverSummary';
import SitesNeedingAttentionPanel from './SitesNeedingAttentionPanel';
import QuickActionBar from './QuickActionBar';
import LoadingState from './LoadingState';
import SiteActivityTimeline from './SiteActivityTimeline';
import ReportsWidget from './ReportsWidget';
import ACSComplianceStatusCard from './ACSComplianceStatusCard';
import AIOperationsAssistantSection from './AIOperationsAssistantSection';

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

  const {
    loneWorkerAlerts,
    unreadClientMessages,
    pendingLeaveRequests,
    complianceExpiries,
    agentHealth,
    loading: extendedLoading,
    refetch: extendedRefetch,
  } = useCommandCentreExtended();

  const { notifications } = useNotifications(profile?.id || null);
  const { tickets } = useSupportTickets();
  const { scores: riskScores } = useAllRiskScores();
  const {
    overallScore, auditFindings, auditRuns, areaScores,
  } = useACSCompliance();

  const loading = dashLoading || extendedLoading;
  const criticalFindings = auditFindings.filter(f => f.severity === 'critical' && f.status === 'open');
  const overdueActions = auditFindings.filter(f => f.status === 'open' && f.due_date && new Date(f.due_date) < new Date()).length;
  const latestAudit = auditRuns.length > 0 ? auditRuns[0] : null;

  const activeSites = sites.filter(s => s.shift_status === 'active').length;
  const lateGuards = guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late').length;
  const highRiskSites = riskScores.filter(s => s.level === 'high' || s.level === 'critical').length;
  const loneWorkerAlarmCount = loneWorkerAlerts.filter(a => a.alarm_triggered).length;

  if (loading) {
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

      <OperatingStateBanner
        kpis={kpis}
        guardsOnShift={guardsOnShift}
        missingGuards={missingGuards}
        staffingAlerts={staffingAlerts}
        highRiskSiteCount={highRiskSites}
        loneWorkerAlarmCount={loneWorkerAlarmCount}
        lastUpdated={lastUpdated}
      />

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

      <WidgetBoundary widgetName="StatusCards" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <StatusCards
          activeSites={activeSites}
          totalSites={sites.length}
          guardsOnDuty={guardsOnShift.length}
          lateGuards={lateGuards}
          missingGuards={missingGuards.length}
          openIncidents={kpis.openIncidents}
          missedPatrols={kpis.missedPatrols}
          highRiskSites={highRiskSites}
        />
      </WidgetBoundary>

      <WidgetBoundary widgetName="QuickActionBar" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <QuickActionBar />
      </WidgetBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
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
              loneWorkerAlerts={loneWorkerAlerts}
              agentHealth={agentHealth}
            />
          </WidgetBoundary>
        </div>
        <div className="lg:col-span-4">
          <WidgetBoundary widgetName="SitesNeedingAttention" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
            <SitesNeedingAttentionPanel sites={sites} riskScores={riskScores} />
          </WidgetBoundary>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <WidgetBoundary widgetName="TodayShifts" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <TodayShiftsWidget guardsOnShift={guardsOnShift} />
        </WidgetBoundary>
        <WidgetBoundary widgetName="LoneWorkerAlerts" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <LoneWorkerAlertsCard alerts={loneWorkerAlerts} />
        </WidgetBoundary>
        <WidgetBoundary widgetName="AgentHealth" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <AgentHealthWidget agentHealth={agentHealth} />
        </WidgetBoundary>
        <WidgetBoundary widgetName="ClientMessages" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <ClientMessagesCard messages={unreadClientMessages} />
        </WidgetBoundary>
        <WidgetBoundary widgetName="PendingLeave" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <PendingLeaveCard requests={pendingLeaveRequests} />
        </WidgetBoundary>
        <WidgetBoundary widgetName="ComplianceExpiry" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <ComplianceExpiryCard expiries={complianceExpiries} />
        </WidgetBoundary>
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

      <WidgetBoundary widgetName="ACSComplianceStatus" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <ACSComplianceStatusCard
          overallScore={overallScore}
          criticalFindings={criticalFindings}
          overdueActions={overdueActions}
          upcomingExpiries={complianceExpiries.length}
          latestAuditScore={latestAudit?.overall_score ?? null}
          latestAuditDate={latestAudit?.completed_at ?? latestAudit?.created_at ?? null}
        />
      </WidgetBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetBoundary widgetName="SiteActivityTimeline" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <SiteActivityTimeline sites={sites} incidents={recentIncidents} patrolSummary={patrolSummary} guardsOnShift={guardsOnShift} liveOccurrences={liveOccurrences} />
        </WidgetBoundary>
        <WidgetBoundary widgetName="ReportsWidget" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <ReportsWidget companyId={profile?.company_id || ''} />
        </WidgetBoundary>
      </div>

      <WidgetBoundary widgetName="AIOperationsAssistant" pagePath="/dashboard/command-centre" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <AIOperationsAssistantSection agentHealth={agentHealth} loading={extendedLoading} onRefresh={extendedRefetch} />
      </WidgetBoundary>

      <AITooledOperationsCopilot />
    </div>
  );
}