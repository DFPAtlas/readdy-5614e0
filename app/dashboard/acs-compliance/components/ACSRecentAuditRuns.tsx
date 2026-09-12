'use client';

import type { AuditRun } from '@/lib/useACSCompliance';

interface ACSRecentAuditRunsProps {
  auditRuns: AuditRun[];
  maxDisplay?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export default function ACSRecentAuditRuns({ auditRuns, maxDisplay = 5, loading, emptyMessage }: ACSRecentAuditRunsProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="h-4 w-32 bg-white/5 rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!auditRuns.length) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Audits</h3>
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
            <i className="ri-search-line text-gray-400 text-lg"></i>
          </div>
          <p className="text-xs text-gray-500">{emptyMessage || 'No audits run yet.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Recent Audits</h3>
      <div className="space-y-1.5">
        {auditRuns.slice(0, maxDisplay).map((run) => {
          const score = run.overall_score || 0;
          const scoreColor = score >= 85 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
          const dotColor = run.run_type === 'ai' ? 'bg-indigo-500' : 'bg-amber-500';
          return (
            <div key={run.id} className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">
                    {run.audit_name || (run.run_type === 'ai' ? 'AI Audit' : 'Manual Audit')}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(run.created_at).toLocaleDateString('en-GB')}
                    {run.critical_count > 0 && <span className="text-red-400 ml-1">· {run.critical_count} critical</span>}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-bold flex-shrink-0 ml-3 ${scoreColor}`}>{score}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}