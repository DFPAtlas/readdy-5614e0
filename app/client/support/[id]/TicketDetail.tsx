'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useTicketDetail, getStatusBadge, getPriorityBadge, getCategoryLabel } from '@/lib/useSupportTickets';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function TicketDetail({ ticketId }: { ticketId: string }) {
  const { profile } = useAuth();
  const { ticket, messages, attachments, loading, error, refresh, addMessage, uploadAttachment } = useTicketDetail(ticketId);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await addMessage(reply.trim());
      setReply('');
      setToast('Reply sent');
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAttachment(file);
      setToast('Attachment uploaded');
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast(err.message || 'Upload failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-sm text-red-400">
        {error || 'Ticket not found'}
      </div>
    );
  }

  const sb = getStatusBadge(ticket.status);
  const pb = getPriorityBadge(ticket.priority);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/client/support" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
          Support
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-white font-medium truncate">{ticket.subject}</span>
      </div>

      <div className="rounded-xl bg-[#0f172a] border border-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${sb.color}`}>{sb.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${pb.color}`}>{pb.label}</span>
              <span className="text-xs text-gray-500">{getCategoryLabel(ticket.category)}</span>
            </div>
            <h1 className="text-lg font-bold text-white">{ticket.subject}</h1>
          </div>
          <span className="text-xs text-gray-600 whitespace-nowrap flex-shrink-0">
            #{ticket.id.slice(-6).toUpperCase()}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[#1e293b]/50 border border-white/5">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((att) => (
              <a
                key={att.id}
                href={supabase.storage.from('support-attachments').getPublicUrl(att.file_path).data.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-attachment-line"></i></div>
                {att.file_name}
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500">
          <div>
            <p className="text-gray-600 mb-0.5">Created</p>
            <p className="text-gray-300">{new Date(ticket.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-0.5">By</p>
            <p className="text-gray-300">{ticket.creator?.first_name} {ticket.creator?.last_name}</p>
          </div>
          {ticket.affected_site?.site_name && (
            <div>
              <p className="text-gray-600 mb-0.5">Site</p>
              <p className="text-gray-300">{ticket.affected_site.site_name}</p>
            </div>
          )}
          {ticket.affected_user && (
            <div>
              <p className="text-gray-600 mb-0.5">User</p>
              <p className="text-gray-300">{ticket.affected_user.first_name} {ticket.affected_user.last_name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Message History</h2>

        {messages.length === 0 && (
          <div className="rounded-xl bg-[#0f172a] border border-white/5 p-6 text-center text-sm text-gray-500">
            No replies yet. Add a message below to follow up on this ticket.
          </div>
        )}

        {messages.map((msg) => {
          const isClient = msg.sender?.role === 'client' || msg.sender_id === ticket.created_by;
          return (
            <div key={msg.id} className={`rounded-xl border p-4 ${isClient ? 'bg-[#0f172a] border-indigo-500/15' : 'bg-[#0f172a] border-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold ${isClient ? 'bg-indigo-600/20 text-indigo-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                    {isClient ? 'C' : 'S'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">
                      {msg.sender?.first_name} {msg.sender?.last_name}
                    </p>
                    <p className="text-[10px] text-gray-600">{isClient ? 'You' : 'Support Team'}</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600">
                  {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-[#0f172a] border border-white/5 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xs font-semibold flex-shrink-0 mt-0.5">
            {profile?.first_name?.[0] || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              maxLength={1000}
              className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept="image/*,.pdf,.txt" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-attachment-line"></i></div>
                  Attach
                </button>
              </div>
              <button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                {sending ? 'Sending...' : 'Reply'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="rounded-lg px-4 py-3 text-sm font-medium shadow-lg bg-emerald-600 text-white">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}