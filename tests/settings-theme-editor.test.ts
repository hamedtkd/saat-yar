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
