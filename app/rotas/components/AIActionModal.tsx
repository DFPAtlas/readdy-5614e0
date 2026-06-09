'use client';

import { useState, useEffect } from 'react';
import type { Shift } from '@/lib/useShifts';
import type { Guard } from '@/lib/useGuards';
import type { GuardAvailability, GuardTimeOff } from '@/lib/useGuardAvailability';
import { findBestCoverGuard } from '@/app/rotas/hooks/useRotaEngine';

interface AIActionModalProps {
  actionKey: string;
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  guards: Guard[];
  availability: GuardAvailability[];
  timeOff: GuardTimeOff[];
  onApplyChanges: (assignments: Array<{ shiftId: string; guardId: string }>) => Promise<void>;
}

export default function AIActionModal({
  actionKey,
  isOpen,
  onClose,
  shifts,
  guards,
  availability,
  timeOff,
  onApplyChanges,
}: AIActionModalProps) {
  const [step, setStep] = useState<'analysing' | 'results' | 'done'>('analysing');
  const [results, setResults] = useState<Array<{ shiftId: string; guardId: string; guardName: string; siteName: string; time: string; reason: string; score: number }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep('analysing');
    setResults([]);
    setSelected(new Set());

    const timer = setTimeout(() => {
      if (actionKey === 'autofill' || actionKey === 'cover') {
        const open = shifts.filter((s) => !s.guard_id);
        const computed = open.map((shift) => {
          const best = findBestCoverGuard(shift, guards, shifts, availability, timeOff);
          return {
            shiftId: shift.id,
            guardId: best.guard?.id || '',
            guardName: best.guard ? `${best.guard.first_name} ${best.guard.last_name}` : 'No match',
            siteName: shift.site_name || 'Site',
            time: `${new Date(shift.start_time).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })} ${new Date(shift.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}–${new Date(shift.end_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
            reason: best.reason,
            score: best.score,
          };
        }).filter((r) => r.guardId);
        setResults(computed);
        setSelected(new Set(computed.map((r) => r.shiftId)));
      } else {
        setResults([]);
      }
      setStep('results');
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen, actionKey, shifts, guards, availability, timeOff]);

  const handleApply = async () => {
    const toApply = results.filter((r) => selected.has(r.shiftId) && r.guardId);
    if (toApply.length === 0) return;
    setApplying(true);
    await onApplyChanges(toApply.map((r) => ({ shiftId: r.shiftId, guardId: r.guardId })));
    setApplying(false);
    setStep('done');
  };

  const toggleSelection = (shiftId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(shiftId)) next.delete(shiftId);
      else next.add(shiftId);
      return next;
    });
  };

  const actionTitle = (() => {
    switch (actionKey) {
      case 'autofill': return 'Auto-fill Open Shifts';
      case 'cover': return 'Find Best Cover';
      case 'travel': return 'Optimise Travel';
      case 'balance': return 'Balance Overtime';
      case 'predict': return 'Predict Staffing Shortages';
      default: return 'AI Action';
    }
  })();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#111827] border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center text-violet-400">
              <i className="ri-bard-line"></i>
            </div>
            {actionTitle}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          {step === 'analysing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-400">Analysing guards, availability, and shift patterns...</p>
            </div>
          )}

          {step === 'results' && results.length === 0 && (
            <div className="text-center py-12">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-lg bg-gray-800/50">
                <i className="ri-check-double-line text-gray-500 text-xl" />
              </div>
              <p className="text-sm text-gray-300">No changes needed or no suitable matches found.</p>
            </div>
          )}

          {step === 'results' && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-3">
                Found {results.length} recommendation{results.length > 1 ? 's' : ''}. Select which to apply:
              </p>
              {results.map((r) => {
                const isSelected = selected.has(r.shiftId);
                return (
                  <div
                    key={r.shiftId}
                    onClick={() => toggleSelection(r.shiftId)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-600/10 border-violet-500/30'
                        : 'bg-gray-800/40 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-violet-500 border-violet-500' : 'border-gray-600'
                    }`}>
                      {isSelected && <i className="ri-check-line text-white text-xs" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{r.siteName}</span>
                        <span className="text-[10px] text-gray-500">{r.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-violet-300 font-medium">{r.guardName}</span>
                        <span className="text-[10px] text-gray-500">Score: {r.score}%</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{r.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/15 mb-4">
                <i className="ri-check-line text-emerald-400 text-xl" />
              </div>
              <p className="text-sm text-emerald-400 font-medium">Changes applied successfully</p>
              <p className="text-xs text-gray-500 mt-1">{selected.size} assignment{selected.size !== 1 ? 's' : ''} updated</p>
            </div>
          )}
        </div>

        {step === 'results' && results.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {selected.size} of {results.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || selected.size === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {applying && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Apply {selected.size} changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}