export type AccountStatus = 'invited' | 'pending_verification' | 'active' | 'suspended' | 'removed';

export type CompanyStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled';

export interface AccountCheckResult {
  allowed: boolean;
  reason: string | null;
  redirectTo: string | null;
}

export function checkAccountAccess(
  userStatus: string | null | undefined,
  companyStatus: string | null | undefined
): AccountCheckResult {
  if (!userStatus) {
    return { allowed: false, reason: 'No account status', redirectTo: '/login' };
  }

  switch (userStatus) {
    case 'suspended':
      return {
        allowed: false,
        reason: 'Your account has been suspended. Please contact your administrator.',
        redirectTo: '/login?reason=suspended',
      };
    case 'removed':
      return {
        allowed: false,
        reason: 'Your account has been removed.',
        redirectTo: '/login?reason=removed',
      };
    case 'invited':
    case 'pending_verification':
      return {
        allowed: true,
        reason: null,
        redirectTo: null,
      };
    case 'active':
      break;
    default:
      return { allowed: false, reason: 'Unknown account status', redirectTo: '/login' };
  }

  if (companyStatus) {
    switch (companyStatus) {
      case 'suspended':
        return {
          allowed: false,
          reason: 'Your company account has been suspended.',
          redirectTo: '/login?reason=company_suspended',
        };
      case 'cancelled':
        return {
          allowed: true,
          reason: null,
          redirectTo: null,
        };
      case 'trial':
      case 'active':
      case 'past_due':
        break;
      default:
        break;
    }
  }

  return { allowed: true, reason: null, redirectTo: null };
}

export function isAccessDenied(status: string | null | undefined): boolean {
  if (!status) return false;
  return status === 'suspended' || status === 'removed';
}

export function getStatusMessage(status: string | null | undefined): string {
  switch (status) {
    case 'suspended':
      return 'Your account has been suspended.';
    case 'removed':
      return 'Your account has been removed.';
    default:
      return 'Your account is not active.';
  }
}