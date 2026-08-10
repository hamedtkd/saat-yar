"use client";

import { Calculator } from "lucide-react";
import { useMemo } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { createPayrollPreview } from "@/lib/payroll-preview";
import { clonePayrollPolicy, normalizePayrollPolicy, validatePayrollPolicy, type PayrollCalculationPolicy } from "@/lib/payroll-policy";
import type { AppData } from "@/lib/types";
import { EditableCardActions } from "./editing/editable-card-actions";
import { PayrollPolicyControls } from "./payroll-policy-controls";
import { PayrollPolicyPreview } from "./payroll-policy-preview";

export function PayrollPolicyCard({ data, setData, setToast, financialsHidden }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void; financialsHidden: boolean }) {
  const { locale, s } = useSystemUi();
  const value = clonePayrollPolicy(data.settings.payrollPolicy);
  const savePolicy = (raw: PayrollCalculationPolicy) => {
    const policy = normalizePayrollPolicy(raw);
    setData((previous) => ({ ...previous, settings: { ...previous.settings, payrollPolicy: clonePayrollPolicy(policy), salary: policy.baseMode.startsWith("monthly-") ? policy.baseAmount : previous.settings.salary, overtimeMultiplier: policy.overtime.mode === "multiplier" ? policy.overtime.multiplier : previous.settings.overtimeMultiplier, holidayMultiplier: policy.holiday.mode === "multiplier" ? policy.holiday.multiplier : previous.settings.holidayMultiplier } }));
  };
  const editor = useSettingsDraft({ value, autoSave: data.settings.autoSaveSettings, label: s("Payroll calculation method"), prepare: normalizePayrollPolicy, onSave: savePolicy });
  const error = validatePayrollPolicy(editor.draft, locale);
  const previewData = useMemo(() => ({ ...data, settings: { ...data.settings, payrollPolicy: editor.draft } }), [data, editor.draft]);
  const preview = useMemo(() => createPayrollPreview(previewData), [previewData]);
  return (
    <section id="settings-payroll" className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5"><div className="grid gap-2"><PanelHead icon={<Calculator />} title={s("Payroll calculation method")} /><p className="text-[10px] leading-6 text-[var(--text-muted)]">{s("Configure base formula, overtime, holiday work, deficit, and rounding to match your contract.")}</p></div><EditableCardActions editing={editor.manualEditing} dirty={editor.dirty && !error} autoSave={data.settings.autoSaveSettings} onEdit={editor.beginEdit} onSave={() => { if (error) return setToast(error); editor.save(); setToast(s("Payroll calculation method was saved")); }} onCancel={editor.cancel} /></div>
      <div className="grid gap-4 p-4 sm:p-5"><PayrollPolicyControls policy={editor.draft} disabled={!editor.editing} financialsHidden={financialsHidden} onChange={editor.update} />{error && editor.editing && <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[10px] font-semibold text-[var(--danger)]">{error}</p>}<PayrollPolicyPreview preview={preview} hidden={financialsHidden} /></div>
    </section>
  );
}
