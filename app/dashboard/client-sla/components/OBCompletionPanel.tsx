import type { OBCoverageData } from '@/lib/useClientSLA';

interface OBCompletionPanelProps {
  data: OBCoverageData[];
}

export default function OBCompletionPanel({ data }: OBCompletionPanelProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Daily Occurrence Book Completion</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-gray-600">
            <i className="ri-book-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500">No occurrence book entries in the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Daily Occurrence Book Completion</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium py-2 px-3">Date</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Entries</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Sites Covered</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Coverage</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-10).reverse().map((o) => {
              const status = o.coverage >= 90 ? 'pass' : o.coverage >= 70 ? 'warning' : 'fail';
              const statusClasses = {
                pass: 'bg-emerald-500/10 text-emerald-400',
                warning: 'bg-amber-500/10 text-amber-400',
                fail: 'bg-red-500/10 text-red-400',
              };
              return (
                <tr key={o.date} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 text-white font-medium">{new Date(o.date).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-right text-gray-300">{o.totalEntries}</td>
                  <td className="py-2 px-3 text-right text-gray-300">{o.siteCount}</td>
                  <td className="py-2 px-3 text-right text-white font-medium">{o.coverage}%</td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                      {status === 'pass' ? 'Complete' : status === 'warning' ? 'Partial' : 'Low'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}