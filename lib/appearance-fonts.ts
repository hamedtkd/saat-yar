import type { HeadingFont, InterfaceFont } from "./types.ts";

export type AppearanceFontGroup = "core" | "sans" | "mono" | "serif" | "persian";

export type AppearanceFontDefinition = {
  value: InterfaceFont | HeadingFont;
  label: string;
  group: AppearanceFontGroup;
  family: string;
  stack: string;
  stackFa?: string;
  googleFamily?: string;
  stylesheetUrl?: string;
  directWoff2Url?: string;
  headingOnly?: boolean;
};

const latinFallback = '"Vazirmatn FD", Vazirmatn, Tahoma, ui-sans-serif, system-ui, sans-serif';
const latinSerifFallback = '"Noto Naskh Arabic", "Vazirmatn FD", Vazirmatn, Georgia, serif';

const google = (value: InterfaceFont, label: string, group: AppearanceFontGroup, family = label): AppearanceFontDefinition => ({
  value,
  label,
  group,
  family,
  stack: `"${family}", ui-${group === "serif" ? "serif" : group === "mono" ? "monospace" : "sans-serif"}, system-ui, ${group === "serif" ? "serif" : group === "mono" ? "monospace" : "sans-serif"}`,
  stackFa: `"${family}", ${group === "serif" ? latinSerifFallback : latinFallback}`,
  googleFamily: family,
});

export const APPEARANCE_FONT_OPTIONS: readonly AppearanceFontDefinition[] = [
  { value: "vazirmatn", label: "Vazirmatn", group: "core", family: "Vazirmatn", stack: "Vazirmatn, Tahoma, sans-serif", stackFa: '"Vazirmatn FD", Vazirmatn, Tahoma, sans-serif' },
  { value: "system", label: "System Sans", group: "core", family: "system-ui", stack: '"Segoe UI Variable Text", "Segoe UI", Tahoma, Arial, ui-sans-serif, system-ui, sans-serif', stackFa: `Tahoma, ${latinFallback}` },
  { value: "serif", label: "System Serif", group: "core", family: "Georgia", stack: 'Georgia, "Times New Roman", serif', stackFa: latinSerifFallback },

  google("geist", "Geist", "sans"),
  google("inter", "Inter", "sans"),
  google("noto-sans", "Noto Sans", "sans"),
  google("nunito-sans", "Nunito Sans", "sans"),
  google("figtree", "Figtree", "sans"),
  google("roboto", "Roboto", "sans"),
  google("raleway", "Raleway", "sans"),
  google("dm-sans", "DM Sans", "sans"),
  google("public-sans", "Public Sans", "sans"),
  google("outfit", "Outfit", "sans"),
  google("oxanium", "Oxanium", "sans"),
  google("manrope", "Manrope", "sans"),
  google("space-grotesk", "Space Grotesk", "sans"),
  google("montserrat", "Montserrat", "sans"),
  google("ibm-plex-sans", "IBM Plex Sans", "sans"),
  google("source-sans-3", "Source Sans 3", "sans"),
  google("instrument-sans", "Instrument Sans", "sans"),

  google("geist-mono", "Geist Mono", "mono"),
  google("jetbrains-mono", "JetBrains Mono", "mono"),

  google("noto-serif", "Noto Serif", "serif"),
  google("roboto-slab", "Roboto Slab", "serif"),
  google("merriweather", "Merriweather", "serif"),
  google("lora", "Lora", "serif"),
  google("playfair-display", "Playfair Display", "serif"),
  google("eb-garamond", "EB Garamond", "serif"),
  google("instrument-serif", "Instrument Serif", "serif"),

  { value: "mikhak", label: "Mikhak", group: "persian", family: "Mikhak", stack: '"Mikhak", Vazirmatn, Tahoma, sans-serif', stackFa: '"Mikhak", "Vazirmatn FD", Vazirmatn, Tahoma, sans-serif', directWoff2Url: "https://cdn.jsdelivr.net/gh/aminabedi68/Mikhak@9dea055eb3dfc752879442224460c6e5d6ebe232/fonts/webfonts/variable/Mikhak%5BDSTY%2CKSHD%2Cwght%5D.woff2" },
  { value: "samim", label: "Samim", group: "persian", family: "Samim", stack: '"Samim", Vazirmatn, Tahoma, sans-serif', stackFa: '"Samim", "Vazirmatn FD", Vazirmatn, Tahoma, sans-serif', stylesheetUrl: "https://cdn.jsdelivr.net/gh/rastikerdar/samim-font@1941b5189935c9458806e96b4b6354c478a9e342/dist/font-face.css" },
  { value: "shabnam", label: "Shabnam", group: "persian", family: "Shabnam", stack: '"Shabnam", Vazirmatn, Tahoma, sans-serif', stackFa: '"Shabnam", "Vazirmatn FD", Vazirmatn, Tahoma, sans-serif', stylesheetUrl: "https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@6155d4d7c1cb3cd3f9c3e028c62226d12c36e7e9/dist/font-face.css" },
  { value: "sahel", label: "Sahel", group: "persian", family: "Sahel", stack: '"Sahel", Vazirmatn, Tahoma, sans-serif', stackFa: '"Sahel", "Vazirmatn FD", Vazirmatn, Tahoma, sans-serif', stylesheetUrl: "https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@52ffbf9a00d395fdeab9fbd0dd446f31dcbef9c8/dist/font-face.css" },
  { value: "naskh", label: "Noto Naskh Arabic", group: "persian", family: "Noto Naskh Arabic", stack: '"Noto Naskh Arabic", Georgia, serif', stackFa: '"Noto Naskh Arabic", "Vazirmatn FD", Vazirmatn, serif', googleFamily: "Noto Naskh Arabic" },
] as const;

export const HEADING_ONLY_FONT_OPTIONS: readonly AppearanceFontDefinition[] = [
  { value: "lalezar", label: "Lalezar", group: "persian", family: "Lalezar", stack: '"Lalezar", Vazirmatn, Tahoma, sans-serif', stackFa: '"Lalezar", "Vazirmatn FD", Vazirmatn, Tahoma, sans-serif', googleFamily: "Lalezar", headingOnly: true },
] as const;

export const BODY_FONT_VALUES = APPEARANCE_FONT_OPTIONS.map((font) => font.value as InterfaceFont);
export const HEADING_FONT_OPTIONS = [...APPEARANCE_FONT_OPTIONS, ...HEADING_ONLY_FONT_OPTIONS] as const;
export const HEADING_FONT_VALUES = HEADING_FONT_OPTIONS.map((font) => font.value as HeadingFont);

const definitions = new Map<string, AppearanceFontDefinition>(HEADING_FONT_OPTIONS.map((font) => [font.value, font]));
const loaded = new Set<string>();

export function getAppearanceFont(value: InterfaceFont | HeadingFont): AppearanceFontDefinition {
  return definitions.get(value) ?? definitions.get("vazirmatn")!;
}

export function appearanceFontStack(value: InterfaceFont | HeadingFont, language: "fa" | "en") {
  const font = getAppearanceFont(value);
  return language === "fa" ? (font.stackFa ?? font.stack) : font.stack;
}

export function appearanceFontStylesheetUrl(value: InterfaceFont | HeadingFont): string | null {
  const font = getAppearanceFont(value);
  if (font.stylesheetUrl) return font.stylesheetUrl;
  if (!font.googleFamily) return null;
  const family = font.googleFamily.replaceAll(" ", "+");
  const weights = value === "instrument-serif" || value === "lalezar" ? "" : ":wght@400;500;600;700";
  return `https://fonts.googleapis.com/css2?family=${family}${weights}&display=swap`;
}

export function ensureAppearanceFonts(bodyFont: InterfaceFont, headingFont: HeadingFont) {
  if (typeof document === "undefined") return;
  for (const value of new Set<InterfaceFont | HeadingFont>([bodyFont, headingFont])) ensureAppearanceFont(value);
}

function ensureAppearanceFont(value: InterfaceFont | HeadingFont) {
  const font = getAppearanceFont(value);
  if (loaded.has(value) || document.querySelector(`[data-saatyar-font-source="${value}"]`)) return;
  if (!font.directWoff2Url && !appearanceFontStylesheetUrl(value)) return;
  loaded.add(value);
  if (font.directWoff2Url) {
    const style = document.createElement("style");
    style.dataset.saatyarFontSource = value;
    style.textContent = `@font-face{font-family:"${font.family}";src:url("${font.directWoff2Url}") format("woff2");font-style:normal;font-weight:100 900;font-display:swap;}`;
    document.head.append(style);
    return;
  }
  const href = appearanceFontStylesheetUrl(value);
  if (!href) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.referrerPolicy = "no-referrer";
  link.href = href;
  link.dataset.saatyarFontSource = value;
  document.head.append(link);
}
