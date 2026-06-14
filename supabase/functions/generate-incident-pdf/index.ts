import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateIncidentPDF(data: any, company: any): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import("https://esm.sh/pdf-lib@1.17.1");
  const { drawText, drawImage } = await import("https://esm.sh/pdf-lib@1.17.1");

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const brandColor = company.brand_color || "#3b82f6";
  const brandRgb = hexToRgb(brandColor);

  const MARGIN = 50;
  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const usableWidth = PAGE_WIDTH - MARGIN * 2;

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  y -= 10;
  page.drawText("INCIDENT REPORT", {
    x: MARGIN,
    y,
    size: 24,
    font: helveticaBold,
    color: rgb(brandRgb.r, brandRgb.g, brandRgb.b),
  });
  page.drawText(company.name || "GuardianHub", {
    x: PAGE_WIDTH - MARGIN - 180,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 30;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1.5,
    color: rgb(brandRgb.r, brandRgb.g, brandRgb.b),
  });
  y -= 30;

  const shortRef = data.id?.slice(0, 8) || "UNKNOWN";
  const generatedAt = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  page.drawText(`Reference: ${shortRef}`, { x: MARGIN, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`Generated: ${generatedAt}`, { x: PAGE_WIDTH - MARGIN - 140, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  y = drawBlock(page, y, "Site Information", MARGIN, usableWidth, helveticaBold, helvetica);
  const siteRows = [
    ["Site Name:", data.site_name || "\u2014"],
    ["Address:", data.site_address || "\u2014"],
    ["Risk Level:", (data.site_risk_level || "\u2014").toUpperCase()],
  ];
  y = drawKeyValueRows(page, y, siteRows, MARGIN, usableWidth, helveticaBold, helvetica);
  y -= 20;

  y = drawBlock(page, y, "Incident Summary", MARGIN, usableWidth, helveticaBold, helvetica);

  const severityLabel = (data.severity || "unknown").toUpperCase();

  const summaryRows = [
    ["Incident Type:", data.incident_type || "\u2014"],
    ["Severity:", `${severityLabel}`],
    ["Date/Time of Incident:", data.occurred_at ? formatDateTime(data.occurred_at) : "\u2014"],
    ["Reporting Officer:", data.guard_name || "\u2014"],
    ["SIA Licence:", data.guard_sia || "\u2014"],
    ["Current Status:", (data.status || "\u2014").toUpperCase()],
  ];
  y = drawKeyValueRows(page, y, summaryRows, MARGIN, usableWidth, helveticaBold, helvetica);
  y -= 25;

  y = drawBlock(page, y, "Report Details", MARGIN, usableWidth, helveticaBold, helvetica);

  const reportBody = data.ai_rewritten_report || data.description || "No description provided.";
  const isAi = !!data.ai_rewritten_report;

  if (!isAi) {
    y = drawWrappedText(
      page,
      "Original officer description \u2014 not yet edited.",
      MARGIN,
      y,
      usableWidth,
      9,
      helveticaOblique,
      rgb(0.5, 0.5, 0.5),
    );
    y -= 12;
  }

  if (isAi && reportBody.includes("Summary")) {
    const sections = parseSections(reportBody);
    for (const [heading, body] of sections) {
      y -= 8;
      page.drawText(heading, { x: MARGIN, y, size: 11, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
      y -= 6;
      y = drawWrappedText(page, body.trim(), MARGIN + 8, y, usableWidth - 16, 10, helvetica, rgb(0.25, 0.25, 0.25));
      y -= 10;
      if (y < MARGIN + 60) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
    }
  } else {
    y = drawWrappedText(page, reportBody, MARGIN, y, usableWidth, 10, helvetica, rgb(0.25, 0.25, 0.25));
  }

  y -= 30;

  const media = data.media || [];
  const images = media.filter((m: any) => m.media_type === "image");

  if (images.length > 0) {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    y = drawBlock(page, y, "Photographic Evidence", MARGIN, usableWidth, helveticaBold, helvetica);
    y -= 15;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const resp = await fetch(img.file_url, { method: "GET" });
        if (resp.ok) {
          const imgBytes = new Uint8Array(await resp.arrayBuffer());
          let embeddedImg;
          const contentType = resp.headers.get("content-type") || "";
          if (contentType.includes("png")) {
            embeddedImg = await pdfDoc.embedPng(imgBytes);
          } else {
            embeddedImg = await pdfDoc.embedJpg(imgBytes);
          }

          const maxW = usableWidth / 2 - 10;
          const maxH = 180;
          const scale = Math.min(maxW / embeddedImg.width, maxH / embeddedImg.height, 1);
          const drawW = embeddedImg.width * scale;
          const drawH = embeddedImg.height * scale;

          if (y - drawH < MARGIN + 40) {
            page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            y = PAGE_HEIGHT - MARGIN;
          }

          page.drawImage(embeddedImg, { x: MARGIN, y: y - drawH, width: drawW, height: drawH });

          const caption = `Image ${i + 1} \u2014 uploaded ${formatDateTime(img.created_at)}`;
          y -= drawH + 4;
          page.drawText(caption, {
            x: MARGIN,
            y,
            size: 8,
            font: helveticaOblique,
            color: rgb(0.4, 0.4, 0.4),
          });
          y -= 20;
        }
      } catch {
      }
    }
  }

  page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - MARGIN;
  y = drawBlock(page, y, "Declaration", MARGIN, usableWidth, helveticaBold, helvetica);
  y -= 20;

  page.drawText("Report prepared by:", { x: MARGIN, y, size: 11, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
  y -= 16;
  page.drawText(`${data.generated_by_name || "Operations Manager"}, ${data.generated_by_role || "Operations"}`, {
    x: MARGIN + 10,
    y,
    size: 11,
    font: helveticaBold,
    color: rgb(0.15, 0.15, 0.15),
  });
  y -= 20;

  page.drawText("Date:", { x: MARGIN, y, size: 11, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
  y -= 16;
  page.drawText(generatedAt, { x: MARGIN + 10, y, size: 11, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
  y -= 40;

  page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + 200, y }, thickness: 0.5, color: rgb(0.3, 0.3, 0.3) });
  y -= 14;
  page.drawText("Signature", { x: MARGIN, y, size: 10, font: helveticaOblique, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  page.drawText(`This report is the property of ${company.name || "GuardianHub"} and is confidential.`, {
    x: MARGIN,
    y,
    size: 9,
    font: helveticaOblique,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawText(company.name || "GuardianHub", {
      x: MARGIN,
      y: PAGE_HEIGHT - 25,
      size: 8,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    p.drawText(`Ref: ${shortRef} | Page ${i + 1} of ${pages.length}`, {
      x: PAGE_WIDTH - MARGIN - 140,
      y: PAGE_HEIGHT - 25,
      size: 8,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    const addr = company.address || "";
    p.drawText(`${company.name || "GuardianHub"}${addr ? ` \u2014 ${addr}` : ""} \u2014 ${generatedAt}`, {
      x: MARGIN,
      y: 25,
      size: 7,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return await pdfDoc.save();
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return { r, g, b };
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function parseSections(text: string): [string, string][] {
  const lines = text.split("\n");
  const sections: [string, string][] = [];
  let currentHeading = "";
  let currentBody = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      if (currentHeading) {
        sections.push([currentHeading, currentBody]);
      }
      currentHeading = trimmed.replace(/\*\*/g, "").trim();
      currentBody = "";
    } else {
      currentBody += trimmed + "\n";
    }
  }
  if (currentHeading) {
    sections.push([currentHeading, currentBody]);
  }
  if (sections.length === 0) {
    sections.push(["Details", text]);
  }
  return sections;
}

function drawBlock(page: any, y: number, title: string, x: number, w: number, boldFont: any, normalFont: any) {
  page.drawText(title, { x, y, size: 14, font: boldFont, color: rgb(0.15, 0.15, 0.15) });
  y -= 18;
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 10;
  return y;
}

function drawKeyValueRows(page: any, y: number, rows: [string, string][], x: number, w: number, boldFont: any, normalFont: any) {
  for (const [key, value] of rows) {
    page.drawText(key, { x, y, size: 10, font: boldFont, color: rgb(0.35, 0.35, 0.35) });
    y = drawWrappedText(page, value, x + 130, y, w - 130, 10, normalFont, rgb(0.2, 0.2, 0.2));
    y -= 6;
  }
  return y;
}

function drawWrappedText(page: any, text: string, x: number, y: number, maxWidth: number, size: number, font: any, color: any) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      page.drawText(line, { x, y, size, font, color });
      y -= size + 3;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x, y, size, font, color });
    y -= size + 3;
  }
  return y;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const incidentId = body.incident_id;
    if (!incidentId) {
      return new Response(JSON.stringify({ error: "incident_id required" }), { status: 400, headers: corsHeaders });
    }

    const { data: userProfile } = await supabase.from("users").select("company_id, first_name, last_name, role").eq("id", user.id).maybeSingle();
    const companyId = userProfile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    const { data: incident } = await supabase
      .from("incidents")
      .select(`
        id, company_id, site_id, guard_id,
        incident_type, severity, status, description, ai_rewritten_report,
        occurred_at, created_at, resolved_at,
        sites!inner(id, site_name, address, risk_level),
        guards!left(id, first_name, last_name, sia_licence)
      `)
      .eq("id", incidentId)
      .maybeSingle();

    if (!incident) {
      return new Response(JSON.stringify({ error: "Incident not found" }), { status: 404, headers: corsHeaders });
    }

    if (incident.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Access denied" }), { status: 403, headers: corsHeaders });
    }

    const { data: media } = await supabase
      .from("incident_media")
      .select("id, file_url, media_type, filename, created_at")
      .eq("incident_id", incidentId);

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, logo_url, address, brand_color")
      .eq("id", companyId)
      .maybeSingle();

    const site: any = Array.isArray(incident.sites) ? incident.sites[0] : incident.sites;
    const guard: any = Array.isArray(incident.guards) ? incident.guards[0] : incident.guards;

    const reportData = {
      id: incident.id,
      incident_type: incident.incident_type,
      severity: incident.severity,
      status: incident.status,
      description: incident.description,
      ai_rewritten_report: incident.ai_rewritten_report,
      occurred_at: incident.occurred_at,
      created_at: incident.created_at,
      site_name: site?.site_name,
      site_address: site?.address,
      site_risk_level: site?.risk_level,
      guard_name: guard ? `${guard.first_name || ""} ${guard.last_name || ""}`.trim() : null,
      guard_sia: guard?.sia_licence,
      media: media || [],
      generated_by_name: `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`.trim() || "Operations Manager",
      generated_by_role: userProfile?.role || "operations_manager",
    };

    const pdfBytes = await generateIncidentPDF(reportData, company || {});

    const timestamp = Date.now();
    const storagePath = `${companyId}/incidents/${incidentId}_${timestamp}.pdf`;
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
        site_id: incident.site_id,
        report_type: "incident",
        reference_id: incidentId,
        title: `Incident Report \u2014 ${incident.incident_type || "Incident"} at ${site?.site_name || "Unknown"}`,
        file_url: fileUrl,
        generated_by: user.id,
        generated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    const { data: signedData, error: signedError } = await supabase.storage
      .from("reports")
      .createSignedUrl(storagePath, 60 * 60 * 24);

    const signedUrl = signedData?.signedUrl || fileUrl;

    return new Response(
      JSON.stringify({
        url: signedUrl,
        public_url: fileUrl,
        report_id: reportRecord?.id,
        path: storagePath,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
