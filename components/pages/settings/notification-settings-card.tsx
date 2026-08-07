"use client";

import { BellRing, Coffee, Send, TimerOff } from "lucide-react";
import { useState } from "react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge, type StatusBadgeTone } from "@/components/common/status-badge";
import { EditableCardActions } from "./editing/editable-card-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { localDateKey } from "@/lib/format";
import { breakReminderSnoozeKey } from "@/lib/notification-reminders";
import type { AppData, NotificationSettings } from "@/lib/types";

type PermissionState = NotificationPermission | "unsupported";
type Props = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  requestPermission: () => Promise<boolean>;
  setToast: (message: string) => void;
};

function getPermissionState(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function ToggleRow({ checked, disabled, onChange, title, description }: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 has-[:disabled]:cursor-default has-[:disabled]:opacity-60">
      <Checkbox className="mt-0.5" checked={checked} disabled={disabled} onCheckedChange={onChange} />
      <span className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">{title}</strong>{description && <small className="text-[9px] leading-4 text-[var(--text-muted)]">{description}</small>}</span>
    </label>
  );
}

export function NotificationSettingsCard({ data, setData, requestPermission, setToast }: Props) {
  const [permission, setPermission] = useState<PermissionState>(getPermissionState);
  const saveSettings = (value: NotificationSettings) => setData((previous) => ({
    ...previous,
    settings: { ...previous.settings, notificationSettings: value },
  }));
  const editor = useSettingsDraft({ value: data.settings.notificationSettings, autoSave: data.settings.autoSaveSettings, label: "اعلان‌ها و یادآوری‌ها", onSave: saveSettings });
  const settings = editor.draft;
  const canEdit = editor.editing;
  const update = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => editor.update((previous) => ({ ...previous, [key]: value }));
  const updateBreak = <K extends keyof NotificationSettings["breakReminder"]>(key: K, value: NotificationSettings["breakReminder"][K]) => editor.update((previous) => ({ ...previous, breakReminder: { ...previous.breakReminder, [key]: value } }));

  async function ensurePermission() {
    const granted = await requestPermission();
    setPermission(getPermissionState());
    update("enabled", granted);
    setToast(granted ? "اجازه اعلان ثبت شد؛ برای اعمال تنظیمات ذخیره کن" : "اجازه اعلان داده نشد");
    return granted;
  }

  async function setBreakReminderEnabled(checked: boolean) {
    if (!checked) return updateBreak("enabled", false);
    const granted = settings.enabled && permission === "granted" ? true : await ensurePermission();
    if (granted) updateBreak("enabled", true);
  }

  function snoozeBreakReminderToday() {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(breakReminderSnoozeKey(localDateKey()), "1");
    setToast("یادآوری استراحت تا فردا متوقف شد");
  }

  async function sendTestNotification() {
    const granted = permission === "granted" ? true : await ensurePermission();
    if (!granted || typeof Notification === "undefined") return;
    new Notification("آزمون اعلان ساعت‌یار", { body: "اعلان‌ها درست کار می‌کنند.", icon: "/fav-256.png" });
    setToast("اعلان آزمایشی ارسال شد");
  }

  const permissionLabel = permission === "granted" ? "اجازه داده شده" : permission === "denied" ? "مسدود شده" : permission === "unsupported" ? "پشتیبانی نمی‌شود" : "در انتظار اجازه";
  const permissionTone: StatusBadgeTone = permission === "granted" ? "success" : permission === "denied" || permission === "unsupported" ? "danger" : "warning";

  return (
    <section id="settings-notifications" className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5">
        <div className="grid gap-2"><PanelHead icon={<BellRing />} title="اعلان‌ها و یادآوری‌ها" /><p className="text-[10px] leading-5 text-[var(--text-muted)]">در حالت عادی فقط خواندنی است؛ برای تغییر از مداد استفاده کن.</p></div>
        <div className="flex flex-wrap items-center gap-2"><StatusBadge tone={permissionTone}>{permissionLabel}</StatusBadge><EditableCardActions editing={editor.manualEditing} dirty={editor.dirty} autoSave={data.settings.autoSaveSettings} onEdit={editor.beginEdit} onSave={() => { editor.save(); setToast("تنظیمات اعلان ذخیره شد"); }} onCancel={editor.cancel} /></div>
      </div>

      <fieldset disabled={!canEdit} className="grid gap-4 p-4 disabled:opacity-70 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_1fr]">
          <ToggleRow disabled={!canEdit} checked={settings.enabled} onChange={(checked) => checked ? void ensurePermission() : update("enabled", false)} title="فعال‌بودن اعلان‌ها" description="کلید اصلی همه اعلان‌های ساعت‌یار" />
          <label className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[10px] font-bold text-[var(--text-muted)]">یادآوری تایمر باز پس از<div className="flex items-center gap-2"><NumberField className="h-10" value={settings.openTimerReminderMinutes} min={30} onValueChange={(value) => update("openTimerReminderMinutes", Math.max(30, value))} /><span>دقیقه</span></div></label>
          <div className="grid gap-2"><ToggleRow disabled={!canEdit} checked={settings.dailyTargetReminder} onChange={(checked) => update("dailyTargetReminder", checked)} title="اعلام تکمیل هدف روزانه" /><ToggleRow disabled={!canEdit} checked={settings.endOfDayReminder} onChange={(checked) => update("endOfDayReminder", checked)} title="یادآوری ثبت خروج" /></div>
        </div>
        <div className="grid gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--accent-soft)] p-4 lg:grid-cols-[1.25fr_1fr_1fr] lg:items-stretch">
          <label className="flex min-h-24 cursor-pointer items-start justify-between gap-4 rounded-xl border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[var(--surface-1)] p-3">
            <span className="flex min-w-0 items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Coffee /></span>
              <span className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">یادآوری استراحت</strong><small className="text-[9px] leading-4 text-[var(--text-muted)]">بعد از کار فعال، زمان استراحت را یادآوری می‌کند.</small></span>
            </span>
            <Checkbox className="mt-1" checked={settings.breakReminder.enabled} onCheckedChange={(checked) => void setBreakReminderEnabled(checked)} aria-label="فعال‌کردن یادآوری استراحت" />
          </label>
          <label className="grid content-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[var(--surface-1)] p-3 text-[10px] font-bold text-[var(--text-muted)]">فاصله یادآوری<div className="flex items-center gap-2"><NumberField className="h-10" value={settings.breakReminder.intervalMinutes} min={15} max={240} onValueChange={(value) => updateBreak("intervalMinutes", Math.min(240, Math.max(15, value)))} /><span>دقیقه</span></div></label>
          <ToggleRow disabled={!canEdit} checked={settings.breakReminder.onlyWhenTracking} onChange={(checked) => updateBreak("onlyWhenTracking", checked)} title="فقط هنگام ثبت کار" description="وقتی تایمر کاری فعال نیست، یادآوری استراحت ارسال نشود." />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] p-4 sm:px-5">
        <Button type="button" variant="outline" onClick={() => void ensurePermission()} disabled={!canEdit}><BellRing /> درخواست اجازه اعلان</Button>
        <Button type="button" variant="secondary" onClick={() => void sendTestNotification()} disabled={permission === "unsupported"}><Send /> ارسال اعلان آزمایشی</Button>
        <Button type="button" variant="ghost" onClick={snoozeBreakReminderToday} disabled={!data.settings.notificationSettings.breakReminder.enabled}><TimerOff /> امروز یادآوری نکن</Button>
      </div>
      {permission === "denied" && <p className="m-4 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[10px] leading-5 text-[var(--danger)]" role="alert">اعلان‌ها در تنظیمات مرورگر مسدود شده‌اند.</p>}
    </section>
  );
}
