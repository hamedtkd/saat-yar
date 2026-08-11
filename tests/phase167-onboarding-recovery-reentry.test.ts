import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  beginOnboardingReentry,
  clearOnboardingSession,
  DEFAULT_ONBOARDING_STEP,
  isOnboardingReentry,
  ONBOARDING_PROGRESS_STORAGE_KEY,
  ONBOARDING_REENTRY_STORAGE_KEY,
  readOnboardingStep,
  writeOnboardingStep,
} from "../lib/onboarding-session.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    removeItem(key: string) { values.delete(key); },
  };
}

test("onboarding starts from the welcome/name step and progress is local, bounded and recoverable", () => {
  const storage = createStorage();
  assert.equal(DEFAULT_ONBOARDING_STEP, 1);
  assert.equal(readOnboardingStep(storage), DEFAULT_ONBOARDING_STEP);
  assert.equal(writeOnboardingStep(storage, 3), 3);
  assert.equal(storage.getItem(ONBOARDING_PROGRESS_STORAGE_KEY), "3");
  assert.equal(readOnboardingStep(storage), 3);
  assert.equal(writeOnboardingStep(storage, 99), DEFAULT_ONBOARDING_STEP);
});

test("re-entry is an explicit local session that can be cleared safely", () => {
  const storage = createStorage();
  assert.equal(isOnboardingReentry(storage), false);
  assert.equal(beginOnboardingReentry(storage), 1);
  assert.equal(isOnboardingReentry(storage), true);
  assert.equal(storage.getItem(ONBOARDING_REENTRY_STORAGE_KEY), "1");
  assert.equal(readOnboardingStep(storage), 1);
  clearOnboardingSession(storage);
  assert.equal(isOnboardingReentry(storage), false);
  assert.equal(storage.getItem(ONBOARDING_PROGRESS_STORAGE_KEY), null);
});

test("controller owns persisted onboarding session state instead of transient step state", async () => {
  const [controller, hook] = await Promise.all([
    read("hooks/use-saatyar-controller.ts"),
    read("hooks/use-onboarding-session.ts"),
  ]);
  assert.match(controller, /useOnboardingSession\(persisted\.ready\)/);
  assert.doesNotMatch(controller, /useState\(2\)/);
  assert.match(hook, /useSyncExternalStore/);
  assert.doesNotMatch(hook, /useEffect|setStepState|setReentry|setReady/);
  assert.match(hook, /readOnboardingStep\(window\.localStorage\)/);
  assert.match(hook, /writeOnboardingStep\(window\.localStorage, value\)/);
  assert.match(hook, /beginOnboardingReentry\(window\.localStorage\)/);
  assert.match(hook, /clearOnboardingSession\(window\.localStorage\)/);
});

test("route guard resumes active onboarding sessions and blocks accidental direct re-entry", async () => {
  const guard = await read("components/layout/navigation/route-guard.tsx");
  assert.match(guard, /isOnboardingReentry\(window\.localStorage\)/);
  assert.match(guard, /if \(!onboarded \|\| onboardingReentry\)/);
  assert.match(guard, /router\.replace\(ONBOARDING_PATH\)/);
  assert.match(guard, /if \(normalized === ONBOARDING_PATH\)/);
  assert.match(guard, /router\.replace\(fallback\)/);
});

test("settings can reopen onboarding without resetting application data", async () => {
  const [card, settingsPage, route] = await Promise.all([
    read("components/pages/settings/onboarding-reentry-card.tsx"),
    read("components/pages/settings/settings-page.tsx"),
    read("app/onboarding/page.tsx"),
  ]);
  assert.match(card, /startOnboardingReentry\(\)/);
  assert.match(card, /router\.push\("\/onboarding"\)/);
  assert.match(card, /s\("Open the wizard again to review your name, workspace, schedule, and storage guidance\. Projects, work records, leave, and financial data are not deleted or reset\."\)/);
  assert.doesNotMatch(card, /createInitialData|setData/);
  assert.match(settingsPage, /<OnboardingReentryCard/);
  assert.match(route, /finishOnboardingSession\(\)/);
  assert.match(route, /\/settings#settings-onboarding/);
});

test("release browser smokes and roadmap cover onboarding recovery and Phase 167", async () => {
  const [smoke, freelancerSmoke, employeeSmoke, pkg, notes, backlog] = await Promise.all([
    read("scripts/production-browser-smoke.mjs"),
    read("scripts/freelancer-browser-ux-smoke.mjs"),
    read("scripts/employee-browser-ux-smoke.mjs"),
    read("package.json"),
    read("docs/phases/PHASE_167_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
  ]);
  assert.match(smoke, /data-onboarding-step-index="1"/);
  assert.match(smoke, /Boolean\(await \(\$\{expression\}\)\)/);
  assert.match(smoke, /replaceInputValue/);
  assert.match(smoke, /Onboarding welcome step captured a user name/);
  assert.match(smoke, /onboarding recovery reload/);
  assert.match(smoke, /Onboarding reload resumed from the saved step/);
  for (const workflowSmoke of [freelancerSmoke, employeeSmoke]) {
    assert.match(workflowSmoke, /data-onboarding-step-index="1"/);
    assert.match(workflowSmoke, /dedicated onboarding welcome step/);
    assert.doesNotMatch(workflowSmoke, /ساعت‌یار را برای خودت تنظیم کن/);
  }
  assert.match(pkg, /tests\/phase167-onboarding-recovery-reentry\.test\.ts/);
  assert.match(notes, /Recovery|بازیابی/);
  assert.match(backlog, /فاز ۱۶۷/);
  assert.match(backlog, /فاز ۱۶۸/);
});
