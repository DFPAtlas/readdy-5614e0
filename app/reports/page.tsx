'use client';

import { useState, useEffect } from 'react';
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

const statusBadge: Record<string, { bg: string; text: string; icon: string }> = {
  draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: 'ri-draft-line' },
  sent: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'ri-check-double-line' },
  archived: { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: 'ri-archive-line' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'ri-error-warning-line' },
};

const typeBadge: Record<string, { icon: string; color: string }> = {
  incident: { icon: 'ri-file-pdf-line', color: 'text-red-400' },
  weekly_site: { icon: 'ri-calendar-check-line', color: 'text-amber-400' },
  monthly_company: { icon: 'ri-bar-chart-line', color: 'text-emerald-400' },
  patrol_summary: { icon: 'ri-radar-line', color: 'text-cyan-400' },
  compliance: { icon: 'ri-shield-check-line', color: 'text-emerald-400' },
  custom: { icon: 'ri-file-edit-line', color: 'text-purple-400' },
};

export default function ReportsPage() {
  const { companyId } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const t = params.get('type');
    if (t) setFilterType(t);
  }, []);

  const fetchReports = async () => {
    if (!companyId) return;
    setLoading(true);
    let query = supabase
      .from('reports')
      .select('id, title, file_url, report_type, status, client_visible, generated_at, reference_id, site_id, sites:site_id(site_name)')
      .eq('company_id', companyId)
      .order('generated_at', { ascending: false });

    if (filterType !== 'all') {
      query = query.eq('report_type', filterType);
    }
    if (filterDateFrom) {
      query = query.gte('generated_at', filterDateFrom);
    }
    if (filterDateTo) {
      query = query.lte('generated_at', filterDateTo + 'T23:59:59');
    }

    const { data, error } = await query;
    if (!error) {
      setReports(data as Report[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [companyId, filterType, filterDateFrom, filterDateTo]);

  const handleToggleClientVisible = async (r: Report) => {
    const newVal = !r.client_visible;
    const { error } = await supabase.from('reports').update({ client_visible: newVal }).eq('id', r.id);
    if (!error) {
      setToast(newVal ? 'Report marked client-visible' : 'Report hidden from client');
      setReports((prev) => prev.map((rep) => rep.id === r.id ? { ...rep, client_visible: newVal } : rep));
    } else {
      setToast('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) {
      setToast('Report deleted');
      fetchReports();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center text-emerald-400"><i className="ri-check-line"></i></div>
          {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer"><i className="ri-close-line"></i></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-sm text-gray-400 mt-1">All generated PDF reports for your company</p>
          </div>
          <button
            onClick={() => setShowGenerateMenu(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Generate Report
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827]/60 border border-gray-800">
            <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-filter-3-line text-xs"></i></div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
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
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827]/60 border border-gray-800">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827]/60 border border-gray-800">
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
            />
          </div>
          {(filterType !== 'all' || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => { setFilterType('all'); setFilterDateFrom(''); setFilterDateTo(''); }}
              className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/reports/weekly"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:border-gray-600 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-check-line"></i></div>
            Weekly Site Reports
          </Link>
          <Link
            href="/reports?type=incident"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:border-gray-600 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></div>
            Incident Reports
          </Link>
          <Link
            href="/reports/compliance"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:border-gray-600 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line"></i></div>
            Compliance Reports
          </Link>
          <Link
            href="/reports/patrol-summary"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:border-gray-600 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-radar-line"></i></div>
            Patrol Summaries
          </Link>
        </div>

        <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-700 mb-3">
                <i className="ri-file-text-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">No reports generated yet.</p>
              <p className="text-xs text-gray-600 mt-1">Generate a PDF from any incident detail page.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {reports.map((r) => {
                    const siteName = (r as any).sites?.site_name || (r as any).site_name || '\u2014';
                    const typeMeta = typeBadge[r.report_type] || typeBadge.custom;
                    const statusMeta = statusBadge[r.status] || statusBadge.draft;
                    return (
                      <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              r.report_type === 'patrol_summary' ? 'bg-cyan-500/10' :
                              r.report_type === 'compliance' ? 'bg-emerald-500/10' :
                              'bg-red-500/10'
                            }`}>
                              <div className={`w-4 h-4 flex items-center justify-center ${
                                r.report_type === 'patrol_summary' ? 'text-cyan-400' :
                                r.report_type === 'compliance' ? 'text-emerald-400' :
                                'text-red-400'
                              }`}>
                                <i className={`${
                                  r.report_type === 'patrol_summary' ? 'ri-radar-line' :
                                  r.report_type === 'compliance' ? 'ri-shield-check-line' :
                                  'ri-file-pdf-line'
                                } text-xs`}></i>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{r.title}</p>
                              {r.reference_id && (
                                <Link href={`/incidents/${r.reference_id}`} className="text-xs text-blue-400 hover:text-blue-300">
                                  View incident
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                            <div className="w-3 h-3 flex items-center justify-center"><i className={`${typeMeta.icon} ${typeMeta.color} text-[10px]`}></i></div>
                            {r.report_type === 'weekly_site' ? 'Weekly Site' : r.report_type === 'monthly_company' ? 'Monthly' : r.report_type === 'incident' ? 'Incident' : r.report_type === 'patrol_summary' ? 'Patrol Summary' : r.report_type === 'compliance' ? 'Compliance' : r.report_type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400">{siteName}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusMeta.bg} ${statusMeta.text}`}>
                            <div className="w-3 h-3 flex items-center justify-center"><i className={`${statusMeta.icon} text-[10px]`}></i></div>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleToggleClientVisible(r)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                              r.client_visible
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-gray-700/50 text-gray-500 border border-gray-700'
                            }`}
                          >
                            <div className="w-3 h-3 flex items-center justify-center">
                              <i className={`${r.client_visible ? 'ri-eye-line' : 'ri-eye-off-line'} text-[10px]`}></i>
                            </div>
                            {r.client_visible ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400 tabular-nums">
                          {r.generated_at ? format(new Date(r.generated_at), 'd MMM yyyy, HH:mm') : '\u2014'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={r.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div>
                              Open
                            </a>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-400 transition-colors cursor-pointer whitespace-nowrap"
                              title="Delete"
                            >
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showGenerateMenu && <GenerateReportMenu onClose={() => setShowGenerateMenu(false)} />}
    </div>
  );
}