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
        "grid h-13 w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto]",
        "items-center gap-2.5 rounded-xl border-[#d5e2e4] bg-white px-3 text-right",
        "shadow-none hover:bg-white focus-visible:border-[#079b60]",
        "focus-visible:ring-[#079b60]/15",
      )}
    >
      <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-[#079b60]" />
      <span className="grid min-w-0 gap-0.5">
        <small className="text-[9px] font-medium text-[#6c7d89]">{placeholder}</small>
        <strong className="truncate text-[11px] font-extrabold text-[#102a3a]">
          {selectedLabel}
        </strong>
      </span>
      <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-[#6c7d89]" />
    </Button>
  );
}
