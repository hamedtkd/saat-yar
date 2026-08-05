import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const settingsNavPath = new URL("../components/pages/settings/settings-nav.tsx", import.meta.url);
const shellPath = new URL("../components/saatyar-shell.tsx", import.meta.url);

test("settings navigation derives initial hash state without setState in an effect", async () => {
  const source = await readFile(settingsNavPath, "utf8");
  assert.match(source, /useState<SettingsSectionId>\(getInitialSection\)/);
  const effectBody = source.match(/useEffect\(\(\) => \{([\s\S]*?)\n  \}, \[\]\);/)?.[1] ?? "";
  assert.doesNotMatch(effectBody, /setActive\(/);
  assert.match(source, /cancelAnimationFrame\(frame\)/);
});

test("shell effect depends on stable controller fields instead of the controller object", async () => {
  const source = await readFile(shellPath, "utf8");
  assert.match(source, /const \{ ready, selectedDate, setSelectedDate, data \} = controller;/);
  assert.doesNotMatch(source, /\[controller\./);
  assert.match(source, /\[mode, pathTab, ready, requestedDate, router, selectedDate, setSelectedDate\]/);
});
