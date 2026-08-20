import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("PWA experience reads external browser state without synchronous effect setState", async () => {
  const text = await source("components/pwa/pwa-experience.tsx");
  assert.match(text, /useSyncExternalStore/);
  assert.match(text, /subscribeOnline/);
  assert.match(text, /subscribeStandalone/);
  assert.match(text, /subscribeInstallPrompt/);
  assert.doesNotMatch(text, /syncConnection\(\);[\s\S]{0,120}setInstalled\(/);
  assert.doesNotMatch(text, /setInstalled\(isStandalonePwa\(\)\)/);
});

test("media capture owns deterministic demo data instead of production user data", async () => {
  const fixture = await source("scripts/media/demo-data.ts");
  const capture = await source("scripts/capture-product-media.mjs");
  assert.match(fixture, /createInitialData\(\{ onboarded: true \}\)/);
  assert.match(fixture, /2026-08-07T10:30:00\+03:30/);
  assert.match(capture, /createMediaDemoData/);
  assert.match(capture, /indexedDB\.open\("saatyar-db", 1\)/);
  assert.doesNotMatch(capture, /localStorage\.getItem\("saatyar-data"\)/);
});

test("media capture covers final README screenshot surfaces", async () => {
  const text = await source("scripts/capture-product-media.mjs");
  for (const asset of [
    "onboarding.png",
    "today-light-desktop.png",
    "today-dark-desktop.png",
    "today-mobile.png",
    "work-calendar-light-desktop.png",
    "work-calendar-dark-desktop.png",
    "reports-light.png",
    "reports-dark.png",
    "settings.png",
  ]) assert.match(text, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(text, /onboarding\.gif/);
});

test("package exposes reproducible media capture commands", async () => {
  const packageJson = JSON.parse(await source("package.json")) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts["media:capture"], "npm run build:vercel && node --experimental-strip-types scripts/capture-product-media.mjs");
  assert.equal(packageJson.scripts["media:capture:built"], "node --experimental-strip-types scripts/capture-product-media.mjs");
  assert.match(packageJson.scripts.test, /phase109-media-capture-lint\.test\.ts/);
});
