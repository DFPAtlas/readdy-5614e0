import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MAX_CHUNKS = 8;
const SIMILARITY_THRESHOLD = 0.78;

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

async function createEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Embedding API error: ${err}`);
  }
  const data = await resp.json();
  return data.data[0].embedding;
}

async function generateAnswer(question: string, chunks: any[], conversationHistory: any[]): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

  const context = chunks
    .map((c, i) => `[Document ${i + 1}]\n${c.content}\n(Source: ${c.document_title || "SOP Document"})`)
    .join("\n\n---\n\n");

  const messages: any[] = [
    {
      role: "system",
      content: `You are the SOP Assistant for GuardianHub, a UK security operations platform. You answer questions about Standard Operating Procedures, site protocols, guard instructions, emergency procedures, and company policy documents.

Rules:
- Base your answer ONLY on the provided document chunks below.
- If the answer is not in the documents, say so clearly \u2014 do not invent facts.
- Use British English.
- Be concise and factual. Bullet points are fine.
- If the user asks something clearly unrelated to security operations, politely redirect them.
- Cite which document you're drawing from when possible.

Context documents:
${context}`,
    },
  ];

  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: "user", content: question });

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.15,
      max_tokens: 1200,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI chat error: ${err}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { question, document_id, conversation_id, site_id } = body;
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "question required" }), { status: 400, headers: corsHeaders });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), { status: 500, headers: corsHeaders });
    }

    let docFilter: string | null = null;
    if (document_id && isValidUUID(document_id)) {
      const { data: docCheck } = await supabase
        .from("sop_documents")
        .select("id")
        .eq("id", document_id)
        .eq("company_id", companyId)
        .maybeSingle();
      if (docCheck) docFilter = document_id;
    }

    if (site_id && isValidUUID(site_id) && !docFilter) {
      const { data: siteDocs } = await supabase
        .from("sop_documents")
        .select("id")
        .eq("site_id", site_id)
        .eq("company_id", companyId);
      if (siteDocs && siteDocs.length > 0) {
        docFilter = siteDocs[0].id;
      }
    }

    const questionEmbedding = await createEmbedding(question);

    let rpcParams: any = {
      query_embedding: questionEmbedding,
      match_threshold: SIMILARITY_THRESHOLD,
      match_count: MAX_CHUNKS,
      company_filter: companyId,
    };

    const { data: matches, error: matchErr } = await supabase
      .rpc("match_sop_chunks", rpcParams);

    if (matchErr) {
      return new Response(JSON.stringify({ error: matchErr.message }), { status: 500, headers: corsHeaders });
    }

    let chunks = (matches || []).filter((m: any) => !docFilter || m.document_id === docFilter);

    if (chunks.length === 0 && !docFilter) {
      const { data: fallback } = await supabase
        .rpc("match_sop_chunks", {
          query_embedding: questionEmbedding,
          match_threshold: 0.65,
          match_count: MAX_CHUNKS,
          company_filter: companyId,
        });
      chunks = fallback || [];
    }

    const conversationHistory: any[] = [];
    if (conversation_id && isValidUUID(conversation_id)) {
      const { data: history } = await supabase
        .from("sop_chat_messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(20);
      if (history) {
        for (const msg of history) {
          conversationHistory.push({ role: msg.role, content: msg.content });
        }
      }
    }

    let answer = "";
    let sourceDocs: string[] = [];

    if (chunks.length === 0) {
      answer = "I couldn't find any relevant SOP documents to answer that question. Try uploading procedure documents first, or rephrase your question.";
    } else {
      sourceDocs = [...new Set(chunks.map((c: any) => c.document_title || "Unknown"))];
      answer = await generateAnswer(question, chunks, conversationHistory);
    }

    const newConversationId = conversation_id || crypto.randomUUID();

    const chunkIds = chunks.map((c: any) => c.id);
    const { error: msgErr } = await supabase.from("sop_chat_messages").insert([
      {
        company_id: companyId,
        user_id: user.id,
        conversation_id: newConversationId,
        role: "user",
        content: question,
      },
      {
        company_id: companyId,
        user_id: user.id,
        conversation_id: newConversationId,
        role: "assistant",
        content: answer,
        retrieved_chunk_ids: chunkIds,
      },
    ]);

    if (msgErr) {
      console.error("Failed to save chat messages:", msgErr);
    }

    await supabase.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "sop_query",
      details: {
        conversation_id: newConversationId,
        chunks_retrieved: chunks.length,
        source_documents: sourceDocs,
        question_length: question.length,
        document_id: docFilter,
      },
    });

    return new Response(
      JSON.stringify({
        answer,
        conversation_id: newConversationId,
        sources: sourceDocs,
        chunks_used: chunks.length,
        chunks: chunks.map((c: any) => ({
          content_preview: c.content?.slice(0, 200) + "...",
          document_title: c.document_title,
          similarity: c.similarity,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
