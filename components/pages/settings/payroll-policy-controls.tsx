"use client";

import { NumberField } from "@/components/common/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PayrollCalculationPolicy, PayrollPremiumMode } from "@/lib/payroll-policy";

type Props = {
  policy: PayrollCalculationPolicy;
  disabled: boolean;
  financialsHidden: boolean;
  onChange: (next: PayrollCalculationPolicy) => void;
};

const baseLabels = {
  "monthly-prorated": "ماهانه بر اساس کارکرد",
  "monthly-fixed": "ماهانه ثابت",
  hourly: "ساعتی",
  daily: "روزکاری",
} as const;

export function PayrollPolicyControls({ policy, disabled, financialsHidden, onChange }: Props) {
  const patch = (next: Partial<PayrollCalculationPolicy>) => onChange({ ...policy, ...next });
  const patchRate = (key: "overtime" | "holiday", next: Partial<PayrollCalculationPolicy[typeof key]>) =>
    onChange({ ...policy, [key]: { ...policy[key], ...next } });
  return (
    <fieldset disabled={disabled} className="grid gap-4 disabled:opacity-70">
      <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>روش پایه<Select value={policy.baseMode} onValueChange={(baseMode) => patch({ baseMode: baseMode as PayrollCalculationPolicy["baseMode"], id: baseMode, title: baseLabels[baseMode as keyof typeof baseLabels] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(baseLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
        <MoneyField label={policy.baseMode === "hourly" ? "نرخ پایه هر ساعت" : policy.baseMode === "daily" ? "مبلغ پایه هر روز" : "حقوق پایه ماهانه"} value={policy.baseAmount} hidden={financialsHidden} onChange={(baseAmount) => patch({ baseAmount })} />
        <label>ساعت استاندارد روز<NumberField step="0.25" value={policy.standardDayMinutes / 60} min={0.25} onValueChange={(hours) => patch({ standardDayMinutes: Math.max(15, Math.round(hours * 60)) })} /></label>
      </div>
      <RateRule label="اضافه‌کاری" rule={policy.overtime} hidden={financialsHidden} onChange={(next) => patchRate("overtime", next)} />
      <RateRule label="تعطیل‌کاری" rule={policy.holiday} hidden={financialsHidden} onChange={(next) => patchRate("holiday", next)} />
      <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>کسر کار<Select value={policy.deficit.mode} onValueChange={(mode) => patch({ deficit: { ...policy.deficit, mode: mode as PayrollCalculationPolicy["deficit"]["mode"] } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deduct">از حقوق کسر شود</SelectItem><SelectItem value="ignore">نادیده گرفته شود</SelectItem></SelectContent></Select></label>
        {policy.deficit.mode === "deduct" && <label>ضریب کسر کار<NumberField step="0.1" value={policy.deficit.multiplier} onValueChange={(multiplier) => patch({ deficit: { ...policy.deficit, multiplier } })} /></label>}
        <label>گردکردن<Select value={policy.rounding.mode} onValueChange={(mode) => patch({ rounding: { ...policy.rounding, mode: mode as PayrollCalculationPolicy["rounding"]["mode"] } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nearest">نزدیک‌ترین</SelectItem><SelectItem value="floor">رو به پایین</SelectItem><SelectItem value="ceil">رو به بالا</SelectItem></SelectContent></Select></label>
        <label>گام گردکردن (تومان)<NumberField value={policy.rounding.increment} min={1} onValueChange={(increment) => patch({ rounding: { ...policy.rounding, increment } })} /></label>
      </div>
    </fieldset>
  );
}

function RateRule({ label, rule, hidden, onChange }: { label: string; rule: PayrollCalculationPolicy["overtime"]; hidden: boolean; onChange: (next: Partial<PayrollCalculationPolicy["overtime"]>) => void }) {
  return <div className="grid grid-cols-3 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 max-[620px]:grid-cols-1"><label>{label}<Select value={rule.mode} onValueChange={(mode) => onChange({ mode: mode as PayrollPremiumMode })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiplier">ضریب نرخ پایه</SelectItem><SelectItem value="fixed-hourly">نرخ ساعتی ثابت</SelectItem><SelectItem value="ignore">محاسبه نشود</SelectItem></SelectContent></Select></label>{rule.mode === "multiplier" && <label>ضریب<NumberField step="0.1" value={rule.multiplier} onValueChange={(multiplier) => onChange({ multiplier })} /></label>}{rule.mode === "fixed-hourly" && <MoneyField label="نرخ هر ساعت" value={rule.hourlyRate} hidden={hidden} onChange={(hourlyRate) => onChange({ hourlyRate })} />}</div>;
}

function MoneyField({ label, value, hidden, onChange }: { label: string; value: number; hidden: boolean; onChange: (value: number) => void }) {
  return <label>{label}{hidden ? <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 font-black tracking-[.2em] text-[var(--text-muted)]">••••••</div> : <NumberField value={value} onValueChange={onChange} />}</label>;
}
