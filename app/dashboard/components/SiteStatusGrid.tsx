'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { DashboardSite } from '@/lib/dashboardFetch';

interface SiteStatusGridProps {
  sites: DashboardSite[];
}

interface RiskInfo {
  score: number;
  level: string;
}

type CoverageStatus = 'covered' | 'partial' | 'uncovered' | 'no_shift';

interface SiteDisplayInfo {
  dot: string;
  dotColor: string;
  label: string;
  coverageStatus: CoverageStatus;
  coverageLabel: string;
  guardDisplay: string;
  patrolLabel: string | null;
  patrolDotColor: string | null;
}

function getCoverageStatus(s: DashboardSite): CoverageStatus {
  const hasShift = !!s.shift_id;
  const hasBookedOn = s.booked_on_count > 0;
  const hasGuard = !!s.guard_first_name;

  if (!hasShift && s.assigned_guards_count === 0) return 'no_shift';
  if (hasBookedOn) return 'covered';
  if (hasGuard && s.shift_status === 'active') return 'covered';
  if (hasGuard && s.shift_status === 'scheduled') {
    const now = new Date();
    const end = s.end_time ? new Date(s.end_time) : null;
    if (end && end.getTime() < now.getTime()) return 'uncovered';
    return 'partial';
  }
  if (!hasGuard && hasShift) {
    const now = new Date();
    const start = s.start_time ? new Date(s.start_time) : null;
    if (start && start.getTime() > now.getTime()) return 'partial';
    return 'uncovered';
  }
  if (s.assigned_guards_count > 0 && !hasShift) return 'no_shift';
  return 'no_shift';
}

function getSiteDisplayInfo(s: DashboardSite): SiteDisplayInfo {
  const coverageStatus = getCoverageStatus(s);

  const coverageMap: Record<CoverageStatus, { dot: string; dotColor: string; label: string }> = {
    covered: { dot: 'bg-emerald-500', dotColor: 'text-emerald-400', label: 'Covered' },
    partial: { dot: 'bg-amber-500', dotColor: 'text-amber-400', label: 'Partial Cover' },
    uncovered: { dot: 'bg-red-500', dotColor: 'text-red-400', label: 'Uncovered' },
    no_shift: { dot: 'bg-gray-400', dotColor: 'text-gray-400', label: 'No Shift' },
  };

  const cov = coverageMap[coverageStatus];

  let guardDisplay = 'No guard';
  if (s.guard_first_name) {
    guardDisplay = `${s.guard_first_name} ${s.guard_last_name || ''}`;
  }

  if (s.critical_incidents > 0) {
    return {
      dot: 'bg-red-500',
      dotColor: 'text-red-400',
      label: 'Critical Alert',
      coverageStatus: 'uncovered',
      coverageLabel: 'Site Alert',
      guardDisplay,
      patrolLabel: null,
      patrolDotColor: null,
    };
  }

  let patrolLabel: string | null = null;
  let patrolDotColor: string | null = null;

  if (s.patrol_configured) {
    if (s.patrol_status === 'complete') {
      patrolLabel = 'Patrol done';
      patrolDotColor = 'text-emerald-400';
    } else if (s.patrol_status === 'partial') {
      patrolLabel = 'Patrol partial';
      patrolDotColor = 'text-amber-400';
    } else if (s.patrol_status === 'missed') {
      patrolLabel = 'Patrol missed';
      patrolDotColor = 'text-red-400';
    } else {
      patrolLabel = 'Patrol ready';
      patrolDotColor = 'text-gray-400';
    }
  }

  return {
    dot: cov.dot,
    dotColor: cov.dotColor,
    label: cov.label,
    coverageStatus,
    coverageLabel: cov.label,
    guardDisplay,
    patrolLabel,
    patrolDotColor,
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
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors[level.toLowerCase()] || 'bg-gray-500/10 text-gray-400'}`}>
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

  const coverageColors: Record<CoverageStatus, string> = {
    covered: 'border-emerald-500/30',
    partial: 'border-amber-500/30',
    uncovered: 'border-red-500/30',
    no_shift: 'border-white/10',
  };

  const coverageBgHover: Record<CoverageStatus, string> = {
    covered: 'hover:border-emerald-500/60 hover:bg-emerald-500/5',
    partial: 'hover:border-amber-500/60 hover:bg-amber-500/5',
    uncovered: 'hover:border-red-500/60 hover:bg-red-500/5',
    no_shift: 'hover:border-gray-500/40 hover:bg-white/5',
  };

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
          const info = getSiteDisplayInfo(site);
          const risk = riskMap[site.id];
          return (
            <Link
              key={site.id}
              href={`/dashboard/sites/${site.id}`}
              className={`block cursor-pointer transition-colors ${coverageBgHover[info.coverageStatus]}`}
            >
              <div className={`bg-[#0f172a]/70 backdrop-blur-sm border shadow-sm rounded-xl p-4 transition-all ${coverageColors[info.coverageStatus]}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${info.dot}`}></div>
                    <span className="font-semibold text-white text-sm truncate">{site.site_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {risk && <RiskMiniBadge risk={risk} />}
                    <RiskBadge level={site.risk_level} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Coverage</span>
                    <span className={`font-medium ${info.dotColor}`}>{info.coverageLabel}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Guard</span>
                    <span className={`font-medium truncate max-w-[160px] ${info.coverageStatus === 'uncovered' && !site.guard_first_name ? 'text-red-400' : info.coverageStatus === 'no_shift' ? 'text-gray-500' : 'text-gray-300'}`}>
                      {info.guardDisplay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Assigned</span>
                    <span className={`font-medium ${site.assigned_guards_count > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                      {site.assigned_guards_count} guard{site.assigned_guards_count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {site.booked_on_count > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">On Site</span>
                      <span className="font-medium text-emerald-400">{site.booked_on_count} booked on</span>
                    </div>
                  )}

                  {/* Patrol row */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Patrol</span>
                    {site.patrol_configured && info.patrolDotColor ? (
                      <span className={`font-medium flex items-center gap-1.5 ${info.patrolDotColor}`}>
                        <span className={`w-2 h-2 rounded-full ${info.patrolDotColor === 'text-emerald-400' ? 'bg-emerald-500' : info.patrolDotColor === 'text-amber-400' ? 'bg-amber-500' : info.patrolDotColor === 'text-red-400' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                        {info.patrolLabel}
                      </span>
                    ) : (
                      <span className="text-gray-600">Not configured</span>
                    )}
                  </div>

                  {/* Incidents row */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Incidents</span>
                    {site.open_incidents > 0 ? (
                      <span className={`font-medium flex items-center gap-1.5 ${site.critical_incidents > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${site.critical_incidents > 0 ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        {site.open_incidents} open{site.critical_incidents > 0 && ` (${site.critical_incidents} critical)`}
                      </span>
                    ) : (
                      <span className="text-gray-600">Clear</span>
                    )}
                  </div>

                  {site.critical_incidents > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-4 h-4 flex items-center justify-center text-red-500">
                        <i className="ri-error-warning-line text-sm"></i>
                      </div>
                      <span className="text-xs text-red-400 font-medium">
                        {site.critical_incidents} critical incident{site.critical_incidents > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Welfare status row */}
                  {(() => {
                    const welfareStatus = (site as any).welfare_status;
                    if (!welfareStatus) return null;
                    return (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Welfare</span>
                        <span className={`font-medium flex items-center gap-1.5 ${
                          welfareStatus === 'red' ? 'text-red-400' : welfareStatus === 'amber' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            welfareStatus === 'red' ? 'bg-red-500' : welfareStatus === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          {welfareStatus === 'red' ? 'Alert' : welfareStatus === 'amber' ? 'Warning' : 'OK'}
                        </span>
                      </div>
                    );
                  })()}
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