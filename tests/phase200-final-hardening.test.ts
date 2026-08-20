import assert from "node:assert/strict";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { applyDeviceTransfer } from "../lib/device-transfer.ts";
import { inspectReleaseHardening } from "../scripts/release-hardening-audit.mjs";
import { inspectVercelStaticExportContract } from "../scripts/vercel-static-export-contract.mjs";
import { makeWorkRecord } from "./fixtures/work-record.ts";

test("Phase 200 final hardening migrates a released v17-shaped snapshot through v21 without losing user data", () => {
  const current = createInitialData({ onboarded: true });
  current.settings.name = "Release migration user";
  current.clients.push({ id: "client-1", name: "Legacy client", color: "#06b6d4", archived: false });
  current.projects.push({ id: "project-1", clientId: "client-1", name: "Legacy project", rate: 250_000, color: "#06b6d4", status: "active", billable: true });
  current.records["2026-08-19"] = makeWorkRecord({ date: "2026-08-19", note: "legacy record" });

  const legacy = structuredClone(current) as unknown as Record<string, unknown>;
  const settings = legacy.settings as Record<string, unknown>;
  delete settings.workTimingMode;
  const notifications = settings.notificationSettings as Record<string, unknown>;
  delete notifications.quietHours;
  delete notifications.customReminders;
  delete notifications.snoozeMinutes;
  const payrollPolicy = settings.payrollPolicy as Record<string, unknown>;
  delete payrollPolicy.rateBasis;
  delete payrollPolicy.standardMonthMinutes;
  delete legacy.workProjects;
  const records = legacy.records as Record<string, Record<string, unknown>>;
  delete records["2026-08-19"].activitySegments;

  const result = migrateAppData({ schemaVersion: 17, data: legacy });

  assert.equal(result.fromVersion, 17);
  assert.equal(result.toVersion, APP_DATA_SCHEMA_VERSION);
  assert.equal(APP_DATA_SCHEMA_VERSION, 21);
  assert.equal(result.migrated, true);
  assert.equal(result.data.settings.name, "Release migration user");
  assert.equal(result.data.settings.workTimingMode, "scheduled");
  assert.equal(result.data.settings.notificationSettings.quietHours.enabled, false);
  assert.equal(result.data.settings.notificationSettings.customReminders.length, 0);
  assert.equal(result.data.settings.payrollPolicy.rateBasis, "standard-month");
  assert.deepEqual(result.data.workProjects, []);
  assert.deepEqual(result.data.records["2026-08-19"].activitySegments, []);
  assert.equal(result.data.clients[0].name, "Legacy client");
  assert.equal(result.data.projects[0].name, "Legacy project");
});

test("Phase 200 final hardening device transfer keeps local conflicts and adds incoming v21 context", () => {
  const local = createInitialData({ onboarded: true });
  const incoming = createInitialData({ onboarded: true });
  local.settings.name = "Laptop";
  incoming.settings.name = "Phone";
  local.workProjects.push({ id: "local-work", name: "Local only", status: "active", createdAt: "2026-08-19T08:00:00.000Z" });
  incoming.workProjects.push({ id: "incoming-work", name: "Incoming only", status: "active", createdAt: "2026-08-19T09:00:00.000Z" });
  local.records["2026-08-19"] = makeWorkRecord({ date: "2026-08-19", note: "keep local" });
  incoming.records["2026-08-19"] = makeWorkRecord({ date: "2026-08-19", note: "incoming conflict" });
  incoming.records["2026-08-20"] = makeWorkRecord({ date: "2026-08-20", note: "incoming addition" });

  const merged = applyDeviceTransfer(local, incoming, { mode: "merge", conflicts: "keep-local" });

  assert.equal(merged.settings.name, "Laptop");
  assert.equal(merged.records["2026-08-19"].note, "keep local");
  assert.equal(merged.records["2026-08-20"].note, "incoming addition");
  assert.deepEqual(merged.workProjects.map((project) => project.id).sort(), ["incoming-work", "local-work"]);
});

test("Phase 200 final hardening source and Vercel deployment audits are green", async () => {
  const [hardening, vercel] = await Promise.all([
    inspectReleaseHardening(),
    inspectVercelStaticExportContract(),
  ]);

  assert.equal(hardening.ok, true, hardening.failures.join("\n"));
  assert.equal(vercel.ok, true, vercel.failures.join("\n"));
  assert.ok(hardening.scannedFiles > 0);
  assert.equal(vercel.securityHeaders["x-content-type-options"], "nosniff");
  assert.equal(vercel.securityHeaders["permissions-policy"], "camera=(self), microphone=(), geolocation=()");
});
