import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
};

function formatDate(iso: string) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(iso: string) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
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

interface GuardRecord {
  id: string; first_name: string | null; last_name: string | null;
  sia_licence: string | null; sia_expiry: string | null;
  status: string | null; badge_number: string | null; position: string | null;
  emergency_contact_name: string | null; emergency_contact_phone: string | null;
}

interface VettingRecord {
  id: string; guard_id: string; vetting_status: string;
  dbs_check_type: string | null; dbs_issue_date: string | null; dbs_certificate_number: string | null;
  id_verified: boolean; rtw_verified: boolean;
  address_history_complete: boolean; employment_history_complete: boolean;
  reference_1_verified: boolean; reference_2_verified: boolean;
  vetting_completed_at: string | null; vetting_expires_at: string | null;
}

interface GuardCert {
  id: string; guard_id: string; cert_type: string; cert_name: string;
  issuing_body: string | null; certificate_number: string | null;
  issue_date: string | null; expiry_date: string | null; status: string | null;
}

interface TrainingModule {
  id: string; title: string; category: string | null; is_mandatory: boolean;
}

interface TrainingCompletion {
  id: string; module_id: string; guard_id: string;
  completed_at: string | null; passed: boolean | null; expires_at: string | null;
}

interface Policy {
  id: string; title: string; policy_type: string; status: string;
  review_date: string | null; expiry_date: string | null;
  file_url: string | null; description: string | null;
}

interface SiteCompliance {
  id: string; site_id: string; status: string;
  assignment_instructions_url: string | null; assignment_instructions_expiry: string | null;
  risk_assessment_url: string | null; risk_assessment_expiry: string | null;
  patrol_log_available: boolean; dob_log_available: boolean;
  incident_reports_count: number | null; site_survey_url: string | null;
  emergency_procedures_url: string | null; patrol_routes_url: string | null;
  client_sla_url: string | null; site_contacts_url: string | null;
  key_register_url: string | null;
}

interface Site {
  id: string; site_name: string; address: string | null; client_name: string | null; risk_level: string | null;
}

interface Incident {
  id: string; title: string; severity: string; status: string;
  occurred_at: string | null; reported_at: string | null; site_name: string | null;
}

interface CorrectiveAction {
  id: string; title: string; action_title: string | null; action_description: string | null;
  status: string; priority: string | null; due_date: string | null;
  assigned_to: string | null; completed_at: string | null;
}

interface EvidenceItem {
  id: string; title: string; category: string; status: string;
  expiry_date: string | null; review_date: string | null;
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

    const now = new Date();
    const nowIso = now.toISOString();
    const nowStr = nowIso.split("T")[0];
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, brand_color, contact_email, phone")
      .eq("id", companyId)
      .maybeSingle();

    const [
      policiesRes, guardsRes, vettingsRes, certsRes,
      modulesRes, completionsRes, siteComplianceRes, sitesRes,
      incidentsRes, actionsRes, evidenceRes,
    ] = await Promise.all([
      supabase.from("acs_policies").select("*").eq("company_id", companyId).order("policy_type"),
      supabase.from("guards").select("id, first_name, last_name, sia_licence, sia_expiry, status, badge_number, position, emergency_contact_name, emergency_contact_phone").eq("company_id", companyId).order("last_name"),
      supabase.from("guard_vetting_records").select("*").eq("company_id", companyId),
      supabase.from("guard_certifications").select("*").eq("company_id", companyId).order("expiry_date", { ascending: true }),
      supabase.from("training_modules").select("*").eq("company_id", companyId).eq("active", true).order("title"),
      supabase.from("training_completions").select("*").eq("company_id", companyId),
      supabase.from("acs_site_compliance").select("*").eq("company_id", companyId),
      supabase.from("sites").select("id, site_name, address, client_name, risk_level").eq("company_id", companyId).order("site_name"),
      supabase.from("incidents").select("id, title, severity, status, occurred_at, reported_at, site_id").eq("company_id", companyId).order("occurred_at", { ascending: false }).limit(50),
      supabase.from("acs_corrective_actions").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("acs_evidence").select("*").eq("company_id", companyId).order("category"),
    ]);

    const allPolicies = (policiesRes.data || []) as Policy[];
    const allGuards = (guardsRes.data || []) as GuardRecord[];
    const allVettings = (vettingsRes.data || []) as VettingRecord[];
    const allCerts = (certsRes.data || []) as GuardCert[];
    const allModules = (modulesRes.data || []) as TrainingModule[];
    const allCompletions = (completionsRes.data || []) as TrainingCompletion[];
    const allSiteComp = (siteComplianceRes.data || []) as SiteCompliance[];
    const allSites = (sitesRes.data || []) as Site[];
    const allIncidents = (incidentsRes.data || []) as Incident[];
    const allActions = (actionsRes.data || []) as CorrectiveAction[];
    const allEvidence = (evidenceRes.data || []) as EvidenceItem[];

    const siteMap = new Map(allSites.map((s) => [s.id, s]));

    const patrolScansRes = await supabase.from("patrol_scans").select("count", { count: "exact", head: true }).eq("company_id", companyId);
    const patrolScanCount = patrolScansRes.count || 0;

    const dobRes = await supabase.from("occurrence_books").select("count", { count: "exact", head: true }).eq("company_id", companyId);
    const dobEntryCount = dobRes.count || 0;

    const riskAssessmentsRes = await supabase.from("site_risk_scores").select("count", { count: "exact", head: true }).eq("company_id", companyId);
    const riskAssessmentCount = riskAssessmentsRes.count || 0;

    const polApproved = allPolicies.filter((p) => p.status === "approved").length;
    const polScore = allPolicies.length > 0 ? Math.round((polApproved / allPolicies.length) * 100) : 0;

    const guardsWithSIA = allGuards.filter((g) => g.sia_licence).length;
    const siaExpired = allGuards.filter((g) => g.sia_expiry && g.sia_expiry < nowStr).length;
    const siaExpiring30 = allGuards.filter((g) => g.sia_expiry && g.sia_expiry >= nowStr && g.sia_expiry <= thirtyDays).length;
    const vettingComplete = allVettings.filter((v) => v.vetting_status === "complete" || v.vetting_status === "approved").length;
    const personnelScore = allGuards.length > 0 ? Math.round(
      ((guardsWithSIA - siaExpired) / allGuards.length * 0.4 + (allVettings.length > 0 ? vettingComplete / allGuards.length : 0) * 0.3 + (allGuards.filter((g) => g.emergency_contact_name).length / allGuards.length) * 0.3) * 100
    ) : 0;

    const expiredCerts = allCerts.filter((c) => c.expiry_date && c.expiry_date < nowStr).length;
    const certsExpiring30 = allCerts.filter((c) => c.expiry_date && c.expiry_date >= nowStr && c.expiry_date <= thirtyDays).length;
    const trainingScore = allCerts.length > 0 ? Math.round(((allCerts.length - expiredCerts) / allCerts.length) * 100) : 0;

    const mandatoryModules = allModules.filter((m) => m.is_mandatory);
    const totalMandCompletions = mandatoryModules.length * allGuards.length;
    let actualCompletions = 0;
    allGuards.forEach((g) => {
      const gComps = allCompletions.filter((c) => c.guard_id === g.id && c.passed === true);
      const completedIds = new Set(gComps.map((c) => c.module_id));
      actualCompletions += mandatoryModules.filter((m) => completedIds.has(m.id)).length;
    });
    const mandatoryTrainingPct = totalMandCompletions > 0 ? Math.round((actualCompletions / totalMandCompletions) * 100) : 100;

    const siteCompArr: { name: string; score: number; issues: string[] }[] = [];
    let totalSiteScore = 0;
    allSiteComp.forEach((sc) => {
      const s = siteMap.get(sc.site_id);
      let scr = 100;
      const issues: string[] = [];
      if (!sc.assignment_instructions_url) { scr -= 20; issues.push("Missing assignment instructions"); }
      if (sc.assignment_instructions_expiry && sc.assignment_instructions_expiry < nowStr) { scr -= 15; issues.push("Expired assignment instructions"); }
      if (!sc.risk_assessment_url) { scr -= 20; issues.push("Missing risk assessment"); }
      if (sc.risk_assessment_expiry && sc.risk_assessment_expiry < nowStr) { scr -= 15; issues.push("Expired risk assessment"); }
      if (!sc.patrol_log_available) { scr -= 10; issues.push("No patrol logs"); }
      if (!sc.dob_log_available) { scr -= 10; issues.push("No DOB records"); }
      if (!sc.emergency_procedures_url) { scr -= 5; issues.push("Missing emergency procedures"); }
      if (!sc.client_sla_url) { scr -= 5; issues.push("Missing client SLA"); }
      siteCompArr.push({ name: s?.site_name || "Unknown Site", score: Math.max(0, scr), issues });
      totalSiteScore += Math.max(0, scr);
    });
    const siteScore = siteCompArr.length > 0 ? Math.round(totalSiteScore / siteCompArr.length) : 0;

    const hnsEvidence = allEvidence.filter((e) => e.category === "health_safety");
    const hnsExpired = hnsEvidence.filter((e) => e.expiry_date && e.expiry_date < nowStr).length;
    const hnsScore = hnsEvidence.length > 0 ? Math.round(((hnsEvidence.length - hnsExpired) / hnsEvidence.length) * 100) : 0;

    const openActions = allActions.filter((a) => a.status === "open").length;
    const overdueActions = allActions.filter((a) => a.status === "open" && a.due_date && a.due_date < nowStr).length;
    const actionsScore = allActions.length > 0 ? Math.round(((allActions.length - openActions) / allActions.length) * 100) : 0;

    const expiredEvidence = allEvidence.filter((e) => e.expiry_date && e.expiry_date < nowStr).length;
    const evidenceScore = allEvidence.length > 0 ? Math.round(((allEvidence.length - expiredEvidence) / allEvidence.length) * 100) : 0;

    const areaScores = [
      { name: "Company Governance", score: polScore, weight: 15 },
      { name: "Personnel Records", score: personnelScore, weight: 20 },
      { name: "Training Compliance", score: trainingScore, weight: 15 },
      { name: "Site Documentation", score: siteScore, weight: 15 },
      { name: "Health & Safety", score: hnsScore, weight: 10 },
      { name: "Operations", score: actionsScore, weight: 10 },
      { name: "Incident Management", score: allIncidents.length > 0 ? 100 : 50, weight: 10 },
      { name: "Evidence Quality", score: evidenceScore, weight: 5 },
    ];

    const overallScore = Math.round(
      areaScores.reduce((sum, a) => sum + a.score * a.weight, 0) /
      areaScores.reduce((sum, a) => sum + a.weight, 0)
    );

    let readinessLevel = "Critical";
    if (overallScore >= 90) readinessLevel = "Excellent";
    else if (overallScore >= 75) readinessLevel = "Good";
    else if (overallScore >= 55) readinessLevel = "Needs Attention";
    else if (overallScore >= 35) readinessLevel = "At Risk";

    const { PDFDocument, rgb, StandardFonts } = await import("https://esm.sh/pdf-lib@1.17.1");
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const brandColor = company?.brand_color || "#f59e0b";
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
    const darkGrey = { r: 0.25, g: 0.25, b: 0.25 };

    function addFooter(p: any, pageNum: number, totalPages: number) {
      p.drawText(company?.name || "GuardianHub", { x: MARGIN, y: 25, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      p.drawText(`ACS Evidence Pack \u2014 ${formatDateShort(nowIso)}`, { x: MARGIN, y: 14, size: 6, font: helveticaOblique, color: rgb(0.5, 0.5, 0.5) });
      p.drawText(`Page ${pageNum} of ${totalPages}`, { x: PAGE_W - MARGIN - 50, y: 25, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      p.drawText("CONFIDENTIAL", { x: PAGE_W - MARGIN - 55, y: 14, size: 6, font: helveticaOblique, color: rgb(0.55, 0.55, 0.55) });
    }

    function drawSectionHeader(page: any, y: number, number: string, title: string): number {
      page.drawText(`${number}  ${title}`, { x: MARGIN, y, size: 16, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
      const ny = y - 18;
      page.drawLine({ start: { x: MARGIN, y: ny }, end: { x: PAGE_W - MARGIN, y: ny }, thickness: 1.2, color: rgb(blue.r, blue.g, blue.b) });
      return ny - 16;
    }

    function drawSubHeader(page: any, y: number, title: string): number {
      page.drawText(title, { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
      const ny = y - 12;
      page.drawLine({ start: { x: MARGIN, y: ny }, end: { x: PAGE_W - MARGIN, y: ny }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      return ny - 10;
    }

    function drawScoreRing(page: any, cx: number, cy: number, radius: number, score: number, label: string) {
      const lvlColor = score >= 90 ? green : score >= 75 ? blue : score >= 55 ? amber : red;
      page.drawCircle({ x: cx, y: cy, size: radius, color: rgb(0.98, 0.98, 0.98), borderColor: rgb(lvlColor.r, lvlColor.g, lvlColor.b), borderWidth: 3.5 });
      page.drawText(`${score}`, { x: cx - (score >= 100 ? 22 : score >= 10 ? 14 : 8), y: cy - 11, size: 30, font: helveticaBold, color: rgb(lvlColor.r, lvlColor.g, lvlColor.b) });
      page.drawText("/100", { x: cx + (score >= 100 ? 10 : 15), y: cy - 9, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      page.drawText(label, { x: cx - helveticaBold.widthOfTextAtSize(label, 8) / 2, y: cy - radius + 10, size: 8, font: helveticaBold, color: rgb(lvlColor.r, lvlColor.g, lvlColor.b) });
    }

    function scoreColor(s: number) { return s >= 90 ? green : s >= 75 ? blue : s >= 55 ? amber : red; }

    const includedSections: string[] = [];

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    page.drawText(company?.name || "GuardianHub", { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
    y -= 20;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1.5, color: rgb(brandRgb.r, brandRgb.g, brandRgb.b) });
    y -= 50;

    page.drawText("SIA ACS", { x: MARGIN, y, size: 14, font: helvetica, color: grey });
    y -= 18;
    page.drawText("Evidence Pack", { x: MARGIN, y, size: 32, font: helveticaBold, color: rgb(0.08, 0.08, 0.08) });
    y -= 16;
    page.drawText("Approved Contractor Scheme \u2014 Audit Readiness Documentation", { x: MARGIN, y, size: 11, font: helveticaOblique, color: grey });
    y -= 24;
    page.drawText(`Generated: ${formatDate(nowIso)}`, { x: MARGIN, y, size: 9, font: helvetica, color: grey });
    y -= 14;
    page.drawText(`Company: ${company?.name || "N/A"}`, { x: MARGIN, y, size: 9, font: helvetica, color: grey });
    if (company?.contact_email) { y -= 14; page.drawText(`Contact: ${company.contact_email}`, { x: MARGIN, y, size: 9, font: helvetica, color: grey }); }
    y -= 40;

    drawScoreRing(page, MARGIN + 60, y - 50, 55, overallScore, readinessLevel);

    const scoreStartX = MARGIN + 150;
    const scoreCardW = (UW - 150 - 20) / 2;
    const scoreCardH = 32;

    areaScores.forEach((a, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = scoreStartX + col * (scoreCardW + 8);
      const sy = y - row * (scoreCardH + 5);
      page.drawRectangle({ x: sx, y: sy - scoreCardH, width: scoreCardW, height: scoreCardH, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.88, 0.88, 0.88), borderWidth: 0.5 });
      const sc = scoreColor(a.score);
      const barW = (scoreCardW - 16) * (a.score / 100);
      page.drawRectangle({ x: sx + 8, y: sy - scoreCardH + 8, width: barW, height: 4, color: rgb(sc.r, sc.g, sc.b) });
      page.drawText(`${a.name}`, { x: sx + 8, y: sy - 10, size: 7, font: helveticaBold, color: darkGrey });
      page.drawText(`${a.score}%`, { x: sx + scoreCardW - 40, y: sy - 10, size: 8, font: helveticaBold, color: rgb(sc.r, sc.g, sc.b) });
    });

    y -= Math.ceil(areaScores.length / 2) * (scoreCardH + 5) + 20;

    page.drawText(`Total Guards: ${allGuards.length}    |    Sites: ${allSites.length}    |    Policies: ${allPolicies.length}    |    Incidents: ${allIncidents.length}`, { x: MARGIN, y, size: 8, font: helvetica, color: grey });
    y -= 12;
    page.drawText(`Training Modules: ${allModules.length}    |    Patrol Scans: ${patrolScanCount}    |    DOB Entries: ${dobEntryCount}    |    Risk Assessments: ${riskAssessmentCount}`, { x: MARGIN, y, size: 8, font: helvetica, color: grey });

    includedSections.push("Cover Page", "Score Summary", "Company Overview");

    addFooter(page, 1, 999);

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawSectionHeader(page, y, "1", "Company Governance & Policies");

    if (allPolicies.length === 0) {
      page.drawText("No policies registered in the system.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    } else {
      const polCols = [
        { label: "Policy", x: MARGIN, w: 200 },
        { label: "Type", x: MARGIN + 204, w: 100 },
        { label: "Status", x: MARGIN + 308, w: 70 },
        { label: "Review Date", x: MARGIN + 382, w: 80 },
        { label: "Expiry", x: MARGIN + 466, w: 70 },
      ];
      for (const col of polCols) { page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const p of allPolicies) {
        if (y < MARGIN + 30) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const stColor = p.status === "approved" ? green : p.status === "pending_review" ? amber : red;
        page.drawText((p.title || "Untitled").slice(0, 32), { x: polCols[0].x, y, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText((p.policy_type || "\u2014").replace(/_/g, " ").slice(0, 16), { x: polCols[1].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(p.status.replace(/_/g, " "), { x: polCols[2].x, y, size: 8, font: helveticaBold, color: rgb(stColor.r, stColor.g, stColor.b) });
        page.drawText(p.review_date ? formatDateShort(p.review_date) : "\u2014", { x: polCols[3].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(p.expiry_date ? formatDateShort(p.expiry_date) : "\u2014", { x: polCols[4].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        y -= 18;
        page.drawLine({ start: { x: MARGIN, y: y + 8 }, end: { x: PAGE_W - MARGIN, y: y + 8 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    includedSections.push("Company Governance & Policies");
    addFooter(page, 2, 999);

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawSectionHeader(page, y, "2", "Personnel Records & SIA Compliance");

    if (allGuards.length === 0) {
      page.drawText("No guards registered.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    } else {
      const guardCols = [
        { label: "Guard Name", x: MARGIN, w: 130 },
        { label: "SIA Licence", x: MARGIN + 134, w: 90 },
        { label: "SIA Expiry", x: MARGIN + 228, w: 70 },
        { label: "Position", x: MARGIN + 302, w: 60 },
        { label: "Emergency Contact", x: MARGIN + 366, w: 130 },
        { label: "Vetting", x: MARGIN + 496, w: 50 },
      ];
      for (const col of guardCols) { page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const g of allGuards) {
        if (y < MARGIN + 25) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const vet = allVettings.find((v) => v.guard_id === g.id);
        const du = daysUntil(g.sia_expiry);
        let siaStatus = g.sia_licence || "\u2014";
        let siaColor = green;
        if (!g.sia_licence) { siaStatus = "MISSING"; siaColor = red; }
        else if (g.sia_expiry && g.sia_expiry < nowStr) { siaStatus = `${g.sia_licence} (EXPIRED)`; siaColor = red; }
        else if (du !== null && du <= 30) { siaColor = red; }
        else if (du !== null && du <= 90) { siaColor = amber; }

        const name = `${g.first_name || ""} ${g.last_name || ""}`.trim() || "Unknown";
        page.drawText(name.slice(0, 20), { x: guardCols[0].x, y, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(siaStatus.slice(0, 14), { x: guardCols[1].x, y, size: 8, font: helvetica, color: rgb(siaColor.r, siaColor.g, siaColor.b) });
        page.drawText(g.sia_expiry ? formatDateShort(g.sia_expiry) : "\u2014", { x: guardCols[2].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText((g.position || "\u2014").slice(0, 10), { x: guardCols[3].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText((g.emergency_contact_name || "\u2014").slice(0, 20), { x: guardCols[4].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        const vetStatus = vet?.vetting_status || "not started";
        const vetColor = vetStatus === "complete" || vetStatus === "approved" ? green : vetStatus === "in_progress" ? blue : amber;
        page.drawText(vetStatus.replace(/_/g, " "), { x: guardCols[5].x, y, size: 7, font: helveticaBold, color: rgb(vetColor.r, vetColor.g, vetColor.b) });
        y -= 16;
        page.drawLine({ start: { x: MARGIN, y: y + 6 }, end: { x: PAGE_W - MARGIN, y: y + 6 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    y -= 14;
    y = drawSubHeader(page, y, "BS7858 Vetting Detail");
    if (allVettings.length === 0) {
      page.drawText("No vetting records.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    } else {
      y -= 2;
      const vetCols = [
        { label: "Guard", x: MARGIN, w: 110 },
        { label: "DBS", x: MARGIN + 114, w: 80 },
        { label: "ID", x: MARGIN + 198, w: 30 },
        { label: "RTW", x: MARGIN + 232, w: 30 },
        { label: "5yr History", x: MARGIN + 266, w: 60 },
        { label: "Refs", x: MARGIN + 330, w: 40 },
        { label: "Status", x: MARGIN + 374, w: 60 },
        { label: "Completed", x: MARGIN + 438, w: 70 },
      ];
      for (const col of vetCols) { page.drawText(col.label, { x: col.x, y, size: 6, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
      y -= 10;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const v of allVettings) {
        if (y < MARGIN + 20) break;
        const g = allGuards.find((gg) => gg.id === v.guard_id);
        const gName = g ? `${g.first_name || ""} ${g.last_name || ""}`.trim().slice(0, 16) : "Unknown";
        const tick = "\u2713"; const cross = "\u2717";
        page.drawText(gName, { x: vetCols[0].x, y, size: 7, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(v.dbs_check_type || "\u2014", { x: vetCols[1].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(v.id_verified ? tick : cross, { x: vetCols[2].x, y, size: 8, font: helveticaBold, color: v.id_verified ? green : red });
        page.drawText(v.rtw_verified ? tick : cross, { x: vetCols[3].x, y, size: 8, font: helveticaBold, color: v.rtw_verified ? green : red });
        page.drawText(v.employment_history_complete ? tick : cross, { x: vetCols[4].x, y, size: 8, font: helveticaBold, color: v.employment_history_complete ? green : red });
        const refsStr = v.reference_1_verified && v.reference_2_verified ? "2/2" : v.reference_1_verified || v.reference_2_verified ? "1/2" : cross;
        const refsOk = v.reference_1_verified && v.reference_2_verified;
        page.drawText(refsStr, { x: vetCols[5].x, y, size: 7, font: helveticaBold, color: refsOk ? green : amber });
        const vs = v.vetting_status || "pending";
        const vsColor = vs === "complete" || vs === "approved" ? green : vs === "in_progress" ? blue : amber;
        page.drawText(vs.replace(/_/g, " "), { x: vetCols[6].x, y, size: 7, font: helveticaBold, color: rgb(vsColor.r, vsColor.g, vsColor.b) });
        page.drawText(v.vetting_completed_at ? formatDateShort(v.vetting_completed_at) : "\u2014", { x: vetCols[7].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        y -= 14;
        page.drawLine({ start: { x: MARGIN, y: y + 5 }, end: { x: PAGE_W - MARGIN, y: y + 5 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    includedSections.push("Personnel Records & SIA Compliance");
    addFooter(page, 3, 999);

    if (allCerts.length > 0) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      y = drawSectionHeader(page, y, "3", "Training Records & Certifications");

      page.drawText(`Training Compliance Score: ${trainingScore}%`, { x: MARGIN, y, size: 10, font: helveticaBold, color: rgb(scoreColor(trainingScore).r, scoreColor(trainingScore).g, scoreColor(trainingScore).b) });
      y -= 14;
      page.drawText(`Total certifications: ${allCerts.length}    |    Expired: ${expiredCerts}    |    Expiring within 30 days: ${certsExpiring30}`, { x: MARGIN, y, size: 9, font: helvetica, color: grey });
      y -= 14;
      page.drawText(`Mandatory training: ${mandatoryTrainingPct}% complete across ${allGuards.length} guards`, { x: MARGIN, y, size: 9, font: helvetica, color: grey });
      y -= 20;

      const certCols = [
        { label: "Guard", x: MARGIN, w: 120 },
        { label: "Certification", x: MARGIN + 124, w: 150 },
        { label: "Issuer", x: MARGIN + 278, w: 90 },
        { label: "Issued", x: MARGIN + 372, w: 60 },
        { label: "Expires", x: MARGIN + 436, w: 60 },
        { label: "Status", x: MARGIN + 496, w: 60 },
      ];
      for (const col of certCols) { page.drawText(col.label, { x: col.x, y, size: 6, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
      y -= 10;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const c of allCerts) {
        if (y < MARGIN + 25) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        const g = allGuards.find((gg) => gg.id === c.guard_id);
        const gName = g ? `${g.first_name || ""} ${g.last_name || ""}`.trim() : "Unknown";
        const du = daysUntil(c.expiry_date);
        let certStatus = "Valid"; let certColor = green;
        if (c.expiry_date && c.expiry_date < nowStr) { certStatus = "Expired"; certColor = red; }
        else if (du !== null && du <= 30) { certStatus = `Exp ${du}d`; certColor = red; }
        else if (du !== null && du <= 90) { certStatus = `Exp ${du}d`; certColor = amber; }

        page.drawText(gName.slice(0, 18), { x: certCols[0].x, y, size: 7, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText((c.cert_name || c.cert_type).slice(0, 24), { x: certCols[1].x, y, size: 7, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        page.drawText((c.issuing_body || "\u2014").slice(0, 14), { x: certCols[2].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(c.issue_date ? formatDateShort(c.issue_date) : "\u2014", { x: certCols[3].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(c.expiry_date ? formatDateShort(c.expiry_date) : "\u2014", { x: certCols[4].x, y, size: 7, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(certStatus, { x: certCols[5].x, y, size: 7, font: helveticaBold, color: rgb(certColor.r, certColor.g, certColor.b) });
        y -= 15;
        page.drawLine({ start: { x: MARGIN, y: y + 5 }, end: { x: PAGE_W - MARGIN, y: y + 5 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
      includedSections.push("Training Records & Certifications");
      addFooter(page, 4, 999);
    }

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawSectionHeader(page, y, "4", "Site Documentation & Risk Assessments");

    if (allSiteComp.length === 0) {
      page.drawText("No site compliance records.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    } else {
      for (const sc of allSiteComp) {
        const s = siteMap.get(sc.site_id);
        if (y < MARGIN + 120) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }

        page.drawText(s?.site_name || "Unknown Site", { x: MARGIN, y, size: 13, font: helveticaBold, color: rgb(0.12, 0.12, 0.12) });
        if (s?.address) { y -= 12; page.drawText(s.address.slice(0, 80), { x: MARGIN, y, size: 8, font: helveticaOblique, color: grey }); }
        if (s?.client_name) { y -= 12; page.drawText(`Client: ${s.client_name}`, { x: MARGIN, y, size: 8, font: helveticaOblique, color: grey }); }
        y -= 16;

        const tick = "\u2713"; const cross = "\u2717";
        const checks: [string, boolean, string][] = [
          ["Assignment Instructions", !!sc.assignment_instructions_url, sc.assignment_instructions_expiry && sc.assignment_instructions_expiry < nowStr ? "EXPIRED" : sc.assignment_instructions_expiry ? `Exp: ${formatDateShort(sc.assignment_instructions_expiry)}` : ""],
          ["Risk Assessment", !!sc.risk_assessment_url, sc.risk_assessment_expiry && sc.risk_assessment_expiry < nowStr ? "EXPIRED" : sc.risk_assessment_expiry ? `Exp: ${formatDateShort(sc.risk_assessment_expiry)}` : ""],
          ["Site Survey", !!sc.site_survey_url, ""],
          ["Emergency Procedures", !!sc.emergency_procedures_url, ""],
          ["Patrol Routes", !!sc.patrol_routes_url, ""],
          ["Client SLA", !!sc.client_sla_url, ""],
          ["Site Contacts", !!sc.site_contacts_url, ""],
          ["Key Register", !!sc.key_register_url, ""],
          ["Patrol Logs Available", sc.patrol_log_available, ""],
          ["DOB Records", sc.dob_log_available, ""],
        ];

        for (const [label, ok, note] of checks) {
          if (y < MARGIN + 20) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
          const okColor = ok ? green : red;
          page.drawText(ok ? tick : cross, { x: MARGIN + 6, y, size: 9, font: helveticaBold, color: rgb(okColor.r, okColor.g, okColor.b) });
          page.drawText(label, { x: MARGIN + 22, y, size: 8, font: ok ? helvetica : helveticaBold, color: ok ? rgb(0.3, 0.3, 0.3) : rgb(red.r, red.g, red.b) });
          if (note) page.drawText(note, { x: MARGIN + 200, y, size: 7, font: helveticaOblique, color: red });
          y -= 14;
        }

        const sScore = siteCompArr.find((a) => a.name === (s?.site_name || "Unknown Site"))?.score || 0;
        const sColor = scoreColor(sScore);
        page.drawText(`Site Compliance Score: ${sScore}%`, { x: MARGIN + 6, y, size: 9, font: helveticaBold, color: rgb(sColor.r, sColor.g, sColor.b) });
        y -= 6;
        page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
        y -= 14;
      }
    }
    y -= 6;
    page.drawText(`Total Patrol Scans: ${patrolScanCount}    |    DOB Entries: ${dobEntryCount}    |    Risk Assessments: ${riskAssessmentCount}`, { x: MARGIN, y, size: 8, font: helvetica, color: grey });
    includedSections.push("Site Documentation & Risk Assessments");
    addFooter(page, 5, 999);

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawSectionHeader(page, y, "5", "Incident Reports");

    if (allIncidents.length === 0) {
      page.drawText("No incident reports recorded.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    } else {
      const incCols = [
        { label: "Title", x: MARGIN, w: 180 },
        { label: "Severity", x: MARGIN + 184, w: 70 },
        { label: "Status", x: MARGIN + 258, w: 70 },
        { label: "Occurred", x: MARGIN + 332, w: 80 },
        { label: "Reported", x: MARGIN + 416, w: 80 },
        { label: "Site", x: MARGIN + 496, w: 60 },
      ];
      for (const col of incCols) { page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const inc of allIncidents) {
        if (y < MARGIN + 25) break;
        const sevColor = inc.severity === "critical" ? red : inc.severity === "high" ? red : inc.severity === "medium" ? amber : blue;
        const stColor = inc.status === "open" ? red : inc.status === "investigating" ? amber : green;
        const siteName = inc.site_id ? (siteMap.get(inc.site_id)?.site_name || "\u2014") : "\u2014";
        page.drawText((inc.title || "Untitled").slice(0, 30), { x: incCols[0].x, y, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText((inc.severity || "unknown").toUpperCase(), { x: incCols[1].x, y, size: 7, font: helveticaBold, color: rgb(sevColor.r, sevColor.g, sevColor.b) });
        page.drawText((inc.status || "unknown").replace(/_/g, " "), { x: incCols[2].x, y, size: 7, font: helveticaBold, color: rgb(stColor.r, stColor.g, stColor.b) });
        page.drawText(inc.occurred_at ? formatDateShort(inc.occurred_at) : "\u2014", { x: incCols[3].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(inc.reported_at ? formatDateShort(inc.reported_at) : "\u2014", { x: incCols[4].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(siteName.slice(0, 10), { x: incCols[5].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        y -= 16;
        page.drawLine({ start: { x: MARGIN, y: y + 6 }, end: { x: PAGE_W - MARGIN, y: y + 6 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    y -= 14;
    y = drawSubHeader(page, y, "Corrective Actions");
    if (allActions.length === 0) {
      page.drawText("No corrective actions recorded.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    } else {
      const actCols = [
        { label: "Action", x: MARGIN, w: 220 },
        { label: "Priority", x: MARGIN + 224, w: 60 },
        { label: "Status", x: MARGIN + 288, w: 70 },
        { label: "Due Date", x: MARGIN + 362, w: 70 },
        { label: "Completed", x: MARGIN + 436, w: 80 },
      ];
      for (const col of actCols) { page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const a of allActions.slice(0, 20)) {
        if (y < MARGIN + 25) break;
        const priColor = a.priority === "critical" ? red : a.priority === "high" ? red : a.priority === "medium" ? amber : blue;
        const actStatusColor = a.status === "open" && a.due_date && a.due_date < nowStr ? red : a.status === "open" ? amber : green;
        page.drawText(((a.action_title || a.title) || "Untitled").slice(0, 36), { x: actCols[0].x, y, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText((a.priority || "medium").toUpperCase(), { x: actCols[1].x, y, size: 7, font: helveticaBold, color: rgb(priColor.r, priColor.g, priColor.b) });
        page.drawText((a.status || "open").replace(/_/g, " "), { x: actCols[2].x, y, size: 7, font: helveticaBold, color: rgb(actStatusColor.r, actStatusColor.g, actStatusColor.b) });
        page.drawText(a.due_date ? formatDateShort(a.due_date) : "\u2014", { x: actCols[3].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(a.completed_at ? formatDateShort(a.completed_at) : "\u2014", { x: actCols[4].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        y -= 15;
        page.drawLine({ start: { x: MARGIN, y: y + 5 }, end: { x: PAGE_W - MARGIN, y: y + 5 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    includedSections.push("Incident Reports & Corrective Actions");
    addFooter(page, 6, 999);

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawSectionHeader(page, y, "6", "Health, Safety & Evidence Quality");

    y = drawSubHeader(page, y, "Health & Safety Evidence");
    if (hnsEvidence.length === 0) {
      page.drawText("No health & safety evidence registered.", { x: MARGIN + 6, y, size: 9, font: helveticaOblique, color: grey });
    } else {
      const evCols = [
        { label: "Item", x: MARGIN, w: 220 },
        { label: "Category", x: MARGIN + 224, w: 100 },
        { label: "Status", x: MARGIN + 328, w: 70 },
        { label: "Expiry", x: MARGIN + 402, w: 70 },
        { label: "Review Date", x: MARGIN + 476, w: 70 },
      ];
      for (const col of evCols) { page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
      y -= 4;

      for (const e of hnsEvidence) {
        if (y < MARGIN + 25) break;
        const du = daysUntil(e.expiry_date);
        let st = e.status; let stColor = green;
        if (e.expiry_date && e.expiry_date < nowStr) { st = "Expired"; stColor = red; }
        else if (du !== null && du <= 30) { st = `Exp ${du}d`; stColor = red; }
        else if (du !== null && du <= 90) { st = `Exp ${du}d`; stColor = amber; }

        page.drawText((e.title || "Untitled").slice(0, 36), { x: evCols[0].x, y, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        page.drawText((e.category || "\u2014").replace(/_/g, " ").slice(0, 16), { x: evCols[1].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(st.replace(/_/g, " "), { x: evCols[2].x, y, size: 8, font: helveticaBold, color: rgb(stColor.r, stColor.g, stColor.b) });
        page.drawText(e.expiry_date ? formatDateShort(e.expiry_date) : "\u2014", { x: evCols[3].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        page.drawText(e.review_date ? formatDateShort(e.review_date) : "\u2014", { x: evCols[4].x, y, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
        y -= 15;
        page.drawLine({ start: { x: MARGIN, y: y + 5 }, end: { x: PAGE_W - MARGIN, y: y + 5 }, thickness: 0.2, color: rgb(0.92, 0.92, 0.92) });
      }
    }
    y -= 14;

    y = drawSubHeader(page, y, "All Evidence by Category");
    const categories = [...new Set(allEvidence.map((e) => e.category))];
    for (const cat of categories) {
      const catItems = allEvidence.filter((e) => e.category === cat);
      const catExpired = catItems.filter((e) => e.expiry_date && e.expiry_date < nowStr).length;
      const catScore = catItems.length > 0 ? Math.round(((catItems.length - catExpired) / catItems.length) * 100) : 100;
      if (y < MARGIN + 20) break;
      page.drawText(`${cat.replace(/_/g, " ")}: ${catItems.length} items, ${catScore}% current`, { x: MARGIN + 6, y, size: 8, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      y -= 12;
      const barW = (UW - 12) * (catScore / 100);
      page.drawRectangle({ x: MARGIN + 6, y, width: UW - 12, height: 3, color: rgb(0.92, 0.92, 0.92) });
      page.drawRectangle({ x: MARGIN + 6, y, width: barW, height: 3, color: rgb(scoreColor(catScore).r, scoreColor(catScore).g, scoreColor(catScore).b) });
      y -= 10;
    }
    includedSections.push("Health, Safety & Evidence Quality");
    addFooter(page, 7, 999);

    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    y = drawSectionHeader(page, y, "7", "Audit Summary & Recommendations");

    y = drawSubHeader(page, y, "Score Breakdown");
    const sumCols = [
      { label: "Area", x: MARGIN, w: 180 },
      { label: "Score", x: MARGIN + 184, w: 70 },
      { label: "Status", x: MARGIN + 258, w: 80 },
      { label: "Weighting", x: MARGIN + 342, w: 60 },
    ];
    for (const col of sumCols) { page.drawText(col.label, { x: col.x, y, size: 7, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) }); }
    y -= 12;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
    y -= 4;

    for (const a of areaScores) {
      if (y < MARGIN + 25) break;
      const sc = scoreColor(a.score);
      let stText = "Excellent";
      if (a.score < 90) stText = "Good";
      if (a.score < 75) stText = "Needs Attention";
      if (a.score < 55) stText = "At Risk";
      if (a.score < 35) stText = "Critical";

      page.drawText(a.name, { x: sumCols[0].x, y, size: 9, font: helvetica, color: darkGrey });
      page.drawText(`${a.score}%`, { x: sumCols[1].x, y, size: 9, font: helveticaBold, color: rgb(sc.r, sc.g, sc.b) });
      page.drawText(stText, { x: sumCols[2].x, y, size: 8, font: helveticaBold, color: rgb(sc.r, sc.g, sc.b) });
      page.drawText(`${a.weight}%`, { x: sumCols[3].x, y, size: 8, font: helvetica, color: grey });
      y -= 18;
      const barW = (UW - 12) * (a.score / 100);
      page.drawRectangle({ x: MARGIN + 6, y: y + 6, width: UW - 12, height: 4, color: rgb(0.92, 0.92, 0.92) });
      page.drawRectangle({ x: MARGIN + 6, y: y + 6, width: barW, height: 4, color: rgb(sc.r, sc.g, sc.b) });
    }

    y -= 20;
    y = drawSubHeader(page, y, "Key Statistics");
    const stats = [
      `Company: ${company?.name || "N/A"}`,
      `Total Guards: ${allGuards.length} (SIA Licensed: ${guardsWithSIA}, Vetting Complete: ${vettingComplete})`,
      `Total Sites: ${allSites.length} (with compliance records: ${allSiteComp.length})`,
      `Total Policies: ${allPolicies.length} (Approved: ${polApproved})`,
      `Training Certs: ${allCerts.length} (Expired: ${expiredCerts}, Expiring 30d: ${certsExpiring30})`,
      `Mandatory Training: ${mandatoryTrainingPct}% complete`,
      `Incidents: ${allIncidents.length} reports`,
      `Corrective Actions: ${allActions.length} (Open: ${openActions}, Overdue: ${overdueActions})`,
      `Patrol Scans: ${patrolScanCount} | DOB Entries: ${dobEntryCount}`,
      `Risk Assessments: ${riskAssessmentCount}`,
    ];
    for (const stat of stats) {
      if (y < MARGIN + 20) break;
      page.drawText(`\u2022  ${stat}`, { x: MARGIN + 6, y, size: 8, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      y -= 14;
    }

    y -= 16;
    page.drawText(`This evidence pack was auto-generated by GuardianHub ACS Compliance Centre.`, { x: MARGIN, y, size: 7, font: helveticaOblique, color: rgb(0.45, 0.45, 0.45) });
    y -= 12;
    page.drawText(`Generated: ${formatDate(nowIso)} — Valid for SIA ACS assessment submission.`, { x: MARGIN, y, size: 7, font: helveticaOblique, color: rgb(0.45, 0.45, 0.45) });

    includedSections.push("Audit Summary & Recommendations");
    addFooter(page, 8, 999);

    const allPages = pdfDoc.getPages();
    const totalPages = allPages.length;
    for (let i = 0; i < totalPages; i++) {
      const p = allPages[i];
      p.drawText(company?.name || "GuardianHub", { x: MARGIN, y: PAGE_H - 25, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      p.drawText(`Page ${i + 1} of ${totalPages}`, { x: PAGE_W - MARGIN - 50, y: PAGE_H - 25, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      p.drawText(`ACS Evidence Pack \u2014 ${formatDateShort(nowIso)}`, { x: MARGIN, y: 25, size: 6, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
      p.drawText("CONFIDENTIAL", { x: PAGE_W - MARGIN - 50, y: 25, size: 6, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
    }

    const pdfBytes = await pdfDoc.save();
    const timestamp = Date.now();
    const storagePath = `${companyId}/acs-evidence-pack_${timestamp}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Failed to upload PDF", detail: uploadError.message }), { status: 500, headers: corsHeaders });
    }

    const { data: signedData } = await supabase.storage.from("reports").createSignedUrl(storagePath, 60 * 60 * 24 * 30);

    const packName = `ACS Evidence Pack \u2014 ${formatDate(nowIso)}`;

    const shareToken = crypto.randomUUID();
    const shareExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: packRecord } = await supabase
      .from("acs_evidence_packs")
      .insert({
        company_id: companyId,
        pack_name: packName,
        generated_by: userId,
        generated_at: nowIso,
        file_url: signedData?.signedUrl,
        storage_path: storagePath,
        share_token: shareToken,
        share_expires_at: shareExpires,
        included_sections: includedSections,
        overall_score: overallScore,
        status: "generated",
      })
      .select("id")
      .maybeSingle();

    return new Response(
      JSON.stringify({
        url: signedData?.signedUrl,
        pack_id: packRecord?.id,
        pack_name: packName,
        overall_score: overallScore,
        readiness_level: readinessLevel,
        area_scores: areaScores.map((a) => ({ name: a.name, score: a.score, weight: a.weight })),
        sections: includedSections,
        share_token: shareToken,
        share_expires_at: shareExpires,
        stats: {
          policies: allPolicies.length,
          guards: allGuards.length,
          sites: allSites.length,
          certs: allCerts.length,
          incidents: allIncidents.length,
          actions: allActions.length,
          patrol_scans: patrolScanCount,
          dob_entries: dobEntryCount,
          risk_assessments: riskAssessmentCount,
          training_pct: mandatoryTrainingPct,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
