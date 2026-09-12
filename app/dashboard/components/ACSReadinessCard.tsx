'use client';

import Link from 'next/link';

interface ACSReadinessCardProps {
  overallScore: number;
  topIssues: string[];
  nextExpiryLabel: string | null;
  nextExpiryDate: string | null;
  loading?: boolean;
  error?: string | null;
}

export default function ACSReadinessCard({
  overallScore, topIssues, nextExpiryLabel, nextExpiryDate, loading, error,
}: ACSReadinessCardProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-white/5 rounded"></div>
          <div className="h-4 w-28 bg-white/5 rounded"></div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-white/5"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 w-full bg-white/5 rounded"></div>
            <div className="h-3 w-3/4 bg-white/5 rounded"></div>
          </div>
        </div>
        <div className="h-8 bg-white/5 rounded-lg"></div>
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
          <h3 className="text-sm font-semibold text-white">ACS Readiness</h3>
        </div>
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  const scoreColor = overallScore >= 85 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444';
  const scoreText = overallScore >= 85 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-red-400';
  const statusLabel = overallScore >= 85 ? 'Good' : overallScore >= 60 ? 'Fair' : 'At Risk';

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 flex items-center justify-center text-amber-400">
          <i className="ri-shield-check-line"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">ACS Readiness</h3>
        <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${scoreText} bg-white/5`}>{statusLabel}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="38" cy="38" r={radius} fill="none" stroke={scoreColor}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
            />
          </svg>
          <span className={`absolute text-sm font-bold ${scoreText}`}>{overallScore}%</span>
        </div>

        <div className="flex-1 min-w-0">
          {topIssues.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Top Issues</p>
              {topIssues.slice(0, 3).map((issue, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  <p className="text-xs text-gray-300 truncate">{issue}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No issues detected.</p>
          )}
        </div>
      </div>

      {nextExpiryLabel && nextExpiryDate && (
        <div className="mb-4 flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center text-amber-400">
              <i className="ri-timer-line text-xs"></i>
            </div>
            <span className="text-xs text-gray-400">{nextExpiryLabel}</span>
          </div>
          <span className="text-xs font-medium text-amber-400">{new Date(nextExpiryDate).toLocaleDateString('en-GB')}</span>
        </div>
      )}

      <Link
        href="/dashboard/acs-compliance"
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-arrow-right-line"></i>
        </div>
        Open ACS Compliance Centre
      </Link>
    </div>
  );
}