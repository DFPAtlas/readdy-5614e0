'use client';

export default function ComplianceScoreRing({ score, status }: { score: number; status: 'green' | 'amber' | 'red' }) {
  const statusColor = status === 'green' ? '#10b981' : status === 'amber' ? '#f59e0b' : '#ef4444';
  const statusText = status === 'green' ? 'Green' : status === 'amber' ? 'Amber' : 'Red';
  const statusClass = status === 'green' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : status === 'amber' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center">
      <h2 className="text-sm font-semibold text-white mb-4 text-center">ACS Readiness</h2>
      <div className="relative w-44 h-44 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
          <circle
            cx="80" cy="80" r={radius} fill="none" stroke={statusColor} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}%</span>
        </div>
      </div>
      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusClass}`}>
        {statusText} Status
      </span>
      <p className="text-xs text-gray-500 mt-3 text-center">
        {score >= 85 ? 'Your organisation is well-prepared for ACS assessment.' : score >= 60 ? 'Several areas need attention before assessment.' : 'Immediate action required to achieve ACS compliance.'}
      </p>
    </div>
  );
}