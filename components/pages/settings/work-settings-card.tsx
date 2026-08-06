import { Clock3, Save, Settings } from "lucide-react";
import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { applyWeeklyTargetHours, getScheduleTargetMinutes, getWeeklyTargetMinutes, weekdayLabels, weekdayOrder } from "@/lib/work-schedule";

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


  const setWeeklyTargetHours = (hours: number) => {
    setData((previous) => ({
      ...previous,
      settings: applyWeeklyTargetHours(previous.settings, hours),
    }));
  };


  return (
    <section className="col-span-full scroll-mt-24 rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[0_6px_20px_rgba(17,45,55,.04)] max-[620px]:col-auto">
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
          <Checkbox
            checked={data.settings.autoOfficialHolidays}
            onCheckedChange={(checked) => setSetting("autoOfficialHolidays", checked)}
          />
          <span className="grid gap-0.5">
            <strong className="text-[11px]">تشخیص تعطیلات رسمی</strong>
            <small className="text-[9px] text-[var(--text-muted)]">تعطیلات رسمی در تقویم قرمز و هدف روز صفر می‌شود.</small>
          </span>
        </label>

        <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]">
          <Checkbox
            checked={data.settings.autoWeeklyHoliday}
            onCheckedChange={(checked) => setSetting("autoWeeklyHoliday", checked)}
          />
          <span className="grid gap-0.5">
            <strong className="text-[11px]">جمعه به‌عنوان تعطیل هفتگی</strong>
            <small className="text-[9px] text-[var(--text-muted)]">کارکرد جمعه با ضریب روز تعطیل محاسبه می‌شود.</small>
          </span>
        </label>
      </div>

      <section className="mb-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
        <div className="grid gap-4 border-b border-[var(--border)] bg-[var(--surface-1)] p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-start gap-3 text-[var(--text)]">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Clock3 className="size-5" /></span>
            <div className="grid gap-1">
              <strong className="text-sm">برنامه کاری هفتگی</strong>
              <small className="max-w-3xl text-[10px] leading-5 text-[var(--text-muted)]">هدف هفتگی میان روزهای فعال تقسیم می‌شود و پایان هر روز را با حفظ ساعت شروع و زمان ناهار به‌روز می‌کند.</small>
            </div>
          </div>
          <label className="grid min-w-[190px] grid-cols-[1fr_auto] items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[10px] font-bold text-[var(--text-muted)]">
            <span className="col-span-full">هدف هفتگی</span>
            <NumberField className="h-9 min-w-0" value={Math.round(getWeeklyTargetMinutes(data.settings) / 6) / 10} min={0} step={0.5} onValueChange={setWeeklyTargetHours} />
            <span className="pb-2">ساعت</span>
          </label>
        </div>

        <div className="grid gap-2 p-3 sm:p-4">
          {weekdayOrder.map((day) => {
            const schedule = data.settings.weeklySchedule[day];
            return (
              <div key={day} className="grid grid-cols-[110px_repeat(3,minmax(130px,1fr))_90px] items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 transition-colors max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1">
                  <Checkbox checked={schedule.enabled} onCheckedChange={(enabled) => setScheduleDay(day, "enabled", enabled)} />
                  <strong className={schedule.enabled ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>{weekdayLabels[day]}</strong>
                </label>
                <label>شروع<TimePicker value={schedule.start} onChange={(value) => setScheduleDay(day, "start", value)} /></label>
                <label>پایان<TimePicker value={schedule.end} onChange={(value) => setScheduleDay(day, "end", value)} /></label>
                <label>ناهار<MinuteDurationField value={schedule.lunchMinutes} onValueChange={(value) => setScheduleDay(day, "lunchMinutes", value)} /></label>
                <div className="flex h-11 items-center justify-center rounded-lg bg-[var(--surface-2)] px-2 text-[10px] font-bold text-[var(--text-muted)]">{schedule.enabled ? `${Math.round(getScheduleTargetMinutes(schedule) / 60 * 10) / 10} ساعت` : "تعطیل"}</div>
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
