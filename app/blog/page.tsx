'use client';

import Link from 'next/link';
import { useState } from 'react';
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

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    slug: 'ai-in-security-operations-2026',
    title: 'How AI is Reshaping UK Security Operations in 2026',
    excerpt: 'From predictive scheduling to automated incident classification, AI is no longer a buzzword — it is the engine behind the most efficient security firms in the country. Here is what is actually working on the ground.',
    category: 'Industry Trends',
    author: 'James Hartley',
    authorRole: 'Head of Product',
    date: '4 Aug 2026',
    readTime: '6 min read',
    image: 'https://readdy.ai/api/search-image?query=Modern%20AI%20technology%20concept%20showing%20a%20glowing%20neural%20network%20visualization%20overlaid%20on%20a%20security%20operations%20dashboard%2C%20dark%20blue%20and%20electric%20cyan%20tones%2C%20futuristic%20but%20grounded%20corporate%20setting%2C%20abstract%20data%20streams%20flowing%20through%20circuits%2C%20professional%20technology%20photography%20style%2C%20clean%20and%20sophisticated%20atmosphere&width=800&height=450&seq=blog-ai-ops-2026&orientation=landscape',
    tags: ['AI', 'Operations', 'Technology'],
  },
  {
    slug: 'acs-compliance-digital-transformation',
    title: 'ACS Compliance in the Digital Age: What the SIA Expects Now',
    excerpt: 'The SIA has raised the bar for Approved Contractor Scheme compliance. Digital evidence gathering, automated audit trails, and real-time readiness tracking are no longer optional — they are expected.',
    category: 'Compliance',
    author: 'Sarah Okonkwo',
    authorRole: 'Compliance Lead',
    date: '28 Jul 2026',
    readTime: '8 min read',
    image: 'https://readdy.ai/api/search-image?query=Professional%20compliance%20auditor%20reviewing%20digital%20documents%20on%20a%20tablet%20in%20a%20modern%20office%2C%20security%20industry%20certification%20documents%20visible%2C%20navy%20blue%20and%20clean%20white%20tones%2C%20professional%20corporate%20photography%20style%2C%20sharp%20focus%20on%20documents%2C%20modern%20workspace%20setting&width=800&height=450&seq=blog-acs-compliance&orientation=landscape',
    tags: ['Compliance', 'ACS', 'Regulation'],
  },
  {
    slug: 'reducing-guard-turnover-technology',
    title: 'The Real Cost of Guard Turnover — and How Technology Reduces It',
    excerpt: 'The UK security industry faces an average 40% annual turnover rate. Smart scheduling, fair workload distribution, and wellbeing tools are proven to cut that number in half. Here is the data.',
    category: 'Workforce',
    author: 'David Chen',
    authorRole: 'People Director',
    date: '21 Jul 2026',
    readTime: '5 min read',
    image: 'https://readdy.ai/api/search-image?query=Diverse%20team%20of%20professional%20security%20guards%20in%20modern%20uniforms%20standing%20together%20outside%20a%20corporate%20building%20at%20golden%20hour%2C%20warm%20natural%20lighting%2C%20team%20unity%20and%20professionalism%2C%20urban%20cityscape%20background%2C%20professional%20portrait%20photography%20style%2C%20navy%20uniforms%20with%20subtle%20branding&width=800&height=450&seq=blog-guard-retention&orientation=landscape',
    tags: ['Workforce', 'Retention', 'Wellbeing'],
  },
  {
    slug: 'lone-worker-safety-technology',
    title: 'Lone Worker Protection: Beyond the Panic Button',
    excerpt: 'Automated check-ins, GPS verification, and predictive risk scoring are transforming how security firms protect officers working alone. A panic button is no longer enough — here is what best practice looks like.',
    category: 'Safety',
    author: 'Rachel Thompson',
    authorRole: 'Health & Safety Director',
    date: '14 Jul 2026',
    readTime: '7 min read',
    image: 'https://readdy.ai/api/search-image?query=Security%20guard%20checking%20in%20on%20a%20smartphone%20at%20night%20in%20an%20industrial%20setting%2C%20dramatic%20lighting%20from%20overhead%20lamps%2C%20blue%20hour%20atmosphere%2C%20lone%20worker%20safety%20technology%20concept%2C%20professional%20moody%20photography%2C%20dark%20navy%20and%20warm%20amber%20lighting&width=800&height=450&seq=blog-lone-worker&orientation=landscape',
    tags: ['Safety', 'Lone Worker', 'Technology'],
  },
  {
    slug: 'client-reporting-automation',
    title: 'Why Manual Client Reports Are Costing You Contracts',
    excerpt: 'Clients expect real-time visibility, not a PDF emailed on Friday. Automated reporting platforms are becoming the baseline expectation — and firms that adopt them are winning more renewals.',
    category: 'Client Success',
    author: 'Michael Okafor',
    authorRole: 'Client Director',
    date: '7 Jul 2026',
    readTime: '5 min read',
    image: 'https://readdy.ai/api/search-image?query=Professional%20business%20presentation%20showing%20analytics%20dashboard%20on%20a%20large%20screen%20in%20a%20modern%20meeting%20room%2C%20client%20and%20consultant%20discussing%20reports%2C%20clean%20corporate%20setting%20with%20navy%20blue%20accents%2C%20professional%20photography%2C%20natural%20lighting%20through%20floor-to-ceiling%20windows&width=800&height=450&seq=blog-client-reports&orientation=landscape',
    tags: ['Client Success', 'Reporting', 'Retention'],
  },
  {
    slug: 'patrol-technology-nfc-qr',
    title: 'NFC vs QR vs GPS: Which Patrol Verification Actually Works?',
    excerpt: 'Not all checkpoint technology is equal. We break down the pros, cons, and real-world reliability of NFC tags, QR codes, and GPS geofencing — and why the best firms use a combination.',
    category: 'Technology',
    author: 'James Hartley',
    authorRole: 'Head of Product',
    date: '30 Jun 2026',
    readTime: '9 min read',
    image: 'https://readdy.ai/api/search-image?query=Close-up%20of%20a%20smartphone%20scanning%20an%20NFC%20tag%20on%20a%20wall%20at%20a%20modern%20building%20entrance%2C%20security%20guard%20hand%20visible%2C%20blue%20LED%20indicator%20glowing%2C%20clean%20corporate%20hallway%20setting%2C%20professional%20technology%20photography%2C%20sharp%20focus%20on%20the%20phone%20screen%20showing%20confirmation&width=800&height=450&seq=blog-nfc-patrol&orientation=landscape',
    tags: ['Technology', 'Patrol', 'Hardware'],
  },
  {
    slug: 'security-firm-scalability',
    title: 'From 50 to 500 Guards: Scaling a Security Firm Without Chaos',
    excerpt: 'Growth breaks manual processes. Here is how three UK security firms scaled their operations without doubling their back-office headcount — and the technology choices that made it possible.',
    category: 'Business',
    author: 'Sarah Okonkwo',
    authorRole: 'Compliance Lead',
    date: '23 Jun 2026',
    readTime: '7 min read',
    image: 'https://readdy.ai/api/search-image?query=Modern%20security%20operations%20centre%20with%20large%20wall-mounted%20screens%20showing%20multiple%20site%20feeds%20and%20dashboards%2C%20professional%20staff%20at%20workstations%2C%20dramatic%20blue%20ambient%20lighting%2C%20high-tech%20atmosphere%2C%20wide%20angle%20corporate%20photography%2C%20navy%20and%20teal%20color%20scheme&width=800&height=450&seq=blog-scaling-firm&orientation=landscape',
    tags: ['Business', 'Growth', 'Strategy'],
  },
  {
    slug: 'gdpr-guard-data-best-practices',
    title: 'GDPR for Security Firms: Handling Guard and Client Data Responsibly',
    excerpt: 'Security firms process sensitive personal data daily — from guard vetting records to client site information. A practical guide to staying compliant without drowning in paperwork.',
    category: 'Compliance',
    author: 'Rachel Thompson',
    authorRole: 'Health & Safety Director',
    date: '16 Jun 2026',
    readTime: '6 min read',
    image: 'https://readdy.ai/api/search-image?query=Elegant%20close-up%20of%20a%20data%20privacy%20document%20with%20a%20padlock%20icon%20holographically%20projected%20above%20it%2C%20dark%20navy%20background%20with%20subtle%20blue%20highlights%2C%20legal%20and%20technology%20concept%2C%20professional%20corporate%20photography%2C%20clean%20minimal%20composition%20with%20soft%20lighting&width=800&height=450&seq=blog-gdpr-guards&orientation=landscape',
    tags: ['Compliance', 'GDPR', 'Data'],
  },
];

const categories = ['All', 'Industry Trends', 'Compliance', 'Workforce', 'Safety', 'Client Success', 'Technology', 'Business'];

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 75}ms` }}
    >
      <GlassCard className="h-full flex flex-col overflow-hidden" hover>
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-500/90 text-white text-xs font-semibold">
            {post.category}
          </span>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span>{post.date}</span>
            <span className="text-white/20">·</span>
            <span>{post.readTime}</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-400">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm text-gray-300 font-medium">{post.author}</p>
                <p className="text-xs text-gray-500">{post.authorRole}</p>
              </div>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              Read
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20professional%20workspace%20with%20open%20laptop%20showing%20analytics%20dashboard%2C%20notepad%20with%20handwritten%20notes%2C%20coffee%20cup%2C%20warm%20ambient%20desk%20lamp%20lighting%20against%20dark%20office%20background%2C%20navy%20blue%20and%20warm%20amber%20tones%2C%20corporate%20technology%20blogging%20atmosphere%2C%20depth%20of%20field%20focus%20on%20the%20screen&width=1440&height=500&seq=blog-hero-2026&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a]/70 to-[#0a0e1a]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 block">
                Blog
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Insights for <span className="text-blue-400">modern security leaders</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                Practical advice, industry analysis, and deep dives into the technology and strategy behind the UK's most efficient security operations.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Newsletter Banner */}
          <FadeIn>
            <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-8 md:p-10 mb-14 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Get insights straight to your inbox</h3>
                <p className="text-gray-400 text-sm">One email per week. No spam. Unsubscribe anytime.</p>
              </div>
              {newsletterSubmitted ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium flex-shrink-0">
                  <i className="ri-check-line"></i>
                  Subscribed — see you in your inbox!
                </div>
              ) : (
                <form
                  id="blog-newsletter"
                  data-readdy-form
                  action="https://readdy.ai/api/form/d9tmu6t3pcjqs2fcsglg"
                  method="POST"
                  onSubmit={(e) => {
                    const form = e.currentTarget;
                    const hpEl = form.querySelector('[data-hp-field]') as HTMLInputElement;
                    if (hpEl && hpEl.value.trim()) {
                      e.preventDefault();
                      setNewsletterSubmitted(true);
                      return;
                    }
                    setNewsletterSubmitted(true);
                  }}
                  className="flex gap-2 w-full md:w-auto flex-shrink-0"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm w-64"
                  />
                  <input
                    type="text"
                    name="company_alt"
                    data-hp-field
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    readOnly
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </FadeIn>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-blue-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <i className="ri-article-line text-gray-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No posts in this category yet</h3>
              <p className="text-gray-400 text-sm">Check back soon or explore another topic above.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to put these insights into practice?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              See how GuardianHub helps security firms implement the strategies we write about — in minutes, not months.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-play-circle-line"></i>
                Watch a demo
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