import { Save, Settings } from "lucide-react"; 
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
import { tw } from "@/lib/tw";
import type { AppData, Mode } from "@/lib/types";
import { MinuteDurationField } from "@/components/common/minute-duration-field";

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
    <section className={tw("panel", "settings-card", "work-settings")}>
      <PanelHead icon={<Settings />} title="تنظیمات کاری" />
      <div className={tw("form-grid", "three")}>
        <label>
          نوع استفاده
          <Select
            value={data.settings.mode}
            onValueChange={(mode) => onModeChange(mode as Mode)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">کارمند</SelectItem>
              <SelectItem value="freelancer">فریلنسر</SelectItem>
              <SelectItem value="hybrid">ترکیبی</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label>
          شروع معمول
          <TimePicker
            value={data.settings.defaultStart}
            onChange={(value) => setSetting("defaultStart", value)}
          />
        </label>

        <label>
          پایان معمول
          <TimePicker
            value={data.settings.defaultEnd}
            onChange={(value) => setSetting("defaultEnd", value)}
          />
        </label>

        <label>
          ناهار پیش‌فرض
          <MinuteDurationField
            value={data.settings.lunchMinutes}
            onValueChange={(value) => setSetting("lunchMinutes", value)}
          />
        </label>

        <label>
          هدف هفتگی
          <NumberField
            value={data.settings.weeklyMinutes / 60}
            onValueChange={(value) => setSetting("weeklyMinutes", value * 60)}
          />
        </label>

        <label>
          حقوق پایه
          <NumberField
            value={data.settings.salary}
            onValueChange={(value) => setSetting("salary", value)}
          />
        </label>
      </div>

      <Button onClick={() => setToast("تنظیمات ذخیره شد")}>
        <Save /> ذخیره تنظیمات
      </Button>
    </section>
  );
}