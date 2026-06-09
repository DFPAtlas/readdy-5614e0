'use client';

import { useMemo } from 'react';
import { format, addDays } from 'date-fns';
import type { Shift } from '@/lib/useShifts';
import type { GuardTimeOff } from '@/lib/useGuardAvailability';
import type { AIRotaSuggestion } from '@/lib/useAIRotaSuggestions';
import type { SickCoverResponse } from '@/lib/useSickCover';

export interface AITestStatus {
  message: string;
  type: 'success' | 'error';
}

interface Props {
  weekStart: Date;
  shifts: Shift[];
  counts: {
    unassigned: number;
    conflicts: number;
    overtime: number;
    leave: number;
    unavailable: number;
    pending_leave?: number;
  };
  criticalCount: number;
  pendingSuggestions: AIRotaSuggestion[];
  sickCoverData: SickCoverResponse | null;
  timeOff: GuardTimeOff[];
  onGenerateAI?: () => void;
  onOpenSickCover?: () => void;
  onOpenSuggestions?: () => void;
  onApproveAllHigh?: () => void;
  onOpenConflicts?: () => void;
  onTestAIConnection?: () => void;
  generating: boolean;
  approvingAll: boolean;
  canApprove: boolean;
  lastAIError?: string | null;
  aiTestStatus?: AITestStatus | null;
  weekIsLocked?: boolean;
}

function StatusBadge({ status }: { status: 'green' | 'amber' | 'red' }) {
  if (status === 'green') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/25 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        All Clear
      </span>
    );
  }
  if (status === 'red') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border bg-red-500/15 text-red-400 border-red-500/25 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
        Needs Attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/25 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      Review Needed
    </span>
  );
}

function QuickButton({
  onClick,
  disabled,
  loading,
  icon,
  label,
  variant,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon: string;
  label: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success';
}) {
  const styles = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white border-transparent',
    secondary: 'bg-gray-800/60 hover:bg-gray-800 text-gray-300 border-gray-700 hover:text-white',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30',
    success: 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${styles[variant]}`}
    >
      {loading && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin inline-block"></span>}
      <span className={`w-3.5 h-3.5 flex items-center justify-center ${variant === 'primary' ? 'text-white' : ''}`}>
        <i className={`${icon} text-xs`}></i>
      </span>
      {label}
    </button>
  );
}

function MetricPill({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-800">
      <span className={`w-4 h-4 flex items-center justify-center ${color}`}>
        <i className={`${icon} text-xs`}></i>
      </span>
      <div className="flex flex-col leading-none">
        <span className={`text-sm font-bold ${color}`}>{value}</span>
        <span className="text-[10px] text-gray-500">{label}</span>
      </div>
    </div>
  );
}

export default function AIRotaSummaryPanel({
  weekStart,
  shifts,
  counts,
  criticalCount,
  pendingSuggestions,
  sickCoverData,
  timeOff,
  onGenerateAI,
  onOpenSickCover,
  onOpenSuggestions,
  onApproveAllHigh,
  onOpenConflicts,
  onTestAIConnection,
  generating,
  approvingAll,
  canApprove,
  lastAIError,
  aiTestStatus,
  weekIsLocked,
}: Props) {
  const guardsOnLeave = useMemo(() => {
    const weekEnd = addDays(weekStart, 6);
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const guardsSet = new Set<string>();
    for (const t of timeOff) {
      if (t.end_date >= weekStartStr && t.start_date <= weekEndStr) {
        guardsSet.add(t.guard_id);
      }
    }
    return guardsSet.size;
  }, [timeOff, weekStart]);

  const sickCount = sickCoverData?.sick_count ?? 0;
  const pendingCount = pendingSuggestions.length;
  const unassignedCount = counts.unassigned;
  const conflictsCount = counts.conflicts;
  const overtimeCount = counts.overtime;

  const hasExpiredSIA = useMemo(() => {
    return shifts.some((s) => {
      if (!s.guard_id) return false;
      return false;
    });
  }, [shifts]);

  const status: 'green' | 'amber' | 'red' = useMemo(() => {
    if (
      criticalCount > 0 ||
      conflictsCount > 0 ||
      sickCount > 0 ||
      hasExpiredSIA
    ) {
      return 'red';
    }
    if (
      unassignedCount > 0 ||
      overtimeCount > 0 ||
      pendingCount > 0 ||
      guardsOnLeave > 0
    ) {
      return 'amber';
    }
    return 'green';
  }, [criticalCount, conflictsCount, sickCount, hasExpiredSIA, unassignedCount, overtimeCount, pendingCount, guardsOnLeave]);

  const highConfidenceCount = useMemo(() => {
    return pendingSuggestions.filter(
      (s) => s.suggested_guard_id && (s.confidence ?? 0) >= 80 && s.status === 'pending'
    ).length;
  }, [pendingSuggestions]);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 flex items-center justify-center text-violet-400">
                <i className="ri-robot-2-line text-lg"></i>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-white">AI Rota Helper</h2>
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-gray-500">
                Week of {format(weekStart, 'd MMM')} — AI suggestions require approval before changing the live rota
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onGenerateAI && (
              <QuickButton
                onClick={onGenerateAI}
                loading={generating}
                icon="ri-bard-line"
                label="Generate AI Suggestions"
                variant="primary"
              />
            )}
            {!onGenerateAI && weekIsLocked && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-400 text-xs">
                <span className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-lock-line"></i></span>
                AI Suggestions Locked — rota is published
              </div>
            )}
            {!onGenerateAI && !weekIsLocked && (
              <QuickButton
                onClick={() => {}}
                disabled
                icon="ri-lock-line"
                label="AI Suggestions Locked"
                variant="secondary"
              />
            )}
          </div>
        </div>
      </div>

      {lastAIError && (
        <div className="px-5 pt-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-red-400 shrink-0 mt-0.5"><i className="ri-error-warning-line text-xs"></i></span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-300">AI suggestion failed</p>
              <p className="text-[11px] text-red-400/80 mt-0.5">{lastAIError}</p>
            </div>
          </div>
        </div>
      )}

      {aiTestStatus && (
        <div className="px-5 pt-4">
          {aiTestStatus.type === 'error' ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-red-400 shrink-0 mt-0.5"><i className="ri-error-warning-line text-xs"></i></span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-red-300">AI connection test failed</p>
                <p className="text-[11px] text-red-400/80 mt-0.5">{aiTestStatus.message}</p>
                {onTestAIConnection && (
                  <button
                    onClick={onTestAIConnection}
                    className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500/25 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-stethoscope-line text-[10px]"></i>
                    Re-test AI connection
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5"><i className="ri-check-line text-xs"></i></span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-emerald-300">AI connection verified</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">{aiTestStatus.message}</p>
                <p className="text-[10px] text-emerald-500/70 mt-1">Try clicking Generate AI Suggestions again.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          <MetricPill
            icon="ri-calendar-todo-line"
            label="Open Shifts"
            value={unassignedCount}
            color={unassignedCount > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <MetricPill
            icon="ri-error-warning-line"
            label="Conflicts"
            value={conflictsCount}
            color={conflictsCount > 0 ? 'text-red-400' : 'text-emerald-400'}
          />
          <MetricPill
            icon="ri-time-line"
            label="Overtime"
            value={overtimeCount}
            color={overtimeCount > 0 ? 'text-orange-400' : 'text-emerald-400'}
          />
          <MetricPill
            icon="ri-hospital-line"
            label="On Leave"
            value={guardsOnLeave}
            color={guardsOnLeave > 0 ? 'text-blue-400' : 'text-emerald-400'}
          />
          <MetricPill
            icon="ri-first-aid-kit-line"
            label="Sick Cover Needed"
            value={sickCount}
            color={sickCount > 0 ? 'text-red-400' : 'text-emerald-400'}
          />
          <MetricPill
            icon="ri-draft-line"
            label="Pending Suggestions"
            value={pendingCount}
            color={pendingCount > 0 ? 'text-violet-400' : 'text-emerald-400'}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canApprove && highConfidenceCount > 0 && onApproveAllHigh && (
            <QuickButton
              onClick={onApproveAllHigh}
              loading={approvingAll}
              icon="ri-check-double-line"
              label={`Approve all high confidence (${highConfidenceCount})`}
              variant="success"
            />
          )}
          {onOpenSickCover && (
            <QuickButton
              onClick={onOpenSickCover}
              disabled={sickCount === 0}
              icon="ri-first-aid-kit-line"
              label="Find Sick Cover"
              variant="danger"
            />
          )}
          {onOpenConflicts && (
            <QuickButton
              onClick={onOpenConflicts}
              disabled={conflictsCount === 0}
              icon="ri-error-warning-line"
              label="Check Conflicts"
              variant="secondary"
            />
          )}
          {pendingCount > 0 && onOpenSuggestions && (
            <QuickButton
              onClick={onOpenSuggestions}
              icon="ri-draft-line"
              label={`View Pending (${pendingCount})`}
              variant="secondary"
            />
          )}
        </div>
      </div>

      {status === 'red' && (
        <div className="px-5 py-3 bg-red-500/5 border-t border-red-500/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs text-red-300 font-medium">
              Critical issues detected — review conflicts, open shifts, and sick cover before the rota goes live
            </span>
          </div>
        </div>
      )}

      {status === 'amber' && (
        <div className="px-5 py-3 bg-amber-500/5 border-t border-amber-500/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-xs text-amber-300">
              {unassignedCount > 0 ? `${unassignedCount} open shift${unassignedCount !== 1 ? 's' : ''} need${unassignedCount === 1 ? 's' : ''} assignment. ` : ''}
              {pendingCount > 0 ? `${pendingCount} AI suggestion${pendingCount !== 1 ? 's' : ''} waiting for approval. ` : ''}
              AI will not change live shifts until you approve them.
            </span>
          </div>
        </div>
      )}

      {status === 'green' && (
        <div className="px-5 py-3 bg-emerald-500/5 border-t border-emerald-500/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-emerald-300">
              Rota is fully covered this week. All shifts have guards assigned and no warnings detected.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}