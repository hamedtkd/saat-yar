import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createInitialData } from "../lib/constants.ts";
import {
  clearFirstRunGuide,
  FIRST_RUN_GUIDE_STORAGE_KEY,
  isFirstRunGuidePending,
  markFirstRunGuidePending,
} from "../lib/first-run-guide.ts";
import { translate } from "../lib/i18n/index.ts";
import { applyScheduleDayToEnabledDays, getWeeklyTargetMinutes } from "../lib/work-schedule.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    removeItem(key: string) { values.delete(key); },
  };
}

test("first-run guidance is a local preference outside AppData", () => {
  const storage = createStorage();
  assert.equal(isFirstRunGuidePending(storage), false);
  markFirstRunGuidePending(storage);
  assert.equal(storage.getItem(FIRST_RUN_GUIDE_STORAGE_KEY), "1");
  assert.equal(isFirstRunGuidePending(storage), true);
  clearFirstRunGuide(storage);
  assert.equal(isFirstRunGuidePending(storage), false);

  const unavailableStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };
  assert.equal(isFirstRunGuidePending(unavailableStorage), false);
  assert.doesNotThrow(() => markFirstRunGuidePending(unavailableStorage));
  assert.doesNotThrow(() => clearFirstRunGuide(unavailableStorage));
});

test("one configured workday can be applied to every enabled day without changing days off", () => {
  const data = createInitialData();
  const settings = structuredClone(data.settings);
  settings.weeklySchedule.saturday = {
    ...settings.weeklySchedule.saturday,
    enabled: true,
    start: "09:15",
    end: "18:30",
    lunchMinutes: 30,
    lunchPaid: true,
    targetMinutes: 555,
  };
  settings.weeklySchedule.friday = {
    ...settings.weeklySchedule.friday,
    enabled: false,
    start: "11:00",
    end: "12:00",
    lunchMinutes: 5,
    lunchPaid: false,
    targetMinutes: 55,
  };

  const next = applyScheduleDayToEnabledDays(settings, "saturday");
  for (const [day, schedule] of Object.entries(next.weeklySchedule)) {
    if (day === "friday") continue;
    if (!schedule.enabled) continue;
    assert.equal(schedule.start, "09:15");
    assert.equal(schedule.end, "18:30");
    assert.equal(schedule.lunchMinutes, 30);
    assert.equal(schedule.lunchPaid, true);
  }
  assert.deepEqual(next.weeklySchedule.friday, settings.weeklySchedule.friday);
  assert.equal(next.weeklyMinutes, getWeeklyTargetMinutes(next));
});

test("first-run onboarding offers fast setup and skip without removing the advanced seven-step flow", async () => {
  const [onboarding, mode, footer] = await Promise.all([
    read("components/layout/onboarding.tsx"),
    read("components/layout/onboarding/mode-step.tsx"),
    read("components/layout/onboarding/onboarding-footer.tsx"),
  ]);
  assert.match(onboarding, /FINAL_STEP = 7/);
  assert.match(onboarding, /markBrowserFirstRunGuidePending\(\)/);
  assert.match(onboarding, /onFastSetup=\{finishInitialSetup\}/);
  assert.match(mode, /data-onboarding-fast-setup/);
  assert.match(footer, /data-onboarding-skip/);
  assert.match(footer, /!reentry && step < FINAL_STEP/);
});

test("Today exposes one clear first action for employee freelancer and hybrid onboarding outcomes", async () => {
  const [guide, today, relations, employeeSmoke] = await Promise.all([
    read("components/pages/today/first-run-guide.tsx"),
    read("components/pages/today/today-page.tsx"),
    read("components/pages/today/timer-relation-fields.tsx"),
    read("scripts/employee-browser-ux-smoke.mjs"),
  ]);
  assert.match(today, /<FirstRunGuide/);
  assert.match(guide, /mode === "employee" \|\| mode === "hybrid"/);
  assert.match(guide, /router\.push\("\/clients"\)/);
  assert.match(guide, /router\.push\("\/projects"\)/);
  assert.match(guide, /data-first-run-primary/);
  assert.match(relations, /data-first-run-timer-relations/);
  assert.match(employeeSmoke, /data-first-run-primary/);
  assert.match(employeeSmoke, /startEmployeeDay/);
});

test("new onboarding and first-run copy stays bilingual", () => {
  assert.equal(translate("fa-IR", "today.firstRun.startWork"), "شروع کار امروز");
  assert.equal(translate("en", "today.firstRun.startWork"), "Start today’s work");
  assert.equal(translate("fa-IR", "today.firstRun.createClient"), "ساخت اولین مشتری");
  assert.equal(translate("en", "today.firstRun.createClient"), "Create first client");
});

test("Phase 181 is documented and wired without schema or dependency changes", async () => {
  const [pkg, notes, backlog, constants] = await Promise.all([
    read("package.json"),
    read("docs/phases/PHASE_181_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("lib/constants.ts"),
  ]);
  assert.match(pkg, /tests\/phase181-onboarding-first-run-ux\.test\.ts/);
  assert.match(notes, /AppData Schema: `v17`/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(backlog, /فاز ۱۸۱/);
  assert.match(backlog, /فاز ۱۸۲/);
  assert.match(constants, /onboarded: false/);
});
