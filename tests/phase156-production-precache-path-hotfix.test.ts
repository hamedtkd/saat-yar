import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  isNextStaticAsset,
  normalizePrecachePath,
  parsePrecacheEntries,
} from "../scripts/remote-production-audit.mjs";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("production audit parses the exact relative precache format emitted by finalize-static-pwa", () => {
  const source = 'self.__SAATYAR_PRECACHE = ["_next/static/chunks/a.js","_next/static/css/b.css"];\n';
  const entries = parsePrecacheEntries(source);
  assert.deepEqual(entries, ["_next/static/chunks/a.js", "_next/static/css/b.css"]);
  assert.equal(entries.filter(isNextStaticAsset).length, 2);
});

test("precache build asset detection remains tolerant of a future leading slash", () => {
  assert.equal(normalizePrecachePath("/_next/static/chunks/a.js"), "_next/static/chunks/a.js");
  assert.equal(isNextStaticAsset("/_next/static/chunks/a.js"), true);
  assert.equal(isNextStaticAsset("_next/static/chunks/a.js"), true);
  assert.equal(isNextStaticAsset("icons/icon-192.png"), false);
});

test("production audit no longer counts Next assets with a brittle leading-slash regex", async () => {
  const source = await read("scripts/remote-production-audit.mjs");
  assert.match(source, /parsePrecacheEntries\(precacheResult\.body\)/);
  assert.match(source, /precacheEntries\.filter\(isNextStaticAsset\)/);
  assert.doesNotMatch(source, /match\(\/\\\/_next\\\/static\\\//);
  assert.match(source, /Precached build asset/);
});

test("phase 156 documents the production audit false negative without mutating the released manifest", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const release = JSON.parse(await read("docs/releases/2.3.0.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  assert.match(packageJson.scripts.test, /phase156-production-precache-path-hotfix\.test\.ts/);
  assert.equal(release.status, "released");
  assert.equal(release.expectedFinalTestCount, 581);
  assert.match(roadmap, /فاز ۱۵۶: اصلاح false negative Audit Precache Production/);
});
