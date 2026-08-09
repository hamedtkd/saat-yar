import { Clock3 } from "lucide-react";
import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { NumberField } from "@/components/common/number-field";
import { TimePicker } from "@/components/pickers";
import { Checkbox } from "@/components/ui/checkbox";
import { durationWords } from "@/lib/format";
import type { WeekdayKey } from "@/lib/types";
import {
  applyLunchMinutesToAll,
  applyLunchPaidToAll,
  applyWeeklyTargetHours,
  getScheduleTargetMinutes,
  getWeeklyTargetMinutes,
  updateScheduleLunch,
  weekdayLabels,
  weekdayOrder,
} from "@/lib/work-schedule";
import type { WorkSettingsDraft } from "./work-settings-types";

export function WorkScheduleEditor({ value, disabled, onChange }: {
  value: WorkSettingsDraft;
  disabled: boolean;
  onChange: (next: WorkSettingsDraft) => void;
}) {
  const allLunchPaid = weekdayOrder.every((day) => Boolean(value.weeklySchedule[day].lunchPaid));
  const enabledDayCount = weekdayOrder.filter((day) => value.weeklySchedule[day].enabled).length;
  const weeklyTargetMinutes = getWeeklyTargetMinutes(value);
  const averageDailyTarget = enabledDayCount ? Math.round(weeklyTargetMinutes / enabledDayCount) : 0;

  const setDay = <K extends keyof WorkSettingsDraft["weeklySchedule"][WeekdayKey]>(
    day: WeekdayKey,
    key: K,
    nextValue: WorkSettingsDraft["weeklySchedule"][WeekdayKey][K],
  ) => {
    const weeklySchedule = {
      ...value.weeklySchedule,
      [day]: { ...value.weeklySchedule[day], [key]: nextValue },
    };
    onChange({
      ...value,
      weeklyMinutes: getWeeklyTargetMinutes({ ...value, weeklySchedule }),
      weeklySchedule: weeklySchedule,
    });
  };

  const setDayLunch = (day: WeekdayKey, lunchMinutes: number) => {
    const weeklySchedule = {
      ...value.weeklySchedule,
      [day]: updateScheduleLunch(value.weeklySchedule[day], { lunchMinutes }),
    };
    onChange({
      ...value,
      weeklyMinutes: getWeeklyTargetMinutes({ ...value, weeklySchedule }),
      weeklySchedule: weeklySchedule,
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
      <div className="grid gap-4 border-b border-[var(--border)] bg-[var(--surface-1)] p-4 xl:grid-cols-[1fr_auto_auto] xl:items-center">
        <div className="flex items-start gap-3 text-[var(--text)]">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Clock3 /></span>
          <div className="grid gap-1">
            <strong className="text-sm">برنامه کاری هفتگی</strong>
            <small className="max-w-3xl text-[10px] leading-5 text-[var(--text-muted)]">هدف هفتگی یعنی کار خالص و ناهار بدون حقوق جزو آن حساب نمی‌شود. ساعت خروج پیشنهادی با ورود واقعی و مدت واقعی ناهار دوباره محاسبه می‌شود.</small>
          </div>
        </div>

        <div className="grid min-w-[250px] gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[10px] font-bold text-[var(--text-muted)]">
          <span>ناهار پیش‌فرض برای همه روزها</span>
          <div className="grid grid-cols-[minmax(120px,1fr)_auto] items-center gap-2">
            <MinuteDurationField disabled={disabled} value={value.lunchMinutes} onValueChange={(minutes) => onChange(applyLunchMinutesToAll(value, minutes))} />
            <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 text-[10px] text-[var(--text)]">
              <Checkbox disabled={disabled} checked={allLunchPaid} onCheckedChange={(paid) => onChange(applyLunchPaidToAll(value, paid))} />
              <span>جزو کارکرد (با حقوق)</span>
            </label>
          </div>
          <small className="font-medium leading-4">تغییر جمعی ناهار، پایان روزها را طوری جابه‌جا می‌کند که هدف کار خالص ثابت بماند.</small>
        </div>

        <label className="grid min-w-[190px] grid-cols-[1fr_auto] items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[10px] font-bold text-[var(--text-muted)]">
          <span className="col-span-full">هدف کار خالص هفتگی</span>
          <NumberField disabled={disabled} className="h-9 min-w-0" value={Math.round(getWeeklyTargetMinutes(value) / 6) / 10} min={0} step={0.5} onValueChange={(hours) => onChange(applyWeeklyTargetHours(value, hours))} />
          <span className="pb-2">ساعت</span>
          <small className="col-span-full font-medium leading-4">{enabledDayCount ? `${enabledDayCount.toLocaleString("fa-IR")} روز فعال · میانگین ${durationWords(averageDailyTarget)} کار خالص در روز` : "هیچ روز کاری فعالی انتخاب نشده"}</small>
        </label>
      </div>

      <div className="grid gap-2 p-3 sm:p-4">
        {weekdayOrder.map((day) => {
          const schedule = value.weeklySchedule[day];
          return (
            <div key={day} className="grid grid-cols-[110px_repeat(3,minmax(130px,1fr))_128px] items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1"><Checkbox disabled={disabled} checked={schedule.enabled} onCheckedChange={(enabled) => setDay(day, "enabled", enabled)} /><strong className={schedule.enabled ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>{weekdayLabels[day]}</strong></label>
              <label>شروع<TimePicker disabled={disabled} value={schedule.start} onChange={(next) => setDay(day, "start", next)} /></label>
              <label>پایان<TimePicker disabled={disabled} value={schedule.end} onChange={(next) => setDay(day, "end", next)} /></label>
              <label>ناهار<MinuteDurationField disabled={disabled} value={schedule.lunchMinutes} onValueChange={(next) => setDayLunch(day, next)} /></label>
              <div className="grid min-h-11 place-items-center rounded-lg bg-[var(--surface-2)] px-2 py-1 text-center text-[10px] font-bold leading-4 text-[var(--text-muted)]">
                {schedule.enabled ? <><strong className="text-[var(--text)]">{durationWords(getScheduleTargetMinutes(schedule))}</strong><small className="text-[9px] font-medium">کار خالص روز</small></> : "تعطیل"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
