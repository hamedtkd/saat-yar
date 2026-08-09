"use client";

import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { calcLive } from "@/lib/time-engine";
import type { ReturnTypeCalc } from "@/lib/type-helpers";
import type { WorkRecord } from "@/lib/types";

export function useLiveWorkCalc(record: WorkRecord, dailyTarget: number, fallback: ReturnTypeCalc) {
  const active = Boolean(record.start && !record.end);
  const now = useRuntimeNow("minute", active);
  return active && now ? calcLive(record, dailyTarget, new Date(now)) : fallback;
}
