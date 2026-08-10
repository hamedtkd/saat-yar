import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { discardAllSettingsDrafts, hasUnsavedSettingsDrafts, registerSettingsDraft, saveAllSettingsDrafts } from "../lib/settings-draft-registry.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("settings draft registry saves and discards dirty cards", () => {
  let saved = 0;
  let discarded = 0;
  const unregister = registerSettingsDraft("phase61", {
    label: "کارت تست فاز ۶۱",
    dirty: true,
    save: () => { saved += 1; },
    discard: () => { discarded += 1; },
  });

  assert.equal(hasUnsavedSettingsDrafts(), true);
  saveAllSettingsDrafts();
  discardAllSettingsDrafts();
  assert.equal(saved, 1);
  assert.equal(discarded, 1);
  unregister();
  assert.equal(hasUnsavedSettingsDrafts(), false);
});

test("settings navigation guards dirty drafts with an accessible alert dialog", async () => {
  const nav = await read("components/pages/settings/settings-nav.tsx");
  const guard = await read("components/pages/settings/unsaved-settings-guard.tsx");
  const dialog = await read("components/ui/alert-dialog.tsx");

  assert.match(nav, /requestNavigation/);
  assert.match(guard, /beforeunload/);
  assert.match(guard, /s\("Save and continue"\)/);
  assert.match(guard, /s\("Continue without saving"\)/);
  assert.match(guard, /s\("Stay here"\)/);
  assert.match(dialog, /@radix-ui\/react-alert-dialog/);
  assert.match(dialog, /AlertDialogPrimitive\.Portal/);
  assert.match(dialog, /AlertDialogPrimitive\.Content/);
});

test("settings drafts register through the shared hook", async () => {
  const hook = await read("hooks/settings/use-settings-draft.ts");
  assert.match(hook, /registerSettingsDraft/);
  assert.match(hook, /useId/);
  assert.match(hook, /dirty: autoSave \? false : dirty/);
});

test("repository records the shadcn component policy and configuration", async () => {
  const config = await read("components.json");
  const agents = await read("AGENTS.md");
  assert.match(config, /"style": "new-york"/);
  assert.match(config, /"ui": "@\/components\/ui"/);
  assert.match(agents, /shadcn/i);
});
