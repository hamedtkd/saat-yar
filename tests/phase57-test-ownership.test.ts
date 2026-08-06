import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("legacy navigation test follows the current weekly target owner", async () => {
  const legacy = await read("tests/phase40-navigation-editing.test.ts");
  assert.match(legacy, /work-schedule-editor\.tsx/);
  assert.match(legacy, /applyWeeklyTargetHours/);
  assert.doesNotMatch(legacy, /setWeeklyTargetHours/);
});

test("weekly target behavior stays covered by domain and editor tests", async () => {
  const domain = await read("tests/phase50-settings-layout-weekly-target.test.ts");
  const contract = await read("tests/phase56-work-schedule-contract.test.ts");
  assert.match(domain, /getWeeklyTargetMinutes/);
  assert.match(domain, /disabled days stay unchanged/);
  assert.match(contract, /preserve structural draft types/);
});
