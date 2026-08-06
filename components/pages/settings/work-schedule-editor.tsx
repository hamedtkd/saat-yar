import { Clock3 } from "lucide-react";
import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { NumberField } from "@/components/common/number-field";
import { TimePicker } from "@/components/pickers";
import { Checkbox } from "@/components/ui/checkbox";
import type { WeekdayKey } from "@/lib/types";
import {
  applyWeeklyTargetHours,
  getScheduleTargetMinutes,
  getWeeklyTargetMinutes,
  weekdayLabels,
  weekdayOrder,
} from "@/lib/work-schedule";
import type { WorkSettingsDraft } from "./work-settings-types";

export function WorkScheduleEditor({ value, disabled, onChange }: {
  value: WorkSettingsDraft;
  disabled: boolean;
  onChange: (next: WorkSettingsDraft) => void;
}) {
  const setDay = <K extends keyof WorkSettingsDraft["weeklySchedule"][WeekdayKey]>(
    day: WeekdayKey,
    key: K,
    nextValue: WorkSettingsDraft["weeklySchedule"][WeekdayKey][K],
  ) => onChange({
    ...value,
    weeklySchedule: {
      ...value.weeklySchedule,
      [day]: { ...value.weeklySchedule[day], [key]: nextValue },
    },
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
      <div className="grid gap-4 border-b border-[var(--border)] bg-[var(--surface-1)] p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3 text-[var(--text)]">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Clock3 /></span>
          <div className="grid gap-1"><strong className="text-sm">برنامه کاری هفتگی</strong><small className="max-w-3xl text-[10px] leading-5 text-[var(--text-muted)]">هدف هفتگی میان روزهای فعال تقسیم می‌شود و پایان هر روز را هماهنگ تغییر می‌دهد.</small></div>
        </div>
        <label className="grid min-w-[190px] grid-cols-[1fr_auto] items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[10px] font-bold text-[var(--text-muted)]">
          <span className="col-span-full">هدف هفتگی</span>
          <NumberField disabled={disabled} className="h-9 min-w-0" value={Math.round(getWeeklyTargetMinutes(value) / 6) / 10} min={0} step={0.5} onValueChange={(hours) => onChange(applyWeeklyTargetHours(value, hours))} />
          <span className="pb-2">ساعت</span>
        </label>
      </div>
      <div className="grid gap-2 p-3 sm:p-4">
        {weekdayOrder.map((day) => {
          const schedule = value.weeklySchedule[day];
          return (
            <div key={day} className="grid grid-cols-[110px_repeat(3,minmax(130px,1fr))_90px] items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1"><Checkbox disabled={disabled} checked={schedule.enabled} onCheckedChange={(enabled) => setDay(day, "enabled", enabled)} /><strong className={schedule.enabled ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>{weekdayLabels[day]}</strong></label>
              <label>شروع<TimePicker disabled={disabled} value={schedule.start} onChange={(next) => setDay(day, "start", next)} /></label>
              <label>پایان<TimePicker disabled={disabled} value={schedule.end} onChange={(next) => setDay(day, "end", next)} /></label>
              <label>ناهار<MinuteDurationField disabled={disabled} value={schedule.lunchMinutes} onValueChange={(next) => setDay(day, "lunchMinutes", next)} /></label>
              <div className="flex h-11 items-center justify-center rounded-lg bg-[var(--surface-2)] px-2 text-[10px] font-bold text-[var(--text-muted)]">{schedule.enabled ? `${Math.round(getScheduleTargetMinutes(schedule) / 6) / 10} ساعت` : "تعطیل"}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
