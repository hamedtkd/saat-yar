import { useEffect } from "react";
import { localDateKey, nowTime } from "@/lib/format";
import { getBrowserLocale } from "@/lib/i18n";
import { formatLocaleNumber } from "@/lib/i18n/formatters";
import { translateSystem } from "@/lib/i18n/system";
import {
  breakReminderSnoozeKey,
  evaluateNotificationReminders,
  notificationSnoozeKey,
  parseNotificationSnoozeUntil,
} from "@/lib/notification-reminders";
import type { Settings, WorkRecord } from "@/lib/types";

type Args = {
  settings: Settings["notificationSettings"];
  selectedDate: string;
  record: WorkRecord;
  dailyTarget: number;
  worked: number;
  suggestedExit: string;
  setToast: (message: string) => void;
};

export function useNotificationReminders({ settings, selectedDate, record, dailyTarget, worked, suggestedExit, setToast }: Args) {
  const { start, end, startedAt, endedAt, lunchStartedAt, lunchEndedAt, breaks } = record;

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
      const nowMs = Date.now();
      const locale = getBrowserLocale();
      const candidates = evaluateNotificationReminders({
        settings,
        record: { start, end, startedAt, endedAt, lunchStartedAt, lunchEndedAt, breaks },
        nowMs,
        nowTime: nowTime(),
        fallbackWorked: worked,
        dailyTarget,
        suggestedExit,
        snoozeUntilMs: parseNotificationSnoozeUntil(localStorage.getItem(notificationSnoozeKey(selectedDate))),
        breakReminderSnoozed: Boolean(sessionStorage.getItem(breakReminderSnoozeKey(selectedDate))),
      });

      for (const candidate of candidates) {
        if (candidate.kind === "open-timer") {
          notifyOnce(candidate.key, translateSystem(locale, "Saatyar timer is still running"), translateSystem(locale, "More than {minutes} minutes of active work have been recorded.", { minutes: formatLocaleNumber(locale, settings.openTimerReminderMinutes) }));
        } else if (candidate.kind === "target") {
          notifyOnce(candidate.key, translateSystem(locale, "Daily target completed"), translateSystem(locale, "Today's required work is complete."));
        } else if (candidate.kind === "exit") {
          notifyOnce(candidate.key, translateSystem(locale, "It's time to clock out"), translateSystem(locale, "Today's suggested exit is {time}.", { time: suggestedExit }));
        } else if (candidate.kind === "break") {
          notifyOnce(candidate.key, translateSystem(locale, "Time for a short break"), translateSystem(locale, "You have had about {minutes} minutes of active work. Step away for a few minutes, then continue.", { minutes: formatLocaleNumber(locale, settings.breakReminder.intervalMinutes) }));
        } else {
          const custom = settings.customReminders.find((item) => item.id === candidate.customReminderId);
          if (!custom) continue;
          notifyOnce(candidate.key, custom.title.trim() || translateSystem(locale, "Custom work reminder"), custom.message.trim() || translateSystem(locale, "You have reached another active-work reminder interval."));
        }
      }
    };

    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, [settings, selectedDate, start, end, startedAt, endedAt, lunchStartedAt, lunchEndedAt, breaks, dailyTarget, worked, suggestedExit]);

  return { requestNotificationPermission };
}
