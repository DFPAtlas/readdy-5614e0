'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { SOPAnalytics } from '@/lib/useSOPAnalytics';

interface Props {
  analytics: SOPAnalytics | null;
  loading: boolean;
  tierLimit: number;
  tierName: string;
  aiActions: number;
}

function MiniSpark({ data, color }: { data: { day: string; count: number }[]; color: string }) {
  if (!data.length) return <div className="text-xs text-gray-500">No data</div>;
  return (
    <div className="h-10 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="count" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SOPStatsCards({ analytics, loading, tierLimit, tierName, aiActions }: Props) {
  const usagePct = useMemo(() => {
    if (tierLimit === Infinity) return 0;
    return Math.min(100, Math.round((aiActions / tierLimit) * 100));
  }, [aiActions, tierLimit]);

  const isWarning = usagePct >= 80 && usagePct < 100;
  const isBlocked = usagePct >= 100 && tierLimit !== Infinity;

  const cards = [
    {
      label: 'Total Documents',
      value: analytics?.totalDocuments ?? 0,
      icon: 'ri-file-text-line',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      spark: null as React.ReactNode,
      trend: null as React.ReactNode,
    },
    {
      label: 'Indexed Chunks',
      value: analytics?.totalChunks ?? 0,
      icon: 'ri-database-2-line',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      spark: null,
      trend: null,
    },
    {
      label: 'Questions This Month',
      value: analytics?.questionsThisMonth ?? 0,
      icon: 'ri-question-answer-line',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      spark: analytics?.dailyQueries ? (
        <MiniSpark data={analytics.dailyQueries} color="#34d399" />
      ) : null,
      trend: (
        <span className="text-xs text-gray-500">
          {analytics?.dailyQueries && analytics.dailyQueries.length > 0
            ? `${analytics.dailyQueries.reduce((a, b) => a + b.count, 0)} in last 14d`
            : 'No recent activity'}
        </span>
      ),
    },
    {
      label: "Don't Know Rate",
      value: `${analytics?.dontKnowRate ?? 0}%`,
      icon: 'ri-error-warning-line',
      color: (analytics?.dontKnowRate ?? 0) > 20 ? 'text-red-400' : 'text-amber-400',
      bg: (analytics?.dontKnowRate ?? 0) > 20 ? 'bg-red-500/10' : 'bg-amber-500/10',
      spark: null,
      trend: (
        <span className={`text-xs ${(analytics?.dontKnowRate ?? 0) > 20 ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
          {(analytics?.dontKnowRate ?? 0) > 20 ? 'High — add SOPs' : 'Coverage OK'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-5 animate-pulse">
            <div className="h-11 w-11 bg-gray-700/40 rounded-lg mb-4"></div>
            <div className="h-8 w-16 bg-gray-700/40 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-700/40 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${card.bg}`}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${card.icon} text-xl ${card.color}`}></i>
                </div>
              </div>
              {card.spark}
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <h3 className="text-sm font-medium text-gray-400 mt-1">{card.label}</h3>
            {card.trend && <div className="mt-1">{card.trend}</div>}
          </div>
        ))}
      </div>

      {/* Usage limit bar */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBlocked ? 'bg-red-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`ri-bar-chart-grouped-line text-lg ${isBlocked ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-blue-400'}`}></i>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">AI Usage This Month</h3>
              <p className="text-xs text-gray-500">
                {tierName} Plan · {tierLimit === Infinity ? 'Unlimited' : `${tierLimit.toLocaleString()} actions/month`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${isBlocked ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>
              {usagePct}%
            </span>
            <p className="text-xs text-gray-500">
              {aiActions.toLocaleString()} used
            </p>
          </div>
        </div>

        {tierLimit !== Infinity && (
          <>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isBlocked ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, usagePct)}%` }}
              ></div>
            </div>
            {isBlocked && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-error-warning-line"></i>
                </div>
                Usage limit reached. New AI queries are blocked.
                <Link href="/dashboard/settings" className="underline ml-auto cursor-pointer">Upgrade plan</Link>
              </div>
            )}
            {isWarning && !isBlocked && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-error-warning-line"></i>
                </div>
                Approaching usage limit. Consider upgrading soon.
                <Link href="/dashboard/settings" className="underline ml-auto cursor-pointer">Upgrade plan</Link>
              </div>
            )}
          </>
        )}

        {tierLimit === Infinity && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-check-line"></i>
            </div>
            Unlimited AI usage on Titan plan
          </div>
        )}
      </div>
    </div>
  );
}