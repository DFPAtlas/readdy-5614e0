import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }
    let boundary = text.lastIndexOf("\n", end);
    if (boundary <= start) boundary = text.lastIndexOf(". ", end);
    if (boundary <= start) boundary = text.lastIndexOf(" ", end);
    if (boundary <= start) boundary = end;
    chunks.push(text.slice(start, boundary).trim());
    start = boundary - overlap;
    if (start < 0) start = 0;
  }
  return chunks.filter((c) => c.length > 50);
}

async function fetchDocumentText(fileUrl: string): Promise<string> {
  const resp = await fetch(fileUrl);
  if (!resp.ok) throw new Error(`Failed to fetch document: ${resp.status}`);
  const contentType = resp.headers.get("content-type") || "";
  if (contentType.includes("text/plain")) {
    return await resp.text();
  }
  if (contentType.includes("application/pdf")) {
    return "[PDF content extraction not available via direct fetch. Please ensure text content is provided.]";
  }
  if (contentType.includes("text/html")) {
    const html = await resp.text();
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const raw = await resp.text();
  return raw.slice(0, 50000);
}

async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Embedding API error: ${err}`);
  }
  const data = await resp.json();
  return data.data.map((d: any) => d.embedding);
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
    const { document_id } = body;
    if (!document_id || !isValidUUID(document_id)) {
      return new Response(JSON.stringify({ error: "document_id required" }), { status: 400, headers: corsHeaders });
    }

    const { data: doc } = await supabase
      .from("sop_documents")
      .select("id, company_id, file_url, file_name, title, file_size")
      .eq("id", document_id)
      .maybeSingle();

    if (!doc || doc.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Document not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    if (!OPENAI_API_KEY) {
      await supabase.from("sop_documents").update({ error_message: "OpenAI API key not configured" }).eq("id", document_id);
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), { status: 500, headers: corsHeaders });
    }

    await supabase.from("sop_chunks").delete().eq("document_id", document_id);

    let text: string;
    try {
      text = await fetchDocumentText(doc.file_url);
    } catch (err: any) {
      await supabase.from("sop_documents").update({ error_message: err.message }).eq("id", document_id);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }

    if (!text || text.length < 100) {
      await supabase.from("sop_documents").update({ error_message: "Document text too short or unreadable" }).eq("id", document_id);
      return new Response(JSON.stringify({ error: "Document text too short or unreadable" }), { status: 400, headers: corsHeaders });
    }

    const chunks = splitIntoChunks(text, CHUNK_SIZE, CHUNK_OVERLAP);
    if (chunks.length === 0) {
      await supabase.from("sop_documents").update({ error_message: "No usable chunks extracted" }).eq("id", document_id);
      return new Response(JSON.stringify({ error: "No usable chunks extracted" }), { status: 400, headers: corsHeaders });
    }

    const embeddings: number[][] = [];
    const batchSize = 100;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchEmbeddings = await createEmbeddings(batch);
      embeddings.push(...batchEmbeddings);
    }

    const chunkRows = chunks.map((content, i) => ({
      company_id: companyId,
      document_id: document_id,
      chunk_index: i,
      content,
      embedding: embeddings[i],
      metadata: { char_start: i * (CHUNK_SIZE - CHUNK_OVERLAP), total_chunks: chunks.length },
    }));

    const { error: insertError } = await supabase.from("sop_chunks").insert(chunkRows);
    if (insertError) {
      await supabase.from("sop_documents").update({ error_message: insertError.message }).eq("id", document_id);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders });
    }

    await supabase.from("sop_documents").update({ error_message: null }).eq("id", document_id);

    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "sop_index",
      details: { document_id, chunks_count: chunks.length, file_name: doc.file_name },
    });

    return new Response(
      JSON.stringify({ success: true, chunks_indexed: chunks.length, document_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
