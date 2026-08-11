"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { ThemeMode } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";

const nextMode: Record<ThemeMode, ThemeMode> = { system: "light", light: "dark", dark: "system" };
const labelKeys = { system: "theme.system", light: "theme.light", dark: "theme.dark" } as const;
const icons = { system: Laptop, light: Sun, dark: Moon };

export function ThemeToggle({
  mode,
  onChange,
  className,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  className?: string;
}) {
  const { t } = useLocale();
  const Icon = icons[mode];
  const label = t(labelKeys[mode]);
  return (
    <Button
      className={cn(className)}
      variant="outline"
      size="icon"
      onClick={() => onChange(nextMode[mode])}
      aria-label={`${label}; ${t("theme.change")}`}
      title={label}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
