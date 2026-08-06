import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { browserExecutableCandidates } from "../scripts/production-browser-smoke.mjs";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("alert dialog controlled callbacks keep an explicit boolean contract", async () => {
  const files = [
    "components/pages/settings/holiday-overrides-card.tsx",
    "components/pages/settings/payroll-settings-card.tsx",
    "components/pages/settings/record-recycle-bin-card.tsx",
    "components/pages/settings/unsaved-settings-guard.tsx",
    "components/pages/today/today-page.tsx",
  ];
  for (const file of files) {
    const source = await read(file);
    assert.match(source, /onOpenChange=\{\(open: boolean\) =>/);
  }
});

test("browser discovery prioritizes explicit overrides and covers Windows Chrome and Edge", () => {
  const candidates = browserExecutableCandidates({
    SAATYAR_BROWSER_PATH: "D:\\Portable\\chrome.exe",
    PROGRAMFILES: "C:\\Program Files",
    "PROGRAMFILES(X86)": "C:\\Program Files (x86)",
    LOCALAPPDATA: "C:\\Users\\Hamed\\AppData\\Local",
  }, "win32");

  assert.equal(candidates[0], "D:\\Portable\\chrome.exe");
  assert.ok(candidates.some((path) => path.endsWith("Google\\Chrome\\Application\\chrome.exe")));
  assert.ok(candidates.some((path) => path.endsWith("Microsoft\\Edge\\Application\\msedge.exe")));
});

test("quality checks dependencies before TypeScript and release checks run the built browser smoke", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.match(packageJson.scripts.check, /check:imports.*check:dependencies.*audit:schema.*typecheck/);
  assert.equal(packageJson.scripts["test:browser:production:built"], "node scripts/production-browser-smoke.mjs");
  assert.match(packageJson.scripts["check:release"], /check:quality.*test:browser:production:built/);
  assert.equal(packageJson.devDependencies?.["@playwright/test"], undefined);
});

test("production smoke exercises onboarding and real calendar date selection", async () => {
  const source = await read("scripts/production-browser-smoke.mjs");
  assert.match(source, /ساعت‌یار را برای خودت تنظیم کن/);
  assert.match(source, /شروع ساعت‌یار/);
  assert.match(source, /\[aria-haspopup=\\?"dialog\\?"\]/);
  assert.match(source, /button\[aria-pressed=\\?"false\\?"\]/);
  assert.match(source, /Date navigation did not update the selected date/);
});
