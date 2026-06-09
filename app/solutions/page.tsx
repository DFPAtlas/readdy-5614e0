'use client';

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

function CapabilityCard({
  icon,
  label,
  title,
  description,
  bullets,
  cta,
  ctaHref,
  highlight = false,
}: {
  icon: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  ctaHref: string;
  highlight?: boolean;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <GlassCard
        className={`h-full flex flex-col ${highlight ? 'ring-1 ring-blue-500/50' : ''}`}
        hover
      >
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <i className={`${icon} text-blue-400 text-lg`}></i>
            </div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {label}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6">{description}</p>

          <ul className="space-y-3 mb-8 flex-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <i className="ri-check-line text-blue-400 mt-0.5 text-sm"></i>
                <span className="text-gray-300 text-sm">{b}</span>
              </li>
            ))}
          </ul>

          <Link
            href={ctaHref}
            className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
          >
            {cta}
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=Aerial%20view%20of%20a%20modern%20corporate%20campus%20at%20dusk%20with%20warm%20building%20lights%2C%20security%20patrol%20vehicles%20visible%2C%20lush%20landscaping%2C%20dramatic%20sky%20with%20deep%20blue%20and%20orange%20tones%2C%20cinematic%20photography%20style%2C%20professional%20security%20operations%20setting&width=1440&height=500&seq=1&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/70 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">
                Solutions
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Security operations, <span className="text-blue-400">solved end to end</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl">
                From rota planning to incident response, GuardianHub gives security firms the command centre they have been missing. One platform. Every site. Every guard. Every minute.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-play-circle-line"></i>
                  Watch a 2-min demo
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-calendar-line"></i>
                  Book a live walkthrough
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform"
            title="Three pillars that power every deployment"
            subtitle="Every GuardianHub account is built on the same foundation — operations management, guard empowerment, and client transparency."
          />

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <CapabilityCard
              icon="ri-dashboard-3-line"
              label="Command Centre"
              title="Operations Management"
              description="Run your entire back office from one screen. Schedules, incidents, sites, compliance — all connected."
              bullets={[
                'AI-powered rota generation with shift forecasting',
                'Real-time site status and guard tracking',
                'Incident management with automated escalation',
                'Custom SOP builder and compliance reporting',
                'Multi-site dashboards with drill-down analytics',
              ]}
              cta="Explore Operations"
              ctaHref="/platform"
            />

            <CapabilityCard
              icon="ri-smartphone-line"
              label="Guard App"
              title="Guard Experience"
              description="Give your frontline team a tool they actually want to use. Simple, fast, and built for the job."
              bullets={[
                'One-tap clock-in with GPS verification',
                'Panic button with instant control-room alert',
                'Patrol checkpoints with photo and QR logging',
                'Incident reporting with voice-to-text',
                'Offline mode that syncs when signal returns',
              ]}
              cta="See the Guard App"
              ctaHref="/platform"
              highlight
            />

            <CapabilityCard
              icon="ri-user-star-line"
              label="Client Portal"
              title="Client Visibility"
              description="Turn transparency into trust. Give your clients a branded window into the service they pay for."
              bullets={[
                'White-labelled dashboard with your branding',
                'Live guard presence and patrol confirmation',
                'Incident feeds with photos and timeline',
                'Automated weekly and monthly reports',
                'Message centre for direct client communication',
              ]}
              cta="Explore Client Portal"
              ctaHref="/platform"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '40%', label: 'Reduction in scheduling admin time' },
              { value: '3x', label: 'Faster incident resolution' },
              { value: '98%', label: 'Guard mobile app adoption rate' },
              { value: '24/7', label: 'Real-time site visibility' },
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

      {/* Use Cases */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Use Cases"
            title="Built for every environment"
            subtitle="GuardianHub adapts to the unique demands of each sector — not the other way around."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: 'Corporate Campuses',
                desc: 'Manage multi-building sites with guard rotations, visitor tracking, and incident protocols.',
                icon: 'ri-building-line',
              },
              {
                title: 'Retail Security',
                desc: 'Track loss prevention patrols, coordinate with store managers, and report incidents fast.',
                icon: 'ri-store-2-line',
              },
              {
                title: 'Event Security',
                desc: 'Rapidly deploy rotas for festivals, conferences, and sporting events with real-time updates.',
                icon: 'ri-calendar-event-line',
              },
              {
                title: 'Construction Sites',
                desc: 'Verify guard presence across sprawling sites with GPS checkpoints and photo evidence.',
                icon: 'ri-hammer-line',
              },
              {
                title: 'Residential Concierge',
                desc: 'Combine security and concierge duties in one platform with task management and visitor logs.',
                icon: 'ri-home-smile-line',
              },
              {
                title: 'Healthcare Facilities',
                desc: 'Meet strict compliance requirements with audit trails, incident documentation, and shift logs.',
                icon: 'ri-hospital-line',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 75}>
                <GlassCard className="p-6 h-full" hover>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                    <i className={`${item.icon} text-blue-400 text-lg`}></i>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to run a modern security firm"
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {[
              {
                title: 'AI Rota Builder',
                desc: 'Drop in your guard pool, define shift rules, and let the AI build compliant rotas in seconds. Handles leave, qualifications, and overtime rules automatically.',
                icon: 'ri-magic-line',
              },
              {
                title: 'Live Incident Command',
                desc: 'When something happens, everyone who needs to know knows instantly. Control-room view, guard app alerts, and client portal updates — all in one flow.',
                icon: 'ri-alarm-warning-line',
              },
              {
                title: 'Patrol Verification',
                desc: 'GPS-tagged checkpoint scans with optional photo proof. Know your guards are where they say they are, when they say they are.',
                icon: 'ri-map-pin-line',
              },
              {
                title: 'Automated Reporting',
                desc: 'Weekly site reports, incident summaries, and compliance packs generated and emailed without lifting a finger.',
                icon: 'ri-file-list-3-line',
              },
              {
                title: 'SOP & Compliance',
                desc: 'Digital standard operating procedures, version control, and guard acknowledgment tracking. Audit-ready, always.',
                icon: 'ri-shield-check-line',
              },
              {
                title: 'Client White-Label',
                desc: 'Your logo, your colours, your domain. Give clients a branded portal that makes your firm look like the enterprise operation you are.',
                icon: 'ri-palette-line',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
                <div className="flex gap-4 p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <i className={`${item.icon} text-blue-400 text-xl`}></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to see it in action?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Whether you run five guards or five hundred, we will show you exactly how GuardianHub fits your operation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-play-circle-line"></i>
                Watch the demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-calendar-line"></i>
                Book a call
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}