"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { FlipClock } from "@/components/ui/flip-clock";
import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { liveWorkedSeconds } from "@/lib/time-engine";
import type { ReturnTypeCalc } from "@/lib/type-helpers";
import type { WorkRecord } from "@/lib/types";

export function LiveWorkDuration({ record, fallback }: { record: WorkRecord; fallback: ReturnTypeCalc }) {
  const { duration, durationSeconds, t } = useLocaleUi();
  const active = Boolean(record.start && !record.end);
  const now = useRuntimeNow("second", active);

  if (!active || !now) return <>{duration(fallback.worked)}</>;

  const seconds = liveWorkedSeconds(record, new Date(now));
  return (
    <span data-live-work-duration="true" aria-label={t("today.summary.currentWork")}>
      <FlipClock seconds={seconds} ariaLabel={durationSeconds(seconds)} />
    </span>
  );
}
