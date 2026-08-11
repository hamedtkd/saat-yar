import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TodayProgressArc({ value, children, className }: {
  value: number;
  children: ReactNode;
  className?: string;
}) {
  const progress = Math.max(0, Math.min(100, value));
  const size = 320;
  const center = size / 2;
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);
  const ticks = Array.from({ length: 60 }, (_, index) => {
    const angle = (index / 60) * Math.PI * 2 - Math.PI / 2;
    const outer = radius + 22;
    const inner = outer - (index % 5 === 0 ? 14 : 8);
    const x1 = center + Math.cos(angle) * inner;
    const y1 = center + Math.sin(angle) * inner;
    const x2 = center + Math.cos(angle) * outer;
    const y2 = center + Math.sin(angle) * outer;
    return { x1, y1, x2, y2, active: index / 60 < progress / 100 };
  });

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[320px]", className)}>
      <div className="pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_70%)] opacity-90" aria-hidden="true" />
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 block h-full w-full overflow-visible"
        data-dashboard-visual="progress-arc"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius + 30}
          fill="none"
          stroke="color-mix(in srgb,var(--accent) 10%,var(--border))"
          strokeWidth="1.5"
          opacity="0.85"
        />
        {ticks.map((tick, index) => (
          <line
            key={index}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.active ? "var(--accent)" : "color-mix(in srgb,var(--accent) 12%,var(--border))"}
            strokeWidth={tick.active ? 4.5 : 3}
            strokeLinecap="round"
            opacity={tick.active ? 0.95 : 0.45}
          />
        ))}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="color-mix(in srgb,var(--accent) 14%,var(--border))"
          strokeWidth="10"
          opacity="0.45"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
          style={{ filter: "drop-shadow(0 0 10px color-mix(in srgb,var(--accent) 35%,transparent))" }}
        />
      </svg>
      <div className="absolute inset-[22%] grid place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_12%,var(--border))] bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--surface-1)_82%,transparent),var(--surface-1))] px-6 text-center shadow-[inset_0_1px_0_color-mix(in_srgb,var(--text)_6%,transparent)]">
        {children}
      </div>
    </div>
  );
}
