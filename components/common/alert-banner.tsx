import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertTone = "info" | "warning" | "success" | "danger";

type AlertBannerProps = {
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: AlertTone;
  className?: string;
};

const toneClasses: Record<AlertTone, string> = {
  info: "border-[color-mix(in_srgb,var(--info)_30%,var(--border))] bg-[var(--info-soft)] text-[var(--text)]",
  warning: "border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[var(--warning-soft)] text-[var(--text)]",
  success: "border-[color-mix(in_srgb,var(--success)_30%,var(--border))] bg-[var(--success-soft)] text-[var(--text)]",
  danger: "border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[var(--danger-soft)] text-[var(--text)]",
};

export function AlertBanner({ title, children, icon, action, tone = "info", className }: AlertBannerProps) {
  const role = tone === "danger" || tone === "warning" ? "alert" : "status";
  return (
    <div role={role} className={cn("flex items-center justify-between gap-3 rounded-[var(--control-radius)] border px-4 py-3 max-[359px]:grid max-[359px]:gap-2.5 max-[359px]:px-3", toneClasses[tone], className)}>
      <div className="flex min-w-0 items-start gap-3 max-[359px]:gap-2">
        {icon && <span className="mt-0.5 shrink-0 text-current">{icon}</span>}
        <div className="min-w-0">
          {title && <strong className="block text-sm font-extrabold">{title}</strong>}
          {children && <div className="mt-1 text-xs leading-6 text-[var(--text-muted)]">{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 max-[359px]:justify-self-start">{action}</div>}
    </div>
  );
}
