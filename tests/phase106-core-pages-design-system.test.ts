import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("month page exposes the final dashboard hierarchy without removing month workflows", () => {
  const source = read("components/pages/month/month-page.tsx");
  assert.match(source, /SectionHeading/);
  assert.match(source, /تقویم و روند هفتگی/);
  assert.match(source, /جزئیات روز/);
  assert.match(source, /جدول کارکرد/);
  assert.match(source, /exportMonth/);
  assert.match(source, /MonthDayDetails/);
});

test("reports page separates filter summary charts and records while preserving exports", () => {
  const source = read("components/pages/reports/reports-page.tsx");
  for (const label of ["فیلترها", "نمودارهای تحلیلی", "رکوردهای گزارش"]) assert.match(source, new RegExp(label));
  assert.match(source, /ReportActions/);
  assert.match(source, /ReportCharts/);
  assert.match(source, /ReportTable/);
});

test("settings groups remain navigable and keep every existing settings workflow", () => {
  const source = read("components/pages/settings/settings-page.tsx");
  for (const id of ["settings-general", "settings-data", "settings-work", "settings-about"]) {
    assert.match(source, new RegExp(`<span id="${id}"`));
  }
  assert.match(source, /SettingsSection/);
  assert.match(source, /PayrollSettingsCard/);
  assert.match(source, /AppearanceSettingsCard/);
  assert.match(source, /RecordRecycleBinCard/);
});

test("shared page surfaces use semantic dashboard tokens instead of a fixed theme color", () => {
  const surface = read("components/common/surface-card.tsx");
  const section = read("components/common/section-heading.tsx");
  assert.match(surface, /var\(--dashboard-border\)/);
  assert.match(surface, /dashboard-card/);
  assert.match(section, /var\(--accent-soft\)/);
  assert.doesNotMatch(section, /#06b6d4|#10b981|#0ea5e9/);
});

test("phase 106 contract is part of the main quality command", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.scripts.test.split(/\s+/).includes("tests/phase106-core-pages-design-system.test.ts"));
});
