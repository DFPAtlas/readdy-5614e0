'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { usePanicMode } from './components/PanicModeContext';
import CommandCentreHeader from './components/CommandCentreHeader';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';

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

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        <WidgetBoundary widgetName="CommandCentreHeader" pagePath="/dashboard" clientId={profile?.company_id || null} userId={profile?.id || null}>
          <CommandCentreHeader
            kpis={kpis}
            lastUpdated={lastUpdated}
            onRefresh={refetch}
          />
        </WidgetBoundary>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-error-warning-line"></i>
            </div>
            {error}
          </div>
        )}

        <div className="mt-8 p-8 bg-[#0f172a]/50 border border-white/10 rounded-xl text-center">
          <p className="text-gray-400 text-sm">Dashboard shell loaded successfully.</p>
          <p className="text-gray-500 text-xs mt-1">Hooks: OK. Auth: OK. KPIs: {kpis ? 'loaded' : 'pending'}. Sites: {sites?.length || 0}. Ready to add widgets.</p>
        </div>
      </div>
    </div>
  );
}