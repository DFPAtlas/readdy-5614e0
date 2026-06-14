// SERVER-SIDE ONLY — DO NOT IMPORT IN BROWSER CODE.
// This file uses process.env.STRIPE_SECRET_KEY and only works in Node.js / Supabase Edge Functions.
// For static export builds, Stripe operations go through Supabase Edge Functions.
// If you need to use this locally, run via: npx ts-node lib/billing/stripe.ts

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripeInstance = new Stripe(key, {
    apiVersion: "2024-04-10",
    typescript: true,
  });
  return stripeInstance;
}

export function resetStripe(): void {
  stripeInstance = null;
}