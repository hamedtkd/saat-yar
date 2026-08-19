"use client";

import { useEffect } from "react";
import { themeBrandSvg } from "@/lib/brand-theme";
import { resolveAccent, resolveAccentTokens, THEME_STORAGE_KEY } from "@/lib/theme";
import type { AppearanceSettings } from "@/lib/types";

let previousFaviconUrl: string | null = null;
let brandSvgPromise: Promise<string> | null = null;

function basePath() {
  return document.querySelector('meta[name="saatyar-base"]')?.getAttribute("content") ?? "";
}

function loadBrandSvg() {
  brandSvgPromise ??= fetch(`${basePath()}/brand/saatyar-mark.svg`).then((response) => {
    if (!response.ok) throw new Error(`Unable to load brand mark: ${response.status}`);
    return response.text();
  });
  return brandSvgPromise;
}

async function applyDynamicFavicon(accent: string, strong: string) {
  try {
    const source = await loadBrandSvg();
    const themed = themeBrandSvg(source, accent, strong);
    const url = URL.createObjectURL(new Blob([themed], { type: "image/svg+xml" }));
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-saatyar-dynamic]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.setAttribute("sizes", "any");
      link.dataset.saatyarDynamic = "true";
      document.head.append(link);
    }
    link.href = url;
    if (previousFaviconUrl) URL.revokeObjectURL(previousFaviconUrl);
    previousFaviconUrl = url;
  } catch {
    // The file-based icon remains available if runtime theming cannot load.
  }
}

export function applyAppearanceToDocument(appearance: AppearanceSettings) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = appearance.mode === "system" ? (prefersDark ? "dark" : "light") : appearance.mode;
  const tokens = resolveAccentTokens(resolveAccent(appearance), resolved);
  root.dataset.theme = resolved;
  root.dataset.themeMode = appearance.mode;
  root.dataset.radius = appearance.radius;
  root.dataset.surface = appearance.surface;
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--accent-fill", tokens.fill);
  root.style.setProperty("--accent-foreground", tokens.foreground);
  root.style.setProperty("--accent-strong", tokens.strong);
  root.style.colorScheme = resolved;

  const themeColor = document.querySelector<HTMLMetaElement>('meta[data-saatyar-theme-color]');
  if (themeColor) themeColor.content = resolved === "dark" ? tokens.strong : tokens.accent;
  void applyDynamicFavicon(tokens.accent, tokens.strong);
}

export function ThemeRuntime({ appearance }: { appearance: AppearanceSettings }) {
  useEffect(() => {
    applyAppearanceToDocument(appearance);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(appearance));
    if (appearance.mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyAppearanceToDocument(appearance);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [appearance]);
  return null;
}
