"use client";

import { useEffect } from "react";
import { resolveAccent, resolveAccentTokens, THEME_STORAGE_KEY } from "@/lib/theme";
import type { AppearanceSettings } from "@/lib/types";

function applyAppearance(appearance: AppearanceSettings) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = appearance.mode === "system" ? (prefersDark ? "dark" : "light") : appearance.mode;
  const tokens = resolveAccentTokens(resolveAccent(appearance), resolved);
  root.dataset.theme = resolved;
  root.dataset.themeMode = appearance.mode;
  root.dataset.radius = appearance.radius;
  root.dataset.surface = appearance.surface;
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--accent-foreground", tokens.foreground);
  root.style.setProperty("--accent-strong", tokens.strong);
  root.style.colorScheme = resolved;
}

export function ThemeRuntime({ appearance }: { appearance: AppearanceSettings }) {
  useEffect(() => {
    applyAppearance(appearance);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(appearance));
    if (appearance.mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyAppearance(appearance);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [appearance]);
  return null;
}
