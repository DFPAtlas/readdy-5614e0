"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useAuth } from "@/lib/auth";
import { useClientAuth } from "@/lib/useClientAuth";
import { RecordState, panel, date, label } from "@/components/RecordPage";
import {
  money,
  publishedInvoiceStatuses,
  type ClientInvoice,
} from "@/lib/clientInvoices";
export default function Page() {
  const { companyId } = useAuth();
  const { clientId, loading: identityLoading } = useClientAuth();
  const [rows, setRows] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const load = useCallback(async () => {
    setRows([]);
    setError(null);
    if (!companyId || !clientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await supabase
        .from("client_invoices")
        .select("*")
        .eq("company_id", companyId)
        .eq("client_id", clientId)
        .in("status", publishedInvoiceStatuses)
        .order("issue_date", { ascending: false });
      if (result.error) throw result.error;
      setRows(result.data || []);
    } catch {
      setError("Could not load your invoices. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [companyId, clientId]);
  useEffect(() => {
    load();
  }, [load]);
  if (identityLoading || loading) return <RecordState loading back="/client" />;
  if (error || !clientId)
    return (
      <RecordState
        error={error || "Your account is not linked to a client."}
        back="/client"
        retry={load}
      />
    );
  const filtered = rows.filter(
    (row) => filter === "all" || row.status === filter,
  );
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white">Invoices</h1>
      <p className="text-gray-400">
        Your issued invoices, payment status and queries.
      </p>
      <label className="block text-gray-300">
        Status{" "}
        <select
          className="ml-3 bg-gray-800 rounded-lg p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          {publishedInvoiceStatuses.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </label>
      <div className={panel + " overflow-x-auto"}>
        {filtered.length ? (
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr>
                <th className="text-left py-3">Invoice</th>
                <th className="text-left">Issued</th>
                <th className="text-left">Due</th>
                <th className="text-right">Total</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-gray-800">
                  <td className="py-4">
                    <Link
                      className="text-blue-400"
                      href={`/client/invoices/detail?id=${row.id}`}
                    >
                      {row.invoice_number}
                    </Link>
                  </td>
                  <td>{date(row.issue_date)}</td>
                  <td>{date(row.due_date)}</td>
                  <td className="text-right">
                    {money(row.gross_total, row.currency)}
                  </td>
                  <td className="text-right">
                    {money(row.amount_paid, row.currency)}
                  </td>
                  <td className="text-right">{label(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400">No invoices match this status.</p>
        )}
      </div>
    </div>
  );
}
