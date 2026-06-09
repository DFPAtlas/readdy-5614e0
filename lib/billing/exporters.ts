import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function buildCSV(headers: string[], rows: (string | number | null)[][]): string {
  const escape = (val: string | number | null) => {
    if (val === null || val === undefined) return "";
    const s = String(val).replace(/"/g, '""');
    return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
  };
  const lines = [headers.map(escape).join(",")];
  rows.forEach((row) => lines.push(row.map(escape).join(",")));
  return lines.join("\n");
}

export function buildPDFReport(opts: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number | null)[][];
  footer?: string;
}): ArrayBuffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(18);
  doc.text(opts.title, 14, 20);

  if (opts.subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(opts.subtitle, 14, 28);
  }

  autoTable(doc, {
    head: [opts.headers],
    body: opts.rows.map((r) => r.map((c) => (c === null || c === undefined ? "—" : String(c)))),
    startY: opts.subtitle ? 32 : 24,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  if (opts.footer) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(opts.footer, 14, doc.internal.pageSize.height - 10);
    }
  }

  return doc.output("arraybuffer");
}