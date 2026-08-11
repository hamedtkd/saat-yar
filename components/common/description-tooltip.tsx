import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

export function DescriptionTooltip({ content, className }: { content: ReactNode; className?: string }) {
  const spoken = typeof content === "string" ? content : "Details";

  return (
    <span className={cn("group/description relative inline-flex shrink-0 align-middle", className)}>
      <button
        type="button"
        aria-label={spoken}
        className="grid size-6 place-items-center rounded-full border border-transparent text-[var(--text-muted)] transition hover:border-[var(--dashboard-border)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-strong)] focus-visible:border-[var(--accent)] focus-visible:bg-[var(--accent-soft)] focus-visible:text-[var(--accent-strong)] focus-visible:outline-none"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute start-0 top-[calc(100%+7px)] z-[1200] w-max max-w-[min(320px,calc(100vw-32px))] translate-y-1 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-3 py-2.5 text-start text-[10px] font-semibold leading-5 text-[var(--text-muted)] opacity-0 shadow-[0_14px_36px_rgba(0,0,0,.18)] backdrop-blur-xl transition duration-150 group-hover/description:visible group-hover/description:translate-y-0 group-hover/description:opacity-100 group-focus-within/description:visible group-focus-within/description:translate-y-0 group-focus-within/description:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
