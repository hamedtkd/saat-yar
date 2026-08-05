"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY, resolveAccent } from "@/lib/theme";
import type { AppearanceSettings } from "@/lib/types";

function applyAppearance(appearance: AppearanceSettings) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = appearance.mode === "system" ? (prefersDark ? "dark" : "light") : appearance.mode;
  root.dataset.theme = resolved;
  root.dataset.themeMode = appearance.mode;
  root.dataset.radius = appearance.radius;
  root.style.setProperty("--accent", resolveAccent(appearance));
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
