import { supabase } from './supabase';
import { getAppBaseUrl } from './getAppBaseUrl';

export type SubscriptionPlanKey = 'sentinel-starter' | 'sentinel' | 'command';
export type BillingInterval = 'monthly' | 'yearly';

const ALLOWED_PLAN_KEYS: SubscriptionPlanKey[] = ['sentinel-starter', 'sentinel', 'command'];

export interface CheckoutResult {
  success: boolean;
  error?: string;
  url?: string;
  code?: 'AUTH_REQUIRED' | 'CLIENT_MISSING' | 'DUPLICATE' | 'NETWORK' | 'GENERAL';
}

function isValidPlanKey(key: string): key is SubscriptionPlanKey {
  return ALLOWED_PLAN_KEYS.includes(key as SubscriptionPlanKey);
}

let checkoutInProgress = false;

export async function startSubscriptionCheckout(
  planKey: SubscriptionPlanKey,
  billing: BillingInterval = 'monthly'
): Promise<CheckoutResult> {
  if (checkoutInProgress) {
    return { success: false, error: 'Checkout already in progress', code: 'GENERAL' };
  }

  if (!isValidPlanKey(planKey)) {
    return { success: false, error: 'Invalid plan selected', code: 'GENERAL' };
  }

  checkoutInProgress = true;

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return {
        success: false,
        error: 'Please sign in to your GuardianHub account before starting a subscription.',
        code: 'AUTH_REQUIRED',
      };
    }

    const returnUrl = getAppBaseUrl();

    let response: Response;
    try {
      response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ plan: planKey, billing, returnUrl }),
        }
      );
    } catch {
      return {
        success: false,
        error: 'We could not reach the payment service. Check your connection and try again.',
        code: 'NETWORK',
      };
    }

    const data = await response.json();

    if (!response.ok) {
      const serverMsg: string = data?.error || 'Checkout failed';

      if (data?.code === 'DUPLICATE' || response.status === 409) {
        return {
          success: false,
          error: 'You already have an active subscription. Please use the Customer Portal in Billing Settings to change your plan.',
          code: 'DUPLICATE',
        };
      }

      if (serverMsg.toLowerCase().includes('contact') || serverMsg.toLowerCase().includes('sales')) {
        return {
          success: false,
          error: 'This plan requires contacting our team. Please visit the contact page.',
          code: 'GENERAL',
        };
      }

      if (serverMsg.toLowerCase().includes('not found') || serverMsg.toLowerCase().includes('not currently available')) {
        return {
          success: false,
          error: 'This plan is not currently available. Please check the pricing page for available options.',
          code: 'GENERAL',
        };
      }

      if (serverMsg.toLowerCase().includes('company')) {
        return {
          success: false,
          error: 'We could not connect this account to a GuardianHub company profile. Please contact support.',
          code: 'CLIENT_MISSING',
        };
      }

      return {
        success: false,
        error: 'We could not open secure checkout. Please try again or contact support.',
        code: 'GENERAL',
      };
    }

    if (!data.url) {
      return {
        success: false,
        error: 'We could not open secure checkout. Please try again or contact support.',
        code: 'GENERAL',
      };
    }

    if (!data.url.startsWith('https://')) {
      return {
        success: false,
        error: 'We could not open secure checkout. Please try again or contact support.',
        code: 'GENERAL',
      };
    }

    return { success: true, url: data.url };
  } catch {
    return {
      success: false,
      error: 'We could not open secure checkout. Please try again or contact support.',
      code: 'GENERAL',
    };
  } finally {
    checkoutInProgress = false;
  }
}