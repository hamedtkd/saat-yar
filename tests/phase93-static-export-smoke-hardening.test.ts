import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { browserExecutableCandidates } from "../scripts/production-browser-smoke.mjs";
import {
  startStaticExportServer,
  staticExportFileCandidates,
} from "../scripts/static-export-server.mjs";

test("browser discovery accepts a partial environment and returns only strings", () => {
  const candidates = browserExecutableCandidates({
    SAATYAR_BROWSER_PATH: "D:\\Portable\\chrome.exe",
    PROGRAMFILES: "C:\\Program Files",
  }, "win32");

  assert.equal(candidates[0], "D:\\Portable\\chrome.exe");
  assert.ok(candidates.length > 1);
  assert.ok(candidates.every((candidate) => typeof candidate === "string"));
});

test("static export routing resolves root, trailing routes and direct assets", () => {
  const outputDirectory = join(tmpdir(), "saatyar-static-routing");
  assert.deepEqual(
    staticExportFileCandidates("/", outputDirectory),
    [join(outputDirectory, "index.html")],
  );
  assert.deepEqual(
    staticExportFileCandidates("/today/", outputDirectory),
    [join(outputDirectory, "today", "index.html")],
  );
  assert.deepEqual(
    staticExportFileCandidates("/_next/static/app.js", outputDirectory),
    [join(outputDirectory, "_next", "static", "app.js")],
  );
  assert.deepEqual(staticExportFileCandidates("/%E0%A4%A", outputDirectory), []);
});

test("dependency-free server serves Next static export routes and 404 output", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "saatyar-static-server-"));
  await mkdir(join(outputDirectory, "today"), { recursive: true });
  await mkdir(join(outputDirectory, "_next", "static"), { recursive: true });
  await writeFile(join(outputDirectory, "index.html"), "<h1>root</h1>");
  await writeFile(join(outputDirectory, "today", "index.html"), "<h1>today</h1>");
  await writeFile(join(outputDirectory, "404.html"), "<h1>missing</h1>");
  await writeFile(join(outputDirectory, "_next", "static", "app.js"), "console.log('ok')");

  const server = await startStaticExportServer({ outputDirectory });
  try {
    const root = await fetch(`${server.origin}/`);
    assert.equal(root.status, 200);
    assert.match(await root.text(), /root/);

    const route = await fetch(`${server.origin}/today/`);
    assert.equal(route.status, 200);
    assert.match(await route.text(), /today/);

    const asset = await fetch(`${server.origin}/_next/static/app.js`);
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get("content-type") ?? "", /text\/javascript/);
    assert.match(asset.headers.get("cache-control") ?? "", /immutable/);

    const missing = await fetch(`${server.origin}/unknown/`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /missing/);
  } finally {
    await server.close();
    await rm(outputDirectory, { recursive: true, force: true });
  }
});
