export type RuntimeClockCadence = "second" | "minute";

type RuntimeClockListener = () => void;

type RuntimeClockEntry = {
  cadence: RuntimeClockCadence;
  listener: RuntimeClockListener;
};

const entries = new Set<RuntimeClockEntry>();
let secondNowMs = 0;
let minuteNowMs = 0;
let minuteBucket = -1;
let timerId: number | undefined;
let browserEventsAttached = false;

export function runtimeClockDelay(now: number, cadence: RuntimeClockCadence) {
  const unit = cadence === "second" ? 1_000 : 60_000;
  return Math.max(20, unit - (now % unit) + 20);
}

function preferredCadence(): RuntimeClockCadence | null {
  if ([...entries].some((entry) => entry.cadence === "second")) return "second";
  return entries.size ? "minute" : null;
}

function clearTimer() {
  if (timerId === undefined || typeof window === "undefined") return;
  window.clearTimeout(timerId);
  timerId = undefined;
}

function publish(forceAll = false) {
  const nextNowMs = Date.now();
  const nextMinuteBucket = Math.floor(nextNowMs / 60_000);
  const minuteChanged = nextMinuteBucket !== minuteBucket;
  minuteBucket = nextMinuteBucket;
  secondNowMs = nextNowMs;
  if (forceAll || minuteChanged) minuteNowMs = nextNowMs;

  for (const entry of entries) {
    if (forceAll || entry.cadence === "second" || minuteChanged) entry.listener();
  }
}

function schedule() {
  clearTimer();
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (document.visibilityState !== "visible") return;
  const cadence = preferredCadence();
  if (!cadence) return;

  timerId = window.setTimeout(() => {
    timerId = undefined;
    publish(false);
    schedule();
  }, runtimeClockDelay(Date.now(), cadence));
}

function syncVisibleClock() {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  publish(true);
  schedule();
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") syncVisibleClock();
  else clearTimer();
}

function attachBrowserEvents() {
  if (browserEventsAttached || typeof window === "undefined" || typeof document === "undefined") return;
  browserEventsAttached = true;
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", syncVisibleClock);
  window.addEventListener("pageshow", syncVisibleClock);
}

function detachBrowserEvents() {
  if (!browserEventsAttached || typeof window === "undefined" || typeof document === "undefined") return;
  browserEventsAttached = false;
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("focus", syncVisibleClock);
  window.removeEventListener("pageshow", syncVisibleClock);
}

export function getRuntimeClockNow(cadence: RuntimeClockCadence = "minute") {
  return cadence === "second" ? secondNowMs : minuteNowMs;
}

export function subscribeRuntimeClock(listener: RuntimeClockListener, cadence: RuntimeClockCadence) {
  const entry = { listener, cadence } satisfies RuntimeClockEntry;
  entries.add(entry);
  attachBrowserEvents();
  syncVisibleClock();

  return () => {
    entries.delete(entry);
    if (!entries.size) {
      clearTimer();
      detachBrowserEvents();
      return;
    }
    schedule();
  };
}
