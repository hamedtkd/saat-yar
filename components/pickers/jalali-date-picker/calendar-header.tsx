import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type CalendarHeaderProps = {
  title: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarHeader({
  title,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <div className="mb-4 grid grid-cols-[52px_1fr_52px] items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="ماه قبل"
        onClick={onPreviousMonth}
        className="size-13 rounded-xl border-[var(--border)] shadow-none"
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </Button>
      <strong className="text-center text-sm font-extrabold text-[var(--text)]">
        {title}
      </strong>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="ماه بعد"
        onClick={onNextMonth}
        className="size-13 rounded-xl border-[var(--border)] shadow-none"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </Button>
    </div>
  );
}
