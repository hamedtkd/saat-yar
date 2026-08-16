"use client";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import { NumberField } from "@/components/common/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PayrollCalculationPolicy, PayrollPremiumMode, PayrollRateBasis } from "@/lib/payroll-policy";
import type { SystemMessageKey } from "@/lib/i18n/system";

type Props = { policy: PayrollCalculationPolicy; disabled: boolean; financialsHidden: boolean; onChange: (next: PayrollCalculationPolicy) => void };
const baseLabels: Record<PayrollCalculationPolicy["baseMode"], SystemMessageKey> = { "monthly-prorated": "Monthly by attendance", "monthly-fixed": "Fixed monthly", hourly: "Hourly", daily: "Daily" };

export function PayrollPolicyControls({ policy, disabled, financialsHidden, onChange }: Props) {
  const { s } = useSystemUi();
  const patch = (next: Partial<PayrollCalculationPolicy>) => onChange({ ...policy, ...next });
  const patchRate = (key: "overtime" | "holiday", next: Partial<PayrollCalculationPolicy[typeof key]>) => onChange({ ...policy, [key]: { ...policy[key], ...next } });
  const monthly = policy.baseMode.startsWith("monthly-");
  return (
    <fieldset disabled={disabled} className="grid gap-4 disabled:opacity-70">
      <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>{s("Base method")}<Select value={policy.baseMode} onValueChange={(baseMode) => patch({ baseMode: baseMode as PayrollCalculationPolicy["baseMode"], id: baseMode, title: s(baseLabels[baseMode as PayrollCalculationPolicy["baseMode"]]) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(baseLabels).map(([value, label]) => <SelectItem key={value} value={value}>{s(label)}</SelectItem>)}</SelectContent></Select></label>
        <MoneyField label={policy.baseMode === "hourly" ? s("Base hourly rate") : policy.baseMode === "daily" ? s("Base daily amount") : s("Monthly base salary")} value={policy.baseAmount} hidden={financialsHidden} onChange={(baseAmount) => patch({ baseAmount })} />
        {policy.baseMode === "daily" && <label>{s("Standard hours per day")}<NumberField step="0.25" value={policy.standardDayMinutes / 60} min={0.25} onValueChange={(hours) => patch({ standardDayMinutes: Math.max(15, Math.round(hours * 60)) })} /></label>}
      </div>
      {monthly && <MonthlyRateBasis policy={policy} onChange={patch} />}
      <RateRule label={s("Overtime")} rule={policy.overtime} hidden={financialsHidden} onChange={(next) => patchRate("overtime", next)} />
      <RateRule label={s("Holiday work")} rule={policy.holiday} hidden={financialsHidden} onChange={(next) => patchRate("holiday", next)} />
      <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>{s("Deficit")}<Select value={policy.deficit.mode} onValueChange={(mode) => patch({ deficit: { ...policy.deficit, mode: mode as PayrollCalculationPolicy["deficit"]["mode"] } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deduct">{s("Deduct from pay")}</SelectItem><SelectItem value="ignore">{s("Ignore")}</SelectItem></SelectContent></Select></label>
        {policy.deficit.mode === "deduct" && <label>{s("Deficit multiplier")}<NumberField step="0.1" value={policy.deficit.multiplier} onValueChange={(multiplier) => patch({ deficit: { ...policy.deficit, multiplier } })} /></label>}
        <label>{s("Rounding")}<Select value={policy.rounding.mode} onValueChange={(mode) => patch({ rounding: { ...policy.rounding, mode: mode as PayrollCalculationPolicy["rounding"]["mode"] } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nearest">{s("Nearest")}</SelectItem><SelectItem value="floor">{s("Round down")}</SelectItem><SelectItem value="ceil">{s("Round up")}</SelectItem></SelectContent></Select></label>
        <label>{s("Rounding increment (Toman)")}<NumberField value={policy.rounding.increment} min={1} onValueChange={(increment) => patch({ rounding: { ...policy.rounding, increment } })} /></label>
      </div>
    </fieldset>
  );
}

function MonthlyRateBasis({ policy, onChange }: { policy: PayrollCalculationPolicy; onChange: (next: Partial<PayrollCalculationPolicy>) => void }) {
  const { s } = useSystemUi();
  const standardMonth = policy.rateBasis === "standard-month";
  return (
    <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3" data-payroll-rate-basis>
      <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
        <label>{s("Hourly rate basis")}<Select value={policy.rateBasis} onValueChange={(rateBasis) => onChange({ rateBasis: rateBasis as PayrollRateBasis })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard-month">{s("Standard month (recommended)")}</SelectItem><SelectItem value="period-target">{s("Period target hours")}</SelectItem></SelectContent></Select></label>
        {standardMonth && <label>{s("Standard monthly hours")}<NumberField step="1" min={1} value={policy.standardMonthMinutes / 60} onValueChange={(hours) => onChange({ standardMonthMinutes: Math.max(60, Math.round(hours * 60)) })} /></label>}
      </div>
      <p className="text-[10px] leading-6 text-[var(--text-muted)]">{standardMonth ? s("Monthly salary is divided by standard monthly hours for overtime, holiday work, and deficit rates.") : s("Monthly salary is divided by the target hours of the calculated period.")}</p>
    </div>
  );
}

function RateRule({ label, rule, hidden, onChange }: { label: string; rule: PayrollCalculationPolicy["overtime"]; hidden: boolean; onChange: (next: Partial<PayrollCalculationPolicy["overtime"]>) => void }) {
  const { s } = useSystemUi();
  return <div className="grid grid-cols-3 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 max-[620px]:grid-cols-1"><label>{label}<Select value={rule.mode} onValueChange={(mode) => onChange({ mode: mode as PayrollPremiumMode })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiplier">{s("Base-rate multiplier")}</SelectItem><SelectItem value="fixed-hourly">{s("Fixed hourly rate")}</SelectItem><SelectItem value="ignore">{s("Do not calculate")}</SelectItem></SelectContent></Select></label>{rule.mode === "multiplier" && <label>{s("Multiplier")}<NumberField step="0.1" value={rule.multiplier} onValueChange={(multiplier) => onChange({ multiplier })} /></label>}{rule.mode === "fixed-hourly" && <MoneyField label={s("Hourly rate")} value={rule.hourlyRate} hidden={hidden} onChange={(hourlyRate) => onChange({ hourlyRate })} />}</div>;
}

function MoneyField({ label, value, hidden, onChange }: { label: string; value: number; hidden: boolean; onChange: (value: number) => void }) {
  return <label>{label}{hidden ? <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 font-black tracking-[.2em] text-[var(--text-muted)]">••••••</div> : <NumberField value={value} onValueChange={onChange} />}</label>;
}
