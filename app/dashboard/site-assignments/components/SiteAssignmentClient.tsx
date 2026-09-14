'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAssignmentMatrix } from '@/lib/useAssignmentMatrix';
import { useGuards } from '@/lib/useGuards';
import { useSites } from '@/lib/useSites';
import { useAuth } from '@/lib/auth';
import { callAgent } from '@/lib/guardianhubAgents';
import AgentStatusBar from '@/components/AgentStatusBar';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import SummaryCards from './SummaryCards';
import AssignmentFilters from './AssignmentFilters';
import AssignmentMatrix from './AssignmentMatrix';
import DetailPanel from './DetailPanel';
import AssignModal from './AssignModal';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export default function SiteAssignmentClient() {
  const { rows, columns, loading, error, refetch } = useAssignmentMatrix();
  const { guards } = useGuards();
  const { sites } = useSites();
  const { profile, companyId } = useAuth();
  const [filters, setFilters] = useState<any>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [assignModal, setAssignModal] = useState<any>(null);

  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any>(null);

  const fetchAgent = useCallback(async () => {
    if (!profile?.id || !companyId) return;
    setAgentLoading(true);
    setAgentError(null);
    try {
      const result = await callAgent(
        'client_dashboard',
        'health.status',
        { total_guards: rows.length, total_sites: columns.length },
        { requestedPage: '/dashboard/site-assignments', requestedFeature: 'site_assignments' }
      );
      if (result.error) setAgentError(result.error);
      setAgentData(result.data);
    } catch (err: any) {
      setAgentError(err.message || 'Agent call failed');
    } finally {
      setAgentLoading(false);
    }
  }, [profile?.id, companyId, rows.length, columns.length]);

  useEffect(() => {
    if (profile?.id && !loading) fetchAgent();
  }, [profile?.id, loading]);

  const clientOptions = (sites || []).reduce((acc: any[], s: any) => {
    if (s.client_id && !acc.find((c) => c.id === s.client_id)) {
      acc.push({ id: s.client_id, name: s.client_name || 'Unnamed Client' });
    }
    return acc;
  }, []);
  const siteOptions = (sites || []).map((s: any) => ({ id: s.id, site_name: s.site_name, client_id: s.client_id }));
  const guardOptions = (guards || []).map((g: any) => ({ id: g.id, guard_name: `${g.first_name || ''} ${g.last_name || ''}`.trim() }));

  const handleCellClick = (guard: any, site: any, cell: any) => {
    if (cell.status === 'available') {
      setAssignModal({ guardId: guard.guard_id, guardName: guard.guard_name, siteId: site.id, siteName: site.site_name });
    } else {
      setDetailData({ guard, site, cell });
      setDetailOpen(true);
    }
  };

  const handleClear = () => setFilters({});

  const counts = {
    totalGuards: rows.length,
    totalSites: columns.length,
    assigned: 0,
    approved: 0,
    blocked: 0,
    notTrained: 0,
    expired: 0,
    available: 0,
  };

  rows.forEach((row) => {
    columns.forEach((col) => {
      const cell = row.cells[col.id];
      if (cell?.status === 'assigned') counts.assigned++;
      if (cell?.status === 'approved') counts.approved++;
      if (cell?.status === 'blocked') counts.blocked++;
      if (cell?.status === 'not_trained') counts.notTrained++;
      if (cell?.status === 'expired_docs') counts.expired++;
      if (cell?.status === 'available') counts.available++;
    });
  });

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <i className="ri-error-warning-line text-red-400 text-xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }
  if (rows.length === 0 || columns.length === 0) return <EmptyState onRefresh={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">Workforce Deployment</span>
            <span className="text-[10px] text-gray-500">Step 1 · Eligibility</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Site Deployment Eligibility</h1>
          <p className="text-gray-400 text-sm mt-1">Confirm which guards are cleared for each site, then deploy them in the rota.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/rotas"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-event-line"></i></div>
            Open Rotas
          </Link>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-refresh-line text-sm"></i>
            </div>
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#0a0e1a] border border-gray-800 rounded-xl px-4 py-2.5">
        <WidgetBoundary widgetName="SiteAssignmentAgent" pagePath="/dashboard/site-assignments" clientId={companyId || undefined} userId={profile?.id || undefined}>
          <AgentStatusBar
            agentKey="client_dashboard"
            loading={agentLoading}
            error={agentError}
            data={agentData}
            onRetry={fetchAgent}
          />
        </WidgetBoundary>
      </div>

      <WidgetBoundary widgetName="AssignmentSummaryCards" pagePath="/dashboard/site-assignments" clientId={companyId || undefined} userId={profile?.id || undefined}>
        <SummaryCards {...counts} />
      </WidgetBoundary>

      <div className="bg-[#0a0e1a] border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center text-gray-400"><i className="ri-filter-3-line"></i></div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Filters</h2>
          </div>
        </div>
        <WidgetBoundary widgetName="AssignmentFilters" pagePath="/dashboard/site-assignments" clientId={companyId || undefined} userId={profile?.id || undefined}>
          <AssignmentFilters
            clients={clientOptions}
            sites={siteOptions}
            guards={guardOptions}
            filters={filters}
            onChange={setFilters}
            onClear={handleClear}
          />
        </WidgetBoundary>
      </div>

      <div className="bg-[#0a0e1a] border border-gray-800 rounded-xl p-4">
        <WidgetBoundary widgetName="AssignmentMatrix" pagePath="/dashboard/site-assignments" clientId={companyId || undefined} userId={profile?.id || undefined}>
          <AssignmentMatrix rows={rows} columns={columns} filters={filters} onCellClick={handleCellClick} />
        </WidgetBoundary>
      </div>

      {detailOpen && detailData && (
        <DetailPanel
          guard={detailData.guard}
          site={detailData.site}
          cell={detailData.cell}
          onClose={() => setDetailOpen(false)}
          onRefresh={refetch}
        />
      )}

      {assignModal && (
        <AssignModal
          guardId={assignModal.guardId}
          guardName={assignModal.guardName}
          siteId={assignModal.siteId}
          siteName={assignModal.siteName}
          onClose={() => setAssignModal(null)}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}
