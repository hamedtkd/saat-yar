import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as {
  version: string;
  engines: { node: string };
  scripts: Record<string, string>;
};
const packageLock = JSON.parse(read("package-lock.json")) as {
  version: string;
  packages: Record<string, { version?: string }>;
};
const manifest = JSON.parse(read("docs/releases/2.1.0.json")) as {
  version: string;
  releaseDate: string;
  status: string;
  dataSchemaVersion: number;
  nodeEngine: string;
  releaseNotes: { fa: string; en: string };
};

test("release manifest aligns package, lockfile, Node and AppData schema", () => {
  assert.equal(manifest.version, "2.1.0");
  assert.equal(packageJson.version, manifest.version);
  assert.equal(packageLock.version, manifest.version);
  assert.equal(packageLock.packages[""]?.version, manifest.version);
  assert.equal(packageJson.engines.node, manifest.nodeEngine);
  assert.equal(APP_DATA_SCHEMA_VERSION, manifest.dataSchemaVersion);
  assert.equal(manifest.status, "release-candidate");
});

test("release gate keeps quality, audit and production browser smoke in order", () => {
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

test("release notes, changelog and checklist expose the same release", () => {
  assert.ok(read(manifest.releaseNotes.fa).includes("ساعت‌یار ۲.۱.۰"));
  assert.ok(read(manifest.releaseNotes.en).includes("Saatyar 2.1.0"));
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes(`## [${manifest.version}] - ${manifest.releaseDate}`));
  assert.equal(read("RELEASE_CHECKLIST_FA.md").split(/\r?\n/)[0], `# چک‌لیست انتشار ساعت‌یار ${manifest.version}`);
});

test("release audit reports no static contract failures", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
});

test("phase 99 contract test is part of the main test command", () => {
  assert.ok(packageJson.scripts.test.split(/\s+/).includes("tests/phase99-release-readiness.test.ts"));
});
