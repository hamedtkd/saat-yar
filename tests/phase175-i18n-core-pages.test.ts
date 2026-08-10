import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { enCatalog } from "../lib/i18n/en.ts";
import { faCatalog } from "../lib/i18n/fa.ts";
import {
  formatLocaleDate,
  formatLocaleDigits,
  formatLocaleDuration,
  formatLocaleMoney,
} from "../lib/i18n/formatters.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

async function readSourceTree(root: string) {
  const entries = await readdir(new URL(`../${root}`, import.meta.url), { recursive: true });
  const files = entries.filter((entry) => /\.(ts|tsx)$/.test(entry));
  return Promise.all(files.map(async (entry) => ({ path: `${root}/${entry}`, source: await read(`${root}/${entry}`) })));
}

test("Today Month and Reports catalogs stay typed and bilingual", () => {
  const keys = [
    "today.hero.workQuestion",
    "today.summary.today",
    "today.edit.saved",
    "today.edit.field.lunchPaid",
    "today.edit.field.breaks",
    "month.section.overviewTitle",
    "month.weekly.title",
    "reports.employeeTitle",
    "reports.filtersTitle",
    "reports.chartsTitle",
    "reports.recordsTitle",
  ] as const;
  for (const key of keys) {
    assert.ok(faCatalog[key]);
    assert.ok(enCatalog[key]);
    assert.notEqual(faCatalog[key], enCatalog[key]);
  }
});

test("locale formatters keep Persian calendar semantics while switching digits and copy", () => {
  assert.equal(formatLocaleDigits("fa-IR", "08:30"), "۰۸:۳۰");
  assert.equal(formatLocaleDigits("en", "۰۸:۳۰"), "08:30");
  assert.equal(formatLocaleDuration("fa-IR", 125), "۲:۰۵");
  assert.equal(formatLocaleDuration("en", 125), "2:05");
  assert.match(formatLocaleMoney("fa-IR", 1250000), /۱/);
  assert.match(formatLocaleMoney("en", 1250000), /1/);
  const persianDate = formatLocaleDate("fa-IR", "2026-08-10", { year: "numeric", month: "long", day: "numeric" });
  const englishDate = formatLocaleDate("en", "2026-08-10", { year: "numeric", month: "long", day: "numeric" });
  assert.match(persianDate, /[۰-۹]/);
  assert.doesNotMatch(englishDate, /[۰-۹]/);
  assert.match(englishDate, /1405/);
});

test("Today surfaces consume locale UI instead of embedding Persian interface copy", async () => {
  const sources = await readSourceTree("components/pages/today");
  const joined = sources.map((item) => item.source).join("\n");
  assert.match(joined, /useLocaleUi/);
  assert.match(joined, /today\.hero\.workQuestion/);
  assert.match(joined, /today\.focus\.employeeNote/);
  assert.match(joined, /today\.edit\.saved/);
  assert.match(joined, /WorkRecordChange\[\]/);
  assert.match(joined, /today\.edit\.field\.lunchPaid/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
});

test("Month surfaces consume locale UI and localized Persian-calendar formatters", async () => {
  const sources = await readSourceTree("components/pages/month");
  const joined = sources.map((item) => item.source).join("\n");
  assert.match(joined, /useLocaleUi/);
  assert.match(joined, /month\.section\.overviewTitle/);
  assert.match(joined, /month\.weekly\.title/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
});

test("Reports surfaces localize employee and freelancer views without changing domain data", async () => {
  const sources = await readSourceTree("components/pages/reports");
  const joined = sources.map((item) => item.source).join("\n");
  assert.match(joined, /useLocaleUi/);
  assert.match(joined, /reports\.employeeTitle/);
  assert.match(joined, /reports\.freelancerTitle/);
  assert.match(joined, /reports\.charts\.employeeDailyTitle/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
});

test("shared date and time pickers are locale-aware while preserving normalized stored values", async () => {
  const [calendar, day, timePicker, state] = await Promise.all([
    read("components/pickers/jalali-date-picker/calendar-grid.tsx"),
    read("components/pickers/jalali-date-picker/calendar-day.tsx"),
    read("components/pickers/time-picker.tsx"),
    read("components/pickers/time-picker/use-time-picker.ts"),
  ]);
  assert.match(calendar, /translate\(locale, key\)/);
  assert.match(day, /formatLocaleDigits\(locale, cell\.day\)/);
  assert.match(timePicker, /useLocaleUi\(\)/);
  assert.match(state, /parseTimeInput\(inputValue\)/);
  assert.match(state, /onChange\(parsed\.value\)/);
});

test("live timers and money displays follow the active locale without extra runtime schedulers", async () => {
  const [duration, work, money] = await Promise.all([
    read("components/common/live-duration.tsx"),
    read("components/common/live-work-duration.tsx"),
    read("components/common/private-money.tsx"),
  ]);
  assert.match(duration, /useLocaleUi/);
  assert.match(duration, /useRuntimeNow\("second", true\)/);
  assert.match(work, /durationSeconds/);
  assert.match(money, /money\(value\)/);
  assert.doesNotMatch(`${duration}\n${work}`, /setInterval|setTimeout/);
});


test("locale UI formatter callbacks stay referentially stable across ordinary rerenders", async () => {
  const source = await read("components/i18n/use-locale-ui.ts");
  assert.match(source, /import \{ useMemo \} from "react"/);
  assert.match(source, /return useMemo\(\(\) => \(\{/);
  assert.match(source, /\}\), \[context, locale\]\);/);

  const completedEditor = await read("components/pages/today/completed-day-editor.tsx");
  assert.match(completedEditor, /registerSettingsDraft/);
  assert.match(completedEditor, /digits, dirty, editing/);
});

test("production browser smoke covers English Today Month Reports then restores Persian", async () => {
  const smoke = await read("scripts/production-browser-smoke.mjs");
  assert.match(smoke, /English Today core surface/);
  assert.match(smoke, /English Month core surface/);
  assert.match(smoke, /English Reports core surface/);
  assert.match(smoke, /Today, Month, and Reports render localized English LTR surfaces before Persian restore/);
  assert.match(smoke, /Persian RTL locale restore/);
});

test("Phase 175 is documented and wired without schema dependency or release-version changes", async () => {
  const [pkgSource, notes, backlog, docs, schema] = await Promise.all([
    read("package.json"),
    read("docs/phases/PHASE_175_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/README.md"),
    read("lib/data/version.ts"),
  ]);
  const pkg = JSON.parse(pkgSource) as { version: string; scripts: Record<string, string> };
  assert.equal(pkg.version, "2.3.2");
  assert.match(pkg.scripts.test, /phase175-i18n-core-pages\.test\.ts/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Migration: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(backlog, /\[x\] فاز ۱۷۵:/);
  assert.match(docs, /PHASE_175_NOTES_FA\.md/);
  assert.match(schema, /APP_DATA_SCHEMA_VERSION = 17/);
});

test("employee break smoke uses structural hooks instead of localized paid-checkbox copy", async () => {
  const editor = await read("components/pages/today/time-strip/breaks-editor.tsx");
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(editor, /data-breaks-editor/);
  assert.match(editor, /data-break-row/);
  assert.match(editor, /data-break-paid-toggle/);
  assert.match(smoke, /data-break-paid-toggle/);
  assert.doesNotMatch(smoke, /aria-label="وقفه 1 با حقوق"/);
});
