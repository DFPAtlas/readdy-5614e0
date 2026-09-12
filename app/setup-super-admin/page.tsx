'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SetupSuperAdminPage() {
  const router = useRouter();
  const [step, setStep] = useState<'checking' | 'ready' | 'done' | 'disabled'>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role === 'super_admin') {
          setStep('ready');
          return;
        }
      }

      const { error: rpcError } = await supabase.rpc('is_super_admin_exists');
      if (rpcError) {
        setStep('ready');
        return;
      }

      setStep('ready');
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (!setupSecret.trim()) {
      setError('Setup secret is required');
      return;
    }

    setIsSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-demo-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            email,
            password,
            first_name: 'Platform',
            last_name: 'Owner',
            secret: setupSecret,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        setError(result.error || 'Setup failed. Please check your secret and try again.');
        setIsSubmitting(false);
        return;
      }

      setStep('done');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (step === 'checking') {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (step === 'disabled') {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-gray-500/10 border border-gray-500/20 rounded-xl flex items-center justify-center mx-auto mb-5">
            <i className="ri-lock-line text-gray-400 text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Setup Unavailable</h1>
          <p className="text-sm text-gray-400">
            This page is not available.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-5">
            <i className="ri-check-line text-emerald-400 text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Super Admin Created</h1>
          <p className="text-sm text-gray-400 mb-2">
            The account is ready.
          </p>
          <p className="text-xs text-gray-500">
            Redirecting to login in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-star-line text-white text-2xl"></i>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Super Admin Setup</h1>
          <p className="text-sm text-gray-400">
            Create your super admin account to manage GuardianHub.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@guardianhub.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Password <span className="text-gray-500 font-normal">(min 12 chars)</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Setup Secret <span className="text-amber-400">*</span>
            </label>
            <input
              type="password"
              required
              value={setupSecret}
              onChange={(e) => setSetupSecret(e.target.value)}
              placeholder="Your ADMIN_SETUP_SECRET"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              This is the secret configured in your Supabase Edge Function secrets.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                <i className="ri-error-warning-line"></i>
              </div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                Creating...
              </span>
            ) : (
              'Create Super Admin Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}