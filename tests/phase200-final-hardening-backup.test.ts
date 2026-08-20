import assert from "node:assert/strict";
import test from "node:test";
import { createBackupEnvelope, parseBackupEnvelope } from "../lib/backup-workflow.ts";
import { createInitialData } from "../lib/constants.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

test("Phase 200 final hardening backup round-trip preserves v21 work-project and activity context", () => {
  const source = createInitialData({ onboarded: true });
  source.workProjects.push({ id: "work-1", name: "Release hardening", status: "active", createdAt: "2026-08-19T08:00:00.000Z" });
  source.records["2026-08-19"] = makeWorkRecord({
    date: "2026-08-19",
    activitySegments: [
      {
        id: "activity-1",
        kind: "deep-work",
        title: "Final release audit",
        start: "08:00",
        end: "09:15",
        startedAt: "2026-08-19T08:00:00.000Z",
        endedAt: "2026-08-19T09:15:00.000Z",
        workProjectId: "work-1",
      },
    ],
  });

  const restored = parseBackupEnvelope(createBackupEnvelope(source, "2026-08-19T12:00:00.000Z"));

  assert.equal(restored.workProjects[0].name, "Release hardening");
  assert.equal(restored.records["2026-08-19"].activitySegments[0].title, "Final release audit");
  assert.equal(restored.records["2026-08-19"].activitySegments[0].workProjectId, "work-1");
});
