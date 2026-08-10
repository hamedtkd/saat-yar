import { translate } from "./i18n/catalog.ts";
import type { Locale } from "./i18n/locales.ts";

export type GreetingPeriod = "صبح" | "ظهر" | "عصر" | "شب";

export function getGreetingPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return "صبح";
  if (hour >= 12 && hour < 16) return "ظهر";
  if (hour >= 16 && hour < 20) return "عصر";
  return "شب";
}

export function buildGreeting(name: string, hour = new Date().getHours()) {
  const greeting = `${getGreetingPeriod(hour)} بخیر`;
  const trimmedName = name.trim();
  return trimmedName ? `${greeting}، ${trimmedName}` : greeting;
}

export function buildLocalizedGreeting(name: string, locale: Locale, hour = new Date().getHours()) {
  const key = hour >= 5 && hour < 12
    ? "greeting.morning"
    : hour >= 12 && hour < 16
      ? "greeting.noon"
      : hour >= 16 && hour < 20
        ? "greeting.evening"
        : "greeting.night";
  const greeting = translate(locale, key);
  const trimmedName = name.trim();
  return trimmedName ? translate(locale, "greeting.named", { greeting, name: trimmedName }) : greeting;
}
