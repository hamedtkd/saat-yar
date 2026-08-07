import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path: string) => fs.readFileSync(path, "utf8");

test("phase 133 regression stays compatible with the repository ES2017 target", () => {
  const source = read("tests/phase133-freelancer-form-ux-audit.test.ts");
  assert.doesNotMatch(source, /\/s\);/);
  assert.match(source, /Expense\[\\s\\S\]\*ProjectDetail/);
});

test("release gate runs the built freelancer browser UX smoke after production smoke", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts["test:browser:freelancer"], /build:vercel/);
  assert.match(pkg.scripts["test:browser:freelancer:built"], /freelancer-browser-ux-smoke\.mjs/);
  assert.match(pkg.scripts["check:release"], /test:browser:production:built.*test:browser:freelancer:built/);
});

test("freelancer browser smoke covers the real client project time expense invoice path", () => {
  const source = read("scripts/freelancer-browser-ux-smoke.mjs");
  for (const marker of ["مشتری مرورگر", "پروژه مرورگر", "شروع تایمر", "هزینه مرورگر", "خدمات مرورگر"]) {
    assert.match(source, new RegExp(marker));
  }
  assert.match(source, /data\.settings\.mode = "freelancer"/);
  assert.match(source, /seedFreelancerData/);
});

test("browser UX smoke exercises keyboard focus validation and mobile viewport contracts", () => {
  const source = read("scripts/freelancer-browser-ux-smoke.mjs");
  assert.match(source, /Input\.dispatchKeyEvent/);
  assert.match(source, /role=.*alert/);
  assert.match(source, /focusTrapped/);
  assert.match(source, /width: 390, height: 844/);
  assert.match(source, /dialogFits/);
});

test("phase 134 is documented and wired into quality without schema or dependency changes", () => {
  const pkg = read("package.json");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_134_NOTES_FA.md");
  assert.match(pkg, /phase134-freelancer-browser-ux\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۳۴:/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
