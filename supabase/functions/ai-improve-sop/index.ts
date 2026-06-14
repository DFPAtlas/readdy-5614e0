import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface SOPContent {
  sop_type: string;
  title: string;
  client_name?: string;
  site_id?: string;
  purpose?: string;
  scope?: string;
  roles?: { role: string; responsibility: string }[];
  equipment?: string[];
  procedure_steps?: { step: number; instruction: string; expectedOutcome?: string }[];
  risks_controls?: { risk: string; control: string }[];
  ppe?: string;
  health_safety_notes?: string;
  emergency_contacts?: { name: string; role: string; phone: string }[];
  escalation_procedure?: string;
  reporting_requirements?: string;
  guard_acknowledgement_statement?: string;
  review_date?: string;
  guard_role?: string;
  shift_type?: string;
}

function getSOPTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    site_opening: "Site Opening",
    site_lock_up: "Site Lock-Up",
    patrol_procedure: "Patrol Procedure",
    fire_evacuation: "Fire Evacuation",
    alarm_activation: "Alarm Activation Response",
    cctv_monitoring: "CCTV Monitoring",
    visitor_management: "Visitor Management",
    key_holding: "Key Holding",
    lone_worker: "Lone Worker Procedure",
    incident_reporting: "Incident Reporting",
    assignment_instructions: "Assignment Instructions",
    emergency_response: "Emergency Response",
  };
  return labels[type] || type;
}

async function callOpenAI(messages: any[], temperature = 0.3): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: 3000,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

function formatSOPForPrompt(content: SOPContent): string {
  let text = `SOP Type: ${getSOPTypeLabel(content.sop_type)}\n`;
  text += `Title: ${content.title || "Untitled"}\n`;
  if (content.client_name) text += `Client: ${content.client_name}\n`;
  if (content.guard_role) text += `Guard Role: ${content.guard_role}\n`;
  if (content.shift_type) text += `Shift Type: ${content.shift_type}\n`;
  if (content.purpose) text += `Purpose: ${content.purpose}\n`;
  if (content.scope) text += `Scope: ${content.scope}\n`;
  if (content.roles?.length) {
    text += "Roles:\n";
    content.roles.forEach((r) => text += `  - ${r.role}: ${r.responsibility}\n`);
  }
  if (content.equipment?.length) {
    text += "Equipment:\n";
    content.equipment.forEach((e) => text += `  - ${e}\n`);
  }
  if (content.procedure_steps?.length) {
    text += "Procedure Steps:\n";
    content.procedure_steps.forEach((s) => {
      text += `  Step ${s.step}: ${s.instruction}\n`;
      if (s.expectedOutcome) text += `    Expected outcome: ${s.expectedOutcome}\n`;
    });
  }
  if (content.risks_controls?.length) {
    text += "Risks & Controls:\n";
    content.risks_controls.forEach((r) => text += `  Risk: ${r.risk}\n  Control: ${r.control}\n`);
  }
  if (content.ppe) text += `PPE: ${content.ppe}\n`;
  if (content.health_safety_notes) text += `Health & Safety: ${content.health_safety_notes}\n`;
  if (content.escalation_procedure) text += `Escalation: ${content.escalation_procedure}\n`;
  if (content.reporting_requirements) text += `Reporting: ${content.reporting_requirements}\n`;
  if (content.guard_acknowledgement_statement) text += `Acknowledgement: ${content.guard_acknowledgement_statement}\n`;
  return text;
}

async function improveWording(content: SOPContent): Promise<Partial<SOPContent>> {
  const prompt = `You are a professional UK security operations document editor. Improve the wording, clarity, and professionalism of the following SOP while keeping all meaning intact. Use British English, clear concise language, and professional security industry terminology.

${formatSOPForPrompt(content)}

Return ONLY a JSON object with the same structure as the input, where each text field has been improved. Do NOT add new sections or fields that don't exist. Keep the same step numbers and roles. Return ONLY valid JSON — no markdown formatting, no code blocks.`;

  const response = await callOpenAI([
    { role: "system", content: "You are a professional document editor for UK security companies. You improve wording while preserving structure. Always output valid JSON only." },
    { role: "user", content: prompt },
  ]);

  try {
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

async function addHealthSafety(content: SOPContent): Promise<Partial<SOPContent>> {
  const prompt = `You are a UK health and safety specialist for security operations. Based on the following SOP, generate appropriate health & safety content and PPE requirements.

${formatSOPForPrompt(content)}

Return a JSON object with these fields ONLY:
{
  "ppe": "string listing required PPE",
  "health_safety_notes": "string with detailed H&S notes",
  "risks_controls": [{"risk": "risk description", "control": "control measure"}] — if the SOP already has risks, add any missing ones
}

Return ONLY valid JSON — no markdown formatting, no code blocks.`;

  const response = await callOpenAI([
    { role: "system", content: "You are a UK health and safety specialist for security operations. Generate practical, compliant H&S content. Always output valid JSON only." },
    { role: "user", content: prompt },
  ]);

  try {
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

async function addEscalation(content: SOPContent): Promise<Partial<SOPContent>> {
  const prompt = `You are a UK security operations manager. Based on the following SOP, write a clear escalation procedure with specific steps, contact points, and timeframes.

${formatSOPForPrompt(content)}

Return a JSON object:
{
  "escalation_procedure": "clear escalation steps with timeframes",
  "emergency_contacts": [{"name": "name", "role": "role", "phone": "phone"}]
}

Make the escalation practical and specific to the SOP type. Return ONLY valid JSON.`;

  const response = await callOpenAI([
    { role: "system", content: "You are an experienced UK security operations manager. Write clear escalation procedures. Always output valid JSON only." },
    { role: "user", content: prompt },
  ]);

  try {
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

async function completeMissingSections(content: SOPContent): Promise<Partial<SOPContent>> {
  const prompt = `You are an expert SOP writer for UK security companies. The following SOP has some missing sections. Fill in any empty or minimal fields with comprehensive, professional content appropriate for a ${getSOPTypeLabel(content.sop_type)} SOP.

${formatSOPForPrompt(content)}

Return a JSON object with ONLY the fields that need to be filled or improved. Do not overwrite fields that already have good content. Return ONLY valid JSON.`;

  const response = await callOpenAI([
    { role: "system", content: "You are an expert SOP writer for UK security companies. Fill gaps with professional content. Always output valid JSON only." },
    { role: "user", content: prompt },
  ]);

  try {
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

async function generalReview(content: SOPContent): Promise<{
  improvements: { section: string; original: string; improved: string }[];
  improved_content_json: Partial<SOPContent>;
  summary: string;
}> {
  const prompt = `You are a senior UK security compliance officer reviewing an SOP document. Review the following SOP and provide specific improvements.

${formatSOPForPrompt(content)}

Return a JSON object:
{
  "summary": "brief overall assessment",
  "improvements": [
    {
      "section": "field name (e.g. purpose, scope, procedure_steps, etc.)",
      "original": "the original text or a summary",
      "improved": "the improved text"
    }
  ],
  "improved_content_json": { ...the full improved content JSON... }
}

Be thorough and specific. Return ONLY valid JSON.`;

  const response = await callOpenAI([
    { role: "system", content: "You are a senior UK security compliance officer. Provide thorough, specific SOP improvements. Always output valid JSON only." },
    { role: "user", content: prompt },
  ]);

  try {
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { improvements: [], improved_content_json: {}, summary: "Could not generate review." };
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

    const { data: userProfile } = await supabase
      .from("users")
      .select("company_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const companyId = userProfile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { sop_id, action, content_json } = body;

    if (!action || !content_json) {
      return new Response(JSON.stringify({ error: "action and content_json required" }), { status: 400, headers: corsHeaders });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), { status: 500, headers: corsHeaders });
    }

    let result: any;

    switch (action) {
      case "improve_wording":
        result = await improveWording(content_json);
        break;
      case "add_health_safety":
        result = await addHealthSafety(content_json);
        break;
      case "add_escalation":
        result = await addEscalation(content_json);
        break;
      case "complete_sections":
        result = await completeMissingSections(content_json);
        break;
      case "general_review":
        result = await generalReview(content_json);
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
    }

    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      user_id: user.id,
      action_type: "sop_improve",
      details: { sop_id, action, has_improvements: Object.keys(result).length > 0 },
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
