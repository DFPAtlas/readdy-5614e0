'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import GlassCard from '../../components/GlassCard';
import { useInView } from '../../hooks/useInView';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

interface SolutionData {
  slug: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  challenges: string[];
  relevantModules: { title: string; desc: string; icon: string }[];
  workflow: string;
  reporting: string;
  complianceNote: string;
  image: string;
}

const solutions: Record<string, SolutionData> = {
  'security-guarding': {
    slug: 'security-guarding',
    title: 'Security Guarding Companies',
    subtitle: 'From boutique firms to national providers — run your entire operation from one platform.',
    heroDescription: 'GuardianHub is purpose-built for security guarding companies. Whether you manage 5 guards or 500, our platform handles rotas, attendance, patrols, incidents, and client reporting — giving you more time to grow your business.',
    challenges: [
      'Manual rota planning consuming 15-20 hours per week across spreadsheets and phone calls',
      'No reliable way to verify guard attendance and patrol completion at client sites',
      'Incident reports arriving hours late, often incomplete, making client communication reactive',
      'Client reporting taking days to compile, often missing key metrics and delivered inconsistently',
      'Compliance documentation scattered across filing cabinets and email folders',
    ],
    relevantModules: [
      { title: 'AI Rota & Scheduling', desc: 'Build compliant rotas in minutes. Sick cover, leave management, and availability-aware scheduling.', icon: 'ri-calendar-check-line' },
      { title: 'Attendance & Patrol Verification', desc: 'GPS-verified clock-ins and NFC checkpoint scanning. Know your guards are where they should be.', icon: 'ri-map-pin-line' },
      { title: 'Incident Management', desc: 'Guard reports incidents in 60 seconds. Control room sees it instantly. Auto-escalation to clients.', icon: 'ri-alert-line' },
      { title: 'Client Portal & Reporting', desc: 'White-labelled portal with live visibility. Automated weekly reports delivered on schedule.', icon: 'ri-briefcase-line' },
      { title: 'ACS Compliance', desc: 'Centralised evidence vault with expiry tracking. Audit-ready documentation at all times.', icon: 'ri-file-shield-line' },
    ],
    workflow: 'Monday 08:00 — Operations manager opens GuardianHub. AI-generated rota for all 15 sites is ready for review. Two guards on leave — cover already assigned. 08:30 — Guards clock in via app with GPS verification. Live dashboard updates. 12:15 — Guard files incident report with photos. Control room notified instantly. 12:30 — Client notified through portal. 17:00 — All shifts verified, timesheets generated, weekly reports queued for review.',
    reporting: 'Automated weekly site reports include patrol completion stats, incident summaries, attendance data, and SLA performance. Customisable templates for different client requirements. Reports delivered to clients on schedule — no manual compilation.',
    complianceNote: 'GuardianHub supports ACS compliance but does not automatically make your company compliant. You remain responsible for meeting all SIA ACS requirements, maintaining accurate records, and following your own policies and procedures.',
    image: 'https://readdy.ai/api/search-image?query=Professional%20security%20guarding%20company%20operations%2C%20uniformed%20guards%20at%20check-in%20desk%20in%20modern%20corporate%20building%20lobby%2C%20operations%20manager%20reviewing%20dashboard%20on%20large%20screen%20in%20background%2C%20clean%20professional%20atmosphere%2C%20navy%20uniforms%2C%20bright%20natural%20lighting%2C%20modern%20security%20industry%20photography&width=1440&height=500&seq=sol-guarding&orientation=landscape',
  },
  'mobile-patrol': {
    slug: 'mobile-patrol',
    title: 'Mobile Patrol Services',
    subtitle: 'Track mobile patrol units in real time. Prove every visit with GPS and checkpoint verification.',
    heroDescription: 'Mobile patrol services face unique challenges — multiple site visits per shift, driving between locations, and proving each visit happened. GuardianHub gives you real-time tracking, checkpoint verification, and automated proof-of-visit reports.',
    challenges: [
      'Proving patrol visits actually happened at each client location',
      'Coordinating mobile units across large geographic areas efficiently',
      'Demonstrating response times for alarm activations and keyholding callouts',
      'Managing unpredictable shift patterns with ad-hoc visits and emergencies',
      'Providing clients with detailed visit reports including GPS trails and timestamps',
    ],
    relevantModules: [
      { title: 'Patrol Management', desc: 'NFC/QR checkpoints at each site. Every visit timestamped and GPS-verified with route tracking.', icon: 'ri-route-line' },
      { title: 'GPS Tracking', desc: 'Real-time vehicle and officer tracking. See all mobile units on a live map with status indicators.', icon: 'ri-map-pin-line' },
      { title: 'Rota & Scheduling', desc: 'Flexible scheduling for ad-hoc visits alongside regular patrol routes. AI handles the complexity.', icon: 'ri-calendar-check-line' },
      { title: 'Incident Response', desc: 'Alarm response logging with response time tracking. Full incident documentation on site.', icon: 'ri-alert-line' },
      { title: 'Client Reports', desc: 'Automated visit reports with GPS trails, checkpoint scans, and timestamps. Prove every visit.', icon: 'ri-file-chart-line' },
    ],
    workflow: '20:00 — Mobile patrol officer starts shift. App shows optimised route: 12 site visits scheduled. 20:15 — Arrives at first site. Scans NFC checkpoint at gate. GPS confirms location. Guard completes external check, logs findings. 20:25 — Departs for next site. Route tracked on live map. 02:30 — Alarm activation received. Officer diverted to priority response. Arrival time logged: 02:38. Incident documented on site. 06:00 — Shift complete. All 12 visits verified. Alarm response report generated automatically.',
    reporting: 'Clients receive visit confirmation reports including arrival/departure times, GPS trail to confirm route taken, checkpoint scan log, and any observations or incidents logged during the visit. Reports can be delivered in real time or batched daily.',
    complianceNote: 'GPS tracking provides service verification. We recommend informing guards about tracking in accordance with employment policies and data protection requirements.',
    image: 'https://readdy.ai/api/search-image?query=Security%20patrol%20vehicle%20at%20dusk%20in%20modern%20business%20park%2C%20uniformed%20officer%20checking%20smartphone%20near%20marked%20patrol%20car%2C%20blue%20hour%20ambient%20lighting%2C%20professional%20security%20operations%20scene%2C%20corporate%20buildings%20in%20background%2C%20navy%20and%20amber%20tones%2C%20modern%20commercial%20security%20photography&width=1440&height=500&seq=sol-mobile-patrol&orientation=landscape',
  },
  'event-security': {
    slug: 'event-security',
    title: 'Event Security',
    subtitle: 'Rapid deployment. Real-time coordination. Complete post-event reporting.',
    heroDescription: 'Event security is fast-paced and high-pressure. GuardianHub helps you deploy teams quickly, coordinate in real time, and deliver comprehensive post-event reports that prove your value to organisers.',
    challenges: [
      'Rapidly deploying and scheduling large teams for one-off events',
      'Coordinating multiple teams across different event zones in real time',
      'Handling last-minute changes — no-shows, extended hours, additional requirements',
      'Documenting incidents and crowd management actions during busy events',
      'Delivering professional post-event reports to organisers and stakeholders',
    ],
    relevantModules: [
      { title: 'Rota & Scheduling', desc: 'Deploy large teams fast. Event-specific rotas with role assignments, zone allocations, and briefing notes.', icon: 'ri-calendar-check-line' },
      { title: 'Real-Time Coordination', desc: 'Live guard locations across event zones. Instant communication between control room and deployed teams.', icon: 'ri-radar-line' },
      { title: 'Incident Management', desc: 'Rapid incident reporting from the field. Photos, location tags, and severity classification in seconds.', icon: 'ri-alert-line' },
      { title: 'Attendance Tracking', desc: 'GPS-verified clock-ins for every guard. Know exactly who is on site and where they are deployed.', icon: 'ri-time-line' },
      { title: 'Post-Event Reports', desc: 'Comprehensive event reports — staffing, incidents, attendance, and recommendations — generated automatically.', icon: 'ri-file-chart-line' },
    ],
    workflow: 'Saturday 14:00 — Music festival. 85 guards deployed across 5 zones. Control room sees live deployment map — every guard GPS-verified on site. 15:30 — Medical incident at Zone 3. Guard files report with photos. Control room dispatches medical team. 17:00 — Two guards no-show. AI suggests replacements from standby pool. Replacements deployed within 20 minutes. 23:00 — Event ends. All guards clock out. Post-event report generated automatically: staffing summary, incident log, zone coverage analytics. Delivered to organiser by Monday morning.',
    reporting: 'Post-event reports include staffing deployment maps, attendance verification, incident timeline, zone coverage analysis, and recommendations for future events. Professional, branded, and delivered within 24 hours of event conclusion.',
    complianceNote: 'Event security deployments must comply with SIA regulations, event licensing requirements, and local authority conditions. GuardianHub provides operational tools; compliance responsibility remains with the security provider.',
    image: 'https://readdy.ai/api/search-image?query=Large%20outdoor%20music%20festival%20at%20dusk%20with%20security%20personnel%20in%20high-visibility%20vests%20coordinating%20crowd%20management%2C%20stage%20lights%20and%20festival%20atmosphere%20in%20background%2C%20professional%20event%20security%20operations%2C%20warm%20evening%20lighting%2C%20wide%20angle%20crowd%20management%20scene%2C%20navy%20and%20amber%20professional%20photography&width=1440&height=500&seq=sol-event&orientation=landscape',
  },
  'corporate-security': {
    slug: 'corporate-security',
    title: 'Corporate Security',
    subtitle: 'Multi-site corporate security with professional reporting and client visibility.',
    heroDescription: 'Corporate clients expect professional, technology-enabled security services. GuardianHub delivers the operational excellence and client transparency that corporate security managers demand — from visitor management to incident reporting to board-ready analytics.',
    challenges: [
      'Managing security across multiple corporate buildings and campuses',
      'Providing corporate clients with professional, data-rich reporting',
      'Coordinating reception, patrol, and response teams across locations',
      'Meeting corporate compliance and audit requirements',
      'Integrating with corporate access control and building management systems',
    ],
    relevantModules: [
      { title: 'Multi-Site Command', desc: 'Unified dashboard across all corporate locations. Drill down from regional view to individual building.', icon: 'ri-building-line' },
      { title: 'Visitor Management', desc: 'Digital visitor logging integrated with access control. Pre-registered visitors, contractor tracking, and audit trails.', icon: 'ri-user-add-line' },
      { title: 'Incident & Patrol', desc: 'Corporate-grade incident documentation with evidence management. Structured patrol routes with checkpoint verification.', icon: 'ri-shield-check-line' },
      { title: 'Client Portal', desc: 'White-labelled portal for facility managers. Live site status, incident visibility, and automated executive summaries.', icon: 'ri-briefcase-line' },
      { title: 'Compliance & Audit', desc: 'Complete audit trails for all security activities. Evidence packs for ISO, SOC 2, and internal audit requirements.', icon: 'ri-file-list-3-line' },
    ],
    workflow: 'A corporate campus with 4 buildings, 12 guards, and 1,500 employees. Morning: guards clock in via app at assigned buildings. Reception teams log visitors digitally. Midday: patrol routes completed with NFC verification. Afternoon: minor incident in car park — guard files report with CCTV reference. Facility manager reviews via client portal. End of day: automated daily summary emailed to facility manager — attendance report, visitor count, incident log, patrol completion. No calls needed.',
    reporting: 'Corporate clients receive daily operational summaries, weekly KPI reports, monthly executive dashboards, and quarterly trend analysis. All reports are branded, professional, and delivered on schedule.',
    complianceNote: 'Corporate security often involves additional compliance requirements beyond SIA ACS, including client-specific policies and ISO standards. GuardianHub supports documentation and audit trails; compliance responsibility remains with the provider.',
    image: 'https://readdy.ai/api/search-image?query=Modern%20corporate%20office%20lobby%20with%20professional%20security%20desk%2C%20uniformed%20guard%20checking%20tablet%2C%20sleek%20glass%20and%20steel%20architecture%20with%20natural%20daylight%2C%20business%20professionals%20walking%20in%20background%2C%20clean%20sophisticated%20corporate%20security%20environment%2C%20navy%20uniform%20contrasting%20with%20bright%20modern%20interior&width=1440&height=500&seq=sol-corporate&orientation=landscape',
  },
  'retail-security': {
    slug: 'retail-security',
    title: 'Retail Security',
    subtitle: 'Loss prevention patrols, incident documentation, and store-level reporting.',
    heroDescription: 'Retail security is about presence, prevention, and rapid response. GuardianHub helps retail security teams document patrols, log incidents, coordinate with store management, and provide retail clients with the visibility they expect.',
    challenges: [
      'Demonstrating security presence and patrol frequency to retail clients',
      'Documenting loss prevention activities and shoplifting incidents consistently',
      'Coordinating across multiple retail locations with different opening hours',
      'Providing store managers with incident data and trend analysis',
      'Managing flexible shift patterns around store opening hours and peak times',
    ],
    relevantModules: [
      { title: 'Patrol Management', desc: 'Structured patrol routes through retail spaces. Checkpoint verification proves presence and frequency.', icon: 'ri-store-2-line' },
      { title: 'Incident Reporting', desc: 'Quick incident documentation for theft, anti-social behaviour, and safety incidents with photo evidence.', icon: 'ri-alert-line' },
      { title: 'Attendance Tracking', desc: 'GPS-verified clock-ins at each retail location. Flexible scheduling around store hours.', icon: 'ri-time-line' },
      { title: 'Client Portal', desc: 'Store managers see live guard presence, incident logs, and patrol reports — branded for the security provider.', icon: 'ri-eye-line' },
      { title: 'Analytics & Trends', desc: 'Incident trends by location, time, and type. Help retail clients understand risk patterns.', icon: 'ri-line-chart-line' },
    ],
    workflow: 'A security firm covers 12 retail stores across a city. Each store has a guard during opening hours plus mobile patrol visits overnight. Store A: guard clocks in at 08:55. Patrol route includes shop floor, stockroom, and car park — 6 checkpoints. 14:30 — shoplifting incident. Guard detains suspect, files incident report with CCTV timestamp and witness statement. Store manager notified via portal. 18:00 — guard clocks out. Overnight: mobile patrol visits store at 23:00 and 03:00 — both visits GPS-verified with checkpoint scans.',
    reporting: 'Retail clients receive daily incident summaries, weekly patrol completion reports, and monthly trend analysis showing incident patterns by location and time. Store managers can access reports through the client portal at any time.',
    complianceNote: 'Retail security staff must hold valid SIA licences. Incident documentation should support potential police investigations and insurance claims. GuardianHub provides structured reporting; legal compliance remains with the provider.',
    image: 'https://readdy.ai/api/search-image?query=Security%20guard%20in%20professional%20uniform%20patrolling%20modern%20retail%20store%20interior%2C%20clean%20bright%20shopping%20environment%20with%20product%20displays%2C%20guard%20checking%20smartphone%20for%20patrol%20checkpoints%2C%20professional%20retail%20security%20photography%2C%20navy%20uniform%2C%20bright%20commercial%20lighting%2C%20modern%20retail%20atmosphere&width=1440&height=500&seq=sol-retail&orientation=landscape',
  },
  'construction-security': {
    slug: 'construction-security',
    title: 'Construction Security',
    subtitle: 'Secure large, changing sites with verified patrols and comprehensive reporting.',
    heroDescription: 'Construction sites are dynamic, high-risk environments. GuardianHub gives construction security teams the tools to secure large sites, verify patrols across changing layouts, and provide site managers with proof of service.',
    challenges: [
      'Securing large, open sites with changing layouts as construction progresses',
      'Verifying guard patrols across extensive perimeters and multiple entry points',
      'Documenting incidents including theft, vandalism, and unauthorised access',
      'Managing security through different construction phases with evolving requirements',
      'Providing construction project managers with reliable security verification',
    ],
    relevantModules: [
      { title: 'Patrol Management', desc: 'Custom patrol routes adapted to site layout. Reconfigurable checkpoints as the site develops.', icon: 'ri-route-line' },
      { title: 'GPS Verification', desc: 'Verify guard presence across large perimeters. Complete GPS trail for every patrol.', icon: 'ri-map-pin-line' },
      { title: 'Incident Reporting', desc: 'Document theft, vandalism, and trespassing with photo evidence, GPS tags, and timestamps.', icon: 'ri-alert-line' },
      { title: 'Lone Worker Protection', desc: 'Automated check-ins for guards on remote construction sites. SOS panic button with GPS location.', icon: 'ri-shield-flash-line' },
      { title: 'Client Reporting', desc: 'Daily site security reports with patrol trails and incident logs. Proof of service for project managers.', icon: 'ri-file-chart-line' },
    ],
    workflow: 'A construction site — 5 acres, multiple buildings at different stages. Two guards on night shift. 18:00 — Guards clock in, GPS verified at site entrance. Patrol route covers 14 checkpoints across the perimeter, material storage areas, and building entrances. 21:30 — Guard discovers open gate at north perimeter. Photographs and files incident. 00:00 — 06:00 — Regular patrols continue. Both guards complete lone worker check-ins every 30 minutes. 06:00 — Shift ends. Daily site report generated: all patrols completed, one security incident documented, GPS trails verified.',
    reporting: 'Construction clients receive daily security reports including patrol completion logs, GPS trail verification, incident summaries, and site observations. Reports are delivered to project managers and site supervisors automatically.',
    complianceNote: 'Construction sites have specific health and safety requirements under CDM regulations. GuardianHub supports operational documentation but does not replace the requirement for site-specific risk assessments and safety procedures.',
    image: 'https://readdy.ai/api/search-image?query=Construction%20site%20at%20dusk%20with%20security%20guard%20in%20high-visibility%20vest%20patrolling%20near%20scaffolding%20and%20heavy%20machinery%2C%20warm%20late%20afternoon%20lighting%2C%20industrial%20security%20atmosphere%2C%20safety%20fencing%20and%20site%20signage%20visible%2C%20professional%20security%20operations%20photography%2C%20navy%20and%20orange%20safety%20colours&width=1440&height=500&seq=sol-construction&orientation=landscape',
  },
  'keyholding-alarm-response': {
    slug: 'keyholding-alarm-response',
    title: 'Keyholding & Alarm Response',
    subtitle: 'Track response times, document every callout, and prove your performance.',
    heroDescription: 'Keyholding and alarm response services require speed, reliability, and meticulous documentation. GuardianHub tracks response times, logs every callout, and gives your clients confidence that their premises are protected 24/7.',
    challenges: [
      'Tracking response times to alarm activations and meeting contractual SLAs',
      'Documenting every callout with arrival times, findings, and actions taken',
      'Managing keyholder responsibilities across hundreds of client premises',
      'Coordinating with alarm receiving centres and police where required',
      'Providing clients with verified callout reports and response time analytics',
    ],
    relevantModules: [
      { title: 'Incident Response', desc: 'Log alarm activations with response times. Document findings, actions, and escalations at every callout.', icon: 'ri-alarm-warning-line' },
      { title: 'GPS Tracking', desc: 'Track response vehicles and officers in real time. Verify arrival times with GPS timestamps.', icon: 'ri-map-pin-line' },
      { title: 'Client Portal', desc: 'Clients see callout history, response time performance, and detailed reports through branded portal.', icon: 'ri-briefcase-line' },
      { title: 'SLA Monitoring', desc: 'Track response times against contractual targets. Automated alerts for SLA breaches.', icon: 'ri-timer-line' },
      { title: 'Reporting', desc: 'Automated callout reports with arrival times, findings, actions taken, and response time analytics.', icon: 'ri-file-chart-line' },
    ],
    workflow: '02:00 — Alarm activation at a client\'s commercial premises. Alarm receiving centre notifies keyholding provider. Officer dispatched. App logs dispatch time: 02:02. 02:11 — Officer arrives on site. GPS timestamp confirms 9-minute response. Officer conducts external and internal inspection. No sign of forced entry — false alarm. Findings documented in app with photos. 02:25 — Premises re-secured. Officer departs. Automated callout report generated and delivered to client: response time 9 minutes, within 15-minute SLA target.',
    reporting: 'Clients receive individual callout reports with response times, findings, and actions taken. Monthly performance reports show response time trends, SLA compliance, and callout frequency analysis.',
    complianceNote: 'Keyholding services must comply with SIA licensing, BS 7984 standards, and police alarm policies where applicable. GuardianHub provides operational documentation; compliance and licensing remain the provider\'s responsibility.',
    image: 'https://readdy.ai/api/search-image?query=Professional%20security%20officer%20responding%20to%20alarm%20at%20commercial%20building%20at%20night%2C%20security%20patrol%20vehicle%20with%20amber%20lights%20visible%2C%20officer%20checking%20smartphone%20and%20keys%20at%20building%20entrance%2C%20dramatic%20night%20photography%20with%20security%20lighting%2C%20navy%20uniform%20and%20professional%20atmosphere%2C%20blue%20and%20amber%20night%20tones&width=1440&height=500&seq=sol-keyholding&orientation=landscape',
  },
};

export default function SolutionPageContent({ slug }: { slug: string }) {
  const solution = solutions[slug];

  if (!solution) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Solution not found</h1>
          <Link href="/solutions" className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">View all solutions</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={solution.image} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/80 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">Solution</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {solution.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-medium mb-6">{solution.subtitle}</p>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">{solution.heroDescription}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <FadeIn>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Operational Challenges</h2>
                <ul className="space-y-3">
                  {solution.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <i className="ri-close-line text-red-400 text-xs"></i>
                      </div>
                      <span className="text-gray-400 text-sm leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">How GuardianHub Helps</h2>
                <p className="text-gray-400 leading-relaxed mb-6">{solution.heroDescription}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={150}>
            <h2 className="text-2xl font-bold text-white mb-8">Relevant Modules</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {solution.relevantModules.map((mod, i) => (
                <GlassCard key={i} className="p-5 h-full" hover>
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <i className={`${mod.icon} text-blue-400`}></i>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{mod.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{mod.desc}</p>
                </GlassCard>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white mb-6">Day-to-Day Workflow</h2>
            <GlassCard className="p-8">
              <p className="text-gray-300 leading-relaxed text-sm">{solution.workflow}</p>
            </GlassCard>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-blue-400 mt-0.5 flex-shrink-0">
                  <i className="ri-information-line"></i>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-300 mb-1">Compliance & Safety</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{solution.complianceNote}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-lg font-semibold text-white mb-4">Client Reporting</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">{solution.reporting}</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See how it works for {solution.title.toLowerCase()}</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Book a demo tailored to your {solution.title.toLowerCase()} operation. We will show you exactly how GuardianHub fits.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/demo" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-calendar-line"></i>
                Book a Demo
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-mail-line"></i>
                Contact Sales
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}