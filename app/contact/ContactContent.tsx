'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';

export default function ContactContent() {
  const searchParams = useSearchParams();
  const isTitan = searchParams.get('titan') === '1';
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              {isTitan ? 'Enterprise Contact' : 'Contact'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              {isTitan ? 'Let us build your Titan plan' : 'Let us talk'}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
              {isTitan
                ? 'Tell us about your enterprise security operation and we will tailor a Titan package for you.'
                : 'Whether you have a question, need a demo, or want to discuss enterprise pricing — we are here.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <GlassCard className="p-8 md:p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <i className="ri-check-line text-green-400 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Message sent
                    </h3>
                    <p className="text-gray-400">
                      We will get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form
                    id="contact-form"
                    data-readdy-form
                    action="https://readdy.ai/api/form/d7ublqpjlv0i8kopuau0"
                    method="POST"
                    onSubmit={() => setSubmitted(true)}
                  >
                    {isTitan && (
                      <input type="hidden" name="inquiry_type" value="Titan Enterprise" />
                    )}
                    <div className="grid md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="john@yourcompany.com"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="Your security firm"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        How can we help?
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {['Sales inquiry', 'Support', 'Demo request', 'Partnership'].map((tag) => (
                          <label key={tag} className="cursor-pointer">
                            <input
                              type="radio"
                              name="topic"
                              value={tag}
                              defaultChecked={isTitan && tag === 'Sales inquiry'}
                              className="peer sr-only"
                            />
                            <span className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 peer-checked:bg-blue-500/20 peer-checked:border-blue-500/50 peer-checked:text-blue-300 transition-colors">
                              {tag}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                        placeholder={isTitan ? 'Describe your enterprise needs, number of sites, guards...' : 'Tell us what you need...'}
                      ></textarea>
                      <p className="text-gray-500 text-xs mt-1">Max 500 characters</p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Send message
                    </button>
                  </form>
                )}
              </GlassCard>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <i className="ri-mail-line text-blue-400 text-lg"></i>
                </div>
                <h4 className="text-base font-semibold text-white mb-1">Email</h4>
                <p className="text-gray-400 text-sm mb-2">
                  For sales, support, or general inquiries.
                </p>
                <a
                  href="mailto:hello@guardianhub.com"
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors cursor-pointer"
                >
                  hello@guardianhub.com
                </a>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <i className="ri-phone-line text-blue-400 text-lg"></i>
                </div>
                <h4 className="text-base font-semibold text-white mb-1">Phone</h4>
                <p className="text-gray-400 text-sm mb-2">
                  Mon–Fri, 9am–6pm GMT
                </p>
                <a
                  href="tel:+442012345678"
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors cursor-pointer"
                >
                  +44 20 1234 5678
                </a>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <i className="ri-map-pin-line text-blue-400 text-lg"></i>
                </div>
                <h4 className="text-base font-semibold text-white mb-1">Office</h4>
                <p className="text-gray-400 text-sm">
                  12th Floor, The Shard
                  <br />
                  London Bridge Street
                  <br />
                  London SE1 9SG
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <h4 className="text-base font-semibold text-white mb-3">
                  Prefer a demo?
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Book a 20-minute walkthrough with our team.
                </p>
                <a
                  href="/demo"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Book a Demo
                  <i className="ri-arrow-right-line"></i>
                </a>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}