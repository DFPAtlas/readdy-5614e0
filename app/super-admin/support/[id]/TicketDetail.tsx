'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSuperAdminTicketDetail, getStatusBadge, getPriorityBadge, getCategoryLabel, STATUSES } from '@/lib/useSuperAdminTickets';
import { supabase } from '@/lib/supabase';

export default function TicketDetail({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const {
    ticket, messages, attachments, aiChecks, repairActions,
    loading, error, refresh, addMessage, runAICheck, approveRepair,
  } = useSuperAdminTicketDetail(ticketId);

  const [reply, setReply] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [repairLoading, setRepairLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [showInternal, setShowInternal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sb = ticket ? getStatusBadge(ticket.status) : null;
  const pb = ticket ? getPriorityBadge(ticket.priority) : null;

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      await supabase.from('support_tickets').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', ticket.id);
      setToast('Status updated');
      setShowStatusMenu(false);
      await refresh();
    } catch (err: any) {
      setToast(err.message || 'Update failed');
    }
  };

  const handleReply = async (internal: boolean = false) => {
    const text = internal ? internalNote : reply;
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addMessage(text.trim(), internal);
      if (internal) setInternalNote('');
      else setReply('');
      setToast(internal ? 'Internal note added' : 'Reply sent');
    } catch (err: any) {
      setToast(err.message || 'Failed');
    } finally {
      setSending(false);
    }
  };

  const handleAICheck = async () => {
    if (!ticket) return;
    setAiLoading(true);
    setToast(null);
    try {
      await runAICheck(ticket.company_id, ticket.affected_user_id);
      setToast('AI check complete');
    } catch (err: any) {
      setToast(err.message || 'AI check failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApproveRepair = async () => {
    if (!ticket || !selectedAction) return;
    setRepairLoading(true);
    try {
      const actionMap: Record<string, { type: string; summary: string }> = {
        relink_user: { type: 'relink_user', summary: 'Re-linked user to correct company' },
        restore_role: { type: 'restore_role', summary: 'Restored missing user role assignment' },
        resync_stripe: { type: 'resync_stripe', summary: 'Re-synced Stripe subscription status' },
        recreate_profile: { type: 'recreate_profile', summary: 'Recreated missing profile record' },
      };
      const action = actionMap[selectedAction];
      if (!action) throw new Error('Unknown action');
      const latestCheck = aiChecks[0];
      await approveRepair(
        action.type,
        action.summary,
        { status: 'before_repair' },
        { status: 'after_repair', action: action.summary },
        latestCheck?.id || null
      );
      setToast('Repair approved and logged');
      setShowRepairModal(false);
      setSelectedAction('');
    } catch (err: any) {
      setToast(err.message || 'Repair failed');
    } finally {
      setRepairLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ticket) return;
    try {
      const ext = file.name.split('.').pop() || '';
      const path = `tickets/${ticket.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      await supabase.storage.from('support-attachments').upload(path, file);
      await supabase.from('support_ticket_attachments').insert({
        ticket_id: ticket.id,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: ticket.assigned_to || ticket.created_by,
      });
      setToast('Attachment uploaded');
      await refresh();
    } catch (err: any) {
      setToast(err.message || 'Upload failed');
    }
  };

  const safeStatuses = Object.keys(STATUSES) as Array<keyof typeof STATUSES>;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/super-admin/support" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
          Support Tickets
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-white font-medium truncate">{ticket.subject}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-[#0f172a] border border-white/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {sb && <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${sb.color}`}>{sb.label}</span>}
                  {pb && <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${pb.color}`}>{pb.label}</span>}
                  <span className="text-xs text-gray-500">{getCategoryLabel(ticket.category)}</span>
                </div>
                <h1 className="text-lg font-bold text-white">{ticket.subject}</h1>
              </div>
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/10 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Change Status
                </button>
                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#1e293b] rounded-xl border border-white/10 shadow-xl z-50 py-1">
                      {safeStatuses.map((s) => {
                        const b = STATUSES[s];
                        return (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 cursor-pointer"
                          >
                            <span className={`w-2 h-2 rounded-full ${b.color}`}></span>
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
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

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-500">
              <div>
                <p className="text-gray-600 mb-0.5">Company</p>
                <p className="text-gray-300 font-medium">{ticket.company?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-0.5">Created</p>
                <p className="text-gray-300">{new Date(ticket.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-0.5">Client</p>
                <p className="text-gray-300">{ticket.creator?.first_name} {ticket.creator?.last_name}</p>
                <p className="text-gray-600">{ticket.creator?.email}</p>
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
                  <p className="text-gray-600">{ticket.affected_user.email}</p>
                </div>
              )}
              {ticket.consent_given && (
                <div>
                  <p className="text-gray-600 mb-0.5">Consent</p>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <div className="w-3 h-3 flex items-center justify-center"><i className="ri-check-line"></i></div>
                    Granted
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInternal(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${!showInternal ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Client Messages
            </button>
            <button
              onClick={() => setShowInternal(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${showInternal ? 'bg-amber-600/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}
            >
              Internal Notes
            </button>
          </div>

          <div className="space-y-3">
            {messages.filter((m) => showInternal ? m.is_internal : !m.is_internal).length === 0 && (
              <div className="rounded-xl bg-[#0f172a] border border-white/5 p-6 text-center text-sm text-gray-500">
                {showInternal ? 'No internal notes yet.' : 'No client messages yet.'}
              </div>
            )}

            {messages
              .filter((m) => showInternal ? m.is_internal : !m.is_internal)
              .map((msg) => {
                const isSupport = msg.sender?.role === 'super_admin' || msg.is_internal;
                return (
                  <div key={msg.id} className={`rounded-xl border p-4 ${msg.is_internal ? 'bg-amber-950/10 border-amber-500/15' : 'bg-[#0f172a] border-white/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold ${isSupport ? 'bg-emerald-600/20 text-emerald-400' : 'bg-indigo-600/20 text-indigo-400'}`}>
                          {isSupport ? 'S' : 'C'}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{msg.sender?.first_name} {msg.sender?.last_name}</p>
                          <p className="text-[10px] text-gray-600">{isSupport ? 'Support Team' : 'Client'}</p>
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
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 text-xs font-semibold flex-shrink-0 mt-0.5">
                S
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  value={showInternal ? internalNote : reply}
                  onChange={(e) => showInternal ? setInternalNote(e.target.value) : setReply(e.target.value)}
                  placeholder={showInternal ? 'Add an internal note...' : 'Write a client reply...'}
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
                    onClick={() => handleReply(showInternal)}
                    disabled={sending || (showInternal ? !internalNote.trim() : !reply.trim())}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {sending ? 'Sending...' : showInternal ? 'Add Note' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-[#0f172a] border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleAICheck}
                disabled={aiLoading}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#1e293b] border border-white/5 text-sm text-gray-300 hover:border-indigo-500/30 hover:text-white transition-all cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center text-indigo-400">
                  <i className="ri-sparkling-line"></i>
                </div>
                {aiLoading ? 'Running AI Check...' : 'Run AI Account Check'}
              </button>

              {aiChecks.length > 0 && (
                <button
                  onClick={() => setShowRepairModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#1e293b] border border-white/5 text-sm text-gray-300 hover:border-emerald-500/30 hover:text-white transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                    <i className="ri-tools-line"></i>
                  </div>
                  Approve Repair
                </button>
              )}
            </div>
          </div>

          {aiChecks.length > 0 && (
            <div className="rounded-xl bg-[#0f172a] border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">AI Investigation</h3>
              <div className="space-y-3">
                {aiChecks.map((check) => (
                  <div key={check.id} className="rounded-lg bg-[#1e293b]/50 border border-white/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${
                        check.risk_level === 'critical' ? 'bg-red-500' :
                        check.risk_level === 'high' ? 'bg-amber-500' :
                        check.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}></span>
                      <span className="text-xs font-medium text-gray-300">Risk: <span className="capitalize">{check.risk_level}</span></span>
                      <span className="text-[10px] text-gray-600 ml-auto">
                        {new Date(check.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <p className="text-gray-500 mb-0.5">Likely Cause</p>
                        <p className="text-gray-300">{check.likely_cause}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-0.5">Suggested Fix</p>
                        <p className="text-gray-300">{check.suggested_fix}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-0.5">Recommended Action</p>
                        <p className="text-indigo-400">{check.recommended_action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {repairActions.length > 0 && (
            <div className="rounded-xl bg-[#0f172a] border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Repair History</h3>
              <div className="space-y-2">
                {repairActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-2.5 rounded-lg bg-[#1e293b]/50 border border-white/5 p-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 text-[10px] font-semibold flex-shrink-0 mt-0.5">
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-check-line"></i></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-300">{action.action_summary}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 capitalize">{action.action_type.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-gray-600">
                        {new Date(action.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showRepairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowRepairModal(false)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl shadow-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-1">Approve Repair Action</h3>
            <p className="text-xs text-gray-400 mb-4">Select a safe predefined repair action. This will be logged and requires admin approval.</p>

            <div className="space-y-2 mb-5">
              {[
                { key: 'relink_user', label: 'Re-link user to correct company' },
                { key: 'restore_role', label: 'Restore missing role assignment' },
                { key: 'resync_stripe', label: 'Re-sync Stripe subscription status' },
                { key: 'recreate_profile', label: 'Recreate missing profile record' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedAction(opt.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                    selectedAction === opt.key
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'bg-[#1e293b] text-gray-300 border border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedAction === opt.key ? 'border-indigo-500 bg-indigo-500' : 'border-gray-600'
                  }`}>
                    {selectedAction === opt.key && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApproveRepair}
                disabled={repairLoading || !selectedAction}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                {repairLoading ? 'Processing...' : 'Approve & Execute'}
              </button>
              <button
                onClick={() => setShowRepairModal(false)}
                className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toast.includes('fail') || toast.includes('error') ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}