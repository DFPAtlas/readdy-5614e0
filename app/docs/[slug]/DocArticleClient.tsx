'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from '../../hooks/useInView';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ArticleSection {
  heading: string;
  body: string;
  tip?: string;
  list?: string[];
}

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  icon: string;
  readTime: string;
  lastUpdated: string;
  sections: ArticleSection[];
  related: { slug: string; title: string }[];
}

const articles: Record<string, Article> = {
  'quickstart-guide': {
    slug: 'quickstart-guide',
    title: 'Quickstart: Set Up Your Security Operations in Under 15 Minutes',
    excerpt: 'Step-by-step walkthrough to create your first site, onboard guards, and start tracking patrols — everything you need to go live fast.',
    category: 'getting-started',
    categoryLabel: 'Getting Started',
    icon: 'ri-rocket-line',
    readTime: '4 min read',
    lastUpdated: '2026-07-28',
    sections: [
      {
        heading: 'Before You Begin',
        body: "Welcome to GuardianHub. This guide assumes you've just created your account via the onboarding flow and landed in your dashboard. You should have admin or operations manager role permissions. If you haven't signed up yet, head to the signup page and pick a plan that matches your team size.",
        tip: 'Have your site addresses, guard names, and SIA licence numbers ready before you start. It makes the setup flow much smoother.',
      },
      {
        heading: 'Step 1: Create Your First Site',
        body: "Sites are the foundation of GuardianHub. Each site represents a physical location your guards protect. From your dashboard, click Sites in the sidebar, then the New Site button. Fill in the site name, address, and postcode. Optionally upload a site image or floor plan. Choose the risk level — Low, Medium, High, or Critical — which determines default patrol frequency and guard requirements. Click Save, and your site appears in the sites table immediately.",
        list: [
          'Site name and full address are required',
          'Risk level drives default patrol and staffing recommendations',
          'You can add contacts, documents, and instructions later from the site detail page',
        ],
      },
      {
        heading: 'Step 2: Add Your Guards',
        body: "Navigate to Staff in the sidebar and click Add Guard. Enter the guard's first name, last name, email, and mobile number. Upload their SIA licence — GuardianHub automatically extracts the licence number and expiry date using OCR. Set their employment type (full-time, part-time, relief) and hourly rate. Assign them to one or more sites. The guard receives an email invitation to download the Guard App and set their password.",
        tip: 'Use the bulk import CSV option if you have more than 10 guards. Download the template from the Staff page, fill it in, and upload.',
      },
      {
        heading: 'Step 3: Configure Patrol Checkpoints',
        body: "Open your site detail page and go to the Patrol Setup tab. Here you define NFC tags, QR codes, or GPS checkpoints that guards must scan on patrol. Give each checkpoint a name like \"Main Gate,\" \"Car Park Level 2,\" or \"Server Room.\" Set the expected order and time windows. GuardianHub generates a printable QR sheet for physical deployment. Guards scan these checkpoints using the Guard App during their rounds.",
      },
      {
        heading: 'Step 4: Build Your First Rota',
        body: "Head to Rotas from the sidebar. Select your site and the week you want to schedule. GuardianHub's AI engine suggests an optimised rota based on site risk level, guard availability, and shift pattern templates. Review the suggestions — you can drag guards between shifts, adjust times, or manually assign. Click Publish Rota, and every guard gets a push notification with their shifts for the week.",
      },
      {
        heading: "Step 5: Go Live and Monitor",
        body: "That's it — you're operational. Guards clock in via the app, scan checkpoints on patrol, and log entries in the Occurrence Book. From your Command Centre dashboard, you see live guard locations, patrol completion rates, and any incidents in real time. Check the ACS Compliance dashboard periodically to ensure your documentation stays audit-ready.",
      },
      {
        heading: 'What Next?',
        body: "Now that you're live, explore the platform's deeper capabilities. Set up lone worker check-in intervals, configure incident report templates for your clients, build SOPs for common scenarios, and connect your evidence vault for ACS audits. Each feature has its own dedicated guide in this documentation.",
      },
    ],
    related: [
      { slug: 'sites-and-checkpoints', title: 'Managing Sites, Checkpoints, and Patrol Routes' },
      { slug: 'rota-engine-guide', title: 'Rota Engine: AI-Powered Scheduling Explained' },
      { slug: 'onboarding-your-team', title: 'Onboarding Your Team: Roles, Permissions, and Invitations' },
    ],
  },

  'onboarding-your-team': {
    slug: 'onboarding-your-team',
    title: 'Onboarding Your Team: Roles, Permissions, and Invitations',
    excerpt: 'Learn how to invite your control room staff, set role-based permissions, and ensure every team member sees exactly what they need.',
    category: 'getting-started',
    categoryLabel: 'Getting Started',
    icon: 'ri-user-add-line',
    readTime: '5 min read',
    lastUpdated: '2026-07-22',
    sections: [
      {
        heading: 'Understanding Roles in GuardianHub',
        body: "GuardianHub uses a role-based access control system that ensures every team member sees only what they need — and nothing they shouldn't. The platform comes with five built-in roles: Super Admin, Company Admin, Operations Manager, Site Supervisor, and Guard. Each role has a predefined set of permissions, but Company Admins can customise these from the Settings page.",
        list: [
          'Super Admin: Full platform access, billing, company settings, and all client data',
          'Company Admin: Manage sites, guards, rotas, and view all reports',
          'Operations Manager: Day-to-day operations, rotas, incident management',
          'Site Supervisor: Manage a specific site, its guards, and patrols',
          'Guard: Clock in/out, scan checkpoints, log OB entries, raise incidents',
        ],
      },
      {
        heading: 'Inviting Team Members',
        body: "From your dashboard, go to Settings > Roles & Permissions > Users tab. Click Invite User and fill in the new team member's name, email, and select their role. You can optionally assign them to specific sites immediately — this saves time if they're a site supervisor or need access to only certain locations. GuardianHub sends an email invitation with a secure setup link. Invitations expire after 72 hours.",
        tip: 'If an invitation expires, you can resend it from the same Users tab. The user list shows pending, active, and expired invitation statuses.',
      },
      {
        heading: 'Customising Permissions',
        body: "Every role comes with sensible defaults, but every security firm operates differently. Navigate to Settings > Roles & Permissions > Permissions tab. Select a role from the dropdown to see all available permissions — view rotas, edit rotas, manage guards, view financial reports, access ACS compliance, and more. Toggle permissions on or off per role. Changes take effect immediately for all users with that role.",
      },
      {
        heading: 'Site-Level Access Control',
        body: "For larger firms managing multiple client contracts, you often need to restrict which team members can see which sites. The Site Access tab in Roles & Permissions lets you assign specific sites to individual users. A control room operator might need access to all sites, while a dedicated client account manager might only need access to one client's portfolio of locations. This granular control prevents information leakage between contracts.",
      },
      {
        heading: 'Managing Client Users',
        body: "If your clients need access to view reports, incidents, or live guard status for their sites, you can create client user accounts. From the Clients section of the admin dashboard, select a client and go to the Users tab. Client users have a separate, read-only portal where they see only their organisation's sites, reports, and compliance data. They cannot modify any operational settings.",
      },
    ],
    related: [
      { slug: 'quickstart-guide', title: 'Quickstart: Set Up Your Security Operations in Under 15 Minutes' },
      { slug: 'subscription-and-billing', title: 'Managing Your Subscription and Billing' },
    ],
  },

  'sites-and-checkpoints': {
    slug: 'sites-and-checkpoints',
    title: 'Managing Sites, Checkpoints, and Patrol Routes',
    excerpt: 'How to create sites, configure NFC/QR checkpoints, design patrol routes, and set scheduling requirements for each location.',
    category: 'platform',
    categoryLabel: 'Platform',
    icon: 'ri-map-pin-line',
    readTime: '7 min read',
    lastUpdated: '2026-08-01',
    sections: [
      {
        heading: 'Site Management Overview',
        body: "Sites are the core organisational unit in GuardianHub. Each site represents a physical location your security firm protects — an office building, shopping centre, construction site, data centre, or residential complex. The site page centralises everything: patrol routes, assigned guards, occurrence book, incident history, compliance documents, and client contacts. A well-configured site means smooth daily operations and effortless ACS audits.",
      },
      {
        heading: 'Creating and Configuring Sites',
        body: "Navigate to Sites in the sidebar and click New Site. Beyond the basic name and address, the configuration options deserve attention. Set the site risk level — this determines default patrol frequency and guard-to-site ratios. Add operating hours if the site has restricted access windows. Upload a site map or floor plan image for visual reference. The site instructions field is where you add arrival procedures, alarm codes (encrypted), key safe locations, and any special client requirements.",
        list: [
          'Risk Level: Low (basic patrol), Medium (hourly checks), High (continuous monitoring), Critical (multiple guards, 24/7)',
          'Postcode-based geofencing so guards can only clock in when physically at the site',
          'Site contacts: emergency numbers, client representatives, facilities managers',
          'Site documents: insurance certificates, risk assessments, method statements',
        ],
      },
      {
        heading: 'Checkpoint Types and Configuration',
        body: "GuardianHub supports three checkpoint technologies. NFC tags are physical stickers with embedded chips — guards tap their phone on the tag to register a scan. QR codes are printed and placed at each checkpoint — guards scan using the Guard App camera. GPS checkpoints use geolocation — guards confirm arrival when within a configurable radius. Each checkpoint has a name, description, and optional photo to help guards identify the exact location.",
        tip: 'Mix checkpoint types based on environment. NFC works well indoors in controlled environments. QR is cheap and easy for outdoor sites. GPS checkpoints are ideal for large perimeters or roaming patrols.',
      },
      {
        heading: 'Designing Patrol Routes',
        body: "A patrol route is an ordered sequence of checkpoints with time windows. From the Patrol Setup tab on any site, click Add Route and give it a name like \"Night Shift Full Patrol\" or \"Weekend Reduced Route.\" Drag checkpoints into the desired order. Set the expected duration between checkpoints and the overall route time window. GuardianHub tracks completion percentage in real time — control room operators see exactly which checkpoints have been scanned and which are overdue.",
      },
      {
        heading: 'Scheduling Patrol Requirements',
        body: "Different shifts may require different patrol patterns. A day shift might need one full patrol every 2 hours, while a night shift requires hourly rounds. Configure patrol schedules per shift type from the Rota Requirements tab. GuardianHub automatically links patrol expectations to published rotas, so guards on shift know exactly when their next patrol is due. Missed checkpoint alerts go to the control room immediately.",
      },
    ],
    related: [
      { slug: 'quickstart-guide', title: 'Quickstart: Set Up Your Security Operations in Under 15 Minutes' },
      { slug: 'rota-engine-guide', title: 'Rota Engine: AI-Powered Scheduling Explained' },
      { slug: 'guard-app-overview', title: 'Guard App: Complete Feature Overview' },
    ],
  },

  'occurrence-book-guide': {
    slug: 'occurrence-book-guide',
    title: 'The Occurrence Book: Logging, Reviewing, and Exporting Entries',
    excerpt: 'Complete guide to the digital OB — from quick guard entries to control room review workflows and client-facing exports.',
    category: 'platform',
    categoryLabel: 'Platform',
    icon: 'ri-book-open-line',
    readTime: '6 min read',
    lastUpdated: '2026-07-30',
    sections: [
      {
        heading: 'What Is the Digital Occurrence Book?',
        body: "The GuardianHub Occurrence Book replaces the traditional paper logbook every security firm has used for decades. It's a chronological, tamper-proof digital record of everything that happens on site — guard arrivals, patrol completions, visitor sign-ins, maintenance issues, suspicious activity, incident reports, and handover notes. Every entry is timestamped, attributed to a specific guard, and permanently stored.",
      },
      {
        heading: 'Guard-Side: Quick Entry Flow',
        body: "Guards access the OB from the Guard App home screen. The Quick Entry Bar lets them log common events with a single tap — Arrived on Site, Started Patrol, Completed Patrol, Taking Break, Resumed Duty. For detailed entries, the full entry form captures: entry type (general log, incident, visitor, maintenance, handover), a description with optional voice-to-text input, photo attachments, and severity level. Entries are saved instantly even without connectivity and sync when the guard regains signal.",
      },
      {
        heading: 'Control Room: Review and Response',
        body: "Control room operators see a live feed of OB entries across all sites from the Occurrence Book page. The feed updates in real time. Operators can filter by site, entry type, severity, and date range. Clicking any entry opens a detail view with the full description, photos, and guard details. Operators can add internal notes visible only to control room staff, flag entries for client review, or escalate incidents directly from the OB interface.",
        list: [
          'Real-time feed across all active sites',
          'Filter by site, type, severity, date range, or keyword search',
          'Internal notes for control room collaboration',
          'One-click escalation to incident management',
        ],
      },
      {
        heading: 'Client-Facing Reporting',
        body: "For firms that provide OB access to clients, GuardianHub generates a clean, professional daily digest. The Daily Digest summarises all entries from the past 24 hours, organised by site, with severity highlights and photo thumbnails. Clients receive this via email or can view it in their client portal. You control which entry types appear in client-facing reports — internal notes and sensitive entries stay hidden.",
        tip: 'Configure which entry types are client-visible in Settings > Client Portal. You can also set per-site overrides for clients who want more or less detail.',
      },
      {
        heading: 'Export and Compliance',
        body: "OB entries form a critical part of your ACS evidence pack. The Export function generates a PDF with all entries for a selected date range, complete with timestamps, guard attribution, and embedded photos. This export format matches what SIA auditors expect to see. Exports are stored in the Evidence Vault and tagged with the relevant ACS compliance category automatically.",
      },
    ],
    related: [
      { slug: 'guard-app-overview', title: 'Guard App: Complete Feature Overview' },
      { slug: 'evidence-vault-guide', title: 'Evidence Vault: Building Your ACS Evidence Pack' },
    ],
  },

  'rota-engine-guide': {
    slug: 'rota-engine-guide',
    title: 'Rota Engine: AI-Powered Scheduling Explained',
    excerpt: 'How GuardianHub generates optimised rotas, handles shift patterns, covers sickness, and balances guard workloads automatically.',
    category: 'platform',
    categoryLabel: 'Platform',
    icon: 'ri-calendar-check-line',
    readTime: '8 min read',
    lastUpdated: '2026-08-03',
    sections: [
      {
        heading: 'How the AI Rota Engine Works',
        body: "GuardianHub's rota engine analyses your sites' requirements, guard availability, shift pattern templates, working time regulations, and historical data to generate optimised weekly schedules. It considers site risk levels, minimum guard counts, guard skills and SIA licence types, travel distance between sites, maximum working hours, and guard preferences. The engine produces a draft rota in seconds — a task that typically takes operations managers hours.",
      },
      {
        heading: 'Setting Up Shift Pattern Templates',
        body: "Before the AI can generate rotas, you need to define your shift patterns. From Rotas > Patterns, create templates like \"Day Shift (07:00-19:00),\" \"Night Shift (19:00-07:00),\" or \"Weekend Relief (08:00-20:00).\" Each pattern includes start time, end time, required guard count, break duration, and applicable sites. Templates are reusable across weeks and sites. GuardianHub ships with common patterns pre-configured — you can edit or delete them.",
        tip: 'Create site-specific patterns for locations with unique requirements. A construction site might need different shift times than a corporate office.',
      },
      {
        heading: 'Guard Availability and Preferences',
        body: "Guards set their availability through the Guard App — marking days they can work and preferred shift types. The rota engine respects these preferences while still meeting site requirements. If a guard is unavailable for a shift the AI needs filled, it suggests the next best match based on skills, proximity, and working hours compliance. Guards receive shift offers they can accept or decline, and the engine learns from these choices over time.",
      },
      {
        heading: 'Sickness and Absence Cover',
        body: "When a guard calls in sick, the Sick Cover feature kicks in. The engine identifies the gap, searches available guards with matching skills and site access, and generates cover offers. These offers go out as push notifications — first guard to accept gets the shift. If no one accepts within a configurable time window, the engine escalates to relief guards or agency staff. Control room operators can monitor the cover process from the Command Centre.",
        list: [
          'Automatic gap detection when a guard marks themselves unavailable',
          'Cover offers sent to qualified, available guards',
          'First-come-first-served acceptance with real-time status',
          'Escalation to relief pool or agency contacts if unfilled',
        ],
      },
      {
        heading: 'Publishing and Notifying',
        body: "Once you've reviewed and adjusted the AI-generated rota, click Publish. Every guard on the rota receives a push notification and email with their shifts for the week. The published rota is locked — guards can see their schedule in the app but cannot modify it. Changes after publishing require an admin override, which creates an audit trail entry. Published rotas feed into the patrol monitoring system so control rooms know exactly who should be on duty.",
      },
    ],
    related: [
      { slug: 'sites-and-checkpoints', title: 'Managing Sites, Checkpoints, and Patrol Routes' },
      { slug: 'guard-app-overview', title: 'Guard App: Complete Feature Overview' },
    ],
  },

  'guard-app-overview': {
    slug: 'guard-app-overview',
    title: 'Guard App: Complete Feature Overview',
    excerpt: 'Everything guards can do from their phone — clock in, scan checkpoints, complete patrols, log incidents, raise SOS, and view rotas.',
    category: 'guard-app',
    categoryLabel: 'Guard App',
    icon: 'ri-smartphone-line',
    readTime: '5 min read',
    lastUpdated: '2026-08-05',
    sections: [
      {
        heading: 'Getting Started with the Guard App',
        body: "The GuardianHub Guard App is available for iOS and Android. Guards receive a download link when their account is created. After installing and signing in with the credentials from their invitation email, guards land on the Home screen — a dashboard showing today's shift details, upcoming patrols, recent OB entries, and any notices from the control room. The bottom navigation gives quick access to all core functions.",
      },
      {
        heading: 'Clock In and Clock Out',
        body: "Guards clock in at the start of their shift by tapping the Clock In button on the home screen. GuardianHub verifies the guard's GPS location against the site geofence — if they're not within range, clock-in is blocked. The system records precise timestamps. At shift end, guards clock out. These timestamps feed into attendance logs, payroll calculations, and Working Time Directive compliance tracking.",
        tip: 'If GPS is poor at a site (e.g., underground car parks), admins can configure the geofence radius or enable manual clock-in with a supervisor approval workflow.',
      },
      {
        heading: 'Patrol Execution',
        body: "When a patrol is due, the guard receives a notification and sees it on their home screen. Tapping Start Patrol opens a guided flow showing checkpoints in order. At each checkpoint, the guard scans the NFC tag, QR code, or confirms GPS arrival. The app shows the next checkpoint and remaining time. Guards can add notes or photos at any checkpoint — useful for reporting hazards, damage, or suspicious items. Patrol completion percentage updates live on the control room dashboard.",
      },
      {
        heading: 'Occurrence Book and Incident Reporting',
        body: "The OB tab gives guards quick access to log entries. The Quick Entry Bar handles common events — arrived on site, started patrol, taking break. For incidents, the full form captures detailed descriptions, photo evidence, witness details, and severity classification. Incidents are immediately visible to the control room. Guards can also view the site's OB history to stay informed about what happened on previous shifts.",
      },
      {
        heading: 'SOS and Lone Worker Protection',
        body: "A prominent SOS button is always accessible. Pressing it sends an immediate alert to the control room with the guard's exact GPS location. If the guard is on a lone worker check-in schedule and misses a check-in, the system escalates automatically — first to the guard, then to the control room, then to designated emergency contacts. This layered protection ensures no guard goes unaccounted for.",
      },
      {
        heading: 'Rota View and Shift Management',
        body: "The Rota tab shows the guard's published schedule for the current week and upcoming weeks. Guards can see shift times, assigned sites, and any special instructions. They can also mark themselves unavailable for future dates, request leave, and view cover offers from other guards. Shift swap requests between guards of equal qualification go through a supervisor approval workflow.",
      },
    ],
    related: [
      { slug: 'lone-worker-setup', title: 'Lone Worker Protection: Setup and Configuration' },
      { slug: 'incident-reporting-guard', title: 'Incident Reporting: Best Practices for Guards' },
      { slug: 'rota-engine-guide', title: 'Rota Engine: AI-Powered Scheduling Explained' },
    ],
  },

  'lone-worker-setup': {
    slug: 'lone-worker-setup',
    title: 'Lone Worker Protection: Setup and Configuration',
    excerpt: 'Configure automated check-in intervals, escalation chains, GPS tracking, and panic response for guards working alone.',
    category: 'guard-app',
    categoryLabel: 'Guard App',
    icon: 'ri-shield-user-line',
    readTime: '6 min read',
    lastUpdated: '2026-07-25',
    sections: [
      {
        heading: 'Why Lone Worker Protection Matters',
        body: "Guards working alone face higher risks — no colleague to call for help, no immediate backup, and longer response times if something goes wrong. GuardianHub's lone worker protection system ensures every solo guard is accounted for through automated check-ins, GPS tracking, and multi-tier escalation. It satisfies both your duty of care obligations and BS 8484 compliance requirements for lone worker devices.",
      },
      {
        heading: 'Configuring Check-In Intervals',
        body: "From the Lone Worker settings page (Guard Welfare > Lone Worker), set the check-in interval — how often a guard must confirm they're safe. Common intervals range from 15 minutes for high-risk sites to 60 minutes for low-risk static posts. Guards receive a push notification when a check-in is due. Tapping confirms they're safe with a single action. The countdown timer is visible on the guard's home screen so they always know when the next check-in is due.",
        tip: 'Set different check-in intervals per site. A construction site at night needs more frequent check-ins than a daytime reception desk.',
      },
      {
        heading: 'Building Escalation Chains',
        body: "If a guard misses a check-in, the escalation sequence begins automatically. First, the guard receives a reminder notification with an audible alert. If still no response after a configurable delay (usually 2-5 minutes), the control room receives a missed check-in alert. If the control room doesn't acknowledge within another time window, the system calls the guard directly. Final escalation goes to designated emergency contacts — supervisors, operations managers, or external monitoring centres.",
        list: [
          'Tier 1: Push notification reminder to guard',
          'Tier 2: Alert to control room operators',
          'Tier 3: Automated phone call to guard',
          'Tier 4: Email and SMS to designated emergency contacts',
          'Tier 5: External alarm receiving centre integration (optional)',
        ],
      },
      {
        heading: 'Panic Button and Duress Code',
        body: "The SOS button on the Guard App triggers an immediate, highest-priority alert. Unlike a missed check-in, this is an active distress signal. The control room sees the guard's real-time GPS location, and all available operators are notified simultaneously. GuardianHub also supports a duress code — a PIN the guard enters that appears to cancel the alarm but actually signals they're under threat. This is critical for situations where openly triggering an alarm could escalate danger.",
      },
    ],
    related: [
      { slug: 'guard-app-overview', title: 'Guard App: Complete Feature Overview' },
      { slug: 'sites-and-checkpoints', title: 'Managing Sites, Checkpoints, and Patrol Routes' },
    ],
  },

  'incident-reporting-guard': {
    slug: 'incident-reporting-guard',
    title: 'Incident Reporting: Best Practices for Guards',
    excerpt: 'How guards should capture incidents — photos, witness statements, timelines — to ensure control rooms get complete, actionable reports.',
    category: 'guard-app',
    categoryLabel: 'Guard App',
    icon: 'ri-alert-line',
    readTime: '4 min read',
    lastUpdated: '2026-07-20',
    sections: [
      {
        heading: 'Why Quality Incident Reports Matter',
        body: "An incident report is often the single piece of evidence that determines whether your security firm handled a situation correctly. Incomplete reports create liability gaps. Good reports protect your firm, your guards, and your clients. GuardianHub's incident reporting flow is designed to guide guards through capturing everything that matters — even when they're stressed or under pressure.",
      },
      {
        heading: 'The Five Ws: What Every Report Needs',
        body: "Every incident report must answer: Who was involved (names, descriptions, witness contacts), What happened (chronological, factual — no assumptions), Where exactly (specific location within the site), When (precise timestamps — GuardianHub records these automatically), and Why (contributing factors — slippery floor, broken lock, aggressive behaviour). The form prompts guards for each element so nothing gets missed in the heat of the moment.",
        list: [
          'Who: Involved parties, witnesses, responding officers',
          'What: Factual description, chronological order, actions taken',
          'Where: Exact location, relevant checkpoint reference',
          'When: GuardianHub auto-captures, guard confirms',
          'Why: Observed contributing factors, not speculation',
        ],
      },
      {
        heading: 'Photo and Video Evidence',
        body: "The incident form supports multiple photo attachments taken directly from the Guard App camera. Guards should photograph: the scene from multiple angles, any damage or injuries, identification documents if relevant, and environmental conditions (lighting, weather, obstructions). The app timestamps and geotags every photo automatically. Photos are stored securely and cannot be deleted or altered — they form part of the tamper-proof evidence chain.",
      },
      {
        heading: 'Severity Classification',
        body: "Guards classify incidents by severity: Minor (no injury, no damage — logged for record), Moderate (minor injury or damage — requires supervisor review), Major (significant injury, damage, or threat — triggers immediate control room alert), and Critical (life-threatening, active threat — triggers SOS protocol). Correct classification ensures the right people are notified at the right speed.",
        tip: 'Train guards to default to the higher severity if unsure. It is always better to over-report and downgrade later than to under-report a serious incident.',
      },
    ],
    related: [
      { slug: 'guard-app-overview', title: 'Guard App: Complete Feature Overview' },
      { slug: 'occurrence-book-guide', title: 'The Occurrence Book: Logging, Reviewing, and Exporting Entries' },
    ],
  },

  'acs-compliance-dashboard': {
    slug: 'acs-compliance-dashboard',
    title: 'ACS Compliance Dashboard: How It Works',
    excerpt: 'Understand the readiness score, category breakdown, evidence gathering, and how GuardianHub maps directly to SIA assessment criteria.',
    category: 'compliance',
    categoryLabel: 'ACS Compliance',
    icon: 'ri-shield-check-line',
    readTime: '7 min read',
    lastUpdated: '2026-08-06',
    sections: [
      {
        heading: 'What the ACS Compliance Dashboard Does',
        body: "The ACS Compliance dashboard gives you a real-time view of your readiness for SIA Approved Contractor Scheme assessment. It maps every piece of operational data in GuardianHub — staff records, site compliance documents, training certificates, patrol logs, incident reports — directly to the 89 ACS criteria. Instead of scrambling to gather evidence weeks before an audit, you see your readiness score update automatically as your team uses the platform day to day.",
      },
      {
        heading: 'Understanding the Readiness Score',
        body: "The readiness score is a percentage from 0 to 100, calculated across all 89 ACS criteria weighted by importance. Each criterion is marked as Compliant (green), Partial (amber), or Non-Compliant (red). The score card breaks down by ACS category: Service Delivery, Customer Focus, People, Leadership, and Governance. Clicking any category reveals the individual criteria, current status, and what's needed to reach compliant status.",
        list: [
          'Service Delivery: Patrol completion rates, incident response times, OB completeness',
          'Customer Focus: Client communication logs, satisfaction surveys, complaint resolution',
          'People: SIA licence validity, training records, vetting documentation, wellbeing checks',
          'Leadership: Policy acknowledgements, management structure, continuous improvement logs',
          'Governance: Data protection compliance, financial controls, insurance documentation',
        ],
      },
      {
        heading: 'Automated Evidence Collection',
        body: "GuardianHub automatically collects evidence as your team operates. When a guard completes a patrol, that data feeds into the Service Delivery category. When a training module is completed, it updates the People category. When an incident report is filed with photos and witness statements, it strengthens multiple categories. The AI Auditor runs weekly scans across all categories, updating compliance statuses and flagging new gaps.",
        tip: 'The Evidence Vault shows all auto-collected evidence organised by ACS category. You can review, supplement with manual uploads, and generate a complete evidence pack PDF at any time.',
      },
      {
        heading: 'Critical Findings and Action Centre',
        body: "The Critical Findings panel highlights the most urgent compliance gaps — expired SIA licences, missing insurance certificates, unsigned policies, overdue training. Each finding includes a priority level and a direct link to the relevant page where it can be resolved. The Action Centre aggregates all open compliance tasks across your organisation and assigns them to the responsible team member, with due dates and reminder notifications.",
      },
    ],
    related: [
      { slug: 'evidence-vault-guide', title: 'Evidence Vault: Building Your ACS Evidence Pack' },
      { slug: 'sites-and-checkpoints', title: 'Managing Sites, Checkpoints, and Patrol Routes' },
    ],
  },

  'evidence-vault-guide': {
    slug: 'evidence-vault-guide',
    title: 'Evidence Vault: Building Your ACS Evidence Pack',
    excerpt: 'Organise policies, training records, audit logs, and site compliance documents into a structured evidence pack ready for SIA review.',
    category: 'compliance',
    categoryLabel: 'ACS Compliance',
    icon: 'ri-folder-shield-line',
    readTime: '5 min read',
    lastUpdated: '2026-07-31',
    sections: [
      {
        heading: 'What Is the Evidence Vault?',
        body: "The Evidence Vault is your central repository for all ACS assessment evidence. It automatically collects operational data from across GuardianHub — patrol logs, incident reports, training completions, policy acknowledgements, staff records — and organises it by ACS category and criterion. You can also manually upload documents: insurance certificates, company policies, client contracts, risk assessments. Everything is searchable, taggable, and exportable.",
      },
      {
        heading: 'Auto-Collected Evidence',
        body: "As your team uses GuardianHub, evidence accumulates automatically. Every patrol completion, every incident report, every training module finished, every SIA licence check — all of it feeds into the vault and maps to the relevant ACS criteria. The auto-collection system means you never have to export reports, save them somewhere, and remember to include them in your evidence pack. It's all already there.",
        list: [
          'Patrol completion logs mapped to Service Delivery criteria',
          'Training certificates and completion records mapped to People criteria',
          'Policy acknowledgement records mapped to Leadership criteria',
          'Incident reports and resolution logs mapped to Customer Focus criteria',
          'Staff vetting records and SIA licence status mapped to People criteria',
        ],
      },
      {
        heading: 'Manual Upload and Organisation',
        body: "Some evidence can't be auto-collected — signed client contracts, third-party insurance certificates, company registration documents. The Upload function accepts PDFs, images, and document scans. Each upload can be tagged with the relevant ACS category, criterion number, site, and expiry date. The vault tracks document versions, so when you upload an updated insurance certificate, it replaces the old one while preserving the history.",
      },
      {
        heading: 'Generating the Evidence Pack PDF',
        body: "When you're ready for assessment — or just want to check your current state — click Generate Evidence Pack. GuardianHub compiles all evidence, organised by category and criterion, into a single, professionally formatted PDF. The pack includes a cover page, table of contents, category summaries with compliance status, and all supporting documents. This is the exact format SIA assessors expect. Generate it monthly to track progress, and run a final version before your audit date.",
        tip: 'Generate a draft evidence pack monthly, even if your audit is months away. It surfaces gaps early and gives you plenty of time to resolve them.',
      },
    ],
    related: [
      { slug: 'acs-compliance-dashboard', title: 'ACS Compliance Dashboard: How It Works' },
      { slug: 'occurrence-book-guide', title: 'The Occurrence Book: Logging, Reviewing, and Exporting Entries' },
    ],
  },

  'subscription-and-billing': {
    slug: 'subscription-and-billing',
    title: 'Managing Your Subscription and Billing',
    excerpt: 'How to view invoices, update payment methods, change plans, and understand what each pricing tier includes.',
    category: 'billing',
    categoryLabel: 'Billing & Plans',
    icon: 'ri-bank-card-line',
    readTime: '4 min read',
    lastUpdated: '2026-08-02',
    sections: [
      {
        heading: 'Understanding Your Plan',
        body: "GuardianHub offers tiered plans based on the number of sites and guards you manage. Each plan includes a core set of features — sites, guards, patrol management, occurrence book, and incident reporting — plus progressively more advanced capabilities at higher tiers. Your current plan and usage are visible from Settings > Billing. The usage meters show how many sites and guards you've added versus your plan limit.",
        list: [
          'Starter: Up to 5 sites, 20 guards, basic patrols and OB',
          'Professional: Up to 25 sites, 100 guards, rota engine, client portal',
          'Enterprise: Unlimited sites and guards, ACS compliance, evidence vault, API access',
        ],
      },
      {
        heading: 'Viewing and Downloading Invoices',
        body: "All invoices are available from Settings > Billing > Invoice History. Each invoice shows the billing period, plan charge, any overage fees (if you exceeded your plan limits), and VAT. Invoices are generated automatically on your billing date and stored indefinitely. You can download any invoice as a PDF for your accounting records. GuardianHub sends email notifications when a new invoice is available.",
      },
      {
        heading: 'Updating Payment Methods',
        body: "From Settings > Billing > Payment Methods, you can add, update, or remove credit and debit cards. GuardianHub processes payments through Stripe — your card details are never stored on our servers. You can set a primary payment method and keep a backup card on file. If a payment fails, GuardianHub retries automatically and notifies the account owner. Services continue uninterrupted during the retry window.",
      },
      {
        heading: 'Changing Plans',
        body: "You can upgrade or downgrade your plan at any time from Settings > Billing > Change Plan. Upgrades take effect immediately — you're charged the prorated difference for the remainder of the billing period. Downgrades take effect at the start of your next billing cycle to avoid mid-cycle disruption. If a downgrade would put you over the new plan's limits, the system warns you and asks you to reduce sites or guards first.",
        tip: 'If you are approaching your plan limits, the Billing page shows a usage warning. You can upgrade before hitting the limit to avoid any service interruption.',
      },
    ],
    related: [
      { slug: 'quickstart-guide', title: 'Quickstart: Set Up Your Security Operations in Under 15 Minutes' },
      { slug: 'onboarding-your-team', title: 'Onboarding Your Team: Roles, Permissions, and Invitations' },
    ],
  },

  'api-and-webhooks': {
    slug: 'api-and-webhooks',
    title: 'API Access and Webhook Configuration',
    excerpt: 'Technical guide to GuardianHub API keys, available endpoints, webhook event types, and how to integrate with your existing systems.',
    category: 'integrations',
    categoryLabel: 'Integrations',
    icon: 'ri-code-s-slash-line',
    readTime: '6 min read',
    lastUpdated: '2026-07-18',
    sections: [
      {
        heading: 'API Overview',
        body: "GuardianHub provides a REST API for integrating your security operations data with external systems — HR platforms, payroll software, client reporting tools, and custom dashboards. The API uses JSON payloads, Bearer token authentication, and standard HTTP methods. All endpoints are documented with request/response examples. API access is available on Enterprise plans.",
      },
      {
        heading: 'Generating and Managing API Keys',
        body: "From Settings > API Keys, click Generate New Key. Give your key a descriptive name — this helps you track which integration uses which key. You can set permissions per key: read-only for reporting integrations, read-write for systems that need to create or update data. Keys can be revoked at any time. GuardianHub logs all API activity so you can audit which keys accessed which endpoints and when.",
        tip: 'Create separate API keys for each integration. If you need to revoke access for one system, you do not affect the others.',
      },
      {
        heading: 'Available Endpoints',
        body: "The API exposes endpoints for sites, guards, shifts, attendance, incidents, OB entries, patrol completions, and reports. Each endpoint supports filtering, pagination, and date range queries. The full API reference is available at the API documentation portal linked from the API Keys page. Common use cases include syncing guard attendance data to payroll systems and pulling incident reports into client-facing dashboards.",
        list: [
          'GET /v1/sites — List all sites with filters',
          'GET /v1/guards — List all guards with licence status',
          'GET /v1/shifts — Shift data with date range filtering',
          'GET /v1/attendance — Clock-in/out records',
          'GET /v1/incidents — Incident reports with severity filters',
          'POST /v1/webhooks — Register a webhook endpoint',
        ],
      },
      {
        heading: 'Webhook Configuration',
        body: "Webhooks allow GuardianHub to push real-time event notifications to your external systems. From Settings > API Keys > Webhooks, add your endpoint URL and select which event types you want to receive. Supported events include: guard.clocked_in, guard.clocked_out, incident.created, patrol.completed, sos.triggered, and checkin.missed. GuardianHub sends a signed payload to your endpoint — verify the signature to ensure authenticity.",
      },
      {
        heading: 'Security and Rate Limiting',
        body: "All API requests must include your API key in the Authorization header as a Bearer token. Requests are rate-limited to 1000 requests per minute per key. Exceeding the limit returns a 429 status code with a Retry-After header. GuardianHub supports IP allowlisting for additional security — restrict API access to your office or data centre IP ranges. All API traffic is encrypted over HTTPS.",
      },
    ],
    related: [
      { slug: 'subscription-and-billing', title: 'Managing Your Subscription and Billing' },
      { slug: 'rota-engine-guide', title: 'Rota Engine: AI-Powered Scheduling Explained' },
    ],
  },
};

function NotFoundState({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <i className="ri-file-search-line text-gray-500 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-8">
            We could not find a documentation article for <span className="text-blue-400 font-mono">/{slug}</span>.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            Back to Documentation
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function TableOfContents({ sections }: { sections: ArticleSection[] }) {
  const [activeId, setActiveId] = useState<string>('');
  const headingElementsRef = useRef<Record<string, IntersectionObserverEntry>>({});

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      setActiveId(id);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const headingIds = sections.map((s) => slugify(s.heading));
    const elements = headingIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        headingElementsRef.current[entry.target.id] = entry;
      });

      const visibleEntries = Object.values(headingElementsRef.current).filter(
        (e) => e.isIntersecting
      );

      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((prev, curr) =>
          prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
        );
        setActiveId(topEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0,
    });

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length <= 3) return null;

  return (
    <nav className="hidden lg:block sticky top-28 self-start w-56 flex-shrink-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-white/10">
        {sections.map((section) => {
          const id = slugify(section.heading);
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                className={`block w-full text-left py-1.5 pl-3 pr-2 text-sm transition-colors cursor-pointer border-l-2 -ml-px ${
                  isActive
                    ? 'border-blue-400 text-blue-400 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                {section.heading}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function DocArticleClient({ slug }: { slug: string }) {
  const article = articles[slug];

  if (!article) {
    return <NotFoundState slug={slug} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <section className="pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer mb-6"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Documentation
            </Link>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
                {article.categoryLabel}
              </span>
              <span className="text-gray-500 text-xs">{article.readTime}</span>
              <span className="text-gray-600 text-xs">Updated {article.lastUpdated}</span>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              {article.excerpt}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex gap-12 lg:gap-16">
            <TableOfContents sections={article.sections} />

            <div className="flex-1 min-w-0 max-w-3xl">
              <div className="space-y-12">
                {article.sections.map((section, i) => (
                  <FadeIn key={i} delay={i * 80}>
                    <div id={slugify(section.heading)}>
                      <h2 className="text-xl font-bold text-white mb-4 scroll-mt-28">{section.heading}</h2>
                      <p className="text-gray-400 leading-relaxed">{section.body}</p>

                      {section.list && (
                        <ul className="mt-4 space-y-2">
                          {section.list.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-gray-400">
                              <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <i className="ri-check-line text-blue-400 text-xs"></i>
                              </div>
                              <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.tip && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-lightbulb-line text-amber-400"></i>
                          </div>
                          <p className="text-amber-300/80 text-sm leading-relaxed">{section.tip}</p>
                        </div>
                      )}
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {article.related.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-lg font-bold text-white mb-6">Related Articles</h2>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-4">
              {article.related.map((rel, i) => (
                <FadeIn key={rel.slug} delay={i * 100}>
                  <Link
                    href={`/docs/${rel.slug}`}
                    className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all cursor-pointer"
                  >
                    <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{rel.title}</h3>
                    <span className="text-xs text-blue-400">Read article <i className="ri-arrow-right-line"></i></span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white mb-4">Was this article helpful?</h2>
            <p className="text-gray-400 text-sm mb-6">
              If you still have questions, our support team is ready to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-line"></i>
              Contact Support
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}