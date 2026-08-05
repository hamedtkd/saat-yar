import { Clock3, Save, Settings } from "lucide-react";
import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money } from "@/lib/format";
import { dailyBaseSalary } from "@/lib/payroll";
import type { AppData, Mode, WeekdayKey } from "@/lib/types";
import { getScheduleTargetMinutes, getWeeklyTargetMinutes, weekdayLabels, weekdayOrder } from "@/lib/work-schedule";

export function WorkSettingsCard({
  data,
  setData,
  onModeChange,
  setToast,
  financialsHidden,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  onModeChange: (mode: Mode) => void;
  setToast: (message: string) => void;
  financialsHidden: boolean;
}) {
  const setSetting = <K extends keyof AppData["settings"]>(
    key: K,
    value: AppData["settings"][K],
  ) =>
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, [key]: value },
    }));

  const setScheduleDay = <K extends keyof AppData["settings"]["weeklySchedule"][WeekdayKey]>(
    day: WeekdayKey,
    key: K,
    value: AppData["settings"]["weeklySchedule"][WeekdayKey][K],
  ) =>
    setData((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        weeklySchedule: {
          ...previous.settings.weeklySchedule,
          [day]: { ...previous.settings.weeklySchedule[day], [key]: value },
        },
      },
    }));

  return (
    <section className="col-span-full rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[0_10px_35px_rgba(17,45,55,.055)] max-[620px]:col-auto">
      <PanelHead icon={<Settings />} title="تنظیمات کاری و حقوق" />
      <div className="mb-4 grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>
          نوع استفاده
          <Select value={data.settings.mode} onValueChange={(mode) => onModeChange(mode as Mode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">کارمند</SelectItem>
              <SelectItem value="freelancer">فریلنسر</SelectItem>
              <SelectItem value="hybrid">ترکیبی</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="grid gap-[7px]">
          حقوق ماهانه (تومان)
          {financialsHidden ? <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-lg font-black tracking-[.2em] text-[var(--text-muted)]">••••••</div> : <NumberField value={data.settings.salary} onValueChange={(value) => setSetting("salary", value)} />}
          <small className="text-[10px] font-medium text-[var(--text-muted)]">حقوق پایه روزانه: {financialsHidden ? "••••••" : money(dailyBaseSalary(data.settings.salary))} تومان (تقسیم بر ۳۰ روز)</small>
        </label>

        <label>
          ضریب اضافه‌کاری
          <NumberField value={data.settings.overtimeMultiplier} min={0} onValueChange={(value) => setSetting("overtimeMultiplier", value)} />
        </label>

        <label>
          ضریب روز تعطیل
          <NumberField value={data.settings.holidayMultiplier} min={0} onValueChange={(value) => setSetting("holidayMultiplier", value)} />
        </label>

        <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]">
          <input
            type="checkbox"
            checked={data.settings.autoOfficialHolidays}
            onChange={(event) => setSetting("autoOfficialHolidays", event.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          <span className="grid gap-0.5">
            <strong className="text-[11px]">تشخیص تعطیلات رسمی</strong>
            <small className="text-[9px] text-[var(--text-muted)]">تعطیلات رسمی در تقویم قرمز و هدف روز صفر می‌شود.</small>
          </span>
        </label>

        <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]">
          <input
            type="checkbox"
            checked={data.settings.autoWeeklyHoliday}
            onChange={(event) => setSetting("autoWeeklyHoliday", event.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          <span className="grid gap-0.5">
            <strong className="text-[11px]">جمعه به‌عنوان تعطیل هفتگی</strong>
            <small className="text-[9px] text-[var(--text-muted)]">کارکرد جمعه با ضریب روز تعطیل محاسبه می‌شود.</small>
          </span>
        </label>
      </div>

      <section className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <Clock3 className="size-5 text-[var(--accent-strong)]" />
            <div>
              <strong className="block text-sm">برنامه کاری هفتگی</strong>
              <small className="text-[10px] text-[var(--text-muted)]">هر روز می‌تواند ساعت شروع، پایان و ناهار مستقل داشته باشد. شیفتی که پایانش قبل از شروع باشد، شب‌کار در نظر گرفته می‌شود.</small>
            </div>
          </div>
          <span className="rounded-full bg-[var(--surface-1)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">هدف هفتگی: {Math.round(getWeeklyTargetMinutes(data.settings) / 60 * 10) / 10} ساعت</span>
        </div>

        <div className="grid gap-2">
          {weekdayOrder.map((day) => {
            const schedule = data.settings.weeklySchedule[day];
            return (
              <div key={day} className="grid grid-cols-[120px_repeat(3,minmax(120px,1fr))_110px] items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
                <label className="flex min-h-10 cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={schedule.enabled} onChange={(event) => setScheduleDay(day, "enabled", event.target.checked)} className="size-4 accent-[var(--accent)]" />
                  <strong className={schedule.enabled ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>{weekdayLabels[day]}</strong>
                </label>
                <label>شروع<TimePicker value={schedule.start} onChange={(value) => setScheduleDay(day, "start", value)} /></label>
                <label>پایان<TimePicker value={schedule.end} onChange={(value) => setScheduleDay(day, "end", value)} /></label>
                <label>ناهار<MinuteDurationField value={schedule.lunchMinutes} onValueChange={(value) => setScheduleDay(day, "lunchMinutes", value)} /></label>
                <div className="pb-2 text-[10px] font-bold text-[var(--text-muted)]">{schedule.enabled ? `${Math.round(getScheduleTargetMinutes(schedule) / 60 * 10) / 10} ساعت` : "تعطیل"}</div>
              </div>
            );
          })}
        </div>
      </section>

      <Button onClick={() => setToast("تنظیمات ذخیره شد")}>
        <Save /> ذخیره تنظیمات
      </Button>
    </section>
  );
}
