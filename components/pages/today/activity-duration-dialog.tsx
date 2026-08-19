"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock3 } from "lucide-react";

import { NumberField } from "@/components/common/number-field";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { activitySegmentMinutes } from "@/lib/activity-segments";
import type { ActivitySegment } from "@/lib/types";

function DurationField({
  label,
  value,
  max,
  testId,
  direction,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  testId: "hours" | "minutes";
  direction: "rtl" | "ltr";
  onChange: (value: number) => void;
}) {
  const set = (next: number) => onChange(Math.max(0, Math.min(max, next)));
  return (
    <label dir={direction} className="grid min-w-0 gap-2 text-[10px] font-bold text-[var(--text-muted)]">
      <span className="text-start">{label}</span>
      <span className="relative block min-w-0">
        <NumberField
          data-activity-duration-hours={testId === "hours" ? "true" : undefined}
          data-activity-duration-minutes={testId === "minutes" ? "true" : undefined}
          min={0}
          max={max}
          value={value}
          onValueChange={set}
          className="h-14 rounded-xl px-11 text-center text-base font-black tabular-nums"
        />
        <span className="absolute inset-y-1.5 end-1.5 grid w-8 grid-rows-2 overflow-hidden rounded-lg border border-[var(--dashboard-border)] bg-[var(--surface-1)]">
          <button
            type="button"
            className="grid place-items-center text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-soft)]"
            aria-label={`${label} +`}
            onClick={() => set(value + 1)}
          >
            <ChevronUp aria-hidden="true" className="size-3.5" />
          </button>
          <button
            type="button"
            className="grid place-items-center border-t border-[var(--dashboard-border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-soft)]"
            aria-label={`${label} -`}
            onClick={() => set(value - 1)}
          >
            <ChevronDown aria-hidden="true" className="size-3.5" />
          </button>
        </span>
      </span>
    </label>
  );
}

export function ActivityDurationDialog({ open, segment, onOpenChange, onSave }: {
  open: boolean;
  segment: ActivitySegment;
  onOpenChange: (open: boolean) => void;
  onSave: (minutes: number) => void;
}) {
  const { direction, t } = useLocaleUi();
  const initial = Math.max(1, activitySegmentMinutes(segment));
  const [hours, setHours] = useState(Math.floor(initial / 60));
  const [minutes, setMinutes] = useState(initial % 60);

  function handleOpenChange(next: boolean) {
    if (next) {
      const current = Math.max(1, activitySegmentMinutes(segment));
      setHours(Math.floor(current / 60));
      setMinutes(current % 60);
    }
    onOpenChange(next);
  }

  function save() {
    const total = Math.max(1, Math.min(24 * 60, hours * 60 + minutes));
    onSave(total);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 p-5 sm:p-6">
        <DialogHeader className="gap-2">
          <DialogTitle className="inline-flex items-center gap-2 text-lg">
            <Clock3 aria-hidden="true" className="size-4.5 text-[var(--accent-strong)]" />
            {t("activity.today.editDuration")}
          </DialogTitle>
          <DialogDescription>{t("activity.today.editDurationDescription")}</DialogDescription>
        </DialogHeader>

        <div
          dir="ltr"
          data-activity-duration-fields
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          <DurationField label={t("activity.today.hours")} value={hours} max={23} testId="hours" direction={direction} onChange={setHours} />
          <DurationField label={t("activity.today.minutes")} value={minutes} max={59} testId="minutes" direction={direction} onChange={setMinutes} />
        </div>

        <DialogFooter className="justify-start border-t border-[var(--dashboard-border)] pt-4">
          <Button data-save-activity-duration onClick={save} className="min-w-28">{t("activity.today.saveDuration")}</Button>
          <DialogClose asChild><Button type="button" variant="outline" className="min-w-20">{t("common.cancel")}</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
