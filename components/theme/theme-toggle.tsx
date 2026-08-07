"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { ThemeMode } from "@/lib/types";

const nextMode: Record<ThemeMode, ThemeMode> = { system: "light", light: "dark", dark: "system" };
const labels: Record<ThemeMode, string> = { system: "تم مطابق سیستم", light: "تم روشن", dark: "تم تاریک" };
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
  const Icon = icons[mode];
  return (
    <Button
      className={cn(className)}
      variant="outline"
      size="icon"
      onClick={() => onChange(nextMode[mode])}
      aria-label={`${labels[mode]}؛ تغییر تم`}
      title={labels[mode]}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
