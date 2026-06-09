'use client';

import Link from 'next/link';
import { useInView } from '../../hooks/useInView';

export default function CTASection() {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Not sure which plan is right for you?
          </h3>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Our team can walk you through the platform and recommend the best fit for your security operation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Book a Demo
              <span className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-right-line text-sm"></i>
              </span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}