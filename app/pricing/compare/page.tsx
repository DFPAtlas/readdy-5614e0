'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useInView } from '../../hooks/useInView';

/* ── reusable animated wrapper ─────────────────────────── */
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── plan colour tokens ─────────────────────────────────── */
const planStyles = {
  sentinel: { label: 'Sentinel', colour: 'text-gray-300', border: 'border-gray-500/20', bg: 'bg-gray-500/10', accent: 'bg-gray-500' },
  command: { label: 'Command', colour: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', accent: 'bg-blue-600' },
  titan: { label: 'Titan', colour: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', accent: 'bg-amber-500' },
};

type PlanKey = keyof typeof planStyles;

/* ── mini plan recap cards ──────────────────────────────── */
const miniPlans = [
  {
    key: 'sentinel' as PlanKey,
    price: '£99',
    tag: 'For small teams',
    guards: '25 guards',
    sites: '3 sites',
  },
  {
    key: 'command' as PlanKey,
    price: '£399',
    tag: 'Most Popular',
    guards: '200 guards',
    sites: 'Unlimited sites',
  },
  {
    key: 'titan' as PlanKey,
    price: 'Custom',
    tag: 'Enterprise',
    guards: 'Unlimited',
    sites: 'Unlimited',
  },
];

function MiniPlanCard({ plan }: { plan: typeof miniPlans[0] }) {
  const s = planStyles[plan.key];
  return (
    <div className={`rounded-2xl border ${s.border} bg-white/[0.02] p-6 flex flex-col`}>
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${s.bg} ${s.colour} text-xs font-bold w-fit mb-4`}>
        <span className={`w-2 h-2 rounded-full ${s.accent}`} />
        {s.label}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{plan.price}</div>
      <div className="text-gray-500 text-sm mb-4">{plan.tag}</div>
      <div className="space-y-2 mt-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-user-line text-gray-500 text-xs" /></span>
          {plan.guards}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-building-line text-gray-500 text-xs" /></span>
          {plan.sites}
        </div>
      </div>
    </div>
  );
}

/* ── feature category data ───────────────────────────────── */
const categories = [
  {
    icon: 'ri-calendar-schedule-line',
    title: 'Rota & Scheduling',
    desc: 'Build, manage and optimise guard schedules with AI assistance.',
    sentinel: ['Basic rota builder', 'Manual shift assignment', 'Week view calendar'],
    command: ['AI rota generation', 'Auto conflict detection', 'Leave & sickness automation', 'Forecasting & cover planning'],
    titan: ['Predictive staffing AI', 'Multi-company rota sharing', 'Custom shift pattern rules', 'Union compliance engine'],
    img: 'https://readdy.ai/api/search-image?query=A%20modern%20dark-themed%20security%20operations%20rota%20scheduling%20dashboard%20interface%20showing%20a%20weekly%20guard%20shift%20calendar%20with%20colour-coded%20shifts%2C%20employee%20avatars%2C%20and%20conflict%20warnings%20on%20a%20clean%20minimal%20UI%20with%20subtle%20blue%20accent%20colours%20and%20soft%20ambient%20lighting%2C%20professional%20enterprise%20software%20screenshot&width=1200&height=700&seq=1&orientation=landscape',
  },
  {
    icon: 'ri-map-pin-line',
    title: 'Patrol & GPS Tracking',
    desc: 'Track patrol routes, checkpoint scans and guard locations in real time.',
    sentinel: ['Basic patrol logs', 'Manual check-in/out'],
    command: ['GPS patrol tracking', 'NFC checkpoint scans', 'Patrol route optimisation', 'Missed patrol alerts', 'Live location map'],
    titan: ['Geofence automation', 'Predictive route AI', 'Custom patrol logic', 'Integration with access control'],
    img: 'https://readdy.ai/api/search-image?query=A%20modern%20dark-themed%20security%20patrol%20tracking%20dashboard%20showing%20a%20live%20map%20with%20guard%20location%20pins%2C%20patrol%20route%20lines%2C%20checkpoint%20status%20indicators%2C%20and%20a%20sidebar%20with%20real-time%20patrol%20progress%20bars%2C%20clean%20minimal%20enterprise%20UI%20with%20blue%20and%20teal%20accent%20colours%2C%20professional%20software%20interface%20screenshot&width=1200&height=700&seq=2&orientation=landscape',
  },
  {
    icon: 'ri-smartphone-line',
    title: 'Guard Mobile Portal',
    desc: 'Give your guards everything they need in their pocket.',
    sentinel: ['Clock in/out', 'Incident reporting', 'View shifts'],
    command: ['Offline mode', 'Panic button', 'Patrol scanning', 'SOP access', 'Photo/video evidence', 'AI SOP assistant'],
    titan: ['Custom branded app', 'Multi-language support', 'Advanced biometric login', 'Integration with body cameras'],
    img: 'https://readdy.ai/api/search-image?query=A%20modern%20dark-themed%20mobile%20security%20guard%20application%20interface%20shown%20on%20a%20smartphone%20screen%20mockup%2C%20displaying%20a%20dashboard%20with%20patrol%20status%2C%20incident%20reporting%20button%2C%20shift%20schedule%2C%20and%20GPS%20tracking%20map%2C%20clean%20minimal%20UI%20with%20deep%20navy%20background%20and%20blue%20accent%20highlights%2C%20professional%20mobile%20app%20screenshot&width=1200&height=700&seq=3&orientation=landscape',
  },
  {
    icon: 'ri-file-warning-line',
    title: 'Incident & Occurrence',
    desc: 'Capture, manage and report on every security event.',
    sentinel: ['Basic incident forms', 'Digital occurrence book', 'Photo attachments'],
    command: ['Advanced incident workflows', 'Timeline builder', 'Media gallery & evidence chain', 'AI report writer', 'Client notification'],
    titan: ['Custom incident categories', 'Bespoke report templates', 'Court-ready evidence packs', 'Integration with police systems'],
    img: 'https://readdy.ai/api/search-image?query=A%20modern%20dark-themed%20security%20incident%20management%20dashboard%20interface%20showing%20an%20incident%20detail%20view%20with%20timeline%20entries%2C%20severity%20badges%2C%20attached%20media%20thumbnails%2C%20and%20an%20AI%20report%20writer%20panel%2C%20clean%20minimal%20enterprise%20UI%20with%20red%20and%20blue%20accent%20colours%20on%20a%20dark%20background%2C%20professional%20software%20screenshot&width=1200&height=700&seq=4&orientation=landscape',
  },
  {
    icon: 'ri-bar-chart-box-line',
    title: 'Dashboards & Analytics',
    desc: 'Real-time visibility into your entire security operation.',
    sentinel: ['Basic KPI cards', 'Guard count', 'Incident count', 'Shift coverage'],
    command: ['Real-time command centre', 'Ops room mode', 'Patrol completion %', 'AI insights panel', 'Risk score tracking', 'Custom widgets'],
    titan: ['Predictive analytics', 'Custom data pipelines', 'White-label dashboards', 'Executive briefing auto-generation'],
    img: 'https://readdy.ai/api/search-image?query=A%20modern%20dark-themed%20security%20operations%20command%20centre%20dashboard%20with%20multiple%20data%20widgets%20showing%20guard%20status%2C%20live%20incident%20feed%2C%20patrol%20completion%20bars%2C%20risk%20score%20gauges%2C%20and%20AI%20alert%20cards%2C%20clean%20minimal%20enterprise%20UI%20with%20blue%20and%20purple%20accent%20colours%20on%20a%20deep%20navy%20background%2C%20professional%20control%20room%20software%20screenshot&width=1200&height=700&seq=5&orientation=landscape',
  },
  {
    icon: 'ri-robot-2-line',
    title: 'AI & Automation',
    desc: 'Let AI handle the repetitive work so your team stays sharp.',
    sentinel: ['Limited AI usage'],
    command: ['AI rota generation', 'AI report writer', 'AI SOP chat assistant', 'Smart notifications', 'Auto cover planning'],
    titan: ['Advanced AI automation', 'Predictive staffing AI', 'Custom AI model training', 'Natural language queries', 'AI anomaly detection'],
    img: 'https://readdy.ai/api/search-image?query=A%20modern%20dark-themed%20AI%20assistant%20chat%20interface%20for%20security%20operations%20showing%20a%20conversation%20panel%20with%20AI%20responses%2C%20suggested%20actions%2C%20and%20an%20insights%20sidebar%20with%20data%20visualisations%2C%20clean%20minimal%20enterprise%20UI%20with%20purple%20and%20blue%20gradient%20accents%20on%20a%20dark%20background%2C%20professional%20software%20screenshot&width=1200&height=700&seq=6&orientation=landscape',
  },
  {
    icon: 'ri-user-star-line',
    title: 'Client Portal',
    desc: 'Give your clients real-time visibility without the back-and-forth.',
    sentinel: ['Not included'],
    command: ['White-label client portal', 'Live incident feed', 'Site status dashboard', 'Report downloads', 'Message centre'],
    titan: ['Custom branded portals', 'Multi-client management', 'SLA tracking', 'Bespoke client reports', 'API for client integrations'],
    img: 'https://readdy.ai/api/search-image?query=A%20modern%20dark-themed%20white-label%20client%20portal%20dashboard%20for%20a%20security%20company%20showing%20site%20status%20overview%2C%20recent%20incidents%20list%2C%20patrol%20completion%20metrics%2C%20and%20downloadable%20reports%20panel%2C%20clean%20minimal%20enterprise%20UI%20with%20subtle%20green%20and%20blue%20accent%20colours%20on%20a%20dark%20background%2C%20professional%20SaaS%20interface%20screenshot&width=1200&height=700&seq=7&orientation=landscape',
  },
];

/* ── category section renderer ───────────────────────────── */
function CategorySection({
  cat,
  index,
}: {
  cat: typeof categories[0];
  index: number;
}) {
  const align = index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse';

  return (
    <FadeIn>
      <div className={`flex flex-col ${align} gap-10 lg:gap-16 items-start`}>
        {/* screenshot */}
        <div className="w-full lg:w-[55%] shrink-0">
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d1220] shadow-2xl shadow-black/40">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-gray-600 font-mono">GuardianHub — {cat.title}</span>
            </div>
            <img
              src={cat.img}
              alt={cat.title}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* feature lists */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <i className={`${cat.icon} text-lg`} />
            </span>
            <h3 className="text-2xl font-bold text-white">{cat.title}</h3>
          </div>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">{cat.desc}</p>

          <div className="space-y-6">
            <PlanFeatureBlock plan="sentinel" items={cat.sentinel} />
            <PlanFeatureBlock plan="command" items={cat.command} />
            <PlanFeatureBlock plan="titan" items={cat.titan} />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function PlanFeatureBlock({ plan, items }: { plan: PlanKey; items: string[] }) {
  const s = planStyles[plan];
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`w-2 h-2 rounded-full ${s.accent}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${s.colour}`}>{s.label}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
            <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-check-line text-blue-400 text-sm" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── full matrix data ───────────────────────────────────── */
const matrixFeatures = [
  { name: 'Guards', sentinel: 'Up to 25', command: 'Up to 200', titan: 'Unlimited' },
  { name: 'Sites', sentinel: 'Up to 3', command: 'Unlimited', titan: 'Unlimited' },
  { name: 'Basic rota builder', sentinel: true, command: true, titan: true },
  { name: 'AI rota generation', sentinel: false, command: true, titan: true },
  { name: 'Leave & sickness automation', sentinel: false, command: true, titan: true },
  { name: 'Predictive staffing AI', sentinel: false, command: false, titan: true },
  { name: 'Manual shift assignment', sentinel: true, command: true, titan: true },
  { name: 'Conflict detection', sentinel: false, command: true, titan: true },
  { name: 'Custom shift rules', sentinel: false, command: false, titan: true },
  { name: 'Guard management', sentinel: true, command: true, titan: true },
  { name: 'Site management', sentinel: true, command: true, titan: true },
  { name: 'Basic incident forms', sentinel: true, command: true, titan: true },
  { name: 'Advanced incident workflows', sentinel: false, command: true, titan: true },
  { name: 'Timeline builder', sentinel: false, command: true, titan: true },
  { name: 'AI report writer', sentinel: false, command: true, titan: true },
  { name: 'Evidence chain of custody', sentinel: false, command: true, titan: true },
  { name: 'Digital occurrence book', sentinel: true, command: true, titan: true },
  { name: 'Basic patrol logs', sentinel: true, command: true, titan: true },
  { name: 'GPS patrol tracking', sentinel: false, command: true, titan: true },
  { name: 'NFC checkpoint scans', sentinel: false, command: true, titan: true },
  { name: 'Missed patrol alerts', sentinel: false, command: true, titan: true },
  { name: 'Geofence automation', sentinel: false, command: false, titan: true },
  { name: 'Mobile guard portal', sentinel: true, command: true, titan: true },
  { name: 'Offline mode', sentinel: false, command: true, titan: true },
  { name: 'Panic button', sentinel: false, command: true, titan: true },
  { name: 'SOP access & AI assistant', sentinel: false, command: true, titan: true },
  { name: 'Custom branded mobile app', sentinel: false, command: false, titan: true },
  { name: 'Basic KPI dashboard', sentinel: true, command: true, titan: true },
  { name: 'Real-time command centre', sentinel: false, command: true, titan: true },
  { name: 'Ops room wall display', sentinel: false, command: true, titan: true },
  { name: 'AI insights panel', sentinel: false, command: true, titan: true },
  { name: 'Risk score tracking', sentinel: false, command: true, titan: true },
  { name: 'Predictive analytics', sentinel: false, command: false, titan: true },
  { name: 'White-label dashboards', sentinel: false, command: false, titan: true },
  { name: 'Limited AI usage', sentinel: true, command: true, titan: true },
  { name: 'AI SOP chat assistant', sentinel: false, command: true, titan: true },
  { name: 'Smart notifications', sentinel: false, command: true, titan: true },
  { name: 'Auto cover planning', sentinel: false, command: true, titan: true },
  { name: 'Custom AI model training', sentinel: false, command: false, titan: true },
  { name: 'AI anomaly detection', sentinel: false, command: false, titan: true },
  { name: 'Client portal', sentinel: false, command: true, titan: true },
  { name: 'White-label client portal', sentinel: false, command: true, titan: true },
  { name: 'Multi-client management', sentinel: false, command: false, titan: true },
  { name: 'Bespoke client reports', sentinel: false, command: false, titan: true },
  { name: 'Compliance management', sentinel: false, command: true, titan: true },
  { name: 'API access', sentinel: false, command: false, titan: true },
  { name: 'Custom integrations', sentinel: false, command: false, titan: true },
  { name: 'Multi-company support', sentinel: false, command: false, titan: true },
  { name: 'Dedicated account manager', sentinel: false, command: false, titan: true },
  { name: 'Priority support', sentinel: false, command: true, titan: true },
  { name: '24/7 phone support', sentinel: false, command: false, titan: true },
  { name: 'Onboarding & training', sentinel: 'Self-serve', command: 'Priority', titan: 'Dedicated' },
  { name: 'Data retention', sentinel: '14 days', command: '90 days', titan: 'Unlimited' },
  { name: 'SSO & advanced security', sentinel: false, command: false, titan: true },
];

/* ── matrix cell renderer ────────────────────────────────── */
function MatrixCell({ value, tier }: { value: string | boolean; tier?: PlanKey }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="w-6 h-6 flex items-center justify-center mx-auto">
        <i className="ri-check-line text-blue-400 text-base" />
      </span>
    ) : (
      <span className="w-6 h-6 flex items-center justify-center mx-auto">
        <i className="ri-subtract-line text-gray-700 text-base" />
      </span>
    );
  }

  const colour = tier === 'command' ? 'text-blue-300' : tier === 'titan' ? 'text-amber-300' : 'text-gray-300';
  return <span className={colour}>{value}</span>;
}

/* ── main page ─────────────────────────────────────────── */
export default function ComparePage() {
  const [matrixFilter, setMatrixFilter] = useState<'all' | PlanKey>('all');

  const filteredMatrix = matrixFilter === 'all'
    ? matrixFeatures
    : matrixFeatures.filter((f) => {
        const val = f[matrixFilter];
        return val === true || (typeof val === 'string' && val !== 'Not included');
      });

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {/* ── hero ───────────────────────── */}
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <FadeIn>
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <i className="ri-stack-line" />
                Plan Comparison
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6 tracking-tight">
              Compare all plans
            </h1>
            <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mx-auto leading-relaxed mb-14">
              Every feature. Every module. Side by side. Find the plan that matches the operation you run today and the one you are building tomorrow.
            </p>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-6">
              {miniPlans.map((p) => (
                <MiniPlanCard key={p.key} plan={p} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line" />
                Back to pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── category sections ────────── */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-24 lg:space-y-32">
          {categories.map((cat, i) => (
            <CategorySection key={cat.title} cat={cat} index={i} />
          ))}
        </div>
      </section>

      {/* ── full feature matrix ────────── */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 text-center">
              Full feature matrix
            </h2>
            <p className="text-gray-400 text-center mb-8 max-w-lg mx-auto">
              Every capability across every plan. Filter by plan to see exactly what you get.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl p-1.5">
                {(['all', 'sentinel', 'command', 'titan'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setMatrixFilter(f)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      matrixFilter === f
                        ? f === 'all'
                          ? 'bg-white/10 text-white'
                          : f === 'sentinel'
                            ? 'bg-gray-500/20 text-gray-300'
                            : f === 'command'
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'bg-amber-500/20 text-amber-400'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {f === 'all' ? 'All features' : planStyles[f as PlanKey].label}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 pr-8 text-sm font-medium text-gray-500 w-[45%]">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-300 min-w-[120px]">
                      Sentinel
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-blue-400 min-w-[120px]">
                      Command
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-amber-400 min-w-[120px]">
                      Titan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} border-white/5 hover:bg-white/[0.03] transition-colors`}
                    >
                      <td className="py-3.5 pr-8 text-sm text-gray-300 font-medium">{row.name}</td>
                      <td className="text-center py-3.5 px-4 text-sm">
                        <MatrixCell value={row.sentinel} />
                      </td>
                      <td className="text-center py-3.5 px-4 text-sm">
                        <MatrixCell value={row.command} tier="command" />
                      </td>
                      <td className="text-center py-3.5 px-4 text-sm">
                        <MatrixCell value={row.titan} tier="titan" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── support comparison ─────────── */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
              Support & service levels
            </h2>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  plan: 'sentinel' as PlanKey,
                  support: 'Email support',
                  response: 'Within 24 hours',
                  onboarding: 'Self-serve documentation',
                  training: 'Video tutorials',
                  sla: 'Standard',
                },
                {
                  plan: 'command' as PlanKey,
                  support: 'Priority email & chat',
                  response: 'Within 4 hours',
                  onboarding: 'Guided setup call',
                  training: 'Live webinar sessions',
                  sla: 'Priority',
                },
                {
                  plan: 'titan' as PlanKey,
                  support: '24/7 phone & email',
                  response: 'Within 1 hour',
                  onboarding: 'Dedicated account manager',
                  training: 'On-site training available',
                  sla: 'Custom SLA',
                },
              ].map((s) => {
                const ps = planStyles[s.plan];
                return (
                  <div
                    key={s.plan}
                    className={`rounded-2xl border ${ps.border} bg-white/[0.02] p-6`}
                  >
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${ps.bg} ${ps.colour} text-xs font-bold w-fit mb-6`}>
                      <span className={`w-2 h-2 rounded-full ${ps.accent}`} />
                      {ps.label}
                    </div>
                    <div className="space-y-5">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Support</div>
                        <div className="text-white text-sm font-medium">{s.support}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Response time</div>
                        <div className="text-white text-sm font-medium">{s.response}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Onboarding</div>
                        <div className="text-white text-sm font-medium">{s.onboarding}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Training</div>
                        <div className="text-white text-sm font-medium">{s.training}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">SLA</div>
                        <div className="text-white text-sm font-medium">{s.sla}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ────────────────────────── */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

              <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to choose your plan?
                </h3>
                <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                  Start with a 14-day free trial on Sentinel or Command. No credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Start Free Trial
                    <span className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-arrow-right-line text-sm" />
                    </span>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}