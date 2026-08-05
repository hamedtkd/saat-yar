import { NumberField } from "@/components/common/number-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExpenseCategory } from "@/lib/types";
import { expenseCategories } from "./constants";
import type { ExpenseDraft } from "./types";

export function ExpenseForm({ draft, setDraft, onSave, onCancel }: {
  draft: ExpenseDraft;
  setDraft: React.Dispatch<React.SetStateAction<ExpenseDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-4 gap-3 rounded-[var(--control-radius)] bg-[var(--surface-2)] p-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
      <label className="grid gap-1 text-xs">عنوان<Input value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} /></label>
      <label className="grid gap-1 text-xs">مبلغ (تومان)<NumberField value={draft.amount} onValueChange={(amount) => setDraft((value) => ({ ...value, amount }))} /></label>
      <label className="grid gap-1 text-xs">تاریخ<Input type="date" value={draft.date} onChange={(event) => setDraft((value) => ({ ...value, date: event.target.value }))} /></label>
      <label className="grid gap-1 text-xs">دسته‌بندی<Select value={draft.category} onValueChange={(category) => setDraft((value) => ({ ...value, category: category as ExpenseCategory }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{expenseCategories.map((item) => <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
      <label className="col-span-3 grid gap-1 text-xs max-[620px]:col-auto">یادداشت<Input value={draft.note} onChange={(event) => setDraft((value) => ({ ...value, note: event.target.value }))} /></label>
      <div className="flex items-end gap-2"><Button className="w-full" onClick={onSave} disabled={!draft.title.trim() || draft.amount <= 0}>ذخیره هزینه</Button><Button variant="outline" onClick={onCancel}>لغو</Button></div>
    </div>
  );
}
