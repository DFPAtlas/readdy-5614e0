'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [magicSent, setMagicSent] = useState(false);
  const { signIn, currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setMagicSent(false);
      setMode('password');
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (authLoading) return;
    if (currentUser && profile) {
      onClose();
      const role = profile.role;
      const onboardingStatus = company?.onboarding_status;
      if (role === 'super_admin') {
        router.replace('/admin');
      } else if (role === 'company_admin' || role === 'operations_manager') {
        if (onboardingStatus && onboardingStatus !== 'completed') {
          router.replace('/dashboard/setup-wizard');
        } else {
          router.replace('/dashboard');
        }
      } else if (role === 'guard') {
        router.replace('/guard');
      } else if (role === 'client') {
        router.replace('/client');
      }
    }
  }, [currentUser, profile, company, authLoading, router, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://guardin-hub.uk/auth/callback',
      },
    });
    if (otpError) {
      setError(otpError.message);
    } else {
      setMagicSent(true);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#111827]/95 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-shield-check-line text-white text-xl"></i>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sign In</h2>
                <p className="text-xs text-gray-500">GuardianHub Operations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

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
              Magic link sent to {email}. Check your inbox.
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
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  Remember me
                </label>
                <Link href="/forgot-password" onClick={onClose} className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
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
                disabled={isLoading || magicSent}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
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
            <Link href="/login/guard" onClick={onClose} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
              Sign in as guard
            </Link>
            <Link href="/login/client" onClick={onClose} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
              Sign in as client
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/ops/signup" onClick={onClose} className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}