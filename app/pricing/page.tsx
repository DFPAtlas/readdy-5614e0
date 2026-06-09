'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PricingCards from './components/PricingCards';
import ComparisonTable from './components/ComparisonTable';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Choose your command centre"
            subtitle="No hidden fees. No per-site licensing. Pay for the operation you run, not the contracts you win."
          />

          <div className="flex justify-center mb-14">
            <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl p-1.5">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${billing === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-gray-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${billing === 'yearly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-gray-400 hover:text-white'}`}
              >
                Yearly
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${billing === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-500/15 text-green-400'}`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <PricingCards billing={billing} />

          <div className="flex justify-center mt-10">
            <Link
              href="/pricing/compare"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Compare all plans in detail
              <span className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-right-line" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <section className="py-20 border-t border-white/8">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <ComparisonTable />
        </div>
      </section>

      <section className="py-20 border-t border-white/8">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FAQSection />
        </div>
      </section>

      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <CTASection />
        </div>
      </section>

      <Footer />
    </div>
  );
}