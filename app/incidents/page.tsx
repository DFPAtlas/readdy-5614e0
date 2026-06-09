'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useIncidents, type Incident } from '@/lib/useIncidents';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';
import { supabase } from '@/lib/supabase';
import StatCards from './components/StatCards';
import IncidentsTable from './components/IncidentsTable';
import IncidentModal from './components/IncidentModal';
import SeverityMultiSelect from './components/SeverityMultiSelect';
import StatusMultiSelect from './components/StatusMultiSelect';
import Toast from '@/app/sites/components/Toast';

export default function IncidentsPage() {
  const { companyId, profile } = useAuth();
  const { can } = useMyPermissions(profile?.id || null, companyId);

  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [sites, setSites] = useState<{ id: string; site_name: string }[]>([]);

  useEffect(() => {
    if (!companyId) return;
    supabase.from('sites').select('id, site_name').eq('company_id', companyId).order('site_name').then(({ data }) => {
      if (data) setSites(data);
    });
  }, [companyId]);

  const filters = useMemo(
    () => ({
      search,
      site_id: siteId || undefined,
      severity: severityFilter.length ? severityFilter : undefined,
      status: statusFilter.length ? statusFilter : undefined,
      from: fromDate ? `${fromDate}T00:00:00Z` : undefined,
      to: toDate ? `${toDate}T23:59:59Z` : undefined,
    }),
    [search, siteId, severityFilter, statusFilter, fromDate, toDate]
  );

  const { incidents, loading, error, refetch, addIncident, updateIncident, newIncidentToast, dismissToast } = useIncidents(filters);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    const result = [...incidents];
    result.sort((a, b) => {
      const aVal = (a as any)[sortKey] ?? '';
      const bVal = (b as any)[sortKey] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [incidents, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / 25));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * 25, safePage * 25);

  const openAdd = () => {
    setEditingIncident(null);
    setModalOpen(true);
  };

  const openEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setModalOpen(true);
  };

  const handleSave = async (payload: any) => {
    setSaving(true);
    if (editingIncident) {
      const { error } = await updateIncident(editingIncident.id, payload);
      if (!error) { setToast('Incident updated'); refetch(); }
      else setToast('Failed to update incident');
    } else {
      const { error } = await addIncident(payload);
      if (!error) { setToast('Incident logged'); refetch(); }
      else setToast('Failed to log incident');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleReset = () => {
    setSearch('');
    setSiteId('');
    setSeverityFilter([]);
    setStatusFilter([]);
    setFromDate(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setToDate(format(new Date(), 'yyyy-MM-dd'));
    setPage(1);
  };

  const hasActiveFilters = search || siteId || severityFilter.length || statusFilter.length;

  return (
    <div className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Incidents</h1>
          <p className="text-gray-400 text-sm mt-1">Review and manage security incidents across all sites</p>
        </div>
        {can('incidents', 'create') && (
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Log Incident
        </button>
        )}
      </div>

      <StatCards incidents={incidents} />

      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3"
        >
          <div className="relative flex-1 max-w-sm"
          >
            <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search description or type..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={siteId}
            onChange={(e) => { setSiteId(e.target.value); setPage(1); }}
            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
          >
            <option value="">All sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.site_name}</option>)}
          </select>

          <div className="flex items-center gap-2"
          >
            <SeverityMultiSelect value={severityFilter} onChange={(v) => { setSeverityFilter(v); setPage(1); }} />
          </div>
          <div className="flex items-center gap-2"
          >
            <StatusMultiSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="flex items-center gap-2"
          >
            <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2"
          >
            <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {error}
        </div>
      )}

      <IncidentsTable
        incidents={paged}
        loading={loading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onView={openEdit}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        total={sorted.length}
        search={search}
      />

      {modalOpen && (
        <IncidentModal
          editingIncident={editingIncident || undefined}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={saving}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      {newIncidentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg flex items-center gap-3"
        >
          <div className="w-4 h-4 flex items-center justify-center"
          >
            <i className="ri-alarm-warning-line"></i>
          </div>
          {newIncidentToast}
          <button onClick={() => { dismissToast(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer whitespace-nowrap"
          >
            View
          </button>
          <button onClick={dismissToast} className="text-gray-500 hover:text-gray-300 ml-1 cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center"
            >
              <i className="ri-close-line"></i>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}