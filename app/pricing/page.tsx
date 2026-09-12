'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PricingCards from './components/PricingCards';
import ComparisonTable from './components/ComparisonTable';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';

export default function PricingPage() {
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

          <PricingCards />

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