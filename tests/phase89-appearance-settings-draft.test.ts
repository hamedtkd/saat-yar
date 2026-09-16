import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  cloneAppearanceSettings,
  createAppearancePreviewTokens,
  parseAppearancePreset,
  sanitizeAppearanceSettings,
  serializeAppearancePreset,
  validateAppearanceSettings,
} from "../lib/appearance-settings.ts";
import type { AppearanceSettings } from "../lib/types.ts";

const fixture = (overrides: Partial<AppearanceSettings> = {}): AppearanceSettings => ({
  mode: "system",
  preset: "spotify",
  accent: "#06b6d4",
  neutralTone: "slate",
  bodyFont: "vazirmatn",
  headingFont: "vazirmatn",
  density: "comfortable",
  radius: "rounded",
  surface: "tinted",
  sidebarStyle: "soft",
  sidebarAccent: "filled",
  sidebarWidth: "default",
  ...overrides,
});

test("appearance settings sanitize legacy data without mutating the source", () => {
  const source = fixture({ preset: "ocean", accent: "#ffffff" });
  const cloned = cloneAppearanceSettings(source);
  cloned.mode = "dark";
  assert.equal(source.mode, "system");

  const legacy = sanitizeAppearanceSettings({
    mode: "dark",
    preset: "emerald",
    accent: "#10b981",
    radius: "balanced",
    surface: "neutral",
  });
  assert.equal(legacy.neutralTone, "slate");
  assert.equal(legacy.bodyFont, "vazirmatn");
  assert.equal(legacy.headingFont, "vazirmatn");
  assert.equal(legacy.density, "comfortable");
  assert.equal(legacy.accent, "#10b981");
  assert.equal(legacy.sidebarStyle, "soft");
  assert.equal(legacy.sidebarAccent, "filled");
  assert.equal(legacy.sidebarWidth, "default");

  const unsafe = sanitizeAppearanceSettings({
    ...legacy,
    preset: "custom",
    accent: "url(javascript:alert(1))",
    neutralTone: "var(--evil)",
    bodyFont: "Injected Font",
    density: "dense",
  });
  assert.equal(unsafe.accent, "#8b5cf6");
  assert.equal(unsafe.neutralTone, "slate");
  assert.equal(unsafe.bodyFont, "vazirmatn");
  assert.equal(unsafe.density, "comfortable");
});

test("appearance validation rejects malformed custom colors and invalid studio settings", () => {
  assert.match(validateAppearanceSettings(fixture({ preset: "custom", accent: "#12" })) ?? "", /کد شش‌رقمی/);
  assert.equal(validateAppearanceSettings(fixture({ preset: "custom", accent: "#123abc" })), null);
  assert.match(validateAppearanceSettings({ ...fixture(), density: "dense" as AppearanceSettings["density"] }) ?? "", /تراکم/);
});

test("scoped preview tokens include tone typography density radius and readable accent", () => {
  const tokens = createAppearancePreviewTokens(
    fixture({ preset: "custom", accent: "#101010", neutralTone: "sand", density: "compact", radius: "compact", surface: "contrast", bodyFont: "system", headingFont: "serif" }),
    "dark",
  );
  assert.equal(tokens["--accent"], "#101010");
  assert.equal(tokens["--accent-foreground"], "#ffffff");
  assert.equal(tokens["--card-radius"], "14px");
  assert.equal(tokens["--preview-sidebar-width"], "150px");
  assert.equal(tokens["--control-height"], "38px");
  assert.match(tokens["--app-body-font"], /Tahoma/);
  assert.match(tokens["--app-heading-font"], /Vazirmatn FD/);
  assert.equal(tokens.colorScheme, "dark");
});

test("appearance preset export round-trips and rejects malformed imports", () => {
  const source = fixture({ neutralTone: "stone", density: "spacious", bodyFont: "system" });
  assert.deepEqual(parseAppearancePreset(serializeAppearancePreset(source)), source);
  assert.equal(parseAppearancePreset('{"kind":"saatyar-appearance","version":1,"appearance":{"mode":"hacked"}}'), null);
  assert.equal(parseAppearancePreset('{"kind":"other","version":1,"appearance":{}}'), null);
});

test("Appearance Studio uses staged apply discard isolated hover preview and preset transport", async () => {
  const [card, preview, option, hook, runtime, globals] = await Promise.all([
    readFile("components/pages/settings/appearance/appearance-settings-card.tsx", "utf8"),
    readFile("components/pages/settings/appearance/theme-preview.tsx", "utf8"),
    readFile("components/pages/settings/appearance/appearance-option.tsx", "utf8"),
    readFile("hooks/settings/use-appearance-studio.ts", "utf8"),
    readFile("components/theme/theme-runtime.tsx", "utf8"),
    readFile("app/globals.css", "utf8"),
  ]);
  assert.match(card, /useAppearanceStudio/);
  assert.match(card, /s\("Apply changes"\)/);
  assert.match(card, /s\("Discard changes"\)/);
  assert.match(card, /serializeAppearancePreset/);
  assert.match(card, /parseAppearancePreset/);
  assert.match(card, /ThemePreview appearance=\{previewAppearance\}/);
  assert.match(option, /onPointerEnter=\{onPreview\}/);
  assert.match(preview, /createAppearancePreviewTokens/);
  assert.match(hook, /registerSettingsDraft/);
  assert.match(hook, /applyAppearanceToDocument\(next\)/);
  assert.match(hook, /applyAppearanceToDocument\(committed\)/);
  assert.match(runtime, /root\.dataset\.neutralTone/);
  assert.match(runtime, /root\.dataset\.density/);
  assert.match(runtime, /root\.dataset\.bodyFont/);
  assert.match(runtime, /root\.dataset\.sidebarStyle/);
  assert.match(runtime, /root\.dataset\.sidebarAccent/);
  assert.match(runtime, /root\.dataset\.sidebarWidth/);
  assert.match(globals, /data-neutral-tone="sand"/);
  assert.match(globals, /data-density="spacious"/);
  assert.match(globals, /data-body-font="system"/);
  assert.match(globals, /--radius-xl: var\(--control-radius\)/);
  assert.match(globals, /--radius-2xl: var\(--card-radius\)/);
});
