import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("production audit defaults to the released Saatyar Vercel origin and requires HTTPS", async () => {
  const source = await read("scripts/remote-production-audit.mjs");
  assert.match(source, /DEFAULT_PRODUCTION_URL = "https:\/\/saat-yar\.vercel\.app\/"/);
  assert.match(source, /Production audit requires HTTPS/);
  assert.match(source, /SAATYAR_PRODUCTION_URL/);
});

test("production audit covers every public product route including settings", async () => {
  const source = await read("scripts/remote-production-audit.mjs");
  for (const path of ["/", "/today/", "/month/", "/leave/", "/reports/", "/clients/", "/projects/", "/invoices/", "/settings/", "/about/"]) {
    assert.match(source, new RegExp(JSON.stringify(path).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(source, /Persian RTL app shell/);
});

test("production audit verifies PWA manifest service worker precache and install icons", async () => {
  const source = await read("scripts/remote-production-audit.mjs");
  assert.match(source, /manifest\.webmanifest/);
  assert.match(source, /\/sw\.js/);
  assert.match(source, /pwa-precache-manifest\.js/);
  assert.match(source, /icon-192\.png/);
  assert.match(source, /icon-512\.png/);
  assert.match(source, /maskable-512\.png/);
  assert.match(source, /start_url !== "\/today\/"/);
});

test("production audit verifies robots and sitemap stay on the production origin", async () => {
  const source = await read("scripts/remote-production-audit.mjs");
  assert.match(source, /robots\.txt/);
  assert.match(source, /sitemap\.xml/);
  assert.match(source, /redirected outside the production origin/);
  assert.match(source, /sitemap\.xml is missing/);
});

test("phase 155 keeps the remote production audit and historical 2.3.0 manifest intact", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const release = JSON.parse(await read("docs/releases/2.3.0.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  assert.equal(packageJson.scripts["audit:production"], "node scripts/remote-production-audit.mjs");
  assert.match(packageJson.scripts.test, /phase155-production-domain-audit\.test\.ts/);
  assert.equal(release.status, "released");
  assert.equal(release.expectedFinalTestCount, 581);
  assert.match(roadmap, /فاز ۱۵۵: Audit پس از انتشار روی دامنه واقعی/);
});
