import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusBadgeTone;
  success?: boolean;
  className?: string;
};

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]",
  success: "border-[color-mix(in_srgb,var(--success)_28%,var(--border))] bg-[var(--success-soft)] text-[var(--success)]",
  warning: "border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "border-[color-mix(in_srgb,var(--info)_28%,var(--border))] bg-[var(--info-soft)] text-[var(--info)]",
};

export function StatusBadge({ children, tone, success, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? (success === undefined ? "neutral" : success ? "success" : "neutral");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg border px-[9px] py-1 text-[10px] font-semibold",
        toneClasses[resolvedTone],
        className,
      )}
    >
      {children}
    </span>
  );
}
