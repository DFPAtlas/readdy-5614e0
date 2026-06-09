'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function GuardLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, currentUser, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (currentUser && profile) {
      if (profile.role === 'guard') {
        router.replace('/guard');
      } else if (['super_admin', 'company_admin', 'operations_manager'].includes(profile.role || '')) {
        router.replace('/dashboard');
      } else if (profile.role === 'client') {
        router.replace('/client');
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

  if (authLoading || (currentUser && profile)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-5 py-8">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="mb-8">
          <div className="w-14 h-14 bg-[#3b82f6] rounded-2xl flex items-center justify-center mb-5">
            <div className="w-7 h-7 flex items-center justify-center">
              <i className="ri-shield-check-line text-white text-2xl"></i>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Guard Portal</h1>
          <p className="text-base text-gray-400">Sign in to your shift</p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-error-warning-line"></i>
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoCapitalize="off"
              className="w-full h-14 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-14 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
              placeholder="Your password"
            />
            <div className="mt-2 flex justify-end">
              <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-50 text-white text-lg font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <i className="ri-loader-4-line animate-spin text-xl"></i>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      <div className="text-center pb-4">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
          Sign in as operations staff
        </Link>
      </div>
    </div>
  );
}