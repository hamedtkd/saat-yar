import { CalendarDays } from "lucide-react";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import { WorkScheduleEditor } from "@/components/pages/settings/work-schedule-editor";
import { createWorkSettingsDraft } from "@/components/pages/settings/work-settings-types";
import { mergeWorkSettings } from "@/lib/work-settings-sync";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

export function ScheduleStep({ settings, updateSettings }: { settings: AppData["settings"]; updateSettings: UpdateSettings }) {
  const { s } = useSystemUi();
  const value = createWorkSettingsDraft(settings);
  return (
    <StepShell>
      <div className="mx-auto mb-6 max-w-[760px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><CalendarDays /></span>
        <h1>{s("Set your real work schedule")}</h1>
        <p>{s("Choose active days, start and end times, lunch, and net-work targets so Today and Reports use the same contract.")}</p>
      </div>
      <div data-onboarding-work-schedule className="text-start"><WorkScheduleEditor value={value} disabled={false} onChange={(next) => updateSettings((current) => mergeWorkSettings(current, next))} /></div>
      <p className="mx-auto mt-3 max-w-[780px] text-center text-[10px] leading-5 text-[var(--text-muted)]">{s("Keep at least one workday enabled. Weekly target changes are distributed across active days and each day end time updates accordingly.")}</p>
    </StepShell>
  );
}
