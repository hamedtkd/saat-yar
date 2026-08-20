import { Check, X } from "lucide-react";
import { useId, type RefObject } from "react";

import { ResponsivePickerSurface } from "@/components/pickers/responsive-picker-surface";
import { Button } from "@/components/ui/button";
import { useDialogAccessibility } from "@/hooks/accessibility/use-dialog-accessibility";
import { useResponsivePickerPresentation } from "@/hooks/use-responsive-picker-presentation";
import { translate } from "@/lib/i18n/catalog";
import type { CalendarSystem } from "@/lib/i18n/calendars";
import type { Locale } from "@/lib/i18n/locales";

import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import type { CalendarDayCell, HolidayOptions } from "./types";

type DatePickerDialogProps = {
  anchorRef: RefObject<HTMLDivElement | null>;
  locale: Locale;
  calendar: CalendarSystem;
  title: string;
  cells: CalendarDayCell[];
  value: string;
  today: string;
  recorded: Set<string>;
  holidayOptions: HolidayOptions;
  onClose: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelect: (date: string) => void;
  onSelectToday: () => void;
};

export function DatePickerDialog(props: DatePickerDialogProps) {
  const titleId = useId();
  const presentation = useResponsivePickerPresentation();
  const dialogRef = useDialogAccessibility(props.onClose, { modal: presentation === "drawer" });
  const closeLabel = translate(props.locale, "picker.date.close");

  return (
    <ResponsivePickerSurface
      presentation={presentation}
      dialogRef={dialogRef}
      anchorRef={props.anchorRef}
      titleId={titleId}
      dir={props.locale === "fa-IR" ? "rtl" : "ltr"}
      closeLabel={closeLabel}
      onClose={props.onClose}
      widthClassName={presentation === "popover" ? "w-[430px] max-w-[calc(100vw-24px)]" : "w-auto"}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-sm font-extrabold text-[var(--text)]">
          {translate(props.locale, "picker.date.title")}
        </h2>
        <Button type="button" variant="ghost" size="icon" aria-label={closeLabel} onClick={props.onClose}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <CalendarHeader
        locale={props.locale}
        title={props.title}
        onPreviousMonth={props.onPreviousMonth}
        onNextMonth={props.onNextMonth}
      />
      <CalendarGrid
        locale={props.locale}
        calendar={props.calendar}
        cells={props.cells}
        value={props.value}
        today={props.today}
        recorded={props.recorded}
        holidayOptions={props.holidayOptions}
        onSelect={props.onSelect}
      />
      <Button
        type="button"
        onClick={props.onSelectToday}
        className="mt-4 h-12 w-full rounded-xl bg-[var(--accent-fill)] text-sm font-extrabold text-[var(--accent-foreground)] shadow-none hover:brightness-110"
      >
        <Check aria-hidden="true" className="size-4.5" />
        {translate(props.locale, "picker.date.today")}
      </Button>
    </ResponsivePickerSurface>
  );
}
