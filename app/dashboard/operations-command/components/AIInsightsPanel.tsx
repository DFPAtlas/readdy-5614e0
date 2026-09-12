'use client';

import type { AIInsight } from '@/lib/useOperationsCommand';

const catIcons: Record<string, string> = {
  high_risk_site: 'ri-error-warning-line',
  missing_patrol: 'ri-route-line',
  staff_shortage: 'ri-user-unfollow-line',
  compliance_failure: 'ri-file-shield-line',
};

const catLabels: Record<string, string> = {
  high_risk_site: 'High Risk',
  missing_patrol: 'Missing Patrol',
  staff_shortage: 'Staff Shortage',
  compliance_failure: 'Compliance',
};

const sevStyles: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-500/5',
  high: 'border-l-orange-500 bg-orange-500/5',
  medium: 'border-l-amber-500 bg-amber-500/5',
  low: 'border-l-blue-500 bg-blue-500/5',
};

const sevBadges: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

export default function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  return (
    <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center text-purple-400">
          <i className="ri-sparkling-line"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">AI Insights</h3>
        <span className="ml-auto text-xs text-gray-500">{insights.length} items</span>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {insights.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 flex items-center justify-center text-emerald-400">
                <i className="ri-check-double-line"></i>
              </div>
            </div>
            <p className="text-sm text-gray-500">All systems running smoothly</p>
            <p className="text-xs text-gray-600 mt-1">No critical insights to report</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`px-5 py-4 border-b border-white/5 border-l-2 ${sevStyles[insight.severity]} hover:bg-white/5 transition-colors`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                  <i className={`${catIcons[insight.category]} text-xs`}></i>
                </div>
                <span className="text-xs text-gray-500">{catLabels[insight.category]}</span>
                <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium border ${sevBadges[insight.severity]}`}>
                  {insight.severity}
                </span>
              </div>
              <p className="text-sm font-medium text-white mb-0.5">{insight.title}</p>
              <p className="text-xs text-gray-400">{insight.description}</p>
              {(insight.siteName || insight.companyName) && (
                <div className="flex items-center gap-3 mt-1.5">
                  {insight.siteName && (
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                      <i className="ri-building-line"></i>
                      {insight.siteName}
                    </span>
                  )}
                  {insight.companyName && (
                    <span className="text-[10px] text-gray-600">{insight.companyName}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}