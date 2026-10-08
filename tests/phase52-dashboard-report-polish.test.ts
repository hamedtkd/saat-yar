import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildGreeting, getGreetingPeriod } from "../lib/greeting.ts";

test("greeting follows local day periods and includes the saved name", () => {
  assert.equal(getGreetingPeriod(8), "صبح");
  assert.equal(getGreetingPeriod(13), "ظهر");
  assert.equal(getGreetingPeriod(18), "عصر");
  assert.equal(getGreetingPeriod(22), "شب");
  assert.equal(buildGreeting("حامد", 8), "صبح بخیر، حامد");
});

test("settings navigation stays sticky on desktop and collapses to the compact mobile picker", async () => {
  const source = await readFile("components/pages/settings/settings-nav.tsx", "utf8");
  const mobile = await readFile("components/pages/settings/settings-mobile-nav.tsx", "utf8");
  assert.match(source, /sticky top-\[84px\]/);
  assert.match(source, /max-\[900px\]:top-\[72px\]/);
  assert.match(source, /max-\[900px\]:hidden/);
  assert.match(source, /<SettingsMobileNav/);
  assert.match(mobile, /data-settings-mobile-trigger/);
  assert.match(mobile, /hidden max-\[900px\]:block/);
  assert.doesNotMatch(mobile, /overflow-x-auto/);
});

test("employee notes use a textarea and the today title greets the user", async () => {
  const focus = await readFile("components/pages/today/today-focus-card.tsx", "utf8");
  const hero = await readFile("components/pages/today/today-hero.tsx", "utf8");
  assert.match(focus, /<Textarea/);
  assert.match(focus, /t\("today\.focus\.employeeNote"\)/);
  assert.match(hero, /buildLocalizedGreeting\(data\.settings\.name, locale\)/);
});

test("printed reports include print-ready charts and use A4-safe layout", async () => {
  const css = await readFile("app/globals.css", "utf8");
  const reports = await readFile("components/pages/reports/reports-page.tsx", "utf8");
  const printHeader = await readFile("components/pages/reports/report-print-header.tsx", "utf8");
  const employeeTable = await readFile("components/pages/reports/table/employee-desktop-table.tsx", "utf8");
  assert.match(css, /@page \{ size: A4/);
  assert.match(css, /\.report-page \.report-charts \{[\s\S]*display: block !important/);
  assert.match(css, /break-inside: avoid/);
  assert.match(css, /\.report-page thead \{ display: table-header-group/);
  assert.match(css, /\.report-page tr \{ break-inside: avoid-page; page-break-inside: avoid; \}/);
  assert.match(reports, /className="report-print-section report-print-charts mb-5"/);
  assert.doesNotMatch(reports, /report-charts[^\n]*print:hidden/);
  assert.match(reports, /records=\{monthRecords\}/);
  assert.match(reports, /entries=\{entries\}/);
  assert.match(printHeader, /getAppliedReportFilters/);
  assert.match(printHeader, /getReportPrintRange/);
  assert.doesNotMatch(printHeader, /aria-hidden/);
  assert.match(employeeTable, /report-desktop-table/);
});
