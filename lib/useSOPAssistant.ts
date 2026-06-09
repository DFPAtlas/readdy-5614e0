'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Source {
  document_id: string;
  document_title: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  retrievedChunkIds?: string[];
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
}

interface UseSOPAssistantReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string | null;
  conversations: Conversation[];
  conversationsLoading: boolean;
  sendQuestion: (question: string, siteId?: string) => Promise<void>;
  startNewConversation: () => void;
  loadConversation: (id: string) => Promise<void>;
  clearChat: () => void;
  loadConversations: () => Promise<void>;
}

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/ai-ask-sop';

export function useSOPAssistant(): UseSOPAssistantReturn {
  const { companyId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const conversationRef = useRef<string | null>(null);
  const hasLoadedInitial = useRef(false);

  useEffect(() => {
    conversationRef.current = conversationId;
  }, [conversationId]);

  const startNewConversation = useCallback(() => {
    const newId = crypto.randomUUID();
    setConversationId(newId);
    conversationRef.current = newId;
    setMessages([
      {
        id: 'welcome-' + newId,
        role: 'assistant',
        content: "Hello! I'm your SOP Assistant. Ask me anything about your site's procedures, protocols, or emergency instructions.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (!hasLoadedInitial.current) {
      hasLoadedInitial.current = true;
      startNewConversation();
    }
  }, [startNewConversation]);

  const loadConversations = useCallback(async () => {
    if (!companyId) return;
    setConversationsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('sop_chat_messages')
        .select('conversation_id, content, created_at')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .eq('role', 'user')
        .order('created_at', { ascending: true });

      const seen = new Set<string>();
      const convs: Conversation[] = [];
      for (const row of data || []) {
        if (!seen.has(row.conversation_id)) {
          seen.add(row.conversation_id);
          convs.push({
            id: row.conversation_id,
            title: row.content.slice(0, 60) + (row.content.length > 60 ? '...' : ''),
            createdAt: new Date(row.created_at),
          });
        }
      }
      setConversations(convs.reverse());
    } finally {
      setConversationsLoading(false);
    }
  }, [companyId]);

  const loadConversation = useCallback(async (id: string) => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('sop_chat_messages')
        .select('*')
        .eq('conversation_id', id)
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

      const loaded: ChatMessage[] = (data || []).map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at),
        retrievedChunkIds: m.retrieved_chunk_ids || undefined,
      }));

      setMessages(loaded);
      setConversationId(id);
      conversationRef.current = id;
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const sendQuestion = useCallback(async (question: string, siteId?: string) => {
    if (!question.trim() || isLoading || !companyId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const body: Record<string, unknown> = {
        question,
        conversation_id: conversationRef.current,
      };
      if (siteId) body.site_id = siteId;

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      if (data.conversation_id && data.conversation_id !== conversationRef.current) {
        setConversationId(data.conversation_id);
        conversationRef.current = data.conversation_id;
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || 'No answer received.',
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I ran into an issue: ${err.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, companyId]);

  const clearChat = useCallback(() => {
    startNewConversation();
  }, [startNewConversation]);

  return {
    messages,
    isLoading,
    conversationId,
    conversations,
    conversationsLoading,
    sendQuestion,
    startNewConversation,
    loadConversation,
    clearChat,
    loadConversations,
  };
}