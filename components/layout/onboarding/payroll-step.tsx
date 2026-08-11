import { Banknote, CalendarClock, Sparkles } from "lucide-react";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import { NumberField } from "@/components/common/number-field";
import { updateOnboardingHolidayMultiplier, updateOnboardingOvertimeMultiplier, updateOnboardingSalary } from "@/lib/onboarding-settings";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

export function PayrollStep({ settings, updateSettings }: { settings: AppData["settings"]; updateSettings: UpdateSettings }) {
  const { s, money } = useSystemUi();
  const monthlyPolicy = settings.payrollPolicy.baseMode.startsWith("monthly-");
  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[680px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Banknote /></span>
        <h1>{s("Set pay and multipliers to match your contract")}</h1>
        <p>{s("This step is optional. You can fine-tune pay and multipliers later in Settings.")}</p>
      </div>
      <div className="mx-auto grid max-w-[820px] gap-3 text-start md:grid-cols-3">
        <label className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-[11px] font-bold text-[var(--text-muted)] md:col-span-3">
          <span className="flex items-center justify-between gap-3 text-[var(--text)]"><span className="inline-flex items-center gap-2"><Banknote className="size-4 text-[var(--accent-strong)]" /> {s("Monthly salary")}</span><small className="font-semibold text-[var(--text-muted)]">{s("Toman")}</small></span>
          <NumberField data-onboarding-salary min={0} step={500000} value={settings.salary} onValueChange={(salary) => updateSettings((current) => updateOnboardingSalary(current, salary))} />
          <small className="font-medium leading-5">{s("Current value: {value} Toman. Enter 0 if you do not want a base amount calculation.", { value: money(settings.salary) })}</small>
        </label>
        <label className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-[11px] font-bold text-[var(--text-muted)]"><span className="inline-flex items-center gap-2 text-[var(--text)]"><Sparkles className="size-4 text-[var(--accent-strong)]" /> {s("Overtime multiplier")}</span><NumberField min={0} max={10} step={0.1} value={settings.overtimeMultiplier} onValueChange={(value) => updateSettings((current) => updateOnboardingOvertimeMultiplier(current, value))} /></label>
        <label className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-[11px] font-bold text-[var(--text-muted)]"><span className="inline-flex items-center gap-2 text-[var(--text)]"><CalendarClock className="size-4 text-[var(--accent-strong)]" /> {s("Holiday multiplier")}</span><NumberField min={0} max={10} step={0.1} value={settings.holidayMultiplier} onValueChange={(value) => updateSettings((current) => updateOnboardingHolidayMultiplier(current, value))} /></label>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[10px] leading-6 text-[var(--text-muted)]"><strong className="block text-[11px] text-[var(--text)]">{s("Active method: {method}", { method: settings.payrollPolicy.title })}</strong>{monthlyPolicy ? s("The entered salary is synced with the base amount of the monthly method.") : s("The active method is not monthly, so only the reference salary is saved to avoid overwriting advanced settings.")}</div>
      </div>
    </StepShell>
  );
}
