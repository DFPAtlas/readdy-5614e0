import type { PatrolSLAData } from '@/lib/useClientSLA';

interface PatrolSLAPanelProps {
  data: PatrolSLAData[];
}

export default function PatrolSLAPanel({ data }: PatrolSLAPanelProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Patrol SLA Performance</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-gray-600">
            <i className="ri-route-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500">No patrol data for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Patrol SLA Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium py-2 px-3">Site</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Total</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Completed</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Missed</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Rate</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((p) => {
              const status = p.completionRate >= 95 ? 'pass' : p.completionRate >= 80 ? 'warning' : 'fail';
              const statusClasses = {
                pass: 'bg-emerald-500/10 text-emerald-400',
                warning: 'bg-amber-500/10 text-amber-400',
                fail: 'bg-red-500/10 text-red-400',
              };
              return (
                <tr key={p.siteId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 text-white font-medium">{p.siteName}</td>
                  <td className="py-2 px-3 text-right text-gray-300">{p.totalPatrols}</td>
                  <td className="py-2 px-3 text-right text-gray-300">{p.completedPatrols}</td>
                  <td className="py-2 px-3 text-right text-gray-300">{p.missedPatrols}</td>
                  <td className="py-2 px-3 text-right text-white font-medium">{p.completionRate}%</td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                      {status === 'pass' ? 'Met SLA' : status === 'warning' ? 'Near SLA' : 'Below SLA'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <p className="text-xs text-gray-500 mt-3 text-center">{data.length - 10} more sites not shown</p>
      )}
    </div>
  );
}