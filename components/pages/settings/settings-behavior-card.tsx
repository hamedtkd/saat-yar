import { Save } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Checkbox } from "@/components/ui/checkbox";
import type { AppData } from "@/lib/types";

export function SettingsBehaviorCard({
  data,
  setData,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}) {
  const enabled = data.settings.autoSaveSettings;
  return (
    <section className="col-span-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
      <PanelHead icon={<Save />} title="رفتار ذخیره تنظیمات" />
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <Checkbox
          className="mt-0.5"
          checked={enabled}
          onCheckedChange={(checked) => setData((previous) => ({
            ...previous,
            settings: { ...previous.settings, autoSaveSettings: checked },
          }))}
        />
        <span className="grid gap-1">
          <strong className="text-[11px] text-[var(--text)]">ذخیره خودکار تغییرات تنظیمات</strong>
          <small className="text-[9px] leading-5 text-[var(--text-muted)]">به‌صورت پیش‌فرض خاموش است. در حالت خاموش، هر کارت با مداد وارد ویرایش می‌شود و فقط با دکمه ذخیره اعمال خواهد شد.</small>
        </span>
      </label>
    </section>
  );
}
