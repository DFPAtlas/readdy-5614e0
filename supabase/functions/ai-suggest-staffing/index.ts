import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function logStep(supabase: any, companyId: string, step: string, details: any) {
  try {
    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "ai_suggest_staffing_step",
      details: { step, ...details },
    });
  } catch {
    // Silent
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: userProfile } = await supabase.from("users").select("company_id, role").eq("id", user.id).maybeSingle();
    const companyId = userProfile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { week_start_date } = body;
    if (!week_start_date) {
      return new Response(JSON.stringify({ error: "week_start_date required" }), { status: 400, headers: corsHeaders });
    }

    // FIX: Use UTC date math to avoid timezone drift (e.g. BST shifting the boundary by 1 hour)
    const weekStart = new Date(week_start_date + "T00:00:00Z");
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    const weekStartIso = weekStart.toISOString();
    const weekEndIso = weekEnd.toISOString();

    // FIX: Fetch ALL shifts in the week first, then filter unassigned in code.
    // This catches guard_id = null, "", or undefined, and avoids the !inner join issue.
    const { data: weekShifts, error: shiftErr } = await supabase
      .from("shifts")
      .select("id, site_id, guard_id, start_time, end_time, shift_type, status, notes, sites!left(site_name, required_skills, preferred_guard_ids, banned_guard_ids)")
      .eq("company_id", companyId)
      .gte("start_time", weekStartIso)
      .lt("start_time", weekEndIso)
      .order("start_time");

    if (shiftErr) {
      await logStep(supabase, companyId, "fetch_shifts_error", { message: shiftErr.message });
      return new Response(JSON.stringify({ error: `Failed to fetch shifts: ${shiftErr.message}` }), { status: 500, headers: corsHeaders });
    }

    const unassignedShifts = (weekShifts || []).filter(s => !s.guard_id || s.guard_id === "");

    await logStep(supabase, companyId, "fetch_shifts", { total_in_week: weekShifts?.length || 0, unassigned_count: unassignedShifts.length });

    if (unassignedShifts.length === 0) {
      return new Response(JSON.stringify({
        suggestions: [],
        unfillable: [],
        warnings: ["No unassigned shifts this week."],
        shifts_count: 0,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Fetch all active guards
    const { data: guards, error: guardErr } = await supabase
      .from("guards")
      .select("id, first_name, last_name, skills, sia_expiry, status")
      .eq("company_id", companyId)
      .eq("status", "active");

    if (guardErr) {
      await logStep(supabase, companyId, "fetch_guards_error", { message: guardErr.message });
      return new Response(JSON.stringify({ error: `Failed to fetch guards: ${guardErr.message}` }), { status: 500, headers: corsHeaders });
    }

    await logStep(supabase, companyId, "fetch_guards", { count: guards?.length || 0 });

    if (!guards || guards.length === 0) {
      return new Response(JSON.stringify({
        suggestions: [],
        unfillable: [],
        warnings: ["No active guards in company."],
        shifts_count: unassignedShifts.length,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Assigned shifts are just the weekShifts that have a guard_id
    const assignedShifts = (weekShifts || []).filter(s => !!s.guard_id && s.guard_id !== "");

    // 4. Fetch guard availability
    const guardIds = guards.map((g) => g.id);
    const { data: availability } = await supabase
      .from("guard_availability")
      .select("guard_id, day_of_week, start_time, end_time, is_available")
      .in("guard_id", guardIds)
      .eq("is_available", true);

    // 5. Fetch approved time off
    const { data: timeOff } = await supabase
      .from("guard_time_off")
      .select("guard_id, start_date, end_date, reason")
      .in("guard_id", guardIds)
      .eq("approved", true);

    // 6. Fetch sites recently worked (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const { data: recentShifts } = await supabase
      .from("shifts")
      .select("guard_id, site_id, start_time")
      .in("guard_id", guardIds)
      .gte("start_time", ninetyDaysAgo.toISOString())
      .order("start_time", { ascending: false });

    // Build guard recent sites map
    const guardRecentSites: Record<string, string[]> = {};
    for (const rs of recentShifts || []) {
      if (!guardRecentSites[rs.guard_id]) guardRecentSites[rs.guard_id] = [];
      if (!guardRecentSites[rs.guard_id].includes(rs.site_id)) {
        guardRecentSites[rs.guard_id].push(rs.site_id);
      }
    }

    // Build hours per guard
    const guardHours: Record<string, number> = {};
    for (const s of assignedShifts || []) {
      const hrs = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60);
      guardHours[s.guard_id] = (guardHours[s.guard_id] || 0) + hrs;
    }

    // Build guard availability map
    const guardAvailability: Record<string, Array<{ day: number; start: string; end: string }>> = {};
    for (const a of availability || []) {
      if (!guardAvailability[a.guard_id]) guardAvailability[a.guard_id] = [];
      guardAvailability[a.guard_id].push({
        day: a.day_of_week,
        start: a.start_time,
        end: a.end_time,
      });
    }

    // Build guard time off map
    const guardTimeOff: Record<string, Array<{ start: string; end: string; reason: string }>> = {};
    for (const to of timeOff || []) {
      if (!guardTimeOff[to.guard_id]) guardTimeOff[to.guard_id] = [];
      guardTimeOff[to.guard_id].push({
        start: to.start_date,
        end: to.end_date,
        reason: to.reason,
      });
    }

    // Extract site data from shifts
    const shiftSiteData = (s: any) => {
      const site = s.sites;
      if (Array.isArray(site) && site.length > 0) return site[0];
      if (site && typeof site === "object" && !Array.isArray(site)) return site;
      return null;
    };

    // Build structured payload
    const payload = {
      unassigned_shifts: (unassignedShifts || []).map((s: any) => {
        const site = shiftSiteData(s);
        return {
          id: s.id,
          site_name: site?.site_name || "Unknown",
          site_required_skills: site?.required_skills || [],
          site_preferred_guard_ids: site?.preferred_guard_ids || [],
          site_banned_guard_ids: site?.banned_guard_ids || [],
          day: new Date(s.start_time).toLocaleDateString("en-GB", { weekday: "long" }),
          day_of_week: new Date(s.start_time).getDay(),
          date: s.start_time.slice(0, 10),
          start: s.start_time.slice(11, 16),
          end: s.end_time.slice(11, 16),
          shift_type: s.shift_type || "day",
        };
      }),
      guards: guards.map((g) => ({
        id: g.id,
        name: `${g.first_name || ""} ${g.last_name || ""}`.trim() || "Unnamed",
        skills: g.skills || [],
        sia_valid_until: g.sia_expiry,
        hours_already_assigned_this_week: Math.round((guardHours[g.id] || 0) * 10) / 10,
        days_off: (guardTimeOff[g.id] || []).map((to) => ({
          start: to.start,
          end: to.end,
          reason: to.reason,
        })),
        weekly_availability: guardAvailability[g.id] || [],
        sites_recently_worked: guardRecentSites[g.id] || [],
      })),
      constraints: {
        max_hours_per_guard_per_week: 48,
        min_rest_between_shifts_hours: 11,
        prefer_continuity: true,
      },
    };

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      await logStep(supabase, companyId, "openai_missing_key", {});
      return new Response(JSON.stringify({ error: "OpenAI API key not configured. Add OPENAI_API_KEY to edge function secrets." }), { status: 500, headers: corsHeaders });
    }

    // Call OpenAI gpt-4o
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a senior security operations rota planner in the UK. You will receive a JSON payload of unassigned shifts and available guards with their constraints. Your job is to propose guard assignments for as many shifts as possible.

Rules (in priority order):
1. NEVER assign a guard whose SIA licence expires before the shift.
2. NEVER assign a guard who is already booked or on time-off during that shift.
3. NEVER violate working time directive limits (48 hrs/week, 11 hrs rest between shifts).
4. NEVER assign a guard banned from a site.
5. Prefer guards whose skills match the site's required_skills.
6. Prefer guards who've worked the site recently (continuity).
7. Prefer site's preferred_guard_ids.
8. Distribute hours fairly across guards.

Return JSON only, no prose:
{
  "suggestions": [
    {
      "shift_id": "...",
      "suggested_guard_id": "..." or null,
      "confidence": 0-100,
      "reasoning": "short one-sentence reason"
    }
  ],
  "unfillable": [
    {
      "shift_id": "...",
      "reason": "..."
    }
  ],
  "warnings": ["Free-text concerns about the week"]
}`,
          },
          {
            role: "user",
            content: JSON.stringify(payload),
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      await logStep(supabase, companyId, "openai_api_error", { status: resp.status, body: errText.slice(0, 500) });
      return new Response(JSON.stringify({ error: `OpenAI API error (${resp.status}): ${errText.slice(0, 200)}` }), { status: 500, headers: corsHeaders });
    }

    const openaiData = await resp.json();
    const aiText = openaiData.choices?.[0]?.message?.content || "";
    let aiResult: any = { suggestions: [], unfillable: [], warnings: [] };
    try {
      aiResult = JSON.parse(aiText);
    } catch {
      await logStep(supabase, companyId, "openai_json_parse_error", { raw: aiText.slice(0, 500) });
      return new Response(JSON.stringify({ error: "AI returned invalid JSON" }), { status: 500, headers: corsHeaders });
    }

    // Build validation maps
    const validShiftIds = new Set((unassignedShifts || []).map((s) => s.id));
    const validGuardIds = new Set(guards.map((g) => g.id));
    const bannedMap: Record<string, Set<string>> = {};
    for (const s of unassignedShifts || []) {
      const site = shiftSiteData(s);
      bannedMap[s.id] = new Set(site?.banned_guard_ids || []);
    }

    // Validate each suggestion in code
    const validated: any[] = [];
    const assignedGuards = new Set<string>();
    let validationRejects = 0;

    for (const sug of aiResult.suggestions || []) {
      if (!validShiftIds.has(sug.shift_id)) continue;

      if (!sug.suggested_guard_id) {
        validated.push({ ...sug, confidence: 0, reasoning: sug.reasoning || "No suitable guard found" });
        continue;
      }

      if (!validGuardIds.has(sug.suggested_guard_id)) {
        validated.push({ shift_id: sug.shift_id, suggested_guard_id: null, confidence: 0, reasoning: "Suggested guard does not exist" });
        continue;
      }

      const guard = guards.find((g) => g.id === sug.suggested_guard_id);
      const shift = unassignedShifts!.find((s) => s.id === sug.shift_id);
      if (!guard || !shift) continue;

      const shiftDate = new Date(shift.start_time);
      const shiftStart = shiftDate.getTime();
      const shiftEnd = new Date(shift.end_time).getTime();
      const shiftDay = shiftDate.getDay();

      // 1. SIA expiry check
      if (guard.sia_expiry) {
        const exp = new Date(guard.sia_expiry);
        exp.setHours(23, 59, 59, 999);
        if (exp < shiftDate) {
          validated.push({ shift_id: sug.shift_id, suggested_guard_id: null, confidence: 0, reasoning: `Guard SIA expires ${guard.sia_expiry}, before shift date` });
          validationRejects++;
          continue;
        }
      }

      // 2. Time-off check
      let onTimeOff = false;
      const guardOff = guardTimeOff[guard.id] || [];
      for (const to of guardOff) {
        const toStart = new Date(to.start);
        const toEnd = new Date(to.end);
        toEnd.setHours(23, 59, 59, 999);
        if (shiftDate >= toStart && shiftDate <= toEnd) {
          onTimeOff = true;
          break;
        }
      }
      if (onTimeOff) {
        validated.push({ shift_id: sug.shift_id, suggested_guard_id: null, confidence: 0, reasoning: "Guard is on approved time off" });
        validationRejects++;
        continue;
      }

      // 3. Weekly hours check
      const shiftHours = (shiftEnd - shiftStart) / (1000 * 60 * 60);
      const projectedHours = (guardHours[guard.id] || 0) + shiftHours;
      if (projectedHours > 48) {
        validated.push({ shift_id: sug.shift_id, suggested_guard_id: null, confidence: 0, reasoning: `Would exceed 48 hrs/week (${projectedHours.toFixed(1)}h projected)` });
        validationRejects++;
        continue;
      }

      // 4. Banned check
      if (bannedMap[sug.shift_id]?.has(guard.id)) {
        validated.push({ shift_id: sug.shift_id, suggested_guard_id: null, confidence: 0, reasoning: "Guard is banned from this site by client request" });
        validationRejects++;
        continue;
      }

      // 5. Rest between shifts (11 hours)
      const guardAssigned = assignedShifts || [];
      let restViolation = false;
      for (const gs of guardAssigned) {
        if (gs.guard_id !== guard.id) continue;
        const gsStart = new Date(gs.start_time).getTime();
        const gsEnd = new Date(gs.end_time).getTime();
        const gapBefore = (shiftStart - gsEnd) / (1000 * 60 * 60);
        const gapAfter = (gsStart - shiftEnd) / (1000 * 60 * 60);
        if ((gapBefore > 0 && gapBefore < 11) || (gapAfter > 0 && gapAfter < 11)) {
          restViolation = true;
          break;
        }
      }
      if (restViolation) {
        validated.push({ shift_id: sug.shift_id, suggested_guard_id: null, confidence: 0, reasoning: "Would violate 11-hour rest between shifts" });
        validationRejects++;
        continue;
      }

      // 6. Weekly availability check
      const avail = guardAvailability[guard.id] || [];
      const dayAvail = avail.filter((a) => a.day === shiftDay);
      let availMatch = dayAvail.length === 0;
      for (const da of dayAvail) {
        if (shift.start_time.slice(11, 16) >= da.start && shift.end_time.slice(11, 16) <= da.end) {
          availMatch = true;
          break;
        }
      }
      if (!availMatch) {
        validated.push({ shift_id: sug.shift_id, suggested_guard_id: null, confidence: 0, reasoning: "Outside guard's stated weekly availability" });
        validationRejects++;
        continue;
      }

      validated.push(sug);
      assignedGuards.add(guard.id);
    }

    const fillableCount = validated.filter((v) => v.suggested_guard_id && v.confidence > 0).length;

    // Log final result
    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "staffing_suggestion",
      details: {
        week_start: week_start_date,
        shifts_requested: unassignedShifts?.length || 0,
        suggestions_generated: fillableCount,
        validation_rejects: validationRejects,
        unfillable_count: (aiResult.unfillable || []).length,
      },
    });

    return new Response(
      JSON.stringify({
        suggestions: validated,
        unfillable: aiResult.unfillable || [],
        warnings: aiResult.warnings || [],
        shifts_count: unassignedShifts?.length || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});