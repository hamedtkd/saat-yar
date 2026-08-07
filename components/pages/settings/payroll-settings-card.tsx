"use client";

import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { useState } from "react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { money } from "@/lib/format";
import {
  calculatePayrollComponentTotals, clonePayrollComponents, createPayrollComponent,
  normalizePayrollComponents, validatePayrollComponents,
} from "@/lib/payroll-components";
import type { AppData, PayrollComponent } from "@/lib/types";
import { EditableCardActions } from "./editing/editable-card-actions";

type Props = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
  financialsHidden: boolean;
};

export function PayrollSettingsCard({ data, setData, setToast, financialsHidden }: Props) {
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const value = clonePayrollComponents(data.settings.payrollComponents);
  const saveSettings = (payrollComponents: PayrollComponent[]) => setData((previous) => ({
    ...previous,
    settings: { ...previous.settings, payrollComponents: clonePayrollComponents(payrollComponents) },
  }));
  const editor = useSettingsDraft({
    value,
    autoSave: data.settings.autoSaveSettings,
    label: "مزایا و کسورات حقوق",
    prepare: normalizePayrollComponents,
    onSave: saveSettings,
  });
  const items = editor.draft;
  const validationError = validatePayrollComponents(items);
  const totals = calculatePayrollComponentTotals(items);

  const addItem = () => editor.update((current) => [
    ...current,
    createPayrollComponent(crypto.randomUUID()),
  ]);

  const updateItem = (id: string, patch: Partial<PayrollComponent>) => editor.update((current) =>
    current.map((item) => item.id === id ? { ...item, ...patch } : item),
  );

  const confirmRemoval = () => {
    if (!pendingRemovalId) return;
    editor.update((current) => current.filter((item) => item.id !== pendingRemovalId));
    setToast(data.settings.autoSaveSettings ? "آیتم حقوقی حذف شد" : "آیتم از پیش‌نویس حذف شد؛ برای اعمال، ذخیره کن");
    setPendingRemovalId(null);
  };

  const save = () => {
    if (validationError) return setToast(validationError);
    editor.save();
    setToast("مزایا و کسورات حقوق ذخیره شد");
  };

  return (
    <section className="col-span-full overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <div className="border-b border-[var(--border)] p-5">
        <PanelHead icon={<ReceiptText />} title="مزایا و کسورات حقوق">
          <EditableCardActions
            editing={editor.manualEditing}
            dirty={editor.dirty && !validationError}
            autoSave={data.settings.autoSaveSettings}
            onEdit={editor.beginEdit}
            onSave={save}
            onCancel={editor.cancel}
          />
        </PanelHead>
        <p className="text-[10px] leading-6 text-[var(--text-muted)]">
          در حالت ویرایش، افزودن، تغییر و حذف ردیف‌ها تا زمان ذخیره وارد داده اصلی نمی‌شود.
        </p>
      </div>

      <fieldset disabled={!editor.editing} className="grid gap-4 p-4 disabled:opacity-70 sm:p-5">
        <div className="grid gap-2">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[40px_1fr_150px_180px_40px] items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 max-[760px]:grid-cols-1">
              <label className="flex items-center justify-center pb-3 max-[760px]:justify-start">
                <Checkbox checked={item.enabled !== false} onCheckedChange={(enabled) => updateItem(item.id, { enabled })} aria-label={`فعال بودن ${item.title || "آیتم حقوقی"}`} />
              </label>
              <label>عنوان<Input maxLength={80} value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} /></label>
              <label>نوع<Select value={item.type} onValueChange={(type) => updateItem(item.id, { type: type as PayrollComponent["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="earning">مزایا</SelectItem><SelectItem value="deduction">کسورات</SelectItem></SelectContent></Select></label>
              <label>مبلغ (تومان){financialsHidden ? <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 font-black tracking-[.2em]">••••••</div> : <NumberField value={item.amount} min={0} onValueChange={(amount) => updateItem(item.id, { amount })} />}</label>
              <Button type="button" size="icon" variant="destructive" onClick={() => setPendingRemovalId(item.id)} aria-label={`حذف ${item.title || "آیتم حقوقی"}`}><Trash2 /></Button>
            </div>
          ))}
          {!items.length && <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-[var(--text-muted)]">هنوز مزایا یا کسوراتی ثبت نشده است.</div>}
        </div>

        {validationError && editor.editing && <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[10px] font-semibold text-[var(--danger)]">{validationError}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={addItem}><Plus /> افزودن آیتم</Button>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-[var(--text-muted)]">
            <span>مزایا: {financialsHidden ? "••••••" : money(totals.earnings)} تومان</span>
            <span>کسورات: {financialsHidden ? "••••••" : money(totals.deductions)} تومان</span>
          </div>
        </div>
      </fieldset>

      <AlertDialog open={Boolean(pendingRemovalId)} onOpenChange={(open: boolean) => !open && setPendingRemovalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>این آیتم حقوقی حذف شود؟</AlertDialogTitle>
            <AlertDialogDescription>
              در حالت ذخیره دستی، حذف فقط روی پیش‌نویس اعمال می‌شود و با انصراف قابل بازگشت است. در حالت ذخیره خودکار، حذف بلافاصله ثبت خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={confirmRemoval}>بله، حذف شود</AlertDialogAction>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
