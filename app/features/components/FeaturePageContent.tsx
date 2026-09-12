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

interface FeaturePageData {
  slug: string;
  title: string;
  subtitle: string;
  heroBadge: string;
  heroDescription: string;
  problem: string;
  solution: string;
  capabilities: { icon: string; title: string; desc: string }[];
  workflow: string;
  roleBenefits: { role: string; icon: string; benefit: string }[];
  securityNote: string;
  relatedFeatures: { slug: string; label: string }[];
  image: string;
}

const features: Record<string, FeaturePageData> = {
  'command-centre': {
    slug: 'command-centre',
    title: 'Command Centre',
    subtitle: 'One screen. Every site. Every guard. Every incident.',
    heroBadge: 'Operations',
    heroDescription: 'Run your entire security operation from a single unified dashboard. Real-time guard tracking, live incident feeds, patrol status, and automated alerts — all in one place.',
    problem: 'Security firms juggle multiple tools, spreadsheets, and phone calls to manage daily operations. Information is scattered across WhatsApp, email, and paper logs. By the time you hear about a missed patrol or an incident, it is often too late to respond effectively.',
    solution: 'GuardianHub Command Centre brings everything together. A live operations dashboard that updates in real time as guards clock in, complete patrols, and file incidents. Colour-coded status cards show you exactly which sites need attention — before a client calls to complain.',
    capabilities: [
      { icon: 'ri-radar-line', title: 'Live Site Status', desc: 'See every site at a glance with colour-coded status indicators. Green means all clear. Amber means attention needed. Red means immediate action required.' },
      { icon: 'ri-map-pin-line', title: 'Guard GPS Tracking', desc: 'Real-time location of every guard on duty. Verify presence at assigned sites and review movement history for any shift.' },
      { icon: 'ri-alert-line', title: 'Priority Alert Feed', desc: 'Incidents, missed checkpoints, SOS activations, and compliance warnings flow into a single priority feed. No more checking five different systems.' },
      { icon: 'ri-bar-chart-grouped-line', title: 'KPI Dashboard', desc: 'Key metrics — shift coverage, incident trends, patrol completion rates, and SLA performance — displayed in customisable widget panels.' },
      { icon: 'ri-user-location-line', title: 'Lone Worker Monitoring', desc: 'Active lone worker sessions with automated check-in status. Missed check-ins escalate automatically to supervisors.' },
      { icon: 'ri-calendar-check-line', title: 'Today\'s Shift Overview', desc: 'See who is scheduled, who has clocked in, who is late, and which shifts are uncovered — all updated in real time.' },
    ],
    workflow: 'At 06:00, the control room supervisor opens the Command Centre. The dashboard shows 47 guards across 12 sites. Three guards are late — amber warnings are already showing. One site has an overnight incident flagged by the night guard. The supervisor clicks through to review, assigns a follow-up, and notifies the client — all within minutes of starting the shift.',
    roleBenefits: [
      { role: 'Control Room Supervisor', icon: 'ri-dashboard-3-line', benefit: 'Complete operational awareness without switching between systems. Respond faster, make better decisions.' },
      { role: 'Operations Director', icon: 'ri-line-chart-line', benefit: 'Long-term trend visibility. Spot patterns in attendance, incidents, and patrol performance across all sites.' },
      { role: 'Client Account Manager', icon: 'ri-user-star-line', benefit: 'Pull up any site, any shift, any incident in seconds when a client calls. Answer questions with confidence.' },
    ],
    securityNote: 'The Command Centre enforces role-based access. Control room staff see operational data. They do not see HR records, payroll information, or private evidence unless explicitly authorised.',
    relatedFeatures: [
      { slug: 'incidents', label: 'Incidents' },
      { slug: 'patrols', label: 'Patrols' },
      { slug: 'attendance', label: 'Attendance' },
      { slug: 'client-portal', label: 'Client Portal' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Modern%20dark-themed%20security%20operations%20command%20centre%20dashboard%20with%20live%20map%20showing%20guard%20locations%20as%20glowing%20blue%20dots%2C%20incident%20feed%20with%20severity%20badges%2C%20patrol%20status%20cards%20with%20completion%20percentages%2C%20KPI%20widgets%20showing%20shift%20coverage%20and%20response%20times%2C%20glassmorphism%20UI%20panels%2C%20navy%20blue%20background%2C%20electric%20blue%20accent%20colors%2C%20enterprise%20SaaS%20dashboard%2C%20high%20quality&width=900&height=500&seq=feat-command-centre&orientation=landscape',
  },
  'guard-management': {
    slug: 'guard-management',
    title: 'Guard Management',
    subtitle: 'Every guard, every certification, every shift — managed.',
    heroBadge: 'Workforce',
    heroDescription: 'Centralise your entire guard workforce. Track certifications, licences, availability, performance, and training — all connected to rotas and compliance automatically.',
    problem: 'Managing a guard workforce means tracking SIA licences, training expiry dates, vetting status, availability preferences, and performance. When this lives in spreadsheets and filing cabinets, something always slips through. An expired licence can mean a guard cannot legally work — and you might not find out until an audit.',
    solution: 'GuardianHub Guard Management gives you a single source of truth for every guard. Digital profiles with certification tracking, automated expiry warnings, availability management, and performance records. When you build a rota, the system automatically checks that every assigned guard is qualified and licensed.',
    capabilities: [
      { icon: 'ri-profile-line', title: 'Digital Guard Profiles', desc: 'Complete profiles with contact details, SIA licence numbers, certifications, training records, and employment history.' },
      { icon: 'ri-alarm-warning-line', title: 'Expiry Alerts', desc: 'Automated warnings 90, 60, and 30 days before any certification, licence, or training expires. Never miss a renewal deadline.' },
      { icon: 'ri-calendar-todo-line', title: 'Availability Management', desc: 'Guards set their availability. The rota engine respects preferences and contractual hours automatically.' },
      { icon: 'ri-star-line', title: 'Performance Tracking', desc: 'Record commendations, incidents, attendance patterns, and feedback. Build a complete picture of each guard.' },
      { icon: 'ri-file-shield-line', title: 'Vetting Integration', desc: 'Track right-to-work checks, DBS status, and screening requirements. Link to compliance evidence automatically.' },
    ],
    workflow: 'A new guard joins the firm. Their profile is created with SIA licence details, training records, and availability preferences. The system flags their DBS renewal in 6 months. When building next week\'s rota, the AI automatically includes them for shifts that match their qualifications and availability. Three months later, the DBS expiry warning triggers — the operations manager receives an email and schedules the renewal.',
    roleBenefits: [
      { role: 'HR Manager', icon: 'ri-user-settings-line', benefit: 'Centralised workforce records with automated compliance tracking. No more chasing expiry dates manually.' },
      { role: 'Operations Manager', icon: 'ri-user-follow-line', benefit: 'Build rotas with confidence knowing every assigned guard is qualified, licensed, and available.' },
      { role: 'Compliance Officer', icon: 'ri-file-check-line', benefit: 'Audit-ready guard records at all times. Generate compliance reports in minutes, not days.' },
    ],
    securityNote: 'Guard personal data, including right-to-work documents and DBS information, is protected with strict access controls. Only authorised HR and compliance staff can view sensitive records.',
    relatedFeatures: [
      { slug: 'compliance', label: 'Compliance' },
      { slug: 'rota-scheduling', label: 'Rota & Scheduling' },
      { slug: 'attendance', label: 'Attendance' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20security%20workforce%20management%20dashboard%20showing%20guard%20profiles%20with%20photos%20certification%20status%20badges%20expiry%20date%20warnings%20availability%20calendar%20view%20and%20performance%20metrics%2C%20modern%20glassmorphism%20UI%20with%20navy%20background%20and%20blue%20accent%20colors%2C%20enterprise%20HR%20software%20screenshot%2C%20clean%20professional%20design&width=900&height=500&seq=feat-guard-mgmt&orientation=landscape',
  },
  'rota-scheduling': {
    slug: 'rota-scheduling',
    title: 'Rota & Scheduling',
    subtitle: 'AI-powered rotas built in minutes, not hours.',
    heroBadge: 'AI-Powered',
    heroDescription: 'Stop building rotas by hand. GuardianHub\'s AI engine generates optimised shift schedules that respect guard availability, qualifications, working-time regulations, and site requirements — all in under 30 seconds.',
    problem: 'Building a weekly rota for 50+ guards across multiple sites is a puzzle with thousands of variables. Guards have different qualifications, availability, and contracted hours. Sites have specific shift patterns and minimum staffing levels. Manual scheduling takes hours, and errors — double-bookings, unqualified guards, overtime violations — are almost inevitable.',
    solution: 'GuardianHub Rota Engine uses AI to solve this puzzle. Define your guard pool, site requirements, and scheduling rules. The engine generates an optimised rota in seconds — balanced workloads, no conflicts, and full compliance with working-time regulations. Last-minute changes? The AI suggests the best replacement instantly.',
    capabilities: [
      { icon: 'ri-magic-line', title: 'AI Rota Generation', desc: 'Drop in requirements and let AI build the optimal schedule. Handles shift patterns, qualifications, availability, and overtime limits.' },
      { icon: 'ri-user-heart-line', title: 'Sick Cover Matching', desc: 'When a guard calls in sick, the AI identifies the best available replacement based on qualifications, proximity, and hours.' },
      { icon: 'ri-arrow-left-right-line', title: 'Shift Swap Management', desc: 'Guards can request shift swaps through the app. The system validates eligibility and updates the rota automatically.' },
      { icon: 'ri-calendar-close-line', title: 'Leave Integration', desc: 'Approved leave automatically blocks availability. The rota engine plans around absences weeks in advance.' },
      { icon: 'ri-file-warning-line', title: 'Conflict Detection', desc: 'Real-time warnings for overtime violations, working-time breaches, qualification mismatches, and double-bookings.' },
      { icon: 'ri-history-line', title: 'Pattern Templates', desc: 'Save and reuse shift patterns. Apply proven schedules to new sites or periods with one click.' },
    ],
    workflow: 'Monday morning: the operations manager opens the rota module. The AI has pre-generated next week\'s schedule for all 15 sites. Two guards are on annual leave — the engine has already assigned cover. One guard\'s SIA licence expires mid-week — flagged for review. The manager reviews, makes two adjustments, and publishes. The entire rota — 85 shifts across 15 sites — took 12 minutes.',
    roleBenefits: [
      { role: 'Operations Manager', icon: 'ri-calendar-check-line', benefit: 'Reduce rota planning from hours to minutes. More time for strategic work, less time wrestling with spreadsheets.' },
      { role: 'Guard', icon: 'ri-smartphone-line', benefit: 'See your schedule in the mobile app. Request swaps, set availability, and get shift reminders automatically.' },
      { role: 'Client', icon: 'ri-eye-line', benefit: 'Know exactly who is scheduled at your site. Staffing gaps are visible before they become problems.' },
    ],
    securityNote: 'Rota data is visible to authorised operations staff only. Individual guard schedules are accessible to the guards themselves via the mobile app. Client users see site-level staffing, not individual guard personal details.',
    relatedFeatures: [
      { slug: 'guard-management', label: 'Guard Management' },
      { slug: 'attendance', label: 'Attendance' },
      { slug: 'finance', label: 'Finance' },
      { slug: 'automations', label: 'Automations' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20AI%20rota%20scheduling%20dashboard%20showing%20weekly%20shift%20grid%20with%20guard%20names%2C%20colour-coded%20day%20and%20night%20shift%20blocks%2C%20drag-and-drop%20interface%2C%20conflict%20warning%20indicators%2C%20coverage%20percentage%20stats%2C%20modern%20glassmorphism%20design%2C%20navy%20background%20with%20blue%20accents%2C%20enterprise%20workforce%20management%20software%20screenshot&width=900&height=500&seq=feat-rota-sched&orientation=landscape',
  },
  'attendance': {
    slug: 'attendance',
    title: 'Attendance',
    subtitle: 'GPS-verified clock-ins. No more uncertainty about who is on site.',
    heroBadge: 'Verification',
    heroDescription: 'Replace paper timesheets and honour-system clock-ins with GPS-verified attendance tracking. Know with confidence that every guard is where they should be, when they should be there.',
    problem: 'Without verified attendance, you rely on trust. Paper timesheets can be filled in after the fact. Phone check-ins can be made from anywhere. When a client disputes whether a guard was on site, you have no proof. And inaccurate attendance data flows into payroll — creating overpayment, underpayment, and disputes.',
    solution: 'GuardianHub Attendance uses GPS verification for every clock-in and clock-out. Guards tap one button in the mobile app — location is captured automatically. The control room sees real-time attendance status. Late arrivals and early departures trigger instant alerts. Attendance data flows directly into timesheets for payroll — accurate, verified, and audit-ready.',
    capabilities: [
      { icon: 'ri-map-pin-line', title: 'GPS-Verified Clock-In', desc: 'One-tap clock-in from the guard app with automatic GPS location capture. Verify the guard is at the correct site.' },
      { icon: 'ri-time-line', title: 'Real-Time Attendance Dashboard', desc: 'See who is on site, who is late, who has not clocked in, and who left early — updated live.' },
      { icon: 'ri-alert-line', title: 'Absence Alerts', desc: 'Automatic notifications when a scheduled guard does not clock in. Escalate to supervisors within configurable time windows.' },
      { icon: 'ri-file-text-line', title: 'Digital Timesheets', desc: 'Attendance data generates verified timesheets automatically. Export to payroll with supporting GPS evidence.' },
      { icon: 'ri-smartphone-line', title: 'Offline Mode', desc: 'Guards can clock in without signal. Attendance records sync automatically when connectivity is restored.' },
      { icon: 'ri-history-line', title: 'Attendance History', desc: 'Complete attendance records with timestamps and GPS coordinates. Audit-ready for any shift, any guard, any date.' },
    ],
    workflow: 'A guard arrives at a construction site at 18:55 for a 19:00 shift. They open the GuardianHub mobile app and tap "Clock In." GPS verifies they are within the site geofence. The timestamp is recorded. The control room dashboard updates instantly — one more guard confirmed on site. At 07:00, they tap "Clock Out." The shift record is complete — 12 hours, GPS-verified, automatically added to the timesheet.',
    roleBenefits: [
      { role: 'Control Room Staff', icon: 'ri-eye-line', benefit: 'Instant visibility of who is on site across all locations. No more calling guards to confirm attendance.' },
      { role: 'Payroll Administrator', icon: 'ri-calculator-line', benefit: 'Verified timesheets eliminate pay disputes. GPS evidence supports every hour claimed.' },
      { role: 'Client', icon: 'ri-check-double-line', benefit: 'Proof of attendance for every contracted shift. Transparent, verifiable, and included in reports automatically.' },
    ],
    securityNote: 'GPS location data is collected only at clock-in and clock-out. Guards are not continuously tracked during their shifts unless they are on an active patrol. Location data is stored with appropriate retention periods.',
    relatedFeatures: [
      { slug: 'rota-scheduling', label: 'Rota & Scheduling' },
      { slug: 'patrols', label: 'Patrols' },
      { slug: 'finance', label: 'Finance' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20attendance%20tracking%20dashboard%20showing%20real-time%20clock-in%20status%20cards%20with%20guard%20names%2C%20GPS-verified%20check%20marks%2C%20late%20arrival%20alerts%20in%20amber%2C%20site%20location%20map%20with%20guard%20pins%2C%20attendance%20completion%20percentage%20chart%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20blue%20and%20green%20accents%2C%20enterprise%20workforce%20software&width=900&height=500&seq=feat-attendance&orientation=landscape',
  },
  'patrols': {
    slug: 'patrols',
    title: 'Patrol Management',
    subtitle: 'NFC-verified patrols with GPS tracking. Proof your guards are where they should be.',
    heroBadge: 'Verification',
    heroDescription: 'Design patrol routes, set checkpoints with NFC tags or QR codes, and get real-time confirmation that every patrol is completed. Missed checkpoints trigger instant alerts — no more hoping the patrol happened.',
    problem: 'Clients pay for patrols, but how do you prove they happened? Manual patrol logs can be filled in at the end of a shift. Without checkpoint verification, there is no way to confirm a guard actually walked the route. When incidents happen on a site that was supposed to be patrolled, the liability lands on your firm.',
    solution: 'GuardianHub Patrol Management uses NFC tags and QR codes at every checkpoint. Guards scan as they walk the route — each scan is timestamped and GPS-verified. The control room sees patrol progress in real time. Automated alerts fire if a checkpoint is missed or a patrol is not completed within schedule.',
    capabilities: [
      { icon: 'ri-scan-2-line', title: 'NFC & QR Checkpoints', desc: 'Physical NFC tags or QR codes at each checkpoint. Guards scan with their phone — no specialist hardware needed.' },
      { icon: 'ri-route-line', title: 'Customisable Routes', desc: 'Design patrol routes with multiple checkpoints. Set required order, time windows, and photo evidence requirements.' },
      { icon: 'ri-map-pin-line', title: 'GPS Track Overlay', desc: 'Each patrol generates a GPS breadcrumb trail overlaid on the site map. See exactly where the guard walked.' },
      { icon: 'ri-alarm-warning-line', title: 'Missed Checkpoint Alerts', desc: 'If a checkpoint is not scanned within its time window, alerts escalate from guard notification to supervisor SMS to control room call.' },
      { icon: 'ri-bar-chart-line', title: 'Patrol Analytics', desc: 'Completion rates, average scan times, missed checkpoint trends, and guard performance across all sites and time periods.' },
      { icon: 'ri-file-chart-line', title: 'Client Patrol Reports', desc: 'Automated patrol completion reports with GPS trails and checkpoint logs. Deliver proof of service to clients without manual work.' },
    ],
    workflow: 'A guard starts their patrol at 22:00. The route has 8 checkpoints across a warehouse complex. At each checkpoint, they tap their phone against the NFC tag — a green confirmation appears. GPS coordinates are captured. At 22:38, checkpoint 5 is not scanned. A notification appears on the guard\'s phone: "Checkpoint 5 overdue." At 22:42, the control room receives an amber alert. The supervisor radios the guard. The issue is resolved, checkpoint 5 is scanned at 22:45, and the patrol continues.',
    roleBenefits: [
      { role: 'Guard', icon: 'ri-smartphone-line', benefit: 'Simple scan-and-go workflow. No paperwork. Clear route guidance on the phone screen.' },
      { role: 'Control Room', icon: 'ri-radar-line', benefit: 'Real-time patrol visibility across all sites. Intervene before missed checkpoints become failed patrols.' },
      { role: 'Client', icon: 'ri-check-double-line', benefit: 'Irrefutable proof of patrol completion. GPS trails and timestamped scans in every report.' },
    ],
    securityNote: 'GPS tracking during patrols provides route verification. Guards are not tracked outside their assigned patrol windows. Patrol GPS data is retained for service verification and audit purposes.',
    relatedFeatures: [
      { slug: 'attendance', label: 'Attendance' },
      { slug: 'incidents', label: 'Incidents' },
      { slug: 'client-portal', label: 'Client Portal' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20patrol%20management%20dashboard%20showing%20GPS%20map%20with%20guard%20patrol%20route%20as%20glowing%20blue%20line%2C%20checkpoint%20markers%20with%20green%20verification%20check%20icons%2C%20patrol%20completion%20percentage%20widget%20at%2097%25%2C%20missed%20checkpoint%20alert%20panel%20in%20amber%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20blue%20accent%20colors%2C%20enterprise%20security%20software%20screenshot&width=900&height=500&seq=feat-patrols&orientation=landscape',
  },
  'incidents': {
    slug: 'incidents',
    title: 'Incident Management',
    subtitle: 'Report, escalate, and close incidents in minutes — not hours.',
    heroBadge: 'Response',
    heroDescription: 'When something happens, speed matters. GuardianHub Incident Management gives guards a fast reporting flow and gives control rooms instant visibility, automated escalation, and complete audit trails.',
    problem: 'Traditional incident reporting is slow. Guards fill in paper forms at the end of a shift — if they fill them in at all. Details are forgotten. Photos are lost. By the time the control room sees the report, hours have passed. Clients learn about incidents from the morning news, not from you.',
    solution: 'GuardianHub Incident Management puts a structured reporting flow in every guard\'s pocket. File an incident in under 60 seconds — categorise severity, attach photos, tag the location. The control room sees it instantly. High-severity incidents auto-escalate to supervisors and clients based on configurable rules. Every report is timestamped, geotagged, and audit-trailed.',
    capabilities: [
      { icon: 'ri-alert-line', title: 'One-Tap Incident Creation', desc: 'Guards file incidents from the mobile app in under 60 seconds. Structured forms ensure complete, consistent reports.' },
      { icon: 'ri-camera-line', title: 'Photo & Video Evidence', desc: 'Attach photos and videos directly from the phone. Evidence is timestamped, geotagged, and stored with chain of custody.' },
      { icon: 'ri-arrow-up-circle-line', title: 'Automated Escalation', desc: 'High-severity incidents auto-escalate to supervisors, control room, and clients based on severity and site rules.' },
      { icon: 'ri-chat-3-line', title: 'Investigation Workflow', desc: 'Control room staff add comments, link related incidents, request additional evidence, and manage through to resolution.' },
      { icon: 'ri-file-chart-line', title: 'Post-Incident Analytics', desc: 'Identify patterns across incidents — recurring locations, common times, involved guards. Prevent incidents before they happen.' },
      { icon: 'ri-shield-check-line', title: 'Full Audit Trail', desc: 'Every action — creation, update, escalation, resolution — is logged with timestamps and actor identity. Insurance and compliance ready.' },
    ],
    workflow: '02:15 — a guard discovers a broken window at a retail site. Opens the GuardianHub app, taps "New Incident," selects "Property Damage," takes 3 photos, adds a short description. Submits. 02:16 — the control room dashboard shows a new medium-severity incident. 02:17 — the supervisor reviews, adds context, and escalates to the client with an automated notification. 02:30 — the client opens the portal, reviews the incident with photos, and acknowledges receipt. Complete cycle: 15 minutes.',
    roleBenefits: [
      { role: 'Guard', icon: 'ri-shield-user-line', benefit: 'Report incidents immediately while details are fresh. No paperwork at end of shift. Your report is complete and professional.' },
      { role: 'Control Room', icon: 'ri-eye-line', benefit: 'Instant visibility of every incident. Automated escalation means the right people are notified without manual routing.' },
      { role: 'Client', icon: 'ri-building-line', benefit: 'Know about incidents in near real-time. Review photos and reports from your portal. No surprises at the monthly meeting.' },
    ],
    securityNote: 'Incident data, including photos and descriptions, is stored securely with strict access controls. Only authorised users can view incident details. Evidence is retained according to legal and contractual requirements.',
    relatedFeatures: [
      { slug: 'patrols', label: 'Patrols' },
      { slug: 'client-portal', label: 'Client Portal' },
      { slug: 'reports', label: 'Reports' },
      { slug: 'lone-worker-sos', label: 'Lone Worker & SOS' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20incident%20reporting%20dashboard%20showing%20incident%20list%20with%20severity%20badges%20in%20red%20orange%20yellow%2C%20detailed%20incident%20detail%20view%20with%20photo%20evidence%20thumbnails%20and%20GPS%20location%20map%2C%20timeline%20of%20actions%20taken%2C%20modern%20glassmorphism%20UI%20design%2C%20navy%20blue%20background%20with%20electric%20blue%20highlights%2C%20enterprise%20security%20software&width=900&height=500&seq=feat-incidents&orientation=landscape',
  },
  'lone-worker-sos': {
    slug: 'lone-worker-sos',
    title: 'Lone Worker & SOS',
    subtitle: 'Automated check-ins and panic alerts. Because working alone should never mean working unprotected.',
    heroBadge: 'Safety',
    heroDescription: 'Protect guards working alone with automated check-in timers, GPS location sharing, and an instant SOS button. When something goes wrong, the right people know in seconds — not hours.',
    problem: 'Guards working alone on remote sites face elevated risk. If they have a medical emergency, an accident, or a security threat, there may be no one to help. Manual check-in calls are unreliable — a missed call might go unnoticed for hours. A guard in trouble needs a system that notices immediately and escalates automatically.',
    solution: 'GuardianHub Lone Worker Protection combines automated check-ins with an instant SOS panic button. Guards check in at configurable intervals — 15, 30, or 60 minutes. A missed check-in triggers escalating alerts: guard notification, then supervisor SMS, then control room phone call — all within minutes. The SOS button sends an immediate alert with GPS coordinates to the control room and configured emergency contacts.',
    capabilities: [
      { icon: 'ri-timer-line', title: 'Automated Check-Ins', desc: 'Configurable check-in intervals. Guards confirm their safety with one tap. Missed check-ins escalate automatically.' },
      { icon: 'ri-alarm-warning-line', title: 'SOS Panic Button', desc: 'One-tap SOS from the guard app sends an immediate alert with GPS coordinates to control room and configured emergency contacts.' },
      { icon: 'ri-notification-3-line', title: 'Escalation Chains', desc: 'Missed check-in: guard notification at 0 min, supervisor SMS at 3 min, control room call at 6 min. Configurable per site.' },
      { icon: 'ri-map-pin-line', title: 'GPS Location Sharing', desc: 'During an active lone worker session, GPS coordinates are shared with the control room for rapid response.' },
      { icon: 'ri-smartphone-line', title: 'Offline SOS', desc: 'If the guard has no signal, the SOS is queued and sent the moment connectivity returns. No alert is lost.' },
      { icon: 'ri-file-list-3-line', title: 'Session Logs', desc: 'Complete records of every lone worker session — check-ins, missed alerts, SOS activations — for compliance and review.' },
    ],
    workflow: '23:00 — a guard starts a lone worker session at a remote industrial site. Check-ins are set to every 30 minutes. 23:30 — first check-in confirmed. 00:00 — second check-in confirmed. 00:30 — check-in missed. At 00:31, the guard\'s phone buzzes with a reminder. No response. At 00:33, the supervisor receives an SMS alert. At 00:36, the control room receives an automated phone call. The supervisor calls the guard. The guard had a minor fall and could not reach their phone. An ambulance is dispatched. The guard is treated and released within hours.',
    roleBenefits: [
      { role: 'Guard', icon: 'ri-heart-line', benefit: 'Peace of mind knowing that if something goes wrong, help is on the way — even if you cannot call for it yourself.' },
      { role: 'Control Room', icon: 'ri-lifebuoy-line', benefit: 'Automated monitoring eliminates the risk of a missed manual check-in. The system watches so you can focus on response.' },
      { role: 'Health & Safety Manager', icon: 'ri-file-shield-line', benefit: 'Demonstrable duty of care with complete lone worker session records. Audit-ready for health and safety compliance.' },
    ],
    securityNote: 'GuardianHub does not guarantee emergency response. Escalation depends on configured contacts, mobile network availability, and company response procedures. This system is a tool to support your existing lone worker policy — it does not replace it.',
    relatedFeatures: [
      { slug: 'attendance', label: 'Attendance' },
      { slug: 'incidents', label: 'Incidents' },
      { slug: 'compliance', label: 'Compliance' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20lone%20worker%20safety%20monitoring%20dashboard%20showing%20active%20guard%20session%20cards%20with%20countdown%20timers%2C%20GPS%20location%20map%20with%20guard%20position%20pin%2C%20check-in%20status%20log%20with%20green%20confirmations%20and%20one%20red%20missed%20check-in%2C%20SOS%20alert%20panel%20in%20red%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20amber%20and%20red%20accent%20colors%2C%20enterprise%20safety%20monitoring%20software%20screenshot&width=900&height=500&seq=feat-lone-worker&orientation=landscape',
  },
  'compliance': {
    slug: 'compliance',
    title: 'Compliance Management',
    subtitle: 'ACS-ready evidence, automated expiry tracking, and audit-prepared documentation.',
    heroBadge: 'Governance',
    heroDescription: 'Stay SIA ACS audit-ready at all times. Track certifications, policies, training records, and site compliance evidence in one place. Automated expiry warnings and evidence packs mean you are always prepared.',
    problem: 'ACS compliance is a continuous requirement, not a pre-audit scramble. Tracking certifications for every guard, policy acknowledgements, training completions, site risk assessments, and equipment checks across a growing firm is complex. Most firms only discover gaps during an audit — when it is too late.',
    solution: 'GuardianHub Compliance Management centralises all compliance evidence. The ACS dashboard shows your readiness score in real time. Document expiry is tracked automatically with advance warnings. When an audit is scheduled, generate a complete evidence pack in minutes — not weeks of manual document gathering.',
    capabilities: [
      { icon: 'ri-file-shield-line', title: 'ACS Readiness Dashboard', desc: 'Real-time compliance score across all categories — personnel, sites, governance, and health & safety.' },
      { icon: 'ri-alarm-warning-line', title: 'Expiry Tracking', desc: 'Automated warnings for SIA licences, training certifications, insurance, policies, and site risk assessments.' },
      { icon: 'ri-folder-2-line', title: 'Evidence Vault', desc: 'Centralised storage for all compliance documents — policies, training records, audit logs, and site assessments.' },
      { icon: 'ri-check-double-line', title: 'Policy Acknowledgements', desc: 'Track which guards and staff have acknowledged each policy. Automatic reminders for overdue acknowledgements.' },
      { icon: 'ri-file-list-3-line', title: 'Audit Evidence Packs', desc: 'Generate complete ACS evidence packs organised by assessment criteria. Ready for SIA review in minutes.' },
      { icon: 'ri-line-chart-line', title: 'Gap Analysis', desc: 'Identify compliance gaps before they become audit findings. Prioritised list of missing or expiring evidence.' },
    ],
    workflow: 'An SIA audit is scheduled for next month. The compliance officer opens the ACS dashboard. The readiness score is 89% — two areas need attention. Three guard training certifications expire next week (already flagged by the system). One site risk assessment is overdue. The officer schedules the training, requests the risk assessment from the site manager, and watches the readiness score climb to 97%. The evidence pack is generated in minutes and shared with the auditor.',
    roleBenefits: [
      { role: 'Compliance Officer', icon: 'ri-shield-check-line', benefit: 'Real-time visibility of compliance status. No more last-minute document gathering before audits.' },
      { role: 'Operations Director', icon: 'ri-line-chart-line', benefit: 'Compliance as a continuous process, not an event. Lower audit stress, better outcomes, and demonstrable governance.' },
      { role: 'SIA Auditor', icon: 'ri-file-search-line', benefit: 'Well-organised evidence packs that map directly to assessment criteria. Faster, smoother audits for everyone.' },
    ],
    securityNote: 'Compliance evidence includes sensitive documents such as vetting records and policy documents. Access is restricted to authorised compliance and management staff. Evidence packs are generated server-side with appropriate redactions.',
    relatedFeatures: [
      { slug: 'guard-management', label: 'Guard Management' },
      { slug: 'reports', label: 'Reports' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20compliance%20management%20dashboard%20showing%20ACS%20readiness%20score%20gauge%20at%2089%20percent%2C%20category%20breakdown%20bars%20for%20personnel%20sites%20governance%20and%20health%20safety%2C%20document%20expiry%20warning%20cards%20with%20amber%20alerts%2C%20upcoming%20audit%20date%20countdown%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20blue%20and%20green%20accents%2C%20enterprise%20compliance%20software%20screenshot&width=900&height=500&seq=feat-compliance&orientation=landscape',
  },
  'client-portal': {
    slug: 'client-portal',
    title: 'Client Portal',
    subtitle: 'Give your clients a branded window into the service you deliver.',
    heroBadge: 'Transparency',
    heroDescription: 'A white-labelled portal that shows your clients live patrol status, incident updates, guard attendance, and automated reports — all branded with your logo and colours. Turn transparency into trust.',
    problem: 'Clients want to know their security is being delivered. Without a portal, they call your control room. Every call takes time. Every unanswered question creates doubt. And when contract renewal comes around, you are competing on price because you have not demonstrated value.',
    solution: 'GuardianHub Client Portal gives every client their own branded dashboard. They see which guards are on site, patrol completion status, incident updates, and automated reports — all in real time. Your logo, your colours, your domain. The portal becomes a retention tool, not just a reporting tool.',
    capabilities: [
      { icon: 'ri-palette-line', title: 'White-Label Branding', desc: 'Your logo, your colours, your domain. The portal looks like an extension of your company, not a third-party tool.' },
      { icon: 'ri-eye-line', title: 'Live Site Visibility', desc: 'Clients see guard attendance, patrol progress, and site status in real time. No more "is the guard there?" calls.' },
      { icon: 'ri-alert-line', title: 'Incident Transparency', desc: 'Incidents appear in the client portal as they are reported. Clients see what you see — building trust through transparency.' },
      { icon: 'ri-file-chart-line', title: 'Automated Reports', desc: 'Weekly and monthly reports generated and delivered automatically. Customisable templates for different client needs.' },
      { icon: 'ri-message-2-line', title: 'Secure Messaging', desc: 'Clients and your control room communicate through a secure, audited message centre. No more WhatsApp threads.' },
      { icon: 'ri-download-line', title: 'Report Downloads', desc: 'Clients can download patrol logs, incident reports, and compliance documents on demand from their portal.' },
    ],
    workflow: 'A property manager opens their client portal at 08:30. The dashboard shows: 2 guards on site since 06:00, overnight patrol completed at 97%, one minor incident logged at 02:15 (resolved), and the weekly report is ready for download. No need to call the control room. No emails to chase. Everything they need is right there — branded with the security firm\'s logo.',
    roleBenefits: [
      { role: 'Client', icon: 'ri-user-star-line', benefit: 'Complete transparency into the service you are paying for. Reports, incidents, and attendance — all in one place.' },
      { role: 'Account Manager', icon: 'ri-hand-heart-line', benefit: 'Fewer client calls asking for updates. More time for strategic relationship building and contract growth.' },
      { role: 'Business Owner', icon: 'ri-trophy-line', benefit: 'The portal becomes a competitive advantage. Clients who can see the value you deliver are clients who renew.' },
    ],
    securityNote: 'Client portal access is scoped to each client\'s sites only. Clients cannot see other clients\' data, guard personal information, or internal operational notes. All access is logged and auditable.',
    relatedFeatures: [
      { slug: 'command-centre', label: 'Command Centre' },
      { slug: 'reports', label: 'Reports' },
      { slug: 'incidents', label: 'Incidents' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20client%20portal%20dashboard%20with%20branded%20header%20showing%20security%20firm%20logo%2C%20site%20overview%20cards%20with%20live%20guard%20count%2C%20incident%20summary%20widget%2C%20patrol%20completion%20percentage%2C%20downloadable%20report%20list%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20blue%20and%20white%20accents%2C%20enterprise%20client%20portal%20software%20screenshot&width=900&height=500&seq=feat-client-portal&orientation=landscape',
  },
  'reports': {
    slug: 'reports',
    title: 'Reports',
    subtitle: 'Automated reports that prove your value — without the manual work.',
    heroBadge: 'Insight',
    heroDescription: 'Generate professional, data-rich reports for clients, compliance, and internal review. Automated weekly site reports, incident summaries, patrol analytics, and finance exports — delivered on schedule without lifting a finger.',
    problem: 'Manual reporting is a time sink. Compiling patrol logs, incident summaries, attendance records, and finance data into client-ready reports takes hours every week. Multiple sites mean multiple reports. Different clients want different formats. And when a client requests a report from 6 months ago, finding that data is a treasure hunt.',
    solution: 'GuardianHub Reports automates the entire reporting workflow. Define templates, set schedules, and let the system generate and deliver reports automatically. Weekly site reports, monthly KPI summaries, incident trend analysis, and finance exports — all produced from live operational data with zero manual compilation.',
    capabilities: [
      { icon: 'ri-file-chart-line', title: 'Automated Weekly Reports', desc: 'Site reports generated automatically every week. Includes patrol stats, incident summaries, attendance data, and SLA metrics.' },
      { icon: 'ri-calendar-check-line', title: 'Scheduled Delivery', desc: 'Set report schedules — weekly, monthly, quarterly. Reports are generated and emailed to configured recipients automatically.' },
      { icon: 'ri-bar-chart-grouped-line', title: 'KPI Dashboards', desc: 'Interactive dashboards for internal review. Drill down into any metric, any site, any time period.' },
      { icon: 'ri-file-pdf-line', title: 'PDF & CSV Export', desc: 'Export reports in client-ready PDF format or data-ready CSV. Branded with your logo and professional formatting.' },
      { icon: 'ri-history-line', title: 'Historical Reports', desc: 'Access any report from any period. Six months of patrol data? Last year\'s incident summary? Available in seconds.' },
      { icon: 'ri-file-edit-line', title: 'Customisable Templates', desc: 'Build report templates that match your clients\' needs. Select sections, charts, and data points for each template.' },
    ],
    workflow: 'Every Monday at 07:00, GuardianHub generates weekly reports for all 42 client sites. Patrol completion rates, incident summaries, attendance stats, and SLA performance are compiled automatically. Each report is formatted with the security firm\'s branding. By 07:05, all 42 reports are generated and queued for review. The operations manager spot-checks 3 reports, approves the batch, and they are delivered to clients by 08:00.',
    roleBenefits: [
      { role: 'Operations Manager', icon: 'ri-time-line', benefit: 'Reports that used to take 4 hours every Monday now take 10 minutes for review and approval. Reclaim your weekend.' },
      { role: 'Client', icon: 'ri-file-text-line', benefit: 'Consistent, professional reports delivered on time. Clear metrics that demonstrate the value of your security service.' },
      { role: 'Business Development', icon: 'ri-presentation-line', benefit: 'Use real operational data in pitches and reviews. Show prospects exactly what reporting looks like with your firm.' },
    ],
    securityNote: 'Reports contain operational data and are generated server-side. Report access is scoped to authorised users only — clients see their sites, internal staff see authorised reports. Report data is not shared with third parties.',
    relatedFeatures: [
      { slug: 'client-portal', label: 'Client Portal' },
      { slug: 'finance', label: 'Finance' },
      { slug: 'compliance', label: 'Compliance' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20automated%20reporting%20dashboard%20showing%20weekly%20site%20report%20preview%20with%20patrol%20stats%20charts%2C%20incident%20summary%20table%2C%20attendance%20overview%2C%20and%20SLA%20performance%20metrics%2C%20report%20schedule%20calendar%2C%20export%20buttons%20for%20PDF%20and%20CSV%20formats%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20blue%20and%20green%20accents%2C%20enterprise%20reporting%20software%20screenshot&width=900&height=500&seq=feat-reports&orientation=landscape',
  },
  'finance': {
    slug: 'finance',
    title: 'Finance',
    subtitle: 'From timesheets to invoices — financial operations, automated.',
    heroBadge: 'Revenue',
    heroDescription: 'Connect verified attendance to pay runs and client invoices automatically. Reduce billing disputes, eliminate payroll errors, and give your finance team hours back every week.',
    problem: 'Finance in security firms is complex. Guards work variable hours across multiple sites at different rates. Clients are invoiced based on contracted shifts plus extras. Reconciling timesheets, calculating pay, generating invoices, and tracking payments is a manual, error-prone process. Disputes over hours or rates erode margins and relationships.',
    solution: 'GuardianHub Finance connects operational data to financial workflows. Verified attendance flows into timesheets. Timesheets feed pay runs at guard-specific rates and client invoices at contract rates. Automated billing runs generate invoices from live shift data. Discrepancies are flagged before they become disputes.',
    capabilities: [
      { icon: 'ri-calculator-line', title: 'Automated Pay Runs', desc: 'Guard hours from verified attendance flow directly into pay calculations. Rates, overtime, and expenses applied automatically.' },
      { icon: 'ri-bill-line', title: 'Client Invoicing', desc: 'Generate invoices from completed shifts at contracted rates. Extras, expenses, and adjustments included automatically.' },
      { icon: 'ri-bank-card-line', title: 'Payment Tracking', desc: 'Track invoice payment status. Automated reminders for overdue payments. Reconciliation reports for finance teams.' },
      { icon: 'ri-file-list-3-line', title: 'Expense Management', desc: 'Guards submit expenses with receipts through the app. Approval workflow, rate validation, and inclusion in pay runs.' },
      { icon: 'ri-scales-line', title: 'Rate Card Management', desc: 'Manage complex rate structures — different rates per site, per shift type, per guard. Changes apply automatically to future runs.' },
      { icon: 'ri-file-chart-line', title: 'Financial Reporting', desc: 'Revenue, payroll, margin, and profitability reports by site, client, and period. Export-ready for accountants.' },
    ],
    workflow: 'End of month. The finance manager opens GuardianHub Finance. All 2,400 shifts for the month have verified attendance records. The pay run is calculated — 85 guards, 2,400 shifts, 15 different pay rates. Exceptions are flagged: 3 shifts with disputed hours, 1 guard with unapproved overtime. The manager resolves the exceptions, approves the pay run, and exports to the payroll provider. Simultaneously, client invoices are generated from the same shift data — 26 invoices across 18 clients. Total finance processing time: 45 minutes.',
    roleBenefits: [
      { role: 'Finance Manager', icon: 'ri-money-pound-circle-line', benefit: 'Reduce month-end processing from days to hours. Verified data means fewer disputes and faster payment cycles.' },
      { role: 'Guard', icon: 'ri-bank-line', benefit: 'Accurate, on-time pay based on verified attendance. No more arguing about hours worked.' },
      { role: 'Client', icon: 'ri-file-text-line', benefit: 'Transparent invoices backed by attendance data. Every charge is traceable to a verified shift.' },
    ],
    securityNote: 'Financial data including pay rates, bank details, and invoice information is protected with strict access controls. Only authorised finance staff can view and process financial data. Payment processing is handled through Stripe; GuardianHub does not store full payment card details.',
    relatedFeatures: [
      { slug: 'attendance', label: 'Attendance' },
      { slug: 'reports', label: 'Reports' },
      { slug: 'integrations', label: 'Integrations' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20financial%20management%20dashboard%20showing%20revenue%20overview%20chart%2C%20invoice%20list%20with%20payment%20status%20badges%2C%20pay%20run%20summary%20cards%2C%20expense%20approval%20queue%2C%20margin%20analysis%20by%20site%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20green%20and%20blue%20financial%20accents%2C%20enterprise%20finance%20software%20screenshot&width=900&height=500&seq=feat-finance&orientation=landscape',
  },
  'automations': {
    slug: 'automations',
    title: 'Automations',
    subtitle: 'Let the system handle the routine. You handle the decisions.',
    heroBadge: 'Efficiency',
    heroDescription: 'Automate repetitive operational workflows — from incident escalation and patrol alerts to report generation and compliance checks. Reduce manual work, eliminate human error, and ensure nothing falls through the cracks.',
    problem: 'Security operations are full of repetitive tasks that need to happen reliably: checking for missed patrols every 15 minutes, escalating unattended incidents, sending shift reminders, generating weekly reports, checking for expiring certifications. When these rely on human memory and manual effort, things get missed. And in security, missed things have consequences.',
    solution: 'GuardianHub Automations runs these workflows for you. Configurable rules trigger actions based on real-time events. Missed patrol checkpoint? System escalates. Incident severity high? System notifies. Certification expiring? System warns. Report due? System generates. Your team focuses on decisions and exceptions — the routine runs itself.',
    capabilities: [
      { icon: 'ri-robot-2-line', title: 'Event-Based Triggers', desc: 'Configure automation rules that fire based on operational events — missed checkpoints, incident creation, shift changes, certification expiry.' },
      { icon: 'ri-notification-3-line', title: 'Escalation Chains', desc: 'Multi-step escalation: notification, then SMS, then phone call, then management alert. Configurable timing and recipients.' },
      { icon: 'ri-file-chart-line', title: 'Scheduled Actions', desc: 'Time-based automations — daily shift reminders, weekly report generation, monthly compliance checks. Set and forget.' },
      { icon: 'ri-flow-chart', title: 'Workflow Builder', desc: 'Visual workflow builder for complex automations. Define conditions, actions, and branching logic without code.' },
      { icon: 'ri-history-line', title: 'Audit Trail', desc: 'Every automation execution is logged. See what triggered, what actions were taken, and when — for compliance and debugging.' },
      { icon: 'ri-pause-circle-line', title: 'Pause & Resume', desc: 'Pause individual automations during maintenance or exceptional circumstances. Resume when ready — no data lost.' },
    ],
    workflow: 'The operations director configures 3 automations: (1) If a patrol checkpoint is missed for more than 5 minutes, notify the guard. If still missed at 10 minutes, SMS the supervisor. (2) Every Monday at 07:00, generate weekly reports for all active sites and queue for review. (3) Every day at 06:00, check for certifications expiring within 30 days and email the compliance officer. These three automations eliminate approximately 5 hours of manual checking and follow-up every week.',
    roleBenefits: [
      { role: 'Operations Director', icon: 'ri-settings-3-line', benefit: 'Design automations once. They run reliably forever. Free your team from repetitive monitoring tasks.' },
      { role: 'Control Room Staff', icon: 'ri-eye-line', benefit: 'Focus on exceptions that need human judgment. The system handles routine checks and escalations automatically.' },
      { role: 'Compliance Officer', icon: 'ri-file-check-line', benefit: 'Never miss an expiry date again. Automated checks mean continuous compliance, not pre-audit panic.' },
    ],
    securityNote: 'Automations run server-side with authorised credentials. They cannot perform actions beyond the permissions of the configured service account. Automation rules are audited — changes are logged with actor identity and reason.',
    relatedFeatures: [
      { slug: 'command-centre', label: 'Command Centre' },
      { slug: 'integrations', label: 'Integrations' },
      { slug: 'compliance', label: 'Compliance' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20automation%20workflow%20builder%20dashboard%20showing%20visual%20flowchart%20of%20trigger%20conditions%20and%20automated%20actions%2C%20automation%20rule%20cards%20with%20on-off%20toggles%20and%20last%20run%20timestamps%2C%20execution%20log%20showing%20successful%20runs%20with%20green%20checkmarks%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20blue%20and%20purple%20accents%2C%20enterprise%20automation%20software%20screenshot&width=900&height=500&seq=feat-automations&orientation=landscape',
  },
  'integrations': {
    slug: 'integrations',
    title: 'Integrations',
    subtitle: 'Connect GuardianHub to your existing tools. No rip-and-replace required.',
    heroBadge: 'Connected',
    heroDescription: 'GuardianHub integrates with payroll systems, accounting platforms, communication tools, and access control hardware. API access and webhooks let you build custom connections to any system.',
    problem: 'Security firms use a variety of tools — payroll software, accounting platforms, access control systems, communication tools. Without integrations, data has to be manually transferred between systems. This creates double entry, errors, and delays. Your operations software should connect to your ecosystem, not replace it.',
    solution: 'GuardianHub Integrations provides a catalogue of supported connectors plus an API for custom integrations. Payroll exports, accounting sync, SMS gateways, calendar feeds, and SSO — all managed through a controlled integration layer that keeps your data secure.',
    capabilities: [
      { icon: 'ri-plug-line', title: 'Integration Catalogue', desc: 'Browse available integrations by category — Accounting, Payroll, Communications, Mapping, SSO, and more.' },
      { icon: 'ri-code-s-slash-line', title: 'REST API', desc: 'Full REST API with scoped credentials, rate limiting, and versioned endpoints. Build custom integrations securely.' },
      { icon: 'ri-webhook-line', title: 'Webhooks', desc: 'Configure outbound webhooks for operational events — shift changes, incident creation, patrol completion. Push data to your systems.' },
      { icon: 'ri-file-transfer-line', title: 'Payroll Export', desc: 'Export approved pay runs in standard formats. Compatible with major UK payroll providers.' },
      { icon: 'ri-bank-card-line', title: 'Accounting Sync', desc: 'Connect to Xero, QuickBooks, or Sage. Sync client invoices and payments automatically.' },
      { icon: 'ri-shield-check-line', title: 'SSO Support', desc: 'Enterprise SSO integration with Azure AD, Okta, and other identity providers for larger organisations.' },
    ],
    workflow: 'A security firm uses Xero for accounting and BrightPay for payroll. They connect both through GuardianHub Integrations. At month end, verified attendance data generates a pay run. The pay run is exported to BrightPay in their required format — no manual data entry. Simultaneously, client invoices generated from shift data are synced to Xero — invoice numbers, amounts, and client details transferred automatically. The finance manager reviews and approves in each system. Total integration processing time: 15 minutes.',
    roleBenefits: [
      { role: 'IT Manager', icon: 'ri-terminal-box-line', benefit: 'Secure, documented API and webhook system. Standard authentication, rate limiting, and logging built in.' },
      { role: 'Finance Team', icon: 'ri-refresh-line', benefit: 'No more double entry between ops software and accounting/payroll systems. Data flows automatically.' },
      { role: 'Business Owner', icon: 'ri-stack-line', benefit: 'GuardianHub becomes the operational hub, not an isolated tool. Your tech stack works together.' },
    ],
    securityNote: 'All integrations connect through a controlled API gateway. Credentials are stored encrypted and never exposed to the browser. Scoped API keys limit what each integration can access. Integration health is monitored continuously.',
    relatedFeatures: [
      { slug: 'finance', label: 'Finance' },
      { slug: 'automations', label: 'Automations' },
    ],
    image: 'https://readdy.ai/api/search-image?query=Dark-themed%20integration%20catalogue%20dashboard%20showing%20integration%20cards%20for%20Xero%20QuickBooks%20BrightPay%20Slack%20and%20Azure%20AD%20with%20connected%20status%20indicators%2C%20API%20key%20management%20panel%2C%20webhook%20configuration%20form%2C%20integration%20health%20monitoring%20with%20green%20status%20dots%2C%20modern%20glassmorphism%20UI%2C%20navy%20background%20with%20blue%20and%20teal%20accents%2C%20enterprise%20integration%20platform%20screenshot&width=900&height=500&seq=feat-integrations&orientation=landscape',
  },
};

export default function FeaturePageContent({ slug }: { slug: string }) {
  const feature = features[slug];

  if (!feature) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Feature not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">Return home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={feature.image} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/80 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">{feature.heroBadge}</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {feature.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-medium mb-6">{feature.subtitle}</p>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">{feature.heroDescription}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <FadeIn>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">The Problem</h2>
                <p className="text-gray-400 leading-relaxed">{feature.problem}</p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">The GuardianHub Solution</h2>
                <p className="text-gray-400 leading-relaxed">{feature.solution}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={150}>
            <h2 className="text-2xl font-bold text-white mb-8">Key Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {feature.capabilities.map((cap, i) => (
                <GlassCard key={i} className="p-5 h-full" hover>
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <i className={`${cap.icon} text-blue-400`}></i>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{cap.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{cap.desc}</p>
                </GlassCard>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
            <GlassCard className="p-8">
              <p className="text-gray-300 leading-relaxed">{feature.workflow}</p>
            </GlassCard>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white mb-8">Who Benefits</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {feature.roleBenefits.map((rb, i) => (
                <GlassCard key={i} className="p-6" hover>
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <i className={`${rb.icon} text-blue-400`}></i>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{rb.role}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{rb.benefit}</p>
                </GlassCard>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-blue-400 mt-0.5 flex-shrink-0">
                  <i className="ri-shield-check-line"></i>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-300 mb-1">Security & Privacy</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{feature.securityNote}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-lg font-semibold text-white mb-4">Related Features</h2>
            <div className="flex flex-wrap gap-3">
              {feature.relatedFeatures.map((rf) => (
                <Link key={rf.slug} href={`/features/${rf.slug}`} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-blue-500/30 hover:bg-blue-500/10 transition-all cursor-pointer whitespace-nowrap">
                  {rf.label}
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See {feature.title} in action</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Book a personalised demo and we will walk you through exactly how {feature.title.toLowerCase()} works for your operation.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/demo" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-calendar-line"></i>
                Book a Demo
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-price-tag-3-line"></i>
                View Pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}