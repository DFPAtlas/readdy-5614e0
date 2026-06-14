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
  planKey?: 'sentinel-starter' | 'sentinel' | 'command';
  href?: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Sentinel Starter',
    tagline: '14-day free trial — no charge to start',
    priceMonthly: '£49',
    priceYearly: '£49',
    period: '/month',
    cta: 'Start Free Trial',
    features: [
      'Basic rota system',
      'Guard management (up to 10)',
      '1 site',
      'Incident reports',
      'Digital occurrence book',
      'Mobile guard portal',
    ],
    notIncluded: [
      'AI features',
      'Client portal',
      'Patrol management',
      'GPS tracking',
      'Multiple sites',
    ],
    popular: false,
    accent: 'border-white/10',
    ringColor: 'ring-white/10',
    badgeColor: 'bg-gray-500',
    planKey: 'sentinel-starter',
  },
  {
    name: 'GuardianHub Sentinel',
    tagline: 'For small security teams',
    priceMonthly: '£99',
    priceYearly: '£79',
    period: '/month',
    cta: 'Start Free Trial',
    features: [
      'Everything in Starter',
      'Up to 25 guards',
      'Up to 3 sites',
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
];;

export default function PricingCards({ billing }: { billing: 'monthly' | 'yearly' }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
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
  const isStarter = plan.planKey === 'sentinel-starter';
  const displayPrice = billing === 'yearly' && !isCustom && !isStarter ? plan.priceYearly : plan.priceMonthly;
  let displayPeriod = '';
  if (!isCustom) {
    if (isPayg) {
      displayPeriod = plan.period;
    } else {
      displayPeriod = billing === 'yearly' && !isStarter ? '/month (billed annually)' : plan.period;
    }
  }

  const buttonClassName = plan.popular
    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10';

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg shadow-blue-900/40">
            <i className="ri-fire-line text-sm"></i>
            Most Popular
          </span>
        </div>
      )}
      <div
        className={`relative h-full flex flex-col rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${plan.accent} ${plan.popular ? 'ring-1 ' + plan.ringColor + ' shadow-2xl shadow-blue-900/20' : ''} overflow-hidden`}
      >
        {plan.popular && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
        )}

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <p className="text-gray-400 text-sm">{plan.tagline}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white tracking-tight">{displayPrice}</span>
              {!isCustom && (
                <span className="text-gray-500 text-sm">{displayPeriod}</span>
              )}
            </div>
            {billing === 'yearly' && !isCustom && !isStarter && (
              <p className="text-green-400 text-sm mt-1">
                Save 20% with annual billing
              </p>
            )}
            {isStarter && (
              <p className="text-gray-500 text-xs mt-1">Monthly only</p>
            )}
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                  <i className="ri-check-line text-blue-400 text-sm"></i>
                </span>
                <span className="text-gray-300 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
            {plan.notIncluded.map((f, i) => (
              <li key={`no-${i}`} className="flex items-start gap-2.5 opacity-40">
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
              billing={isStarter ? 'monthly' : billing}
              className={buttonClassName}
            >
              {plan.cta}
            </CheckoutButton>
          ) : plan.href ? (
            <Link
              href={plan.href}
              className={`block text-center py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${buttonClassName}`}
            >
              {plan.cta}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}