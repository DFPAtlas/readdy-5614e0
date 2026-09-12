'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_VERSION = '1';
const STORAGE_KEY = 'cookie_consent_v1';

type ConsentState = {
  version: string;
  timestamp: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setOpen(true);
      setDismissed(false);
    } else {
      setDismissed(true);
    }
  }, []);

  const persist = (a: boolean, m: boolean) => {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: a,
      marketing: m,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setOpen(false);
    setCustomising(false);
    setDismissed(true);
  };

  const acceptAll = () => persist(true, true);
  const essentialOnly = () => persist(false, false);
  const saveCustom = () => persist(analytics, marketing);

  if (!open) {
    if (!dismissed) return null;
    return (
      <button
        onClick={() => { setOpen(true); setCustomising(false); }}
        className="fixed bottom-4 left-4 z-[9998] px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-[#0f172a] border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
        aria-label="Cookie settings"
      >
        Cookie settings
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999]" role="dialog" aria-label="Cookie consent">
      <div className="bg-[#0f172a] border-t border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex-1">
              <p className="text-sm text-gray-300 leading-relaxed">
                We use cookies to make the site work and to understand usage. Essential cookies are always on.
                Analytics and marketing cookies are only set with your consent.{' '}
                <Link href="/cookies" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors cursor-pointer">
                  Cookie Notice
                </Link>
              </p>

              {customising && (
                <div className="mt-4 space-y-3 bg-white/[0.03] border border-white/10 rounded-lg p-4">
                  <label className="flex items-center justify-between gap-4 text-sm text-gray-300">
                    <span>Essential <span className="text-xs text-gray-500">(always on — authentication and security)</span></span>
                    <input type="checkbox" checked disabled className="w-4 h-4 accent-blue-500 opacity-50" />
                  </label>
                  <label className="flex items-center justify-between gap-4 text-sm text-gray-300">
                    <span>Analytics</span>
                    <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="w-4 h-4 accent-blue-500 cursor-pointer" />
                  </label>
                  <label className="flex items-center justify-between gap-4 text-sm text-gray-300">
                    <span>Marketing</span>
                    <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="w-4 h-4 accent-blue-500 cursor-pointer" />
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button onClick={essentialOnly} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
                Essential only
              </button>
              {!customising ? (
                <button onClick={() => setCustomising(true)} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
                  Customise
                </button>
              ) : (
                <button onClick={saveCustom} className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                  Save preferences
                </button>
              )}
              <button onClick={acceptAll} className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}