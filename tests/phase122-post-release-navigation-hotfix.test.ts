import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("settings navigation is external-store driven instead of effect-driven state", async () => {
  const nav = await read("components/pages/settings/settings-nav.tsx");
  assert.match(nav, /useSyncExternalStore/);
  assert.match(nav, /subscribeToSettingsPosition/);
  assert.match(nav, /getVisibleSettingsItem/);
  assert.match(nav, /replaceSettingsHash/);
  assert.doesNotMatch(nav, /useState<SettingsItemId>/);
  const effectBody = nav.match(/useEffect\(\(\) => \{([\s\S]*?)\n  \}, \[\]\);/)?.[1] ?? "";
  assert.doesNotMatch(effectBody, /set[A-Z][A-Za-z0-9_]*\(/);
});

test("profile deep links to settings remain protected by the unsaved navigation guard", async () => {
  const [header, profile] = await Promise.all([
    read("components/layout/app-header.tsx"),
    read("components/layout/app-header/profile-menu.tsx"),
  ]);
  assert.match(header, /requestNavigation\(\(\) => router\.push\(href\)\)/);
  assert.match(profile, /onNavigate/);
  assert.match(profile, /\/settings\/profile#settings-profile/);
  assert.match(profile, /\/settings\/sync#settings-device-transfer/);
});

test("phase 122 hotfix is wired into the main quality command", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts.test, /tests\/phase122-post-release-navigation-hotfix\.test\.ts/);
});
