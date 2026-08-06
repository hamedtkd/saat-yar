import { useEffect } from "react";
import { localDateKey, nowTime } from "@/lib/format";
import {
  activeTrackingMinutes,
  breakReminderSnoozeKey,
  isRecordPaused,
} from "@/lib/notification-reminders";
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

export function useNotificationReminders({ settings, selectedDate, record, dailyTarget, worked, credited, suggestedExit, setToast }: Args) {
  const {
    start,
    end,
    startedAt,
    endedAt,
    lunchStartedAt,
    lunchEndedAt,
    breaks,
  } = record;
  const paused = isRecordPaused({ lunchStartedAt, lunchEndedAt, breaks });

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
      const tracking = Boolean(start && !end);
      const elapsed = activeTrackingMinutes(
        { startedAt, endedAt, lunchStartedAt, lunchEndedAt, breaks },
        Date.now(),
        worked,
      );

      if (tracking && elapsed >= settings.openTimerReminderMinutes) {
        notifyOnce("open-timer", "تایمر ساعت‌یار هنوز باز است", `بیش از ${settings.openTimerReminderMinutes.toLocaleString("fa-IR")} دقیقه کار فعال ثبت شده است.`);
      }
      if (settings.dailyTargetReminder && dailyTarget > 0 && credited >= dailyTarget) {
        notifyOnce("target", "هدف روزانه تکمیل شد", "ساعت موظفی امروز کامل شده است.");
      }
      if (settings.endOfDayReminder && suggestedExit && nowTime() >= suggestedExit) {
        notifyOnce("exit", "زمان ثبت خروج رسیده است", `خروج پیشنهادی امروز ${suggestedExit} است.`);
      }

      const reminder = settings.breakReminder;
      if (!reminder.enabled || paused) return;
      if (sessionStorage.getItem(breakReminderSnoozeKey(selectedDate))) return;
      if (reminder.onlyWhenTracking && !tracking) return;
      const interval = Math.max(15, reminder.intervalMinutes);
      const bucket = Math.floor(elapsed / interval);
      if (bucket < 1) return;
      notifyOnce(`break-${bucket}`, "وقت یک استراحت کوتاهه", `حدود ${interval.toLocaleString("fa-IR")} دقیقه کار فعال داشتی. چند دقیقه از پشت میز بلند شو و بعد ادامه بده.`);
    };

    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, [settings, selectedDate, start, end, startedAt, endedAt, lunchStartedAt, lunchEndedAt, breaks, paused, dailyTarget, worked, credited, suggestedExit]);

  return { requestNotificationPermission };
}
