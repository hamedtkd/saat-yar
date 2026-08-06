import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { collectDataHealthItems, getDataHealthSummary } from "../lib/data-health.ts";
import type { WorkRecord } from "../lib/types.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const base: WorkRecord = { date: "2026-08-06", start: "08:00", end: "16:00", lunchMinutes: 0, paidLunch: false, breaks: [], leaveMinutes: 0, leaveType: "none", note: "" };

test("data health center collects invalid incomplete and review records", () => {
  const items = collectDataHealthItems({
    "2026-08-04": { ...base, date: "2026-08-04", end: undefined },
    "2026-08-05": { ...base, date: "2026-08-05", needsReview: true, autoClosedAt: new Date().toISOString() },
    "2026-08-06": base,
  });
  assert.equal(items.length, 2);
  assert.deepEqual(getDataHealthSummary(items), { total: 2, invalid: 0, incomplete: 1, review: 1 });
});

test("settings data section exposes an actionable health card", async () => {
  const card = await read("components/pages/settings/data-health-card.tsx");
  const page = await read("components/pages/settings/settings-page.tsx");
  assert.match(card, /سلامت داده‌ها/);
  assert.match(card, /\/today\?date=\$\{item\.date\}/);
  assert.match(card, /GuardedLink/);
  assert.match(page, /<DataHealthCard records=\{data\.records\}/);
});

test("phase 61 registry fixture follows the current labelled contract", async () => {
  const source = await read("tests/phase61-unsaved-settings-guard.test.ts");
  assert.match(source, /label: "کارت تست فاز ۶۱"/);
});
