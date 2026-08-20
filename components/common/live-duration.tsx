"use client";

import { FlipClock } from "@/components/ui/flip-clock";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { useRuntimeNow } from "@/hooks/use-runtime-now";

export function LiveDuration({ startedAt, className }: { startedAt: string; className?: string }) {
  const { durationSeconds } = useLocaleUi();
  const now = useRuntimeNow("second", true);
  const started = new Date(startedAt).getTime();
  const seconds = Math.max(0, Math.floor(((now ?? started) - started) / 1000));
  return (
    <span data-live-duration="true">
      <FlipClock seconds={seconds} ariaLabel={durationSeconds(seconds)} className={className} />
    </span>
  );
}
