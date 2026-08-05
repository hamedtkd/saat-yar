import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("route responsibilities stay split between guard and query sync", async () => {
  const shell = await read("components/saatyar-shell.tsx");
  const guard = await read("components/layout/navigation/route-guard.tsx");
  const sync = await read("components/layout/route-sync.tsx");

  assert.match(shell, /<RouteGuard/);
  assert.match(shell, /<RouteSync/);
  assert.doesNotMatch(shell, /useSearchParams/);
  assert.doesNotMatch(shell, /localStorage/);
  assert.match(guard, /LAST_ROUTE_STORAGE_KEY/);
  assert.match(sync, /useSearchParams/);
});

test("root route restores the last allowed page", async () => {
  const guard = await read("components/layout/navigation/route-guard.tsx");
  assert.match(guard, /normalized === "\/"/);
  assert.match(guard, /localStorage\.getItem\(LAST_ROUTE_STORAGE_KEY\)/);
  assert.match(guard, /storedTab && isTabAllowed/);
});

test("navigation rules are centralized and normalize trailing slashes", async () => {
  const navigation = await read("lib/navigation.ts");
  assert.match(navigation, /export const TAB_ROUTES/);
  assert.match(navigation, /export const ALLOWED_TABS/);
  assert.match(navigation, /replace\(\/\\\/\+\$\//);
});
