'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { YEARLY_PRICES, getPlanTier } from '@/lib/entitlements';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useStripePortal } from '@/lib/useStripePortal';

const statusConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  active: { label: 'Active', dotClass: 'bg-green-400', badgeClass: 'bg-green-500/15 text-green-400 border-green-500/20' },
  trialing: { label: 'Trial', dotClass: 'bg-blue-400', badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  past_due: { label: 'Payment issue', dotClass: 'bg-amber-400', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  unpaid: { label: 'Unpaid', dotClass: 'bg-red-400', badgeClass: 'bg-red-500/15 text-red-400 border-red-500/20' },
  incomplete: { label: 'Setup incomplete', dotClass: 'bg-amber-400', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  incomplete_expired: { label: 'Setup expired', dotClass: 'bg-red-400', badgeClass: 'bg-red-500/15 text-red-400 border-red-500/20' },
  canceled: { label: 'Cancelled', dotClass: 'bg-gray-400', badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  paused: { label: 'Paused', dotClass: 'bg-gray-400', badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
};

const paymentIssueStatuses = ['past_due', 'unpaid', 'incomplete', 'incomplete_expired'];

function formatGBP(amount: number | null | undefined): string {
  if (amount == null) return '\u2014';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function safeRef(id: string | null | undefined): string | null {
  if (!id) return null;
  if (id.length <= 8) return id;
  return id.slice(-8);
}

function getDisplayAmount(planSlug: string | null, billingPeriod: string | null): number | null {
  if (!planSlug) return null;
  if (billingPeriod === 'yearly' && YEARLY_PRICES[planSlug]) {
    return parseInt(YEARLY_PRICES[planSlug].replace('£', ''));
  }
  const tier = getPlanTier(planSlug);
  if (!tier) return null;
  const priceStr = tier.displayPrice.replace('£', '').replace(',', '');
  const val = parseInt(priceStr);
  return isNaN(val) ? null : val;
}

export default function BillingClient() {
  const { company, companyId, isLoading: authLoading } = useAuth();
  const { openPortal, loading: portalLoading } = useStripePortal();
  const [state, setState] = useState<{ loading: boolean; error: string | null; compData: any | null; siteCount: number; guardCount: number }>({
    loading: true, error: null, compData: null, siteCount: 0, guardCount: 0,
  });
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!companyId) { setState((s) => ({ ...s, loading: false })); return; }
    try {
      const [compRes, sitesRes, guardsRes] = await Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).maybeSingle(),
        supabase.from('sites').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('guards').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      ]);
      setState({ loading: false, error: null, compData: compRes.data, siteCount: sitesRes.count || 0, guardCount: guardsRes.count || 0 });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Failed to load billing information' }));
    }
  }, [companyId]);

  useEffect(() => { if (!authLoading) fetchData(); }, [authLoading, fetchData]);

  const displayCompany = state.compData || company;
  const planSlug = displayCompany?.subscription_plan || null;
  const planName = displayCompany?.plan_name || planSlug || null;
  const statusVal: string | null = displayCompany?.subscription_status || null;
  const billingPeriod = displayCompany?.subscription_billing || null;
  const periodEnd = displayCompany?.subscription_period_end || null;
  const cancelAt = displayCompany?.subscription_cancel_at || null;
  const trialEnds = displayCompany?.trial_ends_at || null;
  const hasStripeCustomer = !!displayCompany?.stripe_customer_id;
  const stripeRef = safeRef(displayCompany?.stripe_subscription_id);
  const hasPaymentIssue = statusVal && paymentIssueStatuses.includes(statusVal);
  const isLoading = authLoading || state.loading;
  const displayAmount = getDisplayAmount(planSlug, billingPeriod);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse" aria-busy="true">
        <div className="h-9 w-64 bg-white/5 rounded-lg mb-2" />
        <div className="h-5 w-96 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
              <div className="h-4 w-24 bg-white/5 rounded mb-3" />
              <div className="h-8 w-16 bg-white/5 rounded mb-1" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10">
          <div className="px-5 py-4 border-b border-white/8"><div className="h-5 w-40 bg-white/5 rounded" /></div>
          <div className="p-5"><div className="h-24 bg-white/5 rounded-xl" /></div>
        </div>
        <div className="sr-only" role="status" aria-live="polite">Loading billing information</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-5">
          <i className="ri-error-warning-line text-2xl text-red-400" />
        </div>
        <h1 className="text-white font-semibold text-lg mb-2">We couldn{'\u2019'}t load your billing information</h1>
        <p className="text-gray-400 text-sm max-w-sm mb-6">Please refresh the page or contact support if the problem continues.</p>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line text-sm" /></div>Retry
          </button>
          <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-customer-service-line text-sm" /></div>Contact Support
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = statusVal ? statusConfig[statusVal] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing &amp; Services</h1>
        <p className="text-gray-400 max-w-xl">View your GuardianHub services, subscription status and account details.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Services</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-400"><i className="ri-shield-check-line text-sm" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{hasStripeCustomer && (statusVal === 'active' || statusVal === 'trialing') ? 1 : 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">{hasStripeCustomer ? 'Subscription active' : 'No active services'}</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Monthly Total</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><i className="ri-money-pound-circle-line text-sm" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{formatGBP(displayAmount)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Recurring subscription</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sites</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-400"><i className="ri-building-line text-sm" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{state.siteCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active sites</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Status</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"><i className="ri-bank-card-line text-sm" /></div>
          </div>
          <p className="text-2xl font-bold text-white">
            {hasStripeCustomer && statusCfg ? (
              <span className="inline-flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />{statusCfg.label}</span>
            ) : '\u2014'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{hasStripeCustomer ? 'Current status' : 'No subscription'}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recurring Services</h2>
          {hasStripeCustomer && <span className="text-xs text-gray-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Stripe</span>}
        </div>
        {!hasStripeCustomer ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border border-white/10 mb-5">
              <i className="ri-file-list-3-line text-2xl text-gray-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No recurring services yet</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-6">You do not currently have an active GuardianHub care, automation or security plan.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line text-sm" /></div>Explore service plans
            </Link>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <SubscriptionCard
              planName={planName} planSlug={planSlug} status={statusVal}
              amount={displayAmount} billingPeriod={billingPeriod}
              periodEnd={periodEnd} cancelAt={cancelAt} trialEnds={trialEnds}
              stripeRef={stripeRef} onViewDetails={() => setDetailOpen(true)}
            />
            {hasPaymentIssue && <PaymentIssueBanner status={statusVal} onViewDetails={() => setDetailOpen(true)} />}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8"><h2 className="text-base font-semibold text-white">Support</h2></div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-gray-300 text-sm font-medium mb-1">Questions about billing?</p>
              <p className="text-gray-500 text-xs">Contact our support team for help with your subscription, invoices or payment issues.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/contact" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-customer-service-line text-sm" /></div>Contact Support
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line text-sm" /></div>Explore Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {detailOpen && hasStripeCustomer && (
        <ServiceDetailsPanel
          planName={planName} planSlug={planSlug} status={statusVal}
          amount={displayAmount} billingPeriod={billingPeriod}
          periodEnd={periodEnd} cancelAt={cancelAt} trialEnds={trialEnds}
          stripeRef={stripeRef} onClose={() => setDetailOpen(false)}
          onOpenPortal={openPortal} portalLoading={portalLoading}
        />
      )}
    </div>
  );
}

function SubscriptionCard({ planName, planSlug, status, amount, billingPeriod, periodEnd, cancelAt, trialEnds, stripeRef, onViewDetails }: {
  planName: string | null; planSlug: string | null; status: string | null; amount: number | null;
  billingPeriod: string | null; periodEnd: string | null; cancelAt: string | null;
  trialEnds: string | null; stripeRef: string | null; onViewDetails: () => void;
}) {
  const cfg = status && statusConfig[status] ? statusConfig[status] : statusConfig['canceled'];
  const periodLabel = billingPeriod === 'yearly' ? 'Annual' : 'Monthly';

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/8 p-5 hover:border-white/15 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <i className="ri-shield-star-line text-lg text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold truncate">{planName || planSlug || 'Subscription'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />{cfg.label}
              </span>
              <span className="text-xs text-gray-500">{periodLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:ml-auto shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-white">{formatGBP(amount)}</p>
            <p className="text-xs text-gray-500">{billingPeriod === 'yearly' ? '/year' : '/month'}</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/8" />
          <div className="hidden sm:block text-right text-xs">
            <p className="text-gray-500">Next billing</p>
            <p className="text-gray-300 font-medium">{formatDate(periodEnd)}</p>
            {cancelAt && <><p className="text-gray-500 mt-1">Cancels</p><p className="text-amber-400 font-medium">{formatDate(cancelAt)}</p></>}
          </div>
          <button onClick={onViewDetails} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line text-sm" /></div>Details
          </button>
        </div>
      </div>
      <div className="sm:hidden mt-4 pt-4 border-t border-white/8 grid grid-cols-2 gap-3">
        <div><p className="text-xs text-gray-500">Next billing</p><p className="text-sm text-gray-300 font-medium">{formatDate(periodEnd)}</p></div>
        {cancelAt && <div><p className="text-xs text-gray-500">Cancels</p><p className="text-sm text-amber-400 font-medium">{formatDate(cancelAt)}</p></div>}
        {trialEnds && <div><p className="text-xs text-gray-500">Trial ends</p><p className="text-sm text-blue-400 font-medium">{formatDate(trialEnds)}</p></div>}
        <div><p className="text-xs text-gray-500">Provider</p><p className="text-sm text-gray-300 font-medium">Stripe</p></div>
      </div>
    </div>
  );
}

function PaymentIssueBanner({ status, onViewDetails }: { status: string | null; onViewDetails: () => void }) {
  const cfg = status && statusConfig[status] ? statusConfig[status] : null;
  return (
    <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/20 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
          <i className="ri-error-warning-line text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-amber-400 font-semibold text-sm mb-1">Action may be required</h4>
          <p className="text-amber-400/70 text-xs mb-4">
            There is a problem with this service{'\u2019'}s payment or setup{cfg ? ` (${cfg.label})` : ''}. Contact us for help restoring the service.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-customer-service-line text-xs" /></div>Contact support
            </Link>
            <button onClick={onViewDetails} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-right-s-line text-xs" /></div>View service details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceDetailsPanel({ planName, planSlug, status, amount, billingPeriod, periodEnd, cancelAt, trialEnds, stripeRef, onClose, onOpenPortal, portalLoading }: {
  planName: string | null; planSlug: string | null; status: string | null; amount: number | null;
  billingPeriod: string | null; periodEnd: string | null; cancelAt: string | null;
  trialEnds: string | null; stripeRef: string | null; onClose: () => void;
  onOpenPortal: () => Promise<void>; portalLoading: boolean;
}) {
  const cfg = status && statusConfig[status] ? statusConfig[status] : statusConfig['canceled'];
  const periodLabel = billingPeriod === 'yearly' ? 'Annual' : 'Monthly';
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Service details"
      >
        <div className="bg-[#0f172a] rounded-2xl border border-white/10 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-[#0f172a] px-5 py-4 border-b border-white/8 flex items-center justify-between rounded-t-2xl z-10">
            <h3 className="text-base font-semibold text-white">Service Details</h3>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
              aria-label="Close details"
            >
              <i className="ri-close-line" />
            </button>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <i className="ri-shield-star-line text-xl text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">{planName || planSlug || 'Subscription'}</h4>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeClass}`} role="status" aria-label={`Status: ${cfg.label}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} aria-hidden="true" />{cfg.label}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <p className="text-xs text-gray-500 mb-1">Monthly Price</p>
                <p className="text-white font-semibold">{formatGBP(amount)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <p className="text-xs text-gray-500 mb-1">Billing Cycle</p>
                <p className="text-white font-semibold">{periodLabel}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <p className="text-xs text-gray-500 mb-1">Next Billing</p>
                <p className="text-white font-semibold">{formatDate(periodEnd)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <p className="text-xs text-gray-500 mb-1">Currency</p>
                <p className="text-white font-semibold">GBP</p>
              </div>
            </div>
            {(cancelAt || trialEnds) && (
              <div className="grid grid-cols-2 gap-4">
                {trialEnds && (
                  <div className="rounded-lg bg-blue-500/[0.05] border border-blue-500/20 p-3">
                    <p className="text-xs text-blue-400/70 mb-1">Trial Ends</p>
                    <p className="text-blue-400 font-semibold">{formatDate(trialEnds)}</p>
                  </div>
                )}
                {cancelAt && (
                  <div className="rounded-lg bg-amber-500/[0.05] border border-amber-500/20 p-3">
                    <p className="text-xs text-amber-400/70 mb-1">Cancellation Date</p>
                    <p className="text-amber-400 font-semibold">{formatDate(cancelAt)}</p>
                  </div>
                )}
              </div>
            )}
            <div className="rounded-lg bg-white/[0.03] border border-white/8 p-4">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Support</h5>
              <p className="text-gray-400 text-xs mb-3">For billing questions, plan changes, or payment issues, our support team is available to help.</p>
              <div className="flex items-center gap-3">
                <Link href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-customer-service-line text-xs" /></div>Contact Support
                </Link>
              </div>
            </div>
            {stripeRef && <p className="text-center text-gray-600 text-[10px]" aria-label="Reference">Ref: {stripeRef}</p>}
          </div>
        </div>
      </div>
    </>
  );
}