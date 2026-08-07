import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("production smoke clears origin storage before the first app boot", async () => {
  const source = await read("scripts/production-browser-smoke.mjs");
  assert.match(source, /json\/new\?\$\{encodeURIComponent\("about:blank"\)\}/);
  assert.match(source, /Storage\.clearDataForOrigin/);
  assert.match(source, /Page\.navigate/);
  assert.match(source, /initial production load/);
});

test("onboarding smoke follows structural step markers instead of translated copy", async () => {
  const [smoke, onboarding] = await Promise.all([
    read("scripts/production-browser-smoke.mjs"),
    read("components/layout/onboarding.tsx"),
  ]);
  assert.match(onboarding, /data-onboarding-step-index=\{step\}/);
  assert.match(smoke, /data-onboarding-step-index="2"/);
  assert.match(smoke, /data-onboarding-step-index="3"/);
  assert.match(smoke, /data-onboarding-step-index="4"/);
});

test("browser smoke timeout reports enough state to diagnose a real startup failure", async () => {
  const source = await read("scripts/production-browser-smoke.mjs");
  assert.match(source, /browserStateSnapshot/);
  assert.match(source, /onboardingStep/);
  assert.match(source, /Browser state:/);
  assert.match(source, /exception\?\.description/);
});

test("phase 123 hardening is wired into the main quality command", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts.test, /tests\/phase123-production-onboarding-smoke-hardening\.test\.ts/);
});
