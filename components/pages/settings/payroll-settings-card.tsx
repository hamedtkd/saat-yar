import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import type { AppData, PayrollComponent } from "@/lib/types";

export function PayrollSettingsCard({ data, setData, setToast, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
  financialsHidden: boolean;
}) {
  const items = data.settings.payrollComponents;

  function updateItems(payrollComponents: PayrollComponent[]) {
    setData((previous) => ({ ...previous, settings: { ...previous.settings, payrollComponents } }));
  }

  function addItem() {
    updateItems([...items, { id: crypto.randomUUID(), title: "مزایای جدید", amount: 0, type: "earning", enabled: true }]);
  }

  function updateItem(id: string, patch: Partial<PayrollComponent>) {
    updateItems(items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function removeItem(id: string) {
    updateItems(items.filter((item) => item.id !== id));
    setToast("آیتم حقوقی حذف شد");
  }

  const earnings = items.filter((item) => item.enabled !== false && item.type === "earning").reduce((sum, item) => sum + item.amount, 0);
  const deductions = items.filter((item) => item.enabled !== false && item.type === "deduction").reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="col-span-full rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[0_10px_35px_rgba(17,45,55,.055)]">
      <PanelHead icon={<ReceiptText />} title="مزایا و کسورات حقوق" />
      <p className="mb-4 text-[10px] leading-6 text-[var(--text-muted)]">حق مسکن، بن، پاداش، بیمه، مالیات یا هر آیتم ثابت ماهانه را تعریف کن. این مقادیر در فیش حقوقی ماهانه اعمال می‌شوند.</p>
      <div className="mb-4 grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[40px_1fr_150px_180px_40px] items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 max-[760px]:grid-cols-1">
            <label className="flex items-center justify-center pb-3 max-[760px]:justify-start">
              <Checkbox checked={item.enabled !== false} onCheckedChange={(enabled) => updateItem(item.id, { enabled })} aria-label={`فعال بودن ${item.title}`} />
            </label>
            <label>عنوان<Input value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} /></label>
            <label>نوع<Select value={item.type} onValueChange={(value) => updateItem(item.id, { type: value as PayrollComponent["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="earning">مزایا</SelectItem><SelectItem value="deduction">کسورات</SelectItem></SelectContent></Select></label>
            <label>مبلغ (تومان){financialsHidden ? <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 font-black tracking-[.2em]">••••••</div> : <NumberField value={item.amount} min={0} onValueChange={(value) => updateItem(item.id, { amount: value })} />}</label>
            <Button type="button" size="icon" variant="outline" onClick={() => removeItem(item.id)} aria-label={`حذف ${item.title}`}><Trash2 /></Button>
          </div>
        ))}
        {!items.length && <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-[var(--text-muted)]">هنوز مزایا یا کسوراتی ثبت نشده است.</div>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={addItem}><Plus /> افزودن آیتم</Button>
        <div className="flex gap-3 text-[10px] font-bold text-[var(--text-muted)]"><span>مزایا: {financialsHidden ? "••••••" : money(earnings)} تومان</span><span>کسورات: {financialsHidden ? "••••••" : money(deductions)} تومان</span></div>
      </div>
    </section>
  );
}
