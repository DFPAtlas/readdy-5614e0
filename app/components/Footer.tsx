'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const hpEl = form.querySelector('[data-hp-field]') as HTMLInputElement;
    if (hpEl && hpEl.value.trim()) {
      setSubmitted(true);
      setEmail('');
      return;
    }
    try {
      const response = await fetch('https://readdy.ai/api/form/d9tmu6t3pcjqs2fcsglg', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      }
    } catch { /* silently fail */ }
  };

  return (
    <footer className="border-t border-white/10 bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 cursor-pointer">
              <img src="https://public.readdy.ai/ai/img_res/5b8fa21e-164b-4f73-ae11-f3bfe2d13e58.png" alt="GuardianHub" className="h-8 w-auto" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The command centre for modern security operations. Built for UK firms that demand precision.
            </p>
            <div className="flex gap-3">
              <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <i className="ri-linkedin-fill text-sm"></i>
              </span>
              <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <i className="ri-twitter-x-fill text-sm"></i>
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/features/command-centre" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Command Centre</Link></li>
              <li><Link href="/features/rota-scheduling" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Rota & Scheduling</Link></li>
              <li><Link href="/features/patrols" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Patrols</Link></li>
              <li><Link href="/features/incidents" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Incidents</Link></li>
              <li><Link href="/features/lone-worker-sos" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Lone Worker & SOS</Link></li>
              <li><Link href="/features/compliance" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Compliance</Link></li>
              <li><Link href="/features/client-portal" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Client Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Solutions</h4>
            <ul className="space-y-3">
              <li><Link href="/solutions/security-guarding" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Security Guarding</Link></li>
              <li><Link href="/solutions/mobile-patrol" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Mobile Patrol</Link></li>
              <li><Link href="/solutions/event-security" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Event Security</Link></li>
              <li><Link href="/solutions/corporate-security" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Corporate Security</Link></li>
              <li><Link href="/solutions/retail-security" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Retail Security</Link></li>
              <li><Link href="/solutions/construction-security" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Construction</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Contact</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Blog</Link></li>
              <li><Link href="/case-studies" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Case Studies</Link></li>
              <li><Link href="/resources" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Resource Centre</Link></li>
              <li><Link href="/docs" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Documentation</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">Trust & Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-3">Security ops insights, product updates, and compliance guidance.</p>
            {submitted ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <i className="ri-check-line"></i>
                <span>Thanks for subscribing!</span>
              </div>
            ) : (
              <form id="footer-newsletter" data-readdy-form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
                <input type="text" name="website_alt" data-hp-field tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly />
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-send-plane-fill"></i>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">{currentYear} GuardianHub. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Terms</Link>
            <Link href="/cookies" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Cookies</Link>
            <Link href="/gdpr" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">GDPR</Link>
            <Link href="/acceptable-use" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">AUP</Link>
            <Link href="/security" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Security</Link>
            <Link href="/trust" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Trust Centre</Link>
            <Link href="/help" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Help Centre</Link>
            <Link href="/academy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Academy</Link>
            <Link href="/updates" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Updates</Link>
            <Link href="/privacy/request" className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">Privacy Request</Link>
          </div>
        </div>

        <div className="border-t border-white/5 mt-6 pt-5 text-center">
          <p className="text-gray-600 text-xs">
            This site is owned and operated by{' '}
            <a href="https://digital-footprint.uk" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer underline underline-offset-2">Digital-Footprint.uk</a>
          </p>
        </div>
      </div>
    </footer>
  );
}