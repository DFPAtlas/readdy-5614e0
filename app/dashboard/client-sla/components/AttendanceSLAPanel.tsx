import type { AttendanceSLAData } from '@/lib/useClientSLA';

interface AttendanceSLAPanelProps {
  data: AttendanceSLAData[];
}

export default function AttendanceSLAPanel({ data }: AttendanceSLAPanelProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Guard Attendance Performance</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-gray-600">
            <i className="ri-shield-user-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500">No attendance records in the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Guard Attendance Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium py-2 px-3">Guard</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Site</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Clock In</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Shift Start</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">Diff</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((a) => (
              <tr key={`${a.guardId}-${a.clockIn}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 text-white font-medium">{a.guardName}</td>
                <td className="py-2 px-3 text-gray-300">{a.siteName}</td>
                <td className="py-2 px-3 text-gray-300">
                  {a.clockIn ? new Date(a.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {a.shiftStart ? new Date(a.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {a.isMissing ? '—' : `${a.punctualityMinutes > 0 ? '+' : ''}${a.punctualityMinutes} min`}
                </td>
                <td className="py-2 px-3">
                  {a.isMissing ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                      Missing
                    </span>
                  ) : a.isLate ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                      Late
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      On Time
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <p className="text-xs text-gray-500 mt-3 text-center">{data.length - 10} more records not shown</p>
      )}
    </div>
  );
}