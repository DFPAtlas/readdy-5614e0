'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ChangePlanModal from './ChangePlanModal';
import { useStripePortal } from '../../../lib/useStripePortal';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadgeStyles(status: string | null | undefined) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'active':
      return { bg: 'bg-green-100 text-green-800 border-green-300', dot: 'bg-green-600' };
    case 'trialing':
      return { bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600' };
    case 'past_due':
      return { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-600' };
    case 'unpaid':
      return { bg: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-600' };
    case 'canceled':
      return { bg: 'bg-gray-100 text-gray-700 border-gray-300', dot: 'bg-gray-500' };
    case 'incomplete':
      return { bg: 'bg-gray-100 text-gray-700 border-gray-300', dot: 'bg-gray-500' };
    default:
      return { bg: 'bg-gray-100 text-gray-700 border-gray-300', dot: 'bg-gray-400' };
  }
}

export default function BillingSettings() {
  const { companyId, refreshCompany } = useAuth();
  const { openPortal, loading: portalLoading } = useStripePortal();

  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [billingSaved, setBillingSaved] = useState(false);
  const [billingSaving, setBillingSaving] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [usageStats, setUsageStats] = useState({ sites: 0, guards: 0, loaded: false });

  const fetchCompany = useCallback(async () => {
    if (!companyId) { setCompanyLoading(false); return; }
    try {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();
      setCompany(data);
      if (data) refreshCompany();
    } catch {} finally {
      setCompanyLoading(false);
    }
  }, [companyId, refreshCompany]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    async function loadUsage() {
      try {
        const [sitesRes, guardsRes] = await Promise.all([
          supabase.from('sites').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
          supabase.from('guards').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        ]);
        if (cancelled) return;
        setUsageStats({ sites: sitesRes.count || 0, guards: guardsRes.count || 0, loaded: true });
      } catch {
        if (!cancelled) setUsageStats((prev) => ({ ...prev, loaded: true }));
      }
    }
    loadUsage();
    return () => { cancelled = true; };
  }, [companyId]);

  const hasStripeCustomer = !!company?.stripe_customer_id;
  const planName = company?.plan_name || company?.subscription_plan || '\u2014';
  const status = company?.subscription_status;
  const billingPeriod = company?.subscription_billing || '\u2014';
  const periodEnd = company?.subscription_period_end;
  const cancelAt = company?.subscription_cancel_at;
  const trialEnds = company?.trial_ends_at;
  const accountStatus = company?.account_status;
  const sb = statusBadgeStyles(status);

  const [billingInfo, setBillingInfo] = useState({
    companyName: '',
    billingEmail: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
    vatNumber: '',
  });

  useEffect(() => {
    if (company) {
      setBillingInfo({
        companyName: company.name || '',
        billingEmail: company.contact_email || '',
        address: company.address || '',
        city: company.city || '',
        postalCode: company.postal_code || '',
        country: company.country || 'United Kingdom',
        vatNumber: company.vat_number || '',
      });
    }
  }, [company]);

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBilling = async () => {
    setBillingSaving(true);
    setBillingError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setBillingError('Not logged in');
        setBillingSaving(false);
        return;
      }
      const { error } = await supabase
        .from('companies')
        .update({
          name: billingInfo.companyName,
          contact_email: billingInfo.billingEmail,
          address: billingInfo.address,
          city: billingInfo.city,
          postal_code: billingInfo.postalCode,
          country: billingInfo.country,
          vat_number: billingInfo.vatNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId);
      if (error) throw error;
      setBillingSaved(true);
      setTimeout(() => setBillingSaved(false), 3000);
      fetchCompany();
    } catch (err: any) {
      setBillingError(err.message || 'Failed to save');
    } finally {
      setBillingSaving(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <i className="ri-loader-4-line animate-spin text-xl" />
          <span>Loading billing info\u2026</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
          <div className="flex items-center gap-3">
            {hasStripeCustomer ? (
              <>
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
                >
                  {portalLoading ? (
                    <i className="ri-loader-4-line animate-spin" />
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-external-link-line text-sm" />
                    </div>
                  )}
                  Manage Billing
                </button>
                <button
                  onClick={() => setShowChangePlanModal(true)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Change Plan
                </button>
              </>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Choose a Plan
              </Link>
            )}
          </div>
        </div>

        <div className="p-6">
          {hasStripeCustomer ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <i className="ri-shield-star-line text-xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{planName}</h3>
                    <p className="text-gray-500 text-sm capitalize">{billingPeriod} billing</p>
                  </div>
                </div>
                <div className="sm:ml-auto">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sb.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                    {status || 'unknown'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Plan Details</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5 text-sm text-gray-600">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="ri-check-line text-blue-500 text-sm" />
                      </div>
                      {billingPeriod === 'yearly' ? 'Annual billing (save 20%)' : 'Monthly billing'}
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-600">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="ri-check-line text-blue-500 text-sm" />
                      </div>
                      Full access to {planName} features
                    </li>
                    {accountStatus && (
                      <li className="flex items-start gap-2.5 text-sm text-gray-600">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="ri-check-line text-blue-500 text-sm" />
                        </div>
                        Account status: <span className="capitalize">{accountStatus}</span>
                      </li>
                    )}
                    {trialEnds && (
                      <li className="flex items-start gap-2.5 text-sm text-gray-600">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="ri-check-line text-blue-500 text-sm" />
                        </div>
                        Trial ends: {formatDate(trialEnds)}
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Billing Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Next billing date</span>
                      <span className="text-gray-900 font-medium">{formatDate(periodEnd)}</span>
                    </div>
                    {cancelAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cancellation date</span>
                        <span className="text-amber-600 font-medium">{formatDate(cancelAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Period</span>
                      <span className="text-gray-900 font-medium capitalize">{billingPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Currency</span>
                      <span className="text-gray-900 font-medium">GBP</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 mb-4">
                <i className="ri-bank-card-line text-2xl text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium mb-1">No billing account found</p>
              <p className="text-gray-500 text-sm mb-5 max-w-sm">
                Choose a plan to activate your subscription and unlock all GuardianHub features.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-line text-sm" />
                </div>
                Choose a plan
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Usage</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sites</span>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <i className="ri-building-line text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{usageStats.loaded ? usageStats.sites : '\u2014'}</p>
              <p className="text-sm text-gray-500 mt-0.5">{usageStats.loaded ? 'Active sites' : 'Loading\u2026'}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Guards</span>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <i className="ri-shield-user-line text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{usageStats.loaded ? usageStats.guards : '\u2014'}</p>
              <p className="text-sm text-gray-500 mt-0.5">{usageStats.loaded ? 'Active guards' : 'Loading\u2026'}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Storage</span>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <i className="ri-hard-drive-line text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{'< 10 MB'}</p>
              <p className="text-sm text-gray-500 mt-0.5">Used</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">API Calls</span>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <i className="ri-code-line text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{'\u2014'}</p>
              <p className="text-sm text-gray-500 mt-0.5">This month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
          <button
            onClick={handleSaveBilling}
            disabled={billingSaving}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {billingSaving ? 'Saving\u2026' : billingSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={billingInfo.companyName}
                onChange={handleBillingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Email</label>
              <input
                type="email"
                name="billingEmail"
                value={billingInfo.billingEmail}
                onChange={handleBillingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={billingInfo.address}
                onChange={handleBillingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={billingInfo.city}
                onChange={handleBillingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={billingInfo.postalCode}
                onChange={handleBillingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={billingInfo.country}
                onChange={handleBillingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VAT Number</label>
              <input
                type="text"
                name="vatNumber"
                value={billingInfo.vatNumber}
                onChange={handleBillingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <input
                type="text"
                value="GBP"
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
          {billingError && (
            <p className="text-red-600 text-sm mt-3">{billingError}</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          {hasStripeCustomer && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
            >
              {portalLoading ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-external-link-line text-sm" />
                </div>
              )}
              Manage in Stripe
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="p-6 rounded-lg bg-gray-50 border border-gray-100 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300 mx-auto mb-3">
              <i className="ri-bank-card-line text-xl text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Manage your cards and bank accounts</p>
            <p className="text-xs text-gray-500 mb-4">Add, remove, or update default payment methods via Stripe</p>
            {hasStripeCustomer ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {portalLoading ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-external-link-line text-sm" />
                  </div>
                )}
                Open Stripe Portal
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Choose a Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
          {hasStripeCustomer && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
            >
              {portalLoading ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-external-link-line text-sm" />
                </div>
              )}
              View in Stripe
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="p-6 rounded-lg bg-gray-50 border border-gray-100 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300 mx-auto mb-3">
              <i className="ri-file-list-3-line text-xl text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">View invoices and payment receipts</p>
            <p className="text-xs text-gray-500 mb-4">Download PDFs, check payment status, and view billing history via Stripe</p>
            {hasStripeCustomer ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {portalLoading ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-external-link-line text-sm" />
                  </div>
                )}
                Open Stripe Portal
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Choose a Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-red-200 rounded-lg">
        <div className="px-6 py-4 border-b border-red-200">
          <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Cancel Subscription</h3>
              <p className="text-sm text-gray-500">
                Downgrade or cancel your subscription. You can also manage this directly in Stripe.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {hasStripeCustomer && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
                >
                  {portalLoading ? (
                    <i className="ri-loader-4-line animate-spin" />
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-external-link-line text-sm" />
                    </div>
                  )}
                  Stripe Portal
                </button>
              )}
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-md text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {hasStripeCustomer && (
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => setShowChangePlanModal(false)}
          currentPlan={planName}
          onPlanChanged={fetchCompany}
        />
      )}
    </div>
  );
}