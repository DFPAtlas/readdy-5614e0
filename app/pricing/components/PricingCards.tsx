'use client';

import { useState } from 'react';
import { useInView } from '../../hooks/useInView';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';
import { YEARLY_PRICES } from '../../../lib/entitlements';

interface PricingPlan {
  name: string;
  taglineMonthly: string;
  taglineYearly: string;
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
    name: 'Guardian-Hub Starter',
    taglineMonthly: '15-day free trial — no charge to start',
    taglineYearly: '15-day free trial — save 20% annually',
    priceMonthly: '£49',
    priceYearly: '£39',
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
    ],
    popular: false,
    accent: 'border-white/10',
    ringColor: 'ring-white/10',
    badgeColor: 'bg-gray-500',
    planKey: 'sentinel-starter',
  },
  {
    name: 'Guardian-Hub Sentinel',
    taglineMonthly: '15-day free trial — no charge to start',
    taglineYearly: '15-day free trial — save 20% annually',
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
    name: 'Guardian-Hub Command',
    taglineMonthly: '15-day free trial — no charge to start',
    taglineYearly: '15-day free trial — save 20% annually',
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
    name: 'Guardian-Hub Titan',
    taglineMonthly: 'For enterprise security companies',
    taglineYearly: 'For enterprise security companies',
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

export default function PricingCards() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-3 bg-white/[0.04] rounded-full p-1.5 border border-white/8">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              billing === 'monthly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap relative ${
              billing === 'yearly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} billing={billing} />
        ))}
      </div>

      <div className="mt-8">
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0 mt-0.5">
              <i className="ri-secure-payment-line text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Monthly services are billed in advance through Stripe. Third-party subscriptions and usage charges are excluded unless stated otherwise.
              </p>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                You can review the order before payment. Your subscription is not active until Stripe confirms checkout.
              </p>
              <p className="text-gray-600 text-xs mt-2">
                By subscribing you agree to our{' '}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer">Terms &amp; Conditions</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ plan, billing }: { plan: PricingPlan; billing: 'monthly' | 'yearly' }) {
  const { ref, isInView } = useInView();
  const isCustom = plan.priceMonthly === 'Custom';
  const price = billing === 'yearly' && !isCustom ? plan.priceYearly : plan.priceMonthly;
  const tagline = billing === 'yearly' ? plan.taglineYearly : plan.taglineMonthly;
  const billingParam: 'monthly' | 'yearly' = billing;

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
            {!isCustom && (
              <p className="text-gray-400 text-sm">{tagline}</p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white tracking-tight">{price}</span>
              {!isCustom && (
                <span className="text-gray-500 text-sm">{plan.period}</span>
              )}
            </div>
            {billing === 'yearly' && !isCustom && plan.planKey && (
              <p className="text-green-400/80 text-xs mt-1">
                Billed annually — save {Math.round((1 - parseInt(plan.priceYearly.replace('£', '')) / parseInt(plan.priceMonthly.replace('£', ''))) * 100)}% vs monthly
              </p>
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
              billing={billingParam}
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