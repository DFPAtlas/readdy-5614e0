'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Source {
  document_id: string;
  document_title: string;
  snippet: string;
}

interface ChatEntry {
  question: string;
  answer: string;
  sources: Source[];
  createdAt: string;
  conversationId: string;
}

interface Props {
  topQuestions: { text: string; count: number }[];
  companyId: string | null;
}

export default function TopQuestionsWidget({ topQuestions, companyId }: Props) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleQuestionClick = useCallback(async (q: string) => {
    if (!companyId) return;
    setSelectedQuestion(q);
    setLoading(true);

    const norm = q.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\s]/g, '');

    const { data } = await supabase
      .from('sop_chat_messages')
      .select('content, conversation_id, created_at, retrieved_chunk_ids')
      .eq('company_id', companyId)
      .eq('role', 'user')
      .ilike('content', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    const userEntries = (data || []).filter((m) => {
      const mNorm = m.content.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\s]/g, '');
      return mNorm === norm || m.content.toLowerCase().includes(q.toLowerCase());
    });

    const convIds = [...new Set(userEntries.map((e) => e.conversation_id))];
    if (convIds.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const { data: assistantMsgs } = await supabase
      .from('sop_chat_messages')
      .select('content, conversation_id, created_at, retrieved_chunk_ids')
      .eq('company_id', companyId)
      .eq('role', 'assistant')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false });

    const assistantMap = new Map<string, typeof assistantMsgs[0]>();
    for (const a of assistantMsgs || []) {
      if (!assistantMap.has(a.conversation_id)) {
        assistantMap.set(a.conversation_id, a);
      }
    }

    const chunkIds: string[] = [];
    for (const a of assistantMsgs || []) {
      for (const cid of a.retrieved_chunk_ids || []) {
        if (typeof cid === 'string') chunkIds.push(cid);
      }
    }

    let sourceMap = new Map<string, { title: string; snippet: string }>();
    if (chunkIds.length > 0) {
      const { data: chunksData } = await supabase
        .from('sop_chunks')
        .select('id, document_id, content, document:sop_documents!inner(title)')
        .in('id', chunkIds.slice(0, 50));
      for (const c of chunksData || []) {
        const docTitle = (c.document as any)?.title || 'SOP Document';
        sourceMap.set(c.id, { title: docTitle, snippet: c.content?.slice(0, 100) || '' });
      }
    }

    const results: ChatEntry[] = [];
    for (const u of userEntries.slice(0, 5)) {
      const a = assistantMap.get(u.conversation_id);
      if (!a) continue;
      const sources: Source[] = [];
      for (const cid of a.retrieved_chunk_ids || []) {
        const s = sourceMap.get(cid);
        if (s) {
          sources.push({
            document_id: cid,
            document_title: s.title,
            snippet: s.snippet,
          });
        }
      }
      results.push({
        question: u.content,
        answer: a.content,
        sources,
        createdAt: u.created_at,
        conversationId: u.conversation_id,
      });
    }

    setEntries(results);
    setLoading(false);
  }, [companyId]);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Top Questions This Month</h3>
        <span className="text-xs text-gray-500">{topQuestions.length} unique</span>
      </div>

      {topQuestions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No questions asked yet</p>
      ) : (
        <div className="space-y-1">
          {topQuestions.map((q) => (
            <div key={q.text}>
              <button
                onClick={() => handleQuestionClick(q.text)}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <span className="text-sm text-gray-300 truncate pr-3">{q.text}</span>
                <span className="text-xs font-medium text-blue-400 flex-shrink-0 bg-blue-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {q.count}×
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Side panel */}
      {selectedQuestion && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex justify-end"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedQuestion(null); }}
        >
          <div className="w-full max-w-lg bg-[#0B0F1C] border-l border-gray-800 h-full overflow-y-auto">
            <div className="sticky top-0 bg-[#0B0F1C] border-b border-gray-800 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Question History</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{selectedQuestion}</p>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-line"></i>
                </div>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-12 gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}

              {!loading && entries.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No matching responses found</p>
              )}

              {entries.map((entry, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-3.5 py-2.5 rounded-xl text-sm max-w-[85%]">
                      <div className="whitespace-pre-wrap">{entry.question}</div>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-800/80 border border-gray-700/50 text-gray-200 px-3.5 py-2.5 rounded-xl text-sm max-w-[85%]">
                      <div className="whitespace-pre-wrap">{entry.answer}</div>
                    </div>
                  </div>

                  {entry.sources.length > 0 && (
                    <div className="ml-2 space-y-1.5">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">Sources</p>
                      {entry.sources.map((src) => (
                        <div key={src.document_id} className="bg-gray-800/40 border border-gray-700/40 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-3.5 h-3.5 flex items-center justify-center">
                              <i className="ri-file-text-line text-violet-400 text-xs"></i>
                            </div>
                            <span className="text-xs font-medium text-violet-300">{src.document_title}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{src.snippet}...</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-gray-600 text-center">
                    {new Date(entry.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}