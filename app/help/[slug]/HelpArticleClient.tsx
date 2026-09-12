'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useHelpArticle } from '@/lib/useHelpCentre';

export default function HelpArticleClient({ slug }: { slug: string }) {
  const { article, loading, submitFeedback } = useHelpArticle(slug);
  const [sent, setSent] = useState(false);

  const paragraphs = article ? article.content.split('\n\n').filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <section className="pt-28 pb-8">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer mb-6">
            <i className="ri-arrow-left-line"></i> Back to Help Centre
          </Link>

          {loading && (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
          )}

          {!loading && !article && (
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-white mb-3">Article not available</h1>
              <p className="text-gray-400 text-sm">This article may be restricted or unpublished.</p>
            </div>
          )}

          {!loading && article && (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
              {article.summary && <p className="text-lg text-gray-400 leading-relaxed mb-8">{article.summary}</p>}

              <div className="space-y-6">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed">{p}</p>
                ))}
              </div>

              <div className="mt-10 p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-white mb-3">Was this article helpful?</p>
                {sent ? (
                  <p className="text-sm text-emerald-400">Thanks for your feedback.</p>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => { setSent(true); submitFeedback(true); }} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer whitespace-nowrap">
                      <i className="ri-thumb-up-line"></i> Yes
                    </button>
                    <button onClick={() => { setSent(true); submitFeedback(false); }} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer whitespace-nowrap">
                      <i className="ri-thumb-down-line"></i> No
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}