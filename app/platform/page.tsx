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

function FeatureBlock({
  id,
  title,
  description,
  features,
  image,
  reverse = false,
}: {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  reverse?: boolean;
}) {
  const { ref, isInView } = useInView();

  return (
    <section id={id} className="py-20 scroll-mt-24" ref={ref}>
      <div
        className={`max-w-7xl mx-auto px-6 lg:px-8 flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-16 items-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">{description}</p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5 shrink-0">
                  <i className="ri-check-line text-blue-400 text-xs"></i>
                </div>
                <span className="text-gray-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 w-full">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0f172a]">
            <img
              src={image}
              alt={title}
              className="w-full h-72 md:h-80 object-cover object-top"
            />
            <div className="absolute inset-0 bg-blue-900/10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PlatformPage() {
  const features = [
    {
      id: 'ai-rota',
      title: 'AI Rota Generation',
      description:
        'Stop building rotas by hand. Drop in your guard pool, define the rules, and let AI handle the rest — compliance, overtime limits, and availability all factored in automatically.',
      features: [
        'Auto-generates compliant rotas from requirements in under 30 seconds',
        'Handles shift swaps and last-minute changes without breaking coverage',
        'Balances workload evenly across your team to prevent burnout',
        'Seamlessly exports completed schedules to payroll and HR systems',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Modern%20dark-themed%20security%20operations%20dashboard%20showing%20AI%20rota%20generation%20interface%20with%20weekly%20schedule%20grid%2C%20shift%20assignments%20in%20blue%20and%20orange%20highlights%2C%20guard%20avatars%20and%20status%20indicators%2C%20glassmorphism%20UI%20design%2C%20minimal%20and%20clean%20layout%2C%20dark%20navy%20background%20with%20electric%20blue%20accents%2C%20enterprise%20SaaS%20dashboard%20screenshot%20style&width=900&height=500&seq=platform-rota-new&orientation=landscape',
      reverse: false,
    },
    {
      id: 'incident-reporting',
      title: 'Incident Reporting',
      description:
        'When something happens, speed and accuracy matter. Create, escalate, and close incidents in seconds — every report is timestamped, geotagged, and routed to the right people automatically.',
      features: [
        'One-tap incident creation from mobile or desktop, even offline',
        'Auto-escalation based on severity levels with SMS and push alerts',
        'Photo, video, and voice evidence uploads with full chain of custody',
        'Post-incident analytics that surface trends and prevent recurrence',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Dark-themed%20security%20incident%20reporting%20dashboard%20interface%2C%20incident%20list%20with%20severity%20badges%20in%20red%20orange%20and%20yellow%2C%20detailed%20incident%20form%20with%20photo%20evidence%20thumbnails%2C%20timeline%20view%20of%20events%2C%20modern%20glassmorphism%20UI%2C%20navy%20blue%20background%20with%20electric%20blue%20highlights%2C%20enterprise%20SaaS%20application%20screenshot&width=900&height=500&seq=platform-incident-new&orientation=landscape',
      reverse: true,
    },
    {
      id: 'patrol-management',
      title: 'Patrol Management',
      description:
        'Know your guards are where they say they are. GPS-tracked routes with NFC and QR checkpoint verification give you real-time confirmation of every patrol, every time.',
      features: [
        'Customisable patrol routes tailored to each site layout and risk profile',
        'NFC tag and QR code checkpoint scanning with automatic timestamping',
        'Missed checkpoint alerts that auto-escalate to supervisors instantly',
        'Patrol completion analytics to prove service delivery to clients',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Security%20patrol%20management%20dashboard%20with%20GPS%20map%20showing%20guard%20patrol%20routes%20as%20blue%20lines%20on%20dark%20map%2C%20checkpoint%20markers%20with%20green%20check%20icons%2C%20patrol%20completion%20percentage%20widget%2C%20modern%20dark-themed%20UI%20with%20glassmorphism%20cards%2C%20navy%20background%20with%20electric%20blue%20accents%2C%20enterprise%20SaaS%20screenshot%20style&width=900&height=500&seq=platform-patrol-new&orientation=landscape',
      reverse: false,
    },
    {
      id: 'kpi-analytics',
      title: 'KPI Analytics',
      description:
        'Raw data is useless. GuardianHub turns your security information into actionable intelligence that helps you make faster, smarter decisions for your team and your clients.',
      features: [
        'Real-time KPI dashboards with fully customisable widgets and filters',
        'Long-term trend analysis spanning weeks, months, and years of data',
        'Automated client performance reports delivered on your schedule',
        'One-click export to PowerPoint, PDF, or CSV for board meetings',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Security%20analytics%20KPI%20dashboard%20with%20multiple%20charts%20and%20graphs%20including%20line%20charts%20bar%20charts%20and%20pie%20charts%20showing%20incident%20trends%20response%20times%20and%20guard%20performance%20metrics%2C%20dark%20theme%20with%20navy%20background%2C%20glassmorphism%20card%20panels%2C%20electric%20blue%20and%20teal%20data%20visualizations%2C%20modern%20enterprise%20SaaS%20dashboard%20screenshot&width=900&height=500&seq=platform-kpi-new&orientation=landscape',
      reverse: true,
    },
    {
      id: 'mobile-guard',
      title: 'Mobile Guard Portal',
      description:
        'Your guards deserve tools that work as hard as they do. A purpose-built mobile app for clocking in, completing patrols, filing incidents, and staying connected — all from one screen.',
      features: [
        'One-tap clock-in with GPS verification so you know exactly who is on site',
        'Offline mode for remote or low-connectivity locations with auto-sync',
        'Voice-activated incident reporting for hands-free documentation',
        'Instant push notifications for shift changes, alerts, and supervisor messages',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Mobile%20security%20guard%20app%20interface%20shown%20on%20smartphone%20mockup%2C%20dark%20theme%20with%20clock-in%20button%2C%20patrol%20checklist%2C%20incident%20report%20form%2C%20and%20notification%20center%2C%20blue%20and%20white%20UI%20elements%20on%20dark%20navy%20background%2C%20modern%20mobile%20app%20design%2C%20clean%20and%20minimal%20layout%2C%20enterprise%20mobile%20application%20screenshot&width=900&height=500&seq=platform-mobile-new&orientation=landscape',
      reverse: false,
    },
    {
      id: 'client-portal',
      title: 'Client Portal',
      description:
        'Transparency wins contracts. Give your clients a branded, real-time window into their security operations — no more phone calls asking if the patrol happened.',
      features: [
        'White-label portal with your logo, colours, and domain for seamless branding',
        'Live incident and patrol visibility so clients see service delivery in real time',
        'Scheduled and on-demand report generation that saves your team hours',
        'Secure two-way messaging between clients and your control room team',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Client%20portal%20dashboard%20for%20security%20services%20showing%20branded%20interface%20with%20site%20overview%20cards%20incident%20summary%20patrol%20status%20and%20report%20download%20buttons%2C%20dark%20theme%20with%20navy%20background%20and%20blue%20accents%2C%20glassmorphism%20card%20design%2C%20clean%20modern%20enterprise%20SaaS%20screenshot%20style&width=900&height=500&seq=platform-client-new&orientation=landscape',
      reverse: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20security%20control%20room%20with%20multiple%20monitors%20displaying%20surveillance%20feeds%20and%20analytics%20dashboards%2C%20dramatic%20blue%20ambient%20lighting%2C%20dark%20environment%20with%20professional%20operators%20working%20at%20consoles%2C%20cinematic%20wide%20angle%20photography%2C%20deep%20navy%20and%20electric%20blue%20tones%2C%20high-tech%20operations%20centre%20atmosphere&width=1440&height=500&seq=2&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/70 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">
                Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                The command centre your security firm has been missing
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl">
                Six core modules built from the ground up for modern security operations. Everything connected. Everyone aligned. Every site covered.
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

      {/* Quick Nav Pills */}
      <div className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {features.map((f) => (
              <a
                key={f.id}
                href={`#${f.id}`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-blue-500/30 hover:bg-blue-500/10 transition-all cursor-pointer whitespace-nowrap"
              >
                {f.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Blocks */}
      <div className="border-t border-white/10">
        {features.map((feature) => (
          <FeatureBlock key={feature.id} {...feature} />
        ))}
      </div>

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

      {/* Integrations */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Integration"
            title="Connects with what you already use"
            subtitle="GuardianHub plugs into your existing stack. No rip-and-replace required."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: 'Payroll Systems', icon: 'ri-money-pound-circle-line' },
              { label: 'Access Control', icon: 'ri-door-lock-line' },
              { label: 'CCTV Feeds', icon: 'ri-camera-line' },
              { label: 'HR Platforms', icon: 'ri-user-settings-line' },
              { label: 'Slack / Teams', icon: 'ri-message-3-line' },
              { label: 'Email Alerts', icon: 'ri-mail-line' },
              { label: 'SMS Gateways', icon: 'ri-message-line' },
              { label: 'API Webhooks', icon: 'ri-code-s-slash-line' },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 50}>
                <GlassCard
                  className="p-6 flex items-center justify-center gap-3 text-center"
                  hover
                >
                  <i className={`${item.icon} text-blue-400 text-lg`}></i>
                  <span className="text-gray-300 text-sm font-medium">{item.label}</span>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Security"
            title="Enterprise-grade protection, standard"
            subtitle="Your data and your clients data are protected by the same standards used by financial institutions."
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: 'SOC 2 Type II Compliant',
                desc: 'Independently audited controls for security, availability, and confidentiality.',
                icon: 'ri-shield-check-line',
              },
              {
                title: 'End-to-End Encryption',
                desc: 'All data in transit and at rest encrypted with AES-256 and TLS 1.3 standards.',
                icon: 'ri-lock-2-line',
              },
              {
                title: 'Role-Based Access Control',
                desc: 'Granular permissions so every user only sees what they are authorised to see.',
                icon: 'ri-shield-user-line',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
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