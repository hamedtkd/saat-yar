"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";

export function ProgressRing({ value, children, size = "md", className }: {
  value: number;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { percent } = useLocaleUi();
  const progress = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full bg-[conic-gradient(var(--accent)_var(--progress),color-mix(in_srgb,var(--border)_70%,transparent)_0)] before:absolute before:inset-[8px] before:rounded-full before:bg-[var(--surface-1)] before:content-['']",
        size === "sm" && "size-16",
        size === "md" && "size-20",
        size === "lg" && "size-28 before:inset-[10px]",
        className,
      )}
      style={{ "--progress": `${progress * 3.6}deg` } as CSSProperties}
      aria-label={percent(progress)}
    >
      <div className="relative z-10 text-center">{children}</div>
    </div>
  );
}
