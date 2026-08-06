import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createInitialData } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { parseTimeInput } from "../components/pickers/time-picker/time-utils.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("onboarding follows theme tokens and submits steps with Enter", async () => {
  const onboarding = await read("components/layout/onboarding.tsx");
  assert.match(onboarding, /bg-\[var\(--page\)\]/);
  assert.match(onboarding, /<form onSubmit=\{submitStep\}/);
  assert.doesNotMatch(onboarding, /bg-\[#|text-\[#|border-\[#/);
  const footer = await read("components/layout/onboarding/onboarding-footer.tsx");
  assert.match(footer, /type="submit"/);
});

test("smart time input accepts Persian and compact values with Persian errors", () => {
  assert.deepEqual(parseTimeInput("8"), { valid: true, value: "08:00" });
  assert.deepEqual(parseTimeInput("8:3"), { valid: true, value: "08:03" });
  assert.deepEqual(parseTimeInput("۰۸:۳۰"), { valid: true, value: "08:30" });
  assert.equal(parseTimeInput("25:10").valid, false);
  assert.equal(parseTimeInput("09:70").valid, false);
  const invalid = parseTimeInput("");
  assert.equal(invalid.valid, false);
  if (!invalid.valid) assert.match(invalid.error, /لطفاً/);
});

test("current schema persists configurable break reminders", () => {
  assert.equal(APP_DATA_SCHEMA_VERSION, 15);
  const current = createInitialData({ onboarded: true });
  assert.deepEqual(current.settings.notificationSettings.breakReminder, {
    enabled: false,
    intervalMinutes: 60,
    onlyWhenTracking: true,
  });

  const legacy = structuredClone(current) as unknown as Record<string, unknown>;
  const settings = (legacy.settings ?? {}) as Record<string, unknown>;
  const notifications = settings.notificationSettings as Record<string, unknown>;
  delete notifications.breakReminder;
  const migrated = migrateAppData({ schemaVersion: 13, data: legacy });
  assert.equal(migrated.data.settings.notificationSettings.breakReminder.intervalMinutes, 60);
});

test("notification settings and runtime include break reminder controls", async () => {
  const card = await read("components/pages/settings/notification-settings-card.tsx");
  const hook = await read("hooks/controller/use-notification-reminders.ts");
  assert.match(card, /یادآوری استراحت/);
  assert.match(card, /intervalMinutes/);
  assert.match(hook, /وقت یک استراحت کوتاهه/);
  assert.match(hook, /break-\$\{bucket\}/);
});
