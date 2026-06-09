'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function OpsLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoStatus, setDemoStatus] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message || 'Invalid email or password');
      setIsLoading(false);
    } else {
      router.push('/ops');
    }
  };

  const handleDemoAccess = async () => {
    setDemoLoading(true);
    setError('');
    setDemoStatus('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-demo-admin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) {
        setError(result.error || 'Failed to create demo account');
        setDemoLoading(false);
        return;
      }
      const { error: signInError } = await signIn(result.email, result.password);
      if (signInError) {
        setError('Demo account created but auto-login failed.');
        setEmail(result.email);
        setPassword(result.password);
        setDemoLoading(false);
        return;
      }
      setDemoStatus('Welcome, Super Admin! Redirecting...');
    } catch {
      setError('Network error. Please try again.');
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-check-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-pacifico)' }}>
            GuardianHub
          </h1>
          <p className="text-gray-400 text-sm">Operations Dashboard</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sign In</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {demoStatus && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-check-line"></i>
              </div>
              {demoStatus}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Enter your password" />
            </div>
            <button type="submit" disabled={isLoading || demoLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/ops/signup" className="text-blue-400 hover:text-blue-300 cursor-pointer">Sign up</Link>
          </div>
        </div>

        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-vip-crown-line text-amber-400 text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300 mb-1">Try the Super Admin Dashboard</p>
              <p className="text-xs text-amber-200/70 mb-3 leading-relaxed">
                Instantly create a demo super admin account and access the full admin area.
              </p>
              <button
                onClick={handleDemoAccess}
                disabled={demoLoading || isLoading}
                className="w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-sm font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                {demoLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-300"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    <i className="ri-flashlight-line"></i>
                    Access Demo Admin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}