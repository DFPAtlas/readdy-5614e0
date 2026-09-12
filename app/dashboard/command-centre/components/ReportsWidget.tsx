'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import Link from 'next/link';

interface ReportSummary {
  generated_this_week: number;
  failed_this_week: number;
  sites_with_reports: number;
  total_sites: number;
  latest_reports: {
    id: string;
    title: string;
    report_type: string;
    generated_at: string;
    site_name: string;
  }[];
  sites_missing: string[];
}

export default function ReportsWidget({ companyId }: { companyId: string }) {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: allSites } = await supabase
      .from('sites')
      .select('id, site_name')
      .eq('company_id', companyId);

    const { data: reportsThisWeek } = await supabase
      .from('reports')
      .select('id, title, report_type, generated_at, site_id, status')
      .eq('company_id', companyId)
      .gte('generated_at', weekAgo)
      .order('generated_at', { ascending: false });

    const { data: allReports } = await supabase
      .from('reports')
      .select('id, title, report_type, generated_at, site_id, sites:site_id(site_name)')
      .eq('company_id', companyId)
      .order('generated_at', { ascending: false })
      .limit(5);

    const reportsOk = (reportsThisWeek || []).filter((r) => r.status !== 'failed');
    const reportsFailed = (reportsThisWeek || []).filter((r) => r.status === 'failed');
    const sitesWithReports = new Set(reportsOk.map((r) => r.site_id));

    setData({
      generated_this_week: reportsOk.length,
      failed_this_week: reportsFailed.length,
      sites_with_reports: sitesWithReports.size,
      total_sites: allSites?.length || 0,
      latest_reports: (allReports || []).map((r) => ({
        id: r.id,
        title: r.title,
        report_type: r.report_type,
        generated_at: r.generated_at,
        site_name: (r as any).sites?.site_name || '—',
      })),
      sites_missing: (allSites || [])
        .filter((s) => !sitesWithReports.has(s.id))
        .map((s) => s.site_name),
    });
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3" />
          <div className="h-8 bg-gray-700 rounded w-1/2" />
          <div className="h-8 bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const coveragePct = data.total_sites > 0
    ? Math.round((data.sites_with_reports / data.total_sites) * 100)
    : 0;

  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Reports</h3>
        <Link
          href="/reports"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <p className="text-2xl font-bold text-white">{data.generated_this_week}</p>
          <p className="text-xs text-gray-500 mt-0.5">Generated this week</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <p className="text-2xl font-bold text-white">{coveragePct}%</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.sites_with_reports}/{data.total_sites} sites covered
          </p>
        </div>
      </div>

      {data.failed_this_week > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
          <div className="w-4 h-4 flex items-center justify-center text-red-400">
            <i className="ri-error-warning-line text-xs"></i>
          </div>
          <p className="text-xs text-red-400">
            {data.failed_this_week} report generation{data.failed_this_week > 1 ? 's' : ''} failed this week
          </p>
        </div>
      )}

      {data.sites_missing.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
          <div className="w-4 h-4 flex items-center justify-center text-amber-400">
            <i className="ri-information-line text-xs"></i>
          </div>
          <p className="text-xs text-amber-400">
            {data.sites_missing.length} site{data.sites_missing.length > 1 ? 's' : ''} missing reports: {data.sites_missing.slice(0, 3).join(', ')}
            {data.sites_missing.length > 3 ? ` +${data.sites_missing.length - 3} more` : ''}
          </p>
        </div>
      )}

      {data.latest_reports.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Latest Reports</p>
          <div className="space-y-2">
            {data.latest_reports.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                href="/reports"
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-3.5 h-3.5 flex items-center justify-center text-red-400">
                      <i className="ri-file-pdf-line text-[10px]"></i>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">{r.title}</p>
                    <p className="text-[10px] text-gray-500">{r.site_name}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                  {r.generated_at ? format(new Date(r.generated_at), 'd MMM') : '—'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}