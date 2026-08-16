"use client";

import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { AppearanceSettings, ThemeMode } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";
import { applyAppearanceToDocument } from "./theme-runtime";

const nextMode: Record<ThemeMode, ThemeMode> = { system: "light", light: "dark", dark: "system" };
const labelKeys = { system: "theme.system", light: "theme.light", dark: "theme.dark" } as const;
const icons = { system: Laptop, light: Sun, dark: Moon };

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function resolvedMode(mode: ThemeMode) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function revealGeometry(button: HTMLButtonElement) {
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  return { x, y, radius };
}

export function ThemeToggle({
  appearance,
  onChange,
  className,
}: {
  appearance: AppearanceSettings;
  onChange: (mode: ThemeMode) => void;
  className?: string;
}) {
  const { t } = useLocale();
  const mode = appearance.mode;
  const Icon = icons[mode];
  const label = t(labelKeys[mode]);

  function commitTheme(next: ThemeMode) {
    const nextAppearance = { ...appearance, mode: next };
    applyAppearanceToDocument(nextAppearance);
    flushSync(() => onChange(next));
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const next = nextMode[mode];
    const documentWithTransition = document as ViewTransitionDocument;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visualThemeChanges = resolvedMode(mode) !== resolvedMode(next);

    if (reducedMotion || !visualThemeChanges || !documentWithTransition.startViewTransition) {
      commitTheme(next);
      return;
    }

    const root = document.documentElement;
    const { x, y, radius } = revealGeometry(event.currentTarget);
    root.style.setProperty("--theme-reveal-x", `${x}px`);
    root.style.setProperty("--theme-reveal-y", `${y}px`);
    root.style.setProperty("--theme-reveal-radius", `${radius}px`);
    root.dataset.themeTransition = "active";

    const clearTransitionState = () => {
      delete root.dataset.themeTransition;
      root.style.removeProperty("--theme-reveal-x");
      root.style.removeProperty("--theme-reveal-y");
      root.style.removeProperty("--theme-reveal-radius");
    };

    try {
      const transition = documentWithTransition.startViewTransition(() => commitTheme(next));
      void transition.finished.catch(() => undefined).finally(clearTransitionState);
    } catch {
      clearTransitionState();
      commitTheme(next);
    }
  }

  return (
    <Button
      className={cn(className)}
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-label={`${label}; ${t("theme.change")}`}
      title={label}
      data-theme-toggle
      data-theme-toggle-mode={mode}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
