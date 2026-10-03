"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useAuth } from "@/lib/auth";
import { useClientAuth } from "@/lib/useClientAuth";
import { useTenantRecord } from "@/lib/useTenantRecord";
import {
  RecordRoute,
  RecordState,
  panel,
  button,
  input,
  date,
  label,
} from "@/components/RecordPage";
import {
  money,
  invoiceBalance,
  type ClientInvoice,
} from "@/lib/clientInvoices";
function Detail({ id }: { id: string }) {
  const { companyId, currentUser } = useAuth();
  const { clientId, clientRole, loading: identityLoading } = useClientAuth();
  const { record, loading, error, reload } = useTenantRecord<ClientInvoice>(
    "client_invoices",
    id,
    companyId,
    { column: "client_id", id: clientId },
  );
  const [lines, setLines] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [extraError, setExtraError] = useState<string | null>(null);
  const [extraLoading, setExtraLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!record || !companyId || !clientId) return;
    setExtraError(null);
    setExtraLoading(true);
    try {
      const results = await Promise.all([
        record.billing_run_id
          ? supabase
              .from("billing_run_lines")
              .select(
                "id,description,quantity,unit_rate,net_amount,vat_amount,total_amount,service_date",
              )
              .eq("company_id", companyId)
              .eq("client_id", clientId)
              .eq("billing_run_id", record.billing_run_id)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("payment_allocations")
          .select(
            "id,amount,created_at,client_payments(payment_date,payment_reference,status)",
          )
          .eq("company_id", companyId)
          .eq("invoice_id", id),
        supabase.rpc("client_invoice_queries", { p_invoice_id: id }),
      ]);
      if (results.some((r) => r.error)) throw new Error();
      setLines(results[0].data || []);
      setPayments(results[1].data || []);
      setDisputes(Array.isArray(results[2].data) ? results[2].data : []);
    } catch {
      setExtraError(
        "Could not load invoice lines, payment history or queries. Please retry.",
      );
    } finally {
      setExtraLoading(false);
    }
  }, [record, companyId, clientId, id]);
  useEffect(() => {
    load();
  }, [load]);
  const query = async () => {
    if (
      saving ||
      reason.trim().length < 10 ||
      !companyId ||
      !clientId ||
      !currentUser ||
      clientRole === "viewer"
    )
      return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await supabase.rpc("client_invoice_queries", {
        p_invoice_id: id,
        p_reason: reason.trim(),
      });
      if (result.error || !result.data) throw new Error();
      setReason("");
      setNotice("Invoice query submitted.");
      await load();
    } catch {
      setNotice("Could not submit your query. Please retry.");
    } finally {
      setSaving(false);
    }
  };
  const download = async () => {
    if (!record || extraLoading || extraError) return;
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const pdf = new jsPDF();
      pdf.setFontSize(18);
      pdf.text(`Invoice ${record.invoice_number}`, 14, 20);
      pdf.setFontSize(10);
      const heading = [
        record.company_name_snapshot || "Security provider",
        record.company_address_snapshot || "",
        `VAT: ${record.company_vat_snapshot || "Not recorded"}`,
        `Bill to: ${record.client_name_snapshot || ""}`,
        record.client_address_snapshot || "",
        `Issued: ${record.issue_date} | Due: ${record.due_date}`,
        `Period: ${record.service_period_start || "—"} to ${record.service_period_end || "—"}`,
        `PO: ${record.po_reference || "—"}`,
      ];
      pdf.text(heading, 14, 30);
      autoTable(pdf, {
        startY: 76,
        head: [["Description", "Qty", "Rate", "Net", "VAT", "Total"]],
        body: lines.map((l) => [
          l.description,
          String(l.quantity),
          money(l.unit_rate, record.currency),
          money(l.net_amount, record.currency),
          money(l.vat_amount, record.currency),
          money(l.total_amount, record.currency),
        ]),
        styles: { fontSize: 9 },
      });
      pdf.addPage();
      pdf.text(
        [
          `Net: ${money(record.net_total, record.currency)}`,
          `VAT: ${money(record.vat_total, record.currency)}`,
          `Total: ${money(record.gross_total, record.currency)}`,
          `Paid: ${money(record.amount_paid, record.currency)}`,
          `Balance: ${money(invoiceBalance(record), record.currency)}`,
          `Payment terms: ${record.payment_terms || "Contact your provider"}`,
        ],
        14,
        20,
      );
      pdf.save(`${record.invoice_number.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);
    } catch {
      setNotice("Could not generate the PDF. Please retry.");
    }
  };
  if (identityLoading || loading)
    return <RecordState loading back="/client/invoices" />;
  if (!record)
    return <RecordState error={error} back="/client/invoices" retry={reload} />;
  return (
    <div className="max-w-5xl space-y-5">
      <Link className="text-blue-400" href="/client/invoices">
        Back to invoices
      </Link>
      <section className={panel}>
        <div className="flex flex-wrap justify-between gap-3">
          <h1 className="text-2xl text-white font-semibold">
            {record.invoice_number}
          </h1>
          <button
            className={button}
            onClick={download}
            disabled={extraLoading || !!extraError}
          >
            Download PDF
          </button>
        </div>
        <p className="text-gray-300">
          {label(record.status)} · Issued {date(record.issue_date)} · Due{" "}
          {date(record.due_date)}
        </p>
        <p className="text-gray-400">
          Service period {record.service_period_start || "—"} to{" "}
          {record.service_period_end || "—"} · PO {record.po_reference || "—"}
        </p>
        <dl className="grid grid-cols-2 md:grid-cols-5 gap-4 text-gray-300">
          {[
            ["Net", record.net_total],
            ["VAT", record.vat_total],
            ["Total", record.gross_total],
            ["Paid", record.amount_paid],
            ["Balance", invoiceBalance(record)],
          ].map(([title, value]) => (
            <div key={String(title)}>
              <dt>{title}</dt>
              <dd className="text-lg text-white">
                {money(value as number | string, record.currency)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {extraLoading ? (
        <RecordState loading back="/client/invoices" />
      ) : extraError ? (
        <RecordState error={extraError} back="/client/invoices" retry={load} />
      ) : (
        <>
          <section className={panel + " overflow-x-auto"}>
            <h2 className="text-lg text-white">Invoice breakdown</h2>
            {lines.length ? (
              <table className="text-sm w-full text-gray-300">
                <thead>
                  <tr>
                    <th className="text-left">Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Net</th>
                    <th>VAT</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-t border-gray-800">
                      <td className="py-3">{l.description}</td>
                      <td className="text-center">{l.quantity}</td>
                      <td>{money(l.unit_rate, record.currency)}</td>
                      <td>{money(l.net_amount, record.currency)}</td>
                      <td>{money(l.vat_amount, record.currency)}</td>
                      <td>{money(l.total_amount, record.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400">
                No itemised lines were recorded for this invoice.
              </p>
            )}
          </section>
          <section className={panel}>
            <h2 className="text-lg text-white">Payment history</h2>
            {payments.length ? (
              payments.map((p) => (
                <p key={p.id} className="text-gray-300">
                  {date(p.client_payments?.payment_date || p.created_at)} ·{" "}
                  {money(p.amount, record.currency)} ·{" "}
                  {p.client_payments?.payment_reference || "Payment allocation"}{" "}
                  · {label(p.client_payments?.status)}
                </p>
              ))
            ) : (
              <p className="text-gray-400">No payment allocations recorded.</p>
            )}
          </section>
          <section className={panel}>
            <h2 className="text-lg text-white">Invoice queries</h2>
            {disputes.map((d) => (
              <div
                key={d.id}
                className="text-gray-300 border-b border-gray-800 py-3"
              >
                <p>
                  {label(d.status)} · {date(d.created_at)}
                </p>
                <p className="whitespace-pre-wrap">{d.reason}</p>
                {d.client_visible_response && (
                  <p className="mt-2 text-blue-300">
                    {d.client_visible_response}
                  </p>
                )}
              </div>
            ))}
            {clientRole !== "viewer" && (
              <>
                <label className="block text-gray-300" htmlFor="invoice-query">
                  Query or dispute this invoice
                </label>
                <textarea
                  id="invoice-query"
                  className={input}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minLength={10}
                  maxLength={2000}
                  placeholder="Explain the issue (at least 10 characters)"
                />
                <button
                  className={button}
                  disabled={saving || reason.trim().length < 10}
                  onClick={query}
                >
                  {saving ? "Submitting…" : "Submit query"}
                </button>
              </>
            )}
            {notice && (
              <p role="status" className="text-gray-300">
                {notice}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
export default function Page() {
  return (
    <RecordRoute back="/client/invoices">
      {(id) => <Detail id={id} />}
    </RecordRoute>
  );
}
