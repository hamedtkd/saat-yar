import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shellPath = new URL("../components/saatyar-shell.tsx", import.meta.url);
const routeSyncPath = new URL("../components/layout/route-sync.tsx", import.meta.url);

test("search params are isolated behind a Suspense boundary", async () => {
  const [shell, routeSync] = await Promise.all([
    readFile(shellPath, "utf8"),
    readFile(routeSyncPath, "utf8"),
  ]);

  assert.doesNotMatch(shell, /useSearchParams/);
  assert.match(shell, /<Suspense fallback=\{null\}>/);
  assert.match(shell, /<RouteSync/);
  assert.match(routeSync, /useSearchParams\(\)/);
});

test("route sync keeps selected-date query behavior", async () => {
  const source = await readFile(routeSyncPath, "utf8");

  assert.match(source, /searchParams\.get\("date"\)/);
  assert.match(source, /\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/);
  assert.match(source, /setSelectedDate\(requestedDate\)/);
});
