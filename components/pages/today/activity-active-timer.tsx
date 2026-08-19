"use client";

import { FlipClock } from "@/components/ui/flip-clock";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { activitySegmentElapsedSeconds } from "@/lib/activity-segments";
import type { ActivitySegment } from "@/lib/types";

export function ActivityActiveTimer({ segment }: { segment: ActivitySegment }) {
  const { digits, durationSeconds, t } = useLocaleUi();
  const now = useRuntimeNow("second", true);
  const fallback = segment.startedAt ? new Date(segment.startedAt).getTime() : 0;
  const seconds = now || segment.startedAt ? activitySegmentElapsedSeconds(segment, new Date(now ?? fallback)) : 0;

  return (
    <div data-activity-live-timer role="timer" className="flex min-w-0 justify-center">
      <FlipClock
        seconds={seconds}
        ariaLabel={durationSeconds(seconds)}
        size="activity"
        variant="boxed"
        unitLabels={[t("today.timer.unitHours"), t("today.timer.unitMinutes"), t("today.timer.unitSeconds")]}
        formatDigit={(digit) => digits(digit)}
      />
    </div>
  );
}
