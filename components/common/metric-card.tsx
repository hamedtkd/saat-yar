import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SurfaceCard } from "./surface-card";

export type MetricTone = "green" | "blue" | "amber" | "purple";

const tones: Record<MetricTone, string> = {
  green: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  blue: "bg-[var(--info-soft)] text-[var(--info)]",
  amber: "bg-[var(--warning-soft)] text-[var(--warning)]",
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
    <SurfaceCard as="article" className="dashboard-card group flex min-h-[104px] items-center gap-3.5 p-4 hover:border-[color-mix(in_srgb,var(--accent)_24%,var(--border))]">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5", tones[tone])}>{icon}</span>
      <div className="min-w-0">
        <small className="block text-[10px] font-semibold text-[var(--text-muted)]">{label}</small>
        <strong className="mt-1 block truncate text-[clamp(1.2rem,2vw,1.65rem)] font-black text-[var(--text)]">{value}</strong>
        {suffix && <span className="text-[10px] text-[var(--text-muted)]">{suffix}</span>}
      </div>
    </SurfaceCard>
  );
}
