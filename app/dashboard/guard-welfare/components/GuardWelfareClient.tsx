'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGuardWelfare } from '@/lib/useGuardWelfare';
import { useAuth } from '@/lib/auth';
import { callAgent } from '@/lib/guardianhubAgents';
import AgentStatusBar from '@/components/AgentStatusBar';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WelfareStatusCards from './WelfareStatusCards';
import MissedCheckCallList from './MissedCheckCallList';
import PanicAlertPanel from './PanicAlertPanel';
import GuardActivityTimeline from './GuardActivityTimeline';
import EscalationRulesPanel from './EscalationRulesPanel';
import QuickActionBar from './QuickActionBar';
import WelfareLoadingState from './WelfareLoadingState';

export default function GuardWelfareClient() {
  const { profile } = useAuth();
  const { sessions, wellbeingCheckins, guards, welfareIncidents, notifications, loading, error, lastUpdated, refetch } = useGuardWelfare();
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);

  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any>(null);

  const fetchAgent = useCallback(async () => {
    if (!profile?.id) return;
    setAgentLoading(true);
    setAgentError(null);
    try {
      const result = await callAgent(
        'guard_welfare',
        {
          guards_active: guards.length,
          sessions_active: sessions.length,
          incidents_count: welfareIncidents.length,
        },
        {
          clientId: profile.company_id,
          userId: profile.id,
          requestedPage: '/dashboard/guard-welfare',
          requestedFeature: 'guard_welfare',
        }
      );
      if (result.error) setAgentError(result.error);
      setAgentData(result.data);
    } catch (err: any) {
      setAgentError(err.message || 'Agent call failed');
    } finally {
      setAgentLoading(false);
    }
  }, [profile?.id, profile?.company_id, guards.length, sessions.length, welfareIncidents.length]);

  useEffect(() => {
    if (profile?.id && !loading) {
      fetchAgent();
    }
  }, [profile?.id, loading]);

  if (loading) {
    return <WelfareLoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-error-warning-line"></i>
          </div>
          <div>
            <p className="text-sm text-red-400 font-medium">Failed to load welfare data</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="ml-auto px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
        <WelfareLoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Guard Welfare</h1>
          <p className="text-sm text-gray-500 mt-1">Lone worker monitoring, check calls, and wellbeing</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={refetch}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <i className="ri-refresh-line text-sm"></i>
          </button>
        </div>
      </div>

      <WidgetBoundary widgetName="GuardWelfareAgent" pagePath="/dashboard/guard-welfare" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <AgentStatusBar
          agentKey="guard_welfare"
          loading={agentLoading}
          error={agentError}
          data={agentData}
          onRetry={fetchAgent}
        />
      </WidgetBoundary>

      <WidgetBoundary widgetName="WelfareQuickActionBar" pagePath="/dashboard/guard-welfare" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <QuickActionBar />
      </WidgetBoundary>

      <WidgetBoundary widgetName="WelfareStatusCards" pagePath="/dashboard/guard-welfare" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
        <WelfareStatusCards
          guards={guards}
          sessions={sessions}
          incidents={welfareIncidents}
          notifications={notifications}
        />
      </WidgetBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetBoundary widgetName="MissedCheckCallList" pagePath="/dashboard/guard-welfare" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <MissedCheckCallList sessions={sessions} />
        </WidgetBoundary>
        <WidgetBoundary widgetName="PanicAlertPanel" pagePath="/dashboard/guard-welfare" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <PanicAlertPanel notifications={notifications} incidents={welfareIncidents} />
        </WidgetBoundary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetBoundary widgetName="GuardActivityTimeline" pagePath="/dashboard/guard-welfare" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <GuardActivityTimeline
            guards={guards}
            sessions={sessions}
            wellbeingCheckins={wellbeingCheckins}
          />
        </WidgetBoundary>
        <WidgetBoundary widgetName="EscalationRulesPanel" pagePath="/dashboard/guard-welfare" clientId={profile?.company_id || undefined} userId={profile?.id || undefined}>
          <EscalationRulesPanel />
        </WidgetBoundary>
      </div>
    </div>
  );
}