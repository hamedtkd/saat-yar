import { useEffect } from "react";
import { localDateKey, nowTime } from "@/lib/format";
import { getBrowserLocale } from "@/lib/i18n";
import { formatLocaleNumber } from "@/lib/i18n/formatters";
import { translateSystem } from "@/lib/i18n/system";
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
      setToast(translateSystem(getBrowserLocale(), "This browser does not support notifications."));
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
        notifyOnce("open-timer", translateSystem(getBrowserLocale(), "Saatyar timer is still running"), translateSystem(getBrowserLocale(), "More than {minutes} minutes of active work have been recorded.", { minutes: formatLocaleNumber(getBrowserLocale(), settings.openTimerReminderMinutes) }));
      }
      if (settings.dailyTargetReminder && dailyTarget > 0 && credited >= dailyTarget) {
        notifyOnce("target", translateSystem(getBrowserLocale(), "Daily target completed"), translateSystem(getBrowserLocale(), "Today's required work is complete."));
      }
      if (settings.endOfDayReminder && suggestedExit && nowTime() >= suggestedExit) {
        notifyOnce("exit", translateSystem(getBrowserLocale(), "It's time to clock out"), translateSystem(getBrowserLocale(), "Today's suggested exit is {time}.", { time: suggestedExit }));
      }

      const reminder = settings.breakReminder;
      if (!reminder.enabled || paused) return;
      if (sessionStorage.getItem(breakReminderSnoozeKey(selectedDate))) return;
      if (reminder.onlyWhenTracking && !tracking) return;
      const interval = Math.max(15, reminder.intervalMinutes);
      const bucket = Math.floor(elapsed / interval);
      if (bucket < 1) return;
      notifyOnce(`break-${bucket}`, translateSystem(getBrowserLocale(), "Time for a short break"), translateSystem(getBrowserLocale(), "You have had about {minutes} minutes of active work. Step away for a few minutes, then continue.", { minutes: formatLocaleNumber(getBrowserLocale(), interval) }));
    };

    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, [settings, selectedDate, start, end, startedAt, endedAt, lunchStartedAt, lunchEndedAt, breaks, paused, dailyTarget, worked, credited, suggestedExit]);

  return { requestNotificationPermission };
}
