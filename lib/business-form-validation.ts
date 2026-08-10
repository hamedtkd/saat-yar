import { DEFAULT_LOCALE, type Locale } from "./i18n/locales.ts";
import { translateBusiness } from "./i18n/business.ts";
import type { ClientDraft, ProjectDraft } from "./types.ts";

export type FormErrors<K extends string> = Partial<Record<K, string>>;

export function hasFormErrors<K extends string>(errors: FormErrors<K>) {
  return Object.values(errors as Record<string, string | undefined>).some(Boolean);
}

export function validateClientDraft(draft: ClientDraft, locale: Locale = DEFAULT_LOCALE): FormErrors<"name" | "email"> {
  const errors: FormErrors<"name" | "email"> = {};
  if (!draft.name.trim()) errors.name = translateBusiness(locale, "validation.client.name");
  if (draft.email.trim() && !/^\S+@\S+\.\S+$/.test(draft.email.trim())) errors.email = translateBusiness(locale, "validation.client.email");
  return errors;
}

export function validateProjectDraft(draft: ProjectDraft, locale: Locale = DEFAULT_LOCALE): FormErrors<"name" | "clientId" | "rate" | "budgetHours"> {
  const errors: FormErrors<"name" | "clientId" | "rate" | "budgetHours"> = {};
  if (!draft.name.trim()) errors.name = translateBusiness(locale, "validation.project.name");
  if (!draft.clientId) errors.clientId = translateBusiness(locale, "validation.project.client");
  if (draft.rate < 0) errors.rate = translateBusiness(locale, "validation.project.rate");
  if (draft.budgetHours < 0) errors.budgetHours = translateBusiness(locale, "validation.project.budget");
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
}, locale: Locale = DEFAULT_LOCALE): FormErrors<"clientId" | "issuedAt" | "dueAt" | "description" | "quantity" | "unitPrice" | "discount" | "taxPercent"> {
  const errors: FormErrors<"clientId" | "issuedAt" | "dueAt" | "description" | "quantity" | "unitPrice" | "discount" | "taxPercent"> = {};
  if (!draft.clientId) errors.clientId = translateBusiness(locale, "validation.invoice.client");
  if (!draft.issuedAt) errors.issuedAt = translateBusiness(locale, "validation.invoice.issued");
  if (draft.dueAt && draft.issuedAt && draft.dueAt < draft.issuedAt) errors.dueAt = translateBusiness(locale, "validation.invoice.due");
  if (!draft.description.trim()) errors.description = translateBusiness(locale, "validation.invoice.description");
  if (draft.quantity <= 0) errors.quantity = translateBusiness(locale, "validation.invoice.quantity");
  if (draft.unitPrice < 0) errors.unitPrice = translateBusiness(locale, "validation.invoice.unitPrice");
  if (draft.discount < 0) errors.discount = translateBusiness(locale, "validation.invoice.discount");
  if (draft.taxPercent < 0) errors.taxPercent = translateBusiness(locale, "validation.invoice.tax");
  return errors;
}

export function validateExpenseDraft(draft: { title: string; amount: number; date: string }, locale: Locale = DEFAULT_LOCALE): FormErrors<"title" | "amount" | "date"> {
  const errors: FormErrors<"title" | "amount" | "date"> = {};
  if (!draft.title.trim()) errors.title = translateBusiness(locale, "validation.expense.title");
  if (draft.amount <= 0) errors.amount = translateBusiness(locale, "validation.expense.amount");
  if (!draft.date) errors.date = translateBusiness(locale, "validation.expense.date");
  return errors;
}
