import { Check, X } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { useDialogAccessibility } from "@/hooks/accessibility/use-dialog-accessibility";
import { translate } from "@/lib/i18n/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { HOURS, MINUTES } from "./time-utils";
import { TimeSelect } from "./time-select";
import { TimeSuggestions } from "./time-suggestions";
import type { TimeSuggestion } from "./types";

export function TimePickerDialog({
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
  const dialogRef = useDialogAccessibility(onClose);
  const closeLabel = translate(locale, "picker.time.close");

  return (
    <>
      <button type="button" aria-label={closeLabel} className="fixed inset-0 z-[700] border-0 bg-[var(--overlay)] backdrop-blur-[1px]" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} dir={locale === "fa-IR" ? "rtl" : "ltr"} className="fixed top-1/2 left-1/2 z-[750] max-h-[calc(100dvh-24px)] w-[min(360px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-3.5 shadow-[0_14px_42px_rgba(0,0,0,.2)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-sm font-extrabold text-[var(--text)]">{translate(locale, "picker.time.title")}</h2>
          <Button type="button" variant="ghost" size="icon" aria-label={closeLabel} onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </div>
        <div dir="ltr" className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-[10px] font-semibold text-[var(--text-muted)]">
          <span>{translate(locale, "picker.time.hour")}</span><span aria-hidden="true" className="invisible">:</span><span>{translate(locale, "picker.time.minute")}</span>
        </div>
        <div dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <TimeSelect locale={locale} label={translate(locale, "picker.time.chooseHour")} value={hour} options={HOURS} onChange={onHourChange} />
          <strong aria-hidden="true" className="text-xl font-extrabold text-[var(--text)]">:</strong>
          <TimeSelect locale={locale} label={translate(locale, "picker.time.chooseMinute")} value={minute} options={MINUTES} onChange={onMinuteChange} />
        </div>
        <TimeSuggestions locale={locale} suggestions={suggestions} draft={draft} onSelect={onDraftChange} />
        <Button type="button" className="mt-3 min-h-11 w-full" onClick={onConfirm}>
          <Check aria-hidden="true" className="size-4" />
          {translate(locale, "picker.time.confirm")}
        </Button>
      </div>
    </>
  );
}
