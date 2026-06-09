export function formatMoney(pence: number, currency = "gbp"): string {
  const symbol = currency.toLowerCase() === "gbp" ? "£" : currency.toUpperCase() === "USD" ? "$" : currency.toUpperCase();
  const val = pence / 100;
  return `${symbol}${val.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function penceToPounds(pence: number): number {
  return pence / 100;
}

export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

export function daysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}