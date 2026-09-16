import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("appearance settings include surface customization and live preview", () => {
  const card = readFileSync("components/pages/settings/appearance/appearance-settings-card.tsx", "utf8");
  assert.match(card, /surfaceLabels/);
  assert.match(card, /ThemePreview/);
});

test("pickers use semantic theme tokens", () => {
  const files = [
    "components/pickers/jalali-date-picker/calendar-day.tsx",
    "components/pickers/jalali-date-picker/date-picker-dialog.tsx",
    "components/pickers/time-picker/time-picker-dialog.tsx",
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /#[0-9a-fA-F]{6}/);
  }
});


test("Appearance Studio uses a compact builder rail with a dominant live preview", () => {
  const card = readFileSync("components/pages/settings/appearance/appearance-settings-card.tsx", "utf8");
  const preview = readFileSync("components/pages/settings/appearance/theme-preview.tsx", "utf8");
  const settingsPage = readFileSync("components/pages/settings/settings-page.tsx", "utf8");
  assert.match(card, /data-appearance-studio/);
  assert.match(card, /data-appearance-controls/);
  assert.match(card, /data-appearance-preview/);
  assert.match(card, /AppearanceSelectControl/);
  assert.match(card, /lg:grid-cols-\[310px_minmax\(0,1fr\)\]/);
  assert.ok((card.match(/grid-cols-3/g) ?? []).length <= 2, "ordinary settings should live in compact menus instead of permanent option grids");
  assert.match(preview, /min-h-\[620px\]/);
  assert.match(preview, /grid-cols-\[var\(--preview-sidebar-width\)_minmax\(0,1fr\)\]/);
  assert.match(settingsPage, /if \(props\.route === "appearance"\)/);
  assert.match(settingsPage, /return <AppearanceSettingsCard/);
});
