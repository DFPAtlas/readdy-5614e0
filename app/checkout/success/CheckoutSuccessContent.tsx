'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { clearEntitlementsCache } from '../../../lib/entitlements';

interface CompanyData {
  name: string | null;
  subscription_plan: string | null;
  plan_name: string | null;
  subscription_status: string | null;
  subscription_billing: string | null;
  subscription_period_end: string | null;
  trial_ends_at: string | null;
  account_status: string | null;
}

const POLL_INTERVAL = 2000;
const POLL_MAX_ATTEMPTS = 15;

function useCompanyStatus() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user) {
        setCompany(null);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!userData?.company_id) {
        setCompany(null);
        setLoading(false);
        return;
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('name, subscription_plan, plan_name, subscription_status, subscription_billing, subscription_period_end, trial_ends_at, account_status')
        .eq('id', userData.company_id)
        .maybeSingle();

      setCompany(companyData as CompanyData | null);
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const status = company?.subscription_status;
    const isReady = status === 'active' || status === 'trialing';

    if (isReady || pollCount >= POLL_MAX_ATTEMPTS) return;

    timerRef.current = setTimeout(() => {
      setPollCount((c) => c + 1);
      fetchStatus();
    }, POLL_INTERVAL);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [company?.subscription_status, pollCount]);

  const status = company?.subscription_status;
  const isReady = status === 'active' || status === 'trialing';

  return { company, loading, isReady, refetch: fetchStatus, pollCount };
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CheckoutSuccessContent() {
  const { company, loading, isReady, refetch, pollCount } = useCompanyStatus();
  const { refreshCompany } = useAuth();
  const refreshedRef = useRef(false);

  useEffect(() => {
    if (isReady && !refreshedRef.current) {
      refreshedRef.current = true;
      clearEntitlementsCache();
      refreshCompany();
    }
  }, [isReady, refreshCompany]);

  const status = company?.subscription_status;
  const showFinalising = !loading && status !== null && !isReady;
  const showActive = !loading && isReady;
  const showUnknown = loading || status === null;
  const pollingActive = showFinalising && pollCount < POLL_MAX_ATTEMPTS;

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mx-auto mb-6">
              <i className="ri-check-line text-4xl text-green-400" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">
              Checkout received
            </h1>

            <p className="text-gray-400 mb-2 leading-relaxed max-w-sm mx-auto">
              Stripe has returned your checkout to GuardianHub. We are confirming the subscription and your Billing &amp; Services page will update once confirmation is complete.
            </p>
          </div>

          <div className="mb-8 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Confirmation Status
              </span>
              {isReady && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/15 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                  <i className="ri-check-double-line" />
                  Confirmed
                </span>
              )}
              {showFinalising && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
                  <i className="ri-time-line" />
                  {pollingActive ? 'Confirmation in progress' : status || 'Waiting'}
                </span>
              )}
              {showUnknown && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-gray-500 text-xs font-semibold rounded-full border border-white/10">
                  <i className="ri-loader-4-line animate-spin" />
                  Checking...
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              {showUnknown && (
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-4">
                  <i className="ri-loader-4-line animate-spin" />
                  Checking account status…
                </div>
              )}

              {showFinalising && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-amber-400 text-sm">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                      <i className="ri-time-line" />
                    </span>
                    <div>
                      <p className="font-medium">
                        {pollingActive ? 'Activating your plan…' : 'Finalising setup…'}
                      </p>
                      <p className="text-amber-500/70 text-xs">
                        {pollingActive
                          ? `Checking ${pollCount + 1} of ${POLL_MAX_ATTEMPTS}`
                          : `Current status: ${status || 'unknown'}`}
                      </p>
                    </div>
                  </div>

                  {pollingActive && (
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-500/40 rounded-full transition-all duration-500"
                        style={{ width: `${((pollCount + 1) / POLL_MAX_ATTEMPTS) * 100}%` }}
                      />
                    </div>
                  )}

                  {!pollingActive && (
                    <button
                      onClick={refetch}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refresh-line" />
                      Refresh status
                    </button>
                  )}
                </div>
              )}

              {showActive && (
                <div className="space-y-3">
                  {company?.plan_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Plan</span>
                      <span className="text-white font-medium">{company.plan_name}</span>
                    </div>
                  )}
                  {company?.subscription_plan && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Tier</span>
                      <span className="text-white font-medium capitalize">{company.subscription_plan}</span>
                    </div>
                  )}
                  {company?.subscription_billing && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Billing</span>
                      <span className="text-white font-medium capitalize">{company.subscription_billing}</span>
                    </div>
                  )}
                  {company?.subscription_period_end && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Next renewal</span>
                      <span className="text-white font-medium">{formatDate(company.subscription_period_end)}</span>
                    </div>
                  )}
                  {company?.trial_ends_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Trial ends</span>
                      <span className="text-white font-medium">{formatDate(company.trial_ends_at)}</span>
                    </div>
                  )}
                  {company?.account_status && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Account</span>
                      <span className="text-white font-medium capitalize">{company.account_status}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {company?.name && (
            <p className="text-center text-gray-500 text-sm mb-6">
              {company.name} is ready to go.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href="/client/billing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <i className="ri-bank-card-line text-sm" />
              </span>
              Open Billing &amp; Services
            </Link>
            <Link
              href="/dashboard"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors cursor-pointer whitespace-nowrap ${!isReady ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <i className="ri-dashboard-line text-sm" />
              </span>
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}