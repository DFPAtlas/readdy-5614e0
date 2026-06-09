import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import pdfParse from "https://esm.sh/pdf-parse@1.1.1";
import mammoth from "https://esm.sh/mammoth@1.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const CHUNK_TARGET = 2000;
const CHUNK_OVERLAP = 200;
const MAX_CHARS = 400000;

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

async function extractText(fileUrl: string, fileType: string | null): Promise<string> {
  const resp = await fetch(fileUrl);
  if (!resp.ok) throw new Error(`Failed to download file: ${resp.status}`);

  const type = (fileType || "").toLowerCase();
  const buffer = await resp.arrayBuffer();

  if (type === "pdf") {
    try {
      const data = await pdfParse(new Uint8Array(buffer));
      return data.text || "";
    } catch (e: any) {
      throw new Error(`PDF extraction failed: ${e.message}`);
    }
  }

  if (type === "docx" || type === "doc") {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value || "";
    } catch (e: any) {
      throw new Error(`DOCX extraction failed: ${e.message}`);
    }
  }

  return new TextDecoder().decode(new Uint8Array(buffer));
}

function splitIntoChunks(text: string, targetSize = CHUNK_TARGET, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + targetSize;
    if (end >= text.length) {
      const final = text.slice(start).trim();
      if (final.length > 50) chunks.push(final);
      break;
    }

    let boundary = text.lastIndexOf("\n\n", end);
    if (boundary <= start || boundary - start < targetSize * 0.5) {
      boundary = text.lastIndexOf("\n", end);
    }
    if (boundary <= start || boundary - start < targetSize * 0.5) {
      boundary = text.lastIndexOf(". ", end);
    }
    if (boundary <= start || boundary - start < targetSize * 0.5) {
      boundary = text.lastIndexOf(" ", end);
    }
    if (boundary <= start) boundary = end;

    const chunk = text.slice(start, boundary).trim();
    if (chunk.length > 50) chunks.push(chunk);
    start = boundary - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
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
      dimensions: 1536,
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Embedding API error: ${err}`);
  }
  const data = await resp.json();
  return data.data.map((d: any) => d.embedding);
}

async function markFailed(supabaseService: any, documentId: string, message: string) {
  await supabaseService
    .from("sop_documents")
    .update({ status: "failed", error_message: message })
    .eq("id", documentId);
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

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("company_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const companyId = profile?.company_id;
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company assigned" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { document_id } = body;

    if (!document_id || !isValidUUID(document_id)) {
      return new Response(JSON.stringify({ error: "document_id required" }), { status: 400, headers: corsHeaders });
    }

    const { data: doc } = await supabaseService
      .from("sop_documents")
      .select("id, company_id, file_url, file_name, title, file_type, file_size, status")
      .eq("id", document_id)
      .maybeSingle();

    if (!doc || doc.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Document not found or access denied" }), { status: 404, headers: corsHeaders });
    }

    if (!OPENAI_API_KEY) {
      await markFailed(supabaseService, document_id, "OpenAI API key not configured");
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), { status: 500, headers: corsHeaders });
    }

    await supabaseService.from("sop_chunks").delete().eq("document_id", document_id);

    await supabaseService
      .from("sop_documents")
      .update({ status: "processing", error_message: null })
      .eq("id", document_id);

    let text: string;
    try {
      text = await extractText(doc.file_url, doc.file_type);
    } catch (err: any) {
      await markFailed(supabaseService, document_id, err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }

    if (!text || text.trim().length < 100) {
      await markFailed(supabaseService, document_id, "Document text too short or unreadable");
      return new Response(JSON.stringify({ error: "Document text too short or unreadable" }), { status: 400, headers: corsHeaders });
    }

    if (text.length > MAX_CHARS) {
      await markFailed(supabaseService, document_id, "Document too large (exceeds ~100,000 tokens)");
      return new Response(JSON.stringify({ error: "Document too large" }), { status: 400, headers: corsHeaders });
    }

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      await markFailed(supabaseService, document_id, "No usable chunks extracted");
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
      metadata: {
        char_start: i * (CHUNK_TARGET - CHUNK_OVERLAP),
        total_chunks: chunks.length,
      },
    }));

    const { error: insertError } = await supabaseService.from("sop_chunks").insert(chunkRows);
    if (insertError) {
      await markFailed(supabaseService, document_id, insertError.message);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders });
    }

    await supabaseService
      .from("sop_documents")
      .update({ status: "indexed", error_message: null })
      .eq("id", document_id);

    const tokensUsed = Math.round(chunks.reduce((sum, c) => sum + c.length, 0) / 4);
    const costPence = Math.round(tokensUsed * 0.000002 * 100 * 1000) / 1000;
    await supabaseService.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "sop_indexed",
      details: {
        document_id,
        chunks_count: chunks.length,
        file_name: doc.file_name,
        tokens_used: tokensUsed,
        cost_pence: costPence,
      },
    });

    return new Response(
      JSON.stringify({ success: true, chunks_indexed: chunks.length, document_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: corsHeaders },
    );
  }
});
