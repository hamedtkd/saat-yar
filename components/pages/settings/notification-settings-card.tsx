import { BellRing } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import type { AppData, NotificationSettings } from "@/lib/types";

export function NotificationSettingsCard({ data, setData, requestPermission, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  requestPermission: () => Promise<boolean>;
  setToast: (message: string) => void;
}) {
  const settings = data.settings.notificationSettings;
  const update = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => setData((previous) => ({ ...previous, settings: { ...previous.settings, notificationSettings: { ...previous.settings.notificationSettings, [key]: value } } }));

  async function enableNotifications() {
    const granted = await requestPermission();
    update("enabled", granted);
    setToast(granted ? "اعلان‌های مرورگر فعال شد" : "اجازه اعلان داده نشد");
  }

  return <section className="col-span-full rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[0_10px_35px_rgba(17,45,55,.055)]">
    <PanelHead icon={<BellRing />} title="اعلان‌ها و یادآوری‌ها" />
    <p className="mb-4 text-[10px] leading-6 text-[var(--text-muted)]">یادآوری تایمر باز و رسیدن به هدف روزانه فقط روی همین دستگاه و داخل مرورگر انجام می‌شود.</p>
    <div className="grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
      <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"><input type="checkbox" checked={settings.enabled} onChange={(event) => event.target.checked ? void enableNotifications() : update("enabled", false)} className="size-4 accent-[var(--accent)]" /><span><strong className="block text-[11px]">فعال‌بودن اعلان‌ها</strong><small className="text-[9px] text-[var(--text-muted)]">نیازمند اجازه مرورگر است.</small></span></label>
      <label>یادآوری تایمر باز پس از چند دقیقه<NumberField value={settings.openTimerReminderMinutes} min={30} onValueChange={(value) => update("openTimerReminderMinutes", Math.max(30, value))} /></label>
      <div className="grid gap-2">
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.dailyTargetReminder} onChange={(event) => update("dailyTargetReminder", event.target.checked)} className="size-4 accent-[var(--accent)]" /> اعلام تکمیل هدف روزانه</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.endOfDayReminder} onChange={(event) => update("endOfDayReminder", event.target.checked)} className="size-4 accent-[var(--accent)]" /> یادآوری ثبت خروج</label>
      </div>
    </div>
    <Button type="button" variant="outline" className="mt-4" onClick={enableNotifications}><BellRing /> درخواست اجازه اعلان</Button>
  </section>;
}
