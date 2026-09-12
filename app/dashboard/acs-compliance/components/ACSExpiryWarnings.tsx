'use client';

interface ExpiryItem {
  id: string;
  title: string;
  type: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'critical' | 'warning' | 'upcoming';
}

interface ACSExpiryWarningsProps {
  expiries: ExpiryItem[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function ACSExpiryWarnings({ expiries, loading, emptyMessage }: ACSExpiryWarningsProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="h-4 w-36 bg-white/5 rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!expiries.length) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Expiry Warnings</h3>
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <i className="ri-check-line text-emerald-400 text-lg"></i>
          </div>
          <p className="text-xs text-gray-500">{emptyMessage || 'No upcoming expiries — all documents are current.'}</p>
        </div>
      </div>
    );
  }

  const critical = expiries.filter(e => e.status === 'critical');
  const warnings = expiries.filter(e => e.status === 'warning');

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Expiry Warnings</h3>
        <div className="flex items-center gap-2">
          {critical.length > 0 && (
            <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">{critical.length} expired</span>
          )}
          {warnings.length > 0 && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">{warnings.length} soon</span>
          )}
        </div>
      </div>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {expiries.slice(0, 10).map((item) => {
          const severityColor = item.status === 'critical' ? 'text-red-400' : item.status === 'warning' ? 'text-amber-400' : 'text-blue-400';
          const severityBg = item.status === 'critical' ? 'bg-red-500/10 border-red-500/20' : item.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20';
          return (
            <div key={item.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${severityBg} border`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-500">{item.type}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold flex-shrink-0 ml-3 ${severityColor}`}>
                {item.status === 'critical' ? 'Expired' : `${item.daysRemaining}d`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}