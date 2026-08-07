import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { PrivateMoney } from "@/components/common/private-money";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { jalali } from "@/lib/format";
import type { Expense } from "@/lib/types";
import { expenseCategories } from "./constants";
import { ExpenseForm } from "./expense-form";
import type { ExpenseDraft } from "./types";

export function ExpensesPanel({ expenses, showForm, setShowForm, draft, setDraft, onSave, onRemove, financialsHidden }: {
  expenses: Expense[];
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: ExpenseDraft;
  setDraft: React.Dispatch<React.SetStateAction<ExpenseDraft>>;
  onSave: () => void;
  onRemove: (id: string) => void;
  financialsHidden: boolean;
}) {
  return (
    <SurfaceCard as="section" className="mb-[18px] p-4">
      <PanelHead icon={<ReceiptText />} title="هزینه‌های پروژه"><Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}><Plus /> ثبت هزینه</Button></PanelHead>
      {showForm && <ExpenseForm draft={draft} setDraft={setDraft} onSave={onSave} onCancel={() => setShowForm(false)} />}
      <div className="w-full overflow-x-auto"><table className="w-full border-collapse text-[11px]"><thead><tr className="border-y border-[var(--border)] bg-[var(--surface-2)] text-right text-[var(--text-muted)]"><th className="p-3">تاریخ</th><th className="p-3">عنوان</th><th className="p-3">دسته‌بندی</th><th className="p-3">مبلغ</th><th className="p-3">عملیات</th></tr></thead><tbody>
        {expenses.map((expense) => <tr key={expense.id} className="border-b border-[var(--border)]"><td className="p-3">{jalali(expense.date)}</td><td className="p-3"><strong>{expense.title}</strong>{expense.note && <small className="mt-1 block text-[var(--text-muted)]">{expense.note}</small>}</td><td className="p-3">{expenseCategories.find((item) => item.value === expense.category)?.label}</td><td className="p-3"><PrivateMoney value={expense.amount} hidden={financialsHidden} /> تومان</td><td className="p-3"><Button size="icon" variant="ghost" aria-label="حذف هزینه" onClick={() => onRemove(expense.id)}><Trash2 /></Button></td></tr>)}
        {expenses.length === 0 && <tr><td colSpan={5}><EmptyState compact icon={<ReceiptText />} title="هنوز هزینه‌ای ثبت نشده" description="هزینه‌های پروژه را همین‌جا ثبت کن تا سود و بودجه دقیق بماند."><Button size="sm" variant="outline" onClick={() => setShowForm(true)}><Plus /> ثبت اولین هزینه</Button></EmptyState></td></tr>}
      </tbody></table></div>
    </SurfaceCard>
  );
}
