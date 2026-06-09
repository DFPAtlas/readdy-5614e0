'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StatCard } from "./_components/stat-card";
import { RevenueChart } from "./_components/revenue-chart";
import { ExportButtons } from "./_components/export-buttons";

interface MRRRow {
  plan_name: string;
  active_subs: number;
  trialing_subs: number;
  at_risk_subs: number;
}

interface RevenueRow {
  month: string;
  currency: string;
  invoice_count: number;
  gross_pence: number;
  net_pence: number;
  vat_pence: number;
}

export default function FinancialOverviewPage() {
  const [mrr, setMrr] = useState<MRRRow[]>([]);
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [overdueTotal, setOverdueTotal] = useState(0);
  const [refundTotal, setRefundTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const { data: mrrData } = await supabase.from("v_billing_mrr_current").select("*");
      const { data: revData } = await supabase.from("v_billing_revenue_monthly").select("*").order("month", { ascending: false }).limit(12);

      const { count: invCount } = await supabase.from("billing_invoices").select("*", { count: "exact", head: true }).eq("status", "paid");

      const { count: failCount } = await supabase.from("billing_invoices").select("*", { count: "exact", head: true }).in("status", ["open", "uncollectible"]);

      const { data: overdue } = await supabase.from("v_billing_overdue").select("amount_due, currency").limit(5000);
      const overdueSum = (overdue || []).reduce((sum, r: any) => sum + (r.amount_due || 0), 0);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: refunds } = await supabase
        .from("billing_refunds")
        .select("amount")
        .gte("created_at", startOfMonth)
        .limit(5000);
      const refundSum = (refunds || []).reduce((sum, r: any) => sum + (r.amount || 0), 0);

      setMrr(mrrData || []);
      setRevenue(revData || []);
      setInvoiceCount(invCount || 0);
      setFailedCount(failCount || 0);
      setOverdueTotal(overdueSum);
      setRefundTotal(refundSum);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const currentMonth = revenue[0];
  const revenueThisMonth = currentMonth ? currentMonth.gross_pence : 0;

  const totalActiveSubs = mrr.reduce((s, r) => s + (r.active_subs || 0), 0);
  const totalTrialing = mrr.reduce((s, r) => s + (r.trialing_subs || 0), 0);
  const totalAtRisk = mrr.reduce((s, r) => s + (r.at_risk_subs || 0), 0);

  const chartData = [...revenue].reverse().map((r) => ({
    month: new Date(r.month).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
    gross: r.gross_pence,
  }));

  const fmt = (pence: number) => `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">Overview</h2>
        <ExportButtons type="overview" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Current MRR" value={fmt(revenueThisMonth)} icon="ri-money-pound-circle-line" color="emerald" sub={`${totalActiveSubs} active subs`} />
          <StatCard label="Revenue This Month" value={fmt(revenueThisMonth)} icon="ri-line-chart-line" color="blue" />
          <StatCard label="Paid Invoices" value={String(invoiceCount)} icon="ri-file-list-3-line" color="emerald" />
          <StatCard label="Failed Payments" value={String(failedCount)} icon="ri-error-warning-line" color="red" />
          <StatCard label="Overdue Amount" value={fmt(overdueTotal)} icon="ri-time-line" color="amber" />
          <StatCard label="Refunds This Month" value={fmt(refundTotal)} icon="ri-refund-line" color="purple" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Monthly Revenue</h3>
            <span className="text-xs text-gray-500">Last 12 months</span>
          </div>
          <div className="px-5 py-4">
            <RevenueChart data={chartData} />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Subscription Health</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-300">Active Subscriptions</span>
              </div>
              <span className="text-sm font-semibold text-white">{totalActiveSubs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm text-gray-300">Trialing</span>
              </div>
              <span className="text-sm font-semibold text-white">{totalTrialing}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="text-sm text-gray-300">At Risk</span>
              </div>
              <span className="text-sm font-semibold text-white">{totalAtRisk}</span>
            </div>
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-semibold text-white">{totalActiveSubs + totalTrialing + totalAtRisk}</span>
            </div>

            {mrr.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">By Plan</p>
                {mrr.map((r) => (
                  <div key={r.plan_name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 capitalize">{r.plan_name || 'Unknown'}</span>
                    <span className="text-white font-medium">{r.active_subs}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}