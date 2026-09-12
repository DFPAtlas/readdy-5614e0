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

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatMetres(m: number | null | undefined): string {
  if (m == null) return "\u2014";
  if (m < 1) return `${(m * 100).toFixed(0)} cm`;
  return `${m.toFixed(1)} m`;
}

function toPct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
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
      .select("id, site_name, address, client_name, company_id")
      .eq("id", site_id)
      .maybeSingle();

    if (!site || site.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Site not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, brand_color, contact_email, phone")
      .eq("id", companyId)
      .maybeSingle();

    const { data: scans } = await supabase
      .from("patrol_scans")
      .select(`
        id, scanned_at, scan_status, gps_verified, gps_status,
        gps_latitude, gps_longitude, gps_accuracy, phone_gps_accuracy_meters,
        distance_from_checkpoint, guard_id, checkpoint_id, checkpoint_code,
        guards(first_name, last_name),
        patrol_checkpoints(name, checkpoint_code, allowed_radius_meters)
      `)
      .eq("site_id", site_id)
      .gte("scanned_at", period_start)
      .lte("scanned_at", period_end)
      .order("scanned_at", { ascending: true });

    const { data: checkpoints } = await supabase
      .from("patrol_checkpoints")
      .select("id, name, checkpoint_code, allowed_radius_meters, lat, lng")
      .eq("site_id", site_id)
      .eq("is_active", true);

    const scansArr = (scans || []) as any[];
    const checkpointMap = new Map<string, any>();
    (checkpoints || []).forEach((c) => checkpointMap.set(c.id, c));

    const totalScans = scansArr.length;
    const completedScans = scansArr.filter((s) => s.scan_status === "valid" || s.scan_status === "late").length;
    const missedScans = scansArr.filter((s) => s.scan_status === "missed").length;
    const gpsVerified = scansArr.filter((s) => s.gps_verified === true).length;
    const gpsOutsideRadius = scansArr.filter((s) => s.gps_status === "outside_radius").length;
    const gpsUnavailable = scansArr.filter((s) => s.gps_status === "gps_unavailable").length;
    const gpsNotChecked = scansArr.filter((s) => !s.gps_verified && s.gps_status !== "outside_radius" && s.gps_status !== "gps_unavailable").length;

    const gpsAccuracies = scansArr
      .filter((s) => (s.phone_gps_accuracy_meters ?? s.gps_accuracy) != null)
      .map((s) => Number(s.phone_gps_accuracy_meters ?? s.gps_accuracy));
    const avgGpsAccuracy = gpsAccuracies.length > 0
      ? gpsAccuracies.reduce((a, b) => a + b, 0) / gpsAccuracies.length
      : null;
    const minGpsAccuracy = gpsAccuracies.length > 0 ? Math.min(...gpsAccuracies) : null;
    const maxGpsAccuracy = gpsAccuracies.length > 0 ? Math.max(...gpsAccuracies) : null;

    const distances = scansArr
      .filter((s) => s.distance_from_checkpoint != null)
      .map((s) => Number(s.distance_from_checkpoint));
    const avgDistance = distances.length > 0
      ? distances.reduce((a, b) => a + b, 0) / distances.length
      : null;

    const gpsWithinRadius = scansArr.filter((s) => {
      if (s.distance_from_checkpoint == null) return false;
      const cp = checkpointMap.get(s.checkpoint_id);
      const radius = cp?.allowed_radius_meters || 50;
      return Number(s.distance_from_checkpoint) <= radius;
    }).length;

    const perGuardMap = new Map<string, { name: string; total: number; completed: number; gpsVerified: number; avgAccuracy: number | null; countAccuracy: number; withinRadius: number; countDistance: number }>();
    scansArr.forEach((s) => {
      const gid = s.guard_id || "unknown";
      if (!perGuardMap.has(gid)) {
        perGuardMap.set(gid, {
          name: s.guards?.first_name ? `${s.guards.first_name} ${s.guards.last_name || ""}`.trim() : (gid === "unknown" ? "Unknown Guard" : gid.slice(0, 8)),
          total: 0, completed: 0, gpsVerified: 0, avgAccuracy: null, countAccuracy: 0, withinRadius: 0, countDistance: 0,
        });
      }
      const g = perGuardMap.get(gid)!;
      g.total++;
      if (s.scan_status === "valid" || s.scan_status === "late") g.completed++;
      if (s.gps_verified) g.gpsVerified++;
      const acc = Number(s.phone_gps_accuracy_meters ?? s.gps_accuracy);
      if (!isNaN(acc)) {
        g.avgAccuracy = ((g.avgAccuracy || 0) * g.countAccuracy + acc) / (g.countAccuracy + 1);
        g.countAccuracy++;
      }
      if (s.distance_from_checkpoint != null) {
        const cp = checkpointMap.get(s.checkpoint_id);
        const radius = cp?.allowed_radius_meters || 50;
        if (Number(s.distance_from_checkpoint) <= radius) g.withinRadius++;
        g.countDistance++;
      }
    });

    const perCheckpointMap = new Map<string, { name: string; code: string; total: number; completed: number; gpsVerified: number; avgAccuracy: number | null; countAccuracy: number; withinRadius: number; countDistance: number; radius: number }>();
    scansArr.forEach((s) => {
      const cid = s.checkpoint_id || "unknown";
      if (!perCheckpointMap.has(cid)) {
        const cp = checkpointMap.get(cid);
        perCheckpointMap.set(cid, {
          name: s.patrol_checkpoints?.name || cp?.name || (cid === "unknown" ? "Unknown" : cid.slice(0, 8)),
          code: s.checkpoint_code || s.patrol_checkpoints?.checkpoint_code || cp?.checkpoint_code || "",
          total: 0, completed: 0, gpsVerified: 0, avgAccuracy: null, countAccuracy: 0, withinRadius: 0, countDistance: 0,
          radius: cp?.allowed_radius_meters || 50,
        });
      }
      const c = perCheckpointMap.get(cid)!;
      c.total++;
      if (s.scan_status === "valid" || s.scan_status === "late") c.completed++;
      if (s.gps_verified) c.gpsVerified++;
      const acc = Number(s.phone_gps_accuracy_meters ?? s.gps_accuracy);
      if (!isNaN(acc)) {
        c.avgAccuracy = ((c.avgAccuracy || 0) * c.countAccuracy + acc) / (c.countAccuracy + 1);
        c.countAccuracy++;
      }
      if (s.distance_from_checkpoint != null) {
        if (Number(s.distance_from_checkpoint) <= c.radius) c.withinRadius++;
        c.countDistance++;
      }
    });

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const perDayMap: Record<string, { completed: number; total: number }> = {};
    days.forEach((d) => { perDayMap[d] = { completed: 0, total: 0 }; });
    scansArr.forEach((s) => {
      const d = new Date(s.scanned_at);
      const day = days[(d.getDay() + 6) % 7];
      if (day) {
        perDayMap[day].total++;
        if (s.scan_status === "valid" || s.scan_status === "late") perDayMap[day].completed++;
      }
    });

    const { PDFDocument, rgb, StandardFonts } = await import("https://esm.sh/pdf-lib@1.17.1");
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const brandColor = company?.brand_color || "#3b82f6";
    function hexToRgb(hex: string) {
      const c = hex.replace("#", "");
      const b = parseInt(c, 16);
      return { r: ((b >> 16) & 255) / 255, g: ((b >> 8) & 255) / 255, b: (b & 255) / 255 };
    }
    const brandRgb = hexToRgb(brandColor);
    const MARGIN = 50;
    const PAGE_W = 595;
    const PAGE_H = 842;
    const UW = PAGE_W - MARGIN * 2;

    function drawBlock(page: any, y: number, title: string) {
      page.drawText(title, { x: MARGIN, y, size: 13, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
      const ny = y - 14;
      page.drawLine({ start: { x: MARGIN, y: ny }, end: { x: MARGIN + UW, y: ny }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
      return ny - 10;
    }

    function drawWrapped(page: any, text: string, x: number, y: number, maxW: number, size: number, font: any, color: any) {
      const words = text.split(/\s+/);
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(test, size) > maxW && line) {
          page.drawText(line, { x, y, size, font, color });
          y -= size + 3;
          line = w;
        } else { line = test; }
      }
      if (line) { page.drawText(line, { x, y, size, font, color }); y -= size + 3; }
      return y;
    }

    function drawMetricCard(page: any, x: number, y: number, w: number, h: number, label: string, value: string, accent: { r: number; g: number; b: number }) {
      page.drawRectangle({ x, y: y - h, width: w, height: h, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
      page.drawText(label, { x: x + 8, y: y - 18, size: 8, font: helveticaOblique, color: rgb(0.45, 0.45, 0.45) });
      page.drawText(value, { x: x + 8, y: y - h + 12, size: 16, font: helveticaBold, color: rgb(accent.r, accent.g, accent.b) });
    }

    function drawBar(page: any, x: number, y: number, maxW: number, pct: number, label: string, sub: string, color: any) {
      const barH = 12;
      page.drawText(label, { x, y, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      const barW = Math.max(2, (pct / 100) * maxW);
      page.drawRectangle({ x: x + 80, y: y - 2, width: barW, height: barH, color });
      page.drawText(sub, { x: x + 80 + maxW + 6, y, size: 8, font: helvetica, color: rgb(0.45, 0.45, 0.45) });
      return y - barH - 6;
    }

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    page.drawText(company?.name || "GuardianHub", { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
    y -= 20;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1.5, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
    y -= 50;

    page.drawText("Patrol Performance Summary", { x: MARGIN, y, size: 28, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 16;
    page.drawText(site.site_name, { x: MARGIN, y, size: 14, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
    y -= 24;
    page.drawText(site.address || "", { x: MARGIN, y, size: 9, font: helveticaOblique, color: rgb(0.5, 0.5, 0.5) });
    y -= 16;
    page.drawText(`Period: ${formatDate(period_start)} to ${formatDate(period_end)}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
    if (site.client_name) {
      y -= 14;
      page.drawText(`Prepared for: ${site.client_name}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
    }
    y -= 40;

    const green = { r: 0.13, g: 0.7, b: 0.35 };
    const amber = { r: 0.92, g: 0.6, b: 0.05 };
    const red = { r: 0.92, g: 0.25, b: 0.25 };
    const blue = { r: brandRgb.r, g: brandRgb.g, b: brandRgb.b };

    const metricCardW = (UW - 20) / 3;
    const metricCardH = 52;
    const metrics = [
      ["Total Scans", `${totalScans}`, blue],
      ["Completed", `${completedScans} / ${totalScans} (${toPct(completedScans, totalScans)}%)`, completedScans === totalScans ? green : amber],
      ["Missed", `${missedScans}`, missedScans > 0 ? red : { r: 0.4, g: 0.4, b: 0.4 }],
      ["GPS Verified", `${gpsVerified} / ${totalScans} (${toPct(gpsVerified, totalScans)}%)`, blue],
      ["Outside Radius", `${gpsOutsideRadius}`, gpsOutsideRadius > 0 ? red : { r: 0.4, g: 0.4, b: 0.4 }],
      ["GPS Unavailable", `${gpsUnavailable}`, gpsUnavailable > 0 ? amber : { r: 0.4, g: 0.4, b: 0.4 }],
    ];

    for (let i = 0; i < metrics.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const mx = MARGIN + col * (metricCardW + 10);
      const my = y - row * (metricCardH + 8);
      drawMetricCard(page, mx, my, metricCardW, metricCardH, metrics[i][0], metrics[i][1] as string, metrics[i][2] as any);
    }
    y -= Math.ceil(metrics.length / 3) * (metricCardH + 8) + 16;

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;

    y = drawBlock(page, y, "GPS Accuracy Analysis");

    page.drawText("Position Accuracy", { x: MARGIN, y, size: 10, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
    if (avgGpsAccuracy != null) {
      page.drawText(`Average GPS accuracy: ${avgGpsAccuracy.toFixed(1)} m`, { x: MARGIN + 6, y, size: 9, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
      y -= 12;
      page.drawText(`Best: ${minGpsAccuracy!.toFixed(1)} m    Worst: ${maxGpsAccuracy!.toFixed(1)} m`, { x: MARGIN + 6, y, size: 9, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
      y -= 12;
    } else {
      page.drawText("No GPS accuracy data available for this period.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: rgb(0.45, 0.45, 0.45) });
      y -= 12;
    }

    const gpsBreakdownMaxW = 160;
    y -= 6;
    page.drawText("GPS Verification Breakdown", { x: MARGIN, y, size: 10, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
    y = drawBar(page, MARGIN, y, gpsBreakdownMaxW, toPct(gpsVerified, totalScans), "Verified", `${gpsVerified} scans`, green);
    y = drawBar(page, MARGIN, y, gpsBreakdownMaxW, toPct(gpsOutsideRadius, totalScans), "Outside radius", `${gpsOutsideRadius} scans`, red);
    y = drawBar(page, MARGIN, y, gpsBreakdownMaxW, toPct(gpsUnavailable, totalScans), "Unavailable", `${gpsUnavailable} scans`, amber);
    y = drawBar(page, MARGIN, y, gpsBreakdownMaxW, toPct(gpsNotChecked, totalScans), "Not checked", `${gpsNotChecked} scans`, { r: 0.5, g: 0.5, b: 0.5 });
    y -= 6;

    if (distances.length > 0) {
      page.drawText("Distance from Checkpoint", { x: MARGIN, y, size: 10, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
      y -= 14;
      page.drawText(`Average distance: ${avgDistance!.toFixed(1)} m`, { x: MARGIN + 6, y, size: 9, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
      y -= 12;
      page.drawText(`Scans within allowed radius: ${gpsWithinRadius} / ${distances.length} (${toPct(gpsWithinRadius, distances.length)}%)`, { x: MARGIN + 6, y, size: 9, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
      y -= 20;
    }

    const guardEntries = [...perGuardMap.entries()].sort((a, b) => b[1].total - a[1].total);
    if (guardEntries.length > 0) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      y = drawBlock(page, y, "Per-Guard Performance");

      const colW = (UW - 20) / 2;
      let col = 0;
      let baseY = y;
      let prevRow = 0;

      for (const [, g] of guardEntries) {
        if (y < MARGIN + 80) {
          if (col === 1) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; baseY = y; col = 0; prevRow = 0; }
          else { y = baseY; col = 1; }
        }
        const cx = MARGIN + col * (colW + 20);
        const cardH = 92;
        page.drawRectangle({ x: cx, y: y - cardH, width: colW, height: cardH, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
        page.drawText(g.name, { x: cx + 8, y: y - 16, size: 10, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
        page.drawText(`${g.completed}/${g.total} scans complete (${toPct(g.completed, g.total)}%)`, { x: cx + 8, y: y - 30, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(`GPS verified: ${g.gpsVerified}/${g.total} (${toPct(g.gpsVerified, g.total)}%)`, { x: cx + 8, y: y - 44, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        if (g.avgAccuracy != null) {
          page.drawText(`Avg GPS accuracy: ${g.avgAccuracy.toFixed(1)} m`, { x: cx + 8, y: y - 58, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        }
        if (g.countDistance > 0) {
          page.drawText(`Within radius: ${g.withinRadius}/${g.countDistance} (${toPct(g.withinRadius, g.countDistance)}%)`, { x: cx + 8, y: y - 72, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        }
        if (col === 1) { y -= cardH + 10; col = 0; } else { col = 1; }
      }
      y -= 16;
    }

    const cpEntries = [...perCheckpointMap.entries()].sort((a, b) => b[1].total - a[1].total);
    if (cpEntries.length > 0) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      y = drawBlock(page, y, "Per-Checkpoint Breakdown");

      const rowH = 22;
      y -= 6;

      const headerLabels = ["Checkpoint", "Scans", "Complete", "GPS OK", "Within Radius", "Avg Acc"];
      const headerXs = [MARGIN, 250, 315, 365, 425, 510];
      for (let i = 0; i < headerLabels.length; i++) {
        page.drawText(headerLabels[i], { x: headerXs[i], y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
      }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const [, c] of cpEntries) {
        if (y < MARGIN + 40) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const vals = [
          `${c.name}${c.code ? ` (${c.code})` : ""}`.slice(0, 28),
          `${c.total}`,
          `${toPct(c.completed, c.total)}%`,
          `${toPct(c.gpsVerified, c.total)}%`,
          c.countDistance > 0 ? `${toPct(c.withinRadius, c.countDistance)}%` : "\u2014",
          c.avgAccuracy != null ? `${c.avgAccuracy.toFixed(1)}m` : "\u2014",
        ];
        for (let i = 0; i < vals.length; i++) {
          page.drawText(vals[i], { x: headerXs[i], y, size: 8, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
        }
        y -= rowH;
        page.drawLine({ start: { x: MARGIN, y: y + rowH - 10 }, end: { x: PAGE_W - MARGIN, y: y + rowH - 10 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
      y -= 10;
    }

    if (totalScans > 0) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      y = drawBlock(page, y, "Daily Patrol Completion");

      const barMaxW = 140;
      for (const d of days) {
        const dd = perDayMap[d];
        const pct = toPct(dd.completed, dd.total);
        const color = pct >= 90 ? green : pct >= 70 ? amber : red;
        y = drawBar(page, MARGIN, y, barMaxW, pct, d, `${dd.completed}/${dd.total} (${pct}%)`, color);
      }
      y -= 20;

      y = drawBlock(page, y, "Recent Scan Activity");
      y -= 4;
      const recentScans = scansArr.slice(-20).reverse();
      for (const s of recentScans) {
        if (y < MARGIN + 30) break;
        const guardName = s.guards?.first_name ? `${s.guards.first_name} ${s.guards.last_name || ""}`.trim() : "Unknown";
        const cpName = s.patrol_checkpoints?.name || s.checkpoint_code || "Unknown";
        const statusColor = s.scan_status === "valid" || s.scan_status === "late" ? green : red;
        const gpsText = s.gps_verified ? "GPS" : s.gps_status === "outside_radius" ? "OUT" : s.gps_status === "gps_unavailable" ? "NO GPS" : "\u2014";
        const gpsColor = s.gps_verified ? green : s.gps_status === "outside_radius" ? red : { r: 0.5, g: 0.5, b: 0.5 };
        const line = `${formatDateTime(s.scanned_at)}  \u2014  ${guardName}  \u2014  ${cpName}`;
        page.drawText(line, { x: MARGIN, y, size: 8, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
        page.drawText(gpsText, { x: PAGE_W - MARGIN - 50, y, size: 7, font: helveticaBold, color: rgb(gpsColor.r, gpsColor.g, gpsColor.b) });
        y -= 14;
      }
      y -= 10;
    }

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "Report Information");
    page.drawText(`Generated by: ${company?.name || "GuardianHub"}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
    page.drawText(`Generated on: ${formatDate(new Date().toISOString())}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
    page.drawText(`Site: ${site.site_name}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
    page.drawText(`Period: ${formatDate(period_start)} to ${formatDate(period_end)}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
    if (company?.contact_email) {
      page.drawText(`Contact: ${company.contact_email}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
      y -= 14;
    }
    y -= 16;
    page.drawText(`This report is confidential and the property of ${company?.name || "GuardianHub"}.`, {
      x: MARGIN, y, size: 8, font: helveticaOblique, color: rgb(0.45, 0.45, 0.45),
    });

    const allPages = pdfDoc.getPages();
    for (let i = 0; i < allPages.length; i++) {
      const p = allPages[i];
      p.drawText(company?.name || "GuardianHub", { x: MARGIN, y: PAGE_H - 25, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      p.drawText(`Page ${i + 1} of ${allPages.length}`, { x: PAGE_W - MARGIN - 50, y: PAGE_H - 25, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      p.drawText(`${site.site_name} \u2014 Patrol Summary \u2014 ${formatDate(period_start)}`, { x: MARGIN, y: 25, size: 6, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
    }

    const pdfBytes = await pdfDoc.save();
    const timestamp = Date.now();
    const storagePath = `${companyId}/patrol_summary/${site_id}_${timestamp}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Failed to upload PDF", detail: uploadError.message }), { status: 500, headers: corsHeaders });
    }

    const { data: signedData } = await supabase.storage.from("reports").createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    const reportTitle = `Patrol Summary \u2014 ${site.site_name} \u2014 ${formatDate(period_start)} to ${formatDate(period_end)}`;

    const { data: reportRecord } = await supabase
      .from("reports")
      .insert({
        company_id: companyId,
        site_id,
        report_type: "patrol_summary",
        title: reportTitle,
        file_url: signedData?.signedUrl,
        generated_by: userId,
        generated_at: new Date().toISOString(),
        period_start,
        period_end,
        status: "draft",
        client_visible: false,
      })
      .select("id")
      .single();

    return new Response(
      JSON.stringify({
        url: signedData?.signedUrl,
        report_id: reportRecord?.id,
        total_scans: totalScans,
        completed_scans: completedScans,
        gps_verified: gpsVerified,
        avg_gps_accuracy: avgGpsAccuracy ? `${avgGpsAccuracy.toFixed(1)} m` : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});