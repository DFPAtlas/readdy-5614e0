'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();
const TEST_URL = 'https://kbefthyqlfrwixmkcqhu.supabase.co/functions/v1/stripe-webhook-test';
const SETUP_URL = 'https://kbefthyqlfrwixmkcqhu.supabase.co/functions/v1/stripe-setup-webhook';

type Company = {
  id: string;
  name: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_billing: string | null;
};

type TestResult = {
  test_event: string;
  company_id: string;
  company_name: string;
  before: Record<string, any>;
  after: Record<string, any>;
  expected: Record<string, any>;
  passed: boolean;
  notes: string[];
};

export default function StripeWebhookTestPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [setupLoading, setSetupLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_billing')
      .not('stripe_customer_id', 'is', null)
      .order('name')
      .then(({ data, error }) => {
        if (data) {
          setCompanies(data);
          if (data.length > 0) setSelectedId(data[0].id);
        }
        if (error) setError(error.message);
      });
  }, []);

  const runTest = async (testEvent: string, extra?: Record<string, any>) => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(TEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: selectedId, test_event: testEvent, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setResults((prev) => [json as TestResult, ...prev]);

      // refresh selected company in list
      const { data } = await supabase
        .from('companies')
        .select('id, name, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_billing')
        .eq('id', selectedId)
        .maybeSingle();
      if (data) {
        setCompanies((prev) => prev.map((c) => (c.id === data.id ? (data as Company) : c)));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runSetup = async () => {
    setSetupLoading(true);
    setError(null);
    try {
      const res = await fetch(SETUP_URL, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Setup failed');
      setSetupResult(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  const selectedCompany = companies.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Stripe Webhook Test</h1>
        <p className="text-gray-400 mb-8">
          Simulate Stripe events against real companies and verify subscription_status updates correctly.
        </p>

        {/* Setup Section */}
        <div className="bg-[#111827] border border-gray-800 rounded-lg p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium mb-1">Stripe Webhook Registration</h2>
              <p className="text-xs text-gray-500">
                Registers the endpoint in Stripe and enables all required billing events.
              </p>
            </div>
            <button
              onClick={runSetup}
              disabled={setupLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-4 py-2.5 whitespace-nowrap cursor-pointer"
            >
              {setupLoading ? 'Registering...' : 'Register Webhook'}
            </button>
          </div>

          {setupResult && (
            <div className="mt-4 bg-[#0B0F19] border border-gray-800 rounded-lg p-4 text-xs font-mono text-gray-300 overflow-x-auto">
              <pre>{JSON.stringify(setupResult, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <label className="text-sm text-gray-400">Select Company</label>
          <select
            className="bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.subscription_status || 'null'} / {c.stripe_customer_id}
              </option>
            ))}
          </select>

          {selectedCompany && (
            <div className="bg-[#111827] border border-gray-800 rounded-lg p-4 text-sm grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium">{selectedCompany.subscription_status || 'null'}</div>
              </div>
              <div>
                <div className="text-gray-500">Stripe Sub ID</div>
                <div className="font-medium">{selectedCompany.stripe_subscription_id || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Billing</div>
                <div className="font-medium">{selectedCompany.subscription_billing || '—'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => runTest('checkout.session.completed')}
            disabled={loading || !selectedId}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-4 py-3 whitespace-nowrap cursor-pointer"
          >
            checkout.completed
          </button>
          <button
            onClick={() => runTest('customer.subscription.updated')}
            disabled={loading || !selectedId}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-4 py-3 whitespace-nowrap cursor-pointer"
          >
            subscription.updated
          </button>
          <button
            onClick={() => runTest('invoice.payment_failed')}
            disabled={loading || !selectedId}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-4 py-3 whitespace-nowrap cursor-pointer"
          >
            invoice.failed
          </button>
          <button
            onClick={() => runTest('customer.subscription.deleted')}
            disabled={loading || !selectedId}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-4 py-3 whitespace-nowrap cursor-pointer"
          >
            subscription.deleted
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Results</h2>
            {results.map((r, i) => (
              <div key={i} className="bg-[#111827] border border-gray-800 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium">
                    {r.company_name}
                    <span className="text-gray-500 ml-2">({r.test_event})</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      r.passed ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'
                    }`}
                  >
                    {r.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Before</div>
                    <div className="font-mono text-xs text-gray-300">
                      status: {r.before.subscription_status || 'null'}
                      <br />
                      sub_id: {r.before.stripe_subscription_id || '—'}
                      <br />
                      billing: {r.before.subscription_billing || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Expected</div>
                    <div className="font-mono text-xs text-gray-300">
                      status: {r.expected.subscription_status}
                      <br />
                      sub_id: {r.expected.stripe_subscription_id || '—'}
                      <br />
                      billing: {r.expected.subscription_billing || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">After</div>
                    <div className="font-mono text-xs text-gray-300">
                      status: {r.after.subscription_status || 'null'}
                      <br />
                      sub_id: {r.after.stripe_subscription_id || '—'}
                      <br />
                      billing: {r.after.subscription_billing || '—'}
                    </div>
                  </div>
                </div>
                {r.notes.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500">{r.notes.join(' · ')}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}