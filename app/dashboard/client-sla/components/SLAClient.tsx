'use client';

import { useState, useCallback } from 'react';
import { useRequireEntitlement } from '@/lib/useRequireEntitlement';
import { useClientSLA, defaultFilters, type FilterState } from '@/lib/useClientSLA';
import { useSites } from '@/lib/useSites';
import { useGuards } from '@/lib/useGuards';
import SLAFilters from './SLAFilters';
import SummaryCards from './SummaryCards';
import SLACharts from './SLACharts';
import PatrolSLAPanel from './PatrolSLAPanel';
import IncidentSLAPanel from './IncidentSLAPanel';
import AttendanceSLAPanel from './AttendanceSLAPanel';
import OBCompletionPanel from './OBCompletionPanel';
import SupportTicketPanel from './SupportTicketPanel';
import SiteRiskTrend from './SiteRiskTrend';
import ExportBar from './ExportBar';
import LoadingState from './LoadingState';

export default function SLAClient() {
  const { allowed, loading: entGuardLoading } = useRequireEntitlement('hasClientPortal');
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters });
  const { summary, patrolData, incidentData, attendanceData, obData, ticketData, riskTrendData, loading, error, refetch } = useClientSLA(filters);
  const { sites } = useSites();
  const { guards } = useGuards();

  const handleExportPDF = useCallback(() => {
    const rows = [
      ['Site', 'Patrols', 'Completed', 'Missed', 'Rate'],
      ...patrolData.map((p) => [p.siteName, p.totalPatrols, p.completedPatrols, p.missedPatrols, p.completionRate]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sla-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [patrolData]);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Metric', 'Value'],
      ['Average Response Time', summary.avgResponseTime],
      ['Patrol Completion Rate', summary.patrolCompletionRate + '%'],
      ['Missed Patrols', summary.missedPatrols],
      ['Incident Closure Time', summary.incidentClosureTime + ' min'],
      ['Guard Punctuality', summary.guardPunctuality + '%'],
      ['Report Completion Rate', summary.reportCompletionRate + '%'],
      ['Open Issues', summary.openClientIssues],
      ['SLA Breaches', summary.slaBreachCount],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sla-summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [summary]);

  const handleEmailReport = useCallback(() => {
    // TODO: wire up to email edge function
  }, []);

  if (entGuardLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Redirecting to plans...</p>
      </div>
    );
  }

  if (loading && !summary.lastUpdated) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Client SLA Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Performance metrics and service level compliance</p>
        </div>
        <ExportBar
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onEmailReport={handleEmailReport}
        />
      </div>

      <SLAFilters
        filters={filters}
        onChange={setFilters}
        sites={sites}
        guards={guards}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-error-warning-line"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      <SummaryCards summary={summary} />

      <SLACharts
        patrolData={patrolData}
        incidentData={incidentData}
        attendanceData={attendanceData}
        obData={obData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatrolSLAPanel data={patrolData} />
        <IncidentSLAPanel data={incidentData} />
        <AttendanceSLAPanel data={attendanceData} />
        <OBCompletionPanel data={obData} />
        <SupportTicketPanel data={ticketData} />
        <SiteRiskTrend data={riskTrendData} />
      </div>
    </div>
  );
}