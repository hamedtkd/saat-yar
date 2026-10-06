import assert from "node:assert/strict";
import test from "node:test";
import {
  createAppearancePreviewTokens,
  parseAppearancePreset,
  sanitizeAppearanceSettings,
  serializeAppearancePreset,
} from "../lib/appearance-settings.ts";
import {
  APPEARANCE_FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  appearanceFontStack,
  appearanceFontStylesheetUrl,
} from "../lib/appearance-fonts.ts";
import type { AppearanceSettings } from "../lib/types.ts";

const fixture: AppearanceSettings = {
  mode: "system",
  preset: "violet",
  accent: "#8b5cf6",
  neutralTone: "slate",
  bodyFont: "vazirmatn",
  headingFont: "vazirmatn",
  density: "comfortable",
  radius: "rounded",
  surface: "tinted",
  sidebarStyle: "soft",
  sidebarAccent: "filled",
  sidebarWidth: "default",
};

test("V3 exposes a broad curated font library with Persian and heading choices", () => {
  assert.ok(APPEARANCE_FONT_OPTIONS.length >= 30);
  assert.ok(HEADING_FONT_OPTIONS.length > APPEARANCE_FONT_OPTIONS.length);
  for (const value of ["inter", "geist", "space-grotesk", "jetbrains-mono", "noto-serif", "mikhak", "samim", "shabnam", "sahel", "naskh"] as const) {
    const definition = APPEARANCE_FONT_OPTIONS.find((font) => font.value === value);
    assert.ok(definition, `missing ${value}`);
    assert.ok(appearanceFontStack(value, "fa").length > 10);
  }
  assert.ok(HEADING_FONT_OPTIONS.some((font) => font.value === "lalezar"));
  assert.match(appearanceFontStylesheetUrl("inter") ?? "", /fonts\.googleapis\.com/);
  assert.equal(appearanceFontStylesheetUrl("vazirmatn"), null, "bundled default font must not require a remote request");
});

test("radius supports a real zero-radius mode and an extra-rounded mode", () => {
  const none = createAppearancePreviewTokens({ ...fixture, radius: "none" }, "light", "en");
  const extra = createAppearancePreviewTokens({ ...fixture, radius: "extra" }, "light", "en");
  assert.equal(none["--card-radius"], "0px");
  assert.equal(none["--control-radius"], "0px");
  assert.equal(none["--control-radius-sm"], "0px");
  assert.equal(extra["--card-radius"], "32px");
  assert.equal(extra["--control-radius"], "20px");
});

test("sidebar style accent and width are sanitized, previewed, and round-trip through presets", () => {
  const selected = sanitizeAppearanceSettings({ ...fixture, sidebarStyle: "outline", sidebarAccent: "subtle", sidebarWidth: "wide" });
  const tokens = createAppearancePreviewTokens(selected, "dark", "fa");
  assert.equal(selected.sidebarStyle, "outline");
  assert.equal(selected.sidebarAccent, "subtle");
  assert.equal(selected.sidebarWidth, "wide");
  assert.equal(tokens["--shell-sidebar-width"], "288px");
  assert.equal(tokens["--preview-sidebar-width"], "178px");
  assert.match(tokens["--sidebar-border"], /accent/);
  assert.deepEqual(parseAppearancePreset(serializeAppearancePreset(selected)), selected);
});

test("old V2 appearance presets remain importable and receive safe navigation defaults", () => {
  const oldPreset = JSON.stringify({
    kind: "saatyar-appearance",
    version: 1,
    appearance: {
      mode: "dark",
      preset: "ocean",
      accent: "#0ea5e9",
      neutralTone: "zinc",
      bodyFont: "system",
      headingFont: "serif",
      density: "compact",
      radius: "balanced",
      surface: "neutral",
    },
  });
  const parsed = parseAppearancePreset(oldPreset);
  assert.ok(parsed);
  assert.equal(parsed.sidebarStyle, "soft");
  assert.equal(parsed.sidebarAccent, "filled");
  assert.equal(parsed.sidebarWidth, "default");
});
