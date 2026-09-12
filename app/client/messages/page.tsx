'use client';

import { useState } from 'react';
import { useClientPortal } from '@/lib/useClientPortal';
import { useClientAuth } from '@/lib/useClientAuth';
import Link from 'next/link';

export default function ClientMessagesPage() {
  const { messages, sites, sendMessage, markMessageRead } = useClientPortal();
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [siteId, setSiteId] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    await sendMessage({ subject, body, site_id: siteId || undefined });
    setSending(false);
    setComposeOpen(false);
    setSubject('');
    setBody('');
    setSiteId('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Messages</h1>
          <p className="text-gray-400 mt-1">Communicate with your operations team</p>
        </div>
        <button
          onClick={() => setComposeOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New message
        </button>
      </div>

      {composeOpen && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full px-3 py-2.5 text-sm bg-[#0f172a]/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 bg-[#0f172a]/60 text-white pr-8"
          >
            <option value="">All sites / General enquiry</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.site_name}</option>
            ))}
          </select>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your message..."
            rows={5}
            maxLength={500}
            className="w-full px-3 py-2.5 text-sm bg-[#0f172a]/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{body.length}/500</span>
            <div className="flex gap-2">
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !body.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {sending ? 'Sending...' : 'Send message'}
              </button>
              <button
                onClick={() => setComposeOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-4">
            <i className="ri-mail-line text-gray-500 text-2xl"></i>
          </div>
          <p className="text-gray-400 font-medium">No messages yet</p>
          <p className="text-sm text-gray-500 mt-1">Start a conversation with your operations team.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl divide-y divide-white/5">
          {messages.map((m) => {
            const isUnread = m.status === 'unread' && !m.is_from_client;
            return (
              <div
                key={m.id}
                onClick={() => { if (isUnread) markMessageRead(m.id); }}
                className={`p-5 cursor-pointer transition-colors ${isUnread ? 'bg-blue-500/5' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                    m.is_from_client ? 'bg-white/10 text-gray-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    <i className={m.is_from_client ? 'ri-user-line text-xs' : 'ri-shield-check-line text-xs'}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{m.subject}</span>
                      {isUnread && (
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{m.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {m.is_from_client ? 'You' : 'Operations team'} · {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.site_name && <span className="text-xs text-gray-500">· {m.site_name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}