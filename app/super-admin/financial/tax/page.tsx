'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExportButtons } from "../_components/export-buttons";

interface TaxRow {
  month: string;
  currency: string;
  net_pence: number;
  vat_pence: number;
  gross_pence: number;
  effective_vat_pct: number;
}

function fmtMoney(pence: number, currency: string) {
  const sym = currency.toLowerCase() === "gbp" ? "£" : "$";
  return `${sym}${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
}

export default function TaxPage() {
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("v_billing_tax_monthly")
        .select("*")
        .order("month", { ascending: false })
        .limit(500);
      setRows(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const totals = rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.gross_pence,
      net: acc.net + r.net_pence,
      vat: acc.vat + r.vat_pence,
    }),
    { gross: 0, net: 0, vat: 0 }
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">VAT Report</h2>
          <p className="text-xs text-gray-500 mt-0.5">Monthly VAT collected across all currencies</p>
        </div>
        <ExportButtons type="tax" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <div className="text-sm text-gray-500">Total Gross Revenue</div>
          <div className="text-xl font-bold text-white mt-1">{fmtMoney(totals.gross, "gbp")}</div>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <div className="text-sm text-gray-500">Total Net Revenue</div>
          <div className="text-xl font-bold text-white mt-1">{fmtMoney(totals.net, "gbp")}</div>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <div className="text-sm text-gray-500">Total VAT Collected</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{fmtMoney(totals.vat, "gbp")}</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium text-right">Gross Revenue</th>
                <th className="px-4 py-3 font-medium text-right">Net Revenue</th>
                <th className="px-4 py-3 font-medium text-right">VAT Collected</th>
                <th className="px-4 py-3 font-medium">Currency</th>
                <th className="px-4 py-3 font-medium">Effective VAT %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-5 bg-gray-800/40 rounded animate-pulse" /></td></tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <div className="w-10 h-10 flex items-center justify-center mb-2"><i className="ri-government-line text-xl"></i></div>
                      <p className="text-sm">No VAT data yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.month}-${r.currency}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium text-sm">
                      {new Date(r.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">{fmtMoney(r.gross_pence, r.currency)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{fmtMoney(r.net_pence, r.currency)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">{fmtMoney(r.vat_pence, r.currency)}</td>
                    <td className="px-4 py-3 text-gray-500 uppercase text-xs">{r.currency}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.effective_vat_pct}%</td>
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