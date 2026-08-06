import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { initialData } from "../lib/constants.ts";
import { applyStaleHeartbeat, createSessionHeartbeat } from "../lib/session-close.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const openRecord = () => makeWorkRecord({
  date: "2026-08-06",
  start: "07:40",
  end: "",
  lunchMinutes: 45,
});

test("stale heartbeat closes an open work session at the last active time", () => {
  const record = openRecord();
  const heartbeat = createSessionHeartbeat("2026-08-06", record, new Date("2026-08-06T16:00:00"));
  assert.ok(heartbeat);
  const next = applyStaleHeartbeat(
    { ...initialData, records: { "2026-08-06": record } },
    heartbeat!,
    new Date("2026-08-06T16:03:00"),
  );
  assert.equal(next.records["2026-08-06"].end, "16:00");
  assert.equal(next.records["2026-08-06"].autoClosedReason, "stale-session");
  assert.equal(next.records["2026-08-06"].needsReview, true);
});

test("recent heartbeat does not close a session during a normal reload", () => {
  const record = openRecord();
  const heartbeat = createSessionHeartbeat("2026-08-06", record, new Date("2026-08-06T16:00:00"));
  const data = { ...initialData, records: { "2026-08-06": record } };
  assert.equal(applyStaleHeartbeat(data, heartbeat!, new Date("2026-08-06T16:00:30")), data);
});

test("lunch start picker remounts when the timer writes the current time", async () => {
  const source = await readFile(new URL("../components/pages/today/time-strip/lunch-editor.tsx", import.meta.url), "utf8");
  assert.match(source, /key={`lunch-start-\$\{record\.lunchStart \?\? "empty"\}`}/);
  assert.match(source, /value={record\.lunchStart \?\? ""}/);
});

test("persistence writes heartbeat periodically and on page hide", async () => {
  const source = await readFile(new URL("../hooks/use-persisted-app-data.ts", import.meta.url), "utf8");
  assert.match(source, /setInterval\(writeHeartbeat, SESSION_HEARTBEAT_INTERVAL_MS\)/);
  assert.match(source, /addEventListener\("pagehide", writeHeartbeat\)/);
  assert.match(source, /visibilitychange/);
});
