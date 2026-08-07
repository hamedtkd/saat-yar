import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("about page uses icons exported by the installed lucide contract", async () => {
  const source = await read("components/pages/about/about-page.tsx");
  assert.match(source, /icon: BookOpenCheck/);
  assert.match(source, /UserRound/);
  assert.doesNotMatch(source, /\bGithub\b/);
  assert.doesNotMatch(source, /\bLinkedin\b/);
});

test("desktop settings navigation groups can expand and collapse without owning active scroll state", async () => {
  const nav = await read("components/pages/settings/settings-nav.tsx");
  assert.match(nav, /groupOverrides/);
  assert.match(nav, /aria-expanded=\{isOpen\}/);
  assert.match(nav, /toggleGroup/);
  assert.match(nav, /const isOpen = groupOverrides\[group\.id\] \?\? isActiveGroup/);
  assert.match(nav, /useSyncExternalStore\(subscribeToSettingsPosition/);
  assert.doesNotMatch(nav, /setActive/);
});

test("mobile settings navigation exposes group chips and only the active group item strip", async () => {
  const nav = await read("components/pages/settings/settings-nav.tsx");
  assert.match(nav, /aria-pressed=\{isActiveGroup\}/);
  assert.match(nav, /navigateToGroup/);
  assert.match(nav, /getSettingsGroupItems\(activeGroup\)\.map/);
  assert.match(nav, /max-\[900px\]:grid/);
});

test("settings navigation model exposes typed group helpers", async () => {
  const model = await read("components/pages/settings/settings-navigation-model.ts");
  assert.match(model, /export type SettingsNavGroupId/);
  assert.match(model, /getSettingsGroupId/);
  assert.match(model, /getSettingsGroupItems/);
  assert.match(model, /settings-device-transfer/);
});

test("phase 128 is documented, wired into quality, and keeps navigation modules focused", async () => {
  const [pkg, backlog, docs] = await Promise.all([
    read("package.json"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/README.md"),
  ]);
  assert.match(pkg, /tests\/phase128-settings-navigation-groups\.test\.ts/);
  assert.match(backlog, /\[x\] فاز ۱۲۸/);
  assert.match(docs, /PHASE_128_NOTES_FA/);
  for (const path of [
    "components/pages/settings/settings-nav.tsx",
    "components/pages/settings/settings-navigation-model.ts",
  ]) {
    const source = await read(path);
    assert.ok(source.split("\n").length <= 250, `${path} exceeds 250 lines`);
  }
});
