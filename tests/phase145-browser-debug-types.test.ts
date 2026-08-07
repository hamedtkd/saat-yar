import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { launchBrowserDebugTarget } from "../scripts/browser-debug-startup.mjs";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

// This function is never executed. Its purpose is to keep the strict TypeScript
// consumer contract alive in the same compilation that runs `npm run typecheck`.
function compileBrowserLaunchStringArgs() {
  return launchBrowserDebugTarget({
    executable: "fake-browser",
    profilePrefix: "phase145-",
    extraArgs: ["--disable-sync"],
    attempts: 1,
  });
}
void compileBrowserLaunchStringArgs;

test("browser startup helper exposes string extraArgs to strict TypeScript consumers", async () => {
  const source = await read("scripts/browser-debug-startup.mjs");
  assert.match(source, /@typedef \{Object\} BrowserDebugLaunchOptions/);
  assert.match(source, /@property \{string\[\]\} \[extraArgs\]/);
  assert.match(source, /@param \{BrowserDebugLaunchOptions\} options/);
});

test("phase 144 runtime retry test keeps a real string browser argument", async () => {
  const source = await read("tests/phase144-browser-debug-startup-retry.test.ts");
  assert.match(source, /extraArgs: \["--disable-sync"\]/);
  assert.doesNotMatch(source, /extraArgs:[^\n]+as never/);
});

test("phase 145 closes the type-only startup regression before the 2.3.0 candidate", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_145_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase145-browser-debug-types\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۵: رفع TypeScript contract/);
  assert.match(roadmap, /\[ \] فاز ۱۴۶: آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /\[ \] فاز ۱۴۷: نهایی‌سازی Release 2\.3\.0/);
  assert.match(notes, /Schema.*v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
