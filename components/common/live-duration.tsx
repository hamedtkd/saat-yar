"use client";

import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { durationSeconds } from "@/lib/format";

export function LiveDuration({ startedAt }: { startedAt: string }) {
  const now = useRuntimeNow("second", true);
  const started = new Date(startedAt).getTime();
  const seconds = Math.max(0, Math.floor(((now ?? started) - started) / 1000));
  return <span data-live-duration="true">{durationSeconds(seconds)}</span>;
}
