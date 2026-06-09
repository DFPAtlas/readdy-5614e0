'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useMyPermissions } from '@/lib/usePermissions';

export default function PermissionGuard({
  userId,
  companyId,
  permission,
  requiredLevel = 'view',
  children,
  fallback,
}: {
  userId: string | null;
  companyId: string | null;
  permission: string;
  requiredLevel?: 'view' | 'create' | 'edit' | 'approve' | 'delete' | 'manage';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, loading } = useMyPermissions(userId, companyId);

  if (loading) {
    return <div className="w-4 h-4 flex items-center justify-center"><i className="ri-loader-4-line animate-spin text-gray-500 text-xs"></i></div>;
  }

  if (!can(permission, requiredLevel)) {
    return fallback || null;
  }

  return <>{children}</>;
}