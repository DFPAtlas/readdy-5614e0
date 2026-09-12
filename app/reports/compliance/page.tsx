'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';

interface Site {
  id: string;
  site_name: string;
}

interface ComplianceReport {
  id: string;
  title: string;
  file_url: string;
  status: string;
  client_visible: boolean;
  generated_at: string;
  site_id: string;
  sites?: { site_name: string } | null;
}

export default function ComplianceReportPage() {
  const { companyId } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<'generate' | 'history'>('generate');

  useEffect(() => {
    if (!companyId) return;
    supabase
      .from('sites')
      .select('id, site_name')
      .eq('company_id', companyId)
      .order('site_name')
      .then(({ data }) => {
        if (data) setSites(data);
      });
  }, [companyId]);

  const fetchReports = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('id, title, file_url, status, client_visible, generated_at, site_id, sites:site_id(site_name)')
      .eq('company_id', companyId)
      .eq('report_type', 'compliance')
      .order('generated_at', { ascending: false });

    if (!error) setReports(data as ComplianceReport[] || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleGenerate = async () => {
    if (!selectedSite || !companyId) return;
    setGenerating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-compliance-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ site_id: selectedSite }),
        }
      );
      if (res.ok) {
        const result = await res.json();
        setToast(`Report generated! Audit score: ${result.audit_score}/100 (${result.readiness_level})`);
        fetchReports();
        setTab('history');
      } else {
        const err = await res.json();
        setToast(err.error || 'Failed to generate');
      }
    } catch {
      setToast('Generation failed');
    }
    setGenerating(false);
  };

  const handleToggleClientVisible = async (r: ComplianceReport) => {
    const newVal = !r.client_visible;
    const { error } = await supabase.from('reports').update({ client_visible: newVal }).eq('id', r.id);
    if (!error) {
      setToast(newVal ? 'Report marked client-visible' : 'Report hidden from client');
      fetchReports();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) { setToast('Report deleted'); fetchReports(); }
  };

  const selectedSiteName = sites.find((s) => s.id === selectedSite)?.site_name || '';

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-md">
          <div className="w-4 h-4 flex items-center justify-center text-emerald-400 flex-shrink-0"><i className="ri-check-line"></i></div>
          <span className="truncate">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer flex-shrink-0"><i className="ri-close-line"></i></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Compliance &amp; Audit Readiness</h1>
            <p className="text-sm text-gray-400 mt-1">Site audit readiness with document expiry, SIA licences, vetting and training gaps</p>
          </div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            All Reports
          </Link>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-800/40 border border-gray-800 w-fit mb-6">
          {(['generate', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                tab === t ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'generate' ? 'Generate' : 'History'}
              {t === 'history' && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">
                  {reports.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'generate' ? (
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-6 max-w-2xl">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site</label>
                <div className="relative">
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer pr-8 appearance-none"
                  >
                    <option value="">Select a site...</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.site_name}</option>
                    ))}
                  </select>
                  <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <i className="ri-arrow-down-s-line"></i>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={!selectedSite || generating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line"></i></div>
                  )}
                  {generating ? 'Generating...' : 'Generate Compliance Report'}
                </button>
              </div>

              {selectedSiteName && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-sm text-gray-400">
                    This generates a comprehensive compliance PDF for <span className="text-white font-medium">{selectedSiteName}</span>.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Includes: document expiry register, SIA licence status, guard vetting &amp; background checks,
                    certifications, training gaps &amp; compliance %, and an overall audit readiness score.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-700 mb-3">
                  <i className="ri-shield-check-line text-2xl"></i>
                </div>
                <p className="text-sm text-gray-500">No compliance reports generated yet.</p>
                <p className="text-xs text-gray-600 mt-1">Generate one from the Generate tab above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Site</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Client</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Generated</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {reports.map((r) => {
                      const siteName = (r as any).sites?.site_name || '\u2014';
                      return (
                        <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <div className="w-4 h-4 flex items-center justify-center text-emerald-400"><i className="ri-shield-check-line text-xs"></i></div>
                              </div>
                              <p className="text-sm font-medium text-white">{siteName}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              r.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' :
                              r.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
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
        )}
      </div>
    </div>
  );
}