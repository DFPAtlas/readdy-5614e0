'use client';

import { useAuth } from '@/lib/auth';

export function useCompanyContext() {
  const { profile, companyId, role } = useAuth();

  const isSuperAdmin = role === 'super_admin';
  const isCompanyAdmin = role === 'company_admin';
  const isOpsManager = role === 'operations_manager';
  const isGuard = role === 'guard';
  const isClient = role === 'client';

  const canManageCompany = isSuperAdmin || isCompanyAdmin;
  const canManageStaff = isSuperAdmin || isCompanyAdmin || isOpsManager;
  const canViewReports = isSuperAdmin || isCompanyAdmin || isOpsManager;

  const assertCompanyId = (): string => {
    if (!companyId) throw new Error('No company context — user must belong to a company');
    return companyId;
  };

  return {
    profile,
    companyId,
    role,
    isSuperAdmin,
    isCompanyAdmin,
    isOpsManager,
    isGuard,
    isClient,
    canManageCompany,
    canManageStaff,
    canViewReports,
    assertCompanyId,
  };
}