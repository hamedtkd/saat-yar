import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("settings navigation performs section scrolling", async () => {
  const source = await read("components/pages/settings/settings-nav.tsx");
  assert.match(source, /scrollIntoView/);
  assert.match(source, /settings-work/);
});

test("month day edit keeps the selected date", async () => {
  const source = await read("components/pages/month/month-day-details.tsx");
  assert.match(source, /\/today\?date=\$\{selectedDate\}/);
});

test("shell normalizes trailing slashes and persists the last route", async () => {
  const source = await read("components/saatyar-shell.tsx");
  assert.match(source, /replace\(\/\\\/\+\$\//);
  assert.match(source, /saatyar:last-route/);
  assert.match(source, /searchParams\.get\("date"\)/);
});

test("weekly target and checkbox visuals are editable and compact", async () => {
  const work = await read("components/pages/settings/work-settings-card.tsx");
  const checkbox = await read("components/ui/checkbox.tsx");
  assert.match(work, /setWeeklyTargetHours/);
  assert.match(checkbox, /size-2\.5/);
});
