import type { Invoice, InvoiceLine } from "./types.ts";

export function invoiceLineTotal(line: InvoiceLine) {
  return Math.max(0, line.quantity) * Math.max(0, line.unitPrice);
}

export function getInvoiceTotals(invoice: Pick<Invoice, "lines" | "discount" | "taxPercent">) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + invoiceLineTotal(line), 0);
  const discount = Math.min(subtotal, Math.max(0, invoice.discount));
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * Math.max(0, invoice.taxPercent) / 100;
  return { subtotal, discount, taxable, tax, total: taxable + tax };
}

export function getEffectiveInvoiceStatus(invoice: Invoice, today: string): Invoice["status"] {
  if (invoice.status === "sent" && invoice.dueAt && invoice.dueAt < today) return "overdue";
  return invoice.status;
}

export function nextInvoiceNumber(invoices: Invoice[], year: string) {
  const prefix = `INV-${year}-`;
  const max = invoices.reduce((highest, invoice) => {
    if (!invoice.number.startsWith(prefix)) return highest;
    const value = Number(invoice.number.slice(prefix.length));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
