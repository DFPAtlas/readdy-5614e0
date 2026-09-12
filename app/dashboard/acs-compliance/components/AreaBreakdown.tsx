'use client';

import { AreaScore } from '@/lib/useACSCompliance';

export default function AreaBreakdown({ areaScores }: { areaScores: AreaScore[] }) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Area Breakdown</h2>
      <div className="space-y-3">
        {areaScores.map((area) => (
          <div key={area.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${area.status === 'green' ? 'bg-emerald-500' : area.status === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-300">{area.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${area.score >= 85 ? 'text-emerald-400' : area.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {area.score}%
                </span>
                <span className="text-xs text-gray-500">{area.ready}/{area.total}</span>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${area.score >= 85 ? 'bg-emerald-500' : area.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.max(2, area.score)}%` }}></div>
            </div>
            {area.issues > 0 && (
              <p className="text-xs text-red-400 mt-0.5">{area.issues} issues found</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}