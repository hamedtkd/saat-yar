import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createInitialData, defaultSettings } from "../lib/constants.ts";
import {
  APP_DATA_COLLECTION_KEYS,
  APP_DATA_KEYS,
  assertCompleteAppData,
  createEmptyAppDataCollections,
  getMissingAppDataKeys,
} from "../lib/data/app-data-contract.ts";
import { createCompleteAppData } from "../lib/data/app-data-factory.ts";

const root = new URL("../", import.meta.url);

const expectedKeys = [
  "settings",
  "records",
  "leaves",
  "clients",
  "projects",
  "timeEntries",
  "expenses",
  "invoices",
  "holidayOverrides",
  "deletedRecords",
].sort();

test("AppData contract lists every current top-level key exactly once", () => {
  assert.deepEqual([...APP_DATA_KEYS].sort(), expectedKeys);
  assert.equal(new Set(APP_DATA_KEYS).size, APP_DATA_KEYS.length);
  assert.equal(APP_DATA_COLLECTION_KEYS.includes("records"), true);
});

test("collection factories return independent complete defaults", () => {
  const first = createEmptyAppDataCollections();
  const second = createEmptyAppDataCollections();
  first.deletedRecords.push({} as never);

  assert.equal(first.deletedRecords.length, 1);
  assert.equal(second.deletedRecords.length, 0);
  assert.deepEqual(Object.keys(first).sort(), expectedKeys.filter((key) => key !== "settings"));
});

test("runtime audit reports missing fields before storage or backup code receives them", () => {
  const incomplete = { settings: defaultSettings, records: {} };
  assert.deepEqual(getMissingAppDataKeys(incomplete), [
    "leaves",
    "clients",
    "projects",
    "timeEntries",
    "expenses",
    "invoices",
    "holidayOverrides",
    "deletedRecords",
  ]);
  assert.throws(() => assertCompleteAppData(incomplete, "incomplete fixture"), /deletedRecords/);
});

test("factory and initial data satisfy the audited contract", () => {
  assert.doesNotThrow(() => assertCompleteAppData(createCompleteAppData({ settings: defaultSettings })));
  assert.doesNotThrow(() => assertCompleteAppData(createInitialData()));
});

test("quality pipeline runs the schema audit before TypeScript and tests", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8")) as {
    scripts: Record<string, string>;
  };
  assert.equal(packageJson.scripts["audit:schema"], "node --experimental-strip-types scripts/audit-app-data-contract.ts");
  assert.match(packageJson.scripts.check, /check:imports && npm run audit:schema && npm run typecheck/);
});
