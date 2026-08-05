"use client";

import { BellRing, Coffee, Send } from "lucide-react";
import { useState } from "react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { AppData, NotificationSettings } from "@/lib/types";

type PermissionState = NotificationPermission | "unsupported";

function getPermissionState(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function NotificationSettingsCard({ data, setData, requestPermission, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  requestPermission: () => Promise<boolean>;
  setToast: (message: string) => void;
}) {
  const settings = data.settings.notificationSettings;
  const [permission, setPermission] = useState<PermissionState>(getPermissionState);
  const update = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => setData((previous) => ({ ...previous, settings: { ...previous.settings, notificationSettings: { ...previous.settings.notificationSettings, [key]: value } } }));
  const updateBreak = <K extends keyof NotificationSettings["breakReminder"]>(key: K, value: NotificationSettings["breakReminder"][K]) => update("breakReminder", { ...settings.breakReminder, [key]: value });

  async function ensurePermission() {
    const granted = await requestPermission();
    setPermission(getPermissionState());
    update("enabled", granted);
    setToast(granted ? "اعلان‌های مرورگر فعال شد" : "اجازه اعلان داده نشد");
    return granted;
  }

  async function setBreakReminderEnabled(checked: boolean) {
    if (!checked) {
      updateBreak("enabled", false);
      return;
    }
    const granted = settings.enabled && permission === "granted" ? true : await ensurePermission();
    if (granted) updateBreak("enabled", true);
  }

  async function sendTestNotification() {
    const granted = permission === "granted" ? true : await ensurePermission();
    if (!granted || typeof Notification === "undefined") return;
    new Notification("آزمون اعلان ساعت‌یار", {
      body: "اعلان‌ها درست کار می‌کنند. یادآوری استراحت هم از همین مسیر ارسال می‌شود.",
      icon: "/fav-256.png",
    });
    setToast("اعلان آزمایشی ارسال شد");
  }

  const permissionLabel = permission === "granted" ? "اجازه داده شده" : permission === "denied" ? "مسدود شده" : permission === "unsupported" ? "پشتیبانی نمی‌شود" : "در انتظار اجازه";
  const permissionTone = permission === "granted" ? "success" : permission === "denied" || permission === "unsupported" ? "danger" : "warning";

  return <section className="col-span-full rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[0_10px_35px_rgba(17,45,55,.055)]">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PanelHead icon={<BellRing />} title="اعلان‌ها و یادآوری‌ها" />
      <StatusBadge tone={permissionTone}>{permissionLabel}</StatusBadge>
    </div>
    <p className="mb-4 text-[10px] leading-6 text-[var(--text-muted)]">یادآوری‌ها فقط وقتی برنامه باز است و اجازه اعلان مرورگر داده شده اجرا می‌شوند.</p>
    <div className="grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
      <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"><Checkbox checked={settings.enabled} onCheckedChange={(checked) => checked ? void ensurePermission() : update("enabled", false)} /><span><strong className="block text-[11px]">فعال‌بودن اعلان‌ها</strong><small className="text-[9px] text-[var(--text-muted)]">نیازمند اجازه مرورگر است.</small></span></label>
      <label>یادآوری تایمر باز پس از چند دقیقه<NumberField value={settings.openTimerReminderMinutes} min={30} onValueChange={(value) => update("openTimerReminderMinutes", Math.max(30, value))} /></label>
      <div className="grid gap-2">
        <label className="flex items-center gap-2"><Checkbox checked={settings.dailyTargetReminder} onCheckedChange={(checked) => update("dailyTargetReminder", checked)} /> اعلام تکمیل هدف روزانه</label>
        <label className="flex items-center gap-2"><Checkbox checked={settings.endOfDayReminder} onCheckedChange={(checked) => update("endOfDayReminder", checked)} /> یادآوری ثبت خروج</label>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-[1.2fr_1fr_1fr] gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 max-[760px]:grid-cols-1">
      <label className="flex cursor-pointer items-center gap-3"><Checkbox checked={settings.breakReminder.enabled} onCheckedChange={(checked) => void setBreakReminderEnabled(checked)} /><Coffee className="text-[var(--accent-strong)]" /><span><strong className="block text-[11px]">یادآوری استراحت</strong><small className="text-[9px] text-[var(--text-muted)]">برای بلندشدن و استراحت کوتاه</small></span></label>
      <label>هر چند دقیقه<NumberField value={settings.breakReminder.intervalMinutes} min={15} max={240} onValueChange={(value) => updateBreak("intervalMinutes", Math.min(240, Math.max(15, value)))} /></label>
      <label className="flex items-center gap-2"><Checkbox checked={settings.breakReminder.onlyWhenTracking} onCheckedChange={(checked) => updateBreak("onlyWhenTracking", checked)} /> فقط هنگام ثبت کار</label>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={() => void ensurePermission()}><BellRing /> درخواست اجازه اعلان</Button>
      <Button type="button" variant="secondary" onClick={() => void sendTestNotification()} disabled={permission === "unsupported"}><Send /> ارسال اعلان آزمایشی</Button>
    </div>
    {permission === "denied" && <p className="mt-3 text-[10px] leading-6 text-[var(--danger)]" role="alert">اعلان‌ها در تنظیمات مرورگر مسدود شده‌اند. از بخش مجوزهای سایت، Notification را روی Allow قرار بده.</p>}
  </section>;
}
