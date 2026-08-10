"use client";

import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { calculatePayrollComponentTotals, clonePayrollComponents, createPayrollComponent, normalizePayrollComponents, validatePayrollComponents } from "@/lib/payroll-components";
import type { AppData, PayrollComponent } from "@/lib/types";
import { EditableCardActions } from "./editing/editable-card-actions";

type Props = { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void; financialsHidden: boolean };

export function PayrollSettingsCard({ data, setData, setToast, financialsHidden }: Props) {
  const { locale, money, s } = useSystemUi();
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const value = clonePayrollComponents(data.settings.payrollComponents);
  const saveSettings = (payrollComponents: PayrollComponent[]) => setData((previous) => ({ ...previous, settings: { ...previous.settings, payrollComponents: clonePayrollComponents(payrollComponents) } }));
  const editor = useSettingsDraft({ value, autoSave: data.settings.autoSaveSettings, label: s("Payroll benefits and deductions"), prepare: (items) => normalizePayrollComponents(items, locale), onSave: saveSettings });
  const items = editor.draft;
  const validationError = validatePayrollComponents(items, locale);
  const totals = calculatePayrollComponentTotals(items);
  const addItem = () => editor.update((current) => [...current, createPayrollComponent(crypto.randomUUID(), locale)]);
  const updateItem = (id: string, patch: Partial<PayrollComponent>) => editor.update((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const confirmRemoval = () => {
    if (!pendingRemovalId) return;
    editor.update((current) => current.filter((item) => item.id !== pendingRemovalId));
    setToast(data.settings.autoSaveSettings ? s("Payroll item was removed") : s("Item was removed from the draft; save to apply"));
    setPendingRemovalId(null);
  };
  const save = () => { if (validationError) return setToast(validationError); editor.save(); setToast(s("Payroll benefits and deductions were saved")); };
  const itemName = (item: PayrollComponent) => item.title || s("Payroll item");

  return (
    <section id="settings-payroll-components" className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <div className="border-b border-[var(--border)] p-5"><PanelHead icon={<ReceiptText />} title={s("Payroll benefits and deductions")}><EditableCardActions editing={editor.manualEditing} dirty={editor.dirty && !validationError} autoSave={data.settings.autoSaveSettings} onEdit={editor.beginEdit} onSave={save} onCancel={editor.cancel} /></PanelHead><p className="text-[10px] leading-6 text-[var(--text-muted)]">{s("In edit mode, adding, changing, or deleting rows does not affect saved data until you save.")}</p></div>
      <fieldset disabled={!editor.editing} className="grid gap-4 p-4 disabled:opacity-70 sm:p-5">
        <div className="grid gap-2">{items.map((item) => <div key={item.id} className="grid grid-cols-[40px_1fr_150px_180px_40px] items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 max-[760px]:grid-cols-1"><label className="flex items-center justify-center pb-3 max-[760px]:justify-start"><Checkbox checked={item.enabled !== false} onCheckedChange={(enabled) => updateItem(item.id, { enabled })} aria-label={s("Enable {item}", { item: itemName(item) })} /></label><label>{s("Title")}<Input maxLength={80} value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} /></label><label>{s("Type")}<Select value={item.type} onValueChange={(type) => updateItem(item.id, { type: type as PayrollComponent["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="earning">{s("Earning")}</SelectItem><SelectItem value="deduction">{s("Deduction")}</SelectItem></SelectContent></Select></label><label>{s("Amount (Toman)")}{financialsHidden ? <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 font-black tracking-[.2em]">••••••</div> : <NumberField value={item.amount} min={0} onValueChange={(amount) => updateItem(item.id, { amount })} />}</label><Button type="button" size="icon" variant="destructive" onClick={() => setPendingRemovalId(item.id)} aria-label={s("Delete {item}", { item: itemName(item) })}><Trash2 /></Button></div>)}{!items.length && <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-[var(--text-muted)]">{s("No benefits or deductions have been added yet.")}</div>}</div>
        {validationError && editor.editing && <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[10px] font-semibold text-[var(--danger)]">{validationError}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3"><Button type="button" variant="outline" onClick={addItem}><Plus /> {s("Add item")}</Button><div className="flex flex-wrap gap-3 text-[10px] font-bold text-[var(--text-muted)]"><span>{s("Earnings: {amount} Toman", { amount: financialsHidden ? "••••••" : money(totals.earnings) })}</span><span>{s("Deductions: {amount} Toman", { amount: financialsHidden ? "••••••" : money(totals.deductions) })}</span></div></div>
      </fieldset>
      <AlertDialog open={Boolean(pendingRemovalId)} onOpenChange={(open: boolean) => !open && setPendingRemovalId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{s("Delete this payroll item?")}</AlertDialogTitle><AlertDialogDescription>{s("In manual-save mode, deletion only changes the draft and Cancel can restore it. In autosave mode, deletion is saved immediately.")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={confirmRemoval}>{s("Yes, delete")}</AlertDialogAction><AlertDialogCancel>{s("Cancel")}</AlertDialogCancel></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </section>
  );
}
