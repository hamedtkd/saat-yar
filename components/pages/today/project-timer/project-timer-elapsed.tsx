"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { FlipClock } from "@/components/ui/flip-clock";
import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { cn } from "@/lib/cn";
import { projectTimerElapsedSeconds, type ProjectTimerSession } from "@/lib/project-timer-session";
import type { TimeEntry } from "@/lib/types";

export function ProjectTimerElapsed({ activeEntry, session, className }: {
  activeEntry?: TimeEntry;
  session: ProjectTimerSession | null;
  className?: string;
}) {
  const { digits, durationSeconds, t } = useLocaleUi();
  // Keep the shared second clock subscribed for the whole project-timer session.
  // Paused elapsed still stays frozen in projectTimerElapsedSeconds, but Resume
  // does not have to tear down and recreate the runtime-clock subscription.
  const clockActive = Boolean(activeEntry || session);
  const now = useRuntimeNow("second", clockActive);
  const fallbackStartedAt = session?.segmentStartedAt ?? activeEntry?.startedAt;
  const fallbackNow = fallbackStartedAt ? new Date(fallbackStartedAt).getTime() : 0;
  const seconds = projectTimerElapsedSeconds(activeEntry, session, now ?? fallbackNow);
  const labels = [t("today.timer.unitHours"), t("today.timer.unitMinutes"), t("today.timer.unitSeconds")] as const;

  return (
    <div data-project-timer-display role="timer" className={cn("flex w-full justify-center", className)}>
      <FlipClock
        seconds={seconds}
        ariaLabel={seconds ? durationSeconds(seconds) : t("today.timer.ready")}
        size="project"
        variant="boxed"
        unitLabels={labels}
        formatDigit={(digit) => digits(digit)}
      />
    </div>
  );
}
