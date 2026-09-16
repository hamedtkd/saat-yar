"use client";

import { useEffect } from "react";
import { themeBrandSvg } from "@/lib/brand-theme";
import { createAppearancePreviewTokens, sanitizeAppearanceSettings } from "@/lib/appearance-settings";
import { appearanceFontStack, ensureAppearanceFonts } from "@/lib/appearance-fonts";
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
  const safe = sanitizeAppearanceSettings(appearance);
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = safe.mode === "system" ? (prefersDark ? "dark" : "light") : safe.mode;
  const tokens = resolveAccentTokens(resolveAccent(safe), resolved);
  root.dataset.theme = resolved;
  root.dataset.themeMode = safe.mode;
  root.dataset.neutralTone = safe.neutralTone;
  root.dataset.bodyFont = safe.bodyFont;
  root.dataset.headingFont = safe.headingFont;
  root.dataset.density = safe.density;
  root.dataset.radius = safe.radius;
  root.dataset.surface = safe.surface;
  root.dataset.sidebarStyle = safe.sidebarStyle;
  root.dataset.sidebarAccent = safe.sidebarAccent;
  root.dataset.sidebarWidth = safe.sidebarWidth;
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--accent-fill", tokens.fill);
  root.style.setProperty("--accent-foreground", tokens.foreground);
  root.style.setProperty("--accent-strong", tokens.strong);
  const language = root.lang.toLowerCase().startsWith("fa") ? "fa" : "en";
  const appearanceTokens = createAppearancePreviewTokens(safe, resolved, language);
  for (const name of ["--shell-sidebar-width", "--shell-content-offset", "--sidebar-background", "--sidebar-border", "--sidebar-active-bg", "--sidebar-active-fg"] as const) {
    root.style.setProperty(name, appearanceTokens[name]);
  }
  root.style.setProperty("--app-body-font", appearanceFontStack(safe.bodyFont, "en"));
  root.style.setProperty("--app-body-font-fa", appearanceFontStack(safe.bodyFont, "fa"));
  root.style.setProperty("--app-heading-font", appearanceFontStack(safe.headingFont, "en"));
  root.style.setProperty("--app-heading-font-fa", appearanceFontStack(safe.headingFont, "fa"));
  root.style.colorScheme = resolved;
  ensureAppearanceFonts(safe.bodyFont, safe.headingFont);

  const themeColor = document.querySelector<HTMLMetaElement>('meta[data-saatyar-theme-color]');
  if (themeColor) themeColor.content = resolved === "dark" ? tokens.strong : tokens.accent;
  void applyDynamicFavicon(tokens.accent, tokens.strong);
}

export function ThemeRuntime({ appearance }: { appearance: AppearanceSettings }) {
  useEffect(() => {
    const safe = sanitizeAppearanceSettings(appearance);
    applyAppearanceToDocument(safe);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(safe));
    if (safe.mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyAppearanceToDocument(safe);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [appearance]);
  return null;
}
