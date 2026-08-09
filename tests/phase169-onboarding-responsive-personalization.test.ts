import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createInitialData } from "../lib/constants.ts";
import {
  updateOnboardingAppearance,
  updateOnboardingSalary,
} from "../lib/onboarding-settings.ts";
import { createPayrollPreset } from "../lib/payroll-policy.ts";
import { mergeWorkSettings } from "../lib/work-settings-sync.ts";
import { applyWeeklyTargetHours } from "../lib/work-schedule.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("wide desktop shell expands and stays centered beside the fixed sidebar", async () => {
  const [globals, shell, header, pwa] = await Promise.all([
    read("app/globals.css"),
    read("components/saatyar-shell.tsx"),
    read("components/layout/app-header.tsx"),
    read("components/pwa/pwa-experience.tsx"),
  ]);
  assert.match(globals, /--shell-content-max: 1510px/);
  assert.match(globals, /@media \(min-width: 1920px\)[\s\S]*--shell-content-max: 1780px/);
  assert.match(globals, /@media \(min-width: 2400px\)[\s\S]*--shell-content-max: 1960px/);
  assert.match(globals, /margin-right: calc\(var\(--shell-content-offset\) \+ max\(0px, \(100% - var\(--shell-content-offset\)/);
  assert.doesNotMatch(globals, /100vw - var\(--shell-content-offset\)/);
  assert.match(shell, /xl:px-0/);
  for (const source of [shell, header, pwa]) assert.match(source, /max-w-\[var\(--shell-content-max\)\]/);
});

test("profile menu stacking stays above settings search surfaces", async () => {
  const [header, menu, search] = await Promise.all([
    read("components/layout/app-header.tsx"),
    read("components/layout/app-header/profile-menu.tsx"),
    read("components/pages/settings/settings-search.tsx"),
  ]);
  assert.match(header, /sticky top-2 z-50/);
  assert.match(menu, /z-\[1100\]/);
  assert.match(search, /relative z-40/);
});

test("welcome step uses a focused profile card instead of the old stretched label layout", async () => {
  const [welcome, onboarding] = await Promise.all([
    read("components/layout/onboarding/welcome-step.tsx"),
    read("components/layout/onboarding.tsx"),
  ]);
  assert.match(welcome, /data-onboarding-name/);
  assert.match(welcome, /max-w-\[560px\]/);
  assert.match(welcome, /rounded-\[22px\]/);
  assert.match(onboarding, /max-w-\[1320px\]/);
});

test("work settings stay internally consistent when onboarding edits the real weekly schedule", () => {
  const settings = createInitialData().settings;
  const weeklySchedule = Object.fromEntries(
    Object.entries(settings.weeklySchedule).map(([day, value]) => [day, { ...value }]),
  ) as typeof settings.weeklySchedule;
  weeklySchedule.thursday.enabled = true;
  const draft = applyWeeklyTargetHours({
    mode: settings.mode,
    autoOfficialHolidays: settings.autoOfficialHolidays,
    autoWeeklyHoliday: settings.autoWeeklyHoliday,
    weeklyMinutes: settings.weeklyMinutes,
    weeklySchedule,
    lunchMinutes: settings.lunchMinutes,
  }, 44);
  const next = mergeWorkSettings(settings, draft);
  assert.equal(next.workDays, 6);
  assert.equal(next.weeklyMinutes, 44 * 60);
  assert.equal(next.defaultStart, next.weeklySchedule.saturday.start);
  assert.equal(next.defaultEnd, next.weeklySchedule.saturday.end);
});

test("salary onboarding updates the active monthly policy without corrupting non-monthly policies", () => {
  const settings = createInitialData().settings;
  const monthly = updateOnboardingSalary(settings, 42_000_000);
  assert.equal(monthly.salary, 42_000_000);
  assert.equal(monthly.payrollPolicy.baseAmount, 42_000_000);

  const hourlySettings = { ...settings, payrollPolicy: createPayrollPreset("hourly", 500_000) };
  const hourly = updateOnboardingSalary(hourlySettings, 50_000_000);
  assert.equal(hourly.salary, 50_000_000);
  assert.equal(hourly.payrollPolicy.baseAmount, 500_000);
});

test("appearance onboarding supports live mode changes and preset selection safely", () => {
  const settings = createInitialData().settings;
  const custom = { ...settings, appearance: { ...settings.appearance, preset: "custom" as const, accent: "#123456" } };
  const dark = updateOnboardingAppearance(custom, { mode: "dark" });
  assert.equal(dark.appearance.mode, "dark");
  assert.equal(dark.appearance.preset, "custom");
  assert.equal(dark.appearance.accent, "#123456");
  const ocean = updateOnboardingAppearance(dark, { preset: "ocean" });
  assert.equal(ocean.appearance.preset, "ocean");
  assert.equal(ocean.appearance.accent, "#0ea5e9");
});

test("onboarding now covers profile mode schedule payroll appearance and privacy", async () => {
  const [session, onboarding, progress, schedule, payroll, appearance, footer] = await Promise.all([
    read("lib/onboarding-session.ts"),
    read("components/layout/onboarding.tsx"),
    read("components/layout/onboarding/steps-progress.tsx"),
    read("components/layout/onboarding/schedule-step.tsx"),
    read("components/layout/onboarding/payroll-step.tsx"),
    read("components/layout/onboarding/appearance-step.tsx"),
    read("components/layout/onboarding/onboarding-footer.tsx"),
  ]);
  assert.match(session, /1 \| 2 \| 3 \| 4 \| 5 \| 6/);
  for (const step of [1, 2, 3, 4, 5, 6]) assert.match(onboarding, new RegExp(`step === ${step}`));
  assert.match(progress, /"حقوق", "ظاهر", "ذخیره‌سازی"/);
  assert.match(schedule, /WorkScheduleEditor/);
  assert.match(payroll, /data-onboarding-salary/);
  assert.match(appearance, /data-onboarding-theme/);
  assert.match(footer, /FINAL_STEP = 6/);
});

test("production browser smoke proves onboarding persistence, wide desktop geometry and deterministic PWA control", async () => {
  const [smoke, serviceWorker] = await Promise.all([
    read("scripts/production-browser-smoke.mjs"),
    read("public/sw.js"),
  ]);
  assert.match(smoke, /data-work-schedule-weekly-target/);
  assert.match(smoke, /getAttribute\("role"\) === "spinbutton"/);
  assert.match(smoke, /getAttribute\("aria-valuenow"\)/);
  assert.match(smoke, /data-workday-toggle="thursday"/);
  assert.match(smoke, /data-onboarding-salary/);
  assert.match(smoke, /data-onboarding-theme="ocean"/);
  assert.match(smoke, /readStoredSettings/);
  assert.match(smoke, /width: 2560, height: 1440/);
  assert.match(smoke, /document\.documentElement\.clientWidth/);
  assert.match(smoke, /scrollbarWidth/);
  assert.match(smoke, /balancedDelta > 24/);
  assert.match(smoke, /Wide desktop shell expands and stays centered beside the sidebar/);
  assert.match(smoke, /PWA service worker did not reach the active state/);
  assert.match(smoke, /first-install PWA control reload/);
  assert.match(smoke, /PWA service worker control after activation/);
  assert.match(smoke, /serviceWorker: registration \?/);
  assert.match(smoke, /controlled: Boolean\(navigator\.serviceWorker\.controller\)/);
  const activateBlock = serviceWorker.match(/self\.addEventListener\("activate",[\s\S]*?\n\}\);/)?.[0] ?? "";
  assert.match(activateBlock, /event\.waitUntil\(Promise\.all\(\[/);
  assert.match(activateBlock, /self\.clients\.claim\(\)/);
  assert.doesNotMatch(serviceWorker, /\n  self\.clients\.claim\(\);\n\}\);/);
});

test("Phase 169 is documented and wired into the main quality command", async () => {
  const [pkg, notes, backlog, changelog] = await Promise.all([
    read("package.json"),
    read("docs/phases/PHASE_169_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("CHANGELOG.md"),
  ]);
  assert.match(pkg, /tests\/phase169-onboarding-responsive-personalization\.test\.ts/);
  assert.match(notes, /Responsive|ریسپانسیو/);
  assert.match(notes, /حقوق/);
  assert.match(backlog, /\[x\] فاز ۱۶۹/);
  assert.match(backlog, /فاز ۱۷۰: بازخورد و ذخیره ویرایش روز تکمیل‌شده/);
  assert.match(changelog, /Phase 169|فاز ۱۶۹/);
});
