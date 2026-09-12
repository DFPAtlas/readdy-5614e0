'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../../lib/supabase';

export default function CheckoutCancelPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setChecking(false);
    };
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-6">
            <i className="ri-close-line text-4xl text-amber-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Checkout cancelled
          </h1>

          <p className="text-gray-400 mb-2 leading-relaxed">
            No subscription was started through this checkout. You can return to the service plans whenever you{'\u2019'}re ready.
          </p>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            No payment was taken and your account has not been charged.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-left-line text-sm" />
              </span>
              Return to service plans
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <i className="ri-customer-service-line text-sm" />
              </span>
              Contact GuardianHub
            </Link>

            {checking ? (
              <div className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-gray-500 font-medium rounded-xl border border-white/10 cursor-default whitespace-nowrap">
                <i className="ri-loader-4-line animate-spin text-sm" />
                Checking session…
              </div>
            ) : isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-dashboard-line text-sm" />
                </span>
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-login-circle-line text-sm" />
                </span>
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}