import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("shared WorkRecord fixture includes every required baseline field", () => {
  const record = makeWorkRecord();
  assert.equal(record.holiday, false);
  assert.equal(record.lunchPaid, false);
  assert.equal(record.leaveType, "none");
  assert.deepEqual(record.breaks, []);
});

test("shared WorkRecord fixture accepts focused overrides", () => {
  const record = makeWorkRecord({ date: "2026-08-04", end: "", holiday: true });
  assert.equal(record.date, "2026-08-04");
  assert.equal(record.end, "");
  assert.equal(record.holiday, true);
  assert.equal(record.start, "08:00");
});

test("phase 72 health tests use the shared typed fixture", async () => {
  const source = await read("tests/phase72-data-health-center.test.ts");
  assert.match(source, /makeWorkRecord/);
  assert.doesNotMatch(source, /const base: WorkRecord/);
});
