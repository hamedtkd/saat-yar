import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");
const smoke = read("scripts/freelancer-browser-ux-smoke.mjs");

test("in-app route discovery normalizes static-export trailing slashes", () => {
  assert.ok(smoke.includes('pathname.replace(/\\/+$/, "") || "/"'));
  assert.match(smoke, /candidate === wantedPath/);
  assert.match(smoke, /candidate\.endsWith\(wantedPath\)/);
  assert.match(smoke, /labels = \{ "\/projects": "پروژه‌ها"/);
  assert.match(smoke, /normalizeText\(item\.textContent\)\.includes\(labels\[wantedPath\]\)/);
});

test("route transition wait accepts both slash and non-slash pathnames", () => {
  assert.match(smoke, /const current = normalize\(location\.pathname\)/);
  assert.match(smoke, /const wanted = normalize\(\$\{JSON\.stringify\(pathname\)\}\)/);
  assert.match(smoke, /current === wanted \|\| \(wanted !== "\/" && current\.endsWith\(wanted\)\)/);
});

test("missing app links report the rendered href and label inventory", () => {
  assert.match(smoke, /available: anchors\.slice\(0, 24\)/);
  assert.match(smoke, /href: item\.getAttribute\("href"\)/);
  assert.match(smoke, /pathname: normalize\(item\.href\)/);
  assert.match(smoke, /Available anchors:/);
});

test("phase 138 documents the trailing-slash smoke correction without product changes", () => {
  const pkg = read("package.json");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_138_NOTES_FA.md");
  assert.match(pkg, /phase138-trailing-slash-navigation-smoke\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۳۸:/);
  assert.match(notes, /trailingSlash/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
