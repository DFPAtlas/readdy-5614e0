
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin === o);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

interface Guard { id: string; first_name: string | null; last_name: string | null; skills: string[] | null; sia_expiry: string | null; status: string | null; }
interface Shift { id: string; guard_id: string | null; site_id: string | null; start_time: string; end_time: string; shift_type: string | null; status: string | null; sites: { site_name: string | null; risk_level: string | null } | null; }
interface TimeOff { id: string; guard_id: string; start_date: string; end_date: string; reason: string; }
interface Availability { guard_id: string; day_of_week: number; start_time: string; end_time: string; is_available: boolean; }

function isOnLeave(guardId: string, dateStr: string, timeOff: TimeOff[]): TimeOff | null {
  return timeOff.find((t) => t.guard_id === guardId && t.start_date <= dateStr && t.end_date >= dateStr) || null;
}

function getWeeklyHours(guardId: string, shifts: Shift[], weekStart: Date): number {
  const start = new Date(weekStart); start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  let total = 0;
  for (const s of shifts) {
    if (s.guard_id !== guardId) continue;
    const st = new Date(s.start_time), en = new Date(s.end_time);
    if (st >= start && st < end) total += (en.getTime() - st.getTime()) / 3600000;
  }
  return Math.round(total * 10) / 10;
}

function findBestCover(shift: Shift, guards: Guard[], allShifts: Shift[], timeOff: TimeOff[], excludeGuardId: string): { guard: Guard | null; score: number; reason: string } {
  const shiftDate = shift.start_time.slice(0, 10);
  const sStart = new Date(shift.start_time), sEnd = new Date(shift.end_time);
  let best: { guard: Guard | null; score: number; reason: string } = { guard: null, score: 0, reason: 'No suitable replacement found' };

  for (const guard of guards) {
    if (guard.id === excludeGuardId) continue;
    if (guard.status !== 'active') continue;
    if (isOnLeave(guard.id, shiftDate, timeOff)) continue;
    const hasConflict = allShifts.filter((s) => s.guard_id === guard.id).some((s) => {
      const oStart = new Date(s.start_time), oEnd = new Date(s.end_time);
      return sStart < oEnd && sEnd > oStart;
    });
    if (hasConflict) continue;
    const hours = getWeeklyHours(guard.id, allShifts, sStart);
    let score = 100;
    if (hours > 48) score -= 50; else if (hours > 40) score -= 20;
    score -= hours * 2;
    if (guard.skills && guard.skills.length > 0) score += 10;
    const siaValid = guard.sia_expiry && new Date(guard.sia_expiry) > new Date();
    if (siaValid) score += 5;
    if (score > best.score) {
      best = { guard, score, reason: `${hours.toFixed(1)}h this week - ${guard.skills?.length || 0} skills - ${siaValid ? 'SIA valid' : 'SIA check needed'}` };
    }
  }
  return best;
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabaseAuth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } }
    });
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase
      .from("users").select("company_id, role, status").eq("id", user.id).maybeSingle();

    if (!profile || profile.status !== "active") {
      return new Response(JSON.stringify({ error: "Account is not active" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (!["super_admin", "company_admin", "operations_manager"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const companyId = profile.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const { week_start } = body;
    if (!week_start) {
      return new Response(JSON.stringify({ error: 'week_start required' }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const weekStart = new Date(week_start + 'T00:00:00');
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
    const todayStr = new Date().toISOString().slice(0, 10);

    const { data: guardsData } = await supabase.from('guards').select('id, first_name, last_name, skills, sia_expiry, status').eq('company_id', companyId).eq('status', 'active');
    const guards: Guard[] = guardsData || [];

    const { data: sickLeaveData } = await supabase.from('guard_time_off').select('id, guard_id, start_date, end_date, reason').eq('company_id', companyId).eq('reason', 'sick').gte('end_date', todayStr);
    const sickLeave: TimeOff[] = (sickLeaveData || []).map((t: any) => ({ id: t.id, guard_id: t.guard_id, start_date: t.start_date, end_date: t.end_date, reason: t.reason }));

    const { data: allTimeOffData } = await supabase.from('guard_time_off').select('id, guard_id, start_date, end_date, reason').eq('company_id', companyId).eq('approved', true).gte('end_date', todayStr);
    const allTimeOff: TimeOff[] = (allTimeOffData || []).map((t: any) => ({ id: t.id, guard_id: t.guard_id, start_date: t.start_date, end_date: t.end_date, reason: t.reason }));

    const { data: shiftsData } = await supabase.from('shifts').select('id, guard_id, site_id, start_time, end_time, shift_type, status, sites(site_name, risk_level)').eq('company_id', companyId).gte('start_time', weekStart.toISOString()).lt('start_time', weekEnd.toISOString());
    const shifts: Shift[] = (shiftsData || []).map((row: any) => ({
      id: row.id, guard_id: row.guard_id, site_id: row.site_id, start_time: row.start_time, end_time: row.end_time, shift_type: row.shift_type, status: row.status, sites: row.sites,
    }));

    const affected: Array<{ shift: Shift; sickGuard: Guard; leave: TimeOff; replacement: { guard: Guard | null; score: number; reason: string } }> = [];
    for (const leave of sickLeave) {
      const sickGuard = guards.find((g) => g.id === leave.guard_id);
      if (!sickGuard) continue;
      const affectedShifts = shifts.filter((s) => s.guard_id === leave.guard_id && s.start_time.slice(0, 10) >= leave.start_date && s.start_time.slice(0, 10) <= leave.end_date);
      for (const shift of affectedShifts) {
        affected.push({ shift, sickGuard, leave, replacement: findBestCover(shift, guards, shifts, allTimeOff, leave.guard_id) });
      }
    }

    return new Response(JSON.stringify({
      sick_count: sickLeave.length,
      affected_shifts: affected.length,
      cover_plan: affected.map((a) => ({
        shift_id: a.shift.id,
        site_name: a.shift.sites?.site_name || 'Unknown Site',
        shift_date: a.shift.start_time.slice(0, 10),
        shift_time: `${a.shift.start_time.slice(11, 16)}-${a.shift.end_time.slice(11, 16)}`,
        sick_guard_name: `${a.sickGuard.first_name || ''} ${a.sickGuard.last_name || ''}`.trim(),
        suggested_guard_name: a.replacement.guard ? `${a.replacement.guard.first_name || ''} ${a.replacement.guard.last_name || ''}`.trim() : null,
        score: a.replacement.score,
        reasoning: a.replacement.reason,
      })),
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "An error occurred processing the request" }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
