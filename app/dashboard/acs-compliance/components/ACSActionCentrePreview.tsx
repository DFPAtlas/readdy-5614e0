'use client';

import type { AuditFinding } from '@/lib/useACSCompliance';

interface ACSActionCentrePreviewProps {
  findings: AuditFinding[];
  maxDisplay?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export default function ACSActionCentrePreview({ findings, maxDisplay = 5, loading, emptyMessage }: ACSActionCentrePreviewProps) {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="h-4 w-32 bg-white/5 rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const openFindings = findings.filter(f => f.status === 'open');
  const overdue = openFindings.filter(f => f.due_date && new Date(f.due_date) < new Date());
  const dueSoon = openFindings.filter(f => {
    if (!f.due_date) return false;
    const d = new Date(f.due_date);
    const now = new Date();
    return d >= now && d <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  if (!openFindings.length) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Action Centre</h3>
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <i className="ri-check-double-line text-emerald-400 text-lg"></i>
          </div>
          <p className="text-xs text-gray-500">{emptyMessage || 'All actions resolved.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Action Centre</h3>
        <div className="flex items-center gap-1.5">
          {overdue.length > 0 && (
            <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">{overdue.length} overdue</span>
          )}
          {dueSoon.length > 0 && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">{dueSoon.length} due soon</span>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        {openFindings.slice(0, maxDisplay).map((f) => {
          const isOverdue = f.due_date && new Date(f.due_date) < new Date();
          const severityColor = f.severity === 'critical' ? 'bg-red-500' : f.severity === 'high' ? 'bg-amber-500' : f.severity === 'medium' ? 'bg-blue-500' : 'bg-gray-500';
          return (
            <div key={f.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isOverdue ? 'bg-red-500/5 border border-red-500/10' : 'bg-white/5'}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityColor}`}></span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{f.finding || f.title || 'Untitled'}</p>
                  <p className="text-[10px] text-gray-500">
                    {f.category}
                    {f.due_date && <span> · Due {new Date(f.due_date).toLocaleDateString('en-GB')}</span>}
                  </p>
                </div>
              </div>
              {isOverdue && <span className="text-[10px] text-red-400 font-semibold flex-shrink-0 ml-2">Overdue</span>}
            </div>
          );
        })}
        {openFindings.length > maxDisplay && (
          <p className="text-[10px] text-gray-500 text-center pt-1">+{openFindings.length - maxDisplay} more</p>
        )}
      </div>
    </div>
  );
}