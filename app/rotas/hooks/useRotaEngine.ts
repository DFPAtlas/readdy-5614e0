import { useMemo } from 'react';
import { format, isSameDay, addDays } from 'date-fns';
import type { Shift } from '@/lib/useShifts';
import type { Guard } from '@/lib/useGuards';
import type { GuardAvailability, GuardTimeOff } from '@/lib/useGuardAvailability';
import { getGuardWeeklyHours, OVERTIME_THRESHOLD, WARNING_THRESHOLD, isGuardAvailable, isGuardOnLeave, isGuardPendingLeave } from '@/lib/useGuardAvailability';

export interface ShiftWarning {
  shiftId: string;
  type: 'conflict' | 'overtime' | 'leave' | 'unavailable' | 'unassigned' | 'no_skills' | 'pending_leave';
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface GuardRotaStats {
  guardId: string;
  name: string;
  totalHours: number;
  shiftCount: number;
  overtime: boolean;
  warning: boolean;
  conflicts: number;
  onLeave: boolean;
  unavailableDays: number;
}

export function useRotaEngine(
  shifts: Shift[],
  guards: Guard[],
  weekStart: Date,
  availability: GuardAvailability[],
  timeOff: GuardTimeOff[],
  pendingTimeOff: GuardTimeOff[] = []
) {
  return useMemo(() => {
    const warnings: ShiftWarning[] = [];
    const guardStats: Record<string, GuardRotaStats> = {};
    const conflicts: Record<string, string[]> = {};

    // Build guard stats
    for (const g of guards) {
      const hours = getGuardWeeklyHours(g.id, shifts, weekStart);
      const count = shifts.filter((s) => s.guard_id === g.id).length;
      const onLeaveThisWeek = timeOff.some((t) => t.guard_id === g.id && t.start_date <= format(addDays(weekStart, 6), 'yyyy-MM-dd') && t.end_date >= format(weekStart, 'yyyy-MM-dd'));
      const unavailDays = availability.filter((a) => a.guard_id === g.id && !a.is_available).length;
      guardStats[g.id] = {
        guardId: g.id,
        name: `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unnamed',
        totalHours: hours,
        shiftCount: count,
        overtime: hours > OVERTIME_THRESHOLD,
        warning: hours > WARNING_THRESHOLD && hours <= OVERTIME_THRESHOLD,
        conflicts: 0,
        onLeave: onLeaveThisWeek,
        unavailableDays: unavailDays,
      };
    }

    // Check each shift for warnings
    for (const shift of shifts) {
      const shiftDate = format(new Date(shift.start_time), 'yyyy-MM-dd');
      const startTime = format(new Date(shift.start_time), 'HH:mm');
      const endTime = format(new Date(shift.end_time), 'HH:mm');

      // Unassigned
      if (!shift.guard_id) {
        warnings.push({
          shiftId: shift.id,
          type: 'unassigned',
          message: 'No guard assigned',
          severity: 'warning',
        });
      }

      if (shift.guard_id) {
        // Check conflicts with other shifts
        const guardShifts = shifts.filter((s) => s.guard_id === shift.guard_id && s.id !== shift.id);
        const sStart = new Date(shift.start_time);
        const sEnd = new Date(shift.end_time);
        for (const other of guardShifts) {
          const oStart = new Date(other.start_time);
          const oEnd = new Date(other.end_time);
          if (sStart < oEnd && sEnd > oStart) {
            warnings.push({
              shiftId: shift.id,
              type: 'conflict',
              message: `Conflicts with shift at ${other.site_name || 'another site'}`,
              severity: 'critical',
            });
            guardStats[shift.guard_id].conflicts++;
            if (!conflicts[shift.guard_id]) conflicts[shift.guard_id] = [];
            if (!conflicts[shift.guard_id].includes(shift.id)) conflicts[shift.guard_id].push(shift.id);
          }
        }

        // Overtime check
        const hours = getGuardWeeklyHours(shift.guard_id, shifts, weekStart);
        if (hours > OVERTIME_THRESHOLD) {
          const existing = warnings.find((w) => w.shiftId === shift.id && w.type === 'overtime');
          if (!existing) {
            warnings.push({
              shiftId: shift.id,
              type: 'overtime',
              message: `${hours.toFixed(1)}h this week — exceeds ${OVERTIME_THRESHOLD}h limit`,
              severity: 'warning',
            });
          }
        }

        // Leave check
        const leave = isGuardOnLeave(shift.guard_id, shiftDate, timeOff);
        if (leave) {
          warnings.push({
            shiftId: shift.id,
            type: 'leave',
            message: `Guard is on ${leave.reason || 'leave'}`,
            severity: 'critical',
          });
        }

        // Pending leave check
        const pendingLeave = isGuardPendingLeave(shift.guard_id, shiftDate, pendingTimeOff);
        if (pendingLeave) {
          warnings.push({
            shiftId: shift.id,
            type: 'pending_leave',
            message: `Pending leave request (${pendingLeave.reason || 'leave'}) — approving would create a gap`,
            severity: 'warning',
          });
        }

        // Availability check
        if (availability.length > 0) {
          const available = isGuardAvailable(shift.guard_id, new Date(shift.start_time), startTime, endTime, availability);
          if (!available) {
            warnings.push({
              shiftId: shift.id,
              type: 'unavailable',
              message: 'Outside guard availability window',
              severity: 'warning',
            });
          }
        }
      }
    }

    // Count warnings by type
    const counts = {
      unassigned: warnings.filter((w) => w.type === 'unassigned').length,
      conflicts: warnings.filter((w) => w.type === 'conflict').length,
      overtime: warnings.filter((w) => w.type === 'overtime').length,
      leave: warnings.filter((w) => w.type === 'leave').length,
      unavailable: warnings.filter((w) => w.type === 'unavailable').length,
      pending_leave: warnings.filter((w) => w.type === 'pending_leave').length,
    };

    const criticalCount = warnings.filter((w) => w.severity === 'critical').length;

    return { warnings, guardStats, conflicts, counts, criticalCount };
  }, [shifts, guards, weekStart, availability, timeOff, pendingTimeOff]);
}

export function getShiftWarnings(shiftId: string, warnings: ShiftWarning[]): ShiftWarning[] {
  return warnings.filter((w) => w.shiftId === shiftId);
}

export function findBestCoverGuard(
  shift: Shift,
  guards: Guard[],
  shifts: Shift[],
  availability: GuardAvailability[],
  timeOff: GuardTimeOff[]
): { guard: Guard | null; score: number; reason: string } {
  const shiftDate = format(new Date(shift.start_time), 'yyyy-MM-dd');
  const startTime = format(new Date(shift.start_time), 'HH:mm');
  const endTime = format(new Date(shift.end_time), 'HH:mm');
  const sStart = new Date(shift.start_time);
  const sEnd = new Date(shift.end_time);

  let best: { guard: Guard | null; score: number; reason: string } = { guard: null, score: 0, reason: 'No suitable guard found' };

  for (const guard of guards) {
    if (guard.status !== 'active') continue;

    // Check time off
    const leave = isGuardOnLeave(guard.id, shiftDate, timeOff);
    if (leave) continue;

    // Check conflicts
    const guardShifts = shifts.filter((s) => s.guard_id === guard.id);
    const hasConflict = guardShifts.some((s) => {
      const oStart = new Date(s.start_time);
      const oEnd = new Date(s.end_time);
      return sStart < oEnd && sEnd > oStart;
    });
    if (hasConflict) continue;

    // Check availability
    if (availability.length > 0) {
      const avail = isGuardAvailable(guard.id, new Date(shift.start_time), startTime, endTime, availability);
      if (!avail) continue;
    }

    // Score based on weekly hours (prefer less busy guards)
    const hours = getGuardWeeklyHours(guard.id, shifts, sStart);
    let score = 100;
    if (hours > OVERTIME_THRESHOLD) score -= 50;
    else if (hours > WARNING_THRESHOLD) score -= 20;
    score -= hours * 2;

    // Bonus for skills match (if site requires skills)
    if (guard.skills && guard.skills.length > 0) {
      score += 10;
    }

    // SIA valid bonus
    const siaValid = guard.sia_expiry && new Date(guard.sia_expiry) > new Date();
    if (siaValid) score += 5;

    if (score > best.score) {
      best = {
        guard,
        score,
        reason: `${hours.toFixed(1)}h this week · ${guard.skills?.length || 0} skills · ${siaValid ? 'SIA valid' : 'SIA check needed'}`,
      };
    }
  }

  return best;
}