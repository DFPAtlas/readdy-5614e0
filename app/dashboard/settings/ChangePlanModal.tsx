'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startSubscriptionCheckout, type SubscriptionPlanKey, type BillingInterval } from '../../../lib/stripeSubscriptionCheckout';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onPlanChanged?: () => void;
}

const planStyles = {
  'sentinel-starter': {
    label: 'Starter',
    colour: 'text-gray-600',
    border: 'border-gray-200',
    bg: 'bg-gray-50',
    accent: 'bg-gray-500',
    ring: 'ring-gray-200',
    pillBg: 'bg-gray-100',
  },
  sentinel: {
    label: 'Sentinel',
    colour: 'text-gray-600',
    border: 'border-gray-200',
    bg: 'bg-gray-50',
    accent: 'bg-gray-500',
    ring: 'ring-gray-200',
    pillBg: 'bg-gray-100',
  },
  command: {
    label: 'Command',
    colour: 'text-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    accent: 'bg-blue-600',
    ring: 'ring-blue-200',
    pillBg: 'bg-blue-100',
  },
  titan: {
    label: 'Titan',
    colour: 'text-amber-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    accent: 'bg-amber-500',
    ring: 'ring-amber-200',
    pillBg: 'bg-amber-100',
  },
};

type PlanKey = keyof typeof planStyles;

const plans = [
  {
    key: 'sentinel-starter' as PlanKey,
    monthlyPrice: 49,
    yearlyPrice: 49,
    tag: 'For micro security teams',
    guards: '10 guards',
    sites: '1 site',
    yearlyOnly: false,
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
  },
  {
    key: 'sentinel' as PlanKey,
    monthlyPrice: 99,
    yearlyPrice: 79,
    tag: 'For small security teams',
    guards: '25 guards',
    sites: '3 sites',
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
  },
  {
    key: 'command' as PlanKey,
    monthlyPrice: 399,
    yearlyPrice: 319,
    tag: 'For growing security companies',
    guards: '200 guards',
    sites: 'Unlimited sites',
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
  },
  {
    key: 'titan' as PlanKey,
    monthlyPrice: 0,
    yearlyPrice: 0,
    tag: 'For enterprise security companies',
    guards: 'Unlimited',
    sites: 'Unlimited',
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
  },
];

export default function ChangePlanModal({ isOpen, onClose, currentPlan, onPlanChanged }: ChangePlanModalProps) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<PlanKey>(() => {
    const norm = currentPlan.toLowerCase().replace('guardian-hub ', '').replace(' starter', '').replace('-starter', '');
    if ((plans as any).find((p: any) => p.key === norm)) return norm as PlanKey;
    if (norm === 'sentinel starter') return 'sentinel-starter';
    return 'sentinel';
  });
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.key === selectedKey)!;
  const s = planStyles[selectedKey];
  const isCustom = selectedKey === 'titan';
  const isStarter = selectedKey === 'sentinel-starter';
  const isCurrent = currentPlan.toLowerCase().includes(selectedKey) || (isStarter && currentPlan.toLowerCase().includes('starter'));

  const handleConfirm = async () => {
    if (isCustom) {
      router.push('/contact');
      return;
    }
    if (!isCurrent) {
      setCheckoutLoading(true);
      setCheckoutError(null);

      const billing: BillingInterval = isStarter ? 'monthly' : billingPeriod;
      const result = await startSubscriptionCheckout(selectedKey as SubscriptionPlanKey, billing);

      if (result.success && result.url) {
        if (onPlanChanged) onPlanChanged();
        try { window.open(result.url, '_top'); } catch { window.location.href = result.url; }
        return;
      }

      setCheckoutError(result.error || 'Checkout failed');

      if (result.code === 'AUTH_REQUIRED') {
        try { router.push('/login?next=/dashboard/settings'); } catch { window.location.href = '/login?next=/dashboard/settings'; }
      }

      setCheckoutLoading(false);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Change Plan</h2>
            <p className="text-gray-500 text-sm">Current: <span className="text-gray-700 font-medium">{currentPlan}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-500 text-lg" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {!isStarter && (
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-xl p-1.5">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    billingPeriod === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    billingPeriod === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    billingPeriod === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                  }`}>
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const ps = planStyles[plan.key];
              const active = selectedKey === plan.key;
              const current = currentPlan.toLowerCase().includes(plan.key) || (plan.key === 'sentinel-starter' && currentPlan.toLowerCase().includes('starter'));
              const custom = plan.key === 'titan';
              const starter = plan.key === 'sentinel-starter';

              return (
                <button
                  key={plan.key}
                  onClick={() => setSelectedKey(plan.key)}
                  className={`relative text-left rounded-xl border p-5 transition-all cursor-pointer ${
                    active ? `${ps.border} bg-white ring-1 ${ps.ring} shadow-sm` : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {current && (
                    <div className="absolute -top-2 left-4">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200">
                        Current
                      </span>
                    </div>
                  )}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${ps.bg} ${ps.colour} text-xs font-bold w-fit mb-4`}>
                    <span className={`w-2 h-2 rounded-full ${ps.accent}`} />
                    {ps.label}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {custom ? 'Custom' : starter ? '£49' : `£${billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}`}
                  </div>
                  <div className="text-gray-500 text-sm mb-4">{plan.tag}</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-shield-user-line text-gray-400 text-xs" />
                      </span>
                      {plan.guards}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-building-line text-gray-400 text-xs" />
                      </span>
                      {plan.sites}
                    </div>
                  </div>
                  {starter && (
                    <p className="text-xs text-gray-400 mt-3">Monthly only</p>
                  )}
                </button>
              );
            })}
          </div>

          <div className={`rounded-xl border ${s.border} bg-gray-50 p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${s.accent}`} />
              <span className={`text-sm font-bold ${s.colour}`}>{s.label}</span>
              {billingPeriod === 'yearly' && !isCustom && !isStarter && (
                <span className="ml-auto text-xs text-green-600 font-medium">Save 20% with annual billing</span>
              )}
              {isStarter && (
                <span className="ml-auto text-xs text-gray-400 font-medium">Monthly billing only</span>
              )}
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {!isCustom && (
                <span className="text-gray-900 font-semibold">
                  £{isStarter ? '49' : billingPeriod === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}
                </span>
              )}
              {!isCustom && <span> /month{!isStarter && billingPeriod === 'yearly' ? ' (billed annually)' : ''}</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Included</h4>
                <ul className="space-y-2">
                  {selectedPlan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="ri-check-line text-blue-500 text-sm" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {selectedPlan.notIncluded.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Not included</h4>
                  <ul className="space-y-2">
                    {selectedPlan.notIncluded.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="ri-subtract-line text-gray-300 text-sm" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {checkoutError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {checkoutError}
            </div>
          )}

          {!isCurrent && !isCustom && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-information-line text-amber-500 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Plan Change Notice</p>
                  <p className="text-sm text-amber-700">
                    To change plan, your current subscription will be cancelled and a new checkout session will start. You will only be charged for the new plan going forward. Any remaining credit or unused time on your current plan will be handled by Stripe automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={checkoutLoading}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                isCurrent
                  ? 'bg-gray-100 text-gray-500 border border-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {checkoutLoading ? (
                <span className="inline-flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin" />
                  Redirecting...
                </span>
              ) : isCurrent ? (
                'Current Plan'
              ) : isCustom ? (
                'Contact Sales'
              ) : (
                `Switch to ${s.label}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}