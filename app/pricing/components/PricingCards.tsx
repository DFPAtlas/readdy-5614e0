'use client';

import { useState } from 'react';
import { useInView } from '../../hooks/useInView';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';

interface PricingPlan {
  name: string;
  tagline: string;
  priceMonthly: string;
  priceYearly: string;
  period: string;
  cta: string;
  features: string[];
  notIncluded: string[];
  popular: boolean;
  accent: string;
  ringColor: string;
  badgeColor: string;
  planKey?: 'sentinel' | 'command';
  href?: string;
}

const plans: PricingPlan[] = [
  {
    name: 'GuardianHub Sentinel',
    tagline: 'For small security teams',
    priceMonthly: '£99',
    priceYearly: '£79',
    period: '/month',
    cta: 'Start Free Trial',
    features: [
      'Basic rota system',
      'Guard management',
      'Site management',
      'Incident reports',
      'Digital occurrence book',
      'Mobile guard portal',
      'Basic KPI dashboard',
      'Limited AI usage',
    ],
    notIncluded: [
      'AI rota generation',
      'Client portal',
      'Patrol management',
      'GPS tracking',
    ],
    popular: false,
    accent: 'border-white/10',
    ringColor: 'ring-white/10',
    badgeColor: 'bg-gray-500',
    planKey: 'sentinel',
  },
  {
    name: 'GuardianHub Pay as You Go',
    tagline: 'Scale exactly as you grow',
    priceMonthly: '£2.50',
    priceYearly: '£2.00',
    period: '/site/day',
    cta: 'Start Free Trial',
    features: [
      'Everything in Sentinel',
      'Pay per site per day',
      'Pay per guard per day',
      'No monthly commitment',
      'Instant up & down scaling',
      'Full Sentinel access',
    ],
    notIncluded: [
      'AI rota generation',
      'Client portal',
      'Patrol management',
    ],
    popular: false,
    accent: 'border-emerald-500/20',
    ringColor: 'ring-emerald-500/20',
    badgeColor: 'bg-emerald-500',
    href: '/contact?plan=payg',
  },
  {
    name: 'GuardianHub Command',
    tagline: 'For growing security companies',
    priceMonthly: '£399',
    priceYearly: '£319',
    period: '/month',
    cta: 'Start Free Trial',
    features: [
      'Everything in Sentinel',
      'AI rota generation',
      'Leave and sickness automation',
      'Client portal',
      'Patrol management',
      'GPS tracking',
      'Compliance management',
      'AI report writer',
      'Real-time dashboards',
      'Priority support',
    ],
    notIncluded: [
      'White-label branding',
      'API access',
      'Dedicated account manager',
    ],
    popular: true,
    accent: 'border-blue-500/30',
    ringColor: 'ring-blue-500/30',
    badgeColor: 'bg-blue-600',
    planKey: 'command',
  },
  {
    name: 'GuardianHub Titan',
    tagline: 'For enterprise security companies',
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
    period: 'pricing',
    cta: 'Contact Sales',
    features: [
      'Everything in Command',
      'Unlimited guards & sites',
      'White-label branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced AI automation',
      'Predictive staffing AI',
      'Multi-company support',
    ],
    notIncluded: [],
    popular: false,
    accent: 'border-amber-500/20',
    ringColor: 'ring-amber-500/20',
    badgeColor: 'bg-amber-500',
    href: '/contact?plan=titan',
  },
];

export default function PricingCards({ billing }: { billing: 'monthly' | 'yearly' }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 items-start">
      {plans.map((plan) => (
        <PricingCard key={plan.name} plan={plan} billing={billing} />
      ))}
    </div>
  );
}

function PricingCard({ plan, billing }: { plan: PricingPlan; billing: 'monthly' | 'yearly' }) {
  const { ref, isInView } = useInView();
  const isCustom = plan.priceMonthly === 'Custom';
  const isPayg = plan.name.includes('Pay as You Go');
  const displayPrice = billing === 'yearly' && !isCustom ? plan.priceYearly : plan.priceMonthly;
  let displayPeriod = '';
  if (!isCustom) {
    if (isPayg) {
      displayPeriod = plan.period;
    } else {
      displayPeriod = billing === 'yearly' ? '/month (billed annually)' : plan.period;
    }
  }

  const buttonClassName = plan.popular
    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10';

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div
        className={`relative h-full flex flex-col rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${plan.accent} ${plan.popular ? 'ring-1 ' + plan.ringColor + ' shadow-2xl shadow-blue-900/20' : ''} overflow-hidden`}
      >
        {plan.popular && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
        )}

        {plan.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg shadow-blue-900/40">
              <i className="ri-fire-line text-sm"></i>
              Most Popular
            </span>
          </div>
        )}

        <div className="p-8 flex-1 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <p className="text-gray-400 text-sm">{plan.tagline}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-white tracking-tight">{displayPrice}</span>
              {!isCustom && (
                <span className="text-gray-500 text-sm">{displayPeriod}</span>
              )}
            </div>
            {billing === 'yearly' && !isCustom && (
              <p className="text-green-400 text-sm mt-1">
                Save 20% with annual billing
              </p>
            )}
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                  <i className="ri-check-line text-blue-400 text-sm"></i>
                </span>
                <span className="text-gray-300 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
            {plan.notIncluded.map((f, i) => (
              <li key={`no-${i}`} className="flex items-start gap-3 opacity-40">
                <span className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                  <i className="ri-subtract-line text-gray-600 text-sm"></i>
                </span>
                <span className="text-gray-500 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>

          {plan.planKey ? (
            <CheckoutButton
              plan={plan.planKey}
              billing={billing}
              className={buttonClassName}
            >
              {plan.cta}
            </CheckoutButton>
          ) : plan.href ? (
            <Link
              href={plan.href}
              className={`block text-center py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${buttonClassName}`}
            >
              {plan.cta}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}