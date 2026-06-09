'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';

interface WeeklyReport {
  id: string;
  title: string;
  file_url: string;
  report_type: string;
  status: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  ai_summary: string | null;
  site_id: string | null;
  sites?: { site_name: string } | null;
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  sent: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  archived: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
};

export default function WeeklyReportsClient() {
  const { companyId } = useAuth();
  const [tab, setTab] = useState<'draft' | 'sent' | 'archived'>('draft');
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('id, title, file_url, report_type, status, generated_at, period_start, period_end, ai_summary, site_id, sites:site_id(site_name)')
      .eq('company_id', companyId)
      .eq('report_type', 'weekly_site')
      .eq('status', tab)
      .order('generated_at', { ascending: false });

    if (!error) {
      setReports(data as WeeklyReport[] || []);
    }
    setLoading(false);
  }, [companyId, tab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleEdit = (r: WeeklyReport) => {
    setEditingId(r.id);
    setEditText(r.ai_summary || '');
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('reports').update({ ai_summary: editText }).eq('id', id);
    if (!error) {
      setToast('Summary updated');
      setEditingId(null);
      fetchReports();
    } else {
      setToast('Failed to update');
    }
    setSaving(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('reports').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      setToast('Report approved and marked as sent');
      fetchReports();
    } else {
      setToast('Failed to approve');
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

  const handleGenerateForSite = async (siteId: string) => {
    if (!companyId) return;
    setGenLoading(siteId);
    const now = new Date();
    const weekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-weekly-site-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({
            site_id: siteId,
            period_start: weekStart.toISOString(),
            period_end: weekEnd.toISOString(),
          }),
        }
      );
      if (res.ok) {
        setToast('Weekly report generated');
        fetchReports();
      } else {
        const err = await res.json();
        setToast(err.error || 'Failed to generate');
      }
    } catch {
      setToast('Failed to generate');
    }
    setGenLoading(null);
  };

  const filtered = reports.filter((r) => {
    if (!siteFilter) return true;
    const name = (r as any).sites?.site_name || '';
    return name.toLowerCase().includes(siteFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center text-emerald-400"><i className="ri-check-line"></i></div>
          {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer"><i className="ri-close-line"></i></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Site Reports</h1>
          <p className="text-gray-400 text-sm mt-1">
            {tab === 'draft' ? 'Auto-generated reports awaiting review and approval' : tab === 'sent' ? 'Reports already sent to clients' : 'Archived weekly reports'}
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          All Reports
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-800/40 border border-gray-800 w-fit">
        {(['draft', 'sent', 'archived'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              tab === t ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'draft' && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-400">
                {reports.filter((r) => r.status === 'draft').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-xs"></i>
          </div>
          <input
            type="text"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            placeholder="Filter by site name..."
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Report Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-xl">
          <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-700 mb-3">
            <i className="ri-file-text-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500">No {tab} weekly reports.</p>
          <p className="text-xs text-gray-600 mt-1">
            {tab === 'draft' ? 'Reports are auto-generated every Monday morning.' : 'Reports will appear here once approved and sent.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => {
            const siteName = (r as any).sites?.site_name || 'Unknown Site';
            const period = `${format(parseISO(r.period_start), 'd MMM')} – ${format(parseISO(r.period_end), 'd MMM yyyy')}`;
            const badge = statusBadge[r.status] || statusBadge.draft;

            return (
              <div key={r.id} className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-white truncate">{siteName}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{period}</p>

                    {editingId === r.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={6}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                          placeholder="Edit executive summary..."
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(r.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                          >
                            {saving ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <i className="ri-save-line" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                          {r.ai_summary ? r.ai_summary.slice(0, 400) : 'No AI summary available.'}
                          {r.ai_summary && r.ai_summary.length > 400 && '...'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-2 flex-shrink-0">
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                      Preview
                    </a>
                    {r.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleEdit(r)}
                          disabled={editingId === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                          Edit
                        </button>
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-double-line"></i></div>
                          Approve & Send
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}