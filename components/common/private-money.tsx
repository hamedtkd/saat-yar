import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { money } from "@/lib/format";

type PrivateMoneyProps = {
  value: number;
  hidden?: boolean;
  suffix?: ReactNode;
  className?: string;
  maskedClassName?: string;
};

export function PrivateMoney({
  value,
  hidden = false,
  suffix,
  className,
  maskedClassName,
}: PrivateMoneyProps) {
  return (
    <span
      aria-label={hidden ? "مبلغ مخفی شده است" : undefined}
      className={cn(className, hidden && "select-none", hidden && maskedClassName)}
    >
      {hidden ? "••••••" : money(value)}
      {!hidden && suffix}
    </span>
  );
}
