import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("PWA registration captures install availability and checks for updates", () => {
  const source = read("app/pwa-register.tsx");
  assert.match(source, /beforeinstallprompt/);
  assert.match(source, /appinstalled/);
  assert.match(source, /registration\?\.update\(\)/);
  assert.match(source, /updatefound/);
  assert.match(source, /PWA_EVENT\.updateAvailable/);
  assert.match(source, /process\.env\.NODE_ENV !== "production"/);
  assert.match(source, /clearDevelopmentPwaState/);
  assert.match(source, /getRegistrations\(\)/);
  assert.match(source, /name\.startsWith\("saatyar-"\)/);
});

test("service worker waits for explicit approval before activating an update", () => {
  const sw = read("public/sw.js");
  assert.match(sw, /saatyar-shell-v7/);
  assert.match(sw, /saatyar-static-v7/);
  assert.match(sw, /event\.data\?\.type === "SKIP_WAITING"/);
  const installBlock = sw.match(/self\.addEventListener\("install",[\s\S]*?\n\}\);/)?.[0] ?? "";
  assert.doesNotMatch(installBlock, /skipWaiting/);
});

test("PWA experience covers offline install iOS and safe update flows", () => {
  const source = read("components/pwa/pwa-experience.tsx");
  assert.match(source, /s\("Saatyar is offline"\)/);
  assert.match(source, /s\("Install Saatyar like an app"\)/);
  assert.match(source, /Add to Home Screen/);
  assert.match(source, /s\("A new Saatyar version is ready"\)/);
  const system = read("lib/i18n/system.ts");
  assert.match(system, /"Saatyar is offline": "ساعت‌یار آفلاین است"/);
  assert.match(system, /"Install Saatyar like an app": "ساعت‌یار را مثل یک اپ نصب کن"/);
  assert.match(source, /requestNavigation/);
  assert.match(source, /SKIP_WAITING/);
  assert.match(source, /controllerchange/);
});

test("shell exposes the PWA experience and footer does not overclaim offline readiness", () => {
  assert.match(read("components/saatyar-shell.tsx"), /<PwaExperience \/>/);
  const footer = read("components/layout/app-footer.tsx");
  assert.match(footer, /t\("footer\.online"\)/);
  assert.doesNotMatch(footer, /برنامه آماده استفاده آفلاین است/);
});


test("production browser smoke verifies installability and offline reload", () => {
  const source = read("scripts/production-browser-smoke.mjs");
  assert.match(source, /PWA manifest and service worker are install-ready/);
  assert.match(source, /Installed shell reloads while offline/);
  assert.match(source, /staticServer\.close\(\)/);
  assert.doesNotMatch(source, /Network\.emulateNetworkConditions/);
});

test("phase 108 closes the PWA UX backlog and runs in the main quality command", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /- \[x\] تکمیل تجربه PWA شامل نصب، وضعیت آفلاین و اعلان نسخه جدید\./);
  const pkg = JSON.parse(read("package.json")) as { scripts: { test: string } };
  assert.match(pkg.scripts.test, /tests\/phase108-pwa-experience\.test\.ts/);
});
