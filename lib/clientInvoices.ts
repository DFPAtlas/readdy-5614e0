import type { PhaseOneDatabase as Database } from "./phaseOneDatabase.types";
export type ClientInvoice =
  Database["public"]["Tables"]["client_invoices"]["Row"];
export const publishedInvoiceStatuses = [
  "issued",
  "viewed",
  "partially_paid",
  "paid",
  "overdue",
  "disputed",
  "void",
];
export function money(
  value: number | string | null | undefined,
  currency = "GBP",
) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    Number(value || 0),
  );
}
export function invoiceBalance(
  invoice: Pick<ClientInvoice, "gross_total" | "amount_paid">,
) {
  return Math.max(
    0,
    Math.round(
      (Number(invoice.gross_total) - Number(invoice.amount_paid)) * 100,
    ) / 100,
  );
}
