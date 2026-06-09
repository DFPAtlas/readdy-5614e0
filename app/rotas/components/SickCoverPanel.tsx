'use client';

import { useState } from 'react';
import type { SickCoverItem } from '@/lib/useSickCover';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: {
    sick_count: number;
    affected_shifts: number;
    cover_plan: SickCoverItem[];
  } | null;
  loading: boolean;
  error: string | null;
  onAssign: (shiftId: string, guardId: string) => Promise<void>;
  onAssignAll: (items: SickCoverItem[]) => Promise<void>;
}

export default function SickCoverPanel({
  isOpen,
  onClose,
  data,
  loading,
  error,
  onAssign,
  onAssignAll,
}: Props) {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assigningAll, setAssigningAll] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const plan = data?.cover_plan || [];
  const hasReplacements = plan.some((p) => p.suggested_guard_id);
  const fillableCount = plan.filter((p) => p.suggested_guard_id && !hidden.has(p.shift_id)).length;

  const handleAssign = async (item: SickCoverItem) => {
    if (!item.suggested_guard_id) return;
    setAssigningId(item.shift_id);
    await onAssign(item.shift_id, item.suggested_guard_id);
    setAssigningId(null);
    setHidden((prev) => new Set([...prev, item.shift_id]));
  };

  const handleAssignAll = async () => {
    const toAssign = plan.filter((p) => p.suggested_guard_id && !hidden.has(p.shift_id));
    if (toAssign.length === 0) return;
    setAssigningAll(true);
    await onAssignAll(toAssign);
    setAssigningAll(false);
    setHidden((prev) => {
      const next = new Set(prev);
      for (const p of toAssign) next.add(p.shift_id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#111827] border-l border-gray-800 h-full overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-[#111827] border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-red-400">
                <i className="ri-first-aid-kit-line"></i>
              </div>
              AI Sick Cover
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading
                ? 'Scanning sick leave and shifts...'
                : data
                  ? `${data.sick_count} sick leave${data.sick_count !== 1 ? 's' : ''} · ${data.affected_shifts} affected shift${data.affected_shifts !== 1 ? 's' : ''}`
                  : 'Ready to scan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-close-line"></i>
            </div>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 shrink-0">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-400 ml-3">Finding best replacements...</span>
          </div>
        )}

        {error && (
          <div className="px-5 pt-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <i className="ri-error-warning-line text-xs"></i>
              </div>
              <p className="text-xs text-red-300">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="flex-1 overflow-y-auto">
            {/* Stats Bar */}
            <div className="px-5 pt-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{data.sick_count}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Sick Leave</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-amber-400">{data.affected_shifts}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Shifts Hit</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{fillableCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Fillable</p>
                </div>
              </div>
            </div>

            {/* Bulk Action */}
            {hasReplacements && fillableCount > 0 && (
              <div className="px-5 pt-3">
                <button
                  onClick={handleAssignAll}
                  disabled={assigningAll}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {assigningAll && (
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                  )}
                  <i className="ri-first-aid-kit-line text-xs"></i>
                  Approve all replacements ({fillableCount})
                </button>
              </div>
            )}

            {/* Cover Plan List */}
            <div className="px-5 pt-3 pb-4 space-y-3">
              {plan.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-emerald-500/10">
                    <i className="ri-check-double-line text-emerald-400 text-xl"></i>
                  </div>
                  <p className="text-sm text-gray-400">No sick leave affecting this week</p>
                  <p className="text-xs text-gray-600 mt-1">All shifts have guards assigned</p>
                </div>
              )}

              {plan.map((item) => {
                if (hidden.has(item.shift_id)) return null;
                const hasReplacement = !!item.suggested_guard_id;

                return (
                  <div
                    key={item.shift_id}
                    className={`bg-gray-800/40 border rounded-xl overflow-hidden ${
                      hasReplacement ? 'border-gray-800' : 'border-red-500/20'
                    }`}
                  >
                    <div className="p-4">
                      {/* Shift Info */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{item.site_name}</span>
                            <span className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded uppercase">
                              {item.shift_type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.shift_date} · {item.shift_time}
                          </div>
                        </div>
                      </div>

                      {/* Sick Guard */}
                      <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                          <i className="ri-hospital-line text-red-400 text-xs"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-red-300">{item.sick_guard_name}</p>
                          <p className="text-[10px] text-gray-500">
                            Sick leave {item.leave_start} — {item.leave_end}
                          </p>
                        </div>
                      </div>

                      {/* Replacement */}
                      {hasReplacement ? (
                        <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <i className="ri-shield-check-line text-emerald-400 text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-emerald-300">{item.suggested_guard_name}</p>
                            <p className="text-[10px] text-gray-500">{item.reasoning}</p>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              item.confidence >= 80
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : item.confidence >= 50
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            {item.confidence >= 80 ? 'High' : item.confidence >= 50 ? 'Medium' : 'Low'} · {item.confidence}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                            <i className="ri-question-mark text-gray-500 text-xs"></i>
                          </div>
                          <p className="text-xs text-red-300">No suitable replacement found</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {hasReplacement && (
                          <button
                            onClick={() => handleAssign(item)}
                            disabled={assigningId === item.shift_id}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                          >
                            {assigningId === item.shift_id ? (
                              <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                            ) : (
                              <i className="ri-first-aid-kit-line text-xs"></i>
                            )}
                            Approve and apply
                          </button>
                        )}
                        <button
                          onClick={() => setHidden((prev) => new Set([...prev, item.shift_id]))}
                          className="px-3 py-2 rounded-lg bg-gray-800/60 text-gray-400 border border-gray-700 text-xs font-medium hover:text-white hover:border-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}