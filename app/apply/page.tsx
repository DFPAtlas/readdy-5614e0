'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ApplyPage() {
  const [step, setStep] = useState<'find' | 'apply'>('find');
  const [reference, setReference] = useState('');
  const [vacancy, setVacancy] = useState<any>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', cover_letter: '',
  });
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const handleFind = async () => {
    setError('');
    const { data } = await supabase
      .from('vacancies')
      .select('*')
      .eq('reference', reference.trim())
      .eq('status', 'published')
      .maybeSingle();

    if (!data) {
      setError('Vacancy not found or no longer accepting applications.');
      return;
    }
    setVacancy(data);
    setStep('apply');
  };

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email) return;
    if (!privacyAcknowledged) return;

    const token = crypto.randomUUID();
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { error: submitErr } = await supabase.from('applications').insert({
      company_id: vacancy.company_id,
      vacancy_id: vacancy.id,
      applicant_token_hash: hashHex,
      applicant_email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone || null,
      cover_letter: form.cover_letter || null,
      status: 'received',
      privacy_notice_version: '1.0',
      privacy_acknowledged_at: new Date().toISOString(),
    });

    if (submitErr) {
      setError('Failed to submit application. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <div className="w-7 h-7 flex items-center justify-center text-emerald-400"><i className="ri-check-line text-2xl"></i></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Application Submitted</h2>
          <p className="text-sm text-gray-400 mb-1">Thank you for applying to {vacancy?.title}.</p>
          <p className="text-sm text-gray-500">We will review your application and contact you via email.</p>
          <p className="text-xs text-gray-600 mt-4">Please save your application reference for future enquiries.</p>
        </div>
      </div>
    );
  }

  if (step === 'find') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <div className="w-6 h-6 flex items-center justify-center text-blue-400"><i className="ri-briefcase-line text-xl"></i></div>
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-2">Apply for a Position</h2>
          <p className="text-sm text-gray-400 text-center mb-6">Enter the vacancy reference provided in the job listing</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Vacancy Reference</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. VAC-2026-001"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleFind}
              disabled={!reference.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Find Vacancy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#111827] border border-gray-800 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setStep('find'); setVacancy(null); }} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">{vacancy?.title}</h2>
            <p className="text-xs text-gray-500">{vacancy?.reference} — {vacancy?.location || 'Various Locations'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">First Name *</label>
              <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Last Name *</label>
              <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Cover Letter</label>
            <textarea value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} rows={5} maxLength={2000}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
            <p className="text-xs text-gray-500 mt-1">{form.cover_letter.length}/2000</p>
          </div>

          {vacancy?.pay_display_text && (
            <div className="bg-gray-800/30 rounded-lg p-3 text-sm">
              <span className="text-gray-400">Pay: </span>
              <span className="text-white">{vacancy.pay_display_text}</span>
            </div>
          )}

          {vacancy?.description && (
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">Job Description</h4>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{vacancy.description}</p>
            </div>
          )}

          <div className="border-t border-gray-800 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAcknowledged}
                onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">
                I confirm I have read and understood the privacy notice. I consent to my personal data being processed for the purpose of this job application in accordance with UK GDPR.
              </span>
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!form.first_name || !form.last_name || !form.email || !privacyAcknowledged}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}