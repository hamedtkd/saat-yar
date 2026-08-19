import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { localizeSystemRuntimeError } from "../lib/i18n/runtime-error.ts";
import { describeTimerDevice, formatTimerHeartbeat } from "../lib/live-timer-lock.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");


test("repository i18n closure audit passes with a narrow explicit exception list", () => {
  const output = execFileSync(process.execPath, ["scripts/audit-i18n-closure.mjs"], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  assert.match(output, /i18n closure audit passed/);
});

test("shared common surfaces no longer embed Persian UI copy", async () => {
  const files = [
    "components/common/color-field.tsx",
    "components/common/page-heading.tsx",
    "components/common/minute-duration-field.tsx",
    "components/common/progress-ring.tsx",
    "components/layout/onboarding.tsx",
    "app/page.tsx",
  ];
  const sources = await Promise.all(files.map(read));
  const joined = sources.join("\n");
  assert.match(joined, /common\.autosave/);
  assert.match(joined, /Choose custom color/);
  assert.match(joined, /common\.minutesCount/);
  assert.match(joined, /app\.openingLastPage/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
});

test("dialog alert select and shared table geometry follow the active document direction", async () => {
  const [dialog, alert, select, table, duration, onboarding, dateTrigger] = await Promise.all([
    read("components/ui/dialog.tsx"),
    read("components/ui/alert-dialog.tsx"),
    read("components/ui/select.tsx"),
    read("components/common/table-shell.tsx"),
    read("components/common/minute-duration-field.tsx"),
    read("components/layout/onboarding/step-shell.tsx"),
    read("components/pickers/jalali-date-picker/date-picker-trigger.tsx"),
  ]);
  assert.match(dialog, /dir=\{direction\}/);
  assert.match(dialog, /end-3/);
  assert.match(alert, /dir=\{direction\}/);
  assert.doesNotMatch(alert, /flex-row-reverse/);
  assert.match(select, /ps-3 pe-10 text-start/);
  assert.match(select, /absolute end-3/);
  assert.match(select, /ps-9 pe-3 text-start/);
  assert.match(select, /absolute start-3/);
  assert.doesNotMatch(select, /dir="rtl"|text-right|\bpr-9\b|\bpl-10\b/);
  assert.match(table, /text-start/);
  assert.match(duration, /ps-16/);
  assert.match(onboarding, /\[&>label\]:text-start/);
  assert.match(dateTrigger, /text-start/);
});

test("header navigation owns only typed locale keys without parallel Persian labels", async () => {
  const [header, items] = await Promise.all([
    read("components/layout/app-header/header-nav.tsx"),
    read("components/layout/app-header/nav-items.ts"),
  ]);
  assert.match(header, /t\("nav\.primaryAria"\)/);
  assert.match(header, /t\(labelKey\)/);
  assert.match(items, /labelKey: MessageKey/);
  assert.doesNotMatch(items, /\blabel:\s*string/);
  assert.doesNotMatch(`${header}\n${items}`, /[\u0600-\u06FF]/);
});

test("timer device and heartbeat labels support Persian compatibility and English runtime copy", () => {
  const userAgent = "Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36";
  assert.equal(describeTimerDevice(userAgent, "Windows"), "Chrome روی Windows");
  assert.equal(describeTimerDevice(userAgent, "Windows", "en"), "Chrome on Windows");
  const now = Date.now();
  assert.equal(formatTimerHeartbeat(new Date(now - 12_000).toISOString(), now, "en"), "12 seconds ago");
  assert.match(formatTimerHeartbeat(new Date(now - 120_000).toISOString(), now), /۲ دقیقه پیش/);
});

test("runtime error bridge prevents cross-locale low-level error leakage", () => {
  assert.equal(localizeSystemRuntimeError("en", new Error("کد اتصال معتبر نیست."), "Device connection failed."), "Device connection failed.");
  assert.equal(localizeSystemRuntimeError("fa-IR", new Error("CSV headers are invalid"), "Could not read the CSV file."), "خواندن CSV ممکن نشد.");
  assert.equal(localizeSystemRuntimeError("en", new Error("Native camera failed"), "Device connection failed."), "Native camera failed");
});

test("import and device pairing surfaces sanitize low-level errors through the locale bridge", async () => {
  const [csv, pairing, scanner] = await Promise.all([
    read("components/pages/import/csv-import-panel.tsx"),
    read("hooks/use-device-transfer-pairing.ts"),
    read("components/pages/settings/device-pairing-qr-scanner.tsx"),
  ]);
  assert.match(csv, /localizeSystemRuntimeError\(locale, caught, "Could not read the CSV file\."\)/);
  assert.match(pairing, /localizeSystemRuntimeError\(locale, value, "Device connection failed\."\)/);
  assert.match(scanner, /localizeSystemRuntimeError\(locale, value, "QR could not be read\."\)/);
});

test("Excel export document language and direction follow the active report locale", async () => {
  const [exporters, actions] = await Promise.all([
    read("lib/exporters.ts"),
    read("hooks/controller/use-report-actions.ts"),
  ]);
  assert.match(exporters, /locale: Locale = "fa-IR"/);
  assert.match(exporters, /lang="\$\{locale === "en" \? "en" : "fa"\}"/);
  assert.match(exporters, /dir="\$\{locale === "en" \? "ltr" : "rtl"\}"/);
  assert.match(actions, /rows,[\s\S]*locale,[\s\S]*\);/);
});

test("static SEO and PWA metadata stay canonical Persian while runtime titles cover every product route", async () => {
  const [runtime, layout, manifest] = await Promise.all([
    read("components/i18n/locale-runtime.tsx"),
    read("app/layout.tsx"),
    read("app/manifest.ts"),
  ]);
  for (const route of ["/today", "/month", "/clients", "/projects", "/invoices", "/leave", "/reports", "/settings", "/about", "/onboarding", "/import"]) {
    assert.ok(runtime.includes(`"${route}"`), `missing runtime title coverage for ${route}`);
  }
  assert.match(runtime, /MutationObserver/);
  assert.match(layout, /<html lang="fa" dir="rtl"/);
  assert.match(manifest, /lang: "fa"/);
  assert.match(manifest, /dir: "auto"/);
});

test("the Persian UI allowlist is limited to metadata parser compatibility and toast classification", async () => {
  const audit = await read("scripts/audit-i18n-closure.mjs");
  for (const path of [
    "app/layout.tsx",
    "app/manifest.ts",
    "app/import/layout.tsx",
    "app/onboarding/layout.tsx",
    "components/pickers/time-picker/time-utils.ts",
    "components/common/app-toast.tsx",
  ]) assert.match(audit, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(audit, /PERSIAN_UI_ALLOWLIST\.size/);
  assert.doesNotMatch(audit, /components\/pages\/settings\/|components\/layout\/onboarding\/welcome-step/);
});

test("production browser matrix retains English core business system coverage and Persian restore", async () => {
  const [smoke, employeeSummary, payrollEngine] = await Promise.all([
    read("scripts/production-browser-smoke.mjs"),
    read("components/pages/reports/overview/employee-summary.tsx"),
    read("lib/payroll-engine.ts"),
  ]);
  assert.match(smoke, /Today, Month, and Reports render localized English LTR surfaces before Persian restore/);
  assert.match(smoke, /Clients, Projects, Invoices, and Leave render localized English LTR business surfaces/);
  assert.match(smoke, /Settings, Onboarding, Import, and About follow English LTR before Persian restore/);
  assert.match(smoke, /await switchWorkspaceMode\(client, "hybrid"\)/);
  assert.match(smoke, /await switchWorkspaceMode\(client, "employee"\)/);
  assert.match(smoke, /Persian RTL locale restore/);
  assert.match(smoke, /Calendar follows language by default and permits English \+ Persian-calendar override/);
  assert.match(employeeSummary, /payrollLineLabelKeys/);
  assert.doesNotMatch(employeeSummary, /line\.title/);
  assert.doesNotMatch(payrollEngine, /[\u0600-\u06FF]/);
});

test("Phase 178 is wired as final i18n closure without schema dependency or package-version changes", async () => {
  const [pkgSource, notes, backlog, docs, schema] = await Promise.all([
    read("package.json"),
    read("docs/phases/PHASE_178_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/README.md"),
    read("lib/data/version.ts"),
  ]);
  const pkg = JSON.parse(pkgSource) as { version: string; dependencies: Record<string, string>; devDependencies: Record<string, string>; scripts: Record<string, string> };
  assert.match(pkg.scripts.check, /npm run audit:i18n/);
  assert.match(pkg.scripts["audit:i18n"], /audit-i18n-closure\.mjs/);
  assert.match(pkg.scripts.test, /phase178-i18n-closure\.test\.ts/);
  assert.match(notes, /Baseline: `fff7537`/);
  assert.match(notes, /Package: `2\.3\.2`/);
  assert.match(notes, /AppData Schema: `v17`/);
  assert.match(notes, /Migration: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(backlog, /\[x\] فاز ۱۷۸:/);
  assert.match(docs, /PHASE_178_NOTES_FA\.md/);
  assert.match(schema, /APP_DATA_SCHEMA_VERSION = \d+ as const/);
});
