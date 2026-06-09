import type { RiskTrendData } from '@/lib/useClientSLA';

interface SiteRiskTrendProps {
  data: RiskTrendData[];
}

export default function SiteRiskTrend({ data }: SiteRiskTrendProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Site Risk Trend</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-gray-600">
            <i className="ri-bar-chart-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500">No risk score data available</p>
        </div>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    low: 'bg-emerald-500/10 text-emerald-400',
    medium: 'bg-amber-500/10 text-amber-400',
    high: 'bg-orange-500/10 text-orange-400',
    critical: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Site Risk Trend</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium py-2 px-3">Site</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Previous</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Current</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Change</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Level</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((r) => (
              <tr key={r.siteId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 text-white font-medium">{r.siteName}</td>
                <td className="py-2 px-3 text-right text-gray-300">{r.previousScore}</td>
                <td className="py-2 px-3 text-right text-white font-medium">{r.currentScore}</td>
                <td className="py-2 px-3 text-right">
                  <span className={`text-xs font-medium ${r.change > 0 ? 'text-red-400' : r.change < 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {r.change > 0 ? '+' : ''}{r.change}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[r.level] || levelColors.low}`}>
                    {r.level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <p className="text-xs text-gray-500 mt-3 text-center">{data.length - 10} more sites not shown</p>
      )}
    </div>
  );
}