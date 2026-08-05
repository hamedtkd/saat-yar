import { useEffect } from "react";
import { localDateKey, nowTime } from "@/lib/format";
import type { Settings, WorkRecord } from "@/lib/types";

type Args = {
  settings: Settings["notificationSettings"];
  selectedDate: string;
  record: WorkRecord;
  dailyTarget: number;
  worked: number;
  credited: number;
  suggestedExit: string;
  setToast: (message: string) => void;
};

function isPaused(record: WorkRecord) {
  const lunchOpen = Boolean(record.lunchStartedAt && !record.lunchEndedAt);
  const breakOpen = record.breaks.some((item) => item.startedAt && !item.endedAt);
  return lunchOpen || breakOpen;
}

export function useNotificationReminders({ settings, selectedDate, record, dailyTarget, worked, credited, suggestedExit, setToast }: Args) {
  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setToast("مرورگر از اعلان پشتیبانی نمی‌کند");
      return false;
    }
    if (Notification.permission === "granted") return true;
    return (await Notification.requestPermission()) === "granted";
  }

  useEffect(() => {
    if (!settings.enabled || typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
    if (selectedDate !== localDateKey()) return;

    const notifyOnce = (key: string, title: string, body: string) => {
      const storageKey = `saatyar-notification:${selectedDate}:${key}`;
      if (sessionStorage.getItem(storageKey)) return;
      new Notification(title, { body, icon: "/fav-256.png" });
      sessionStorage.setItem(storageKey, "1");
    };

    const check = () => {
      const tracking = Boolean(record.start && !record.end);
      const elapsed = record.startedAt
        ? Math.max(0, Math.floor((Date.now() - new Date(record.startedAt).getTime()) / 60_000))
        : worked;

      if (tracking && elapsed >= settings.openTimerReminderMinutes) {
        notifyOnce("open-timer", "تایمر ساعت‌یار هنوز باز است", `بیش از ${settings.openTimerReminderMinutes.toLocaleString("fa-IR")} دقیقه از شروع روز گذشته است.`);
      }
      if (settings.dailyTargetReminder && dailyTarget > 0 && credited >= dailyTarget) {
        notifyOnce("target", "هدف روزانه تکمیل شد", "ساعت موظفی امروز کامل شده است.");
      }
      if (settings.endOfDayReminder && suggestedExit && nowTime() >= suggestedExit) {
        notifyOnce("exit", "زمان ثبت خروج رسیده است", `خروج پیشنهادی امروز ${suggestedExit} است.`);
      }

      const reminder = settings.breakReminder;
      if (!reminder.enabled || isPaused(record)) return;
      if (reminder.onlyWhenTracking && !tracking) return;
      const interval = Math.max(15, reminder.intervalMinutes);
      const bucket = Math.floor(elapsed / interval);
      if (bucket < 1) return;
      notifyOnce(`break-${bucket}`, "وقت یک استراحت کوتاهه", `حدود ${interval.toLocaleString("fa-IR")} دقیقه مشغول کار بودی. چند دقیقه از پشت میز بلند شو و بعد ادامه بده.`);
    };

    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, [settings, selectedDate, record.start, record.end, record.startedAt, record.lunchStartedAt, record.lunchEndedAt, record.breaks, dailyTarget, worked, credited, suggestedExit]);

  return { requestNotificationPermission };
}
