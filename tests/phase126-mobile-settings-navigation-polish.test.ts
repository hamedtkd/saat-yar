import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mobile bottom navigation uses one readable active capsule contract without underline", async () => {
  const mobile = await read("components/layout/navigation/mobile-bottom-nav.tsx");
  assert.match(mobile, /mobileNavCapsule/);
  assert.match(mobile, /ring-1 ring-\[color-mix/);
  assert.doesNotMatch(mobile, /absolute bottom-0\.5 h-0\.5 w-4/);
  assert.match(mobile, /<MoreHorizontal/);
  assert.match(mobile, /className=\{mobileNavCell\}/);
});

test("settings navigation exposes every important card including device transfer", async () => {
  const model = await read("components/pages/settings/settings-navigation-model.ts");
  for (const id of [
    "settings-profile", "settings-appearance", "settings-behavior", "settings-health", "settings-recycle",
    "settings-storage", "settings-recovery", "settings-backup", "settings-restore", "settings-device-transfer",
    "settings-work-schedule", "settings-holidays", "settings-payroll", "settings-payroll-components",
    "settings-notifications", "settings-danger",
  ]) {
    assert.match(model, new RegExp(id));
  }
});

test("settings active item follows scroll position and hash without effect-driven active state", async () => {
  const nav = await read("components/pages/settings/settings-nav.tsx");
  assert.match(nav, /getBoundingClientRect\(\)\.top/);
  assert.match(nav, /window\.addEventListener\("scroll", schedule/);
  assert.match(nav, /window\.addEventListener\("resize", schedule\)/);
  assert.match(nav, /window\.addEventListener\("hashchange", schedule\)/);
  assert.match(nav, /aria-current=\{isActive \? "location"/);
  assert.match(nav, /useSyncExternalStore\(subscribeToSettingsPosition/);
  assert.doesNotMatch(nav, /setActive/);
});

test("settings navigation stays visible and grouped on mobile", async () => {
  const nav = await read("components/pages/settings/settings-nav.tsx");
  assert.match(nav, /max-\[900px\]:top-\[72px\]/);
  assert.match(nav, /overflow-x-auto/);
  assert.match(nav, /data-settings-group-id/);
  assert.match(nav, /getSettingsGroupItems\(activeGroup\)/);
});

test("settings search and navigation share one destination model and phase 126 is in quality", async () => {
  const [search, pkg] = await Promise.all([
    read("components/pages/settings/settings-search.tsx"),
    read("package.json"),
  ]);
  assert.match(search, /settingsNavItems/);
  assert.match(search, /item\.keywords/);
  assert.match(pkg, /tests\/phase126-mobile-settings-navigation-polish\.test\.ts/);
  for (const path of [
    "components/pages/settings/settings-nav.tsx",
    "components/pages/settings/settings-navigation-model.ts",
    "components/layout/navigation/mobile-bottom-nav.tsx",
  ]) {
    const source = await read(path);
    assert.ok(source.split("\n").length <= 250, `${path} exceeds 250 lines`);
  }
});
