'use client';

import { useSuperAdminCompanies } from '@/lib/useSuperAdmin';
import { PlanBadge, SubscriptionStatusBadge, EmptyState } from '../components/AdminUI';

export default function AdminSubscriptionsPage() {
  const { companies, loading } = useSuperAdminCompanies();

  const subscribed = companies.filter(c => c.stripe_subscription_id || c.stripe_customer_id || c.trial_ends_at);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">{subscribed.length} clients with Stripe or trial subscriptions</p>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading subscriptions...</div>
        ) : subscribed.length === 0 ? (
          <EmptyState icon="ri-vip-crown-line" title="No subscriptions yet" description="Clients will appear here when they connect to Stripe or start a trial." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Stripe Customer</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Stripe Subscription</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Trial Ends</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Period Ends</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {subscribed.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                    <td className="px-5 py-3"><PlanBadge plan={c.plan_name || c.subscription_plan} /></td>
                    <td className="px-5 py-3"><SubscriptionStatusBadge status={c.subscription_status} /></td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{c.stripe_customer_id || '-'}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{c.stripe_subscription_id || '-'}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {c.trial_ends_at ? new Date(c.trial_ends_at).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {c.subscription_period_end ? new Date(c.subscription_period_end).toLocaleDateString('en-GB') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}