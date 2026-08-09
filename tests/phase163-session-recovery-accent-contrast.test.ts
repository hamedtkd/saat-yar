import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { calc } from "../lib/time-engine.ts";
import { accentFill, resolveAccentTokens, themePresets } from "../lib/theme.ts";
import { resumeAutoClosedRecord } from "../lib/session-close.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("cyan and ocean filled controls use accessible white foregrounds", () => {
  assert.equal(accentFill(themePresets.spotify), "#0e7490");
  assert.equal(accentFill(themePresets.ocean), "#0369a1");
  assert.equal(resolveAccentTokens(themePresets.spotify, "light").foreground, "#ffffff");
  assert.equal(resolveAccentTokens(themePresets.ocean, "light").foreground, "#ffffff");
});

test("filled interactive surfaces use the dedicated accent fill token", async () => {
  const files = [
    "components/ui/button.tsx",
    "components/ui/checkbox.tsx",
    "components/layout/navigation/sidebar-nav.tsx",
    "components/pickers/jalali-date-picker/date-picker-dialog.tsx",
  ];
  for (const file of files) {
    const source = await read(file);
    assert.match(source, /var\(--accent-fill\)/);
  }
  const runtime = await read("components/theme/theme-runtime.tsx");
  const bootstrap = await read("components/theme/theme-bootstrap.tsx");
  assert.match(runtime, /--accent-fill/);
  assert.match(bootstrap, /--accent-fill/);
});

test("resuming an auto-closed current session reopens work and records the gap as unpaid", () => {
  const closedAt = new Date(2026, 7, 9, 9, 15, 0);
  const resumedAt = new Date(2026, 7, 9, 9, 30, 0);
  const record = makeWorkRecord({
    date: "2026-08-09",
    start: "07:30",
    end: "09:15",
    lunchMinutes: 0,
    needsReview: true,
    autoClosedAt: closedAt.toISOString(),
    autoClosedReason: "stale-session",
  });
  const resumed = resumeAutoClosedRecord(record, resumedAt);
  assert.equal(resumed.end, "");
  assert.equal(resumed.endedAt, undefined);
  assert.equal(resumed.needsReview, false);
  assert.equal(resumed.breaks.length, 1);
  assert.equal(resumed.breaks[0].paid, false);
  assert.equal(resumed.breaks[0].startedAt, closedAt.toISOString());
  assert.equal(resumed.breaks[0].endedAt, resumedAt.toISOString());
});

test("recovery gap does not inflate worked time after resume", () => {
  const closedAt = new Date(2026, 7, 9, 9, 15, 0);
  const resumedAt = new Date(2026, 7, 9, 9, 30, 0);
  const now = new Date(2026, 7, 9, 10, 0, 0);
  const record = makeWorkRecord({
    date: "2026-08-09",
    start: "07:30",
    end: "09:15",
    lunchMinutes: 0,
    needsReview: true,
    autoClosedAt: closedAt.toISOString(),
    autoClosedReason: "page-exit",
  });
  const resumed = resumeAutoClosedRecord(record, resumedAt);
  assert.equal(calc(resumed, 480, now).grossMinutes, 150);
  assert.equal(calc(resumed, 480, now).unpaidBreakMinutes, 15);
  assert.equal(calc(resumed, 480, now).worked, 135);
});

test("normal reload relies on heartbeat recovery instead of forcing a page-exit close", async () => {
  const source = await read("hooks/use-persisted-app-data.ts");
  assert.doesNotMatch(source, /createPendingClose/);
  assert.match(source, /setInterval\(writeHeartbeat, SESSION_HEARTBEAT_INTERVAL_MS\)/);
  assert.match(source, /addEventListener\("pagehide", writeHeartbeat\)/);
  assert.match(source, /saveState !== "saving"/);
});

test("today exposes resume beside historical edit for an auto-closed current day", async () => {
  const editor = await read("components/pages/today/completed-day-editor.tsx");
  const route = await read("app/today/page.tsx");
  const actions = await read("hooks/controller/use-attendance-actions.ts");
  assert.match(editor, /canResume/);
  assert.match(editor, /resumeAutoClosedWork/);
  assert.match(route, /resumeAutoClosedWork=\{controller\.resumeAutoClosedWork\}/);
  assert.match(actions, /resumeAutoClosedRecord/);
  assert.match(actions, /selectedDate !== localDateKey\(\)/);
});
