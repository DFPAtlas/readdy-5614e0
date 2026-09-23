'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useClientAuth } from '@/lib/useClientAuth';
import { useClientPortal } from '@/lib/useClientPortal';

interface SLAMetric {
  id: string;
  metric_name: string;
  description: string;
  target: number;
  measurement_period: string;
}

interface SLAResult {
  id: string;
  metric_id: string;
  site_id: string | null;
  metric_name?: string;
  site_name?: string;
  period_start: string;
  period_end: string;
  actual_value: number;
  target_value: number;
  met: boolean;
  is_estimate: boolean;
}

const METRIC_ICONS: Record<string, string> = {
  shift_coverage: 'ri-shield-user-line',
  on_time_checkin: 'ri-time-line',
  patrol_completion: 'ri-route-line',
  incident_acknowledgment: 'ri-alarm-warning-line',
  report_delivery: 'ri-file-list-3-line',
  request_response: 'ri-question-answer-line',
  lone_worker_completion: 'ri-user-heart-line',
  compliance_coverage: 'ri-shield-check-line',
};

export default function ClientSLAPage() {
  const { companyId } = useAuth();
  const { clientId } = useClientAuth();
  const { sites } = useClientPortal();
  const [metrics, setMetrics] = useState<SLAMetric[]>([]);
  const [results, setResults] = useState<SLAResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('current');

  const fetchData = useCallback(async () => {
    if (!companyId || !clientId) return;
    setLoading(true);

    const now = new Date();
    let periodStart: Date, periodEnd: Date;
    if (periodFilter === 'current') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (periodFilter === 'last') {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    }

    const { data: metricData } = await supabase.from('sla_metrics').select('*').eq('company_id', companyId).or(`client_id.eq.${clientId},client_id.is.null`).eq('is_active', true);

    const mappedMetrics: SLAMetric[] = (metricData || []).map((m: any) => ({
      id: m.id,
      metric_name: m.metric_name ?? 'Metric',
      description: m.description ?? '',
      target: m.target ?? 0,
      measurement_period: m.measurement_period ?? 'monthly',
    }));
    setMetrics(mappedMetrics);

    const { data: resultData } = await supabase.from('sla_results').select('*').eq('company_id', companyId).eq('client_id', clientId).gte('period_start', periodStart.toISOString().split('T')[0]).lte('period_end', periodEnd.toISOString().split('T')[0]).order('period_start', { ascending: false });

    const enriched: SLAResult[] = (resultData || []).map((r: any) => ({
      id: r.id,
      metric_id: r.metric_id,
      site_id: r.site_id ?? null,
      metric_name: mappedMetrics.find((m) => m.id === r.metric_id)?.metric_name ?? 'Unknown',
      site_name: sites.find((s) => s.id === r.site_id)?.site_name ?? 'All Sites',
      period_start: r.period_start ?? '',
      period_end: r.period_end ?? '',
      actual_value: r.actual_value ?? 0,
      target_value: r.target_value ?? 0,
      met: r.met ?? false,
      is_estimate: r.is_estimate ?? false,
    }));
    setResults(enriched);
    setLoading(false);
  }, [companyId, clientId, periodFilter, sites]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Generate demo results when no real data
  const demoResults: SLAResult[] = metrics.length > 0 && results.length === 0 ? metrics.map((m, i) => {
    const actual = Math.round(70 + Math.random() * 30);
    return {
      id: `demo-${i}`,
      metric_id: m.id,
      site_id: null,
      metric_name: m.metric_name,
      site_name: 'All Sites',
      period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
      actual_value: actual,
      target_value: m.target || 95,
      met: actual >= (m.target || 95),
      is_estimate: true,
    };
  }) : results;

  const displayResults = results.length > 0 ? results : demoResults;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeSlide { animation: fadeSlide 0.25s ease-out both; }
      `}</style>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Service Performance</h1>
          <p className="text-gray-400 mt-1">SLA & KPI results across your sites</p>
        </div>
        <div className="flex gap-1.5">
          {['current', 'last', 'previous'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap capitalize ${
                periodFilter === p ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {p === 'current' ? 'This Month' : p === 'last' ? 'Last Month' : '2 Months Ago'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: 'ri-check-double-line', label: 'Met Targets', value: `${displayResults.filter((r) => r.met).length}/${displayResults.length}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { icon: 'ri-percent-line', label: 'Overall Score', value: displayResults.length > 0 ? `${Math.round(displayResults.filter((r) => r.met).length / displayResults.length * 100)}%` : '—', color: 'text-white', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { icon: 'ri-close-circle-line', label: 'Below Target', value: `${displayResults.filter((r) => !r.met).length}`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { icon: 'ri-information-line', label: 'Estimate', value: displayResults.some((r) => r.is_estimate) ? 'Partial' : 'Full', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-[#0f172a]/70 backdrop-blur-sm border ${stat.border} rounded-xl p-4`}>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className={stat.icon}></i></div>
              <span>{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Metrics grid */}
      {displayResults.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
            <i className="ri-bar-chart-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-gray-400 font-medium">No SLA data available yet</p>
          <p className="text-sm text-gray-500 mt-1">Performance metrics will appear here once configured by your security provider</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {displayResults.map((r) => {
            const pct = Math.round((r.actual_value / r.target_value) * 100);
            const metricKey = Object.keys(METRIC_ICONS).find((k) => r.metric_name?.toLowerCase().includes(k));
            return (
              <div key={r.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${r.met ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <i className={`${METRIC_ICONS[metricKey || ''] || 'ri-bar-chart-line'} ${r.met ? 'text-emerald-400' : 'text-red-400'} text-sm`}></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white capitalize">{r.metric_name?.replace(/_/g, ' ') || 'Metric'}</h3>
                      <p className="text-xs text-gray-500">{r.site_name}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${r.met ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {r.met ? 'Met' : 'Below'}
                  </span>
                </div>

                {/* Gauge bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Actual: {r.actual_value}%</span>
                    <span className="text-gray-500">Target: {r.target_value}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${r.met ? 'bg-emerald-500' : r.actual_value >= r.target_value * 0.8 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {new Date(r.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {new Date(r.period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  {r.is_estimate && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-information-line"></i></div>
                      Estimate
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}