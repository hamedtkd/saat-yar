import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  formatAppDataAuditExecutionError,
  formatAppDataAuditFailure,
  hasAppDataContractDiff,
  inspectAppDataContract,
} from "../lib/data/app-data-audit.ts";

const root = new URL("../", import.meta.url);

function completeShape(): Record<string, unknown> {
  return {
    settings: {},
    records: {},
    leaves: [],
    clients: [],
    projects: [],
    workProjects: [],
    timeEntries: [],
    expenses: [],
    invoices: [],
    holidayOverrides: [],
    deletedRecords: [],
  };
}

test("schema diff separates missing, unexpected and invalid fields", () => {
  const candidate = completeShape();
  delete candidate.deletedRecords;
  candidate.archivedRecords = [];
  candidate.records = [];
  candidate.invoices = {};

  const diff = inspectAppDataContract(candidate);
  assert.deepEqual(diff.missing, ["deletedRecords"]);
  assert.deepEqual(diff.unexpected, ["archivedRecords"]);
  assert.deepEqual(diff.invalid, [
    { path: "records", expected: "object", received: "array" },
    { path: "invoices", expected: "array", received: "object" },
  ]);
  assert.equal(hasAppDataContractDiff(diff), true);
});

test("schema failure report names the path, version and repair categories", () => {
  const report = formatAppDataAuditFailure("backup round-trip", 16, {
    missing: ["deletedRecords"],
    unexpected: ["archivedRecords"],
    invalid: [{ path: "records", expected: "object", received: "array" }],
  });

  assert.match(report, /AppData schema audit failed/);
  assert.match(report, /Path: backup round-trip/);
  assert.match(report, /Schema: v16/);
  assert.match(report, /Missing:\n- deletedRecords/);
  assert.match(report, /Unexpected:\n- archivedRecords/);
  assert.match(report, /Invalid:\n- records: expected object, received array/);
  assert.match(report, /Suggested action:/);
});

test("execution failures keep their path and original error message", () => {
  const report = formatAppDataAuditExecutionError("previous migration", 16, new Error("boom"));
  assert.match(report, /Path: previous migration/);
  assert.match(report, /Execution error:\n- boom/);
});

test("current complete AppData shape produces no contract diff", () => {
  assert.deepEqual(inspectAppDataContract(completeShape()), {
    missing: [],
    unexpected: [],
    invalid: [],
  });
});

test("audit script aggregates path failures and exits non-zero", async () => {
  const source = await readFile(new URL("scripts/audit-app-data-contract.ts", root), "utf8");
  assert.match(source, /const failures: string\[\] = \[\]/);
  assert.match(source, /failures\.join/);
  assert.match(source, /process\.exitCode = 1/);
  assert.doesNotMatch(source, /for \(const \[label, candidate\]/);
});

test("static export server has no stale path imports", async () => {
  const source = await readFile(new URL("scripts/static-export-server.mjs", root), "utf8");
  assert.doesNotMatch(source, /\bjoin\b/);
});
