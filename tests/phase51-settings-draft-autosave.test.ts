import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { initialData } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("schema v16 preserves settings autosave to off", () => {
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
  assert.equal(initialData.settings.autoSaveSettings, false);
  const legacy = { schemaVersion: 14, data: initialData };
  const result = migrateAppData(legacy);
  assert.equal(result.data.settings.autoSaveSettings, false);
});

test("settings draft hook avoids effect-driven state syncing", async () => {
  const hook = await read("hooks/settings/use-settings-draft.ts");
  assert.doesNotMatch(hook, /useEffect\([\s\S]*?set(?:Editing|LocalDraft)\(/);
  assert.match(hook, /registerSettingsDraft/);
  assert.match(hook, /beginEdit/);
  assert.match(hook, /dirty/);
  assert.match(hook, /const prepared = prepare \? prepare\(localDraft\) : localDraft/);
  assert.match(hook, /onSave\(prepared\)/);
});

test("notification settings use edit save and cancel actions", async () => {
  const card = await read("components/pages/settings/notification-settings-card.tsx");
  assert.match(card, /EditableCardActions/);
  assert.match(card, /useSettingsDraft/);
  assert.match(card, /fieldset disabled=\{!canEdit\}/);
  assert.match(card, /s\("Notification settings were saved"\)/);
});

test("general settings expose optional autosave control", async () => {
  const card = await read("components/pages/settings/settings-behavior-card.tsx");
  assert.match(card, /autoSaveSettings/);
  assert.match(card, /s\("Automatically save settings changes"\)/);
  assert.match(card, /s\("Off by default\. This control always changes with an explicit save\. In manual mode, each card has its own draft; in automatic mode, valid changes are saved immediately\."\)/);
});
