'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import GlassCard from '../../components/GlassCard';

const SUBMIT_URL = 'https://readdy.ai/api/form/d9uue0963aqc1tdvanrg';

const REQUEST_TYPES = [
  'Access my data',
  'Correct my data',
  'Erase my data',
  'Restrict processing',
  'Object to processing',
  'Data portability',
  'Automated-decision review',
  'Withdraw consent',
  'General privacy enquiry',
];

export default function PrivacyRequestPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const hp = form.querySelector('[data-hp-field]') as HTMLInputElement | null;

    if (hp && hp.value.trim()) {
      setStatus('success');
      setErrorMsg('');
      return;
    }

    const fd = new FormData(form);
    const params = new URLSearchParams();
    fd.forEach((value, key) => {
      if (key === 'website_alt') return;
      params.append(key, String(value));
    });

    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const text = await res.text();
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch { parsed = null; }
      const serverMsg = parsed?.meta?.message || parsed?.message || parsed?.meta?.detail || text;
      const isOk = res.ok && parsed?.code === 'OK';
      if (isOk) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
        setErrorMsg(typeof serverMsg === 'string' ? serverMsg : 'Your request could not be submitted. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              Data Subject Rights
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Exercise your privacy rights
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              You can submit a request about your personal data without using legal terminology. We will verify
              your identity and respond within the statutory deadline.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <GlassCard className="p-8 md:p-10">
                {status === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-check-line text-green-400 text-2xl"></i>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Request received</h3>
                    <p className="text-gray-400">
                      We will verify your identity and respond to your request.
                    </p>
                  </div>
                ) : (
                  <form id="privacy-request-form" data-readdy-form onSubmit={handleSubmit}>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full name</label>
                      <input type="text" name="fullName" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="Your name" />
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input type="email" name="email" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="you@example.com" />
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Request type</label>
                      <div className="flex flex-wrap gap-2">
                        {REQUEST_TYPES.map((t) => (
                          <label key={t} className="cursor-pointer">
                            <input type="radio" name="requestType" value={t} defaultChecked={t === 'Access my data'} className="peer sr-only" />
                            <span className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 peer-checked:bg-blue-500/20 peer-checked:border-blue-500/50 peer-checked:text-blue-300 transition-colors whitespace-nowrap">
                              {t}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
                      <textarea name="message" rows={5} maxLength={500} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none" placeholder="Describe what you would like us to do (500 characters max)"></textarea>
                      <p className="text-gray-500 text-xs mt-1">Max 500 characters</p>
                    </div>

                    <input type="text" name="website_alt" data-hp-field tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly />

                    {status === 'error' && (
                      <p className="mb-4 text-sm text-red-400">{errorMsg || 'Something went wrong. Please try again.'}</p>
                    )}

                    <button type="submit" disabled={status === 'submitting'} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                      {status === 'submitting' ? 'Submitting...' : 'Submit request'}
                    </button>
                  </form>
                )}
              </GlassCard>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-shield-check-line text-blue-400 text-lg"></i>
                  </div>
                </div>
                <h4 className="text-base font-semibold text-white mb-2">What happens next</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We will confirm your identity, determine which organisation is responsible for your data, and
                  respond within the applicable statutory deadline. Complex requests may be extended where legally
                  permitted.
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-lock-2-line text-blue-400 text-lg"></i>
                  </div>
                </div>
                <h4 className="text-base font-semibold text-white mb-2">Your data is protected</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We never share your request with anyone outside the responsible organisation. Identity checks
                  protect you from unauthorised disclosure.
                </p>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}