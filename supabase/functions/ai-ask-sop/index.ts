import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const GREETINGS = new Set([
  "hi", "hello", "hey", "greetings", "yo", "howdy", "hiya",
  "thanks", "thank you", "cheers", "ta", "nice one",
  "bye", "goodbye", "see ya", "cya", "later",
]);

function isConversational(question: string): boolean {
  const words = question.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length < 4) return true;
  for (const w of words) {
    if (GREETINGS.has(w)) return true;
  }
  return false;
}

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

async function generateAnswer(question: string, chunks: any[]): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.document_title || "SOP Document"}\n${c.content}`)
    .join("\n\n---\n\n");

  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant for UK security staff. Answer using ONLY the provided SOP extracts. If the answer isn't in the context, say so — never invent procedures. Be concise. Cite document titles. Use British English.`,
    },
    {
      role: "user",
      content: `Question: ${question}\n\nSOP extracts:\n${context}`,
    },
  ];

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 600,
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
    const { question, conversation_id, site_id } = body;

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "question required" }), { status: 400, headers: corsHeaders });
    }

    const convId = isValidUUID(conversation_id || "") ? conversation_id : crypto.randomUUID();

    // 2. Pre-check conversational
    if (isConversational(question)) {
      const greeting = "Hi! Ask me a question about your site procedures or operations.";

      await supabaseService.from("sop_chat_messages").insert([
        { company_id: companyId, user_id: user.id, conversation_id: convId, role: "user", content: question },
        { company_id: companyId, user_id: user.id, conversation_id: convId, role: "assistant", content: greeting, retrieved_chunk_ids: [] },
      ]);

      await supabaseService.from("ai_activity_logs").insert({
        company_id: companyId,
        action_type: "sop_query",
        details: { conversation_id: convId, chunks_retrieved: 0, question_length: question.length, site_id: site_id || null, greeting: true },
      });

      return new Response(
        JSON.stringify({ answer: greeting, sources: [], conversation_id: convId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), { status: 500, headers: corsHeaders });
    }

    // 3. Generate embedding
    const questionEmbedding = await createEmbedding(question);

    // 4 + 5. Vector search via RPC
    const matchSiteId = isValidUUID(site_id || "") ? site_id : null;

    const { data: matches, error: matchErr } = await supabase.rpc("match_sop_chunks", {
      query_embedding: questionEmbedding,
      match_company_id: companyId,
      match_site_id: matchSiteId,
      match_threshold: 0.5,
      match_count: 6,
    });

    if (matchErr) {
      return new Response(JSON.stringify({ error: matchErr.message }), { status: 500, headers: corsHeaders });
    }

    const chunks = matches || [];

    // 6. No chunks found
    if (chunks.length === 0) {
      const fallback = "I couldn't find anything about that in your SOPs. You may want to ask your operations manager.";

      await supabaseService.from("sop_chat_messages").insert([
        { company_id: companyId, user_id: user.id, conversation_id: convId, role: "user", content: question },
        { company_id: companyId, user_id: user.id, conversation_id: convId, role: "assistant", content: fallback, retrieved_chunk_ids: [] },
      ]);

      await supabaseService.from("ai_activity_logs").insert({
        company_id: companyId,
        action_type: "sop_query",
        details: { conversation_id: convId, chunks_retrieved: 0, question_length: question.length, site_id: matchSiteId },
      });

      return new Response(
        JSON.stringify({ answer: fallback, sources: [], conversation_id: convId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 7. Build context + 8. Generate answer
    const answer = await generateAnswer(question, chunks);

    // 9 + 10. Save chat messages
    const chunkIds = chunks.map((c: any) => c.id);

    await supabaseService.from("sop_chat_messages").insert([
      { company_id: companyId, user_id: user.id, conversation_id: convId, role: "user", content: question },
      { company_id: companyId, user_id: user.id, conversation_id: convId, role: "assistant", content: answer, retrieved_chunk_ids: chunkIds },
    ]);

    // 11. Log activity
    await supabaseService.from("ai_activity_logs").insert({
      company_id: companyId,
      action_type: "sop_query",
      details: {
        conversation_id: convId,
        chunks_retrieved: chunks.length,
        question_length: question.length,
        site_id: matchSiteId,
      },
    });

    // 12. Build sources
    const sources = chunks.map((c: any) => ({
      document_id: c.document_id,
      document_title: c.document_title || "SOP Document",
      snippet: (c.content || "").slice(0, 100),
    }));

    return new Response(
      JSON.stringify({ answer, sources, conversation_id: convId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: corsHeaders },
    );
  }
});