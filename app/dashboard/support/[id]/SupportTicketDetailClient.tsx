'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSupportTicketDetail, SUPPORT_STATUSES, SUPPORT_PRIORITIES, categoryLabel } from '@/lib/useTenantSupport';

export default function SupportTicketDetailClient({ ticketId }: { ticketId: string }) {
  const { ticket, messages, attachments, loading, addMessage, updateStatus, uploadAttachment, rate } = useSupportTicketDetail(ticketId, 'tenant');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const send = async () => {
    if (!reply.trim()) return;
    setBusy(true);
    try { await addMessage(reply); setReply(''); } catch {} finally { setBusy(false); }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { await uploadAttachment(f); } catch {} finally { e.target.value = ''; }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>;
  }

  if (!ticket) {
    return <div className="py-24 text-center text-gray-400 text-sm">Ticket not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/support" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer">
        <i className="ri-arrow-left-line"></i> Back to Support
      </Link>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SUPPORT_STATUSES[ticket.status]?.color || ''}`}>{SUPPORT_STATUSES[ticket.status]?.label || ticket.status}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SUPPORT_PRIORITIES[ticket.priority]?.color || ''}`}>{SUPPORT_PRIORITIES[ticket.priority]?.label || ticket.priority}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/10 text-gray-300">{categoryLabel(ticket.category)}</span>
            </div>
            <h1 className="text-lg font-semibold text-white">{ticket.subject}</h1>
            <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>
        {(ticket.sla_first_response_due || ticket.sla_resolution_due) && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
            {ticket.sla_first_response_due && (
              <div className="flex items-center gap-2">
                <span className={ticket.sla_first_response_breached ? 'text-red-400' : 'text-gray-400'}>First response due {new Date(ticket.sla_first_response_due).toLocaleString('en-GB')}</span>
                {ticket.sla_first_response_breached && <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">Breached</span>}
              </div>
            )}
            {ticket.sla_resolution_due && (
              <div className="flex items-center gap-2">
                <span className={ticket.sla_resolution_breached ? 'text-red-400' : 'text-gray-400'}>Resolution due {new Date(ticket.sla_resolution_due).toLocaleString('en-GB')}</span>
                {ticket.sla_resolution_breached && <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">Breached</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Conversation</h2>
        {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-semibold flex-shrink-0">
                {(m.sender?.first_name?.[0] || '') + (m.sender?.last_name?.[0] || '') || 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">{`${m.sender?.first_name || ''} ${m.sender?.last_name || ''}`.trim() || 'Support'}</span>
                  <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString('en-GB')}</span>
                </div>
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{m.message}</p>
              </div>
            </div>
          ))}
        </div>

        {attachments.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <span key={a.id} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5">
                  <i className="ri-file-line"></i> {a.file_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {['resolved', 'closed'].includes(ticket.status) ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">How was your experience?</h2>
              {rating != null && <p className="text-sm text-emerald-400 mt-1">Thanks for rating.</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => { setRating(n); rate(n); }} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${rating != null && rating >= n ? 'text-amber-400' : 'text-gray-600 hover:text-gray-400'}`}>
                    <i className={rating != null && rating >= n ? 'ri-star-fill' : 'ri-star-line'}></i>
                  </button>
                ))}
              </div>
              <button onClick={() => updateStatus('reopened')} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white cursor-pointer whitespace-nowrap">Reopen</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} maxLength={2000} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" placeholder="Write a reply..." />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" onChange={onUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white cursor-pointer whitespace-nowrap flex items-center gap-1.5">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-attachment-2 text-sm"></i></div>
                Attach
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateStatus('resolved')} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white cursor-pointer whitespace-nowrap">Mark Resolved</button>
              <button onClick={send} disabled={busy || !reply.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}