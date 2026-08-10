import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  cloneAppearanceSettings,
  createAppearancePreviewTokens,
  normalizeAppearanceSettings,
  validateAppearanceSettings,
} from "../lib/appearance-settings.ts";
import type { AppearanceSettings } from "../lib/types.ts";

const fixture = (overrides: Partial<AppearanceSettings> = {}): AppearanceSettings => ({
  mode: "system",
  preset: "spotify",
  accent: "#1ed760",
  radius: "rounded",
  surface: "tinted",
  ...overrides,
});

test("appearance drafts clone and normalize preset accents independently", () => {
  const source = fixture({ preset: "ocean", accent: "#ffffff" });
  const cloned = cloneAppearanceSettings(source);
  cloned.mode = "dark";
  assert.equal(source.mode, "system");

  assert.deepEqual(normalizeAppearanceSettings(source), {
    ...source,
    accent: "#0ea5e9",
  });
  assert.equal(
    normalizeAppearanceSettings(fixture({ preset: "custom", accent: "#ABCDEF" })).accent,
    "#abcdef",
  );
});

test("appearance validation rejects malformed custom colors", () => {
  assert.match(
    validateAppearanceSettings(fixture({ preset: "custom", accent: "#12" })) ?? "",
    /کد شش‌رقمی/,
  );
  assert.equal(
    validateAppearanceSettings(fixture({ preset: "custom", accent: "#123abc" })),
    null,
  );
  assert.equal(validateAppearanceSettings(fixture({ preset: "emerald" })), null);
});

test("scoped preview tokens reflect mode, surface, radius and readable accent", () => {
  const tokens = createAppearancePreviewTokens(
    fixture({ preset: "custom", accent: "#101010", radius: "compact", surface: "contrast" }),
    "dark",
  );
  assert.equal(tokens["--accent"], "#101010");
  assert.equal(tokens["--accent-foreground"], "#ffffff");
  assert.equal(tokens["--page"], "#05090d");
  assert.equal(tokens["--card-radius"], "14px");
  assert.equal(tokens.colorScheme, "dark");
});

test("appearance settings use shared draft editing and an isolated preview", async () => {
  const card = await readFile("components/pages/settings/appearance/appearance-settings-card.tsx", "utf8");
  const preview = await readFile("components/pages/settings/appearance/theme-preview.tsx", "utf8");
  const option = await readFile("components/pages/settings/appearance/appearance-option.tsx", "utf8");

  assert.match(card, /useSettingsDraft/);
  assert.match(card, /EditableCardActions/);
  assert.match(card, /prepare: normalizeAppearanceSettings/);
  assert.match(card, /fieldset disabled=\{!editor\.editing\}/);
  assert.match(card, /ThemePreview appearance=\{appearance\}/);
  assert.match(card, /s\("The preview is isolated inside this card\. In manual-save mode, the whole app appearance changes only after you save\."\)/);
  assert.match(preview, /createAppearancePreviewTokens/);
  assert.match(preview, /useSyncExternalStore/);
  assert.match(option, /disabled=\{disabled\}/);
});
