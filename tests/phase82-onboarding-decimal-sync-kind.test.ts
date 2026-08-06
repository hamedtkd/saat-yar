import assert from "node:assert/strict";
import test from "node:test";
import { createDataSavedMessage, getSyncChangeKind, isAppSyncMessage } from "../lib/multi-tab-sync.ts";
import { formatSyncChangeKind } from "../lib/multi-tab-sync-status.ts";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("onboarding accepts half-hour weekly targets", async () => {
  const source = await readFile(new URL("components/layout/onboarding/schedule-step.tsx", root), "utf8");
  assert.match(source, /step=\{0\.5\}/);
  assert.match(source, /Math\.round\(value \* 60\)/);
});

test("sync messages expose a validated change kind", () => {
  assert.equal(getSyncChangeKind("/today"), "attendance");
  assert.equal(getSyncChangeKind("/settings"), "settings");
  assert.equal(getSyncChangeKind("/projects"), "business");
  assert.equal(formatSyncChangeKind("reporting"), "گزارش‌ها");
  const message = createDataSavedMessage("tab-a", new Date("2026-08-06T10:00:00Z"), "/today");
  assert.equal(message.changeKind, "attendance");
  assert.equal(isAppSyncMessage(message), true);
  assert.equal(isAppSyncMessage({ ...message, changeKind: "unknown" }), false);
});
