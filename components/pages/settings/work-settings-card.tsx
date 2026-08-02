import { Save, Settings } from "lucide-react";
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
import type { AppData, Mode } from "@/lib/types";

export function WorkSettingsCard({
  data,
  setData,
  onModeChange,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  onModeChange: (mode: Mode) => void;
  setToast: (message: string) => void;
}) {
  const setSetting = <K extends keyof AppData["settings"]>(
    key: K,
    value: AppData["settings"][K],
  ) =>
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, [key]: value },
    }));

  return (
    <section className="col-span-full rounded-[15px] border border-[#dfe7e9] bg-white/95 p-5 shadow-[0_10px_35px_rgba(17,45,55,.055)] max-[620px]:col-auto">
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

        <label>
          شروع معمول
          <TimePicker value={data.settings.defaultStart} onChange={(value) => setSetting("defaultStart", value)} />
        </label>

        <label>
          پایان معمول
          <TimePicker value={data.settings.defaultEnd} onChange={(value) => setSetting("defaultEnd", value)} />
        </label>

        <label>
          ناهار پیش‌فرض
          <MinuteDurationField value={data.settings.lunchMinutes} onValueChange={(value) => setSetting("lunchMinutes", value)} />
        </label>

        <label>
          تعداد روز کاری هفته
          <NumberField value={data.settings.workDays} min={1} onValueChange={(value) => setSetting("workDays", Math.min(7, Math.round(value)))} />
        </label>

        <label>
          هدف هفتگی (ساعت)
          <NumberField value={data.settings.weeklyMinutes / 60} onValueChange={(value) => setSetting("weeklyMinutes", Math.round(value * 60))} />
        </label>

        <label className="grid gap-[7px]">
          حقوق ماهانه (تومان)
          <NumberField value={data.settings.salary} onValueChange={(value) => setSetting("salary", value)} />
          <small className="text-[10px] font-medium text-[#6c7d89]">حقوق پایه روزانه: {money(dailyBaseSalary(data.settings.salary))} تومان (تقسیم بر ۳۰ روز)</small>
        </label>

        <label>
          ضریب اضافه‌کاری
          <NumberField value={data.settings.overtimeMultiplier} min={0} onValueChange={(value) => setSetting("overtimeMultiplier", value)} />
        </label>

        <label>
          ضریب روز تعطیل
          <NumberField value={data.settings.holidayMultiplier} min={0} onValueChange={(value) => setSetting("holidayMultiplier", value)} />
        </label>
      </div>

      <Button onClick={() => setToast("تنظیمات ذخیره شد")}>
        <Save /> ذخیره تنظیمات
      </Button>
    </section>
  );
}
