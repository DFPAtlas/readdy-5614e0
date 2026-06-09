import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export interface RotaActivityStats {
  openShifts: number;
  pendingSuggestions: number;
  conflicts: number;
  overtimeWarnings: number;
  actionsThisWeek: number;
  sickCoverSuggestions: number;
  loading: boolean;
  error: string | null;
}

function getWeeklyHours(guardId: string, shifts: any[], weekStart: Date): number {
  const ws = startOfWeek(weekStart, { weekStartsOn: 1 });
  const we = endOfWeek(weekStart, { weekStartsOn: 1 });
  let total = 0;
  for (const s of shifts) {
    if (!s.guard_id || s.guard_id !== guardId) continue;
    const start = new Date(s.start_time);
    if (start >= ws && start <= we) {
      const hours = (new Date(s.end_time).getTime() - start.getTime()) / (1000 * 60 * 60);
      total += Math.max(0, hours);
    }
  }
  return total;
}

const OVERTIME_THRESHOLD = 48;

export function useAIRotaActivity() {
  const [stats, setStats] = useState<RotaActivityStats>({
    openShifts: 0,
    pendingSuggestions: 0,
    conflicts: 0,
    overtimeWarnings: 0,
    actionsThisWeek: 0,
    sickCoverSuggestions: 0,
    loading: false,
    error: null,
  });

  const fetchStats = useCallback(async (companyId: string, weekStart: Date, weekEnd: Date) => {
    setStats(s => ({ ...s, loading: true, error: null }));

    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

      // Open shifts this week (no guard assigned)
      const { count: openShiftCount, error: openErr } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .is('guard_id', null)
        .gte('start_time', `${weekStartStr}T00:00:00Z`)
        .lte('start_time', `${weekEndStr}T23:59:59Z`);

      if (openErr) throw openErr;

      // Pending AI suggestions
      const { count: pendingCount, error: pendingErr } = await supabase
        .from('ai_rota_suggestions')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending');

      if (pendingErr) throw pendingErr;

      // Rota conflicts this week
      const { count: conflictCount, error: conflictErr } = await supabase
        .from('rota_conflicts')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', `${weekStartStr}T00:00:00Z`)
        .lte('created_at', `${weekEndStr}T23:59:59Z`);

      if (conflictErr) throw conflictErr;

      // Fetch shifts and guards to calculate overtime
      const { data: weekShifts, error: shiftErr } = await supabase
        .from('shifts')
        .select('guard_id, start_time, end_time')
        .eq('company_id', companyId)
        .not('guard_id', 'is', null)
        .gte('start_time', `${weekStartStr}T00:00:00Z`)
        .lte('start_time', `${weekEndStr}T23:59:59Z`);

      if (shiftErr) throw shiftErr;

      const { data: companyGuards, error: guardErr } = await supabase
        .from('guards')
        .select('id')
        .eq('company_id', companyId);

      if (guardErr) throw guardErr;

      let overtimeCount = 0;
      for (const g of (companyGuards || [])) {
        const hours = getWeeklyHours(g.id, weekShifts || [], weekStart);
        if (hours > OVERTIME_THRESHOLD) overtimeCount++;
      }

      // Sick cover suggestions (pending with type sick_cover)
      const { count: sickCount, error: sickErr } = await supabase
        .from('ai_rota_suggestions')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .eq('suggestion_type', 'sick_cover');

      if (sickErr) throw sickErr;

      // Activity logs this week for rota actions
      const { count: activityCount, error: actErr } = await supabase
        .from('ai_activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .in('action_type', [
          'ai_rota_suggestions_generated',
          'ai_sick_cover_generated',
          'ai_rota_suggestion_approved',
          'ai_rota_suggestion_rejected',
          'ai_rota_suggestion_applied',
        ])
        .gte('created_at', `${weekStartStr}T00:00:00Z`)
        .lte('created_at', `${weekEndStr}T23:59:59Z`);

      if (actErr) throw actErr;

      setStats({
        openShifts: openShiftCount || 0,
        pendingSuggestions: pendingCount || 0,
        conflicts: conflictCount || 0,
        overtimeWarnings: overtimeCount,
        sickCoverSuggestions: sickCount || 0,
        actionsThisWeek: activityCount || 0,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setStats(s => ({ ...s, loading: false, error: err.message }));
    }
  }, []);

  return { stats, fetchStats };
}