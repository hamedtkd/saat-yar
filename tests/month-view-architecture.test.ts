import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = join(process.cwd(), "components", "pages", "month");

function lineCount(file: string) {
  return readFileSync(file, "utf8").split(/\r?\n/).length;
}

function moduleFiles(directory: string) {
  return readdirSync(directory)
    .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
    .map((name) => join(directory, name));
}

test("month table and weekly chart modules stay below 250 lines", () => {
  const files = [
    join(ROOT, "month-table.tsx"),
    join(ROOT, "weekly-chart.tsx"),
    ...moduleFiles(join(ROOT, "table")),
    ...moduleFiles(join(ROOT, "weekly-chart")),
  ];

  for (const file of files) {
    assert.ok(lineCount(file) <= 250, `${file} exceeds 250 lines`);
  }
});

test("month table delegates desktop, mobile and shared calculations", () => {
  const facade = readFileSync(join(ROOT, "month-table.tsx"), "utf8");
  assert.match(facade, /<MonthDesktopTable/);
  assert.match(facade, /<MonthMobileCards/);
  assert.match(facade, /<MonthTableHeader/);
  assert.doesNotMatch(facade, /getDailyTargetMinutes/);
});

test("weekly chart delegates derived data and presentation", () => {
  const facade = readFileSync(join(ROOT, "weekly-chart.tsx"), "utf8");
  assert.match(facade, /useWeeklyChartData/);
  assert.match(facade, /<WeeklyChartVisual/);
  assert.match(facade, /<WeeklySummary/);
  assert.doesNotMatch(facade, /reduce</);
});
