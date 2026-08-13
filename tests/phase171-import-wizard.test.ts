import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import {
  analyzeBackupImport, applyCsvImport, buildCsvImportPreview, createAutoMapping,
  mergeBackupKeepingCurrent, parseCsvText, parseImportDate,
} from "../lib/import-wizard/index.ts";
import type { AppData } from "../lib/types.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function withClient(name = "مشتری موجود") {
  const data = createInitialData({ onboarded: true });
  data.clients = [{ id: "client-1", name, color: "#0969a9", archived: false }];
  return data;
}

test("CSV parser handles quoted Persian cells and semicolon/tab/comma delimiters", () => {
  const comma = parseCsvText('name,note\n"شرکت، تست","خط ""ویژه"""\n');
  assert.equal(comma.rows[0].name, "شرکت، تست");
  assert.equal(comma.rows[0].note, 'خط "ویژه"');
  assert.equal(parseCsvText("name;email\nالف;a@example.com\n").delimiter, ";");
  assert.equal(parseCsvText("name\temail\nالف\ta@example.com\n").delimiter, "\t");
});

test("import dates accept Gregorian, Jalali and Persian digits without timezone drift", () => {
  assert.equal(parseImportDate("2026-08-09"), "2026-08-09");
  assert.equal(parseImportDate("۱۴۰۵/۰۵/۱۸"), "2026-08-09");
  assert.equal(parseImportDate("1404/12/30"), null);
  assert.equal(parseImportDate("not-a-date"), null);
});

test("auto mapping recognizes Persian and English headers", () => {
  const clients = createAutoMapping("clients", ["نام مشتری", "email", "توضیحات"]);
  assert.equal(clients.name, "نام مشتری");
  assert.equal(clients.email, "email");
  assert.equal(clients.note, "توضیحات");
  const work = createAutoMapping("work-records", ["تاریخ", "ورود", "خروج", "دقیقه ناهار"]);
  assert.equal(work.date, "تاریخ");
  assert.equal(work.start, "ورود");
  assert.equal(work.lunchMinutes, "دقیقه ناهار");
});

test("client preview separates new rows, conflicts and invalid names", () => {
  const data = withClient();
  const parsed = parseCsvText("name,email\nمشتری موجود,old@example.com\nمشتری جدید,new@example.com\nمشتری جدید,duplicate@example.com\n,new2@example.com\n");
  const preview = buildCsvImportPreview("clients", parsed, createAutoMapping("clients", parsed.headers), data);
  assert.equal(preview.readyCount, 1);
  assert.equal(preview.conflictCount, 2);
  assert.equal(preview.invalidCount, 1);
  assert.match(preview.rows[2].issues.join(" "), /تکراری داخل همین فایل/);
  assert.match(preview.rows[3].issues.join(" "), /نام مشتری/);
});

test("project CSV resolves an existing client by Persian name and rejects unknown clients", () => {
  const data = withClient("آلفا");
  const parsed = parseCsvText("name,client,rate,billable\nوب‌سایت,آلفا,۳۵۰۰۰۰,بله\nاپ,ناشناس,100,false\n");
  const preview = buildCsvImportPreview("projects", parsed, createAutoMapping("projects", parsed.headers), data);
  assert.equal(preview.readyCount, 1);
  assert.equal(preview.invalidCount, 1);
  const candidate = preview.rows[0].candidate;
  assert.equal(candidate?.kind, "projects");
  if (candidate?.kind === "projects") {
    assert.equal(candidate.value.clientId, "client-1");
    assert.equal(candidate.value.rate, 350000);
    assert.equal(candidate.value.billable, true);
  }
});

test("expense CSV imports Persian numbers/categories and validates relations", () => {
  const data = withClient("آلفا");
  data.projects = [{ id: "project-1", clientId: "client-1", name: "سایت", rate: 0, color: "#f4a500", status: "active" }];
  const parsed = parseCsvText("تاریخ,عنوان,مبلغ,مشتری,پروژه,دسته\n۱۴۰۵/۰۵/۱۸,دامنه,۸۵۰٬۰۰۰,آلفا,سایت,نرم افزار\n");
  const preview = buildCsvImportPreview("expenses", parsed, createAutoMapping("expenses", parsed.headers), data);
  assert.equal(preview.readyCount, 1);
  const candidate = preview.rows[0].candidate;
  assert.equal(candidate?.kind, "expenses");
  if (candidate?.kind === "expenses") {
    assert.equal(candidate.value.date, "2026-08-09");
    assert.equal(candidate.value.amount, 850000);
    assert.equal(candidate.value.category, "software");
    assert.equal(candidate.value.projectId, "project-1");
  }
});

test("work-record CSV normalizes Persian date/time and detects an existing day conflict", () => {
  const data = createInitialData({ onboarded: true });
  data.records["2026-08-09"] = { date: "2026-08-09", start: "08:00", end: "17:00", lunchMinutes: 30, breaks: [], activitySegments: [], leaveMinutes: 0, leaveType: "none", note: "", holiday: false };
  const parsed = parseCsvText("date,start,end,lunch_minutes,note\n۱۴۰۵/۰۵/۱۸,۷:۳۰,۱۶:۱۵,۴۵,قدیمی\n1405/05/19,0730,1615,30,جدید\n");
  const preview = buildCsvImportPreview("work-records", parsed, createAutoMapping("work-records", parsed.headers), data);
  assert.equal(preview.conflictCount, 1);
  assert.equal(preview.readyCount, 1);
  const second = preview.rows[1].candidate;
  assert.equal(second?.kind, "work-records");
  if (second?.kind === "work-records") {
    assert.equal(second.value.start, "07:30");
    assert.equal(second.value.end, "16:15");
    assert.equal(second.value.lunchMinutes, 30);
  }
});

test("CSV apply skips conflicts by default and replaces them only when explicitly requested", () => {
  const data = withClient();
  const parsed = parseCsvText("name,email\nمشتری موجود,new@example.com\nمشتری جدید,fresh@example.com\n");
  const preview = buildCsvImportPreview("clients", parsed, createAutoMapping("clients", parsed.headers), data);
  let counter = 0;
  const skipped = applyCsvImport(data, preview, "skip", () => `new-${++counter}`);
  assert.equal(skipped.applied, 1);
  assert.equal(skipped.data.clients.length, 2);
  assert.equal(skipped.data.clients.find((item) => item.id === "client-1")?.email, undefined);
  const replaced = applyCsvImport(data, preview, "replace", () => `new-${++counter}`);
  assert.equal(replaced.applied, 2);
  assert.equal(replaced.data.clients.find((item) => item.id === "client-1")?.email, "new@example.com");
  assert.equal(data.clients.length, 1, "source AppData must stay immutable");
});

test("backup analysis previews additions/conflicts and safe merge keeps current settings and conflicts", () => {
  const current = withClient("فعلی");
  current.settings.name = "نام فعلی";
  current.records["2026-08-09"] = { date: "2026-08-09", start: "08:00", end: "17:00", lunchMinutes: 30, breaks: [], activitySegments: [], leaveMinutes: 0, leaveType: "none", note: "current", holiday: false };
  const incoming = structuredClone(current) as AppData;
  incoming.settings.name = "نام فایل";
  incoming.records["2026-08-09"].note = "incoming";
  incoming.records["2026-08-10"] = { ...incoming.records["2026-08-09"], date: "2026-08-10", note: "new" };
  incoming.clients.push({ id: "client-2", name: "جدید", color: "#0a9d63", archived: false });
  const analysis = analyzeBackupImport(current, incoming);
  assert.equal(analysis.details.records.conflicts, 1);
  assert.equal(analysis.details.records.additions, 1);
  assert.equal(analysis.details.clients.additions, 1);
  assert.ok(analysis.settingsChanged >= 1);
  const merged = mergeBackupKeepingCurrent(current, incoming);
  assert.equal(merged.settings.name, "نام فعلی");
  assert.equal(merged.records["2026-08-09"].note, "current");
  assert.equal(merged.records["2026-08-10"].note, "new");
  assert.equal(merged.clients.some((item) => item.id === "client-2"), true);
});

test("Phase 171 exposes a reusable noindex import route, settings entry point and browser contract", async () => {
  const [route, layout, navigation, restore, page, smoke, roadmap, pkg] = await Promise.all([
    read("app/import/page.tsx"), read("app/import/layout.tsx"), read("lib/navigation.ts"),
    read("components/pages/settings/restore-card.tsx"), read("components/pages/import/import-page.tsx"),
    read("scripts/production-browser-smoke.mjs"), read("docs/roadmap/BACKLOG_FA.md"), read("package.json"),
  ]);
  assert.match(route, /ImportPage/);
  assert.match(layout, /index: false/);
  assert.match(navigation, /"\/import"/);
  assert.match(restore, /s\("Open Import Wizard"\)/);
  assert.match(page, /s\("Safe, local-first import"\)/);
  assert.match(smoke, /Import Wizard CSV persisted a client/);
  assert.match(roadmap, /\[x\] فاز ۱۷۱/);
  assert.match(pkg, /phase171-import-wizard\.test\.ts/);
});
