import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("global navigation provider owns the unsaved settings dialog", async () => {
  const provider = await read("components/layout/navigation/unsaved-navigation-provider.tsx");
  const shell = await read("components/saatyar-shell.tsx");

  assert.match(provider, /useSettingsNavigationGuard/);
  assert.match(provider, /<UnsavedSettingsDialog/);
  assert.match(provider, /dirtyLabels=\{guard\.unsaved\.dirtyLabels\}/);
  assert.match(shell, /<UnsavedNavigationProvider>/);
});

test("desktop and mobile routes use guarded links", async () => {
  const guardedLink = await read("components/layout/navigation/guarded-link.tsx");
  const sidebar = await read("components/layout/navigation/sidebar-nav.tsx");
  const mobile = await read("components/layout/navigation/mobile-bottom-nav.tsx");

  assert.match(guardedLink, /event\.preventDefault\(\)/);
  assert.match(guardedLink, /requestNavigation/);
  assert.doesNotMatch(sidebar, /from "next\/link"/);
  assert.match(sidebar, /GuardedLink/);
  assert.match(mobile, /GuardedLink/);
});

test("header route pushes wait for the unsaved guard", async () => {
  const header = await read("components/layout/app-header.tsx");

  assert.match(header, /const navigateToSettings = \(hash: string\) => \{/);
  assert.match(header, /requestNavigation\(\(\) => router\.push\(`\/settings#\$\{hash\}`\)\)/);
  assert.match(header, /requestNavigation\(\(\) => \{/);
  assert.match(header, /props\.onModeChange\(mode\);[\s\S]*router\.push\("\/today"\)/);
});

test("dirty draft labels are exposed in the confirmation dialog", async () => {
  const registry = await read("lib/settings-draft-registry.ts");
  const hook = await read("hooks/settings/use-settings-draft.ts");
  const dialog = await read("components/pages/settings/unsaved-settings-guard.tsx");

  assert.match(registry, /getUnsavedSettingsDraftLabels/);
  assert.match(hook, /label = "تنظیمات"/);
  assert.match(dialog, /dirtyLabels\.map/);
  assert.match(dialog, /• \{label\}/);
});
