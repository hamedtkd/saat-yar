import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("static builds finalize a generated Next asset precache manifest", () => {
  const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  assert.match(packageJson.scripts["build:vercel"], /finalize-static-pwa\.mjs/);
  assert.match(packageJson.scripts["build:pages"], /finalize-static-pwa\.mjs/);
  const finalizer = read("scripts/finalize-static-pwa.mjs");
  assert.match(finalizer, /_next["']?, ["']static/);
  assert.match(finalizer, /pwa-precache-manifest\.js/);
  assert.match(finalizer, /No Next\.js static assets/);
});

test("service worker precaches generated build assets before offline use", () => {
  const sw = read("public/sw.js");
  assert.match(sw, /importScripts\("pwa-precache-manifest\.js"\)/);
  assert.match(sw, /saatyar-shell-v7/);
  assert.match(sw, /saatyar-static-v7/);
  assert.match(sw, /\.\.\.BUILD_ASSETS/);
  assert.match(read("public/pwa-precache-manifest.js"), /__SAATYAR_PRECACHE = \[\]/);
});

test("production smoke waits for a real offline page reload and validates build precache", () => {
  const source = read("scripts/production-browser-smoke.mjs");
  assert.match(source, /precachedBuildAssets/);
  assert.match(source, /Page\.reload/);
  assert.match(source, /Page\.loadEventFired/);
  assert.doesNotMatch(source, /evaluate\(client, `location\.reload\(\)`\)/);
});

test("media capture starts clean before app boot and reports browser exceptions", () => {
  const source = read("scripts/capture-product-media.mjs");
  assert.match(source, /json\/new\?\$\{encodeURIComponent\("about:blank"\)\}/);
  assert.match(source, /Storage\.clearDataForOrigin/);
  assert.doesNotMatch(source, /indexedDB\.deleteDatabase/);
  assert.match(source, /exception\?\.description/);
  assert.match(source, /Browser runtime errors during media capture/);
});

test("phase 110 is wired into quality and roadmap advances payroll after hardening", () => {
  const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  assert.match(packageJson.scripts.test, /phase110-pwa-media-hardening\.test\.ts/);
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /فاز ۱۱۰: مقاوم‌سازی Offline PWA و Media Capture/);
  assert.match(backlog, /فاز ۱۱۱: طراحی قرارداد و Schema موتور محاسبه حقوق/);
  assert.match(backlog, /فاز ۱۱۴: Pairing سریع موبایل و لپ‌تاپ با QR/);
});
