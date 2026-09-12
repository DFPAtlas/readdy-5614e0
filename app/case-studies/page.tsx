'use client';

import Link from 'next/link';
import { useState } from 'react';
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

interface CaseStudy {
  slug: string;
  company: string;
  sector: string;
  location: string;
  size: string;
  challenge: string;
  solution: string;
  image: string;
  stats: { label: string; value: string }[];
  quote: string;
  quoteName: string;
  quoteRole: string;
}

const caseStudies: CaseStudy[] = [
  {
    slug: 'apex-security-group',
    company: 'Apex Security Group',
    sector: 'Corporate & Events',
    location: 'Manchester, UK',
    size: '350 guards, 42 sites',
    challenge: 'Managing 350 guards across 42 corporate sites with spreadsheets was causing scheduling errors, missed shifts, and client complaints. Every rota change meant dozens of phone calls and WhatsApp messages.',
    solution: 'Apex deployed GuardianHub across all sites, replacing manual rotas with AI-assisted scheduling and giving guards a mobile app for shift confirmations, clocking in, and incident reporting.',
    image: 'https://readdy.ai/api/search-image?query=Modern%20corporate%20office%20building%20lobby%20with%20professional%20security%20desk%20and%20uniformed%20guard%20checking%20a%20tablet%2C%20sleek%20glass%20and%20steel%20architecture%2C%20navy%20blue%20and%20warm%20lighting%20tones%2C%20early%20morning%20atmosphere%2C%20professional%20commercial%20photography%2C%20clean%20sharp%20corporate%20environment&width=800&height=450&seq=cs-apex-corp&orientation=landscape',
    stats: [
      { label: 'Reduction in scheduling admin', value: '78%' },
      { label: 'Missed shifts eliminated', value: '94%' },
      { label: 'Client retention improved', value: '+32%' },
    ],
    quote: 'We went from spending 20 hours a week on rotas to 4. Our operations manager actually gets weekends now.',
    quoteName: 'Mark Delaney',
    quoteRole: 'Operations Director, Apex Security Group',
  },
  {
    slug: 'metro-guard-services',
    company: 'MetroGuard Services',
    sector: 'Retail & Shopping Centres',
    location: 'Birmingham, UK',
    size: '180 guards, 15 sites',
    challenge: 'Retail clients demanded real-time incident visibility and daily reports, but MetroGuard was still emailing PDF summaries once a week. They lost two major contracts to competitors offering live client portals.',
    solution: 'GuardianHub client portal gave every retail client live access to incident logs, patrol completion rates, and guard attendance. Automated weekly reports replaced manual compilation.',
    image: 'https://readdy.ai/api/search-image?query=Busy%20modern%20shopping%20centre%20interior%20with%20security%20guard%20patrolling%20past%20retail%20stores%2C%20bright%20natural%20atrium%20lighting%2C%20professional%20atmosphere%2C%20clean%20architectural%20lines%2C%20warm%20commercial%20environment%2C%20security%20presence%20subtly%20visible&width=800&height=450&seq=cs-metro-retail&orientation=landscape',
    stats: [
      { label: 'New contracts won', value: '4' },
      { label: 'Client report time saved', value: '15 hrs/wk' },
      { label: 'Client satisfaction score', value: '96%' },
    ],
    quote: 'The live portal won us back a client we had lost. They literally said it was the reason they returned.',
    quoteName: 'Priya Sharma',
    quoteRole: 'Managing Director, MetroGuard Services',
  },
  {
    slug: 'northern-shield-security',
    company: 'Northern Shield Security',
    sector: 'Construction & Infrastructure',
    location: 'Leeds, UK',
    size: '120 guards, 28 sites',
    challenge: 'Construction sites across Yorkshire needed 24/7 patrol verification, but Northern Shield had no way to prove guards were actually walking the routes. Clients questioned whether patrols were being completed at all.',
    solution: 'GuardianHub patrol module with NFC checkpoints and GPS tracking gave clients irrefutable proof of every patrol. The operations team could see real-time patrol progress and receive alerts if checkpoints were missed.',
    image: 'https://readdy.ai/api/search-image?query=Large%20construction%20site%20at%20dusk%20with%20security%20guard%20walking%20past%20heavy%20machinery%20and%20scaffolding%2C%20warm%20sunset%20lighting%2C%20industrial%20atmosphere%2C%20safety%20fencing%20visible%2C%20professional%20security%20photography%2C%20navy%20uniform%20against%20golden%20hour%20sky&width=800&height=450&seq=cs-northern-construct&orientation=landscape',
    stats: [
      { label: 'Patrol completion rate', value: '99.2%' },
      { label: 'Client disputes resolved', value: '100%' },
      { label: 'Audit score improvement', value: '+47 pts' },
    ],
    quote: 'We went from arguments about whether patrols happened to complete transparency. Clients check the dashboard themselves now.',
    quoteName: 'Tom Briggs',
    quoteRole: 'CEO, Northern Shield Security',
  },
  {
    slug: 'sentinel-facilities',
    company: 'Sentinel Facilities Management',
    sector: 'Healthcare & Public Sector',
    location: 'London, UK',
    size: '500+ guards, 60 sites',
    challenge: 'ACS compliance was consuming 40+ hours per month in manual evidence gathering. With 60 NHS and government sites, Sentinel was at serious risk of failing their next SIA audit due to missing documentation and expired certifications.',
    solution: 'GuardianHub ACS Compliance module automated evidence collection, tracked certification expiry with 90-day warnings, and generated audit-ready packs in minutes. Training records, vetting documents, and policy acknowledgements were centralised.',
    image: 'https://readdy.ai/api/search-image?query=Modern%20hospital%20entrance%20with%20professional%20security%20desk%2C%20clean%20white%20and%20blue%20medical%20environment%2C%20natural%20daylight%20through%20large%20windows%2C%20welcoming%20professional%20atmosphere%2C%20security%20guard%20in%20navy%20uniform%20assisting%20visitor%2C%20healthcare%20facility%20setting&width=800&height=450&seq=cs-sentinel-health&orientation=landscape',
    stats: [
      { label: 'Compliance admin reduced', value: '85%' },
      { label: 'SIA audit score achieved', value: '142/145' },
      { label: 'Expired certs eliminated', value: 'Zero' },
    ],
    quote: 'Our last SIA audit was our best ever. The inspector said our evidence pack was the most organised he had seen.',
    quoteName: 'Catherine Okeke',
    quoteRole: 'Compliance Director, Sentinel Facilities Management',
  },
  {
    slug: 'coastal-protection-services',
    company: 'Coastal Protection Services',
    sector: 'Maritime & Logistics',
    location: 'Southampton, UK',
    size: '90 guards, 12 sites',
    challenge: 'With guards working across isolated port facilities and warehouses, lone worker safety was a constant worry. Manual check-in calls were unreliable and a missed call could mean hours before anyone noticed a guard was in trouble.',
    solution: 'GuardianHub lone worker module implemented automated check-ins every 30 minutes. Missed check-ins triggered escalating alerts from supervisor SMS to operations centre phone call within 4 minutes. GPS location sharing gave exact coordinates.',
    image: 'https://readdy.ai/api/search-image?query=Shipping%20port%20at%20blue%20hour%20with%20container%20cranes%20silhouetted%20against%20evening%20sky%2C%20security%20guard%20in%20high-vis%20jacket%20checking%20smartphone%20near%20docked%20cargo%20ship%2C%20industrial%20maritime%20atmosphere%2C%20dramatic%20twilight%20lighting%2C%20navy%20and%20amber%20tones&width=800&height=450&seq=cs-coastal-maritime&orientation=landscape',
    stats: [
      { label: 'Check-in compliance rate', value: '99.8%' },
      { label: 'Avg response to missed check-in', value: '3.2 min' },
      { label: 'Lone worker incidents detected', value: '7 resolved' },
    ],
    quote: 'One of our guards had a medical emergency at 2am on a remote dock. The system alerted us in 3 minutes. That man is alive today because of GuardianHub.',
    quoteName: 'Ian McAllister',
    quoteRole: 'Health & Safety Manager, Coastal Protection Services',
  },
  {
    slug: 'regent-elite-guarding',
    company: 'Regent Elite Guarding',
    sector: 'Residential & Mixed-Use',
    location: 'London, UK',
    size: '60 guards, 8 sites',
    challenge: 'A boutique high-end firm struggling to scale from 20 to 60 guards across 8 luxury residential sites. Their paper-based occurrence book and manual shift scheduling could not keep up. They were turning down contracts because they could not take on more work.',
    solution: 'GuardianHub gave Regent Elite a full digital operations suite: AI-assisted rota building, digital occurrence book, mobile guard app, and client reporting. All configured for a smaller firm that needed enterprise capability without enterprise complexity.',
    image: 'https://readdy.ai/api/search-image?query=Luxury%20residential%20apartment%20building%20entrance%20with%20concierge%20desk%20and%20security%20guard%20in%20sharp%20uniform%2C%20elegant%20marble%20and%20glass%20lobby%2C%20warm%20ambient%20lighting%2C%20sophisticated%20upscale%20atmosphere%2C%20evening%20setting%20with%20city%20lights%20visible%20through%20windows&width=800&height=450&seq=cs-regent-residential&orientation=landscape',
    stats: [
      { label: 'Business growth in 12 months', value: '3x' },
      { label: 'Admin hours per site per week', value: '2 (was 12)' },
      { label: 'New contracts accepted', value: '5' },
    ],
    quote: 'We tripled in size but our back office stayed the same. That would have been impossible without GuardianHub.',
    quoteName: 'Alexandra Sterling',
    quoteRole: 'Founder & MD, Regent Elite Guarding',
  },
];

const sectors = ['All', 'Corporate & Events', 'Retail & Shopping Centres', 'Construction & Infrastructure', 'Healthcare & Public Sector', 'Maritime & Logistics', 'Residential & Mixed-Use'];

function CaseStudyCard({ cs, index }: { cs: CaseStudy; index: number }) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <GlassCard className="h-full flex flex-col overflow-hidden" hover>
        <div className="relative h-52 overflow-hidden">
          <img
            src={cs.image}
            alt={cs.company}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block px-2.5 py-1 rounded-full bg-blue-500/90 text-white text-xs font-semibold mb-2">
              {cs.sector}
            </span>
            <h3 className="text-xl font-bold text-white">{cs.company}</h3>
            <p className="text-gray-400 text-sm">{cs.location} &middot; {cs.size}</p>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">The Challenge</p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{cs.challenge}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {cs.stats.map((stat) => (
              <div key={stat.label} className="text-center bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-gray-500 text-xs leading-tight mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <blockquote className="text-gray-300 text-sm italic leading-relaxed mb-3">
              &ldquo;{cs.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-400">
                {cs.quoteName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm text-gray-300 font-medium">{cs.quoteName}</p>
                <p className="text-xs text-gray-500">{cs.quoteRole}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default function CaseStudiesPage() {
  const [activeSector, setActiveSector] = useState('All');

  const filtered = activeSector === 'All'
    ? caseStudies
    : caseStudies.filter(cs => cs.sector === activeSector);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=Professional%20security%20operations%20team%20gathered%20around%20a%20large%20conference%20table%20reviewing%20reports%20and%20dashboards%20on%20tablets%2C%20modern%20glass-walled%20meeting%20room%20with%20city%20skyline%20visible%2C%20navy%20blue%20and%20warm%20accent%20lighting%2C%20corporate%20success%20and%20collaboration%20atmosphere%2C%20late%20afternoon%20natural%20light%20streaming%20in&width=1440&height=500&seq=case-studies-hero&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/70 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">
                Case Studies
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Real results from <span className="text-blue-400">real security firms</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                See how security companies across the UK are using GuardianHub to transform their operations, win more contracts, and keep their people safe.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '6', label: 'Verified case studies' },
              { value: '1,300+', label: 'Guards represented' },
              { value: '165', label: 'Sites across the UK' },
              { value: '99.2%', label: 'Avg patrol completion' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-wrap gap-2 mb-10">
              {sectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => setActiveSector(sector)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeSector === sector
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-blue-500/30'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cs, i) => (
              <CaseStudyCard key={cs.slug} cs={cs} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-search-line text-gray-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No case studies in this sector yet</h3>
              <p className="text-gray-400 text-sm">We are working on it. Try another sector above.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <i className="ri-double-quotes-l text-blue-400 text-3xl"></i>
              </div>
              <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-3xl mx-auto mb-6">
                &ldquo;We evaluated six platforms before choosing GuardianHub. None of them came close to the depth of features, the speed of the mobile app, or the quality of support. It genuinely transformed how we operate.&rdquo;
              </blockquote>
              <div>
                <p className="text-white font-semibold">James Harrington</p>
                <p className="text-gray-400 text-sm">CEO, Harrington Security Solutions &mdash; 850 guards, 90+ sites</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to become our next case study?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join the security firms already transforming their operations with GuardianHub. See what it can do for your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-play-circle-line"></i>
                Book a demo
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-price-tag-3-line"></i>
                View pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}