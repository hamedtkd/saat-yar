import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FloatingNoticeTone = "info" | "success" | "warning" | "danger";

const toneShell: Record<FloatingNoticeTone, string> = {
  info: "border-[color-mix(in_srgb,var(--info)_26%,var(--dashboard-border))] bg-[color-mix(in_srgb,var(--info)_8%,var(--surface-raised))]",
  success: "border-[color-mix(in_srgb,var(--success)_28%,var(--dashboard-border))] bg-[color-mix(in_srgb,var(--success)_8%,var(--surface-raised))]",
  warning: "border-[color-mix(in_srgb,var(--warning)_30%,var(--dashboard-border))] bg-[var(--warning-soft)]",
  danger: "border-[color-mix(in_srgb,var(--danger)_30%,var(--dashboard-border))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface-raised))]",
};

export function FloatingNotice({
  title,
  description,
  icon,
  action,
  tone = "info",
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: FloatingNoticeTone;
  className?: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[950] flex justify-end sm:inset-x-6 sm:top-6">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto w-full max-w-[min(100%,28rem)] rounded-[var(--card-radius)] border p-4 text-[var(--text)] shadow-[var(--surface-shadow)] ring-1 ring-[color-mix(in_srgb,var(--text)_6%,transparent)] backdrop-blur",
          toneShell[tone],
          className,
        )}
      >
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--control-radius)] bg-[var(--surface-1)] text-[var(--accent-strong)] shadow-sm">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black leading-6">{title}</div>
            {description ? <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{description}</p> : null}
            {action ? <div className="mt-3 flex flex-wrap items-center gap-2">{action}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
