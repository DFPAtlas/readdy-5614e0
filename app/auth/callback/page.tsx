'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type UserRole = 'super_admin' | 'company_admin' | 'operations_manager' | 'guard' | 'client' | string;

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed. Please try again.');
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`);
          }, 2000);
          return;
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus('error');
            setMessage('This sign-in link has expired or already been used. Please request a new one.');
            setTimeout(() => {
              router.push('/login?error=code_expired');
            }, 2500);
            return;
          }
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setStatus('error');
          setMessage('Unable to verify your session. Please sign in again.');
          setTimeout(() => {
            router.push('/login?error=session_not_found');
          }, 2000);
          return;
        }

        const userId = session.user.id;
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (userError || !userData) {
          setStatus('error');
          setMessage('Unable to load your profile. Please sign in again.');
          setTimeout(() => {
            router.push('/login?error=profile_not_found');
          }, 2000);
          return;
        }

        const role = userData.role as UserRole;

        switch (role) {
          case 'super_admin':
            router.replace('/admin');
            break;
          case 'company_admin':
          case 'operations_manager':
          case 'manager':
          case 'client_admin':
          case 'account_holder':
            router.replace('/dashboard');
            break;
          case 'guard':
          case 'officer':
            router.replace('/guard');
            break;
          case 'client':
            router.replace('/client');
            break;
          default:
            router.replace('/dashboard');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Something went wrong. Please sign in again.');
        setTimeout(() => {
          router.push('/login?error=unknown');
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-white mb-2">Signing you in...</h1>
            <p className="text-sm text-gray-400">Please wait while we verify your account</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-error-warning-line text-red-400 text-xl"></i>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Sign-in failed</h1>
            <p className="text-sm text-gray-400">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
}