'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://readdy.ai/api/form/d7uej158ka4otec5q04g', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      }
    } catch {
      // silently fail, don't block UX
    }
  };

  return (
    <footer className="border-t border-white/10 bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/0f55097c-53e5-494b-b419-876152a51ee7_edited_image_d3fb89d4-4c94-480b-911a-a4f5576d177c_0.png?v=4a5cb4d0eb32cb9bee8b5acd1d9f9fa6"
                alt="GuardianHub"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The AI command centre for modern security operations. Built for firms that demand precision.
            </p>
            <div className="flex gap-3">
              <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <i className="ri-linkedin-fill text-sm"></i>
              </span>
              <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <i className="ri-twitter-x-fill text-sm"></i>
              </span>
              <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <i className="ri-youtube-fill text-sm"></i>
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/platform"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                >
                  Platform
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <span className="text-gray-500 text-sm cursor-default">
                  Integrations <span className="text-xs">(Soon)</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                >
                  Contact
                </Link>
              </li>
              <li>
                <span className="text-gray-500 text-sm cursor-default">
                  Careers <span className="text-xs">(Soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-500 text-sm cursor-default">
                  Blog <span className="text-xs">(Soon)</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Stay Updated
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              Get security ops insights and product updates.
            </p>
            {submitted ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <i className="ri-check-line"></i>
                <span>Thanks for subscribing!</span>
              </div>
            ) : (
              <form
                id="footer-newsletter"
                data-readdy-form
                onSubmit={handleSubmit}
                className="flex gap-2"
              >
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            {currentYear} GuardianHub. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer"
            >
              Terms
            </Link>
            <Link
              href="/gdpr"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer"
            >
              GDPR
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}