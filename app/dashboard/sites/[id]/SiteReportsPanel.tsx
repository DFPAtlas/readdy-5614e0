'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteReport {
  id: string;
  title: string;
  reportType: string;
  status: string;
  generatedAt: string;
  aiSummary: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const typeIcons: Record<string, string> = {
  weekly: 'ri-calendar-check-line',
  incident: 'ri-error-warning-line',
  patrol: 'ri-route-line',
  compliance: 'ri-shield-check-line',
  monthly: 'ri-calendar-line',
};

const typeColors: Record<string, string> = {
  weekly: 'text-purple-400 bg-purple-500/10',
  incident: 'text-red-400 bg-red-500/10',
  patrol: 'text-cyan-400 bg-cyan-500/10',
  compliance: 'text-emerald-400 bg-emerald-500/10',
  monthly: 'text-blue-400 bg-blue-500/10',
};

export default function SiteReportsPanel({ siteId }: { siteId: string }) {
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('reports')
        .select('id, title, report_type, status, generated_at, ai_summary, period_start, period_end')
        .eq('site_id', siteId)
        .order('generated_at', { ascending: false })
        .limit(12);

      setReports((data || []).map((r: any) => ({
        id: r.id,
        title: r.title || 'Untitled Report',
        reportType: r.report_type || 'general',
        status: r.status || 'draft',
        generatedAt: r.generated_at,
        aiSummary: r.ai_summary || null,
        periodStart: r.period_start,
        periodEnd: r.period_end,
      })));
      setLoading(false);
    }
    load();
  }, [siteId]);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <i className="ri-file-chart-line text-purple-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Reports</h2>
            <p className="text-[11px] text-gray-400">Generated reports</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{reports.length} reports</span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-32"></div>
                  <div className="h-2 bg-white/5 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-file-chart-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No reports yet</p>
            <p className="text-xs text-gray-500">Reports will appear once they are generated</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => {
              const icon = typeIcons[r.reportType] || typeIcons.weekly;
              const color = typeColors[r.reportType] || typeColors.weekly;

              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <i className={`${icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {r.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500 capitalize">{r.reportType}</span>
                      <span className="text-[11px] text-gray-600">·</span>
                      <span className="text-[11px] text-gray-500">{timeAgo(r.generatedAt)}</span>
                    </div>
                    {r.aiSummary && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{r.aiSummary}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {r.status === 'sent' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        Sent
                      </span>
                    )}
                    {r.status === 'draft' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}