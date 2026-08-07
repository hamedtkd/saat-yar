import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as {
  scripts: Record<string, string>;
};
const historicalManifest = JSON.parse(read("docs/releases/2.1.0.json")) as {
  version: string;
  releaseDate: string;
  status: string;
  dataSchemaVersion: number;
  nodeEngine: string;
  releaseNotes: { fa: string; en: string };
  releaseCommit: string;
  tag: string;
};

test("historical 2.1.0 release manifest remains immutable", () => {
  assert.equal(historicalManifest.version, "2.1.0");
  assert.equal(historicalManifest.dataSchemaVersion, 16);
  assert.equal(historicalManifest.nodeEngine, "22.x");
  assert.equal(historicalManifest.status, "released");
  assert.equal(historicalManifest.tag, "v2.1.0");
  assert.equal(historicalManifest.releaseCommit, "0901b67");
});

test("release gate keeps quality audit and production browser smoke in order", () => {
  assert.deepEqual(
    packageJson.scripts["check:release"].split("&&").map((step) => step.trim()),
    [
      "npm run check:quality",
      "npm run check:release:audit",
      "npm run test:browser:production:built",
    ],
  );
  assert.equal(
    packageJson.scripts["check:release:audit"],
    "node --experimental-strip-types scripts/release-audit.mjs",
  );
});

test("historical release notes and changelog entry remain available", () => {
  assert.ok(read(historicalManifest.releaseNotes.fa).includes("ساعت‌یار ۲.۱.۰"));
  assert.ok(read(historicalManifest.releaseNotes.en).includes("Saatyar 2.1.0"));
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes(`## [${historicalManifest.version}] - ${historicalManifest.releaseDate}`));
});

test("active release audit reports no static contract failures", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
});

test("phase 99 contract test remains part of the main test command", () => {
  assert.ok(packageJson.scripts.test.split(/\s+/).includes("tests/phase99-release-readiness.test.ts"));
});
