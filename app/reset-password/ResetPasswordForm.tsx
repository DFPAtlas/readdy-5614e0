'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifySession = async () => {
      const code = searchParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          setValidSession(true);
          setVerifying(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setValidSession(true);
      }
      setVerifying(false);
    };

    verifySession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    }
  };

  if (verifying) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-sm text-gray-400">Verifying your session...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-error-warning-line text-red-400 text-xl"></i>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Invalid or expired link</h2>
        <p className="text-sm text-gray-400 mb-4">
          This password reset link is no longer valid. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-check-line text-emerald-400 text-xl"></i>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Password updated</h2>
        <p className="text-sm text-gray-400 mb-4">
          Your password has been changed successfully. Redirecting you to sign in...
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-white mb-1">Set new password</h2>
      <p className="text-sm text-gray-400 mb-4">
        Create a strong password for your GuardianHub account.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-error-warning-line"></i>
          </div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Min 6 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Re-enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-lg shadow-blue-600/20"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </span>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </>
  );
}