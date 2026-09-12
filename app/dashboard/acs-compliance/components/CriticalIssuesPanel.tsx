'use client';

import { AuditFinding } from '@/lib/useACSCompliance';

export default function CriticalIssuesPanel({
  criticalFindings,
  highFindings,
  openFindings,
}: {
  criticalFindings: AuditFinding[];
  highFindings: AuditFinding[];
  openFindings: AuditFinding[];
}) {
  const total = criticalFindings.length + highFindings.length;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-3">Critical Issues & Warnings</h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{criticalFindings.length}</div>
          <div className="text-xs text-red-400/70 mt-0.5">Critical</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{highFindings.length}</div>
          <div className="text-xs text-amber-400/70 mt-0.5">High</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{openFindings.length}</div>
          <div className="text-xs text-blue-400/70 mt-0.5">Open</div>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-500">No critical or high-priority findings. Run an AI audit to check for gaps.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[...criticalFindings, ...highFindings].slice(0, 8).map((f) => (
            <div key={f.id} className={`flex items-start gap-2 p-2.5 rounded-lg ${f.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className={`${f.severity === 'critical' ? 'ri-error-warning-fill text-red-400' : 'ri-alert-fill text-amber-400'} text-sm`}></i>
              </div>
              <div>
                <p className="text-sm text-gray-200">{f.finding}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.category} {f.subcategory ? `/ ${f.subcategory}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}