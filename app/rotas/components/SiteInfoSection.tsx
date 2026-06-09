'use client';

interface SiteInfoSectionProps {
  siteName: string;
  riskLevel: string | null;
  totalShifts: number;
  assignedShifts: number;
  unassignedShifts: number;
  periodLabel: string;
}

export default function SiteInfoSection({
  siteName,
  riskLevel,
  totalShifts,
  assignedShifts,
  unassignedShifts,
  periodLabel,
}: SiteInfoSectionProps) {
  const riskColor =
    riskLevel === 'high'
      ? 'bg-red-500/15 text-red-400 border-red-500/25'
      : riskLevel === 'low'
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
        : 'bg-amber-500/15 text-amber-400 border-amber-500/25';

  const riskLabel = riskLevel ? riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) : 'Medium';

  return (
    <div className="bg-[#151b27] border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center shrink-0">
            <div className="w-6 h-6 flex items-center justify-center text-blue-400">
              <i className="ri-building-2-line text-xl"></i>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{siteName}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{periodLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${riskColor} uppercase`}>
            {riskLabel} Risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="bg-[#1a1f2e] border border-gray-800 rounded-lg px-4 py-3">
          <div className="text-2xl font-bold text-white">{totalShifts}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total shifts</div>
        </div>
        <div className="bg-[#1a1f2e] border border-gray-800 rounded-lg px-4 py-3">
          <div className="text-2xl font-bold text-emerald-400">{assignedShifts}</div>
          <div className="text-xs text-gray-500 mt-0.5">Assigned</div>
        </div>
        <div className="bg-[#1a1f2e] border border-gray-800 rounded-lg px-4 py-3">
          <div className="text-2xl font-bold text-amber-400">{unassignedShifts}</div>
          <div className="text-xs text-gray-500 mt-0.5">Open shifts</div>
        </div>
      </div>
    </div>
  );
}