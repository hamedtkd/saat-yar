import { CalendarDays, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type DatePickerTriggerProps = {
  open: boolean;
  placeholder: string;
  selectedLabel: string;
  onOpen: () => void;
};

export function DatePickerTrigger({
  open,
  placeholder,
  selectedLabel,
  onOpen,
}: DatePickerTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(
        "grid h-13 w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] max-[359px]:h-11",
        "items-center gap-2.5 rounded-xl border-[var(--border)] bg-[var(--surface-2)] px-3 text-start max-[359px]:gap-1.5 max-[359px]:rounded-[10px] max-[359px]:px-2",
        "shadow-none hover:bg-[var(--surface-1)] focus-visible:border-[var(--accent)]",
        "focus-visible:ring-[var(--accent-soft)]",
      )}
    >
      <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-[var(--accent-strong)] max-[359px]:size-4" />
      <span className="grid min-w-0 gap-0.5">
        <small className="text-[9px] font-medium text-[var(--text-muted)] max-[359px]:text-[8px]">{placeholder}</small>
        <strong className="truncate text-[11px] font-extrabold text-[var(--text)] max-[359px]:text-[10px]">
          {selectedLabel}
        </strong>
      </span>
      <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-[var(--text-muted)] max-[359px]:size-3.5" />
    </Button>
  );
}
