import { CalendarDays } from "lucide-react";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import { WorkScheduleEditor } from "@/components/pages/settings/work-schedule-editor";
import { createWorkSettingsDraft } from "@/components/pages/settings/work-settings-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mergeWorkSettings } from "@/lib/work-settings-sync";
import type { AppData, WorkTimingMode } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

export function ScheduleStep({ settings, updateSettings }: { settings: AppData["settings"]; updateSettings: UpdateSettings }) {
  const { s } = useSystemUi();
  const value = createWorkSettingsDraft(settings);
  const setTimingMode = (workTimingMode: WorkTimingMode) => updateSettings((current) => ({ ...current, workTimingMode }));
  return (
    <StepShell>
      <div className="mx-auto mb-6 max-w-[760px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><CalendarDays /></span>
        <h1>{s("Set your real work schedule")}</h1>
        <p>{settings.workTimingMode === "flexible" ? s("Choose active days and net-work targets. You can start, pause, and finish whenever you need without fixed clock times.") : s("Choose active days, start and end times, lunch, and net-work targets so Today and Reports use the same contract.")}</p>
      </div>
      <label className="mx-auto mb-4 grid max-w-[460px] gap-1.5 text-start text-[10px] font-bold text-[var(--text-muted)]">
        <span>{s("Work timing")}</span>
        <Select value={settings.workTimingMode} onValueChange={(mode) => setTimingMode(mode as WorkTimingMode)}>
          <SelectTrigger data-onboarding-work-timing><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem data-work-timing-option="scheduled" value="scheduled">{s("Fixed schedule")}</SelectItem>
            <SelectItem data-work-timing-option="flexible" value="flexible">{s("Flexible schedule")}</SelectItem>
          </SelectContent>
        </Select>
        <small className="font-medium leading-5">{settings.workTimingMode === "flexible" ? s("Start and stop whenever you need; daily targets stay independent from fixed clock times.") : s("Start and end times define the target for each enabled day.")}</small>
      </label>
      <div data-onboarding-work-schedule className="text-start"><WorkScheduleEditor value={value} disabled={false} onChange={(next) => updateSettings((current) => mergeWorkSettings(current, next))} /></div>
      <p className="mx-auto mt-3 max-w-[780px] text-center text-[10px] leading-5 text-[var(--text-muted)]">{settings.workTimingMode === "flexible" ? s("Keep at least one workday enabled. Weekly target changes are distributed across active days without forcing fixed start or end times.") : s("Keep at least one workday enabled. Weekly target changes are distributed across active days and each day end time updates accordingly.")}</p>
    </StepShell>
  );
}
