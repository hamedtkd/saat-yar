import { ChevronDown, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { faDigits } from "@/lib/format";
import { normalizeTime } from "./time-utils";

export function TimePickerTrigger({ value, open, onOpen }: { value: string; open: boolean; onOpen: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="grid h-11 w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 text-right"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <Clock3 aria-hidden="true" className="size-5 text-[var(--accent-strong)]" />
      <strong dir="ltr" className="justify-self-start font-extrabold tabular-nums">
        {value ? faDigits(normalizeTime(value)) : "--:--"}
      </strong>
      <ChevronDown aria-hidden="true" className="size-4 text-[var(--text-muted)]" />
    </Button>
  );
}
