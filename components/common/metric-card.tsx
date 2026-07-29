import type { ReactNode } from "react";
import { tw } from "@/lib/tw";

export type MetricTone = "green" | "blue" | "amber" | "purple";

export function MetricCard({ icon, label, value, suffix, tone = "green" }: {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  tone?: MetricTone;
}) {
  return (
    <article className={tw("metric-card", `tone-${tone}`)}>
      <span className={tw("metric-icon")}>{icon}</span>
      <div><small>{label}</small><strong>{value}</strong>{suffix && <span>{suffix}</span>}</div>
    </article>
  );
}
