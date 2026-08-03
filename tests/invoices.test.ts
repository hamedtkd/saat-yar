import test from "node:test";
import assert from "node:assert/strict";
import { getEffectiveInvoiceStatus, getInvoiceTotals, nextInvoiceNumber } from "../lib/invoices.ts";
import type { Invoice } from "../lib/types.ts";

const invoice: Invoice = {
  id: "1", number: "INV-1405-0001", clientId: "c", issuedAt: "1405-05-01", dueAt: "1405-05-10", status: "sent",
  lines: [{ id: "l", description: "طراحی", quantity: 2, unitPrice: 1_000_000 }], discount: 200_000, taxPercent: 10,
  note: "", createdAt: "2026-01-01T00:00:00.000Z",
};

test("calculates invoice totals with discount and tax", () => {
  assert.deepEqual(getInvoiceTotals(invoice), { subtotal: 2_000_000, discount: 200_000, taxable: 1_800_000, tax: 180_000, total: 1_980_000 });
});

test("marks sent invoices overdue after due date", () => {
  assert.equal(getEffectiveInvoiceStatus(invoice, "1405-05-11"), "overdue");
  assert.equal(getEffectiveInvoiceStatus(invoice, "1405-05-10"), "sent");
});

test("generates sequential invoice numbers", () => {
  assert.equal(nextInvoiceNumber([invoice], "1405"), "INV-1405-0002");
});
