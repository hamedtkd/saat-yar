import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { durationSeconds } from "../lib/format.ts";
import { runtimeClockDelay } from "../lib/runtime-clock.ts";
import { calcLive, liveWorkedSeconds } from "../lib/time-engine.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("runtime clock aligns second and minute cadence without a drifting counter", () => {
  assert.equal(runtimeClockDelay(10_250, "second"), 770);
  assert.equal(runtimeClockDelay(61_000, "minute"), 59_020);
});

test("live duration renders a Persian hours minutes seconds clock", () => {
  assert.equal(durationSeconds(3_661), "۱:۰۱:۰۱");
  assert.equal(durationSeconds(-20), "۰:۰۰:۰۰");
});

test("live work starts immediately and does not subtract planned lunch before lunch begins", () => {
  const record = makeWorkRecord({
    start: "10:00",
    end: "",
    startedAt: "2026-08-09T10:00:00.000Z",
    lunchMinutes: 45,
  });
  assert.equal(liveWorkedSeconds(record, new Date("2026-08-09T10:00:05.000Z")), 5);
});

test("live work subtracts actual unpaid lunch and breaks but keeps paid breaks", () => {
  const record = makeWorkRecord({
    start: "10:00",
    end: "",
    startedAt: "2026-08-09T10:00:00.000Z",
    lunchMinutes: 45,
    lunchStart: "10:03",
    lunchEnd: "10:05",
    lunchStartedAt: "2026-08-09T10:03:00.000Z",
    lunchEndedAt: "2026-08-09T10:05:00.000Z",
    breaks: [
      { id: "unpaid", title: "وقفه", start: "10:06", end: "10:07", startedAt: "2026-08-09T10:06:00.000Z", endedAt: "2026-08-09T10:07:00.000Z" },
      { id: "paid", title: "جلسه", start: "10:07", end: "10:08", startedAt: "2026-08-09T10:07:00.000Z", endedAt: "2026-08-09T10:08:00.000Z", paid: true },
    ],
  });
  assert.equal(liveWorkedSeconds(record, new Date("2026-08-09T10:10:00.000Z")), 420);
});

test("live calculation refreshes open worked credit without changing the historical calc contract", () => {
  const record = makeWorkRecord({
    start: "10:00",
    end: "",
    startedAt: "2026-08-09T10:00:00.000Z",
    lunchMinutes: 45,
  });
  const live = calcLive(record, 480, new Date("2026-08-09T10:01:59.000Z"));
  assert.equal(live.worked, 1);
  assert.equal(live.credited, 1);
  assert.equal(live.target, 480);
  assert.equal(live.balance, -479);
});

test("runtime scheduler is shared visibility-aware and uses timeout instead of interval", async () => {
  const [clock, hook] = await Promise.all([read("lib/runtime-clock.ts"), read("hooks/use-runtime-now.ts")]);
  assert.match(clock, /const entries = new Set<RuntimeClockEntry>/);
  assert.match(clock, /window\.setTimeout/);
  assert.doesNotMatch(clock, /setInterval/);
  assert.match(clock, /document\.visibilityState !== "visible"/);
  assert.match(clock, /visibilitychange/);
  assert.match(clock, /window\.addEventListener\("focus"/);
  assert.match(clock, /window\.addEventListener\("pageshow"/);
  assert.match(clock, /clearTimer\(\)/);
  assert.match(hook, /useSyncExternalStore/);
});

test("live surfaces share second and minute cadences instead of owning local timers", async () => {
  const [duration, workDuration, focus, summary, metrics, timeline, detail, list] = await Promise.all([
    read("components/common/live-duration.tsx"),
    read("components/common/live-work-duration.tsx"),
    read("components/pages/today/today-focus-card.tsx"),
    read("components/pages/today/today-smart-summary.tsx"),
    read("components/pages/today/today-metrics.tsx"),
    read("components/pages/today/today-timeline.tsx"),
    read("components/pages/projects/detail/use-project-detail.ts"),
    read("components/pages/projects/project-list.tsx"),
  ]);
  assert.match(duration, /useRuntimeNow\("second"/);
  assert.match(workDuration, /useRuntimeNow\("second"/);
  assert.match(focus, /data-live-work-duration|LiveWorkDuration/);
  assert.match(focus, /motion-safe:animate-pulse/);
  assert.match(summary, /useLiveWorkCalc/);
  assert.match(metrics, /useRuntimeNow\("minute"/);
  assert.match(timeline, /useRuntimeNow\("minute"/);
  assert.match(detail, /useRuntimeNow\("minute"/);
  assert.match(list, /useRuntimeNow\("minute"/);
  assert.doesNotMatch([summary, metrics, timeline, detail, list].join("\n"), /setInterval/);
});

test("Phase 172 is documented, browser-covered and moves personalized onboarding to Phase 173", async () => {
  const [smoke, roadmap, notes, phase171, docs, pkg] = await Promise.all([
    read("scripts/employee-browser-ux-smoke.mjs"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/phases/PHASE_172_NOTES_FA.md"),
    read("docs/phases/PHASE_171_NOTES_FA.md"),
    read("docs/README.md"),
    read("package.json"),
  ]);
  assert.match(smoke, /Active employee work clock advances live without a reload/);
  assert.match(roadmap, /\[x\] فاز ۱۷۲: Live Runtime Clock & Low-Power Refresh/);
  assert.match(roadmap, /\[x\] فاز ۱۷۳: Onboarding شخصی‌شده/);
  assert.match(roadmap, /\[x\] فاز ۱۷۴:.*i18n/);
  assert.match(roadmap, /\[ \] فاز ۱۷۵:/);
  assert.match(notes, /visibilitychange/);
  assert.match(notes, /هیچ Tick زمان، IndexedDB، BroadcastChannel، Network، Service Worker یا Heartbeat را نمی‌نویسد/);
  assert.match(phase171, /آنبوردینگ شخصی‌شده فاز ۱۷۳/);
  assert.match(docs, /PHASE_172_NOTES_FA\.md/);
  assert.match(pkg, /phase172-live-runtime-clock\.test\.ts/);
});
