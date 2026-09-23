'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { useInView } from '../hooks/useInView';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const securitySections = [
  {
    title: 'Tenant Isolation',
    icon: 'ri-stack-line',
    description: 'Every GuardianHub customer operates in a fully isolated tenant. Data, users, and configurations are separated at the database level using PostgreSQL Row-Level Security (RLS). No customer can access another\'s data — not even accidentally.',
  },
  {
    title: 'Row-Level Security',
    icon: 'ri-shield-keyhole-line',
    description: 'All database queries pass through Supabase RLS policies that enforce tenant ownership at the row level. Even if a query is intercepted or modified, the database engine rejects unauthorised access before any data is returned.',
  },
  {
    title: 'Authentication & MFA',
    icon: 'ri-fingerprint-line',
    description: 'We use Supabase Auth with secure password hashing (bcrypt), session management with refresh token rotation, and multi-factor authentication (MFA) support. Platform staff are required to use MFA/AAL2 for privileged operations.',
  },
  {
    title: 'Encryption',
    icon: 'ri-lock-2-line',
    description: 'All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256 through Supabase\'s underlying infrastructure. File storage uses server-side encryption with unique keys per object.',
  },
  {
    title: 'Private File Storage',
    icon: 'ri-folder-lock-line',
    description: 'Uploaded evidence, documents, and reports are stored in private Supabase Storage buckets. Public access is never enabled by default. Download URLs are time-limited and signed, expiring automatically.',
  },
  {
    title: 'Audit Logs',
    icon: 'ri-file-list-2-line',
    description: 'Every significant action — logins, role changes, data exports, support access sessions, and configuration modifications — is recorded in an append-only audit log. Platform audit records cannot be edited or deleted through the UI.',
  },
  {
    title: 'Backup & Recovery',
    icon: 'ri-database-2-line',
    description: 'Supabase provides continuous Point-in-Time Recovery (PITR) backups with configurable retention. Database backups are encrypted and stored redundantly across availability zones.',
  },
  {
    title: 'Incident Response',
    icon: 'ri-alert-line',
    description: 'We maintain a documented incident response plan. Security incidents are triaged within 4 hours. Affected customers are notified without undue delay. Post-incident reviews are conducted for all confirmed incidents.',
  },
  {
    title: 'Subprocessor Management',
    icon: 'ri-organization-chart',
    description: 'We maintain a public list of subprocessors and notify customers of changes. All subprocessors are vetted for security compliance and contractual obligations. See our Subprocessor List page for current providers.',
  },
  {
    title: 'Data Retention',
    icon: 'ri-archive-line',
    description: 'Customer data is retained for the duration of the active subscription. Upon termination, data is held for 90 days to allow export, then securely deleted. Legal holds can extend retention where required.',
  },
  {
    title: 'Secure Development',
    icon: 'ri-code-s-slash-line',
    description: 'All code changes pass through pull request review. Secrets are never committed to repositories. Dependencies are scanned for vulnerabilities. Production deployments require approval and are audited.',
  },
  {
    title: 'Responsible Disclosure',
    icon: 'ri-bug-line',
    description: 'If you discover a security vulnerability, please report it to security@guardianhub.com. We commit to acknowledging reports within 48 hours and providing a timeline for resolution. We do not pursue legal action against good-faith researchers.',
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://readdy.ai/api/search-image?query=Abstract%20cybersecurity%20background%20with%20subtle%20glowing%20blue%20shield%20icon%20on%20dark%20navy%20background%2C%20interconnected%20security%20nodes%20and%20encrypted%20data%20streams%2C%20minimalist%20corporate%20security%20design%2C%20clean%20geometric%20patterns%2C%20professional%20technology%20atmosphere%2C%20deep%20navy%20and%20electric%20blue%20tones%2C%20no%20text&width=1440&height=500&seq=security-hero&orientation=landscape" alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/80 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">Trust & Security</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Security is not a feature — <span className="text-blue-400">it is the foundation</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                GuardianHub protects your operational data, guard information, and client records with enterprise-grade security controls. Here is exactly how we do it — transparently and without marketing fluff.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="ri-information-line text-blue-400 text-lg"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Important note</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This page describes GuardianHub's security controls accurately based on our current infrastructure. We do not claim certifications we do not hold. SOC 2, ISO 27001, Cyber Essentials, or SIA ACS badges are not displayed unless independently verified. Security is a shared responsibility — some controls described here are GuardianHub responsibilities, others are customer responsibilities.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securitySections.map((section, i) => (
              <FadeIn key={section.title} delay={i * 75}>
                <GlassCard className="p-6 h-full" hover>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                    <i className={`${section.icon} text-blue-400 text-lg`}></i>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{section.description}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Customer responsibilities</h2>
              <p className="text-gray-400 leading-relaxed">
                While GuardianHub provides the security controls listed above, customers are responsible for managing their own users, roles, and permissions. This includes enforcing strong passwords, enabling MFA for privileged accounts, reviewing access regularly, and maintaining the confidentiality of API keys and credentials issued to them.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-8">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <i className="ri-shield-check-line text-green-400 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Report a security issue</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Found a vulnerability? We want to hear from you. We practice coordinated disclosure and do not pursue legal action against good-faith researchers.
                </p>
                <a href="mailto:security@guardianhub.com" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5">
                  <i className="ri-mail-line"></i>
                  security@guardianhub.com
                </a>
              </GlassCard>

              <GlassCard className="p-8">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <i className="ri-file-list-3-line text-blue-400 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Additional resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300 text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5">
                      <i className="ri-arrow-right-s-line"></i>Privacy Notice
                    </Link>
                  </li>
                  <li>
                    <Link href="/gdpr" className="text-blue-400 hover:text-blue-300 text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5">
                      <i className="ri-arrow-right-s-line"></i>GDPR Compliance
                    </Link>
                  </li>
                  <li>
                    <Link href="/acceptable-use" className="text-blue-400 hover:text-blue-300 text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5">
                      <i className="ri-arrow-right-s-line"></i>Acceptable Use Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5">
                      <i className="ri-arrow-right-s-line"></i>Terms of Service
                    </Link>
                  </li>
                </ul>
              </GlassCard>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Questions about security?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Our team is happy to discuss our security posture, share documentation, or arrange a security review call with your team.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-mail-line"></i>
                Contact Security Team
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-play-circle-line"></i>
                Request a Security Walkthrough
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}