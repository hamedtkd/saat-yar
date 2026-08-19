import { Check, X } from "lucide-react";
import { useId, type RefObject } from "react";

import { ResponsivePickerSurface } from "@/components/pickers/responsive-picker-surface";
import { Button } from "@/components/ui/button";
import { useDialogAccessibility } from "@/hooks/accessibility/use-dialog-accessibility";
import { useResponsivePickerPresentation } from "@/hooks/use-responsive-picker-presentation";
import { translate } from "@/lib/i18n/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { HOURS, MINUTES } from "./time-utils";
import { TimeSuggestions } from "./time-suggestions";
import type { TimeSuggestion } from "./types";
import { TimeWheelField } from "./time-wheel-field";

export function TimePickerDialog({
  anchorRef,
  locale,
  hour,
  minute,
  draft,
  suggestions,
  onHourChange,
  onMinuteChange,
  onDraftChange,
  onClose,
  onConfirm,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
  locale: Locale;
  hour: string;
  minute: string;
  draft: string;
  suggestions: TimeSuggestion[];
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const presentation = useResponsivePickerPresentation();
  const dialogRef = useDialogAccessibility(onClose, { modal: presentation === "drawer" });
  const closeLabel = translate(locale, "picker.time.close");

  return (
    <ResponsivePickerSurface
      presentation={presentation}
      dialogRef={dialogRef}
      anchorRef={anchorRef}
      titleId={titleId}
      dir={locale === "fa-IR" ? "rtl" : "ltr"}
      closeLabel={closeLabel}
      onClose={onClose}
      widthClassName={presentation === "popover" ? "w-[340px] max-w-[calc(100vw-24px)]" : "w-auto"}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <h2 id={titleId} className="text-sm font-extrabold text-[var(--text)]">
            {translate(locale, "picker.time.title")}
          </h2>
          <p className="text-[10px] leading-5 text-[var(--text-muted)]">{translate(locale, "picker.time.wheelHint")}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label={closeLabel} onClick={onClose}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <div dir="ltr" className="mb-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-[10px] font-semibold text-[var(--text-muted)]">
        <span>{translate(locale, "picker.time.hour")}</span>
        <span aria-hidden="true" className="invisible">:</span>
        <span>{translate(locale, "picker.time.minute")}</span>
      </div>
      <TimeWheelField
        locale={locale}
        hour={hour}
        minute={minute}
        hourLabel={translate(locale, "picker.time.chooseHour")}
        minuteLabel={translate(locale, "picker.time.chooseMinute")}
        hours={HOURS}
        minutes={MINUTES}
        onHourChange={onHourChange}
        onMinuteChange={onMinuteChange}
      />
      <TimeSuggestions locale={locale} suggestions={suggestions} draft={draft} onSelect={onDraftChange} />
      <Button type="button" className="mt-3 min-h-11 w-full" onClick={onConfirm}>
        <Check aria-hidden="true" className="size-4" />
        {translate(locale, "picker.time.confirm")}
      </Button>
    </ResponsivePickerSurface>
  );
}
