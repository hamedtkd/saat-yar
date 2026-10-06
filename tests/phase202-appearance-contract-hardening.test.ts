import assert from "node:assert/strict";
import test from "node:test";
import { createAppearancePreviewTokens } from "../lib/appearance-settings.ts";
import type { AppearanceSettings } from "../lib/types.ts";

const fixture: AppearanceSettings = {
  mode: "dark",
  preset: "violet",
  accent: "#8b5cf6",
  neutralTone: "slate",
  bodyFont: "mikhak",
  headingFont: "lalezar",
  density: "comfortable",
  radius: "none",
  surface: "tinted",
  sidebarStyle: "soft",
  sidebarAccent: "filled",
  sidebarWidth: "default",
};

test("Persian appearance fonts get their own runtime CSS variables", () => {
  const tokens = createAppearancePreviewTokens(fixture, "dark", "fa");
  assert.match(tokens["--app-body-font-fa"], /^"Mikhak"/);
  assert.match(tokens["--app-heading-font-fa"], /^"Lalezar"/);
  assert.equal(tokens["--micro-radius"], "0px");
});
