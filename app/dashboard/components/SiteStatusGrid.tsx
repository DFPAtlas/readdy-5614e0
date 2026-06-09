'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { DashboardSite } from '@/lib/useDashboard';

interface SiteStatusGridProps {
  sites: DashboardSite[];
}

interface RiskInfo {
  score: number;
  level: string;
}

function getSiteStatus(s: DashboardSite): {
  dot: string;
  label: string;
  guardDisplay: string;
} {
  if (s.critical_incidents > 0 || (s.shift_status === 'scheduled' && !s.guard_first_name)) {
    return {
      dot: 'bg-red-500',
      label: 'Alert',
      guardDisplay: 'Unassigned',
    };
  }
  if (!s.shift_id) {
    return {
      dot: 'bg-gray-400',
      label: 'No shift',
      guardDisplay: 'No shift',
    };
  }
  if (s.shift_status === 'active' && s.guard_first_name) {
    return {
      dot: 'bg-emerald-500',
      label: 'All clear',
      guardDisplay: `${s.guard_first_name} ${s.guard_last_name || ''}`,
    };
  }
  if (s.shift_status === 'scheduled' && s.guard_first_name) {
    const now = new Date();
    const end = s.end_time ? new Date(s.end_time) : null;
    const soon = end && end.getTime() - now.getTime() < 60 * 60 * 1000;
    return {
      dot: soon ? 'bg-amber-500' : 'bg-emerald-500',
      label: soon ? 'Due to clock off' : 'Scheduled',
      guardDisplay: `${s.guard_first_name} ${s.guard_last_name || ''}`,
    };
  }
  return {
    dot: 'bg-gray-400',
    label: 'Unknown',
    guardDisplay: 'Unknown',
  };
}

function RiskBadge({ level }: { level: string | null }) {
  if (!level) return null;
  const colors: Record<string, string> = {
    low: 'bg-emerald-500/10 text-emerald-400',
    medium: 'bg-amber-500/10 text-amber-400',
    high: 'bg-orange-500/10 text-orange-400',
    critical: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[level.toLowerCase()] || 'bg-gray-500/10 text-gray-400'}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function RiskMiniBadge({ risk }: { risk: RiskInfo | null }) {
  if (!risk) return null;
  const colors: Record<string, string> = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };
  return (
    <span className={`text-[10px] font-medium ${colors[risk.level] || 'text-gray-400'}`} title={`AI Risk Score: ${risk.score}/100`}>
      {risk.score}
    </span>
  );
}

export default function SiteStatusGrid({ sites }: SiteStatusGridProps) {
  const [search, setSearch] = useState('');
  const [riskMap, setRiskMap] = useState<Record<string, RiskInfo>>({});

  useEffect(() => {
    if (!sites.length) return;
    const siteIds = sites.map((s) => s.id);
    supabase
      .from('site_risk_scores')
      .select('site_id, score, level')
      .in('site_id', siteIds)
      .order('generated_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, RiskInfo> = {};
        for (const row of data) {
          if (!map[row.site_id]) {
            map[row.site_id] = { score: row.score, level: row.level };
          }
        }
        setRiskMap(map);
      });
  }, [sites]);

  const filtered = sites.filter((s) =>
    s.site_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Sites Right Now</h2>
        {sites.length > 12 && (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400">
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Search sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm bg-[#0f172a] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 w-56"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((site) => {
          const status = getSiteStatus(site);
          const risk = riskMap[site.id];
          return (
            <Link key={site.id} href={`/sites/${site.id}`} className="block cursor-pointer">
              <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-4 hover:shadow-md hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status.dot}`}></div>
                    <span className="font-semibold text-white text-sm truncate">{site.site_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {risk && <RiskMiniBadge risk={risk} />}
                    <RiskBadge level={site.risk_level} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Guard</span>
                    <span className={`font-medium ${status.guardDisplay === 'Unassigned' ? 'text-red-400' : status.guardDisplay === 'No shift' ? 'text-gray-500' : 'text-gray-300'}`}>
                      {status.guardDisplay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="text-gray-300 font-medium">{status.label}</span>
                  </div>
                  {site.critical_incidents > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-4 h-4 flex items-center justify-center text-red-500">
                        <i className="ri-error-warning-line text-sm"></i>
                      </div>
                      <span className="text-xs text-red-400 font-medium">{site.critical_incidents} open critical incident{site.critical_incidents > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No sites match your search.
        </div>
      )}
    </div>
  );
}