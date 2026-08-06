import test from "node:test";
import assert from "node:assert/strict";
import { calc } from "../lib/time-engine.ts";
import { applyPendingClose, createPendingClose } from "../lib/session-close.ts";
import { initialData } from "../lib/constants.ts";
import { emptyRecord } from "../lib/format.ts";

test("manual clock edits ignore stale timestamp spans", () => {
  const record = { ...emptyRecord("2026-08-06", initialData.settings), start: "07:40", end: "16:00", startedAt: "2026-07-30T04:10:00.000Z", endedAt: "2026-08-06T12:30:00.000Z", manuallyEdited: true };
  assert.equal(calc(record, 480, new Date("2026-08-06T16:00:00")).grossMinutes, 500);
});

test("open record receives an auto close review state", () => {
  const record = { ...emptyRecord("2026-08-06", initialData.settings), start: "07:40", startedAt: "2026-08-06T04:10:00.000Z" };
  const pending = createPendingClose("2026-08-06", record, new Date("2026-08-06T16:00:00"));
  assert.ok(pending);
  const next = applyPendingClose({ ...initialData, records: { "2026-08-06": record } }, pending!);
  assert.equal(next.records["2026-08-06"].needsReview, true);
  assert.equal(next.records["2026-08-06"].end, "16:00");
});
