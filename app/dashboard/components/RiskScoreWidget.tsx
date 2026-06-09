'use client';

import Link from 'next/link';
import type { DashboardSite } from '@/lib/dashboardFetch';

interface RiskScoreWidgetProps {
  sites: DashboardSite[];
  avgRiskScore: number;
}

const riskLevelConfig: Record<string, { color: string; dot: string; label: string }> = {
  low: { color: 'text-emerald-400', dot: 'bg-emerald-500', label: 'Low' },
  medium: { color: 'text-amber-400', dot: 'bg-amber-500', label: 'Medium' },
  high: { color: 'text-orange-400', dot: 'bg-orange-500', label: 'High' },
  critical: { color: 'text-red-400', dot: 'bg-red-500', label: 'Critical' },
};

export default function RiskScoreWidget({ sites, avgRiskScore }: RiskScoreWidgetProps) {
  const byLevel: Record<string, DashboardSite[]> = { low: [], medium: [], high: [], critical: [] };
  sites.forEach((s) => {
    const level = (s.risk_level || 'low').toLowerCase();
    if (byLevel[level]) byLevel[level].push(s);
    else byLevel.low.push(s);
  });

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-orange-400">
            <i className="ri-line-chart-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Risk Overview</h3>
        </div>
        <Link href="/sites" className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">View all</Link>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className={`text-2xl font-bold ${avgRiskScore <= 30 ? 'text-emerald-400' : avgRiskScore <= 60 ? 'text-amber-400' : 'text-red-400'}`}>{avgRiskScore}</span>
          <span className="text-xs text-gray-500">/100 avg score</span>
        </div>
        <div className="flex gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{byLevel.low.length} low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>{byLevel.medium.length} medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>{byLevel.high.length} high</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>{byLevel.critical.length} critical</span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {sites.length === 0 ? (
          <div className="px-4 pb-4 text-center text-xs text-gray-500 py-6">No site data available.</div>
        ) : (
          sites.slice(0, 8).map((site) => {
            const level = (site.risk_level || 'low').toLowerCase();
            const cfg = riskLevelConfig[level] || riskLevelConfig.low;
            return (
              <Link key={site.id} href={`/sites/${site.id}`} className="block cursor-pointer">
                <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-3 hover:bg-white/5 transition-all">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`}></span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white truncate">{site.site_name}</span>
                  </div>
                  <span className={`text-xs font-medium ${cfg.color} shrink-0`}>{cfg.label}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}