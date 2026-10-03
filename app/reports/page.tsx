'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import GenerateReportMenu from './components/GenerateReportMenu';

interface Report {
  id: string;
  title: string;
  file_url: string;
  report_type: string;
  status: string;
  client_visible: boolean;
  generated_at: string;
  reference_id: string | null;
  site_id: string | null;
  sites?: { site_name: string } | null;
}

const statusBadge: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: 'ri-draft-line', label: 'Draft' },
  sent: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'ri-check-double-line', label: 'Sent' },
  archived: { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: 'ri-archive-line', label: 'Archived' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'ri-error-warning-line', label: 'Failed' },
};

const typeMeta: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  incident: { icon: 'ri-file-pdf-line', color: 'text-red-400', bg: 'bg-red-500/10', label: 'Incident' },
  weekly_site: { icon: 'ri-calendar-check-line', color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Weekly Site' },
  monthly_company: { icon: 'ri-bar-chart-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Monthly' },
  patrol_summary: { icon: 'ri-radar-line', color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Patrol Summary' },
  compliance: { icon: 'ri-shield-check-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Compliance' },
  custom: { icon: 'ri-file-edit-line', color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Custom' },
};

const navItems = [
  { key: 'all', label: 'All', href: '/reports' },
  { key: 'incident', label: 'Incident Reports', href: '/reports?type=incident' },
  { key: 'weekly_site', label: 'Weekly Site Reports', href: '/reports/weekly' },
  { key: 'compliance', label: 'Compliance Reports', href: '/reports/compliance' },
  { key: 'patrol_summary', label: 'Patrol Summaries', href: '/reports/patrol-summary' },
];

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: string; accent: string }) {
  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
        <div className="w-5 h-5 flex items-center justify-center"><i className={icon}></i></div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-none tabular-nums">{value}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { companyId } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [toast, setToast] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const t = params.get('type');
    if (t) setFilterType(t);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchReports = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('reports')
      .select('id, title, file_url, report_type, status, client_visible, generated_at, reference_id, site_id, sites:site_id(site_name)')
      .eq('company_id', companyId)
      .order('generated_at', { ascending: false });

    if (err) {
      setError(err.message);
      setReports([]);
    } else {
      setReports((data as Report[]) || []);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const stats = useMemo(() => {
    const now = new Date();
    const total = reports.length;
    const drafts = reports.filter((r) => r.status === 'draft').length;
    const clientVisible = reports.filter((r) => r.client_visible).length;
    const thisMonth = reports.filter((r) => {
      if (!r.generated_at) return false;
      const d = new Date(r.generated_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total, drafts, clientVisible, thisMonth };
  }, [reports]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filterType !== 'all' && r.report_type !== filterType) return false;
      if (filterDateFrom || filterDateTo) {
        if (!r.generated_at) return false;
        const d = r.generated_at.slice(0, 10);
        if (filterDateFrom && d < filterDateFrom) return false;
        if (filterDateTo && d > filterDateTo) return false;
      }
      return true;
    });
  }, [reports, filterType, filterDateFrom, filterDateTo]);

  const hasActiveFilters = filterType !== 'all' || filterDateFrom !== '' || filterDateTo !== '';

  const clearFilters = () => {
    setFilterType('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleToggleClientVisible = async (r: Report) => {
    setBusyId(r.id);
    const newVal = !r.client_visible;
    const { error: err } = await supabase.from('reports').update({ client_visible: newVal }).eq('id', r.id);
    if (!err) {
      setToast({ text: newVal ? 'Report marked client-visible' : 'Report hidden from client', kind: 'success' });
      setReports((prev) => prev.map((rep) => (rep.id === r.id ? { ...rep, client_visible: newVal } : rep)));
    } else {
      setToast({ text: 'Failed to update visibility', kind: 'error' });
    }
    setBusyId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error: err } = await supabase.from('reports').delete().eq('id', deleteTarget.id);
    if (!err) {
      setToast({ text: 'Report deleted', kind: 'success' });
      setReports((prev) => prev.filter((rep) => rep.id !== deleteTarget.id));
    } else {
      setToast({ text: 'Failed to delete report', kind: 'error' });
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const siteName = (r: Report) => (r.sites?.site_name || '\u2014');

  const typeFor = (r: Report) => typeMeta[r.report_type] || typeMeta.custom;
  const statusFor = (r: Report) => statusBadge[r.status] || statusBadge.draft;

  const showEmpty = !loading && !error && reports.length === 0;
  const showNoResults = !loading && !error && reports.length > 0 && filtered.length === 0;

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-sm">
          <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${toast.kind === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            <i className={toast.kind === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
          </div>
          <span className="truncate">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="ml-2 text-gray-400 hover:text-white cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-sm text-gray-400 mt-1">Generate and manage PDF reports across your sites</p>
          </div>
          <button
            onClick={() => setShowGenerateMenu(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Generate Report
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total reports" value={stats.total} icon="ri-file-text-line" accent="bg-blue-500/10 text-blue-400" />
          <StatCard label="Draft reports" value={stats.drafts} icon="ri-draft-line" accent="bg-yellow-500/10 text-yellow-400" />
          <StatCard label="Client-visible" value={stats.clientVisible} icon="ri-eye-line" accent="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="This month" value={stats.thisMonth} icon="ri-calendar-2-line" accent="bg-purple-500/10 text-purple-400" />
        </div>

        <nav aria-label="Report type navigation" className="flex items-center gap-1 p-1 rounded-xl bg-gray-800/40 border border-gray-800 mb-6 overflow-x-auto">
          {navItems.map((item) => {
            const active = item.key === filterType;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827]/60 border border-gray-800">
            <span className="sr-only">Report type</span>
            <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-filter-3-line text-xs"></i></div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by report type"
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer pr-8"
            >
              <option value="all">All Types</option>
              <option value="incident">Incident</option>
              <option value="weekly_site">Weekly Site</option>
              <option value="patrol_summary">Patrol Summary</option>
              <option value="compliance">Compliance</option>
              <option value="monthly_company">Monthly Company</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827]/60 border border-gray-800">
            <span className="text-xs text-gray-500 whitespace-nowrap">From</span>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              aria-label="Filter from date"
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827]/60 border border-gray-800">
            <span className="text-xs text-gray-500 whitespace-nowrap">To</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              aria-label="Filter to date"
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
            />
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap px-2 py-2"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-circle-line"></i></div>
              Clear filters
            </button>
          )}
        </div>

        <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20" role="status" aria-label="Loading reports">
              <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-6">
              <div className="w-12 h-12 mx-auto flex items-center justify-center text-red-400/70 mb-3">
                <i className="ri-error-warning-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-300">Something went wrong loading reports.</p>
              <p className="text-xs text-gray-500 mt-1 break-words">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
                Try again
              </button>
            </div>
          ) : showEmpty ? (
            <div className="text-center py-20 px-6">
              <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-700 mb-3">
                <i className="ri-file-text-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">No reports generated yet.</p>
              <p className="text-xs text-gray-600 mt-1">Generate a report to see it here.</p>
              <button
                onClick={() => setShowGenerateMenu(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
                Generate Report
              </button>
            </div>
          ) : showNoResults ? (
            <div className="text-center py-20 px-6">
              <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-700 mb-3">
                <i className="ri-filter-off-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">No reports match your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-circle-line"></i></div>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Report</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Site</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Client</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Generated</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filtered.map((r) => {
                      const tm = typeFor(r);
                      const sm = statusFor(r);
                      const isBusy = busyId === r.id;
                      return (
                        <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tm.bg}`}>
                                <div className={`w-4 h-4 flex items-center justify-center ${tm.color}`}><i className={`${tm.icon} text-xs`}></i></div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{r.title}</p>
                                {r.reference_id && (
                                  <Link href={`/incidents/detail?id=${r.reference_id}`} className="text-xs text-blue-400 hover:text-blue-300">
                                    View incident
                                  </Link>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                              <div className="w-3 h-3 flex items-center justify-center"><i className={`${tm.icon} ${tm.color} text-[10px]`}></i></div>
                              {tm.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-400">{siteName(r)}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sm.bg} ${sm.text}`}>
                              <div className="w-3 h-3 flex items-center justify-center"><i className={`${sm.icon} text-[10px]`}></i></div>
                              {sm.label}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => handleToggleClientVisible(r)}
                              disabled={isBusy}
                              aria-label={`Toggle client visibility for ${r.title}`}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                                r.client_visible
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-gray-700/50 text-gray-500 border border-gray-700'
                              }`}
                            >
                              {isBusy ? (
                                <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin"></div>
                              ) : (
                                <div className="w-3 h-3 flex items-center justify-center">
                                  <i className={`${r.client_visible ? 'ri-eye-line' : 'ri-eye-off-line'} text-[10px]`}></i>
                                </div>
                              )}
                              {r.client_visible ? 'Visible' : 'Hidden'}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-400 tabular-nums">
                            {r.generated_at ? format(new Date(r.generated_at), 'd MMM yyyy, HH:mm') : '\u2014'}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {r.file_url ? (
                                <a
                                  href={r.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Open ${r.title}`}
                                  className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div>
                                  Open
                                </a>
                              ) : (
                                <span className="text-sm text-gray-600 whitespace-nowrap">{'\u2014'}</span>
                              )}
                              <button
                                onClick={() => setDeleteTarget(r)}
                                aria-label={`Delete ${r.title}`}
                                title="Delete report"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-gray-800">
                {filtered.map((r) => {
                  const tm = typeFor(r);
                  const sm = statusFor(r);
                  const isBusy = busyId === r.id;
                  return (
                    <div key={r.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tm.bg}`}>
                            <div className={`w-4 h-4 flex items-center justify-center ${tm.color}`}><i className={`${tm.icon} text-sm`}></i></div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{r.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                                <div className="w-3 h-3 flex items-center justify-center"><i className={`${tm.icon} ${tm.color} text-[10px]`}></i></div>
                                {tm.label}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sm.bg} ${sm.text}`}>
                                <div className="w-3 h-3 flex items-center justify-center"><i className={`${sm.icon} text-[10px]`}></i></div>
                                {sm.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        <span className="truncate">{siteName(r)}</span>
                        <span className="tabular-nums whitespace-nowrap">{r.generated_at ? format(new Date(r.generated_at), 'd MMM yyyy') : '\u2014'}</span>
                      </div>

                      {r.reference_id && (
                        <Link href={`/incidents/detail?id=${r.reference_id}`} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2">
                          <div className="w-3 h-3 flex items-center justify-center"><i className="ri-link"></i></div>
                          View incident
                        </Link>
                      )}

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                        <button
                          onClick={() => handleToggleClientVisible(r)}
                          disabled={isBusy}
                          aria-label={`Toggle client visibility for ${r.title}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                            r.client_visible
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-gray-700/50 text-gray-500 border border-gray-700'
                          }`}
                        >
                          {isBusy ? (
                            <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin"></div>
                          ) : (
                            <div className="w-3 h-3 flex items-center justify-center">
                              <i className={`${r.client_visible ? 'ri-eye-line' : 'ri-eye-off-line'} text-[10px]`}></i>
                            </div>
                          )}
                          {r.client_visible ? 'Visible' : 'Hidden'}
                        </button>

                        {r.file_url ? (
                          <a
                            href={r.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${r.title}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-download-line"></i></div>
                            Open
                          </a>
                        ) : null}

                        <button
                          onClick={() => setDeleteTarget(r)}
                          aria-label={`Delete ${r.title}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {showGenerateMenu && <GenerateReportMenu onClose={() => setShowGenerateMenu(false)} />}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete report"
            className="bg-[#151b27] border border-gray-800 rounded-xl w-full max-w-sm shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
              <div className="w-5 h-5 flex items-center justify-center text-red-400"><i className="ri-delete-bin-line"></i></div>
            </div>
            <h2 className="text-lg font-semibold text-white">Delete report?</h2>
            <p className="text-sm text-gray-400 mt-2">
              This will permanently delete <span className="text-white font-medium">{deleteTarget.title}</span>. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}