'use client';

import Link from 'next/link';
import type { ClientSite, CurrentShift, ClockingLog, SitePatrolSummary, SiteHealthStatus } from '@/lib/useClientPortal';

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'No recent activity';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface SiteOverviewCardProps {
  site: ClientSite;
  shift?: CurrentShift;
  clocking?: ClockingLog;
  openIncidents: number;
  patrol?: SitePatrolSummary;
  health?: SiteHealthStatus;
  lastActivity: string | null;
}

export default function SiteOverviewCard({
  site, shift, clocking, openIncidents, patrol, health, lastActivity,
}: SiteOverviewCardProps) {
  const isCH = site.site_name.toLowerCase().includes('county hall');
  const onSite = clocking?.is_clocked_in;
  const status = (site as any).status || 'active';
  const patrolPct = patrol?.patrolCompletionPct ?? 0;
  const healthScore = health?.score ?? 0;

  const statusStyle =
    status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
    status === 'suspended' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
    status === 'pending_setup' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
    'bg-gray-500/10 border-gray-500/20 text-gray-400';

  return (
    <div className={`rounded-xl overflow-hidden transition-all ${
      isCH
        ? 'bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a] border border-blue-500/20'
        : 'bg-[#0f172a]/70 backdrop-blur-sm border border-white/10'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${
              isCH ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'
            }`}>
              <i className={`${isCH ? 'ri-government-line text-blue-400' : 'ri-building-line text-gray-400'} text-lg`}></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white truncate">{site.site_name}</h3>
                {isCH && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full font-medium flex-shrink-0 whitespace-nowrap">Live</span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate">{site.address}</p>
            </div>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 whitespace-nowrap capitalize ${statusStyle}`}>
            {String(status).replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Current cover</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${onSite ? 'bg-emerald-500' : shift ? 'bg-amber-400' : 'bg-gray-500'}`}></span>
              <p className="text-[11px] font-medium text-white truncate">
                {onSite ? (clocking?.guard_name || 'On site') : shift ? (shift.guard_name || 'Assigned') : 'No cover'}
              </p>
            </div>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Open incidents</p>
            <p className={`text-sm font-bold ${openIncidents > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{openIncidents}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400">Patrol completion</span>
              <span className="text-[10px] font-medium text-white">{patrolPct}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${patrolPct >= 80 ? 'bg-emerald-500' : patrolPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${patrolPct}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400">Dashboard health</span>
              <span className="text-[10px] font-medium text-white">{healthScore}/100</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${healthScore}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-4">
          <div className="w-3 h-3 flex items-center justify-center"><i className="ri-time-line"></i></div>
          <span>Last activity {timeAgo(lastActivity)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/client/sites/${site.id}`}
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-dashboard-line"></i></div>
            Open Site Dashboard
          </Link>
          <Link
            href={`/client/sites/${site.id}?manage=1`}
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-settings-3-line"></i></div>
            Manage Site
          </Link>
        </div>
      </div>
    </div>
  );
}