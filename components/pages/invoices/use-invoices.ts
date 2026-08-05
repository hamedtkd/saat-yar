"use client";

import { useMemo, useState } from "react";
import { localDateKey } from "@/lib/format";
import { nextInvoiceNumber } from "@/lib/invoices";
import type { AppData, Invoice, InvoiceStatus } from "@/lib/types";
import type { InvoiceDraft } from "./types";

const createDraft = (): InvoiceDraft => ({
  clientId: "",
  projectId: "",
  issuedAt: localDateKey(),
  dueAt: "",
  description: "خدمات پروژه",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  taxPercent: 0,
  note: "",
});

export function useInvoices(data: AppData, setData: React.Dispatch<React.SetStateAction<AppData>>) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<InvoiceDraft>(createDraft);
  const invoices = useMemo(
    () => [...data.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [data.invoices],
  );

  function addInvoice() {
    if (!draft.clientId || !draft.description.trim() || draft.quantity <= 0 || draft.unitPrice < 0) return;
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      number: nextInvoiceNumber(data.invoices, draft.issuedAt.slice(0, 4)),
      clientId: draft.clientId,
      projectId: draft.projectId || undefined,
      issuedAt: draft.issuedAt,
      dueAt: draft.dueAt || undefined,
      status: "draft",
      lines: [{ id: crypto.randomUUID(), description: draft.description.trim(), quantity: draft.quantity, unitPrice: draft.unitPrice }],
      discount: draft.discount,
      taxPercent: draft.taxPercent,
      note: draft.note.trim(),
      createdAt: new Date().toISOString(),
    };
    setData((previous) => ({ ...previous, invoices: [invoice, ...previous.invoices] }));
    setDraft(createDraft());
    setShowForm(false);
  }

  function updateStatus(id: string, status: InvoiceStatus) {
    setData((previous) => ({
      ...previous,
      invoices: previous.invoices.map((invoice) => invoice.id === id
        ? { ...invoice, status, paidAt: status === "paid" ? new Date().toISOString() : invoice.paidAt }
        : invoice),
    }));
  }

  function removeInvoice(id: string) {
    setData((previous) => ({
      ...previous,
      invoices: previous.invoices.filter((invoice) => invoice.id !== id),
    }));
  }

  return { showForm, setShowForm, draft, setDraft, invoices, addInvoice, updateStatus, removeInvoice };
}
