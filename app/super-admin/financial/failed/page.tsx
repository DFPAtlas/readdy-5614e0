'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExportButtons } from "../_components/export-buttons";

interface OverdueRow {
  id: string;
  stripe_invoice_id: string;
  number: string | null;
  company_name: string | null;
  contact_email: string | null;
  total: number;
  amount_due: number;
  currency: string;
  status: string;
  attempt_count: number | null;
  next_payment_attempt: string | null;
  due_date: string | null;
  hosted_invoice_url: string | null;
}

function fmtMoney(pence: number, currency: string) {
  const sym = currency.toLowerCase() === "gbp" ? "£" : "$";
  return `${sym}${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function FailedOverduePage() {
  const [rows, setRows] = useState<OverdueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("v_billing_overdue")
        .select("*")
        .order("due_date", { ascending: false })
        .limit(500);
      setRows(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Failed & Overdue</h2>
          <p className="text-xs text-gray-500 mt-0.5">Invoices that are open, uncollectible, or past due</p>
        </div>
        <ExportButtons type="failed" />
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Due</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Days Overdue</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Attempts</th>
                <th className="px-4 py-3 font-medium">Stripe Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-4 py-4"><div className="h-5 bg-gray-800/40 rounded animate-pulse" /></td></tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <div className="w-10 h-10 flex items-center justify-center mb-2"><i className="ri-shield-check-line text-xl"></i></div>
                      <p className="text-sm">Nothing overdue or failed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const overdue = daysOverdue(r.due_date);
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm text-white font-medium">{r.company_name || "—"}</div>
                        <div className="text-xs text-gray-500">{r.contact_email || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{r.number || r.stripe_invoice_id}</td>
                      <td className="px-4 py-3 text-right text-white font-medium text-sm">{fmtMoney(r.total, r.currency)}</td>
                      <td className="px-4 py-3 text-right text-gray-300 text-sm">{fmtMoney(r.amount_due, r.currency)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(r.due_date)}</td>
                      <td className="px-4 py-3">
                        {overdue > 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium text-red-400 bg-red-500/10">
                            {overdue} day{overdue !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          r.status === "open" ? "text-amber-400 bg-amber-500/10" :
                          r.status === "uncollectible" ? "text-red-400 bg-red-500/10" :
                          "text-gray-400 bg-gray-500/10"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.attempt_count ?? 0}</td>
                      <td className="px-4 py-3">
                        {r.hosted_invoice_url ? (
                          <a
                            href={r.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            Open
                            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-external-link-line text-[10px]"></i></div>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}