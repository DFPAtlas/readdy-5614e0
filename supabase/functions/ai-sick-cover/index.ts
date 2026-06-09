import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Guard {
  id: string;
  first_name: string | null;
  last_name: string | null;
  skills: string[] | null;
  sia_expiry: string | null;
  status: string | null;
}

interface Shift {
  id: string;
  guard_id: string | null;
  site_id: string | null;
  start_time: string;
  end_time: string;
  shift_type: string | null;
  status: string | null;
  sites: { site_name: string | null; risk_level: string | null } | null;
}

interface TimeOff {
  id: string;
  guard_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

interface Availability {
  guard_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

function normalizeDay(d: number): number {
  if (d >= 1 && d <= 7) return d - 1;
  if (d >= 0 && d <= 6) return d;
  return 0;
}

function isGuardAvailable(
  guardId: string,
  date: Date,
  startTime: string,
  endTime: string,
  availability: Availability[]
): boolean {
  const day = date.getDay();
  const weekDay = day === 0 ? 6 : day - 1;
  const patterns = availability.filter((a) => a.guard_id === guardId && a.day_of_week === weekDay);
  if (patterns.length === 0) return true;
  const availablePatterns = patterns.filter((a) => a.is_available);
  if (availablePatterns.length === 0) return false;
  return availablePatterns.some(
    (p) => p.start_time <= startTime.slice(0, 5) && p.end_time >= endTime.slice(0, 5)
  );
}

function isOnLeave(guardId: string, dateStr: string, timeOff: TimeOff[]): TimeOff | null {
  return timeOff.find((t) => t.guard_id === guardId && t.start_date <= dateStr && t.end_date >= dateStr) || null;
}

function getWeeklyHours(
  guardId: string,
  shifts: Shift[],
  weekStart: Date
): number {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  let total = 0;
  for (const s of shifts) {
    if (s.guard_id !== guardId) continue;
    const st = new Date(s.start_time);
    const en = new Date(s.end_time);
    if (st >= start && st < end) {
      total += (en.getTime() - st.getTime()) / (1000 * 60 * 60);
    }
  }
  return Math.round(total * 10) / 10;
}

function findBestCover(
  shift: Shift,
  guards: Guard[],
  allShifts: Shift[],
  availability: Availability[],
  timeOff: TimeOff[],
  excludeGuardId: string
): { guard: Guard | null; score: number; reason: string } {
  const shiftDate = shift.start_time.slice(0, 10);
  const startTime = shift.start_time.slice(11, 16);
  const endTime = shift.end_time.slice(11, 16);
  const sStart = new Date(shift.start_time);
  const sEnd = new Date(shift.end_time);

  let best: { guard: Guard | null; score: number; reason: string } = {
    guard: null,
    score: 0,
    reason: 'No suitable replacement found',
  };

  for (const guard of guards) {
    if (guard.id === excludeGuardId) continue;
    if (guard.status !== 'active') continue;

    const leave = isOnLeave(guard.id, shiftDate, timeOff);
    if (leave) continue;

    const guardShifts = allShifts.filter((s) => s.guard_id === guard.id);
    const hasConflict = guardShifts.some((s) => {
      const oStart = new Date(s.start_time);
      const oEnd = new Date(s.end_time);
      return sStart < oEnd && sEnd > oStart;
    });
    if (hasConflict) continue;

    if (availability.length > 0) {
      const avail = isGuardAvailable(guard.id, sStart, startTime, endTime, availability);
      if (!avail) continue;
    }

    const hours = getWeeklyHours(guard.id, allShifts, sStart);
    let score = 100;
    if (hours > 48) score -= 50;
    else if (hours > 40) score -= 20;
    score -= hours * 2;

    if (guard.skills && guard.skills.length > 0) score += 10;

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { company_id, week_start } = await req.json();
    if (!company_id || !week_start) {
      return new Response(JSON.stringify({ error: 'company_id and week_start required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRole);

    const weekStart = new Date(week_start + 'T00:00:00');
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Get all active guards
    const { data: guardsData } = await supabase
      .from('guards')
      .select('id, first_name, last_name, skills, sia_expiry, status')
      .eq('company_id', company_id)
      .eq('status', 'active');
    const guards: Guard[] = guardsData || [];

    // 2. Get sick leave in this period
    const { data: sickLeaveData } = await supabase
      .from('guard_time_off')
      .select('id, guard_id, start_date, end_date, reason')
      .eq('company_id', company_id)
      .eq('reason', 'sick')
      .gte('end_date', todayStr)
      .lte('start_date', week_start.slice(0, 10) + 'T23:59:59');
    const sickLeave: TimeOff[] = (sickLeaveData || []).map((t: any) => ({
      id: t.id,
      guard_id: t.guard_id,
      start_date: t.start_date,
      end_date: t.end_date,
      reason: t.reason,
    }));

    // 3. Get all approved time off
    const { data: allTimeOffData } = await supabase
      .from('guard_time_off')
      .select('id, guard_id, start_date, end_date, reason')
      .eq('company_id', company_id)
      .eq('approved', true)
      .gte('end_date', todayStr);
    const allTimeOff: TimeOff[] = (allTimeOffData || []).map((t: any) => ({
      id: t.id,
      guard_id: t.guard_id,
      start_date: t.start_date,
      end_date: t.end_date,
      reason: t.reason,
    }));

    // 4. Get availability
    const guardIds = guards.map((g) => g.id);
    let availability: Availability[] = [];
    if (guardIds.length > 0) {
      const { data: availData } = await supabase
        .from('guard_availability')
        .select('guard_id, day_of_week, start_time, end_time, is_available')
        .in('guard_id', guardIds);
      availability = (availData || []).map((a: any) => ({
        guard_id: a.guard_id,
        day_of_week: normalizeDay(a.day_of_week),
        start_time: a.start_time?.slice(0, 5) || '00:00',
        end_time: a.end_time?.slice(0, 5) || '23:59',
        is_available: a.is_available ?? true,
      }));
    }

    // 5. Get shifts in the week
    const { data: shiftsData } = await supabase
      .from('shifts')
      .select('id, guard_id, site_id, start_time, end_time, shift_type, status, sites(site_name, risk_level)')
      .eq('company_id', company_id)
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString());
    const shifts: Shift[] = (shiftsData || []).map((row: any) => ({
      id: row.id,
      guard_id: row.guard_id,
      site_id: row.site_id,
      start_time: row.start_time,
      end_time: row.end_time,
      shift_type: row.shift_type,
      status: row.status,
      sites: row.sites,
    }));

    // 6. Find shifts affected by sick leave
    const affected: Array<{
      shift: Shift;
      sickGuard: Guard;
      leave: TimeOff;
      replacement: { guard: Guard | null; score: number; reason: string };
    }> = [];

    for (const leave of sickLeave) {
      const sickGuard = guards.find((g) => g.id === leave.guard_id);
      if (!sickGuard) continue;

      const affectedShifts = shifts.filter((s) => {
        if (s.guard_id !== leave.guard_id) return false;
        const shiftDate = s.start_time.slice(0, 10);
        return shiftDate >= leave.start_date && shiftDate <= leave.end_date;
      });

      for (const shift of affectedShifts) {
        const replacement = findBestCover(shift, guards, shifts, availability, allTimeOff, leave.guard_id);
        affected.push({ shift, sickGuard, leave, replacement });
      }
    }

    // 7. Build response
    const response = {
      sick_count: sickLeave.length,
      affected_shifts: affected.length,
      cover_plan: affected.map((a) => ({
        shift_id: a.shift.id,
        site_name: a.shift.sites?.site_name || 'Unknown Site',
        shift_date: a.shift.start_time.slice(0, 10),
        shift_time: `${a.shift.start_time.slice(11, 16)}–${a.shift.end_time.slice(11, 16)}`,
        shift_type: a.shift.shift_type || 'day',
        sick_guard_name: `${a.sickGuard.first_name || ''} ${a.sickGuard.last_name || ''}`.trim() || 'Unknown',
        sick_guard_id: a.sickGuard.id,
        leave_start: a.leave.start_date,
        leave_end: a.leave.end_date,
        suggested_guard_id: a.replacement.guard?.id || null,
        suggested_guard_name: a.replacement.guard
          ? `${a.replacement.guard.first_name || ''} ${a.replacement.guard.last_name || ''}`.trim()
          : null,
        score: a.replacement.score,
        reasoning: a.replacement.reason,
        confidence: a.replacement.guard ? Math.min(100, Math.max(0, a.replacement.score)) : 0,
      })),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
