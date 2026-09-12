'use client';

import Link from 'next/link';
import type { AuditFinding } from '@/lib/useACSCompliance';

interface ACSComplianceStatusCardProps {
  overallScore: number;
  criticalFindings: AuditFinding[];
  overdueActions: number;
  upcomingExpiries: number;
  latestAuditScore: number | null;
  latestAuditDate: string | null;
  loading?: boolean;
  error?: string | null;
}

export default function ACSComplianceStatusCard({
  overallScore, criticalFindings, overdueActions, upcomingExpiries,
  latestAuditScore, latestAuditDate, loading, error,
}: ACSComplianceStatusCardProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-white/5 rounded"></div>
          <div className="h-4 w-36 bg-white/5 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-red-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-error-warning-line"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">ACS Compliance</h3>
        </div>
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  const scoreColor = overallScore >= 85 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = overallScore >= 85 ? 'bg-emerald-500/10 border-emerald-500/20' : overallScore >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-amber-400">
            <i className="ri-shield-star-line"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">ACS Compliance Status</h3>
        </div>
        <Link
          href="/dashboard/acs-compliance"
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          View Centre →
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${scoreBg}`}>
          <span className={`text-lg font-bold ${scoreColor}`}>{overallScore}%</span>
          <span className="text-[10px] text-gray-400">ACS Ready</span>
        </div>
        {latestAuditScore !== null && (
          <div className="text-[10px] text-gray-500">
            Last audit: {latestAuditScore}%
            {latestAuditDate && <span className="block">{new Date(latestAuditDate).toLocaleDateString('en-GB')}</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${criticalFindings.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {criticalFindings.length}
            </span>
            <span className="text-[10px] text-gray-400">Critical</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${overdueActions > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {overdueActions}
            </span>
            <span className="text-[10px] text-gray-400">Overdue</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${upcomingExpiries > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {upcomingExpiries}
            </span>
            <span className="text-[10px] text-gray-400">Expiring</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-300">
              {latestAuditScore !== null ? `${latestAuditScore}%` : '—'}
            </span>
            <span className="text-[10px] text-gray-400">Latest</span>
          </div>
        </div>
      </div>
    </div>
  );
}