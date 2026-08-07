import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TodayProgressArc({ value, children, className }: {
  value: number;
  children: ReactNode;
  className?: string;
}) {
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("relative mx-auto w-full max-w-[300px] pt-1", className)}>
      <svg viewBox="0 0 280 158" className="block h-auto w-full overflow-visible" aria-hidden="true">
        <path
          d="M 30 132 A 110 110 0 0 1 250 132"
          pathLength="100"
          fill="none"
          stroke="color-mix(in srgb,var(--accent) 10%,var(--border))"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 30 132 A 110 110 0 0 1 250 132"
          pathLength="100"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset={100 - progress}
          className="drop-shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_24%,transparent)] transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-x-6 top-[58px] text-center">{children}</div>
    </div>
  );
}
