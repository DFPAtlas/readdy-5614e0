import type { TicketSLAData } from '@/lib/useClientSLA';

interface SupportTicketPanelProps {
  data: TicketSLAData[];
}

export default function SupportTicketPanel({ data }: SupportTicketPanelProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Support Ticket Performance</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-gray-600">
            <i className="ri-customer-service-2-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-500">No support tickets in the selected period</p>
        </div>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-500/10 text-gray-400',
    medium: 'bg-blue-500/10 text-blue-400',
    high: 'bg-amber-500/10 text-amber-400',
    urgent: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Support Ticket Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium py-2 px-3">Subject</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Priority</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">Status</th>
              <th className="text-right text-gray-400 font-medium py-2 px-3">First Response</th>
              <th className="text-left text-gray-400 font-medium py-2 px-3">SLA</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 text-white font-medium truncate max-w-[200px]">{t.subject}</td>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[t.priority] || priorityColors.medium}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'resolved' || t.status === 'closed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {t.firstResponseAt ? 'Responded' : 'Awaiting'}
                </td>
                <td className="py-2 px-3">
                  {t.slaFirstResponseBreached || t.slaResolutionBreached ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-error-warning-line text-[10px]"></i>
                      </div>
                      Breached
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-check-line text-[10px]"></i>
                      </div>
                      Met
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <p className="text-xs text-gray-500 mt-3 text-center">{data.length - 10} more tickets not shown</p>
      )}
    </div>
  );
}