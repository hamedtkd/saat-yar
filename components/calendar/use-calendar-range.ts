"use client";

import { useEffect } from "react";
import type { ExternalCalendarRange } from "@/lib/calendar-integration/types";
import { useCalendarIntegration } from "./calendar-integration-provider";

export function useCalendarRange(range: ExternalCalendarRange) {
  const integration = useCalendarIntegration();
  const { endDateKeyExclusive, startDateKey } = range;
  const { events, loadRange, loadedRange, loadingEvents, state } = integration;
  const loaded = loadedRange?.startDateKey === startDateKey
    && loadedRange?.endDateKeyExclusive === endDateKeyExclusive;

  useEffect(() => {
    if (state === "connected") {
      void loadRange({ startDateKey, endDateKeyExclusive });
    }
  }, [endDateKeyExclusive, loadRange, startDateKey, state]);

  return {
    ...integration,
    events: loaded ? events : [],
    loadingEvents: loadingEvents || (state === "connected" && !loaded),
  };
}
