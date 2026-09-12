'use client';

interface ACSReadinessScoreCardProps {
  score: number;
  status: 'green' | 'amber' | 'red';
  loading?: boolean;
  companyName?: string;
}

export default function ACSReadinessScoreCard({ score, status, loading, companyName }: ACSReadinessScoreCardProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="h-4 w-32 bg-white/5 rounded mb-4"></div>
        <div className="flex items-center justify-center py-6">
          <div className="h-24 w-24 rounded-full bg-white/5"></div>
        </div>
        <div className="h-3 w-24 bg-white/5 rounded mx-auto mt-2"></div>
      </div>
    );
  }

  const scoreColor = status === 'green' ? '#10b981' : status === 'amber' ? '#f59e0b' : '#ef4444';
  const scoreBg = status === 'green' ? 'bg-emerald-500/10 border-emerald-500/20' : status === 'amber' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';
  const scoreText = status === 'green' ? 'text-emerald-400' : status === 'amber' ? 'text-amber-400' : 'text-red-400';
  const label = status === 'green' ? 'Good Standing' : status === 'amber' ? 'Needs Attention' : 'At Risk';

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`${scoreBg} backdrop-blur-sm border rounded-xl p-5`}>
      <h3 className="text-sm font-semibold text-white mb-4">ACS Readiness Score</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={radius} fill="none" stroke={scoreColor}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className={`absolute text-2xl font-bold ${scoreText}`}>{score}%</span>
        </div>
        <span className={`text-xs font-medium mt-2 px-2.5 py-0.5 rounded-full ${scoreBg} ${scoreText}`}>{label}</span>
        {companyName && <p className="text-xs text-gray-500 mt-1.5">{companyName}</p>}
      </div>
    </div>
  );
}