'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
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

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=Professional%20business%20meeting%20in%20modern%20glass%20office%20overlooking%20city%20skyline%20at%20dusk%2C%20two%20people%20reviewing%20dashboard%20on%20large%20screen%2C%20warm%20ambient%20lighting%2C%20navy%20blue%20and%20teal%20tones%2C%20corporate%20photography%20style%2C%20clean%20and%20sophisticated%20atmosphere%2C%20high-end%20technology%20demo%20setting&width=1440&height=500&seq=3&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/70 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">
                Demo
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                See exactly how GuardianHub <span className="text-blue-400">fits your operation</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                Twenty minutes. No pressure. We will walk you through the platform using your real-world scenarios — rotas, incidents, patrols, and client reporting.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#book"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-calendar-line"></i>
                  Book your slot
                </a>
                <Link
                  href="/solutions"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-right-line"></i>
                  Explore solutions
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What you will see */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Preview"
            title="What we will cover in 20 minutes"
            subtitle="Every demo is tailored to your priorities. Here is what most teams want to see first."
          />

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: 'AI Rota Builder',
                desc: 'Watch the AI generate a full compliant rota from your guard pool and shift rules in under 30 seconds.',
                icon: 'ri-magic-line',
                time: '4 min',
              },
              {
                title: 'Live Incident Command',
                desc: 'See how an incident flows from guard report to control-room alert to client portal update in real time.',
                icon: 'ri-alarm-warning-line',
                time: '5 min',
              },
              {
                title: 'Guard Mobile App',
                desc: 'Walk through clock-in, patrol checkpoint scanning, panic button, and offline mode from the guard perspective.',
                icon: 'ri-smartphone-line',
                time: '4 min',
              },
              {
                title: 'Client Portal',
                desc: 'Preview the white-labelled dashboard your clients see — live patrols, incident feeds, and automated reports.',
                icon: 'ri-user-star-line',
                time: '3 min',
              },
              {
                title: 'KPI Dashboard',
                desc: 'Explore the analytics that help you spot trends, reduce incidents, and prove value to stakeholders.',
                icon: 'ri-bar-chart-grouped-line',
                time: '3 min',
              },
              {
                title: 'Q&A + Next Steps',
                desc: 'Ask anything. We will answer pricing, onboarding timelines, data migration, and integration questions.',
                icon: 'ri-question-answer-line',
                time: 'Open',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 75}>
                <GlassCard className="p-6 h-full" hover>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <i className={`${item.icon} text-blue-400 text-lg`}></i>
                    </div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{item.time}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '20', label: 'Minutes — no longer needed' },
              { value: '500+', label: 'Demos delivered this year' },
              { value: '94%', label: 'Book a follow-up after demo' },
              { value: '0', label: 'Pressure to buy — ever' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{stat.value}</div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="book" className="py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Book your demo
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Pick a time that works for you. We will send a calendar invite and a video link within minutes.
              </p>
            </div>
          </FadeIn>

          <GlassCard className="p-8 md:p-10 mb-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-green-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Demo request received
                </h3>
                <p className="text-gray-400 mb-1">
                  We will be in touch within 24 hours to confirm your slot.
                </p>
                <p className="text-gray-500 text-sm">
                  In the meantime, explore the platform at your own pace.
                </p>
              </div>
            ) : (
              <form
                id="demo-form"
                data-readdy-form
                action="https://readdy.ai/api/form/d9tmu6t3pcjqs2fcsgkg"
                method="POST"
                onSubmit={(e) => {
                  const form = e.currentTarget;
                  const hpEl = form.querySelector('[data-hp-field]') as HTMLInputElement;
                  if (hpEl && hpEl.value.trim()) {
                    e.preventDefault();
                    setSubmitted(true);
                    return;
                  }
                  setSubmitted(true);
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-5">Request a personalised demo</h3>
                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Work email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    placeholder="john@yourcompany.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                      placeholder="Your security firm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Job role
                    </label>
                    <input
                      type="text"
                      name="jobRole"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                      placeholder="e.g. Operations Director"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Approximate guard count
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['1–25', '25–100', '100–200', '200+', 'Not sure'].map(
                      (count) => (
                        <label key={count} className="cursor-pointer">
                          <input
                            type="radio"
                            name="guardCount"
                            value={count}
                            className="peer sr-only"
                          />
                          <span className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 peer-checked:bg-blue-500/20 peer-checked:border-blue-500/50 peer-checked:text-blue-300 transition-colors whitespace-nowrap">
                            {count}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Main challenge *
                  </label>
                  <textarea
                    name="interests"
                    rows={3}
                    required
                    maxLength={500}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none text-sm"
                    placeholder="What problem are you trying to solve? Rota management, patrol verification, client reporting...?"
                  ></textarea>
                  <p className="text-gray-500 text-xs mt-1">Max 500 characters</p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred contact method
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Email', 'Phone', 'Video call', 'Either'].map((method) => (
                      <label key={method} className="cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value={method}
                          className="peer sr-only"
                        />
                        <span className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 peer-checked:bg-blue-500/20 peer-checked:border-blue-500/50 peer-checked:text-blue-300 transition-colors whitespace-nowrap">
                          {method}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" name="privacyAck" required className="mt-0.5 accent-blue-500" />
                    <span className="text-gray-400 text-xs leading-relaxed">
                      I understand that GuardianHub will use my contact details to arrange a demo. My data will be handled in accordance with the <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">Privacy Notice</Link>.
                    </span>
                  </label>
                </div>

                <input
                  type="text"
                  name="website_alt"
                  data-hp-field
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  readOnly
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Request Demo
                </button>
                <p className="text-gray-500 text-xs text-center mt-3">
                  We respect your privacy. No spam, ever.
                </p>
              </form>
            )}
          </GlassCard>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Or reach out directly
            </p>
            <a
              href="mailto:hello@guardianhub.com"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
            >
              hello@guardianhub.com
            </a>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Trusted by security firms across the UK
            </h2>
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