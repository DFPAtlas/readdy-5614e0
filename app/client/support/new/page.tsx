'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupportTickets, CATEGORIES, PRIORITIES } from '@/lib/useSupportTickets';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function NewTicketPage() {
  const router = useRouter();
  const { profile, companyId } = useAuth();
  const { createTicket } = useSupportTickets();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [priority, setPriority] = useState<string>('medium');
  const [description, setDescription] = useState('');
  const [affectedSiteId, setAffectedSiteId] = useState('');
  const [affectedUserId, setAffectedUserId] = useState('');
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const categoryList = Object.entries(CATEGORIES) as [string, string][];
  const priorityList = Object.entries(PRIORITIES) as [string, { label: string; color: string }][];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !consent) return;

    setSubmitting(true);
    setToast(null);

    try {
      const ticket = await createTicket({
        subject: subject.trim(),
        category: category as any,
        priority: priority as any,
        description: description.trim(),
        affected_site_id: affectedSiteId || null,
        affected_user_id: affectedUserId || null,
        consent_given: consent,
      });

      if (files.length > 0 && ticket?.id) {
        for (const file of files) {
          const ext = file.name.split('.').pop() || '';
          const path = `tickets/${ticket.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          await supabase.storage.from('support-attachments').upload(path, file);
          await supabase.from('support_ticket_attachments').insert({
            ticket_id: ticket.id,
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: profile?.id,
          });
        }
      }

      setToast('Ticket created successfully');
      setTimeout(() => router.push('/client/support'), 800);
    } catch (err: any) {
      setToast(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/client/support" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
          Support
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-white font-medium">New Ticket</span>
      </div>

      <div className="rounded-xl bg-[#0f172a] border border-white/5 p-6">
        <h1 className="text-xl font-bold text-white mb-1">Create Support Ticket</h1>
        <p className="text-sm text-gray-400 mb-6">Describe your issue and we will get back to you as soon as possible.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              required
              className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <div className="grid grid-cols-3 gap-1.5">
                {categoryList.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      category === key
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-[#1e293b] text-gray-400 border border-white/5 hover:border-white/15'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
              <div className="grid grid-cols-2 gap-1.5">
                {priorityList.map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      priority === key
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-[#1e293b] text-gray-400 border border-white/5 hover:border-white/15'
                    }`}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide as much detail as possible so we can help quickly..."
              required
              rows={5}
              maxLength={2000}
              className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">{description.length}/2000</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Affected Site (optional)</label>
              <input
                type="text"
                value={affectedSiteId}
                onChange={(e) => setAffectedSiteId(e.target.value)}
                placeholder="Site ID or name"
                className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Affected User/Guard (optional)</label>
              <input
                type="text"
                value={affectedUserId}
                onChange={(e) => setAffectedUserId(e.target.value)}
                placeholder="User ID or name"
                className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Attachments</label>
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.txt"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 bg-[#1e293b] border border-white/10 border-dashed rounded-lg px-3.5 py-3">
                <div className="w-5 h-5 flex items-center justify-center text-gray-500">
                  <i className="ri-upload-cloud-line"></i>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Click to upload files</span>
                  {files.length > 0 && (
                    <span className="text-indigo-400 ml-2">{files.length} selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-[#1e293b]/50 border border-white/5 p-3">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#1e293b] text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
            />
            <label htmlFor="consent" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
              I consent to the support team inspecting my account data, site permissions, guard records and billing information to investigate and resolve this ticket.
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !consent || !subject.trim() || !description.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
            <Link
              href="/client/support"
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toast.includes('success') ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}