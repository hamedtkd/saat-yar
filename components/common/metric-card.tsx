import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SurfaceCard } from "./surface-card";

export type MetricTone = "green" | "blue" | "amber" | "purple";

const tones: Record<MetricTone, string> = {
  green: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  blue: "bg-blue-500/10 text-blue-500",
  amber: "bg-amber-500/10 text-amber-500",
  purple: "bg-violet-500/10 text-violet-500",
};

export function MetricCard({ icon, label, value, suffix, tone = "green" }: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  suffix?: string;
  tone?: MetricTone;
}) {
  return (
    <SurfaceCard as="article" className="group flex min-h-32 items-center gap-4 p-5 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))]">
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl [&_svg]:size-6", tones[tone])}>{icon}</span>
      <div className="min-w-0">
        <small className="block text-xs font-semibold text-[var(--text-muted)]">{label}</small>
        <strong className="mt-1 block truncate text-[clamp(1.35rem,2vw,1.9rem)] font-black text-[var(--text)]">{value}</strong>
        {suffix && <span className="text-[11px] text-[var(--text-muted)]">{suffix}</span>}
      </div>
    </SurfaceCard>
  );
}
