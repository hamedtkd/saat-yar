import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { formatEditableNumber, parseLocalizedNumber } from "../lib/localized-number.ts";

const read = (path: string) => readFile(path, "utf8");

test("number field removes browser spinners while preserving numeric keyboard semantics", async () => {
  const field = await read("components/common/number-field.tsx");
  assert.match(field, /type="text"/);
  assert.match(field, /role="spinbutton"/);
  assert.match(field, /inputMode=\{numericStep % 1 === 0 \? "numeric" : "decimal"\}/);
  assert.match(field, /ArrowUp/);
  assert.match(field, /ArrowDown/);
  assert.match(field, /parseLocalizedNumber/);
  assert.doesNotMatch(field, /type="number"/);
});

test("localized numeric parser accepts Persian and Arabic digits", async () => {
  const parser = await read("lib/localized-number.ts");
  assert.match(parser, /\[۰-۹\]/);
  assert.match(parser, /\[٠-٩\]/);
  assert.match(parser, /\[٫\]/);
  assert.equal(parseLocalizedNumber("۴۲٫۵"), 42.5);
  assert.equal(parseLocalizedNumber("١٬٢٥٠"), 1250);
  assert.equal(formatEditableNumber(10.6), "۱۰.۶");
});

test("minute duration custom value reuses the shared number field", async () => {
  const field = await read("components/common/minute-duration-field.tsx");
  assert.match(field, /NumberField/);
  assert.doesNotMatch(field, /type="number"/);
});

test("color and file native controls are hidden behind explicit design-system wrappers", async () => {
  const [color, appearance, file, restore] = await Promise.all([
    read("components/common/color-field.tsx"),
    read("components/pages/settings/appearance/appearance-settings-card.tsx"),
    read("components/common/file-drop-field.tsx"),
    read("components/pages/settings/restore-card.tsx"),
  ]);
  assert.match(color, /type="color"[\s\S]*opacity-0/);
  assert.match(color, /انتخاب رنگ/);
  assert.match(appearance, /<ColorField/);
  assert.doesNotMatch(appearance, /type="color"/);
  assert.match(file, /type="file"[\s\S]*opacity-0/);
  assert.match(restore, /<FileDropField/);
  assert.doesNotMatch(restore, /type="file"/);
});

test("product surfaces contain no visible raw date time range select or number controls", async () => {
  const roots = ["components", "app"];
  const allowedNativeWrappers = new Set([
    "components/common/color-field.tsx",
    "components/common/file-drop-field.tsx",
    "components/ui/checkbox.tsx",
  ]);
  const failures: string[] = [];
  for (const root of roots) {
    const entries = await readdir(root, { recursive: true });
    for (const entry of entries.filter((item) => /\.(tsx?|jsx?)$/.test(item))) {
      const path = `${root}/${entry}`.replace(/\\/g, "/");
      if (allowedNativeWrappers.has(path)) continue;
      const source = await read(path);
      if (/type=["'](?:date|time|range|number|color|file)["']|<select\b/.test(source)) failures.push(path);
    }
  }
  assert.deepEqual(failures, []);
});

test("phase 132 is documented and wired into the main quality command", async () => {
  const [pkg, backlog, notes] = await Promise.all([
    read("package.json"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/phases/PHASE_132_NOTES_FA.md"),
  ]);
  assert.match(pkg, /phase132-native-control-audit\.test\.ts/);
  assert.match(backlog, /\[x\] فاز ۱۳۲:/);
  assert.match(notes, /AppData Schema: v17/);
});
