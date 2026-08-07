import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("settings navigation uses a typed detailed section id", async () => {
  const [source, model] = await Promise.all([
    read("components/pages/settings/settings-nav.tsx"),
    read("components/pages/settings/settings-navigation-model.ts"),
  ]);
  assert.match(source, /type SettingsItemId = \(typeof settingsNavItems\)\[number\]\["id"\]/);
  assert.match(source, /useSyncExternalStore\(subscribeToSettingsPosition, getVisibleSettingsItem/);
  assert.match(source, /navigateTo = \(id: SettingsItemId\)/);
  assert.match(model, /settings-device-transfer/);
});

test("settings sections expose real scroll anchors", async () => {
  const source = await read("components/pages/settings/settings-page.tsx");
  for (const id of ["settings-data", "settings-general", "settings-work", "settings-about"]) {
    assert.match(source, new RegExp(`<span id="${id}"`));
  }
  assert.doesNotMatch(source, /id="settings-(?:data|general|work|about)" className="contents/);
});

test("settings section hash survives reload", async () => {
  const source = await read("components/pages/settings/settings-nav.tsx");
  assert.match(source, /window\.location\.hash/);
  assert.match(source, /history\.replaceState/);
  assert.match(source, /resolveSettingsNavItem/);
});
