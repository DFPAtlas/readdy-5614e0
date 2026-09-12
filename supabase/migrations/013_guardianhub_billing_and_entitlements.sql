-- GuardianHub Migration 013: Billing & Entitlements
-- Phase 1B: Complete DDL recovery
DO $$
BEGIN
  RAISE NOTICE 'Placeholder — billing_invoices, billing_payments, billing_refunds, billing_disputes, billing_subscription_events, billing_webhook_events, feature_usage exist in production.';
END $$;