import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("header controls share one height radius surface and interaction contract", async () => {
  const [styles, actions, workspace, profile] = await Promise.all([
    read("components/layout/app-header/header-control-styles.ts"),
    read("components/layout/app-header/header-actions.tsx"),
    read("components/layout/app-header/workspace-switcher.tsx"),
    read("components/layout/app-header/profile-menu.tsx"),
  ]);
  assert.match(styles, /h-11 rounded-\[14px\]/);
  assert.match(styles, /size-9 rounded-\[10px\]/);
  assert.match(actions, /headerControlShell/);
  assert.match(actions, /headerIconButton/);
  assert.match(workspace, /headerControlShell/);
  assert.match(profile, /headerControlShell/);
});

test("workspace trigger is a single compact Radix trigger instead of a mismatched nested shell", async () => {
  const source = await read("components/layout/app-header/workspace-switcher.tsx");
  assert.match(source, /min-w-\[132px\]/);
  assert.match(source, /max-\[520px\]:min-w-\[108px\]/);
  assert.match(source, /<SelectGroup>[\s\S]*<SelectLabel>[\s\S]*<SelectItem value="employee">[\s\S]*<\/SelectGroup>/);
  assert.doesNotMatch(source, /<div className="flex h-10/);
});

test("profile trigger reads as a real profile with a round avatar and local identity", async () => {
  const source = await read("components/layout/app-header/profile-menu.tsx");
  assert.match(source, /function ProfileAvatar/);
  assert.match(source, /rounded-full/);
  assert.match(source, /bg-\[var\(--success\)\]/);
  assert.match(source, /t\("profile\.local"\)/);
  assert.match(source, /aria-label=\{t\("profile\.aria"/);
  assert.match(source, /max-\[520px\]:w-11/);
});

test("sidebar brand is a guarded shortcut back to today", async () => {
  const source = await read("components/layout/navigation/sidebar-nav.tsx");
  assert.match(source, /<GuardedLink[\s\S]*href="\/today"[\s\S]*aria-label=\{t\("nav\.goToday"\)\}[\s\S]*<Brand/);
});

test("phase 125 stays inside architecture limits and is wired into quality", async () => {
  for (const path of [
    "components/layout/app-header/header-control-styles.ts",
    "components/layout/app-header/header-actions.tsx",
    "components/layout/app-header/workspace-switcher.tsx",
    "components/layout/app-header/profile-menu.tsx",
  ]) {
    const source = await read(path);
    assert.ok(source.split("\n").length <= 250, `${path} exceeds 250 lines`);
  }
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts.test, /tests\/phase125-header-control-profile-polish\.test\.ts/);
});
