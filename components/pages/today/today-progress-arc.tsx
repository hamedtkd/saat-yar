import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TodayProgressArc({ value, children, className }: {
  value: number;
  children: ReactNode;
  className?: string;
}) {
  const progress = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative mx-auto w-full max-w-[310px]", className)}>
      <svg viewBox="0 0 260 150" className="h-auto w-full overflow-visible" aria-hidden="true">
        <path
          d="M 24 126 A 106 106 0 0 1 236 126"
          pathLength="100"
          fill="none"
          stroke="color-mix(in srgb,var(--border) 82%,transparent)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 24 126 A 106 106 0 0 1 236 126"
          pathLength="100"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} 100`}
          className="drop-shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <div className="absolute inset-x-8 bottom-2 text-center">{children}</div>
    </div>
  );
}
