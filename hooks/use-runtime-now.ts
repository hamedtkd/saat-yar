"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getRuntimeClockNow, subscribeRuntimeClock, type RuntimeClockCadence } from "@/lib/runtime-clock";

const getServerSnapshot = () => 0;

export function useRuntimeNow(cadence: RuntimeClockCadence = "minute", active = true) {
  const subscribe = useCallback(
    (listener: () => void) => active ? subscribeRuntimeClock(listener, cadence) : () => undefined,
    [active, cadence],
  );
  const getSnapshot = useCallback(() => active ? getRuntimeClockNow(cadence) : 0, [active, cadence]);
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return active && now ? now : null;
}
