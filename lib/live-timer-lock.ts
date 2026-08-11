import { formatLocaleNumber } from "./i18n/formatters.ts";
import type { Locale } from "./i18n/locales.ts";
import { translateSystem } from "./i18n/system.ts";

export const LIVE_TIMER_LOCK_KEY = "saatyar:live-timer-lock";
export const LIVE_TIMER_CHANNEL = "saatyar:live-timer-lock";
export const LIVE_TIMER_LOCK_STALE_MS = 45_000;
export const LIVE_TIMER_HEARTBEAT_MS = 15_000;

export type LiveTimerLock = {
  tabId: string;
  updatedAt: string;
  deviceName?: string;
};

export function describeTimerDevice(userAgent: string, platform = "", locale: Locale = "fa-IR") {
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Firefox\//.test(userAgent) ? "Firefox" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : translateSystem(locale, "Browser");
  const system = /Windows/i.test(userAgent + platform) ? "Windows" : /Android/i.test(userAgent) ? "Android" : /iPhone|iPad|iPod/i.test(userAgent) ? "iOS" : /Mac/i.test(userAgent + platform) ? "macOS" : /Linux/i.test(userAgent + platform) ? "Linux" : translateSystem(locale, "Unknown device");
  return translateSystem(locale, "{browser} on {system}", { browser, system });
}

export function createLiveTimerLock(tabId: string, now = new Date(), deviceName?: string): LiveTimerLock {
  return { tabId, updatedAt: now.toISOString(), ...(deviceName ? { deviceName } : {}) };
}

export function parseLiveTimerLock(value: string | null): LiveTimerLock | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<LiveTimerLock>;
    if (typeof parsed.tabId !== "string") return null;
    if (!Number.isFinite(new Date(parsed.updatedAt ?? "").getTime())) return null;
    if (parsed.deviceName !== undefined && typeof parsed.deviceName !== "string") return null;
    return parsed as LiveTimerLock;
  } catch {
    return null;
  }
}

export function isLiveTimerLockFresh(lock: LiveTimerLock, now = Date.now()) {
  return now - new Date(lock.updatedAt).getTime() < LIVE_TIMER_LOCK_STALE_MS;
}

export function isOwnedByAnotherTab(lock: LiveTimerLock | null, tabId: string, now = Date.now()) {
  return Boolean(lock && lock.tabId !== tabId && isLiveTimerLockFresh(lock, now));
}

export function formatTimerHeartbeat(updatedAt: string, now = Date.now(), locale: Locale = "fa-IR") {
  const seconds = Math.max(0, Math.floor((now - new Date(updatedAt).getTime()) / 1000));
  if (seconds < 5) return translateSystem(locale, "Just now");
  if (seconds < 60) return translateSystem(locale, "{count} seconds ago", { count: formatLocaleNumber(locale, seconds) });
  return translateSystem(locale, "{count} minutes ago", { count: formatLocaleNumber(locale, Math.floor(seconds / 60)) });
}
