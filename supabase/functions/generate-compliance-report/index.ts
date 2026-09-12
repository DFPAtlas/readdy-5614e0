import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
};

function formatDate(iso: string) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(iso: string) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  const b = parseInt(c, 16);
  return { r: ((b >> 16) & 255) / 255, g: ((b >> 8) & 255) / 255, b: (b & 255) / 255 };
}

interface VettingRecord {
  id: string;
  guard_id: string;
  vetting_status: string;
  dbs_check_type: string | null;
  dbs_issue_date: string | null;
  dbs_certificate_number: string | null;
  id_verified: boolean;
  rtw_verified: boolean;
  address_history_complete: boolean;
  employment_history_complete: boolean;
  reference_1_verified: boolean;
  reference_2_verified: boolean;
  vetting_completed_at: string | null;
  vetting_expires_at: string | null;
}

interface GuardCert {
  id: string;
  guard_id: string;
  cert_type: string;
  cert_name: string;
  issuing_body: string | null;
  certificate_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: string | null;
}

interface GuardRecord {
  id: string;
  first_name: string | null;
  last_name: string | null;
  sia_licence: string | null;
  sia_expiry: string | null;
  status: string | null;
  badge_number: string | null;
  position: string | null;
}

interface ComplianceDoc {
  id: string;
  document_type: string;
  document_title: string;
  issue_date: string | null;
  expiry_date: string | null;
  status: string | null;
  review_status: string | null;
  entity_type: string;
}

interface TrainingModule {
  id: string;
  title: string;
  category: string | null;
  is_mandatory: boolean;
}

interface TrainingCompletion {
  id: string;
  module_id: string;
  guard_id: string;
  completed_at: string | null;
  passed: boolean | null;
  expires_at: string | null;
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
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { site_id, period_start, period_end } = body;
    if (!site_id) {
      return new Response(JSON.stringify({ error: "site_id required" }), { status: 400, headers: corsHeaders });
    }

    const { data: site } = await supabase
      .from("sites")
      .select("id, site_name, address, client_name, company_id, risk_level")
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

    const now = new Date();
    const nowIso = now.toISOString();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [docsRes, assignmentsRes, guardsRes, certsRes, vettingsRes, modulesRes, completionsRes] = await Promise.all([
      supabase.from("compliance_documents").select("*").eq("company_id", companyId).order("expiry_date", { ascending: true }),
      supabase.from("guard_site_assignments").select("guard_id, status, induction_status, induction_date").eq("site_id", site_id).eq("company_id", companyId),
      supabase.from("guards").select("id, first_name, last_name, sia_licence, sia_expiry, status, badge_number, position").eq("company_id", companyId).order("last_name"),
      supabase.from("guard_certifications").select("*").eq("company_id", companyId).order("expiry_date", { ascending: true }),
      supabase.from("guard_vetting_records").select("*").eq("company_id", companyId),
      supabase.from("training_modules").select("*").eq("company_id", companyId).eq("active", true).order("title"),
      supabase.from("training_completions").select("*").eq("company_id", companyId),
    ]);

    const siteDocs = (docsRes.data || []) as ComplianceDoc[];
    const allDocs = siteDocs.filter((d) => d.entity_type === "site" && d.entity_id === site_id);

    const assignedGuardIds = (assignmentsRes.data || []).map((a: any) => a.guard_id);
    const siteGuards = (guardsRes.data || []) as GuardRecord[];
    const assignedGuards = siteGuards.filter((g) => assignedGuardIds.includes(g.id));
    const allGuardIds = siteGuards.map((g) => g.id);

    const allCerts = (certsRes.data || []) as GuardCert[];
    const allVettings = (vettingsRes.data || []) as VettingRecord[];
    const allModules = (modulesRes.data || []) as TrainingModule[];
    const allCompletions = (completionsRes.data || []) as TrainingCompletion[];

    const nowStr = now.toISOString().split("T")[0];

    const docsExpired = allDocs.filter((d) => d.expiry_date && d.expiry_date < nowStr).length;
    const docsExpiring30 = allDocs.filter((d) => d.expiry_date && d.expiry_date >= nowStr && d.expiry_date <= thirtyDays).length;
    const docsExpiring90 = allDocs.filter((d) => d.expiry_date && d.expiry_date > thirtyDays && d.expiry_date <= ninetyDays).length;
    const docsValid = allDocs.length - docsExpired - docsExpiring30 - docsExpiring90;
    const docsMissingReview = allDocs.filter((d) => d.review_status === "pending_review").length;

    const guardsWithSIA = assignedGuards.filter((g) => g.sia_licence).length;
    const siaExpired = assignedGuards.filter((g) => g.sia_expiry && g.sia_expiry < nowStr).length;
    const siaExpiring30 = assignedGuards.filter((g) => g.sia_expiry && g.sia_expiry >= nowStr && g.sia_expiry <= thirtyDays).length;
    const siaExpiring90 = assignedGuards.filter((g) => g.sia_expiry && g.sia_expiry > thirtyDays && g.sia_expiry <= ninetyDays).length;
    const siaValid = guardsWithSIA - siaExpired - siaExpiring30 - siaExpiring90;

    const assignedGuardVettings = allVettings.filter((v) => assignedGuardIds.includes(v.guard_id));
    const vettingComplete = assignedGuardVettings.filter((v) => v.vetting_status === "complete" || v.vetting_status === "approved").length;
    const vettingInProgress = assignedGuardVettings.filter((v) => v.vetting_status === "in_progress" || v.vetting_status === "pending").length;
    const vettingNotStarted = assignedGuards.length - vettingComplete - vettingInProgress;

    const mandatoryModules = allModules.filter((m) => m.is_mandatory);
    const guardTrainingGaps: Record<string, { name: string; missing: string[]; completed: number; totalMandatory: number }> = {};
    assignedGuards.forEach((g) => {
      const guardCompletions = allCompletions.filter((c) => c.guard_id === g.id && c.passed === true);
      const completedModuleIds = new Set(guardCompletions.map((c) => c.module_id));
      const missing = mandatoryModules.filter((m) => !completedModuleIds.has(m.id));
      guardTrainingGaps[g.id] = {
        name: g.first_name ? `${g.first_name} ${g.last_name || ""}`.trim() : "Unknown",
        missing: missing.map((m) => m.title),
        completed: mandatoryModules.length - missing.length,
        totalMandatory: mandatoryModules.length,
      };
    });

    const totalMandatoryCompletions = mandatoryModules.length * assignedGuards.length;
    const actualCompletions = Object.values(guardTrainingGaps).reduce((sum, g) => sum + g.completed, 0);
    const trainingPct = totalMandatoryCompletions > 0 ? Math.round((actualCompletions / totalMandatoryCompletions) * 100) : 100;
    const guardsFullyTrained = Object.values(guardTrainingGaps).filter((g) => g.missing.length === 0).length;

    const certsExpired = allCerts.filter((c) => assignedGuardIds.includes(c.guard_id) && c.expiry_date && c.expiry_date < nowStr).length;
    const certsExpiring30 = allCerts.filter((c) => assignedGuardIds.includes(c.guard_id) && c.expiry_date && c.expiry_date >= nowStr && c.expiry_date <= thirtyDays).length;
    const certsExpiring90 = allCerts.filter((c) => assignedGuardIds.includes(c.guard_id) && c.expiry_date && c.expiry_date > thirtyDays && c.expiry_date <= ninetyDays).length;

    let auditScore = 100;
    if (docsExpired > 0) auditScore -= docsExpired * 5;
    if (docsMissingReview > 0) auditScore -= docsMissingReview * 3;
    if (siaExpired > 0) auditScore -= siaExpired * 10;
    if (siaExpiring30 > 0) auditScore -= siaExpiring30 * 3;
    if (vettingNotStarted > 0) auditScore -= vettingNotStarted * 8;
    if (vettingInProgress > 0) auditScore -= vettingInProgress * 4;
    if (trainingPct < 100) auditScore -= Math.round((100 - trainingPct) * 0.5);
    if (certsExpired > 0) auditScore -= certsExpired * 3;
    auditScore = Math.max(0, Math.min(100, auditScore));

    let readinessLevel = "Critical";
    if (auditScore >= 90) readinessLevel = "Excellent";
    else if (auditScore >= 75) readinessLevel = "Good";
    else if (auditScore >= 55) readinessLevel = "Needs Attention";
    else if (auditScore >= 35) readinessLevel = "At Risk";

    const { PDFDocument, rgb, StandardFonts } = await import("https://esm.sh/pdf-lib@1.17.1");
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const brandColor = company?.brand_color || "#3b82f6";
    const brandRgb = hexToRgb(brandColor);
    const MARGIN = 50;
    const PAGE_W = 595;
    const PAGE_H = 842;
    const UW = PAGE_W - MARGIN * 2;

    const green = { r: 0.13, g: 0.7, b: 0.35 };
    const amber = { r: 0.92, g: 0.6, b: 0.05 };
    const red = { r: 0.92, g: 0.25, b: 0.25 };
    const blue = { r: brandRgb.r, g: brandRgb.g, b: brandRgb.b };
    const grey = { r: 0.45, g: 0.45, b: 0.45 };

    function drawBlock(page: any, y: number, title: string) {
      page.drawText(title, { x: MARGIN, y, size: 13, font: helveticaBold, color: rgb(0.12, 0.12, 0.12) });
      const ny = y - 14;
      page.drawLine({ start: { x: MARGIN, y: ny }, end: { x: MARGIN + UW, y: ny }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
      return ny - 10;
    }

    function drawMetricCard(page: any, x: number, y: number, w: number, h: number, label: string, value: string, accent: any) {
      page.drawRectangle({ x, y: y - h, width: w, height: h, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
      page.drawText(label, { x: x + 8, y: y - 16, size: 7, font: helveticaOblique, color: rgb(0.5, 0.5, 0.5) });
      page.drawText(value, { x: x + 8, y: y - h + 12, size: 14, font: helveticaBold, color: rgb(accent.r, accent.g, accent.b) });
    }

    function drawScoreCircle(page: any, cx: number, cy: number, radius: number, score: number, level: string) {
      const lvlColor = score >= 90 ? green : score >= 75 ? blue : score >= 55 ? amber : red;
      page.drawCircle({ x: cx, y: cy, size: radius, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(lvlColor.r, lvlColor.g, lvlColor.b), borderWidth: 3 });
      page.drawText(`${score}`, { x: cx - (score >= 100 ? 20 : score >= 10 ? 13 : 8), y: cy - 10, size: 28, font: helveticaBold, color: rgb(lvlColor.r, lvlColor.g, lvlColor.b) });
      page.drawText("/100", { x: cx + (score >= 100 ? 8 : 14), y: cy - 8, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      page.drawText(level, { x: cx - helveticaBold.widthOfTextAtSize(level, 10) / 2, y: cy - radius + 8, size: 10, font: helveticaBold, color: rgb(lvlColor.r, lvlColor.g, lvlColor.b) });
    }

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    page.drawText(company?.name || "GuardianHub", { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
    y -= 20;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1.5, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
    y -= 46;

    page.drawText("Site Compliance & Audit Readiness Report", { x: MARGIN, y, size: 26, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 16;
    page.drawText(site.site_name, { x: MARGIN, y, size: 14, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
    y -= 22;
    page.drawText(site.address || "", { x: MARGIN, y, size: 9, font: helveticaOblique, color: rgb(0.5, 0.5, 0.5) });
    y -= 14;
    page.drawText(`Generated: ${formatDate(nowIso)}`, { x: MARGIN, y, size: 9, font: helvetica, color: rgb(0.45, 0.45, 0.45) });
    if (site.client_name) {
      y -= 14;
      page.drawText(`Client: ${site.client_name}`, { x: MARGIN, y, size: 9, font: helvetica, color: rgb(0.45, 0.45, 0.45) });
    }
    if (site.risk_level) {
      y -= 14;
      page.drawText(`Risk Level: ${site.risk_level.toUpperCase()}`, { x: MARGIN, y, size: 9, font: helveticaBold, color: rgb(0.35, 0.35, 0.35) });
    }
    y -= 36;

    drawScoreCircle(page, MARGIN + 55, y - 40, 46, auditScore, readinessLevel);

    const mcx = MARGIN + 130;
    const cardW = (UW - 130 - 14) / 3;
    const cardH = 42;
    const cardsData = [
      ["Documents", `${allDocs.length} (${docsExpired} expired)`, docsExpired > 0 ? red : green],
      ["SIA Licences", `${guardsWithSIA} (${siaExpired} expired)`, siaExpired > 0 ? red : green],
      ["Training", `${trainingPct}% compliant`, trainingPct >= 90 ? green : trainingPct >= 70 ? amber : red],
      ["Vetting", `${vettingComplete}/${assignedGuards.length} complete`, vettingNotStarted > 0 ? amber : green],
      ["Certifications", `${certsExpired} expired`, certsExpired > 0 ? red : green],
      ["Site Risk", site.risk_level ? site.risk_level.toUpperCase() : "N/A", blue],
    ];

    for (let i = 0; i < cardsData.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const mx = mcx + col * (cardW + 7);
      const my = y - row * (cardH + 6);
      drawMetricCard(page, mx, my, cardW, cardH, cardsData[i][0], cardsData[i][1] as string, cardsData[i][2] as any);
    }
    y -= Math.ceil(cardsData.length / 3) * (cardH + 6) + 24;

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "Document Expiry Register");

    if (allDocs.length === 0) {
      y -= 4;
      page.drawText("No compliance documents registered for this site.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
      y -= 16;
    } else {
      const docCols = [
        { label: "Document", x: MARGIN, w: 180 },
        { label: "Type", x: MARGIN + 184, w: 80 },
        { label: "Issued", x: MARGIN + 268, w: 70 },
        { label: "Expires", x: MARGIN + 342, w: 70 },
        { label: "Status", x: MARGIN + 416, w: 120 },
      ];
      for (const col of docCols) {
        page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
      }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const d of allDocs) {
        if (y < MARGIN + 30) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const du = daysUntil(d.expiry_date);
        let statusText = "Valid";
        let statusColor = green;
        if (d.expiry_date && d.expiry_date < nowStr) { statusText = `Expired`; statusColor = red; }
        else if (du !== null && du <= 30) { statusText = `Expires ${du}d`; statusColor = red; }
        else if (du !== null && du <= 90) { statusText = `Expires ${du}d`; statusColor = amber; }
        if (d.review_status === "pending_review") { statusText += " \u2022 Pending Review"; statusColor = amber; }

        page.drawText(d.document_title.slice(0, 32), { x: docCols[0].x, y, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(d.document_type.replace(/_/g, " ").slice(0, 14), { x: docCols[1].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(d.issue_date ? formatDateShort(d.issue_date) : "\u2014", { x: docCols[2].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(d.expiry_date ? formatDateShort(d.expiry_date) : "\u2014", { x: docCols[3].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(statusText, { x: docCols[4].x, y, size: 8, font: helveticaBold, color: rgb(statusColor.r, statusColor.g, statusColor.b) });
        y -= 18;
        page.drawLine({ start: { x: MARGIN, y: y + 8 }, end: { x: PAGE_W - MARGIN, y: y + 8 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    y -= 8;

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "SIA Licence Status");

    if (assignedGuards.length === 0) {
      y -= 4;
      page.drawText("No guards assigned to this site.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
      y -= 16;
    } else {
      const siaCols = [
        { label: "Guard", x: MARGIN, w: 140 },
        { label: "Position", x: MARGIN + 144, w: 80 },
        { label: "SIA Licence", x: MARGIN + 228, w: 100 },
        { label: "Expiry", x: MARGIN + 332, w: 80 },
        { label: "Status", x: MARGIN + 416, w: 120 },
      ];
      for (const col of siaCols) {
        page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
      }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const g of assignedGuards) {
        if (y < MARGIN + 30) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const du = daysUntil(g.sia_expiry);
        let siaStatus = "No SIA";
        let siaColor = red;
        if (g.sia_licence && g.sia_expiry) {
          if (g.sia_expiry < nowStr) { siaStatus = "EXPIRED"; siaColor = red; }
          else if (du !== null && du <= 30) { siaStatus = `EXPIRES ${du}d`; siaColor = red; }
          else if (du !== null && du <= 90) { siaStatus = `Expires ${du}d`; siaColor = amber; }
          else { siaStatus = "Valid"; siaColor = green; }
        } else if (g.sia_licence) { siaStatus = "No expiry set"; siaColor = amber; }

        page.drawText(`${g.first_name || ""} ${g.last_name || ""}`.trim().slice(0, 22), { x: siaCols[0].x, y, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText((g.position || "\u2014").slice(0, 12), { x: siaCols[1].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText((g.sia_licence || "\u2014").slice(0, 16), { x: siaCols[2].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(g.sia_expiry ? formatDateShort(g.sia_expiry) : "\u2014", { x: siaCols[3].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(siaStatus, { x: siaCols[4].x, y, size: 8, font: helveticaBold, color: rgb(siaColor.r, siaColor.g, siaColor.b) });
        y -= 18;
        page.drawLine({ start: { x: MARGIN, y: y + 8 }, end: { x: PAGE_W - MARGIN, y: y + 8 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    y -= 8;

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "Guard Vetting & Background Checks");

    if (assignedGuardVettings.length === 0) {
      y -= 4;
      page.drawText("No vetting records for guards assigned to this site.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
      y -= 16;
    } else {
      const vetCols = [
        { label: "Guard", x: MARGIN, w: 120 },
        { label: "Vetting Status", x: MARGIN + 124, w: 70 },
        { label: "DBS", x: MARGIN + 198, w: 80 },
        { label: "ID Check", x: MARGIN + 282, w: 60 },
        { label: "RTW", x: MARGIN + 346, w: 50 },
        { label: "Refs", x: MARGIN + 400, w: 50 },
        { label: "5yr History", x: MARGIN + 454, w: 70 },
      ];
      for (const col of vetCols) {
        page.drawText(col.label, { x: col.x, y, size: 6, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
      }
      y -= 10;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const g of assignedGuards) {
        const v = assignedGuardVettings.find((r) => r.guard_id === g.id);
        if (y < MARGIN + 25) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const name = `${g.first_name || ""} ${g.last_name || ""}`.trim().slice(0, 18);
        const tick = "\u2713";
        const cross = "\u2717";

        page.drawText(name, { x: vetCols[0].x, y, size: 7, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        if (v) {
          const vs = v.vetting_status || "pending";
          const vsColor = vs === "complete" || vs === "approved" ? green : vs === "in_progress" ? blue : amber;
          page.drawText(vs.replace(/_/g, " "), { x: vetCols[1].x, y, size: 7, font: helveticaBold, color: rgb(vsColor.r, vsColor.g, vsColor.b) });
          page.drawText(v.dbs_check_type ? `${v.dbs_check_type}` : "\u2014", { x: vetCols[2].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
          page.drawText(v.id_verified ? tick : cross, { x: vetCols[3].x, y, size: 9, font: helveticaBold, color: v.id_verified ? green : red });
          page.drawText(v.rtw_verified ? tick : cross, { x: vetCols[4].x, y, size: 9, font: helveticaBold, color: v.rtw_verified ? green : red });
          const refsOk = v.reference_1_verified && v.reference_2_verified;
          page.drawText(refsOk ? "2/2" : v.reference_1_verified || v.reference_2_verified ? "1/2" : cross, { x: vetCols[5].x, y, size: 7, font: helveticaBold, color: refsOk ? green : amber });
          page.drawText(v.employment_history_complete ? tick : cross, { x: vetCols[6].x, y, size: 9, font: helveticaBold, color: v.employment_history_complete ? green : red });
        } else {
          page.drawText("Not started", { x: vetCols[1].x, y, size: 7, font: helveticaOblique, color: grey });
          for (let i = 2; i < vetCols.length; i++) {
            page.drawText("\u2014", { x: vetCols[i].x, y, size: 7, font: helvetica, color: grey });
          }
        }
        y -= 16;
        page.drawLine({ start: { x: MARGIN, y: y + 6 }, end: { x: PAGE_W - MARGIN, y: y + 6 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    y -= 8;

    if (allCerts.filter((c) => assignedGuardIds.includes(c.guard_id)).length > 0) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      y = drawBlock(page, y, "Guard Certifications");

      const certCols = [
        { label: "Guard", x: MARGIN, w: 120 },
        { label: "Certification", x: MARGIN + 124, w: 150 },
        { label: "Issuing Body", x: MARGIN + 278, w: 90 },
        { label: "Issued", x: MARGIN + 372, w: 60 },
        { label: "Expires", x: MARGIN + 436, w: 60 },
        { label: "Status", x: MARGIN + 496, w: 60 },
      ];
      for (const col of certCols) {
        page.drawText(col.label, { x: col.x, y, size: 6, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
      }
      y -= 10;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      const sortedCerts = [...allCerts]
        .filter((c) => assignedGuardIds.includes(c.guard_id))
        .sort((a, b) => {
          const ae = a.expiry_date || "9999";
          const be = b.expiry_date || "9999";
          return ae.localeCompare(be);
        });

      for (const c of sortedCerts) {
        if (y < MARGIN + 25) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const guard = assignedGuards.find((g) => g.id === c.guard_id);
        const gName = guard ? `${guard.first_name || ""} ${guard.last_name || ""}`.trim() : "Unknown";
        const du = daysUntil(c.expiry_date);
        let certStatus = "Valid";
        let certColor = green;
        if (c.expiry_date && c.expiry_date < nowStr) { certStatus = "Expired"; certColor = red; }
        else if (du !== null && du <= 30) { certStatus = `Exp ${du}d`; certColor = red; }
        else if (du !== null && du <= 90) { certStatus = `Exp ${du}d`; certColor = amber; }

        page.drawText(gName.slice(0, 18), { x: certCols[0].x, y, size: 7, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText((c.cert_name || c.cert_type).slice(0, 24), { x: certCols[1].x, y, size: 7, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
        page.drawText((c.issuing_body || "\u2014").slice(0, 14), { x: certCols[2].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(c.issue_date ? formatDateShort(c.issue_date) : "\u2014", { x: certCols[3].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(c.expiry_date ? formatDateShort(c.expiry_date) : "\u2014", { x: certCols[4].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(certStatus, { x: certCols[5].x, y, size: 7, font: helveticaBold, color: rgb(certColor.r, certColor.g, certColor.b) });
        y -= 15;
        page.drawLine({ start: { x: MARGIN, y: y + 5 }, end: { x: PAGE_W - MARGIN, y: y + 5 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
      y -= 8;
    }

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "Training Compliance & Gaps");

    page.drawText(`Overall training compliance: ${trainingPct}%`, { x: MARGIN, y, size: 10, font: helveticaBold, color: trainingPct >= 90 ? green : trainingPct >= 70 ? amber : red });
    y -= 14;
    page.drawText(`${guardsFullyTrained}/${assignedGuards.length} guards fully trained on all mandatory modules`, { x: MARGIN + 6, y, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    y -= 14;
    page.drawText(`${mandatoryModules.length} mandatory modules across company`, { x: MARGIN + 6, y, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    y -= 20;

    if (assignedGuards.length > 0 && mandatoryModules.length > 0) {
      for (const g of assignedGuards) {
        const gap = guardTrainingGaps[g.id];
        if (!gap) continue;
        if (y < MARGIN + 60) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const gName = gap.name.slice(0, 24);
        const pct = gap.totalMandatory > 0 ? Math.round((gap.completed / gap.totalMandatory) * 100) : 100;
        const barPctColor = pct >= 100 ? green : pct >= 70 ? amber : red;

        page.drawText(gName, { x: MARGIN, y, size: 9, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
        page.drawText(`${gap.completed}/${gap.totalMandatory} done (${pct}%)`, { x: MARGIN + 130, y, size: 9, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        y -= 14;

        if (gap.missing.length > 0) {
          for (const m of gap.missing) {
            if (y < MARGIN + 20) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
            page.drawText(`  \u2717  ${m.slice(0, 48)}`, { x: MARGIN + 12, y, size: 8, font: helveticaOblique, color: red });
            y -= 12;
          }
        } else {
          page.drawText(`  \u2713  All mandatory modules completed`, { x: MARGIN + 12, y, size: 8, font: helveticaOblique, color: green });
          y -= 12;
        }
        y -= 6;
      }
    } else {
      page.drawText("No mandatory training modules configured or no guards assigned.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    }
    y -= 8;

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawBlock(page, y, "Report Information");
    page.drawText(`Generated by: ${company?.name || "GuardianHub"}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
    page.drawText(`Generated on: ${formatDate(nowIso)}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
    y -= 14;
    page.drawText(`Site: ${site.site_name}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.25, 0.25, 0.25) });
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
      p.drawText(`${site.site_name} \u2014 Compliance & Audit Readiness`, { x: MARGIN, y: 25, size: 6, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
    }

    const pdfBytes = await pdfDoc.save();
    const timestamp = Date.now();
    const storagePath = `${companyId}/compliance/${site_id}_${timestamp}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Failed to upload PDF", detail: uploadError.message }), { status: 500, headers: corsHeaders });
    }

    const { data: signedData } = await supabase.storage.from("reports").createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    const reportTitle = `Compliance & Audit Readiness \u2014 ${site.site_name} \u2014 ${formatDate(nowIso)}`;

    const { data: reportRecord } = await supabase
      .from("reports")
      .insert({
        company_id: companyId,
        site_id,
        report_type: "compliance",
        title: reportTitle,
        file_url: signedData?.signedUrl,
        generated_by: userId,
        generated_at: nowIso,
        period_start: period_start || null,
        period_end: period_end || null,
        status: "draft",
        client_visible: false,
      })
      .select("id")
      .single();

    return new Response(
      JSON.stringify({
        url: signedData?.signedUrl,
        report_id: reportRecord?.id,
        audit_score: auditScore,
        readiness_level: readinessLevel,
        training_compliance_pct: trainingPct,
        docs_expired: docsExpired,
        sia_expired: siaExpired,
        vetting_complete_pct: assignedGuards.length > 0 ? Math.round((vettingComplete / assignedGuards.length) * 100) : 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});