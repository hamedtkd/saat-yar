import type { ClientDraft, ProjectDraft } from "./types";

export type FormErrors<K extends string> = Partial<Record<K, string>>;

export function hasFormErrors<K extends string>(errors: FormErrors<K>) {
  return Object.values(errors as Record<string, string | undefined>).some(Boolean);
}

export function validateClientDraft(draft: ClientDraft): FormErrors<"name" | "email"> {
  const errors: FormErrors<"name" | "email"> = {};
  if (!draft.name.trim()) errors.name = "نام مشتری را وارد کن.";
  if (draft.email.trim() && !/^\S+@\S+\.\S+$/.test(draft.email.trim())) errors.email = "ایمیل را با قالب معتبر وارد کن.";
  return errors;
}

export function validateProjectDraft(draft: ProjectDraft): FormErrors<"name" | "clientId" | "rate" | "budgetHours"> {
  const errors: FormErrors<"name" | "clientId" | "rate" | "budgetHours"> = {};
  if (!draft.name.trim()) errors.name = "نام پروژه را وارد کن.";
  if (!draft.clientId) errors.clientId = "یک مشتری را انتخاب یا همین‌جا ایجاد کن.";
  if (draft.rate < 0) errors.rate = "نرخ ساعتی نمی‌تواند منفی باشد.";
  if (draft.budgetHours < 0) errors.budgetHours = "بودجه زمانی نمی‌تواند منفی باشد.";
  return errors;
}

export function validateInvoiceDraft(draft: {
  clientId: string;
  issuedAt: string;
  dueAt: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
}): FormErrors<"clientId" | "issuedAt" | "dueAt" | "description" | "quantity" | "unitPrice" | "discount" | "taxPercent"> {
  const errors: FormErrors<"clientId" | "issuedAt" | "dueAt" | "description" | "quantity" | "unitPrice" | "discount" | "taxPercent"> = {};
  if (!draft.clientId) errors.clientId = "مشتری فاکتور را انتخاب یا ایجاد کن.";
  if (!draft.issuedAt) errors.issuedAt = "تاریخ صدور الزامی است.";
  if (draft.dueAt && draft.issuedAt && draft.dueAt < draft.issuedAt) errors.dueAt = "سررسید نمی‌تواند قبل از تاریخ صدور باشد.";
  if (!draft.description.trim()) errors.description = "شرح صورتحساب را وارد کن.";
  if (draft.quantity <= 0) errors.quantity = "تعداد باید بیشتر از صفر باشد.";
  if (draft.unitPrice < 0) errors.unitPrice = "مبلغ واحد نمی‌تواند منفی باشد.";
  if (draft.discount < 0) errors.discount = "تخفیف نمی‌تواند منفی باشد.";
  if (draft.taxPercent < 0) errors.taxPercent = "درصد مالیات نمی‌تواند منفی باشد.";
  return errors;
}

export function validateExpenseDraft(draft: { title: string; amount: number; date: string }): FormErrors<"title" | "amount" | "date"> {
  const errors: FormErrors<"title" | "amount" | "date"> = {};
  if (!draft.title.trim()) errors.title = "عنوان هزینه را وارد کن.";
  if (draft.amount <= 0) errors.amount = "مبلغ هزینه باید بیشتر از صفر باشد.";
  if (!draft.date) errors.date = "تاریخ هزینه را انتخاب کن.";
  return errors;
}
