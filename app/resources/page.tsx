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
    <div ref={ref} className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const categories = ['All', 'Product Guides', 'Operations', 'Compliance', 'Safety', 'Business'];

const resources = [
  { title: 'Quickstart: Setting Up Your First Site', category: 'Product Guides', desc: 'Step-by-step guide to creating your first site, adding checkpoints, and setting patrol routes — everything you need to go live.', readTime: '5 min', icon: 'ri-rocket-line', slug: 'quickstart-first-site' },
  { title: 'Rota Planning Best Practices for Security Firms', category: 'Operations', desc: 'How to structure shifts, manage availability, handle leave, and use AI to optimise coverage across multiple sites.', readTime: '8 min', icon: 'ri-calendar-check-line', slug: 'rota-best-practices' },
  { title: 'Incident Reporting: A Guide for Guards and Supervisors', category: 'Operations', desc: 'Practical guidance on filing incident reports quickly and completely — what to include, how to categorise, and when to escalate.', readTime: '6 min', icon: 'ri-alert-line', slug: 'incident-reporting-guide' },
  { title: 'Lone Worker Safety Planning', category: 'Safety', desc: 'How to develop a lone worker policy, configure automated check-ins, and set up escalation chains that work for your team.', readTime: '7 min', icon: 'ri-shield-flash-line', slug: 'lone-worker-planning' },
  { title: 'ACS Compliance: Preparing for Your SIA Audit', category: 'Compliance', desc: 'A practical checklist for ACS readiness — what evidence to gather, how to organise it, and common audit findings to avoid.', readTime: '10 min', icon: 'ri-file-shield-line', slug: 'acs-audit-preparation' },
  { title: 'Reducing Guard Turnover Through Better Scheduling', category: 'Business', desc: 'How fair, predictable scheduling reduces turnover — strategies and technology approaches that work.', readTime: '6 min', icon: 'ri-user-heart-line', slug: 'reducing-guard-turnover' },
  { title: 'Patrol Route Design: Getting It Right', category: 'Operations', desc: 'How to design effective patrol routes — checkpoint placement, timing, photo evidence requirements, and route optimisation.', readTime: '5 min', icon: 'ri-route-line', slug: 'patrol-route-design' },
  { title: 'GDPR for Security Firms: A Practical Guide', category: 'Compliance', desc: 'What security firms need to know about GDPR — handling guard data, client information, and incident evidence compliantly.', readTime: '8 min', icon: 'ri-lock-2-line', slug: 'gdpr-for-security-firms' },
  { title: 'Building Effective Client Reports', category: 'Business', desc: 'How to create client reports that demonstrate value — what metrics matter, how to present data, and automating delivery.', readTime: '5 min', icon: 'ri-file-chart-line', slug: 'building-client-reports' },
  { title: 'Guard Mobile App: Tips for Field Teams', category: 'Product Guides', desc: 'Practical tips for guards using the mobile app — clocking in, patrol scanning, incident reporting, and offline mode.', readTime: '4 min', icon: 'ri-smartphone-line', slug: 'guard-app-tips' },
  { title: 'SIA Licence Management and Renewal Tracking', category: 'Compliance', desc: 'How to track SIA licence expiry dates across your workforce and avoid the operational risk of expired licences.', readTime: '4 min', icon: 'ri-id-card-line', slug: 'sia-licence-management' },
  { title: 'Scaling from 20 to 200 Guards: Technology Decisions', category: 'Business', desc: 'What changes when you scale — the technology, processes, and team structures that support growth without chaos.', readTime: '9 min', icon: 'ri-line-chart-line', slug: 'scaling-security-firm' },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = resources.filter((r) => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSearch = search.trim() === '' || r.title.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">Resource Centre</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Practical guidance for <span className="text-blue-400">security operations</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                Product guides, operational best practices, compliance guidance, and business strategy — all written for security professionals running modern operations.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="relative mb-10">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-500"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
              />
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-blue-500/30'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((resource, i) => (
              <FadeIn key={resource.slug} delay={i * 60}>
                <Link href={`/docs/${resource.slug}`}>
                  <GlassCard className="p-6 h-full flex flex-col" hover>
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <i className={`${resource.icon} text-blue-400`}></i>
                      </div>
                      <span className="text-xs font-medium text-gray-500 mt-1">{resource.readTime}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{resource.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed flex-1">{resource.desc}</p>
                    <span className="text-xs text-blue-400 mt-3 inline-flex items-center gap-1">
                      Read more
                      <i className="ri-arrow-right-line"></i>
                    </span>
                  </GlassCard>
                </Link>
              </FadeIn>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-search-line text-gray-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No resources found</h3>
              <p className="text-gray-400 text-sm">Try a different search term or browse by category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Can't find what you need?</h3>
                  <p className="text-gray-400 text-sm">Our support team is here to help. Reach out and we will point you in the right direction.</p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Link href="/docs" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-file-list-3-line"></i>
                    Documentation
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-mail-line"></i>
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-amber-400 mt-0.5 flex-shrink-0">
                <i className="ri-information-line"></i>
              </div>
              <p className="text-amber-300/70 text-xs leading-relaxed">
                These resources provide operational guidance and best practices. They are not legal advice. For compliance, regulatory, or legal matters, consult qualified professionals. Where we reference external guidance or regulations, we link to authoritative sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}