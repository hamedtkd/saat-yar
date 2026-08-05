import { Check, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";

type ModeOptionProps = {
  id: Mode;
  icon: LucideIcon;
  title: string;
  points: string[];
  selected: boolean;
  onSelect: (mode: Mode) => void;
};

export function ModeOption({ id, icon: Icon, title, points, selected, onSelect }: ModeOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "relative min-h-[300px] rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-7 text-center text-[var(--text)] transition-colors",
        "hover:border-[color-mix(in_srgb,var(--accent)_34%,var(--border))] hover:bg-[var(--surface-2)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
        "max-[900px]:min-h-[210px] max-[620px]:min-h-[170px] max-[620px]:p-5",
        selected && "border-[var(--accent)] bg-[var(--accent-soft)]",
      )}
      onClick={() => onSelect(id)}
    >
      {selected && (
        <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Check aria-hidden="true" />
        </span>
      )}
      <span className={cn("mx-auto mb-6 mt-3 grid size-16 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]", selected && "bg-[var(--surface-1)] text-[var(--accent-strong)]", "max-[620px]:mb-3 max-[620px]:mt-0 max-[620px]:size-12")}>
        <Icon className="size-8 max-[620px]:size-6" aria-hidden="true" />
      </span>
      <strong className="text-xl">{title}</strong>
      <ul className="mx-auto mt-5 grid list-none gap-2 p-0 text-sm text-[var(--text-muted)] max-[620px]:mt-3 max-[620px]:text-xs">
        {points.map((point) => <li key={point} className="before:ml-2 before:text-[var(--accent)] before:content-['•']">{point}</li>)}
      </ul>
    </button>
  );
}
