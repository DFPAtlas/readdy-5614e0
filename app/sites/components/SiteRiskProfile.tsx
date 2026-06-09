'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRiskScores, type RiskScore } from '@/lib/useRiskScores';

const levelColors: Record<string, { bg: string; text: string; bar: string; ring: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500', ring: 'ring-amber-500/20' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', bar: 'bg-orange-500', ring: 'ring-orange-500/20' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', bar: 'bg-red-500', ring: 'ring-red-500/20' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function FactorBar({ factor, label }: { factor?: { value: number; weight: number; note: string }; label: string }) {
  if (!factor) return null;
  const width = Math.round(factor.value * factor.weight * 100);
  const colors: Record<string, string> = {
    incident_volume: 'bg-red-400',
    incident_severity: 'bg-orange-400',
    pattern_concerns: 'bg-purple-400',
    operational_health: 'bg-blue-400',
    staffing_gaps: 'bg-amber-400',
  };
  return (
    <div className="group relative" title={factor.note}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400 capitalize">{label.replace(/_/g, ' ')}</span>
        <span className="text-gray-500">{Math.round(factor.value * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[label] || 'bg-gray-500'} transition-all duration-500`}
          style={{ width: `${Math.max(width, 4)}%` }}
        />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 max-w-xs whitespace-normal shadow-xl">
        {factor.note}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 -mt-1" />
      </div>
    </div>
  );
}

function RecommendationItem({
  rec,
  index,
  acknowledged,
  onAcknowledge,
}: {
  rec: string;
  index: number;
  acknowledged: boolean;
  onAcknowledge: (i: number) => void;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${acknowledged ? 'bg-gray-900/40 border-gray-800/50 opacity-50' : 'bg-[#0f172a]/40 border-gray-800'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${acknowledged ? 'bg-gray-700 text-gray-500' : 'bg-blue-500/20 text-blue-400'}`}>
        <i className={`ri-${acknowledged ? 'check-line' : 'checkbox-blank-circle-line'} text-xs`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${acknowledged ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{rec}</p>
      </div>
      {!acknowledged && (
        <button
          onClick={() => onAcknowledge(index)}
          className="text-xs text-blue-400 hover:text-blue-300 shrink-0 cursor-pointer whitespace-nowrap"
        >
          Acknowledge
        </button>
      )}
    </div>
  );
}

interface SiteRiskProfileProps {
  siteId: string;
}

export default function SiteRiskProfile({ siteId }: SiteRiskProfileProps) {
  const { latest, history, loading, generating, generate, acknowledgeRecommendation, refresh } = useRiskScores(siteId);
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
        <div className="h-32 bg-gray-800 rounded" />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Risk Profile</h3>
          <span className="text-xs text-gray-500">AI-powered</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">No risk assessment yet for this site.</p>
        <button
          onClick={() => generate()}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          {generating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-line"></i></div>
          )}
          {generating ? 'Analysing...' : 'Generate Risk Score'}
        </button>
      </div>
    );
  }

  const colors = levelColors[latest.level] || levelColors.medium;
  const scorePercent = latest.score;
  const acknowledgedSet = new Set(latest.acknowledged_recommendations || []);

  return (
    <div className={`bg-[#111827]/60 border border-gray-800 rounded-xl p-5 ring-1 ${colors.ring}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white">Risk Profile</h3>
            <div className="w-4 h-4 flex items-center justify-center text-blue-400">
              <i className="ri-sparkling-line text-xs"></i>
            </div>
          </div>
          <p className="text-xs text-gray-500">Last updated {formatDate(latest.generated_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => generate()}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {generating ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="w-3 h-3 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
            )}
            Regenerate
          </button>
        </div>
      </div>

      {/* Big Score */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#1f2937"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${scorePercent}, 100`}
              className={colors.text}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${colors.text}`}>{latest.score}</span>
            <span className="text-[10px] text-gray-500 uppercase">/ 100</span>
          </div>
        </div>
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {latest.level.charAt(0).toUpperCase() + latest.level.slice(1)} Risk
          </span>
          {history.length > 1 && (
            <div className="mt-2 text-xs text-gray-500">
              Previous: {history[1].score} ({history[1].level})
              <span className={`ml-1 ${latest.score > history[1].score ? 'text-red-400' : latest.score < history[1].score ? 'text-emerald-400' : 'text-gray-500'}`}>
                <i className={latest.score > history[1].score ? 'ri-arrow-up-line' : latest.score < history[1].score ? 'ri-arrow-down-line' : 'ri-arrow-right-line'}></i>
                {Math.abs(latest.score - history[1].score)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="mb-5 space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contributing Factors</p>
        <FactorBar factor={latest.factors?.incident_volume} label="incident_volume" />
        <FactorBar factor={latest.factors?.incident_severity} label="incident_severity" />
        <FactorBar factor={latest.factors?.pattern_concerns} label="pattern_concerns" />
        <FactorBar factor={latest.factors?.operational_health} label="operational_health" />
        <FactorBar factor={latest.factors?.staffing_gaps} label="staffing_gaps" />
      </div>

      {/* AI Narrative */}
      {latest.ai_narrative && (
        <div className="mb-5 p-4 rounded-lg bg-gray-900/60 border-l-2 border-blue-500/50">
          <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{latest.ai_narrative}&rdquo;</p>
        </div>
      )}

      {/* Recommendations */}
      {latest.recommendations && latest.recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recommendations</p>
            <span className="text-xs text-gray-500">
              {acknowledgedSet.size}/{latest.recommendations.length} acknowledged
            </span>
          </div>
          <div className="space-y-2">
            {latest.recommendations.map((rec, i) => (
              <RecommendationItem
                key={i}
                rec={rec}
                index={i}
                acknowledged={acknowledgedSet.has(String(i))}
                onAcknowledge={acknowledgeRecommendation}
              />
            ))}
          </div>
        </div>
      )}

      {/* History toggle */}
      {history.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 cursor-pointer"
          >
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
            </div>
            {expanded ? 'Hide history' : `View ${history.length - 1} previous assessments`}
          </button>
          {expanded && (
            <div className="mt-3 space-y-2">
              {history.slice(1).map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-gray-900/30">
                  <span className="text-gray-400">{formatDate(h.generated_at)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-medium">{h.score}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${levelColors[h.level]?.bg || ''} ${levelColors[h.level]?.text || ''}`}>
                      {h.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}