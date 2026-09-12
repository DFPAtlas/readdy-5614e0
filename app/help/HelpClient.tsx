'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useHelpCentre } from '@/lib/useHelpCentre';

export default function HelpClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const { categories, articles, loading, role } = useHelpCentre();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCategory = activeCategory === 'all' || a.category_slug === activeCategory;
      const q = query.trim().toLowerCase();
      const matchQuery = !q || a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [articles, activeCategory, query]);

  const featured = articles.filter((a) => a.is_featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <section className="pt-32 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Help Centre</h1>
          <p className="text-lg text-gray-400 max-w-2xl">Guides for security companies, guards and clients — matched to what you are allowed to see.</p>
          {role && <p className="text-sm text-blue-400 mt-3">Showing content for: <span className="capitalize">{role.replace(/_/g, ' ')}</span></p>}
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative mb-8 max-w-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-500"></i>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the help centre..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-blue-500/30'}`}>All</button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(c.slug)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeCategory === c.slug ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-blue-500/30'}`}>
                {c.icon && <div className="w-4 h-4 flex items-center justify-center"><i className={c.icon}></i></div>}
                {c.name}
              </button>
            ))}
          </div>

          {featured.length > 0 && activeCategory === 'all' && !query && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-white mb-4">Featured guides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {featured.map((a) => (
                  <Link key={a.id} href={`/help/${a.slug}`} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all cursor-pointer">
                    <h3 className="text-white font-semibold text-sm mb-1.5">{a.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{a.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <Link key={a.id} href={`/help/${a.slug}`} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all cursor-pointer flex flex-col">
                <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug">{a.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 flex-1">{a.summary}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{categories.find((c) => c.slug === a.category_slug)?.name || a.category_slug}</span>
                  {a.helpful_count > 0 && <span className="text-emerald-400">{a.helpful_count} found this helpful</span>}
                </div>
              </Link>
            ))}
          </div>

          {loading && filtered.length === 0 && (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-search-line text-gray-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400 text-sm">Try a different search term or browse a category above.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Still need help?</h2>
          <p className="text-gray-400 text-sm mb-6">Open a support ticket and our team will respond. For real-world emergencies, always use your organisation emergency procedures first.</p>
          <Link href="/dashboard/support" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-customer-service-2-line"></i> Contact Support
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}