import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const settingsNavPath = new URL("../components/pages/settings/settings-nav.tsx", import.meta.url);
const shellPath = new URL("../components/saatyar-shell.tsx", import.meta.url);
const routeGuardPath = new URL("../components/layout/navigation/route-guard.tsx", import.meta.url);

test("settings navigation derives scroll and hash state without effect-driven setState", async () => {
  const source = await readFile(settingsNavPath, "utf8");
  assert.match(source, /useSyncExternalStore\(subscribeToSettingsPosition, getVisibleSettingsItem/);
  const effectBody = source.match(/useEffect\(\(\) => \{([\s\S]*?)\n  \}, \[\]\);/)?.[1] ?? "";
  assert.doesNotMatch(effectBody, /set[A-Z][A-Za-z0-9_]*\(/);
  assert.match(source, /cancelAnimationFrame\(frame\)/);
  assert.match(source, /window\.addEventListener\("hashchange", schedule\)/);
  assert.match(source, /window\.addEventListener\("scroll", schedule/);
});

test("route effects depend on stable fields instead of the controller object", async () => {
  const shell = await readFile(shellPath, "utf8");
  const guard = await readFile(routeGuardPath, "utf8");
  assert.match(shell, /const \{ ready, selectedDate, setSelectedDate, data \} = controller;/);
  assert.doesNotMatch(shell, /\[controller\./);
  assert.doesNotMatch(shell, /useSearchParams/);
  assert.match(guard, /\[mode, pathname, ready, router\]/);
});
