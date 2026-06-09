'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export type UserRole = 'super_admin' | 'company_admin' | 'operations_manager' | 'guard' | 'client';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/platform',
  '/solutions',
  '/pricing',
  '/contact',
  '/demo',
  '/terms',
  '/privacy',
  '/gdpr',
  '/cookies',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/ops/login',
  '/ops/signup',
  '/setup-super-admin',
  '/dashboard/setup',
  '/auth/callback',
];

const GUARD_ROUTES = ['/guard'];
const CLIENT_ROUTES = ['/client'];

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
  const redirectRef = useRef(false);

  const isPublicRoute = (path: string) => {
    return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + '/'));
  };

  const getHomeRoute = (userRole: UserRole | null, onboardingStatus?: string | null) => {
    if (!userRole) return '/login';
    if (userRole === 'super_admin') return '/admin';
    if (['company_admin', 'operations_manager'].includes(userRole)) {
      if (onboardingStatus === 'pending_setup') return '/dashboard/setup';
      return '/dashboard';
    }
    if (userRole === 'guard') return '/guard';
    if (userRole === 'client') return '/client';
    return '/dashboard';
  };

  const canAccessRoute = (userRole: UserRole | null, path: string) => {
    if (!userRole) return false;
    if (path.startsWith('/admin') && userRole !== 'super_admin') return false;
    if (path.startsWith('/super-admin') && userRole !== 'super_admin') return false;
    if (userRole === 'super_admin') {
      return path.startsWith('/admin') || path.startsWith('/super-admin') || !path.startsWith('/admin');
    }
    if (['company_admin', 'operations_manager'].includes(userRole)) {
      return true;
    }
    if (userRole === 'guard') {
      return GUARD_ROUTES.some((r) => path === r || path.startsWith(r + '/')) || isPublicRoute(path);
    }
    if (userRole === 'client') {
      return CLIENT_ROUTES.some((r) => path === r || path.startsWith(r + '/')) || isPublicRoute(path);
    }
    return isPublicRoute(path);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: sess } } = await supabase.auth.getSession();
        setSession(sess);
        if (sess?.user) {
          await loadUserProfile(sess.user.id);
        }
      } catch (err: any) {
        console.error('[Auth] initAuth error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        loadUserProfile(sess.user.id);
      } else {
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
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (redirectRef.current) return;
    if (!currentUser && !isPublicRoute(pathname)) {
      redirectRef.current = true;
      router.push('/login');
      return;
    }
    if (currentUser && profile && !canAccessRoute(profile.role, pathname)) {
      const home = getHomeRoute(profile.role, company?.onboarding_status);
      redirectRef.current = true;
      router.push(home);
    }
  }, [currentUser, profile, isLoading, pathname, company]);

  const loadUserProfile = async (userId: string) => {
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
      console.error('[Auth] loadUserProfile error:', err);
      setProfile(null);
      setCompany(null);
      setCompanyId(null);
      setRole(null);
      setCurrentUser(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
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
    } catch (networkErr: any) {
      console.error('[Signup] Network/parse error:', networkErr);
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

    if (!rawResponse?.ok || result.error) {
      console.error('[Signup] Edge function error:', result.error, result.code);
      return { error: new Error(result.error || 'Profile setup failed. Please contact support.') };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error('[Signup] Auto-login error:', signInError.message);
      return { error: signInError };
    }

    const { data: userData } = await supabase.from('users').select('*').eq('id', result.userId).maybeSingle();
    if (!userData) {
      console.error('[Signup] public.users insert failed — no profile row found after signup. UserId:', result.userId);
      await supabase.auth.signOut();
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

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
    } catch (networkErr: any) {
      console.error('[Client Signup] Network/parse error:', networkErr);
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

    if (!rawResponse?.ok || result.error) {
      console.error('[Client Signup] Edge function error:', result.error, result.code);
      return { error: new Error(result.error || 'Profile setup failed. Please contact support.') };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error('[Client Signup] Auto-login error:', signInError.message);
      return { error: signInError };
    }

    const { data: userData } = await supabase.from('users').select('*').eq('id', result.userId).maybeSingle();
    if (!userData) {
      console.error('[Client Signup] public.users insert failed — no profile row found after signup. UserId:', result.userId);
      await supabase.auth.signOut();
      return { error: new Error('Profile setup failed. Please contact support.') };
    }

    return { error: null };
  };

  const signOut = async () => {
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