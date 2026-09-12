'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { useInView } from '../hooks/useInView';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function SignupPage() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const hpValue = (formData.get('mobile_alt') as string)?.trim();
    if (hpValue) {
      setSubmitStatus('success');
      return;
    }

    try {
      const response = await fetch('https://readdy.ai/api/form/d7uef1ob7i54bnk8qprg', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20security%20company%20office%20interior%20with%20team%20working%20at%20desks%2C%20dark%20navy%20ambient%20lighting%20with%20subtle%20blue%20accent%20lights%2C%20glass%20partitions%2C%20professional%20workspace%20atmosphere%2C%20cinematic%20wide%20angle%20photography%2C%20clean%20and%20sophisticated%20corporate%20environment%2C%20technology%20startup%20vibe&width=1440&height=500&seq=4&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/70 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">
                Get Started
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Start your <span className="text-blue-400">15-day free trial</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                Join hundreds of UK security companies already using GuardianHub to run smarter operations. No credit card required.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'ri-check-double-line', label: 'Full feature access' },
              { icon: 'ri-user-voice-line', label: 'Personal onboarding' },
              { icon: 'ri-customer-service-2-line', label: 'UK-based support' },
              { icon: 'ri-bank-card-line', label: 'No card required' },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 75}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <i className={`${item.icon} text-blue-400 text-sm`}></i>
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{item.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FadeIn>
            {submitStatus === 'success' ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-green-400 text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Trial request received
                </h3>
                <p className="text-gray-400 mb-1">
                  Our team will contact you within 24 hours to set up your free trial account.
                </p>
                <p className="text-gray-500 text-sm">
                  In the meantime, explore the platform or book a demo.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-play-circle-line"></i>
                    Watch the demo
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line"></i>
                    Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Tell us about your operation
                  </h2>
                  <p className="text-gray-400">
                    We use this to tailor your trial and onboarding experience.
                  </p>
                </div>

                <GlassCard className="p-8 md:p-10">
                  <form
                    id="signup-trial"
                    data-readdy-form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                          placeholder="Your security firm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          name="contactName"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                          placeholder="John Smith"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                          placeholder="john@yourcompany.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                          placeholder="+44..."
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Number of Sites *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['1-5', '6-15', '16-50', '51-100', '100+'].map((opt) => (
                            <label key={opt} className="cursor-pointer">
                              <input
                                type="radio"
                                name="numberOfSites"
                                value={opt}
                                required
                                className="peer sr-only"
                              />
                              <span className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 peer-checked:bg-blue-500/20 peer-checked:border-blue-500/50 peer-checked:text-blue-300 transition-colors whitespace-nowrap">
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Size *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['1-10', '11-50', '51-200', '201-500', '500+'].map((opt) => (
                            <label key={opt} className="cursor-pointer">
                              <input
                                type="radio"
                                name="companySize"
                                value={opt}
                                required
                                className="peer sr-only"
                              />
                              <span className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 peer-checked:bg-blue-500/20 peer-checked:border-blue-500/50 peer-checked:text-blue-300 transition-colors whitespace-nowrap">
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Industry *
                        </label>
                        <input
                          type="text"
                          name="industry"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                          placeholder="e.g. Security Services"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current System
                        </label>
                        <input
                          type="text"
                          name="currentSystem"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                          placeholder="e.g. Paper-based, Excel..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tell us about your requirements
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none text-sm"
                        placeholder="What challenges are you facing? What do you need most from a security ops platform?"
                      />
                    </div>

                    <input
                      type="text"
                      name="mobile_alt"
                      data-hp-field
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      readOnly
                    />

                    {submitStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <i className="ri-error-warning-line"></i>
                        Something went wrong. Please try again or email us directly at hello@guardianhub.com
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-rocket-line mr-2"></i>
                      Start My Free Trial
                    </button>

                    <p className="text-gray-500 text-xs text-center">
                      By submitting, you agree to our{' '}
                      <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                </GlassCard>
              </>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-2">
                <i className="ri-shield-check-line text-blue-400"></i>
                SIA-Aligned Workflows
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-lock-2-line text-blue-400"></i>
                AES-256 Encryption
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-user-follow-line text-blue-400"></i>
                GDPR Compliant
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-customer-service-2-line text-blue-400"></i>
                UK-Based Support
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}