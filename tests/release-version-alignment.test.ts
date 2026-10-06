import assert from "node:assert/strict";
import test from "node:test";
import { collectPackageVersionAlignmentFailures } from "../scripts/release-audit.mjs";

function metadata(version: string) {
  return {
    packageJson: { version },
    packageLock: { version, packages: { "": { version } } },
  };
}

test("current release audit accepts aligned package and lock versions without a fixed version", () => {
  for (const version of ["2.7.0", "2.8.0", "3.0.0"]) {
    const { packageJson, packageLock } = metadata(version);
    assert.deepEqual(collectPackageVersionAlignmentFailures(packageJson, packageLock), []);
  }
});

test("current release audit rejects package and lock version mismatches", () => {
  const packageJson = { version: "2.7.0" };
  const packageLock = { version: "2.6.1", packages: { "": { version: "2.7.0" } } };
  assert.deepEqual(collectPackageVersionAlignmentFailures(packageJson, packageLock), [
    "package-lock version must match package.json.",
  ]);
});

test("current release audit checks the package-lock root package version", () => {
  const packageJson = { version: "2.7.0" };
  const packageLock = { version: "2.7.0", packages: { "": { version: "2.6.1" } } };
  assert.deepEqual(collectPackageVersionAlignmentFailures(packageJson, packageLock), [
    "package-lock root package version must match package.json.",
  ]);
});
