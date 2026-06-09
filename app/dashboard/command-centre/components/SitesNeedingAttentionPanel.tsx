'use client';

import Link from 'next/link';
import type { DashboardSite } from '@/lib/useDashboard';
import type { RiskScore } from '@/lib/useRiskScores';

const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
};

interface SitesNeedingAttentionPanelProps {
  sites: DashboardSite[];
  riskScores: RiskScore[];
}

export default function SitesNeedingAttentionPanel({ sites, riskScores }: SitesNeedingAttentionPanelProps) {
  const highRisk = riskScores.filter(s => s.level === 'high' || s.level === 'critical').slice(0, 6);
  const criticalIncidentSites = sites.filter(s => s.critical_incidents > 0).slice(0, 4);
  const unassignedSites = sites.filter(s => s.shift_status === 'scheduled' && !s.guard_first_name).slice(0, 4);

  const hasData = highRisk.length > 0 || criticalIncidentSites.length > 0 || unassignedSites.length > 0;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 flex items-center justify-center text-orange-400">
          <i className="ri-alert-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Sites Needing Attention</h3>
      </div>

      {!hasData ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
            <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
              <i className="ri-check-line"></i>
            </div>
          </div>
          <p className="text-sm text-gray-500">All sites are clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {highRisk.map(score => {
            const colors = levelColors[score.level] || levelColors.medium;
            const siteName = (score as any).sites?.site_name || 'Site';
            return (
              <Link
                key={score.id}
                href={`/sites/${score.site_id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/40 border border-gray-800/50 hover:border-gray-700 transition-all group cursor-pointer"
              >
                <div className={`w-3 h-3 rounded-full ${colors.dot} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                      {siteName}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text} shrink-0`}>
                      {score.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {score.ai_narrative ? score.ai_narrative.slice(0, 60) + '...' : `${score.score}/100 risk score`}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-lg font-bold ${colors.text}`}>{score.score}</span>
                  <span className="text-[10px] text-gray-500">/100</span>
                </div>
              </Link>
            );
          })}

          {criticalIncidentSites.map(site => (
            <Link key={`crit-${site.id}`} href={`/sites/${site.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all group cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate group-hover:text-red-300 transition-colors">{site.site_name}</span>
                <p className="text-xs text-red-400 mt-0.5">{site.critical_incidents} critical incident{site.critical_incidents > 1 ? 's' : ''}</p>
              </div>
            </Link>
          ))}

          {unassignedSites.map(site => (
            <Link key={`unassigned-${site.id}`} href={`/sites/${site.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all group cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate group-hover:text-amber-300 transition-colors">{site.site_name}</span>
                <p className="text-xs text-amber-400 mt-0.5">Shift unassigned</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}