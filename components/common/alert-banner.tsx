import type { ReactNode } from "react";
import { AlertTriangle, CircleCheck, Info } from "lucide-react";

import { cn } from "@/lib/cn";

type AlertTone = "info" | "warning" | "success" | "danger";

type AlertBannerProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: AlertTone;
  className?: string;
};

const iconByTone = {
  info: Info,
  warning: AlertTriangle,
  success: CircleCheck,
  danger: AlertTriangle,
};

export function AlertBanner({
  title,
  description,
  action,
  tone = "info",
  className,
}: AlertBannerProps) {
  const Icon = iconByTone[tone];

  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-center justify-between gap-4 rounded-[15px] border px-5 py-4",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-900",
        tone === "warning" && "border-amber-300 bg-amber-50 text-amber-900",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
        tone === "danger" && "border-red-200 bg-red-50 text-red-900",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <strong className="block text-sm">{title}</strong>
          {description && <p className="mt-1 text-xs leading-6 opacity-80">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
