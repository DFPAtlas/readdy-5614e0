'use client';

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { ExportButtons } from "../_components/export-buttons";

interface Invoice {
  id: string;
  number: string | null;
  company: { name: string } | null;
  stripe_customer_id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  currency: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, { cls: string; label: string }> = {
    paid: { cls: "text-emerald-400 bg-emerald-500/10", label: "Paid" },
    open: { cls: "text-amber-400 bg-amber-500/10", label: "Open" },
    draft: { cls: "text-gray-400 bg-gray-500/10", label: "Draft" },
    void: { cls: "text-gray-500 bg-gray-600/10", label: "Void" },
    uncollectible: { cls: "text-red-400 bg-red-500/10", label: "Uncollectible" },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${s.cls}`}>{s.label}</span>
  );
};

function fmtMoney(pence: number, currency: string) {
  const sym = currency.toLowerCase() === "gbp" ? "£" : "$";
  return `${sym}${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from("billing_invoices")
        .select("*, company:company_id(name)")
        .order("created_at", { ascending: false })
        .limit(500);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (dateFrom) {
        query = query.gte("created_at", new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        query = query.lte("created_at", new Date(dateTo + "T23:59:59").toISOString());
      }

      const { data } = await query;
      setInvoices(data || []);
      setLoading(false);
    };
    fetch();
  }, [statusFilter, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter((inv) =>
      (inv.number || "").toLowerCase().includes(q) ||
      (inv.company?.name || "").toLowerCase().includes(q) ||
      inv.stripe_customer_id.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold text-white">Invoices</h2>
        <ExportButtons type="invoices" />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-[#111827] border border-gray-800 rounded-lg px-3 py-2">
          <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-search-line text-xs"></i></div>
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-48"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "paid", "open", "draft", "void", "uncollectible"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? "bg-emerald-600/15 text-emerald-400 border border-emerald-600/20"
                  : "text-gray-400 hover:text-white bg-gray-800/40 border border-transparent"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#111827] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
          />
          <span className="text-gray-600 text-xs">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#111827] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Company / Customer</th>
                <th className="px-4 py-3 font-medium">Stripe Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Gross</th>
                <th className="px-4 py-3 font-medium text-right">Net</th>
                <th className="px-4 py-3 font-medium text-right">VAT</th>
                <th className="px-4 py-3 font-medium">Currency</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Paid Date</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={11} className="px-4 py-4"><div className="h-5 bg-gray-800/40 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <div className="w-10 h-10 flex items-center justify-center mb-2"><i className="ri-file-list-line text-xl"></i></div>
                      <p className="text-sm">No invoices found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{inv.number || "—"}</td>
                    <td className="px-4 py-3 text-gray-300">{inv.company?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{inv.stripe_customer_id}</td>
                    <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">{fmtMoney(inv.total, inv.currency)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{fmtMoney(inv.subtotal, inv.currency)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{fmtMoney(inv.tax, inv.currency)}</td>
                    <td className="px-4 py-3 text-gray-500 uppercase text-xs">{inv.currency}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(inv.due_date)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(inv.paid_at)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(inv.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}