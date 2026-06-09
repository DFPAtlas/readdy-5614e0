'use client';

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { ExportButtons } from "../_components/export-buttons";

interface Refund {
  id: string;
  stripe_refund_id: string;
  stripe_charge_id: string | null;
  stripe_payment_intent_id: string | null;
  company: { name: string } | null;
  amount: number;
  currency: string;
  status: string;
  reason: string | null;
  failure_reason: string | null;
  created_at: string;
}

interface Dispute {
  id: string;
  stripe_dispute_id: string;
  company: { name: string } | null;
  amount: number;
  currency: string;
  status: string;
  reason: string | null;
  evidence_due_by: string | null;
  created_at: string;
}

function fmtMoney(pence: number, currency: string) {
  const sym = currency.toLowerCase() === "gbp" ? "£" : "$";
  return `${sym}${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function RefundsDisputesPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"refunds" | "disputes">("refunds");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [{ data: r }, { data: d }] = await Promise.all([
        supabase.from("billing_refunds").select("*, company:company_id(name)").order("created_at", { ascending: false }).limit(500),
        supabase.from("billing_disputes").select("*, company:company_id(name)").order("created_at", { ascending: false }).limit(500),
      ]);
      setRefunds(r || []);
      setDisputes(d || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const refundTotal = useMemo(() => refunds.reduce((s, r) => s + (r.amount || 0), 0), [refunds]);
  const disputeTotal = useMemo(() => disputes.reduce((s, d) => s + (d.amount || 0), 0), [disputes]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Refunds & Disputes</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {refunds.length} refunds ({fmtMoney(refundTotal, "gbp")}) · {disputes.length} disputes ({fmtMoney(disputeTotal, "gbp")})
          </p>
        </div>
        <ExportButtons type={tab} />
      </div>

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab("refunds")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            tab === "refunds"
              ? "bg-purple-600/15 text-purple-400 border border-purple-600/20"
              : "text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent"
          }`}
        >
          Refunds ({refunds.length})
        </button>
        <button
          onClick={() => setTab("disputes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            tab === "disputes"
              ? "bg-red-600/15 text-red-400 border border-red-600/20"
              : "text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent"
          }`}
        >
          Disputes ({disputes.length})
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {tab === "refunds" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Refund ID</th>
                  <th className="px-4 py-3 font-medium">Charge / Payment Intent</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-5 bg-gray-800/40 rounded animate-pulse" /></td></tr>
                  ))
                ) : refunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <div className="w-10 h-10 flex items-center justify-center mb-2"><i className="ri-refund-line text-xl"></i></div>
                        <p className="text-sm">No refunds</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  refunds.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.stripe_refund_id}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {r.stripe_charge_id || r.stripe_payment_intent_id || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">{fmtMoney(r.amount, r.currency)}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{r.reason || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          r.status === "succeeded" ? "text-emerald-400 bg-emerald-500/10" :
                          r.status === "pending" ? "text-amber-400 bg-amber-500/10" :
                          r.status === "failed" ? "text-red-400 bg-red-500/10" :
                          "text-gray-400 bg-gray-500/10"
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmtDateTime(r.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Dispute ID</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Evidence Due</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-5 bg-gray-800/40 rounded animate-pulse" /></td></tr>
                  ))
                ) : disputes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <div className="w-10 h-10 flex items-center justify-center mb-2"><i className="ri-shield-check-line text-xl"></i></div>
                        <p className="text-sm">No disputes</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  disputes.map((d) => (
                    <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.stripe_dispute_id}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{d.company?.name || "—"}</td>
                      <td className="px-4 py-3 text-right text-white font-medium">{fmtMoney(d.amount, d.currency)}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{d.reason || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          d.status === "won" ? "text-emerald-400 bg-emerald-500/10" :
                          d.status === "lost" ? "text-red-400 bg-red-500/10" :
                          d.status === "needs_response" ? "text-amber-400 bg-amber-500/10" :
                          "text-gray-400 bg-gray-500/10"
                        }`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(d.evidence_due_by)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmtDateTime(d.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}