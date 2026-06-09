'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, currentUser, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (currentUser && profile) {
      if (profile.role === 'client') {
        router.replace('/client');
      } else if (['super_admin', 'company_admin', 'operations_manager'].includes(profile.role || '')) {
        router.replace('/ops');
      } else if (profile.role === 'guard') {
        router.replace('/guard');
      }
    }
  }, [currentUser, profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (currentUser && profile) return null;

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-check-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-pacifico)' }}>
            Client Portal
          </h1>
          <p className="text-gray-400 text-sm">Sign in to view your security services</p>
        </div>

        <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <i className="ri-error-warning-line mt-0.5"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/client/signup" className="text-blue-400 hover:text-blue-300 cursor-pointer">
              Sign up
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 cursor-pointer">
              Sign in as operations staff
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Secure, encrypted connection. By signing in you agree to our{' '}
          <Link href="/terms" className="text-gray-400 hover:text-gray-300 underline cursor-pointer">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-400 hover:text-gray-300 underline cursor-pointer">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}