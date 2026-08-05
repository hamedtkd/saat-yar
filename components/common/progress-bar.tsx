import { cn } from "@/lib/cn";

type ProgressTone = "accent" | "warning" | "danger" | "success";

const tones: Record<ProgressTone, string> = {
  accent: "bg-[var(--accent)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
  success: "bg-[var(--success)]",
};

export function ProgressBar({ value, tone = "accent", className }: { value: number; tone?: ProgressTone; className?: string }) {
  return <div className={cn("h-2 overflow-hidden rounded-full bg-[var(--surface-2)] ring-1 ring-inset ring-[var(--border)]", className)}><span className={cn("block h-full rounded-full transition-[width]", tones[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}
