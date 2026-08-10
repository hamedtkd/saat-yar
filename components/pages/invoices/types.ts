import type { BusinessMessageKey } from "@/lib/i18n/business";
import type { InvoiceStatus } from "@/lib/types";

export type InvoiceDraft = {
  clientId: string;
  projectId: string;
  issuedAt: string;
  dueAt: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  note: string;
};

export const statusMessageKeys: Record<InvoiceStatus, BusinessMessageKey> = {
  draft: "invoices.status.draft",
  sent: "invoices.status.sent",
  paid: "invoices.status.paid",
  overdue: "invoices.status.overdue",
  cancelled: "invoices.status.cancelled",
};
