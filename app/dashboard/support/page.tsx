'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupportTickets, SUPPORT_CATEGORIES, SUPPORT_PRIORITIES, SUPPORT_STATUSES, categoryLabel } from '@/lib/useTenantSupport';

export default function SupportPage() {
  const { tickets, loading, createTicket } = useSupportTickets('tenant');
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('operations');
  const [priority, setPriority] = useState('p3');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!subject.trim() || !description.trim() || !consent) {
      setError('Please complete the subject, description and confirm consent.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await createTicket({ subject, category, priority, description, consent_given: consent });
      setShowNew(false);
      setSubject(''); setDescription(''); setConsent(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to create ticket');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-sm text-gray-500 mt-1">Open and track support requests for your account.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Ticket
        </button>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex items-start gap-3">
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-alarm-warning-line"></i></div>
        <p>For a real-world emergency, use your organisation emergency procedures immediately. Ordinary support tickets are not for emergencies and are not monitored as an emergency channel.</p>
      </div>

      {showNew && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">New Support Ticket</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Brief description of the issue" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-8">
                  {SUPPORT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Urgency</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-8">
                  <option value="p1">P1 Critical</option>
                  <option value="p2">P2 High</option>
                  <option value="p3">P3 Normal</option>
                  <option value="p4">P4 Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={500} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" placeholder="Describe the issue in detail..." />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
              <span className="text-sm text-gray-400">I consent to support staff accessing my account data as needed to investigate this request.</span>
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex items-center gap-3">
              <button onClick={submit} disabled={busy} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">{busy ? 'Creating...' : 'Create Ticket'}</button>
              <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
        ) : tickets.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <i className="ri-customer-service-2-line text-gray-500 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm">No support tickets yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {tickets.map((t) => (
              <Link key={t.id} href={`/dashboard/support/${t.id}`} className="block px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono">{t.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SUPPORT_STATUSES[t.status]?.color || ''}`}>{SUPPORT_STATUSES[t.status]?.label || t.status}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SUPPORT_PRIORITIES[t.priority]?.color || ''}`}>{SUPPORT_PRIORITIES[t.priority]?.label || t.priority}</span>
                    </div>
                    <p className="text-sm text-white mt-1.5 truncate">{t.subject}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{categoryLabel(t.category)}</span>
                      <span>{new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {t.satisfaction_rating != null && <span className="text-emerald-400">{t.satisfaction_rating}/5 rated</span>}
                    </div>
                  </div>
                  <div className="w-5 h-5 flex items-center justify-center text-gray-500 flex-shrink-0"><i className="ri-arrow-right-s-line"></i></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}