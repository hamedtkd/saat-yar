import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("static metadata routes are export-safe", async () => {
  for (const path of ["app/manifest.ts", "app/sitemap.ts", "app/robots.ts"]) {
    assert.match(await read(path), /export const dynamic = "force-static";/);
  }
});

test("today dashboard follows the shared accent instead of a fixed brand color", async () => {
  const [css, focus, summary, sidebar] = await Promise.all([
    read("app/globals.css"),
    read("components/pages/today/today-focus-card.tsx"),
    read("components/pages/today/today-smart-summary.tsx"),
    read("components/layout/navigation/sidebar-nav.tsx"),
  ]);
  assert.match(css, /--surface-accent: color-mix\(in srgb, var\(--accent\)/);
  assert.match(css, /dashboard-card/);
  assert.match(focus, /TodayProgressArc/);
  assert.match(focus, /var\(--accent\)/);
  assert.match(summary, /ProgressRing/);
  assert.match(sidebar, /bg-\[var\(--accent\)\]/);
});

test("employee mode keeps attendance data visible in the redesigned dashboard", async () => {
  const [page, log] = await Promise.all([
    read("components/pages/today/today-page.tsx"),
    read("components/pages/today/today-attendance-log.tsx"),
  ]);
  assert.match(page, /<TodayAttendanceLog record=\{props\.record\}/);
  assert.match(log, /ورودها، خروج‌ها، ناهار و وقفه‌ها/);
  assert.match(log, /record\.breaks\.map/);
  assert.match(log, /record\.lunchStart/);
});

test("time controls preserve attendance actions after visual redesign", async () => {
  const [types, inputs, quick] = await Promise.all([
    read("components/pages/today/time-strip/types.ts"),
    read("components/pages/today/time-strip/time-inputs.tsx"),
    read("components/pages/today/time-strip/quick-controls.tsx"),
  ]);
  assert.match(types, /\| "startWork"/);
  assert.match(types, /\| "finishWork"/);
  assert.match(inputs, /onClick=\{startWork\}/);
  assert.match(inputs, /onClick=\{finishWork\}/);
  assert.match(quick, /props\.startLunch/);
  assert.match(quick, /props\.startBreak/);
});

test("phase 101 contract is part of the main test command", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts.test, /tests\/phase101-today-dashboard-redesign\.test\.ts/);
});
