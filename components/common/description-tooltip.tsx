"use client";

import { useId, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { FloatingTooltip } from "@/components/common/floating-tooltip";

export function DescriptionTooltip({ content, className }: { content: ReactNode; className?: string }) {
  const spoken = typeof content === "string" ? content : "Details";
  const id = useId();
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("inline-flex shrink-0 align-middle", className)}>
      <button
        ref={setTarget}
        type="button"
        aria-label={spoken}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        className="grid size-6 place-items-center rounded-full border border-transparent text-[var(--text-muted)] transition hover:border-[var(--dashboard-border)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-strong)] focus-visible:border-[var(--accent)] focus-visible:bg-[var(--accent-soft)] focus-visible:text-[var(--accent-strong)] focus-visible:outline-none"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      {open && <FloatingTooltip id={id} target={target}>{content}</FloatingTooltip>}
    </span>
  );
}
