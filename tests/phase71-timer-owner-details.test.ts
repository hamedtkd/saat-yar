import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  createLiveTimerLock, describeTimerDevice, formatTimerHeartbeat, parseLiveTimerLock,
} from "../lib/live-timer-lock.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("timer locks preserve privacy-safe device information", () => {
  const name = describeTimerDevice("Mozilla/5.0 (Windows NT 10.0) Chrome/140.0", "Win32");
  assert.equal(name, "Chrome روی Windows");
  const lock = createLiveTimerLock("tab-a", new Date("2026-08-06T10:00:00.000Z"), name);
  assert.equal(parseLiveTimerLock(JSON.stringify(lock))?.deviceName, name);
});

test("heartbeat age is presented in a readable relative format", () => {
  const now = new Date("2026-08-06T10:00:30.000Z").getTime();
  assert.equal(formatTimerHeartbeat("2026-08-06T10:00:30.000Z", now), "همین حالا");
  assert.equal(formatTimerHeartbeat("2026-08-06T10:00:18.000Z", now), "۱۲ ثانیه پیش");
  assert.equal(formatTimerHeartbeat("2026-08-06T09:58:00.000Z", now), "۲ دقیقه پیش");
  assert.equal(formatTimerHeartbeat("2026-08-06T10:00:18.000Z", now, "en"), "12 seconds ago");
});

test("ownership hook exposes the remote owner and publishes device details", async () => {
  const source = await read("hooks/use-live-timer-ownership.ts");
  assert.match(source, /describeTimerDevice\(window\.navigator\.userAgent/);
  assert.match(source, /window\.navigator\.platform, locale/);
  assert.match(source, /const \[owner, setOwner\]/);
  assert.match(source, /return \{ blocked, owner, ensureOwnership, takeOver \}/);
});

test("takeover confirmation shows device and last heartbeat", async () => {
  const banner = await read("components/layout/live-timer-ownership-banner.tsx");
  const shell = await read("components/saatyar-shell.tsx");
  assert.match(banner, /AlertDialog/);
  assert.match(banner, /last heartbeat was/);
  assert.match(banner, /Yes, transfer control/);
  assert.doesNotMatch(banner, /[\u0600-\u06FF]/);
  assert.match(banner, /owner\.deviceName/);
  assert.match(shell, /owner=\{controller\.liveTimerOwnership\.owner\}/);
});
