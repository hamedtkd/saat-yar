import { useEffect } from "react";
import { localDateKey, nowTime } from "@/lib/format";
import type { Settings, WorkRecord } from "@/lib/types";

type Args = { settings: Settings["notificationSettings"]; selectedDate: string; record: WorkRecord; dailyTarget: number;
  worked: number; credited: number; suggestedExit: string; setToast: (message: string) => void };

export function useNotificationReminders({ settings, selectedDate, record, dailyTarget, worked, credited, suggestedExit, setToast }: Args) {
  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) { setToast("مرورگر از اعلان پشتیبانی نمی‌کند"); return false; }
    if (Notification.permission === "granted") return true;
    return (await Notification.requestPermission()) === "granted";
  }
  useEffect(() => {
    if (!settings.enabled || typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
    if (selectedDate !== localDateKey() || !record.start || record.end) return;
    const notifyOnce = (key: string, title: string, body: string) => {
      const storageKey = `saatyar-notification:${selectedDate}:${key}`;
      if (sessionStorage.getItem(storageKey)) return;
      new Notification(title, { body, icon: "/fav-256.png" }); sessionStorage.setItem(storageKey, "1");
    };
    const check = () => {
      const elapsed = record.startedAt ? Math.max(0, Math.floor((Date.now() - new Date(record.startedAt).getTime()) / 60_000)) : worked;
      if (elapsed >= settings.openTimerReminderMinutes) notifyOnce("open-timer", "تایمر ساعت‌یار هنوز باز است", `بیش از ${settings.openTimerReminderMinutes.toLocaleString("fa-IR")} دقیقه از شروع روز گذشته است.`);
      if (settings.dailyTargetReminder && dailyTarget > 0 && credited >= dailyTarget) notifyOnce("target", "هدف روزانه تکمیل شد", "ساعت موظفی امروز کامل شده است.");
      if (settings.endOfDayReminder && suggestedExit && nowTime() >= suggestedExit) notifyOnce("exit", "زمان ثبت خروج رسیده است", `خروج پیشنهادی امروز ${suggestedExit} است.`);
    };
    check(); const interval = window.setInterval(check, 60_000); return () => window.clearInterval(interval);
  }, [settings, selectedDate, record.start, record.end, record.startedAt, dailyTarget, worked, credited, suggestedExit]);
  return { requestNotificationPermission };
}
