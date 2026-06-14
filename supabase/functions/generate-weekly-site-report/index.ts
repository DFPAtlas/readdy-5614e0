import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function generateFallbackSummary(data: any): string {
  return `EXECUTIVE SUMMARY\nThis week at ${data.site_name} operations ran ${data.patrols.percentage >= 90 ? "smoothly" : "with some challenges"}. ${data.incidents.total === 0 ? "No incidents were recorded." : `${data.incidents.total} incident${data.incidents.total > 1 ? "s were" : " was"} logged, ${data.incidents.open > 0 ? `with ${data.incidents.open} still open.` : "all now resolved or under review."}`}\n\nKEY METRICS\n- Patrol completion: ${data.patrols.completed} of ${data.patrols.scheduled} (${data.patrols.percentage}%)\n- Shifts scheduled: ${data.shifts.total} (${data.shifts.completed} completed, ${data.shifts.missed} missed, ${data.shifts.no_show} no-show)\n- Hours of cover: ${data.hours_covered}\n- Incidents: ${data.incidents.total} (${data.incidents.by_severity.critical} critical, ${data.incidents.by_severity.high} high, ${data.incidents.by_severity.medium} medium, ${data.incidents.by_severity.low} low)\n- Open issues: ${data.incidents.open}\n\nNOTABLE INCIDENTS\n${data.incidents.notable.length === 0 ? "No incidents above Low severity were recorded this week." : data.incidents.notable.map((i: any, idx: number) => `${idx + 1}. ${i.date} \u2014 ${i.type} (${i.severity.toUpperCase()}) \u2014 ${i.status}. ${i.summary}`).join("\n")}\n\nOPERATIONAL HIGHLIGHTS\n${data.occurrence_book.notable.length === 0 ? "No notable occurrence book entries this week." : data.occurrence_book.notable.map((o: any, idx: number) => `${idx + 1}. ${o.date} \u2014 ${o.type}: ${o.summary}`).join("\n")}\n\nRECOMMENDATIONS\n${data.patrols.percentage < 90 ? "- Review patrol completion rates and identify any barriers to full completion.\n" : ""}${data.incidents.open > 0 ? "- Follow up on open incidents to ensure timely resolution.\n" : ""}${data.shifts.no_show > 0 ? "- Investigate no-show shifts and consider back-up guard arrangements.\n" : ""}- Continue current security posture and review next week.`;
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  const b = parseInt(c, 16);
  return { r: ((b >> 16) & 255) / 255, g: ((b >> 8) & 255) / 255, b: (b & 255) / 255 };
}

function drawBlock(page: any, y: number, title: string, x: number, w: number, bold: any, normal: any) {
  page.drawText(title, { x, y, size: 14, font: bold, color: rgb(0.15, 0.15, 0.15) });
  y -= 16;
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 10;
  return y;
}

function drawWrappedText(page: any, text: string, x: number, y: number, maxW: number, size: number, font: any, color: any) {
  const words = text.split(/\s+/);
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      page.drawText(line, { x, y, size, font, color });
      y -= size + 3;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) { page.drawText(line, { x, y, size, font, color }); y -= size + 3; }
  return y;
}

function parseAiSummary(text: string): { title: string; body: string }[] {
  const lines = text.split("\n");
  const out: { title: string; body: string }[] = [];
  let cur = { title: "", body: "" };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    if (l.toUpperCase() === l && l.length < 40 && !l.startsWith("-") && !l.startsWith("\u00b7")) {
      if (cur.title) out.push(cur);
      cur = { title: l, body: "" };
    } else {
      cur.body += l + "\n";
    }
  }
  if (cur.title) out.push(cur);
  if (out.length === 0) out.push({ title: "Summary", body: text });
  return out;
}

async function generateWeeklyPDF(ctx: any): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import("https://esm.sh/pdf-lib@1.17.1");
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const brandColor = ctx.company?.brand_color || "#3b82f6";
  const brandRgb = hexToRgb(brandColor);
  const MARGIN = 50;
  const PAGE_W = 595;
  const PAGE_H = 842;
  const UW = PAGE_W - MARGIN * 2;

  const sections = parseAiSummary(ctx.aiSummary);

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  page.drawText(ctx.company?.name || "GuardianHub", { x: MARGIN, y, size: 12, font: helveticaBold, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
  if (ctx.site?.client_name) {
    page.drawText(`Prepared for ${ctx.site.client_name}`, { x: PAGE_W - MARGIN - 200, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  }
  y -= 30;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1.5, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
  y -= 60;

  page.drawText("Weekly Security Report", { x: MARGIN, y, size: 32, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 18;
  page.drawText(ctx.site.site_name, { x: MARGIN, y, size: 16, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
  y -= 28;
  page.drawText(`${ctx.site.address || ""}`, { x: MARGIN, y, size: 10, font: helveticaOblique, color: rgb(0.5, 0.5, 0.5) });
  y -= 20;
  page.drawText(`Period: ${formatDate(ctx.period.start)} to ${formatDate(ctx.period.end)}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  y -= 60;

  const stats = [
    `${ctx.structuredData.patrols.percentage}% patrol completion`,
    `${ctx.structuredData.incidents.critical} critical incidents`,
    `${ctx.structuredData.hours_covered} hours of cover`,
  ];
  const statLine = stats.join("  \u00b7  ");
  page.drawText(statLine, { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
  y -= 20;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });

  page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  y = PAGE_H - MARGIN;
  y = drawBlock(page, y, "Executive Summary", MARGIN, UW, helveticaBold, helvetica);

  const execSummary = sections.find((s: any) => s.title.toLowerCase().includes("executive"))?.body || ctx.aiSummary.slice(0, 500);
  y = drawWrappedText(page, execSummary, MARGIN, y, UW, 10, helvetica, rgb(0.25, 0.25, 0.25));
  y -= 25;

  y = drawBlock(page, y, "Key Metrics", MARGIN, UW, helveticaBold, helvetica);
  const metrics = [
    ["Patrols Completed", `${ctx.structuredData.patrols.completed} / ${ctx.structuredData.patrols.scheduled} (${ctx.structuredData.patrols.percentage}%)`],
    ["Incidents Logged", `${ctx.structuredData.incidents.total} (${ctx.structuredData.incidents.by_severity.critical}C, ${ctx.structuredData.incidents.by_severity.high}H, ${ctx.structuredData.incidents.by_severity.medium}M, ${ctx.structuredData.incidents.by_severity.low}L)`],
    ["Hours of Cover", `${ctx.structuredData.hours_covered}`],
    ["Open Issues", `${ctx.structuredData.incidents.open}`],
  ];

  const cardW = (UW - 15) / 2;
  const cardH = 60;
  for (let i = 0; i < metrics.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = MARGIN + col * (cardW + 15);
    const cy = y - (row + 1) * (cardH + 12) + cardH;
    page.drawRectangle({ x: cx, y: cy - cardH, width: cardW, height: cardH, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
    page.drawText(metrics[i][0], { x: cx + 8, y: cy - 18, size: 9, font: helveticaOblique, color: rgb(0.45, 0.45, 0.45) });
    page.drawText(metrics[i][1], { x: cx + 8, y: cy - 38, size: 14, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
  }
  y -= Math.ceil(metrics.length / 2) * (cardH + 12) + 20;

  if (ctx.incidents.length > 0) {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "Incidents Detail", MARGIN, UW, helveticaBold, helvetica);

    for (const inc of ctx.incidents) {
      if (y < MARGIN + 80) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
      const sev = (inc.severity || "low").toLowerCase();
      const sevColors: Record<string,{r:number,g:number,b:number}> = {
        low: { r: 0.13, g: 0.77, b: 0.37 },
        medium: { r: 0.92, g: 0.7, b: 0.03 },
        high: { r: 0.98, g: 0.45, b: 0.09 },
        critical: { r: 0.94, g: 0.27, b: 0.27 },
      };
      const sc = sevColors[sev] || sevColors.low;
      const dateStr = formatDate(inc.occurred_at || inc.created_at);
      const line = `${dateStr} \u2014 ${inc.incident_type || "Incident"} \u2014 ${(inc.status || "").toUpperCase()}`;
      page.drawText(line, { x: MARGIN, y, size: 10, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(sev.toUpperCase(), { x: PAGE_W - MARGIN - 60, y, size: 9, font: helveticaBold, color: rgb(sc.r, sc.g, sc.b) });
      y -= 14;
      const desc = (inc.ai_rewritten_report || inc.description || "No description.").slice(0, 180);
      y = drawWrappedText(page, desc, MARGIN + 8, y, UW - 16, 9, helvetica, rgb(0.35, 0.35, 0.35));
      y -= 14;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.9, 0.9, 0.9) });
      y -= 10;
    }
  }

  if (ctx.occurrences.length > 0 || ctx.structuredData.patrols.scheduled > 0) {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "Operational Summary", MARGIN, UW, helveticaBold, helvetica);

    if (ctx.structuredData.patrols.scheduled > 0) {
      page.drawText("Patrol completion by day", { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
      y -= 16;
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const barH = 14;
      const maxBarW = 120;
      for (const d of days) {
        const dayData = ctx.structuredData.patrols.by_day?.[d] || { completed: 0, scheduled: 0 };
        const pct = dayData.scheduled > 0 ? Math.round((dayData.completed / dayData.scheduled) * 100) : 0;
        page.drawText(d, { x: MARGIN, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
        const barW = (pct / 100) * maxBarW;
        page.drawRectangle({ x: MARGIN + 35, y: y - 2, width: barW || 2, height: barH, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
        page.drawText(`${pct}%`, { x: MARGIN + 35 + maxBarW + 8, y, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        y -= barH + 6;
      }
      y -= 10;
    }

    if (ctx.occurrences.length > 0) {
      page.drawText("Notable occurrence book entries", { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
      y -= 16;
      for (const o of ctx.occurrences.slice(0, 6)) {
        const dateStr = formatDate(o.occurred_at || o.created_at);
        const line = `${dateStr} \u2014 ${o.entry_type || "Entry"}`;
        page.drawText(line, { x: MARGIN, y, size: 9, font: helveticaBold, color: rgb(0.25, 0.25, 0.25) });
        y -= 12;
        const body = (o.ai_summary || o.entry || "").slice(0, 200);
        y = drawWrappedText(page, body, MARGIN + 8, y, UW - 16, 9, helvetica, rgb(0.35, 0.35, 0.35));
        y -= 10;
        if (y < MARGIN + 40) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
      }
    }
  }

  page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  y = PAGE_H - MARGIN;
  const recSection = sections.find((s: any) => s.title.toLowerCase().includes("recommend")) || { body: "" };
  if (recSection.body) {
    y = drawBlock(page, y, "Recommendations", MARGIN, UW, helveticaBold, helvetica);
    y = drawWrappedText(page, recSection.body, MARGIN, y, UW, 10, helvetica, rgb(0.25, 0.25, 0.25));
    y -= 25;
  }

  y = drawBlock(page, y, "Contact", MARGIN, UW, helveticaBold, helvetica);
  page.drawText(`Account Manager: ${ctx.company?.name || "GuardianHub"}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
  y -= 14;
  if (ctx.company?.contact_email) {
    page.drawText(`Email: ${ctx.company.contact_email}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
  }
  if (ctx.company?.phone) {
    page.drawText(`Phone: ${ctx.company.phone}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
  }
  y -= 20;
  page.drawText(`This report is confidential and the property of ${ctx.company?.name || "GuardianHub"}.`, {
    x: MARGIN, y, size: 8, font: helveticaOblique, color: rgb(0.45, 0.45, 0.45),
  });

  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawText(ctx.company?.name || "GuardianHub", { x: MARGIN, y: PAGE_H - 25, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
    p.drawText(`Page ${i + 1} of ${pages.length}`, { x: PAGE_W - MARGIN - 60, y: PAGE_H - 25, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
    p.drawText(`${ctx.site.site_name} \u2014 Weekly Report \u2014 ${formatDate(ctx.period.start)}`, { x: MARGIN, y: 25, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
  }

  return await pdfDoc.save();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );

    const schedulerUserId = req.headers.get("X-User-Id");
    let userId: string | null = null;
    let companyId: string | null = null;

    if (schedulerUserId) {
      userId = schedulerUserId;
      const { data: userProfile } = await supabase.from("users").select("company_id, role").eq("id", userId).maybeSingle();
      companyId = userProfile?.company_id || null;
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      }
      userId = user.id;
      const { data: userProfile } = await supabase.from("users").select("company_id, role").eq("id", userId).maybeSingle();
      companyId = userProfile?.company_id || null;
    }

    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { site_id, period_start, period_end } = body;
    if (!site_id || !period_start || !period_end) {
      return new Response(JSON.stringify({ error: "site_id, period_start, period_end required" }), { status: 400, headers: corsHeaders });
    }

    const { data: site } = await supabase
      .from("sites")
      .select("id, site_name, address, risk_level, client_name, client_logo_url, company_id")
      .eq("id", site_id)
      .maybeSingle();

    if (!site || site.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Site not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, logo_url, address, brand_color, contact_email, phone")
      .eq("id", companyId)
      .maybeSingle();

    const { data: shifts } = await supabase
      .from("shifts")
      .select("id, start_time, end_time, status, guard_id")
      .eq("site_id", site_id)
      .gte("start_time", period_start)
      .lte("start_time", period_end);

    const shiftCounts = {
      total: shifts?.length || 0,
      completed: shifts?.filter((s) => s.status === "completed").length || 0,
      missed: shifts?.filter((s) => s.status === "missed").length || 0,
      no_show: shifts?.filter((s) => s.status === "no_show").length || 0,
      assigned: shifts?.filter((s) => s.status === "assigned").length || 0,
    };
    const hoursCovered = (shifts || []).reduce((acc, s) => {
      if (s.start_time && s.end_time) {
        const start = new Date(s.start_time).getTime();
        const end = new Date(s.end_time).getTime();
        return acc + Math.max(0, (end - start) / (1000 * 60 * 60));
      }
      return acc;
    }, 0);

    const { data: incidents } = await supabase
      .from("incidents")
      .select("id, incident_type, severity, status, description, ai_rewritten_report, occurred_at, created_at")
      .eq("site_id", site_id)
      .gte("created_at", period_start)
      .lte("created_at", period_end);

    const incidentCounts = {
      total: incidents?.length || 0,
      low: incidents?.filter((i) => i.severity === "low").length || 0,
      medium: incidents?.filter((i) => i.severity === "medium").length || 0,
      high: incidents?.filter((i) => i.severity === "high").length || 0,
      critical: incidents?.filter((i) => i.severity === "critical").length || 0,
      open: incidents?.filter((i) => i.status === "open" || i.status === "reviewing").length || 0,
    };

    const { data: occurrences } = await supabase
      .from("occurrence_books")
      .select("id, entry, entry_type, ai_summary, occurred_at, created_at")
      .eq("site_id", site_id)
      .gte("created_at", period_start)
      .lte("created_at", period_end);

    const notableOccurrences = (occurrences || []).filter((o) =>
      ["Incident", "Maintenance", "Communication", "Health & Safety"].includes(o.entry_type || "")
    );

    let patrolData: any = { completed: 0, scheduled: 0, by_day: {} };
    try {
      const { data: patrols } = await supabase
        .from("patrols")
        .select("id, status, scheduled_at, completed_at")
        .eq("site_id", site_id)
        .gte("scheduled_at", period_start)
        .lte("scheduled_at", period_end);
      if (patrols) {
        patrolData.completed = patrols.filter((p) => p.status === "completed").length;
        patrolData.scheduled = patrols.length;
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        for (const d of days) patrolData.by_day[d] = { completed: 0, scheduled: 0 };
        for (const p of patrols) {
          const day = days[new Date(p.scheduled_at).getDay()];
          if (day) {
            patrolData.by_day[day].scheduled++;
            if (p.status === "completed") patrolData.by_day[day].completed++;
          }
        }
      }
    } catch {
    }

    const patrolPct = patrolData.scheduled > 0
      ? Math.round((patrolData.completed / patrolData.scheduled) * 100)
      : 0;

    const structuredData = {
      site_name: site.site_name,
      period: `${formatDate(period_start)} to ${formatDate(period_end)}`,
      shifts: shiftCounts,
      hours_covered: Math.round(hoursCovered),
      incidents: {
        total: incidentCounts.total,
        by_severity: { low: incidentCounts.low, medium: incidentCounts.medium, high: incidentCounts.high, critical: incidentCounts.critical },
        open: incidentCounts.open,
        notable: (incidents || [])
          .filter((i) => (i.severity || "low") !== "low")
          .map((i) => ({
            date: formatDate(i.occurred_at || i.created_at),
            type: i.incident_type,
            severity: i.severity,
            status: i.status,
            summary: i.ai_rewritten_report ? i.ai_rewritten_report.slice(0, 200) : (i.description || "").slice(0, 200),
          })),
      },
      patrols: {
        completed: patrolData.completed,
        scheduled: patrolData.scheduled,
        percentage: patrolPct,
      },
      occurrence_book: {
        total: occurrences?.length || 0,
        notable: notableOccurrences.slice(0, 5).map((o) => ({
          date: formatDate(o.occurred_at || o.created_at),
          type: o.entry_type,
          summary: (o.ai_summary || o.entry || "").slice(0, 150),
        })),
      },
    };

    let aiSummary = "";
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey) {
      try {
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a UK security operations manager writing a weekly site report for a client. You will receive structured data about everything that happened at the site during the week. Write a professional executive summary suitable for sending to a non-security audience.\n\nStructure:\n1. EXECUTIVE SUMMARY \u2014 2-3 sentences capturing the week's overall picture.\n2. KEY METRICS \u2014 bullet list of the most important numbers.\n3. NOTABLE INCIDENTS \u2014 brief summary of any incidents above Low severity. For each: what happened, what was done, current status.\n4. OPERATIONAL HIGHLIGHTS \u2014 patrol completion, attendance, anything noteworthy from the occurrence book.\n5. RECOMMENDATIONS \u2014 any specific actions you'd recommend the client consider, based purely on the data shown. Don't invent risks.\n\nRules:\n- British English.\n- Reassuring but not boastful tone \u2014 clients want to feel safe and informed, not sold to.\n- Don't speculate beyond the data.\n- Don't use marketing language.\n- Aim for 350\u2013500 words total.`,
              },
              {
                role: "user",
                content: `Site: ${site.site_name} / Period: ${formatDate(period_start)} to ${formatDate(period_end)} / Data: ${JSON.stringify(structuredData)}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1200,
          }),
        });
        const openaiData = await resp.json();
        aiSummary = openaiData.choices?.[0]?.message?.content || "";
      } catch {
      }
    }

    if (!aiSummary) {
      aiSummary = generateFallbackSummary(structuredData);
    }

    const pdfBytes = await generateWeeklyPDF({
      site,
      company,
      period: { start: period_start, end: period_end },
      aiSummary,
      structuredData,
      incidents: incidents || [],
      occurrences: notableOccurrences,
    });

    const timestamp = Date.now();
    const storagePath = `${companyId}/weekly/${site_id}_${timestamp}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Failed to upload PDF", detail: uploadError.message }), { status: 500, headers: corsHeaders });
    }

    const { data: urlData } = supabase.storage.from("reports").getPublicUrl(storagePath);
    const fileUrl = urlData.publicUrl;

    const { data: reportRecord } = await supabase
      .from("reports")
      .insert({
        company_id: companyId,
        site_id,
        report_type: "weekly_site",
        title: `Weekly Report \u2014 ${site.site_name} \u2014 ${formatDate(period_start)} to ${formatDate(period_end)}`,
        file_url: fileUrl,
        generated_by: userId,
        generated_at: new Date().toISOString(),
        period_start,
        period_end,
        status: "draft",
        ai_summary: aiSummary,
      })
      .select("id")
      .single();

    const { data: signedData } = await supabase.storage.from("reports").createSignedUrl(storagePath, 60 * 60 * 24);

    return new Response(
      JSON.stringify({
        url: signedData?.signedUrl || fileUrl,
        public_url: fileUrl,
        report_id: reportRecord?.id,
        ai_summary: aiSummary,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
