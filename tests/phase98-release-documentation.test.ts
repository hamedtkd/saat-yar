import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

const readmeFa = read("README.md");
const readmeEn = read("README_EN.md");
const troubleshootingFa = read("docs/TROUBLESHOOTING_FA.md");
const troubleshootingEn = read("docs/TROUBLESHOOTING_EN.md");
const browserCompatibility = read("docs/BROWSER_COMPATIBILITY.md");
const backlog = read("docs/roadmap/BACKLOG_FA.md");
const packageJson = JSON.parse(read("package.json")) as { scripts: { test: string } };

test("Persian and English READMEs link to each other", () => {
  assert.match(readmeFa, /\[English\]\(\.\/README_EN\.md\)/);
  assert.match(readmeEn, /\[فارسی\]\(\.\/README\.md\)/);
  assert.match(readmeEn, /local-first/i);
  assert.match(readmeEn, /more than \*\*300 tests\*\*/i);
});

test("release documentation exposes Windows and npm recovery paths", () => {
  for (const document of [troubleshootingFa, troubleshootingEn]) {
    assert.match(document, /npm ci/);
    assert.match(document, /npm run check:dependencies/);
    assert.match(document, /E404/);
    assert.match(document, /EPERM/);
    assert.match(document, /EBUSY/);
    assert.match(document, /index\.lock/);
    assert.match(document, /SAATYAR_BROWSER_PATH/);
  }
});

test("browser matrix distinguishes web APIs from the automated release gate", () => {
  assert.match(browserCompatibility, /Chrome/);
  assert.match(browserCompatibility, /Edge/);
  assert.match(browserCompatibility, /Firefox/);
  assert.match(browserCompatibility, /Safari/);
  assert.match(browserCompatibility, /IndexedDB/);
  assert.match(browserCompatibility, /BroadcastChannel/);
  assert.match(browserCompatibility, /Service Worker/);
  assert.match(browserCompatibility, /Notification/);
  assert.match(browserCompatibility, /production-browser-smoke\.mjs/);
  assert.match(browserCompatibility, /Local Notification/);
});

test("completed non-visual documentation backlog items are closed", () => {
  assert.doesNotMatch(backlog, /- \[ \] ایجاد README انگلیسی مستقل/);
  assert.doesNotMatch(backlog, /- \[ \] افزودن راهنمای عیب‌یابی نصب در Windows/);
  assert.doesNotMatch(backlog, /- \[ \] اضافه‌کردن جدول سازگاری مرورگر/);
  assert.match(backlog, /- \[ \] افزودن اسکرین‌شات‌های به‌روز/);
  assert.match(backlog, /- \[ \] تهیه GIF یا ویدیوی کوتاه/);
});

test("phase 98 documentation contract is part of npm test", () => {
  assert.match(packageJson.scripts.test, /tests\/phase98-release-documentation\.test\.ts/);
});
