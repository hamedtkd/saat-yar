"use client";

import { useState } from "react";
import { FieldError, FormFeedback } from "@/components/common/form-feedback";
import { NumberField } from "@/components/common/number-field";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasFormErrors, validateExpenseDraft } from "@/lib/business-form-validation";
import type { ExpenseCategory } from "@/lib/types";
import { expenseCategories } from "./constants";
import type { ExpenseDraft } from "./types";

export function ExpenseForm({ draft, setDraft, onSave, onCancel }: {
  draft: ExpenseDraft;
  setDraft: React.Dispatch<React.SetStateAction<ExpenseDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validateExpenseDraft(draft) : {};
  const firstError = errors.title ?? errors.amount ?? errors.date;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateExpenseDraft(draft);
    setSubmitted(true);
    if (hasFormErrors(nextErrors)) return;
    onSave();
  };

  return (
    <form onSubmit={submit} noValidate className="mb-4 rounded-[var(--control-radius)] bg-[var(--surface-2)] p-3">
      <FormFeedback message={firstError} className="mb-3" />
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label className="grid gap-1 text-xs">عنوان<Input autoFocus aria-invalid={Boolean(errors.title)} value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} /><FieldError message={errors.title} /></label>
        <label className="grid gap-1 text-xs">مبلغ (تومان)<NumberField value={draft.amount} onValueChange={(amount) => setDraft((value) => ({ ...value, amount }))} /><FieldError message={errors.amount} /></label>
        <div className="grid gap-1 text-xs"><span className="font-semibold text-[var(--text-muted)]">تاریخ</span><JalaliDatePicker value={draft.date} onChange={(date) => setDraft((value) => ({ ...value, date }))} placeholder="تاریخ هزینه" /><FieldError message={errors.date} /></div>
        <label className="grid gap-1 text-xs">دسته‌بندی<Select value={draft.category} onValueChange={(category) => setDraft((value) => ({ ...value, category: category as ExpenseCategory }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{expenseCategories.map((item) => <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
        <label className="col-span-3 grid gap-1 text-xs max-[620px]:col-auto">یادداشت<Input value={draft.note} onChange={(event) => setDraft((value) => ({ ...value, note: event.target.value }))} /></label>
        <div className="flex items-end gap-2"><Button type="submit" className="w-full">ذخیره هزینه</Button><Button type="button" variant="outline" onClick={onCancel}>لغو</Button></div>
      </div>
    </form>
  );
}
