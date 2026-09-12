'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SectionHeading from './components/SectionHeading';
import GlassCard from './components/GlassCard';
import { useInView } from './hooks/useInView';

function AudienceCard({
  icon,
  title,
  subtitle,
  features,
  cta,
  ctaHref,
}: {
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
  cta: string;
  ctaHref: string;
}) {
  return (
    <GlassCard className="p-8 flex flex-col h-full" hover>
      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-5">
        <i className={`${icon} text-blue-400 text-xl`}></i>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-5">{subtitle}</p>
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <i className="ri-check-line text-blue-400 text-xs mt-1"></i>
            <span className="text-gray-300 text-sm">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
      >
        {cta}
        <i className="ri-arrow-right-line"></i>
      </Link>
    </GlassCard>
  );
}

function FeatureShowcase({
  title,
  description,
  image,
  reverse = false,
  badge,
}: {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
  badge?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`grid lg:grid-cols-2 gap-10 items-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className={reverse ? 'lg:order-2' : ''}>
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            {badge}
          </span>
        )}
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-base leading-relaxed">{description}</p>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0f172a] shadow-2xl shadow-blue-900/20">
          <img src={image} alt={title} className="w-full h-64 md:h-72 object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { ref: heroRef, isInView: heroInView } = useInView();

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(37,99,235,0.08)_0%,_transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div
            ref={heroRef}
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                AI-Powered Security Operations
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                The AI command centre for{' '}
                <span className="text-blue-400">modern security operations</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-8 max-w-lg">
                Rota generation, incident reporting, patrol tracking, and real-time analytics — all powered by AI. Built for security firms that refuse to settle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Book a Demo
                  <i className="ri-arrow-right-line"></i>
                </Link>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openLoginModal');
                    window.dispatchEvent(event);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-login-box-line"></i>
                  </div>
                  Sign In
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Are you a security guard?{' '}
                <Link href="/login/guard" className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                  Sign in to the Guard Portal
                </Link>
              </p>
              <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <i className="ri-shield-check-line text-blue-400"></i>
                  <span>SIA-aligned workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-cloud-line text-blue-400"></i>
                  <span>Cloud-native</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-lock-line text-blue-400"></i>
                  <span>AES-256 encryption</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/30">
                <img
                  src="https://readdy.ai/api/search-image?query=Modern%20dark-themed%20security%20operations%20command%20centre%20dashboard%20interface%20with%20live%20map%20showing%20guard%20locations%20as%20blue%20dots%20incident%20feed%20patrol%20status%20cards%20and%20real-time%20analytics%20charts%20glassmorphism%20UI%20panels%20navy%20blue%20dark%20background%20electric%20blue%20accent%20colors%20enterprise%20SaaS%20dashboard%20screenshot%20high%20quality&width=900&height=560&seq=hero-dashboard&orientation=landscape"
                  alt="GuardianHub Dashboard"
                  className="w-full h-72 md:h-80 lg:h-96 object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[#0f172a] border border-white/10 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <i className="ri-check-line text-green-400"></i>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Live dashboards</p>
                    <p className="text-gray-500 text-xs">Real-time site visibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Cuts */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="For everyone in your operation"
            title="One platform. Three perspectives."
            subtitle="GuardianHub serves every stakeholder in the security chain with tailored interfaces and workflows."
          />
          <div className="grid md:grid-cols-3 gap-6">
            <AudienceCard
              icon="ri-building-2-line"
              title="Security Firms"
              subtitle="Run your entire operation from a single dashboard. Rotas, incidents, analytics, and client reporting — unified."
              features={[
                'AI rota generation and shift forecasting',
                'Real-time guard tracking across all sites',
                'Automated client reports and SLA tracking',
                'KPI dashboards for operational insights',
              ]}
              cta="See firm features"
              ctaHref="/platform"
            />
            <AudienceCard
              icon="ri-shield-user-line"
              title="Security Guards"
              subtitle="A purpose-built mobile app that makes patrols, check-ins, and incident reporting effortless."
              features={[
                'One-tap clock-in with GPS verification',
                'NFC checkpoint scanning on patrol routes',
                'Offline mode for low-connectivity sites',
                'Instant incident reporting with photo upload',
              ]}
              cta="See guard app"
              ctaHref="/platform"
            />
            <AudienceCard
              icon="ri-briefcase-line"
              title="Clients"
              subtitle="Give your clients a branded portal into their security — real-time visibility without the control room calls."
              features={[
                'White-label portal with your branding',
                'Live patrol and incident visibility',
                'On-demand report generation',
                'Secure messaging with your team',
              ]}
              cta="See client portal"
              ctaHref="/platform"
            />
          </div>
        </div>
      </section>

      {/* Feature Highlights with Screenshots */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Features"
            title="Built for the demands of real security work"
          />
          <div className="space-y-20">
            <FeatureShowcase
              badge="AI-Powered"
              title="Rota generation that actually thinks"
              description="Tell GuardianHub your site requirements, guard certifications, and shift rules. The AI builds optimal rotas in seconds — handling holidays, overtime limits, and last-minute changes without the spreadsheet chaos."
              image="https://readdy.ai/api/search-image?query=Dark-themed%20AI%20rota%20generation%20dashboard%20showing%20weekly%20shift%20schedule%20grid%20with%20guard%20names%20shift%20times%20and%20status%20indicators%20color-coded%20assignments%20blue%20for%20day%20orange%20for%20night%20shifts%20modern%20glassmorphism%20UI%20navy%20background%20enterprise%20SaaS%20screenshot&width=900&height=500&seq=feature-rota&orientation=landscape"
            />
            <FeatureShowcase
              badge="Real-Time"
              title="See every patrol as it happens"
              description="GPS-tracked patrol routes with NFC checkpoint verification. Guards scan checkpoints, you see completion status update in real time. Missed checkpoints trigger instant alerts with auto-escalation to supervisors."
              image="https://readdy.ai/api/search-image?query=Security%20patrol%20tracking%20map%20interface%20on%20dark%20navy%20background%20showing%20guard%20patrol%20routes%20as%20glowing%20blue%20lines%20checkpoint%20markers%20with%20green%20verification%20ticks%20missed%20checkpoint%20alerts%20in%20orange%20real-time%20location%20pins%20modern%20glassmorphism%20dashboard%20enterprise%20SaaS%20screenshot&width=900&height=500&seq=feature-patrol&orientation=landscape"
              reverse
            />
            <FeatureShowcase
              badge="Intelligent"
              title="Incident reports that write themselves"
              description="Guards file incidents in under 60 seconds with structured forms, photo evidence, and auto-tagged locations. Supervisors review, escalate, and close — with full audit trails for compliance and insurance."
              image="https://readdy.ai/api/search-image?query=Dark-themed%20incident%20reporting%20form%20interface%20with%20structured%20fields%20severity%20selector%20photo%20evidence%20upload%20area%20location%20auto-tag%20map%20snippet%20modern%20glassmorphism%20UI%20navy%20background%20blue%20accent%20colors%20enterprise%20SaaS%20dashboard%20screenshot&width=900&height=500&seq=feature-incident&orientation=landscape"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trusted by security teams"
            title="Loved by firms who demand precision"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "GuardianHub cut our rota planning time by 80%. What used to take 6 hours on a Sunday now takes 20 minutes. The AI understands our shift rules better than some of our supervisors.",
                author: 'Marcus Webb',
                role: 'Operations Director, Shield Security Ltd',
              },
              {
                quote:
                  "Our clients love the portal. They can see patrol completion in real time without calling our control room. It has transformed how we communicate with property managers.",
                author: 'Sarah Okonkwo',
                role: 'Managing Director, Apex Guarding',
              },
              {
                quote:
                  "The mobile app is a game-changer for our guards. Clock-in, patrol scanning, and incident reporting all in one place. Training time dropped from two days to two hours.",
                author: 'James Crawford',
                role: 'Head of Field Operations, Sentinex Group',
              },
            ].map((t, i) => (
              <GlassCard key={i} className="p-8 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <i key={j} className="ri-star-fill text-amber-400 text-sm"></i>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {t.author.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.author}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 'UK-built', label: 'For security firms' },
              { value: 'SIA-aligned', label: 'ACS workflow support' },
              { value: 'Cloud-native', label: 'Always available' },
              { value: 'AES-256', label: 'Encryption standard' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing. No hidden fees."
            subtitle="Pay for the guards you manage, not the contracts you win. Switch or cancel anytime."
          />
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                name: 'Sentinel',
                price: '£99',
                period: '/mo',
                desc: 'Small firms (1–25 guards)',
                features: ['3 sites', 'AI rotas', 'Mobile app', 'Email support'],
              },
              {
                name: 'Command',
                price: '£399',
                period: '/mo',
                desc: 'Growing firms (25–200 guards)',
                features: [
                  'Unlimited sites',
                  'Advanced AI + forecasting',
                  'Client portal',
                  'API access',
                  'Priority support',
                ],
                popular: true,
              },
              {
                name: 'Titan',
                price: 'Custom',
                period: '',
                desc: 'Enterprise (200+ guards)',
                features: [
                  'Unlimited everything',
                  'Dedicated manager',
                  'On-premise option',
                  'Custom AI training',
                  '24/7 phone support',
                ],
              },
            ].map((tier) => (
              <GlassCard
                key={tier.name}
                className={`p-8 flex flex-col ${tier.popular ? 'ring-1 ring-blue-500/50 relative' : ''}`}
                hover
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{tier.desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{tier.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <i className="ri-check-line text-blue-400 text-xs mt-1"></i>
                      <span className="text-gray-300 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="block text-center py-2.5 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
                >
                  View full details
                </Link>
              </GlassCard>
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              All plans include a 15-day free trial. No credit card required.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Compare all features
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <GlassCard className="p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your security operations?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join security firms already using GuardianHub to run tighter, smarter, more profitable operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Book a Demo
                <i className="ri-arrow-right-line"></i>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                Start Free Trial
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}