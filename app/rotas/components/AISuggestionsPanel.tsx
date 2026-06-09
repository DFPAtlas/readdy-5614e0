import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useGuards } from '@/lib/useGuards';
import { Shift } from '@/lib/useShifts';
import type { AIRotaSuggestion } from '@/lib/useAIRotaSuggestions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  suggestions: Array<{
    shift_id: string;
    suggested_guard_id: string | null;
    confidence: number;
    reasoning: string;
  }>;
  unfillable: Array<{ shift_id: string; reason: string }>;
  warnings: string[];
  shifts: Shift[];
  onApprove: (suggestionId: string) => Promise<void>;
  onApproveAllHigh: () => Promise<void>;
  onReject: (suggestionId: string) => Promise<void>;
  generating: boolean;
  openShiftsCount: number;
  pendingSuggestions: AIRotaSuggestion[];
}

function avatarGradient(id: string) {
  const colors = ['bg-blue-500/20 text-blue-300', 'bg-emerald-500/20 text-emerald-300', 'bg-violet-500/20 text-violet-300', 'bg-orange-500/20 text-orange-300', 'bg-sky-500/20 text-sky-300', 'bg-rose-500/20 text-rose-300'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % colors.length;
  return colors[Math.abs(hash)];
}

function getConfidenceLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'High', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' };
  if (score >= 50) return { label: 'Medium', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' };
  return { label: 'Low', color: 'bg-red-500/15 text-red-400 border-red-500/25' };
}

function suggestionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    open_shift_cover: 'Open shift cover',
    sick_cover: 'Sick cover',
    auto_fill: 'Auto fill',
    overtime_balance: 'Overtime balance',
    conflict_fix: 'Conflict fix',
    predicted_shortage: 'Predicted shortage',
  };
  return map[type] || type.replace(/_/g, ' ');
}

export default function AISuggestionsPanel({
  isOpen,
  onClose,
  suggestions,
  unfillable,
  warnings,
  shifts,
  onApprove,
  onApproveAllHigh,
  onReject,
  generating,
  openShiftsCount,
  pendingSuggestions,
}: Props) {
  const { guards } = useGuards();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const shiftMap = useMemo(() => {
    const map: Record<string, Shift> = {};
    for (const s of shifts) map[s.id] = s;
    return map;
  }, [shifts]);

  const guardMap = useMemo(() => {
    const map: Record<string, any> = {};
    for (const g of guards) map[g.id] = g;
    return map;
  }, [guards]);

  const suggestionMap = useMemo(() => {
    const map: Record<string, AIRotaSuggestion> = {};
    for (const p of pendingSuggestions) map[p.shift_id] = p;
    return map;
  }, [pendingSuggestions]);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      const aiSug = suggestionMap[s.shift_id];
      if (!aiSug) return false;
      if (rejectedIds.has(aiSug.id)) return false;
      if (aiSug.status !== 'pending') return false;
      if (filter === 'all') return true;
      if (filter === 'high') return s.confidence >= 80;
      if (filter === 'medium') return s.confidence >= 50 && s.confidence < 80;
      return s.confidence < 50;
    });
  }, [suggestions, suggestionMap, filter, rejectedIds]);

  const highCount = suggestions.filter((s) => {
    const aiSug = suggestionMap[s.shift_id];
    return s.confidence >= 80 && !rejectedIds.has(aiSug?.id || '') && s.suggested_guard_id && aiSug?.status === 'pending';
  }).length;

  const handleApprove = async (suggestionId: string) => {
    setApprovingId(suggestionId);
    await onApprove(suggestionId);
    setApprovingId(null);
  };

  const handleApproveAll = async () => {
    setApprovingAll(true);
    await onApproveAllHigh();
    setApprovingAll(false);
  };

  const handleReject = async (suggestionId: string) => {
    setRejectedIds((prev) => new Set([...prev, suggestionId]));
    await onReject(suggestionId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#111827] border-l border-gray-800 h-full overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-[#111827] border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-violet-400"><i className="ri-bard-line"></i></div>
              AI Staffing Suggestions
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {generating ? 'Generating suggestions...' : `${filteredSuggestions.length} pending draft${filteredSuggestions.length !== 1 ? 's' : ''} · ${openShiftsCount} open shifts`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        {generating && (
          <div className="flex items-center justify-center py-12 shrink-0">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-400 ml-3">Analysing guards, availability, SIA status...</span>
          </div>
        )}

        {!generating && (
          <div className="flex-1 overflow-y-auto">
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="px-5 pt-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 flex items-center justify-center text-amber-400 shrink-0 mt-0.5"><i className="ri-alert-line text-xs"></i></div>
                    <div className="space-y-1">
                      {warnings.map((w, i) => (
                        <p key={i} className="text-xs text-amber-300">{w}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2">
                {highCount > 0 && (
                  <button
                    onClick={handleApproveAll}
                    disabled={approvingAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-600/30 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {approvingAll && <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>}
                    Approve all high confidence ({highCount})
                  </button>
                )}
                <div className="flex items-center gap-1 ml-auto">
                  {(['all', 'high', 'medium', 'low'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        filter === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="px-5 pt-3 pb-4 space-y-3">
              {filteredSuggestions.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600">
                    <i className="ri-check-double-line text-2xl"></i>
                  </div>
                  <p className="text-sm text-gray-500">No pending draft suggestions match the current filter.</p>
                </div>
              )}

              {filteredSuggestions.map((sug) => {
                const shift = shiftMap[sug.shift_id];
                const guard = sug.suggested_guard_id ? guardMap[sug.suggested_guard_id] : null;
                const conf = getConfidenceLabel(sug.confidence);
                const aiSug = suggestionMap[sug.shift_id];

                if (!shift || !aiSug) return null;

                return (
                  <div key={aiSug.id} className="bg-gray-800/40 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-4">
                      {/* Shift Info */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">{shift.site_name || 'Site'}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${conf.color} font-medium`}>{conf.label} · {sug.confidence}%</span>
                            <span className="text-[10px] text-gray-400 bg-gray-800/60 px-1.5 py-0.5 rounded border border-gray-700">{suggestionTypeLabel(aiSug.suggestion_type)}</span>
                            <span className="text-[10px] text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">Draft</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {shift.start_time ? format(parseISO(shift.start_time), 'EEEE d MMM') : ''} ·{' '}
                            {shift.start_time ? format(parseISO(shift.start_time), 'HH:mm') : ''}–
                            {shift.end_time ? format(parseISO(shift.end_time), 'HH:mm') : ''}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded uppercase">{shift.shift_type || 'day'}</span>
                      </div>

                      {/* Guard Card */}
                      {guard ? (
                        <div className="flex items-center gap-3 bg-gray-800/60 rounded-lg p-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarGradient(guard.id)}`}>
                            {((guard.first_name || '')[0] || '') + ((guard.last_name || '')[0] || '')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {guard.first_name || ''} {guard.last_name || ''}
                            </p>
                            {guard.skills && guard.skills.length > 0 && (
                              <p className="text-[10px] text-gray-500 truncate">{guard.skills.slice(0, 3).join(', ')}{guard.skills.length > 3 ? '...' : ''}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-red-500/5 rounded-lg p-3 mb-3 border border-red-500/10">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                            <i className="ri-question-mark text-xs"></i>
                          </div>
                          <p className="text-xs text-red-300">No suitable guard found</p>
                        </div>
                      )}

                      {/* Reasoning */}
                      {sug.reasoning && (
                        <p className="text-[11px] text-gray-400 italic mb-3 pl-3 border-l-2 border-gray-700">
                          {sug.reasoning}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {guard && (
                          <button
                            onClick={() => handleApprove(aiSug.id)}
                            disabled={approvingId === aiSug.id}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-600/30 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                          >
                            {approvingId === aiSug.id ? (
                              <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
                            ) : (
                              <i className="ri-check-line text-xs"></i>
                            )}
                            Approve and apply
                          </button>
                        )}
                        <button
                          onClick={() => handleReject(aiSug.id)}
                          className="px-3 py-2 rounded-lg bg-gray-800/60 text-gray-400 border border-gray-700 text-xs font-medium hover:text-white hover:border-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Unfillable */}
              {unfillable.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Unfillable shifts</h4>
                  {unfillable.map((u) => {
                    const shift = shiftMap[u.shift_id];
                    if (!shift) return null;
                    return (
                      <div key={u.shift_id} className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{shift.site_name || 'Site'}</span>
                          <span className="text-[10px] text-red-400">Cannot fill</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{u.reason}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}