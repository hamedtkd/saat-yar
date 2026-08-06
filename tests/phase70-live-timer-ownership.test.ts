import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  createLiveTimerLock, isLiveTimerLockFresh, isOwnedByAnotherTab, parseLiveTimerLock,
} from "../lib/live-timer-lock.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("live timer lock expires and distinguishes the owning tab", () => {
  const lock = createLiveTimerLock("tab-a", new Date("2026-08-06T10:00:00.000Z"));
  assert.equal(isLiveTimerLockFresh(lock, new Date("2026-08-06T10:00:30.000Z").getTime()), true);
  assert.equal(isLiveTimerLockFresh(lock, new Date("2026-08-06T10:01:00.000Z").getTime()), false);
  assert.equal(isOwnedByAnotherTab(lock, "tab-b", new Date("2026-08-06T10:00:30.000Z").getTime()), true);
  assert.equal(isOwnedByAnotherTab(lock, "tab-a", new Date("2026-08-06T10:00:30.000Z").getTime()), false);
});

test("invalid live timer locks are rejected", () => {
  assert.equal(parseLiveTimerLock(null), null);
  assert.equal(parseLiveTimerLock("not-json"), null);
  assert.equal(parseLiveTimerLock('{"tabId":"a","updatedAt":"bad"}'), null);
});

test("timer ownership hook coordinates local storage and BroadcastChannel", async () => {
  const source = await read("hooks/use-live-timer-ownership.ts");
  assert.match(source, /new BroadcastChannel\(LIVE_TIMER_CHANNEL\)/);
  assert.match(source, /window\.localStorage\.setItem\(LIVE_TIMER_LOCK_KEY/);
  assert.match(source, /window\.setInterval\(publish, LIVE_TIMER_HEARTBEAT_MS\)/);
  assert.match(source, /blocked \|\| !ensureOwnership\(\)/);
  assert.match(source, /takeOver/);
});

test("all live attendance and project timer actions require ownership", async () => {
  const attendance = await read("hooks/controller/use-attendance-actions.ts");
  const business = await read("hooks/controller/use-business-actions.ts");
  for (const action of ["startWork", "finishWork", "startLunch", "finishLunch", "startBreak", "finishBreak"]) {
    const start = attendance.indexOf(`function ${action}`);
    assert.notEqual(start, -1, `${action} must exist`);
    assert.match(attendance.slice(start, start + 220), /ensureLiveTimerOwnership\(\)/);
  }
  assert.match(business, /function toggleProjectTimer[\s\S]*ensureLiveTimerOwnership\(\)/);
});

test("shell warns about another tab and offers explicit takeover", async () => {
  const shell = await read("components/saatyar-shell.tsx");
  const banner = await read("components/layout/live-timer-ownership-banner.tsx");
  assert.match(shell, /LiveTimerOwnershipBanner/);
  assert.match(shell, /controller\.liveTimerOwnership\.blocked/);
  assert.match(banner, /کنترل تایمر در تب دیگری فعال است/);
  assert.match(banner, /انتقال کنترل به این تب/);
});
