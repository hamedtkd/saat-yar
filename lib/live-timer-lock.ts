export const LIVE_TIMER_LOCK_KEY = "saatyar:live-timer-lock";
export const LIVE_TIMER_CHANNEL = "saatyar:live-timer-lock";
export const LIVE_TIMER_LOCK_STALE_MS = 45_000;
export const LIVE_TIMER_HEARTBEAT_MS = 15_000;

export type LiveTimerLock = {
  tabId: string;
  updatedAt: string;
};

export function createLiveTimerLock(tabId: string, now = new Date()): LiveTimerLock {
  return { tabId, updatedAt: now.toISOString() };
}

export function parseLiveTimerLock(value: string | null): LiveTimerLock | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<LiveTimerLock>;
    if (typeof parsed.tabId !== "string") return null;
    if (!Number.isFinite(new Date(parsed.updatedAt ?? "").getTime())) return null;
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
