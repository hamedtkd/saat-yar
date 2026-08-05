import { ChevronDown, Clock3 } from "lucide-react";
import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";

export function TimePickerTrigger({ inputValue, error, open, onInputChange, onCommit, onOpen }: {
  inputValue: string;
  error: string;
  open: boolean;
  onInputChange: (value: string) => void;
  onCommit: () => boolean;
  onOpen: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onCommit();
  };

  return (
    <div className="grid gap-1.5">
      <div className="grid min-h-11 grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] px-3 focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
        <Clock3 aria-hidden="true" className="size-5 text-[var(--accent-strong)]" />
        <input
          dir="ltr"
          inputMode="numeric"
          aria-label="زمان"
          aria-invalid={Boolean(error)}
          value={inputValue}
          placeholder="مثلاً ۰۸:۳۰"
          className="min-w-0 bg-transparent py-2 text-left font-extrabold tabular-nums text-[var(--text)] outline-none placeholder:font-normal placeholder:text-[var(--text-muted)]"
          onChange={(event) => onInputChange(event.target.value)}
          onBlur={onCommit}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onOpen} aria-haspopup="dialog" aria-expanded={open} aria-label="بازکردن انتخاب‌گر زمان">
          <ChevronDown aria-hidden="true" className="size-4 text-[var(--text-muted)]" />
        </Button>
      </div>
      {error && <p role="alert" className="text-[10px] font-semibold text-[var(--danger)]">{error}</p>}
    </div>
  );
}
