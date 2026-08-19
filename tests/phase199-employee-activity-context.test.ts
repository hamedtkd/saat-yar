import assert from "node:assert/strict";
import test from "node:test";

import {
  activitySegmentMinutes,
  createActivitySegment,
  getRecentActivityTitleSuggestions,
  normalizeActivityTitle,
} from "../lib/activity-segments.ts";
import { getActivityProjectOptions, resolveActivityProjectName } from "../lib/activity-project-context.ts";
import { calendarEventToActivitySegment } from "../lib/calendar-integration/activity-import.ts";
import type { ExternalCalendarEvent } from "../lib/calendar-integration/types.ts";
import { createInitialData } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { normaliseData } from "../lib/data/normalise.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { mergeAppData } from "../lib/data/merge-app-data.ts";
import { emptyRecord } from "../lib/format.ts";
import { createWorkProject, isDuplicateWorkProjectName } from "../lib/work-projects.ts";

function calendarEvent(title: string): ExternalCalendarEvent {
  return {
    provider: "google",
    calendarId: "primary",
    calendarName: "Work",
    id: "event-1",
    title,
    kind: "meeting",
    allDay: false,
    start: "2026-08-19T09:00:00.000Z",
    end: "2026-08-19T10:00:00.000Z",
    startDateKey: "2026-08-19",
    endDateKey: "2026-08-19",
    editable: true,
  };
}

test("Phase 199 keeps development AppData on v21", () => {
  assert.equal(APP_DATA_SCHEMA_VERSION, 21);
});

test("Phase 199 migrates v20 with an empty employee work-project collection", () => {
  const data = createInitialData({ onboarded: true });
  const record = emptyRecord("2026-08-19", data.settings);
  record.activitySegments = [{
    id: "legacy",
    kind: "deep-work",
    start: "09:00",
    end: "10:00",
    startedAt: "2026-08-19T09:00:00.000Z",
    endedAt: "2026-08-19T10:00:00.000Z",
  }];
  data.records[record.date] = record;
  const legacy = { ...data } as Record<string, unknown>;
  delete legacy.workProjects;

  const migrated = migrateAppData({ schemaVersion: 20, data: legacy }).data;
  assert.deepEqual(migrated.workProjects, []);
  assert.equal(migrated.records[record.date].activitySegments[0].title, undefined);
});


test("Phase 199 repairs the transitional R1 v21 shape when workProjects is missing", () => {
  const current = createInitialData({ onboarded: true }) as unknown as Record<string, unknown>;
  delete current.workProjects;
  const repaired = migrateAppData({ schemaVersion: 21, data: current }).data;
  assert.deepEqual(repaired.workProjects, []);
});

test("Phase 199 backup-safe merge preserves independent work projects", () => {
  const local = createInitialData({ onboarded: true });
  const incoming = createInitialData({ onboarded: true });
  local.workProjects = [{ id: "local-work", name: "Internal Platform", status: "active", createdAt: "2026-08-19T09:00:00.000Z" }];
  incoming.workProjects = [{ id: "incoming-work", name: "Migration", status: "active", createdAt: "2026-08-19T10:00:00.000Z" }];
  const merged = mergeAppData(local, incoming);
  assert.deepEqual(merged.workProjects.map((item) => item.id), ["local-work", "incoming-work"]);
});



test("Phase 199 normalises employee work-project status into the typed active/archive contract", () => {
  const data = createInitialData({ onboarded: true });
  (data.workProjects as unknown as Array<Record<string, unknown>>).push({
    id: "work-invalid-status",
    name: "  Internal Ops  ",
    status: "paused",
    createdAt: "",
  });
  const normalised = normaliseData(data, data.settings);
  assert.deepEqual(normalised.workProjects, [{
    id: "work-invalid-status",
    name: "Internal Ops",
    status: "active",
    createdAt: new Date(0).toISOString(),
  }]);
});

test("Phase 199 creates a bounded employee work project independently from freelance projects", () => {
  const project = createWorkProject({ id: "work-1", name: "  Internal   Platform  ", createdAt: "2026-08-19T09:00:00.000Z" });
  assert.equal(project?.name, "Internal Platform");
  assert.equal(project?.status, "active");
  assert.equal(isDuplicateWorkProjectName(project ? [project] : [], "internal platform"), true);
});

test("Phase 199 persists a bounded normalized activity title with work-project context", () => {
  const segment = createActivitySegment({
    id: "new",
    kind: "deep-work",
    title: `  Refactor   login ${"x".repeat(200)}  `,
    workProjectId: "work-1",
    start: "09:00",
    startedAt: "2026-08-19T09:00:00.000Z",
  });
  assert.equal(segment.title, normalizeActivityTitle(segment.title));
  assert.equal(segment.title?.includes("  "), false);
  assert.ok((segment.title?.length ?? 0) <= 120);
  assert.equal(segment.workProjectId, "work-1");
  assert.equal(segment.projectId, undefined);
});

test("Phase 199 title metadata does not change worked duration", () => {
  const untitled = {
    id: "a",
    kind: "meeting" as const,
    start: "09:00",
    end: "10:15",
    startedAt: "2026-08-19T09:00:00.000Z",
    endedAt: "2026-08-19T10:15:00.000Z",
  };
  assert.equal(activitySegmentMinutes(untitled), activitySegmentMinutes({ ...untitled, title: "Sprint review" }));
});

test("Phase 199 allows non-project activity kinds to carry employee work-project context", () => {
  const deepWork = createActivitySegment({ id: "d", kind: "deep-work", workProjectId: "w1", start: "09:00", startedAt: "2026-08-19T09:00:00.000Z" });
  const meeting = createActivitySegment({ id: "m", kind: "meeting", workProjectId: "w1", start: "10:00", startedAt: "2026-08-19T10:00:00.000Z" });
  const hybridFreelance = createActivitySegment({ id: "h", kind: "meeting", projectId: "p1", start: "11:00", startedAt: "2026-08-19T11:00:00.000Z" });
  assert.equal(deepWork.workProjectId, "w1");
  assert.equal(meeting.workProjectId, "w1");
  assert.equal(hybridFreelance.projectId, "p1");
});


test("Phase 199 keeps employee work projects isolated while hybrid can see both contexts", () => {
  const work = [{ id: "work-1", name: "Internal Platform", status: "active" as const, createdAt: "2026-08-19T09:00:00.000Z" }];
  const freelance = [{ id: "freelance-1", clientId: "client-1", name: "Client Dashboard", rate: 100, color: "#000", status: "active" as const }];
  assert.deepEqual(getActivityProjectOptions("employee", work, freelance), [{ source: "work", id: "work-1", name: "Internal Platform" }]);
  assert.deepEqual(getActivityProjectOptions("hybrid", work, freelance).map((item) => item.source), ["work", "freelance"]);
  const legacyFreelanceSegment = createActivitySegment({ id: "legacy-freelance", kind: "deep-work", projectId: "freelance-1", start: "09:00", startedAt: "2026-08-19T09:00:00.000Z" });
  assert.equal(resolveActivityProjectName(legacyFreelanceSegment, "employee", work, freelance), undefined);
  assert.equal(resolveActivityProjectName(legacyFreelanceSegment, "hybrid", work, freelance), "Client Dashboard");
});

test("Phase 199 recent work-item suggestions deduplicate newest first", () => {
  const data = createInitialData({ onboarded: true });
  const older = emptyRecord("2026-08-18", data.settings);
  older.activitySegments = [
    { id: "1", kind: "deep-work", title: "Login refactor", start: "09:00", end: "10:00" },
    { id: "2", kind: "meeting", title: "Sprint sync", start: "10:00", end: "11:00" },
  ];
  const newer = emptyRecord("2026-08-19", data.settings);
  newer.activitySegments = [
    { id: "3", kind: "meeting", title: "Login refactor", start: "09:00", end: "09:30" },
    { id: "4", kind: "deep-work", title: "Payment polish", start: "09:30", end: "10:30" },
  ];

  assert.deepEqual(getRecentActivityTitleSuggestions([older, newer]), ["Payment polish", "Login refactor", "Sprint sync"]);
});

test("Phase 199 calendar conversion keeps the event title as activity context", () => {
  const segment = calendarEventToActivitySegment(calendarEvent("Weekly Product Sync"), "meeting");
  assert.equal(segment.title, "Weekly Product Sync");
  assert.equal(segment.kind, "meeting");
});
