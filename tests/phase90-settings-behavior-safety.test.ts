import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getUnsavedSettingsDraftLabelsExcept,
  hasUnsavedSettingsDraftsExcept,
  registerSettingsDraft,
} from "../lib/settings-draft-registry.ts";
import { createAppearancePreviewTokens } from "../lib/appearance-settings.ts";
import type { AppearanceSettings } from "../lib/types.ts";

test("appearance preview always returns complete string tokens", () => {
  const appearance: AppearanceSettings = {
    mode: "system",
    preset: "spotify",
    accent: "#1ed760",
    radius: "balanced",
    surface: "tinted",
  };
  const tokens = createAppearancePreviewTokens(appearance, "light");
  const required = [
    "--page",
    "--surface-1",
    "--surface-2",
    "--text",
    "--text-muted",
    "--border",
  ];
  for (const key of required) {
    assert.equal(typeof tokens[key], "string");
    assert.ok(tokens[key].length > 0);
  }
});

test("draft registry can inspect other dirty cards without counting the current card", () => {
  const cleanupBehavior = registerSettingsDraft("behavior-card", {
    label: "رفتار ذخیره تنظیمات",
    dirty: true,
    save: () => undefined,
    discard: () => undefined,
  });
  const cleanupAppearance = registerSettingsDraft("appearance-card", {
    label: "ظاهر و رنگ‌بندی",
    dirty: true,
    save: () => undefined,
    discard: () => undefined,
  });

  assert.equal(hasUnsavedSettingsDraftsExcept("behavior-card"), true);
  assert.deepEqual(
    getUnsavedSettingsDraftLabelsExcept("behavior-card"),
    ["ظاهر و رنگ‌بندی"],
  );

  cleanupAppearance();
  assert.equal(hasUnsavedSettingsDraftsExcept("behavior-card"), false);
  cleanupBehavior();
});

test("settings behavior card stays explicit and blocks unsafe autosave activation", async () => {
  const card = await readFile(
    "components/pages/settings/settings-behavior-card.tsx",
    "utf8",
  );
  const hook = await readFile("hooks/settings/use-settings-draft.ts", "utf8");

  assert.match(card, /autoSave: false/);
  assert.match(card, /getUnsavedSettingsDraftLabelsExcept\(editor\.registryId\)/);
  assert.match(card, /s\("Enabling autosave is not safe yet\."\)/);
  assert.match(card, /EditableCardActions/);
  assert.match(hook, /registryId,/);
});
