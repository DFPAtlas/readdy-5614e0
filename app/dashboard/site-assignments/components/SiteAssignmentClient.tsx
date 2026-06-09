'use client';

import { useState } from 'react';
import { useAssignmentMatrix } from '@/lib/useAssignmentMatrix';
import { useGuards } from '@/lib/useGuards';
import { useSites } from '@/lib/useSites';
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
  const [filters, setFilters] = useState<any>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [assignModal, setAssignModal] = useState<any>(null);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Site Assignment Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">Guard approvals, training, and site assignments at a glance</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-refresh-line text-sm"></i>
          </div>
          Refresh
        </button>
      </div>

      <SummaryCards {...counts} />

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
        <AssignmentFilters
          clients={clientOptions}
          sites={siteOptions}
          guards={guardOptions}
          filters={filters}
          onChange={setFilters}
          onClear={handleClear}
        />
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
        <AssignmentMatrix rows={rows} columns={columns} filters={filters} onCellClick={handleCellClick} />
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