"use client";

import { Clock3 } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { NumberField } from "@/components/common/number-field";
import { TimePicker } from "@/components/pickers";
import { Checkbox } from "@/components/ui/checkbox";
import type { WeekdayKey } from "@/lib/types";
import { applyLunchMinutesToAll, applyLunchPaidToAll, applyWeeklyTargetHours, getScheduleTargetMinutes, getWeeklyTargetMinutes, updateScheduleLunch, weekdayOrder } from "@/lib/work-schedule";
import type { WorkSettingsDraft } from "./work-settings-types";
import type { SystemMessageKey } from "@/lib/i18n/system";

const weekdayKeys: Record<WeekdayKey, SystemMessageKey> = { saturday: "Saturday", sunday: "Sunday", monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday" };

export function WorkScheduleEditor({ value, disabled, onChange }: { value: WorkSettingsDraft; disabled: boolean; onChange: (next: WorkSettingsDraft) => void }) {
  const { durationWords, number, s } = useSystemUi();
  const allLunchPaid = weekdayOrder.every((day) => Boolean(value.weeklySchedule[day].lunchPaid));
  const enabledDayCount = weekdayOrder.filter((day) => value.weeklySchedule[day].enabled).length;
  const weeklyTargetMinutes = getWeeklyTargetMinutes(value);
  const averageDailyTarget = enabledDayCount ? Math.round(weeklyTargetMinutes / enabledDayCount) : 0;
  const setDay = <K extends keyof WorkSettingsDraft["weeklySchedule"][WeekdayKey]>(day: WeekdayKey, key: K, nextValue: WorkSettingsDraft["weeklySchedule"][WeekdayKey][K]) => {
    const weeklySchedule = { ...value.weeklySchedule, [day]: { ...value.weeklySchedule[day], [key]: nextValue } };
    onChange({ ...value, weeklyMinutes: getWeeklyTargetMinutes({ ...value, weeklySchedule }), weeklySchedule });
  };
  const setDayLunch = (day: WeekdayKey, lunchMinutes: number) => {
    const weeklySchedule = { ...value.weeklySchedule, [day]: updateScheduleLunch(value.weeklySchedule[day], { lunchMinutes }) };
    onChange({ ...value, weeklyMinutes: getWeeklyTargetMinutes({ ...value, weeklySchedule }), weeklySchedule });
  };
  return (
    <section data-work-schedule-editor className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
      <div className="grid gap-3 border-b border-[var(--border)] bg-[var(--surface-1)] p-4 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr] xl:items-stretch">
        <div className="flex min-h-[148px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[var(--text)] md:col-span-2 xl:col-span-1"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Clock3 /></span><div className="grid gap-1"><strong className="text-sm">{s("Weekly work schedule")}</strong><small className="text-[10px] leading-5 text-[var(--text-muted)]">{s("Your weekly target is net work. Suggested clock-out updates from the actual clock-in and lunch on each day.")}</small></div></div><div className="mt-auto grid grid-cols-2 gap-2 pt-3 text-[10px] font-medium text-[var(--text-muted)]"><span className="rounded-lg bg-[var(--surface-1)] px-3 py-2">{s("Target = net work")}</span><span className="rounded-lg bg-[var(--surface-1)] px-3 py-2">{s("Unpaid lunch = time to make up")}</span></div></div>
        <div className="flex min-h-[148px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><strong className="text-[11px] text-[var(--text)]">{s("Default lunch for all days")}</strong><div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2"><label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{s("Lunch duration")}</span><MinuteDurationField disabled={disabled} value={value.lunchMinutes} onValueChange={(minutes) => onChange(applyLunchMinutesToAll(value, minutes))} /></label><label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{s("How it is counted")}</span><span className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 text-[10px] text-[var(--text)]"><span>{s("Counts as work (paid)")}</span><Checkbox disabled={disabled} checked={allLunchPaid} onCheckedChange={(paid) => onChange(applyLunchPaidToAll(value, paid))} /></span></label></div><small className="mt-auto pt-3 text-[10px] font-medium leading-4 text-[var(--text-muted)]">{s("Bulk lunch changes preserve net-work targets and only move day end times.")}</small></div>
        <label className="flex min-h-[148px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[10px] font-bold text-[var(--text-muted)]"><span className="text-[11px] text-[var(--text)]">{s("Weekly net-work target")}</span><div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><NumberField data-work-schedule-weekly-target disabled={disabled} className="h-9 min-w-0" value={Math.round(getWeeklyTargetMinutes(value) / 6) / 10} min={0} step={0.5} onValueChange={(hours) => onChange(applyWeeklyTargetHours(value, hours))} /><span className="rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[var(--text)]">{s("Hours")}</span></div><small className="mt-auto pt-3 font-medium leading-4">{enabledDayCount ? s("{count} active days · average {duration} net work per day", { count: number(enabledDayCount), duration: durationWords(averageDailyTarget) }) : s("No active workday is selected")}</small></label>
      </div>
      <div className="grid gap-2 p-3 sm:p-4">{weekdayOrder.map((day) => { const schedule = value.weeklySchedule[day]; return <div key={day} data-work-schedule-day={day} className="grid grid-cols-[110px_repeat(3,minmax(130px,1fr))_128px] items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 max-[980px]:grid-cols-2 max-[620px]:grid-cols-1"><label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1"><Checkbox data-workday-toggle={day} disabled={disabled} checked={schedule.enabled} onCheckedChange={(enabled) => setDay(day, "enabled", enabled)} /><strong className={schedule.enabled ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>{s(weekdayKeys[day])}</strong></label><label>{s("Start")}<TimePicker disabled={disabled} value={schedule.start} onChange={(next) => setDay(day, "start", next)} /></label><label>{s("End")}<TimePicker disabled={disabled} value={schedule.end} onChange={(next) => setDay(day, "end", next)} /></label><label>{s("Lunch")}<MinuteDurationField disabled={disabled} value={schedule.lunchMinutes} onValueChange={(next) => setDayLunch(day, next)} /></label><div className="grid min-h-11 place-items-center rounded-lg bg-[var(--surface-2)] px-2 py-1 text-center text-[10px] font-bold leading-4 text-[var(--text-muted)]">{schedule.enabled ? <><strong className="text-[var(--text)]">{durationWords(getScheduleTargetMinutes(schedule))}</strong><small className="text-[9px] font-medium">{s("Net work for the day")}</small></> : s("Day off")}</div></div>; })}</div>
    </section>
  );
}
