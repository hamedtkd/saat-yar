import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

test("appearance defaults are preserved in the current schema", () => {
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
  assert.equal(defaultSettings.appearance.preset, "spotify");
  assert.equal(defaultSettings.appearance.mode, "system");
});

test("schema v11 data receives appearance settings", () => {
  const data = migrateAppData({ schemaVersion: 11, data: { settings: { ...defaultSettings, appearance: undefined }, records: {}, leaves: [], clients: [], projects: [], timeEntries: [], expenses: [], invoices: [], holidayOverrides: [] } }).data;
  assert.equal(data.settings.appearance.accent, "#06b6d4");
});

test("theme foundation uses runtime and design tokens", () => {
  const shell = readFileSync("components/saatyar-shell.tsx", "utf8");
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(shell, /ThemeRuntime/);
  assert.match(css, /--surface-1/);
  assert.match(css, /data-theme="dark"/);
});
