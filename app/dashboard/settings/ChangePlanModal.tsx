'use client';

import { useState } from 'react';
import { useStripeCheckout } from '../../../lib/useStripeCheckout';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

const planStyles = {
  sentinel: {
    label: 'Sentinel',
    colour: 'text-gray-300',
    border: 'border-gray-500/20',
    bg: 'bg-gray-500/10',
    accent: 'bg-gray-500',
    ring: 'ring-gray-500/20',
    pillBg: 'bg-gray-500/20',
  },
  command: {
    label: 'Command',
    colour: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    accent: 'bg-blue-600',
    ring: 'ring-blue-500/30',
    pillBg: 'bg-blue-600/20',
  },
  titan: {
    label: 'Titan',
    colour: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    accent: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    pillBg: 'bg-amber-500/20',
  },
};

type PlanKey = keyof typeof planStyles;

const plans = [
  {
    key: 'sentinel' as PlanKey,
    monthlyPrice: 99,
    yearlyPrice: 79,
    tag: 'For small security teams',
    guards: '25 guards',
    sites: '3 sites',
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

export default function ChangePlanModal({ isOpen, onClose, currentPlan }: ChangePlanModalProps) {
  const [selectedKey, setSelectedKey] = useState<PlanKey>(
    (currentPlan.toLowerCase().replace('guardianhub ', '') as PlanKey) || 'sentinel'
  );
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { checkout, loading } = useStripeCheckout();

  const selectedPlan = plans.find((p) => p.key === selectedKey)!;
  const s = planStyles[selectedKey];
  const isCustom = selectedKey === 'titan';
  const isCurrent = currentPlan.toLowerCase().includes(selectedKey);

  const handleConfirm = () => {
    if (isCustom) {
      if (typeof window !== 'undefined') {
        window.location.href = '/contact';
      }
      return;
    }
    if (!isCurrent) {
      checkout(selectedKey, billingPeriod);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1425] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f1425]">
          <div>
            <h2 className="text-lg font-semibold text-white">Change Plan</h2>
            <p className="text-gray-500 text-sm">Current: <span className="text-gray-300">{currentPlan}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Billing toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl p-1.5">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  billingPeriod === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  billingPeriod === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-500/15 text-green-400'
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const ps = planStyles[plan.key];
              const active = selectedKey === plan.key;
              const current = currentPlan.toLowerCase().includes(plan.key);
              const custom = plan.key === 'titan';

              return (
                <button
                  key={plan.key}
                  onClick={() => setSelectedKey(plan.key)}
                  className={`relative text-left rounded-xl border p-6 transition-all cursor-pointer ${
                    active ? `${ps.border} bg-white/[0.03] ring-1 ${ps.ring}` : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                  }`}
                >
                  {current && (
                    <div className="absolute -top-2 left-4">
                      <span className="px-2.5 py-0.5 bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10">
                        Current
                      </span>
                    </div>
                  )}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${ps.bg} ${ps.colour} text-xs font-bold w-fit mb-4`}>
                    <span className={`w-2 h-2 rounded-full ${ps.accent}`} />
                    {ps.label}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {custom ? 'Custom' : `£${billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}`}
                  </div>
                  <div className="text-gray-500 text-sm mb-4">{plan.tag}</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-shield-user-line text-gray-500 text-xs" />
                      </span>
                      {plan.guards}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-building-line text-gray-500 text-xs" />
                      </span>
                      {plan.sites}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected plan detail */}
          <div className={`rounded-xl border ${s.border} bg-white/[0.02] p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${s.accent}`} />
              <span className={`text-sm font-bold ${s.colour}`}>{s.label}</span>
              {billingPeriod === 'yearly' && !isCustom && (
                <span className="ml-auto text-xs text-green-400">Save 20% with annual billing</span>
              )}
            </div>
            <div className="text-sm text-gray-400 mb-4">
              {!isCustom && (
                <span className="text-white font-semibold">
                  £{billingPeriod === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}
                </span>
              )}
              {!isCustom && <span> /month{billingPeriod === 'yearly' ? ' (billed annually)' : ''}</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Included</h4>
                <ul className="space-y-2">
                  {selectedPlan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="ri-check-line text-blue-400 text-sm" />
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
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 opacity-60">
                        <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="ri-subtract-line text-gray-700 text-sm" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                isCurrent
                  ? 'bg-white/5 text-gray-400 border border-white/10'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {loading ? (
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