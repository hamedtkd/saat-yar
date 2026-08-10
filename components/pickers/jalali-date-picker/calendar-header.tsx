import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { translate } from "@/lib/i18n/catalog";
import type { Locale } from "@/lib/i18n/locales";

type CalendarHeaderProps = {
  locale: Locale;
  title: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarHeader({
  locale,
  title,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  const isRtl = locale === "fa-IR";
  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="mb-4 grid grid-cols-[52px_1fr_52px] items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={translate(locale, "picker.date.previousMonth")}
        onClick={onPreviousMonth}
        className="size-13 rounded-xl border-[var(--border)] shadow-none"
      >
        <PreviousIcon aria-hidden="true" className="size-5" />
      </Button>
      <strong className="text-center text-sm font-extrabold text-[var(--text)]">
        {title}
      </strong>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={translate(locale, "picker.date.nextMonth")}
        onClick={onNextMonth}
        className="size-13 rounded-xl border-[var(--border)] shadow-none"
      >
        <NextIcon aria-hidden="true" className="size-5" />
      </Button>
    </div>
  );
}
