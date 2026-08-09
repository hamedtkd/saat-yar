import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

test("GitHub root README is the canonical English project overview", () => {
  const readme = read("README.md");
  assert.match(readme, /^<div align="center">/);
  assert.match(readme, /# Saatyar/);
  assert.match(readme, /## What is Saatyar\?/);
  assert.match(readme, /\[فارسی\]\(\.\/README_FA\.md\)/);
  assert.match(readme, /more than \*\*600 tests\*\*/i);
});

test("Persian README remains complete and links back to the canonical English README", () => {
  const readme = read("README_FA.md");
  assert.match(readme, /dir="rtl"/);
  assert.match(readme, /# ساعت‌یار/);
  assert.match(readme, /\[English\]\(\.\/README\.md\)/);
  assert.match(readme, /docs\/assets\/screenshots\/today-light-desktop\.png/);
  assert.match(readme, /RELEASE_NOTES_2\.3\.1_FA\.md/);
});

test("legacy English README path remains a compatibility pointer", () => {
  const legacy = read("README_EN.md");
  assert.match(legacy, /canonical English README/i);
  assert.match(legacy, /\[Open the canonical English README\]\(\.\/README\.md\)/);
  assert.match(legacy, /\[README فارسی\]\(\.\/README_FA\.md\)/);
});

test("documentation index and roadmap expose the new language contract and future i18n work", () => {
  const docs = read("docs/README.md");
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(docs, /English README — canonical GitHub README/);
  assert.match(docs, /README فارسی/);
  assert.match(docs, /PHASE_164_NOTES_FA\.md/);
  assert.match(backlog, /- \[x\] فاز ۱۶۴:/);
  assert.match(backlog, /## بین‌المللی‌سازی آینده/);
  assert.match(backlog, /Locale انگلیسی.*LTR/);
  assert.match(backlog, /`fa-IR \/ RTL`.*`en \/ LTR`/);
});

test("Phase 164 is documentation-only and wired into the main test command", () => {
  const notes = read("docs/phases/PHASE_164_NOTES_FA.md");
  assert.match(notes, /Runtime behavior: بدون تغییر/);
  assert.match(notes, /AppData schema: `v17`/);
  assert.match(notes, /Migration جدید: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(packageJson.scripts.test, /tests\/phase164-english-root-readme-i18n-roadmap\.test\.ts/);
});
