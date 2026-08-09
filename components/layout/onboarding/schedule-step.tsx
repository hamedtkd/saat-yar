import { CalendarDays } from "lucide-react";

import { WorkScheduleEditor } from "@/components/pages/settings/work-schedule-editor";
import { createWorkSettingsDraft } from "@/components/pages/settings/work-settings-types";
import { mergeWorkSettings } from "@/lib/work-settings-sync";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

export function ScheduleStep({ settings, updateSettings }: { settings: AppData["settings"]; updateSettings: UpdateSettings }) {
  const value = createWorkSettingsDraft(settings);

  return (
    <StepShell>
      <div className="mx-auto mb-6 max-w-[760px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><CalendarDays /></span>
        <h1>برنامه کاری واقعی‌ات را تنظیم کن</h1>
        <p>روزهای فعال، شروع و پایان، ناهار و هدف کار خالص را همین‌جا مشخص کن تا Today و گزارش‌ها از همان قرارداد استفاده کنند.</p>
      </div>
      <div data-onboarding-work-schedule className="text-right">
        <WorkScheduleEditor
          value={value}
          disabled={false}
          onChange={(next) => updateSettings((current) => mergeWorkSettings(current, next))}
        />
      </div>
      <p className="mx-auto mt-3 max-w-[780px] text-center text-[10px] leading-5 text-[var(--text-muted)]">حداقل یک روز کاری باید فعال بماند. تغییر هدف هفتگی بین روزهای فعال پخش می‌شود و ساعت پایان هر روز بر همان اساس به‌روز می‌شود.</p>
    </StepShell>
  );
}
