import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inspectVercelStaticExportContract } from "../scripts/vercel-static-export-contract.mjs";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("Vercel publishes the finalized static export instead of the source public directory", async () => {
  const config = JSON.parse(await read("vercel.json"));
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, "npm run build:vercel");
  assert.equal(config.outputDirectory, "out");
});

test("Vercel build keeps Next static export and PWA finalization in one command", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const nextConfig = await read("next.config.ts");
  const finalizer = await read("scripts/finalize-static-pwa.mjs");
  assert.equal(packageJson.scripts["build:vercel"], "next build && node scripts/finalize-static-pwa.mjs");
  assert.match(nextConfig, /output:\s*["']export["']/);
  assert.match(nextConfig, /trailingSlash:\s*true/);
  assert.match(finalizer, /resolve\(ROOT,\s*["']out["']\)/);
  assert.match(finalizer, /pwa-precache-manifest\.js/);
});

test("source precache placeholder is allowed because Vercel serves finalized out", async () => {
  const placeholder = await read("public/pwa-precache-manifest.js");
  const config = JSON.parse(await read("vercel.json"));
  assert.match(placeholder, /self\.__SAATYAR_PRECACHE\s*=\s*\[\]/);
  assert.equal(config.outputDirectory, "out");
});

test("standalone Vercel deployment contract reports the intended static publication", async () => {
  const result = await inspectVercelStaticExportContract();
  assert.equal(result.ok, true, result.failures.join("\n"));
  assert.equal(result.framework, null);
  assert.equal(result.outputDirectory, "out");
});

test("phase 157 is post-release deployment hardening and leaves v2.3.0 immutable", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const release = JSON.parse(await read("docs/releases/2.3.0.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  assert.equal(packageJson.version, "2.3.0");
  assert.equal(packageJson.scripts["audit:vercel"], "node scripts/vercel-static-export-contract.mjs");
  assert.match(packageJson.scripts.test, /phase157-vercel-static-output-contract\.test\.ts/);
  assert.equal(release.status, "released");
  assert.equal(release.expectedFinalTestCount, 581);
  assert.match(roadmap, /فاز ۱۵۷: قرارداد Deploy استاتیک Vercel/);
});
