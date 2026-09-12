'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useEntitlements } from '@/lib/useEntitlements';
import { getUpgradePath, getFeatureUnlocks, getPlanTier, getRequiredPlanForFeature, getCoreFeaturesForTier, PlanEntitlements, PlanSlug } from '@/lib/entitlements';
import { startSubscriptionCheckout, type SubscriptionPlanKey, type BillingInterval } from '@/lib/stripeSubscriptionCheckout';

interface UpgradeRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  featureKey?: keyof PlanEntitlements;
  limitLabel?: string;
  limitValue?: number;
}

export default function UpgradeRequiredModal({ isOpen, onClose, featureName, featureKey, limitLabel, limitValue }: UpgradeRequiredModalProps) {
  const { company } = useAuth();
  const { currentPlanSlug } = useEntitlements();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!requiredPlan || checkoutLoading) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    const result = await startSubscriptionCheckout(
      requiredPlan.slug as SubscriptionPlanKey,
      billing as BillingInterval
    );

    if (result.success && result.url) {
      try { window.open(result.url, '_top'); } catch { window.location.href = result.url; }
      return;
    }

    setCheckoutError(result.error || 'Checkout failed');

    if (result.code === 'AUTH_REQUIRED') {
      try { router.push('/login?next=/dashboard'); } catch { window.location.href = '/login?next=/dashboard'; }
    }

    setCheckoutLoading(false);
  };

  const currentPlanSlugTyped = (currentPlanSlug || company?.subscription_plan || 'none') as string;
  const currentPlanTier = getPlanTier(currentPlanSlugTyped);

  let upgradeInfo = null;
  if (featureKey) {
    upgradeInfo = getUpgradePath(currentPlanSlugTyped, featureKey);
  }

  const requiredPlan = upgradeInfo?.requiredPlan || (featureKey ? getRequiredPlanForFeature(featureKey) : null);

  const targetSlug = requiredPlan?.slug;
  const targetTierFeatures = targetSlug ? getFeatureUnlocks(targetSlug) : [];
  const coreFeatures = requiredPlan ? getCoreFeaturesForTier(requiredPlan.tier) : [];

  const displayFeatureName = featureName || (featureKey
    ? (upgradeInfo?.allFeaturesInTier?.[0]?.displayName || featureKey)
    : limitLabel || 'this feature');

  const isTitan = requiredPlan?.slug === 'titan';
  const canCheckout = requiredPlan && !isTitan && requiredPlan.tier <= 2;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl my-8">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <i className="ri-lock-line text-2xl text-amber-400"></i>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Upgrade Required</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {limitLabel
              ? `${displayFeatureName} (${limitLabel}: ${limitValue}) requires a higher plan.`
              : `"${displayFeatureName}" is not available on your current plan.`}
          </p>

          <div className="mt-6 bg-[#0a0e1a] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg">
                  <i className="ri-user-settings-line text-gray-400"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Plan</p>
                  <p className="text-sm font-semibold text-white">{currentPlanTier?.name || 'Free'}</p>
                </div>
              </div>
              <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                <i className="ri-arrow-right-line"></i>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-amber-500/15 rounded-lg">
                  <i className="ri-star-line text-amber-400"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Required Plan</p>
                  <p className="text-sm font-semibold text-amber-400">{requiredPlan?.name || 'Command'}</p>
                </div>
              </div>
            </div>
          </div>

          {coreFeatures.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                What you unlock on {requiredPlan?.name || 'this plan'}
              </p>
              <div className="bg-[#0a0e1a] rounded-xl border border-gray-800 p-3 space-y-1.5">
                {coreFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-check-line text-emerald-400 text-sm"></i>
                    </span>
                    <span className="text-sm text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {targetTierFeatures.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Gated features that unlock
              </p>
              <div className="flex flex-wrap gap-1.5">
                {targetTierFeatures.map((f) => (
                  <span key={f.featureKey} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    <span className="w-3 h-3 flex items-center justify-center">
                      <i className={`${f.icon} text-[10px]`}></i>
                    </span>
                    {f.displayName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 space-y-3">
          {canCheckout && requiredPlan && (
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setBilling('monthly')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  billing === 'monthly'
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'bg-gray-800/40 text-gray-400 border border-transparent hover:bg-gray-800'
                }`}
              >
                Monthly
              </button>
              {requiredPlan.slug !== 'sentinel-starter' && (
                <button
                  onClick={() => setBilling('yearly')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    billing === 'yearly'
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-gray-800/40 text-gray-400 border border-transparent hover:bg-gray-800'
                  }`}
                >
                  Yearly (save 20%)
                </button>
              )}
            </div>
          )}

          {checkoutError && (
            <p className="text-xs text-red-400 text-center">{checkoutError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Close
            </button>

            {canCheckout && requiredPlan ? (
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {checkoutLoading ? 'Redirecting...' : `Upgrade to ${requiredPlan.name}`}
              </button>
            ) : isTitan ? (
              <Link
                href="/contact?plan=titan"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                Contact Sales
              </Link>
            ) : (
              <Link
                href="/pricing"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                View Plans
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}