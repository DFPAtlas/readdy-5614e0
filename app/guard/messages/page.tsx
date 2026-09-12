'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useGuardAuth } from '@/lib/useGuardAuth';
import GuardBottomNav from '../components/GuardBottomNav';

interface Message {
  id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
  is_mine: boolean;
}

export default function GuardMessagesPage() {
  const g = useGuardAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const siteId = g.todayShift?.site_id || g.nextShift?.site_id || null;
  const siteName = g.todayShift?.site?.site_name || g.nextShift?.site?.site_name || null;

  const loadMessages = useCallback(async () => {
    if (!g.currentUser || !g.companyId) { setLoading(false); return; }

    const items: Message[] = [];

    if (siteId && g.guardId) {
      const { data: clientMsgs } = await supabase
        .from('client_messages')
        .select('id, sender_name, sender_role, content, created_at, client_id')
        .eq('company_id', g.companyId)
        .order('created_at', { ascending: false })
        .limit(50);

      (clientMsgs || []).forEach((m: any) => {
        items.push({
          id: m.id,
          sender_name: m.sender_name || 'Control Room',
          sender_role: m.sender_role || 'ops',
          content: m.content,
          created_at: m.created_at,
          is_mine: false,
        });
      });
    }

    if (g.guardId) {
      const { data: obEntries } = await supabase
        .from('occurrence_books')
        .select('id, entry, entry_type, created_at')
        .eq('guard_id', g.guardId)
        .eq('company_id', g.companyId)
        .order('created_at', { ascending: false })
        .limit(20);

      (obEntries || []).forEach((ob: any) => {
        items.push({
          id: `ob-${ob.id}`,
          sender_name: g.guardName,
          sender_role: 'guard',
          content: `[${ob.entry_type}] ${ob.entry}`,
          created_at: ob.created_at,
          is_mine: true,
        });
      });
    }

    items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setMessages(items);
    setLoading(false);
  }, [g.currentUser, g.companyId, g.guardId, siteId, g.guardName]);

  useEffect(() => {
    if (g.currentUser) loadMessages();
  }, [g.currentUser, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !g.companyId || !g.currentUser || !g.guardId) return;
    setSending(true);

    await supabase.from('occurrence_books').insert({
      company_id: g.companyId,
      site_id: siteId,
      guard_id: g.guardId,
      entry_type: 'Message',
      entry: input.trim(),
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        sender_name: g.guardName,
        sender_role: 'guard',
        content: input.trim(),
        created_at: new Date().toISOString(),
        is_mine: true,
      },
    ]);

    setInput('');
    setSending(false);
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  if (g.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <h1 className="text-xl font-bold text-white">Messages</h1>
        {siteName && (
          <p className="text-xs text-gray-400 mt-0.5">{siteName}</p>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <i className="ri-loader-4-line animate-spin text-gray-500 text-xl"></i>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
              <i className="ri-chat-3-line text-gray-500 text-2xl"></i>
            </div>
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-500 mt-1">Messages from control room will appear here</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const showDate = i === 0 || formatDate(msg.created_at) !== formatDate(messages[i - 1].created_at);
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-white/5 rounded-full px-3 py-1">
                      <span className="text-[10px] text-gray-500">{formatDate(msg.created_at)}</span>
                    </div>
                  </div>
                )}
                <div className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.is_mine
                      ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/20'
                      : 'bg-[#1a1a1a] border border-white/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-gray-400">{msg.sender_name}</span>
                      <span className="text-[10px] text-gray-600">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-3 border-t border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) handleSend(); }}
            placeholder="Type a message..."
            className="flex-1 h-12 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-12 h-12 bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-30 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          >
            {sending ? (
              <i className="ri-loader-4-line animate-spin text-white"></i>
            ) : (
              <i className="ri-send-plane-fill text-white"></i>
            )}
          </button>
        </div>
      </div>
      <GuardBottomNav />
    </div>
  );
}