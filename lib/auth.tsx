'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getRoleHome, getOnboardingRoute } from '@/lib/redirect';
import { checkAccountAccess } from '@/lib/accountStatus';
import type { UserRole } from '@/lib/types';

export type { UserRole };

interface Profile {
  id: string;
  company_id: string | null;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  subscription_plan: string | null;
  plan_name: string | null;
  subscription_status: string | null;
  subscription_billing: string | null;
  subscription_period_end: string | null;
  subscription_cancel_at: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  account_status: string | null;
  onboarding_status: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface AuthContextType {
  currentUser: any | null;
  profile: Profile | null;
  company: Company | null;
  companyId: string | null;
  role: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, companyName: string, phone?: string, companySize?: string) => Promise<{ error: any }>;
  signUpClient: (email: string, password: string, firstName: string, lastName: string, companyName: string, phone?: string, companySize?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  user: any | null;
  session: any | null;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isPublicRoute(path: string | null): boolean {
  if (!path) return false;
  const routes = [
    '/', '/about', '/platform', '/solutions', '/pricing', '/contact',
    '/demo', '/terms', '/privacy', '/gdpr', '/cookies',
    '/login', '/signup', '/forgot-password', '/reset-password', '/recovery',
    '/ops/login', '/ops/signup', '/setup-super-admin', '/auth/callback',
  ];
  return routes.some((r) => path === r || path.startsWith(r + '/'));
}

export { isPublicRoute };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const initializedRef = useRef(false);
  const profileLoadingRef = useRef(false);
  const redirectingRef = useRef(false);
  const lastPathnameRef = useRef<string | null>(null);

  const loadUserProfile = useCallback(async (userId: string) => {
    if (profileLoadingRef.current) return;
    profileLoadingRef.current = true;
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      let enrichedUser = null;

      if (userData) {
        const p: Profile = userData as Profile;
        setProfile(p);
        setCompanyId(p.company_id);
        setRole(p.role as UserRole);

        enrichedUser = { ...p };
        if (p.company_id) {
          const { data: companyData } = await supabase.from('companies').select('*').eq('id', p.company_id).maybeSingle();
          if (companyData) {
            setCompany(companyData as Company);
            enrichedUser = { ...enrichedUser, company_name: companyData.name, company: companyData };
          }
        }
      } else {
        setProfile(null);
        setCompanyId(null);
        setRole(null);
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      setCurrentUser(authUser);
      setUser(enrichedUser);
    } catch (err: any) {
      setProfile(null);
      setCompany(null);
      setCompanyId(null);
      setRole(null);
      setCurrentUser(null);
      setUser(null);
    } finally {
      profileLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      try {
        const { data: { session: sess } } = await supabase.auth.getSession();
        setSession(sess);
        if (sess?.user) {
          await loadUserProfile(sess.user.id);
        } else {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        await loadUserProfile(sess.user.id);
      } else {
        profileLoadingRef.current = false;
        setCurrentUser(null);
        setUser(null);
        setProfile(null);
        setCompany(null);
        setCompanyId(null);
        setRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  useEffect(() => {
    if (isLoading) return;

    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      redirectingRef.current = false;
    }

    if (redirectingRef.current) return;

    const currentPath = pathname;

    if (!currentUser || !profile) {
      if (!isPublicRoute(currentPath)) {
        redirectingRef.current = true;
        router.replace('/login');
      }
      return;
    }

    const accountCheck = checkAccountAccess(profile.status, company?.account_status);
    if (!accountCheck.allowed) {
      redirectingRef.current = true;
      signOut().catch(() => {});
      return;
    }

    const homeRoute = getRoleHome(profile.role);
    const onboardingRoute = getOnboardingRoute(profile.role, company?.onboarding_status);

    if (isPublicRoute(currentPath)) {
      if (currentPath.startsWith('/login') || currentPath.startsWith('/ops/login')) {
        if (onboardingRoute) {
          redirectingRef.current = true;
          router.replace(onboardingRoute);
        } else {
          redirectingRef.current = true;
          router.replace(homeRoute);
        }
      }
      return;
    }

    if (profile.role === 'super_admin' && !currentPath.startsWith('/admin') && !currentPath.startsWith('/super-admin')) {
      redirectingRef.current = true;
      router.replace('/admin');
      return;
    }

    if (['company_admin', 'operations_manager'].includes(profile.role)) {
      if (onboardingRoute && !currentPath.startsWith('/dashboard/setup-wizard') && currentPath !== '/pricing' && currentPath !== '/checkout/success' && currentPath !== '/checkout/cancel') {
        redirectingRef.current = true;
        router.replace(onboardingRoute);
        return;
      }
      if ((currentPath === '/guard' || currentPath.startsWith('/guard/'))) {
        redirectingRef.current = true;
        router.replace(homeRoute);
        return;
      }
      if (currentPath.startsWith('/client') && !currentPath.startsWith('/client/signup')) {
        redirectingRef.current = true;
        router.replace(homeRoute);
        return;
      }
    }

    if (profile.role === 'guard') {
      if (!(currentPath === '/guard' || currentPath.startsWith('/guard/')) && !isPublicRoute(currentPath)) {
        redirectingRef.current = true;
        router.replace('/guard');
      }
    }

    if (profile.role === 'client') {
      if (!currentPath.startsWith('/client') && !isPublicRoute(currentPath)) {
        redirectingRef.current = true;
        router.replace('/client');
      }
    }
  }, [currentUser, profile, isLoading, pathname, company, router]);

  const refreshCompany = async () => {
    if (!profile?.company_id) return;
    const { data: companyData } = await supabase.from('companies').select('*').eq('id', profile.company_id).maybeSingle();
    if (companyData) {
      setCompany(companyData as Company);
    }
  };

  const signIn = async (email: string, password: string) => {
    redirectingRef.current = false;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    if (data?.user) {
      const { data: userData } = await supabase.from('users').select('id, role, status').eq('id', data.user.id).maybeSingle();

      if (!userData) {
        await supabase.auth.signOut();
        return { error: new Error('Account not found. Please contact support.') };
      }

      if (userData.status === 'suspended' || userData.status === 'removed') {
        await supabase.auth.signOut();
        return { error: new Error('Your account is not active. Please contact your administrator.') };
      }
    }

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyName: string,
    phone?: string,
    companySize?: string
  ) => {
    let rawResponse: Response | null = null;
    let result: any = {};
    try {
      rawResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ops-signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            companyName,
            phone,
            companySize,
            type: 'ops',
          }),
        }
      );
      result = await rawResponse.json();
    } catch {
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

    if (!rawResponse?.ok || result.error) {
      return { error: new Error(result.error || 'Profile setup failed. Please contact support.') };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return { error: signInError };
    }

    const { data: userData } = await supabase.from('users').select('*').eq('id', result.userId).maybeSingle();
    if (!userData) {
      await supabase.auth.signOut();
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

    redirectingRef.current = false;
    return { error: null };
  };

  const signUpClient = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyName: string,
    phone?: string,
    companySize?: string
  ) => {
    let rawResponse: Response | null = null;
    let result: any = {};
    try {
      rawResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ops-signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            companyName,
            phone,
            companySize,
            type: 'client',
          }),
        }
      );
      result = await rawResponse.json();
    } catch {
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

    if (!rawResponse?.ok || result.error) {
      return { error: new Error(result.error || 'Profile setup failed. Please contact support.') };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return { error: signInError };
    }

    const { data: userData } = await supabase.from('users').select('*').eq('id', result.userId).maybeSingle();
    if (!userData) {
      await supabase.auth.signOut();
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

    redirectingRef.current = false;
    return { error: null };
  };

  const signOut = async () => {
    redirectingRef.current = true;
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUser(null);
    setProfile(null);
    setCompany(null);
    setCompanyId(null);
    setRole(null);
    setSession(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        company,
        companyId,
        role,
        isLoading,
        signIn,
        signUp,
        signUpClient,
        signOut,
        user,
        session,
        refreshCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}