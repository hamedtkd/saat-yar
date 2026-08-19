import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("shell uses one responsive desktop offset contract", async () => {
  const [shell, header, sidebar, css] = await Promise.all([
    read("components/saatyar-shell.tsx"),
    read("components/layout/app-header.tsx"),
    read("components/layout/navigation/sidebar-nav.tsx"),
    read("app/globals.css"),
  ]);
  assert.match(css, /--shell-sidebar-width: 248px/);
  assert.match(css, /--shell-content-offset: 264px/);
  assert.match(shell, /shell-main-offset/);
  assert.match(header, /shell-main-offset/);
  assert.match(sidebar, /w-\[var\(--shell-sidebar-width\)\]/);
});

test("header keeps route context, profile identity and theme-aware workspace controls", async () => {
  const [header, actions, switcher, profile] = await Promise.all([
    read("components/layout/app-header.tsx"),
    read("components/layout/app-header/header-actions.tsx"),
    read("components/layout/app-header/workspace-switcher.tsx"),
    read("components/layout/app-header/profile-menu.tsx"),
  ]);
  assert.match(header, /getRouteNavItem/);
  assert.match(header, /<ProfileMenu/);
  assert.match(profile, /t\("profile\.local"\)/);
  assert.match(actions, /<WorkspaceSwitcher/);
  assert.match(switcher, /max-\[520px\]:min-w-0/);
  assert.match(switcher, /max-\[520px\]:size-10/);
});

test("mobile navigation chooses stable primary destinations per work mode", async () => {
  const [items, mobile] = await Promise.all([
    read("components/layout/app-header/nav-items.ts"),
    read("components/layout/navigation/mobile-bottom-nav.tsx"),
  ]);
  assert.match(items, /employee: \["today", "month", "leave", "reports"\]/);
  assert.match(items, /freelancer: \["today", "clients", "projects", "reports"\]/);
  assert.match(items, /hybrid: \["today", "month", "projects", "reports"\]/);
  assert.match(mobile, /getMobilePrimaryNavItems/);
  assert.match(mobile, /env\(safe-area-inset-bottom\)/);
  assert.match(mobile, /max-w-\[520px\]/);
});

test("desktop and mobile navigation preserve semantic theme surfaces", async () => {
  const source = (await Promise.all([
    read("components/layout/navigation/sidebar-nav.tsx"),
    read("components/layout/navigation/mobile-bottom-nav.tsx"),
    read("components/layout/app-header.tsx"),
  ])).join("\n");
  for (const legacy of ["bg-white", "text-white", "bg-black", "text-black"]) {
    assert.equal(source.includes(legacy), false, `hard-coded theme color returned: ${legacy}`);
  }
  assert.match(source, /var\(--accent\)/);
  assert.match(source, /var\(--surface-glass\)/);
});

test("phase 102 contract is part of the main test command", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts.test, /tests\/phase102-shell-responsive-freeze\.test\.ts/);
});
