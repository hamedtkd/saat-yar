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

export const statusLabels: Record<InvoiceStatus, string> = {
  draft: "پیش‌نویس",
  sent: "ارسال‌شده",
  paid: "پرداخت‌شده",
  overdue: "سررسیدگذشته",
  cancelled: "لغوشده",
};
