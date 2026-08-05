import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = join(process.cwd(), "components", "pickers");
const MODULE_ROOT = join(ROOT, "jalali-date-picker");

function lineCount(file: string) {
  return readFileSync(file, "utf8").split(/\r?\n/).length;
}

test("jalali date picker modules stay below 250 lines", () => {
  const files = [
    join(ROOT, "jalali-date-picker.tsx"),
    ...readdirSync(MODULE_ROOT)
      .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
      .map((name) => join(MODULE_ROOT, name)),
  ];

  for (const file of files) {
    assert.ok(lineCount(file) <= 250, `${file} exceeds 250 lines`);
  }
});

test("jalali date picker delegates state and calendar rendering", () => {
  const facade = readFileSync(join(ROOT, "jalali-date-picker.tsx"), "utf8");
  assert.match(facade, /useJalaliDatePicker/);
  assert.match(facade, /DatePickerTrigger/);
  assert.match(facade, /DatePickerDialog/);
  assert.doesNotMatch(facade, /jalaliMonthCells/);
  assert.doesNotMatch(facade, /getHolidayInfo/);
});
