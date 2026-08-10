"use client";

import type { ReactNode } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";

type PrivateMoneyProps = {
  value: number;
  hidden?: boolean;
  suffix?: ReactNode;
  className?: string;
  maskedClassName?: string;
};

export function PrivateMoney({ value, hidden = false, suffix, className, maskedClassName }: PrivateMoneyProps) {
  const { money, t } = useLocaleUi();
  return (
    <span
      aria-label={hidden ? t("common.amountHidden") : undefined}
      className={cn(className, hidden && "select-none", hidden && maskedClassName)}
    >
      {hidden ? "••••••" : money(value)}
      {!hidden && suffix}
    </span>
  );
}
