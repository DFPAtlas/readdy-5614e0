'use client';

import { useState } from 'react';
import Link from 'next/link';
import ChangePlanModal from './ChangePlanModal';
import { useStripePortal } from '../../../lib/useStripePortal';
import { useAuth } from '../../../lib/auth';

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadgeStyles(status: string | null | undefined) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'active':
      return {
        badge: 'bg-green-500/10 text-green-300 border-green-500/20',
        dot: 'bg-green-500',
      };
    case 'trialing':
      return {
        badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        dot: 'bg-blue-500',
      };
    case 'past_due':
      return {
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        dot: 'bg-amber-500',
      };
    case 'unpaid':
      return {
        badge: 'bg-red-500/10 text-red-300 border-red-500/20',
        dot: 'bg-red-500',
      };
    case 'canceled':
      return {
        badge: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
        dot: 'bg-gray-500',
      };
    case 'incomplete':
      return {
        badge: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
        dot: 'bg-gray-500',
      };
    default:
      return {
        badge: 'bg-white/5 text-gray-300 border-white/10',
        dot: 'bg-gray-400',
      };
  }
}

function planStyles(planName: string | null | undefined) {
  const p = (planName || '').toLowerCase();
  if (p.includes('sentinel')) {
    return {
      accent: 'border-gray-500/20',
      badge: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
      dot: 'bg-gray-500',
      icon: 'text-gray-400',
    };
  }
  if (p.includes('titan')) {
    return {
      accent: 'border-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      dot: 'bg-amber-500',
      icon: 'text-amber-400',
    };
  }
  return {
    accent: 'border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    dot: 'bg-blue-500',
    icon: 'text-blue-400',
  };
}

export default function BillingSettings() {
  const { company } = useAuth();
  const { openPortal, loading: portalLoading } = useStripePortal();

  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [billingSaved, setBillingSaved] = useState(false);

  const hasStripeCustomer = !!company?.stripe_customer_id;
  const planName = company?.plan_name || company?.subscription_plan || '—';
  const status = company?.subscription_status;
  const billingPeriod = company?.subscription_billing || '—';
  const periodEnd = company?.subscription_period_end;
  const cancelAt = company?.subscription_cancel_at;
  const trialEnds = company?.trial_ends_at;
  const accountStatus = company?.account_status;

  const ps = planStyles(planName);
  const sb = statusBadgeStyles(status);

  const [billingInfo, setBillingInfo] = useState({
    companyName: company?.name || '',
    billingEmail: company?.contact_email || '',
    address: company?.address || '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
    vatNumber: '',
    currency: 'GBP',
  });

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBilling = () => {
    setBillingSaved(true);
    setTimeout(() => setBillingSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ── Current Subscription ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Current Subscription</h2>
          <div className="flex items-center gap-3">
            {hasStripeCustomer ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-50"
              >
                {portalLoading ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-external-link-line text-sm" />
                  </span>
                )}
                Manage billing
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap"
              >
                Choose a Plan
              </Link>
            )}
            {hasStripeCustomer && (
              <button
                onClick={() => setShowChangePlanModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap"
              >
                Change Plan
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {hasStripeCustomer ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border ${ps.accent} bg-white/[0.02] flex items-center justify-center`}>
                    <i className={`ri-shield-star-line text-xl ${ps.icon}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{planName}</h3>
                    <p className="text-gray-400 text-sm capitalize">{billingPeriod} billing</p>
                  </div>
                </div>
                <div className="sm:ml-auto">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sb.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                    {status || 'unknown'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Plan Details</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="ri-check-line text-blue-400 text-sm" />
                      </span>
                      {billingPeriod === 'yearly' ? 'Annual billing (20% savings)' : 'Monthly billing'}
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="ri-check-line text-blue-400 text-sm" />
                      </span>
                      Access to {planName}
                    </li>
                    {accountStatus && (
                      <li className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="ri-check-line text-blue-400 text-sm" />
                        </span>
                        Account status: <span className="capitalize">{accountStatus}</span>
                      </li>
                    )}
                    {trialEnds && (
                      <li className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="ri-check-line text-blue-400 text-sm" />
                        </span>
                        Trial ends: {formatDate(trialEnds)}
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Billing Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Next billing date</span>
                      <span className="text-white font-medium">{formatDate(periodEnd)}</span>
                    </div>
                    {cancelAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cancellation date</span>
                        <span className="text-amber-400 font-medium">{formatDate(cancelAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Period</span>
                      <span className="text-white font-medium capitalize">{billingPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Currency</span>
                      <span className="text-white font-medium">GBP</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
                <i className="ri-bank-card-line text-2xl text-gray-500" />
              </div>
              <p className="text-gray-300 font-medium mb-1">No billing account found</p>
              <p className="text-gray-500 text-sm mb-5 max-w-sm">
                Choose a plan to activate your subscription and unlock all GuardianHub features.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-line text-sm" />
                </span>
                Choose a plan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Usage Statistics ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Usage</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sites</span>
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <i className="ri-building-line text-sm" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-sm text-gray-500 mt-0.5">Loading...</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Guards</span>
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                  <i className="ri-shield-user-line text-sm" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-sm text-gray-500 mt-0.5">Loading...</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Storage</span>
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <i className="ri-hard-drive-line text-sm" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-sm text-gray-500 mt-0.5">Loading...</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">API Calls</span>
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                  <i className="ri-code-line text-sm" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-sm text-gray-500 mt-0.5">Loading...</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Billing Information ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Billing Information</h2>
          <button
            onClick={handleSaveBilling}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap"
          >
            {billingSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={billingInfo.companyName}
                onChange={handleBillingChange}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Billing Email</label>
              <input
                type="email"
                name="billingEmail"
                value={billingInfo.billingEmail}
                onChange={handleBillingChange}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={billingInfo.address}
                onChange={handleBillingChange}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={billingInfo.city}
                onChange={handleBillingChange}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={billingInfo.postalCode}
                onChange={handleBillingChange}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
              <div className="relative">
                <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="country"
                  value={billingInfo.country}
                  onChange={handleBillingChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">VAT Number</label>
              <input
                type="text"
                name="vatNumber"
                value={billingInfo.vatNumber}
                onChange={handleBillingChange}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
              <input
                type="text"
                name="currency"
                value={billingInfo.currency}
                disabled
                className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Methods ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Payment Methods</h2>
          {hasStripeCustomer && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-50"
            >
              {portalLoading ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-external-link-line text-sm" />
                </span>
              )}
              Manage in Stripe
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 mx-auto mb-3">
              <i className="ri-bank-card-line text-xl text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 mb-1">Manage your cards and bank accounts</p>
            <p className="text-xs text-gray-500 mb-4">Add, remove, or update default payment methods</p>
            {hasStripeCustomer ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {portalLoading ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-external-link-line text-sm" />
                  </span>
                )}
                Open Stripe Portal
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap"
              >
                Choose a Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Billing History ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Billing History</h2>
          {hasStripeCustomer && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-50"
            >
              {portalLoading ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-external-link-line text-sm" />
                </span>
              )}
              View in Stripe
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 mx-auto mb-3">
              <i className="ri-file-list-3-line text-xl text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 mb-1">View invoices and payment receipts</p>
            <p className="text-xs text-gray-500 mb-4">Download PDFs, check payment status, and view billing history</p>
            {hasStripeCustomer ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {portalLoading ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-external-link-line text-sm" />
                  </span>
                )}
                Open Stripe Portal
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer whitespace-nowrap"
              >
                Choose a Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-red-500/[0.03] border border-red-500/15 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/15">
          <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">Cancel Subscription</h3>
              <p className="text-sm text-gray-500">
                Downgrade or cancel your subscription. You can also do this directly in Stripe.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {hasStripeCustomer && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-50"
                >
                  {portalLoading ? (
                    <i className="ri-loader-4-line animate-spin" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-external-link-line text-sm" />
                    </span>
                  )}
                  Stripe Portal
                </button>
              )}
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Change Plan Modal */}
      {hasStripeCustomer && (
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => setShowChangePlanModal(false)}
          currentPlan={planName}
        />
      )}
    </div>
  );
}