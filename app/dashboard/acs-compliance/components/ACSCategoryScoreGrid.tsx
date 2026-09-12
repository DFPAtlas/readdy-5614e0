'use client';

import type { AreaScore } from '@/lib/useACSCompliance';

interface ACSCategoryScoreGridProps {
  areaScores: AreaScore[];
  loading?: boolean;
}

export default function ACSCategoryScoreGrid({ areaScores, loading }: ACSCategoryScoreGridProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="h-4 w-36 bg-white/5 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!areaScores.length) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Category Scores</h3>
        <p className="text-xs text-gray-500">No compliance data available yet. Upload documents and complete your profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Category Scores</h3>
      <div className="grid grid-cols-2 gap-3">
        {areaScores.map((area) => {
          const dotColor = area.status === 'green' ? 'bg-emerald-500' : area.status === 'amber' ? 'bg-amber-500' : 'bg-red-500';
          const barColor = area.status === 'green' ? 'bg-emerald-500' : area.status === 'amber' ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={area.name} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}></span>
                <span className="text-xs font-medium text-gray-300 truncate">{area.name}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-lg font-bold text-white">{area.score}%</span>
                <span className="text-[10px] text-gray-500 mb-0.5">{area.ready}/{area.total}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${area.score}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}