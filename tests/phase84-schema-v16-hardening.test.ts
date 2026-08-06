import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { mergeAppData } from "../lib/data/merge-app-data.ts";
import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { createCompleteAppData } from "../lib/data/app-data-factory.ts";
import { normaliseData } from "../lib/data/normalise.ts";
import { createDeletedWorkRecord } from "../lib/record-recycle-bin.ts";
import type { AppData } from "../lib/types.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const root = new URL("../", import.meta.url);

test("complete AppData factory owns every required collection", () => {
  const data = createCompleteAppData({ settings: structuredClone(defaultSettings) });

  assert.deepEqual(data.records, {});
  assert.deepEqual(data.leaves, []);
  assert.deepEqual(data.clients, []);
  assert.deepEqual(data.projects, []);
  assert.deepEqual(data.timeEntries, []);
  assert.deepEqual(data.expenses, []);
  assert.deepEqual(data.invoices, []);
  assert.deepEqual(data.holidayOverrides, []);
  assert.deepEqual(data.deletedRecords, []);
});

test("blank application states receive independent recycle-bin collections", () => {
  const first = createInitialData();
  const second = createInitialData();
  const deleted = createDeletedWorkRecord("2026-08-05", makeWorkRecord({ date: "2026-08-05" }), new Date("2026-08-06T10:00:00.000Z"), "deleted-1");

  first.deletedRecords.push(deleted);

  assert.equal(first.deletedRecords.length, 1);
  assert.equal(second.deletedRecords.length, 0);
});

test("backup merge preserves unique deleted records from both sources", () => {
  const current = createInitialData({ onboarded: true });
  const incoming = createInitialData({ onboarded: true });
  const record = makeWorkRecord({ date: "2026-08-05" });
  const currentDeleted = createDeletedWorkRecord(record.date, record, new Date("2026-08-06T10:00:00.000Z"), "current");
  const incomingDeleted = createDeletedWorkRecord("2026-08-04", { ...record, date: "2026-08-04" }, new Date("2026-08-06T11:00:00.000Z"), "incoming");

  current.deletedRecords = [currentDeleted];
  incoming.deletedRecords = [currentDeleted, incomingDeleted];

  const merged = mergeAppData(current, incoming);

  assert.deepEqual(merged.deletedRecords.map((item) => item.id), ["current", "incoming"]);
});

test("normalisation repairs schema v16 collections omitted by legacy data", () => {
  const legacy = structuredClone(createInitialData()) as unknown as Record<string, unknown>;
  Reflect.deleteProperty(legacy, "deletedRecords");

  const normalised = normaliseData(legacy as unknown as AppData, defaultSettings);

  assert.deepEqual(normalised.deletedRecords, []);
});

test("today route forwards the complete reset undo contract", async () => {
  const source = await readFile(new URL("app/today/page.tsx", root), "utf8");

  assert.match(source, /resetUndoDate=\{controller\.resetUndoDate\}/);
  assert.match(source, /undoResetRecord=\{controller\.undoResetRecord\}/);
  assert.match(source, /dismissResetUndo=\{controller\.dismissResetUndo\}/);
});
