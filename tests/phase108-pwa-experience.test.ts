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
  assert.match(source, /ساعت‌یار آفلاین است/);
  assert.match(source, /ساعت‌یار را مثل یک اپ نصب کن/);
  assert.match(source, /Add to Home Screen/);
  assert.match(source, /نسخه جدید ساعت‌یار آماده است/);
  assert.match(source, /requestNavigation/);
  assert.match(source, /SKIP_WAITING/);
  assert.match(source, /controllerchange/);
});

test("shell exposes the PWA experience and footer does not overclaim offline readiness", () => {
  assert.match(read("components/saatyar-shell.tsx"), /<PwaExperience \/>/);
  const footer = read("components/layout/app-footer.tsx");
  assert.match(footer, /داده‌ها روی همین دستگاه نگه‌داری می‌شوند/);
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
