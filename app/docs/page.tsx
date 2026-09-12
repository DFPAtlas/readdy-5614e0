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

interface DocArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  readTime: string;
}

const categories = [
  { id: 'all', label: 'All', icon: 'ri-stack-line' },
  { id: 'getting-started', label: 'Getting Started', icon: 'ri-rocket-line' },
  { id: 'platform', label: 'Platform', icon: 'ri-dashboard-3-line' },
  { id: 'guard-app', label: 'Guard App', icon: 'ri-smartphone-line' },
  { id: 'compliance', label: 'ACS Compliance', icon: 'ri-shield-check-line' },
  { id: 'billing', label: 'Billing & Plans', icon: 'ri-bank-card-line' },
  { id: 'integrations', label: 'Integrations', icon: 'ri-plug-line' },
];

const articles: DocArticle[] = [
  {
    slug: 'quickstart-guide',
    title: 'Quickstart: Set Up Your Security Operations in Under 15 Minutes',
    excerpt:
      'Step-by-step walkthrough to create your first site, onboard guards, and start tracking patrols — everything you need to go live fast.',
    category: 'getting-started',
    icon: 'ri-rocket-line',
    readTime: '4 min read',
  },
  {
    slug: 'onboarding-your-team',
    title: 'Onboarding Your Team: Roles, Permissions, and Invitations',
    excerpt:
      'Learn how to invite your control room staff, set role-based permissions, and ensure every team member sees exactly what they need.',
    category: 'getting-started',
    icon: 'ri-user-add-line',
    readTime: '5 min read',
  },
  {
    slug: 'sites-and-checkpoints',
    title: 'Managing Sites, Checkpoints, and Patrol Routes',
    excerpt:
      'How to create sites, configure NFC/QR checkpoints, design patrol routes, and set scheduling requirements for each location.',
    category: 'platform',
    icon: 'ri-map-pin-line',
    readTime: '7 min read',
  },
  {
    slug: 'occurrence-book-guide',
    title: 'The Occurrence Book: Logging, Reviewing, and Exporting Entries',
    excerpt:
      'Complete guide to the digital OB — from quick guard entries to control room review workflows and client-facing exports.',
    category: 'platform',
    icon: 'ri-book-open-line',
    readTime: '6 min read',
  },
  {
    slug: 'rota-engine-guide',
    title: 'Rota Engine: AI-Powered Scheduling Explained',
    excerpt:
      'How GuardianHub generates optimised rotas, handles shift patterns, covers sickness, and balances guard workloads automatically.',
    category: 'platform',
    icon: 'ri-calendar-check-line',
    readTime: '8 min read',
  },
  {
    slug: 'guard-app-overview',
    title: 'Guard App: Complete Feature Overview',
    excerpt:
      'Everything guards can do from their phone — clock in, scan checkpoints, complete patrols, log incidents, raise SOS, and view rotas.',
    category: 'guard-app',
    icon: 'ri-smartphone-line',
    readTime: '5 min read',
  },
  {
    slug: 'lone-worker-setup',
    title: 'Lone Worker Protection: Setup and Configuration',
    excerpt:
      'Configure automated check-in intervals, escalation chains, GPS tracking, and panic response for guards working alone.',
    category: 'guard-app',
    icon: 'ri-shield-user-line',
    readTime: '6 min read',
  },
  {
    slug: 'incident-reporting-guard',
    title: 'Incident Reporting: Best Practices for Guards',
    excerpt:
      'How guards should capture incidents — photos, witness statements, timelines — to ensure control rooms get complete, actionable reports.',
    category: 'guard-app',
    icon: 'ri-alert-line',
    readTime: '4 min read',
  },
  {
    slug: 'acs-compliance-dashboard',
    title: 'ACS Compliance Dashboard: How It Works',
    excerpt:
      'Understand the readiness score, category breakdown, evidence gathering, and how GuardianHub maps directly to SIA assessment criteria.',
    category: 'compliance',
    icon: 'ri-shield-check-line',
    readTime: '7 min read',
  },
  {
    slug: 'evidence-vault-guide',
    title: 'Evidence Vault: Building Your ACS Evidence Pack',
    excerpt:
      'Organise policies, training records, audit logs, and site compliance documents into a structured evidence pack ready for SIA review.',
    category: 'compliance',
    icon: 'ri-folder-shield-line',
    readTime: '5 min read',
  },
  {
    slug: 'subscription-and-billing',
    title: 'Managing Your Subscription and Billing',
    excerpt:
      'How to view invoices, update payment methods, change plans, and understand what each pricing tier includes.',
    category: 'billing',
    icon: 'ri-bank-card-line',
    readTime: '4 min read',
  },
  {
    slug: 'api-and-webhooks',
    title: 'API Access and Webhook Configuration',
    excerpt:
      'Technical guide to GuardianHub API keys, available endpoints, webhook event types, and how to integrate with your existing systems.',
    category: 'integrations',
    icon: 'ri-code-s-slash-line',
    readTime: '6 min read',
  },
];

function DocCard({ article, index }: { article: DocArticle; index: number }) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <Link href={`/docs/${article.slug}`}>
        <GlassCard className="h-full flex flex-col gap-3 p-6" hover>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <i className={`${article.icon} text-blue-400`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm leading-snug mb-1.5">
                {article.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-2">
                {article.excerpt}
              </p>
              <span className="text-gray-500 text-xs">{article.readTime}</span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </div>
  );
}

export default function DocsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = articles.filter((article) => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch =
      search.trim() === '' ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://readdy.ai/api/search-image?query=Clean%20modern%20technical%20documentation%20workspace%2C%20organized%20desk%20with%20coding%20books%2C%20laptop%20screen%20displaying%20documentation%20UI%20with%20dark%20theme%2C%20soft%20blue%20ambient%20lighting%2C%20professional%20technology%20atmosphere%2C%20navy%20and%20charcoal%20tones%2C%20minimalist%20setup%2C%20depth%20of%20field%20on%20the%20screen&width=1440&height=500&seq=docs-hero-2026&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/70 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">
                Documentation
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Everything you need to <span className="text-blue-400">master GuardianHub</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                Step-by-step guides, platform references, and best practices for security teams running modern operations.
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
                placeholder="Search documentation..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
              />
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-blue-500/30'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={cat.icon}></i>
                  </div>
                  {cat.label}
                </button>
              ))}
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article, i) => (
              <DocCard key={article.slug} article={article} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-search-line text-gray-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400 text-sm">Try a different search term or browse by category above.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Reach out and we'll get back to you within hours — not days.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-mail-line"></i>
                Contact Support
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-play-circle-line"></i>
                Book a walkthrough
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}