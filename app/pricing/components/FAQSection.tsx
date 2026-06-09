'use client';

import { useState } from 'react';
import { useInView } from '../../hooks/useInView';

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes. You can upgrade or downgrade your plan at any time from your billing settings. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes. Both Sentinel and Command plans include a 14-day free trial with full access to all features. No credit card required to start. Titan plans begin with a guided onboarding call.',
  },
  {
    question: 'What happens when I exceed my guard or site limit?',
    answer:
      'On Sentinel, you will receive a notification when approaching your limit. You can either archive old guards/sites or upgrade to Command for unlimited capacity. Command and Titan have no hard limits.',
  },
  {
    question: 'Do you offer annual billing discounts?',
    answer:
      'Yes. Annual billing saves you 20% compared to monthly. The discount is automatically applied when you select yearly billing at checkout.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards via Stripe. For Titan enterprise plans, we also support invoicing with net-30 terms.',
  },
  {
    question: 'Is my data secure and GDPR compliant?',
    answer:
      'Absolutely. GuardianHub is built on SOC 2 Type II certified infrastructure. All data is encrypted at rest and in transit. We are fully GDPR compliant and can provide a DPA on request.',
  },
  {
    question: 'Can I get a refund if I cancel?',
    answer:
      'Monthly plans can be cancelled at any time with no further charges. Annual plans can be cancelled for a prorated refund within the first 30 days.',
  },
  {
    question: 'Do you offer onboarding and training?',
    answer:
      'Command plans include priority support and onboarding documentation. Titan plans include a dedicated account manager who provides hands-on training for your team and custom rollout plans.',
  },
];

export default function FAQSection() {
  const { ref, isInView } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
        Frequently asked questions
      </h3>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`rounded-xl border transition-all duration-200 ${openIndex === i ? 'bg-white/[0.04] border-white/15' : 'bg-white/[0.02] border-white/8 hover:border-white/12'}`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
            >
              <span className="text-white font-medium text-sm md:text-base">{faq.question}</span>
              <span className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-white/5 text-gray-400">
                <i
                  className={`ri-${openIndex === i ? 'subtract' : 'add'}-line text-lg transition-transform duration-200`}
                ></i>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}
            >
              <p className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}