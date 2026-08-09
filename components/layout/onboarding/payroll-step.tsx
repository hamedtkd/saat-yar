import { Banknote, CalendarClock, Sparkles } from "lucide-react";

import { NumberField } from "@/components/common/number-field";
import { money } from "@/lib/format";
import {
  updateOnboardingHolidayMultiplier,
  updateOnboardingOvertimeMultiplier,
  updateOnboardingSalary,
} from "@/lib/onboarding-settings";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

export function PayrollStep({ settings, updateSettings }: { settings: AppData["settings"]; updateSettings: UpdateSettings }) {
  const monthlyPolicy = settings.payrollPolicy.baseMode.startsWith("monthly-");
  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[680px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Banknote /></span>
        <h1>حقوق و ضرایب را مطابق قرارداد خودت بگذار</h1>
        <p>این مرحله اختیاری است؛ مبلغ و ضرایب را می‌توانی بعداً از تنظیمات حقوق دقیق‌تر کنی.</p>
      </div>

      <div className="mx-auto grid max-w-[820px] gap-3 text-right md:grid-cols-3">
        <label className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-[11px] font-bold text-[var(--text-muted)] md:col-span-3">
          <span className="flex items-center justify-between gap-3 text-[var(--text)]"><span className="inline-flex items-center gap-2"><Banknote className="size-4 text-[var(--accent-strong)]" /> حقوق ماهانه</span><small className="font-semibold text-[var(--text-muted)]">تومان</small></span>
          <NumberField data-onboarding-salary min={0} step={500000} value={settings.salary} onValueChange={(salary) => updateSettings((current) => updateOnboardingSalary(current, salary))} />
          <small className="font-medium leading-5">مقدار فعلی: {money(settings.salary)} تومان. برای نداشتن محاسبه مبلغ پایه، مقدار ۰ وارد کن.</small>
        </label>

        <label className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-[11px] font-bold text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-2 text-[var(--text)]"><Sparkles className="size-4 text-[var(--accent-strong)]" /> ضریب اضافه‌کاری</span>
          <NumberField min={0} max={10} step={0.1} value={settings.overtimeMultiplier} onValueChange={(value) => updateSettings((current) => updateOnboardingOvertimeMultiplier(current, value))} />
        </label>

        <label className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-[11px] font-bold text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-2 text-[var(--text)]"><CalendarClock className="size-4 text-[var(--accent-strong)]" /> ضریب تعطیل‌کاری</span>
          <NumberField min={0} max={10} step={0.1} value={settings.holidayMultiplier} onValueChange={(value) => updateSettings((current) => updateOnboardingHolidayMultiplier(current, value))} />
        </label>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[10px] leading-6 text-[var(--text-muted)]">
          <strong className="block text-[11px] text-[var(--text)]">روش فعال: {settings.payrollPolicy.title}</strong>
          {monthlyPolicy ? "حقوق واردشده هم‌زمان با مبلغ پایه روش ماهانه ذخیره می‌شود." : "روش فعال ماهانه نیست؛ برای جلوگیری از بازنویسی تنظیمات پیشرفته، فقط مقدار مرجع حقوق ذخیره می‌شود."}
        </div>
      </div>
    </StepShell>
  );
}
