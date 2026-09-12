'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getRoleHome, getOnboardingRoute, resolveRedirect } from '@/lib/redirect';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [magicSent, setMagicSent] = useState(false);
  const { signIn, currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (authLoading) return;
    if (currentUser && profile) {
      const onboardingRoute = getOnboardingRoute(profile.role, company?.onboarding_status);
      router.replace(onboardingRoute || getRoleHome(profile.role));
    }
  }, [currentUser, profile, company, authLoading, router]);

  useEffect(() => {
    const reason = searchParams?.get('reason');
    if (reason === 'suspended') {
      setError('Your account has been suspended. Please contact your administrator.');
    } else if (reason === 'removed') {
      setError('Your account has been removed.');
    } else if (reason === 'company_suspended') {
      setError('Your company account has been suspended.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError('Invalid email or password');
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setMagicSent(true);
    }
    setIsSubmitting(false);
  };

  const nextParam = searchParams?.get('next') || undefined;
  const safeNext = currentUser && profile ? resolveRedirect(nextParam, profile.role) : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (currentUser && profile) return null;

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.12),_transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.08),_transparent_60%)]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer flex items-center gap-1">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line"></i>
            </div>
            Back to home
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-shield-check-line text-white text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-pacifico)' }}>
            GuardianHub
          </h1>
          <p className="text-gray-400 text-sm">Sign in to your operations account</p>
        </div>

        <div className="bg-[#111827]/80 border border-gray-800/60 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-error-warning-line"></i>
              </div>
              {error}
            </div>
          )}

          {magicSent && mode === 'magic' && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-mail-send-line"></i>
              </div>
              Magic link sent to {email}. Check your inbox and click the link to sign in.
            </div>
          )}

          {mode === 'password' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-lg shadow-blue-600/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('magic'); setError(''); setMagicSent(false); }}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Or sign in with magic link
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || magicSent}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-lg shadow-blue-600/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </span>
                ) : magicSent ? (
                  'Link sent'
                ) : (
                  'Send magic link'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('password'); setError(''); setMagicSent(false); }}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Back to password sign-in
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-gray-800 flex flex-col gap-2 text-center">
            <Link href="/login/guard" className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
              Sign in as guard
            </Link>
            <Link href="/login/client" className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
              Sign in as client
            </Link>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-800 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/ops/signup" className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
              Sign up
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Secure, encrypted connection. By signing in you agree to our{' '}
          <Link href="/terms" className="text-gray-500 hover:text-gray-400 underline cursor-pointer">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-500 hover:text-gray-400 underline cursor-pointer">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}