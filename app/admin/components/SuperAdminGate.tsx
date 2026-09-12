'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { checkAccountAccess } from '@/lib/accountStatus';
import { supabase } from '@/lib/supabase';

export default function SuperAdminGate({ children, requiredPermission, requiredLevel }: {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredLevel?: string;
}) {
  const { profile, isLoading, company } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    if (isLoading) return;

    if (!profile) {
      router.replace('/login');
      return;
    }

    const accountCheck = checkAccountAccess(profile.status, company?.account_status);
    if (!accountCheck.allowed) {
      router.replace(accountCheck.redirectTo || '/login');
      return;
    }

    const verifyPlatformAccess = async () => {
      const { data: assignments } = await supabase
        .from('platform_role_assignments')
        .select('id, platform_role_id, is_active, expires_at, mfa_verified_at, platform_role:platform_roles(slug, name)')
        .eq('user_id', profile.id)
        .eq('is_active', true);

      const active = (assignments || []).filter((a: any) => {
        if (!a.is_active) return false;
        if (a.expires_at && new Date(a.expires_at) < new Date()) return false;
        return true;
      });

      if (active.length === 0) {
        const legacyCheck = profile.role === 'super_admin';
        if (legacyCheck) {
          setAuthorized(true);
          setChecked(true);
          return;
        }
        setDenialReason('No active platform role assigned');
        setChecked(true);
        return;
      }

      if (requiredPermission) {
        const roleIds = active.map((a: any) => a.platform_role_id);
        const { data: perms } = await supabase
          .from('platform_role_permissions')
          .select('permission_key, level')
          .in('platform_role_id', roleIds);

        const levels: Record<string, number> = { no_access: 0, view: 1, create: 2, edit: 3, approve: 4, delete: 5, manage: 6 };
        let highest = 0;
        (perms || []).forEach((p: any) => {
          if (p.permission_key === requiredPermission) {
            const lvl = levels[p.level] || 0;
            if (lvl > highest) highest = lvl;
          }
        });

        const required = levels[requiredLevel || 'view'] || 1;
        if (highest < required) {
          setDenialReason(`Insufficient permission: ${requiredPermission}`);
          setChecked(true);
          return;
        }
      }

      setAuthorized(true);
      setChecked(true);
    };

    verifyPlatformAccess();
  }, [profile, isLoading, router, company, requiredPermission, requiredLevel]);

  if (isLoading || !checked) {
    return (
      <div className="min-h-screen bg-[#0B0F1E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-indigo-500"></span>
          </div>
          <p className="text-xs text-gray-500">Verifying platform access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0B0F1E] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-400">
            <i className="ri-lock-line text-3xl"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Platform Access Denied</h2>
          <p className="text-sm text-gray-400">{denialReason || 'Platform authorization required.'}</p>
          <p className="text-xs text-gray-500 mt-2">If you believe this is an error, contact a Platform Owner.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}