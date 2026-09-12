'use client';

import type { AuditFinding } from '@/lib/useACSCompliance';

interface ACSCriticalFindingsProps {
  findings: AuditFinding[];
  maxDisplay?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export default function ACSCriticalFindings({ findings, maxDisplay = 5, loading, emptyMessage }: ACSCriticalFindingsProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="h-4 w-32 bg-white/5 rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const sorted = [...findings]
    .sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
    })
    .slice(0, maxDisplay);

  if (!sorted.length) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Critical Findings</h3>
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <i className="ri-check-line text-emerald-400 text-lg"></i>
          </div>
          <p className="text-xs text-gray-500">{emptyMessage || 'No findings — looking good.'}</p>
        </div>
      </div>
    );
  }

  const severityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Critical Findings</h3>
        <span className="text-[10px] text-gray-500">{findings.length} total</span>
      </div>
      <div className="space-y-2">
        {sorted.map((f) => (
          <div key={f.id} className="bg-white/5 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-200 line-clamp-2">{f.finding || f.title || f.description}</p>
                <p className="text-[10px] text-gray-500 mt-1">{f.category}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${severityBadge(f.severity)}`}>
                {f.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}