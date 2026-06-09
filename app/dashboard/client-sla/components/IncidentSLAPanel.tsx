import type { IncidentSLAData } from '@/lib/useClientSLA';

interface IncidentSLAPanelProps {
  data: IncidentSLAData[];
}

export default function IncidentSLAPanel({ data }: IncidentSLAPanelProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Incident Response Performance</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-gray-600">
            <i className="ri-alarm-warning-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500">No incidents in the selected period</p>
        </div>
      </div>
    );
  }

  const severityColors: Record<string, string> = {
    low: 'bg-emerald-500/10 text-emerald-400',
    medium: 'bg-amber-500/10 text-amber-400',
    high: 'bg-orange-500/10 text-orange-400',
    critical: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Incident Response Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium py-2 px-3">Type</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Site</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Severity</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Status</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Closure Time</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((i) => (
              <tr key={i.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 text-white font-medium">{i.incidentType}</td>
                <td className="py-2 px-3 text-gray-300">{i.siteName}</td>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[i.severity] || severityColors.medium}`}>
                    {i.severity}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    i.status === 'resolved' || i.status === 'closed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {i.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {i.closureTime > 0 ? `${i.closureTime} min` : i.status === 'resolved' || i.status === 'closed' ? '< 1 min' : 'Open'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <p className="text-xs text-gray-500 mt-3 text-center">{data.length - 10} more incidents not shown</p>
      )}
    </div>
  );
}