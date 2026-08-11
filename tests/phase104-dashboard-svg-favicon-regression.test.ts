import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("shell sizes only lucide SVG icons instead of every custom visualization", () => {
  const shell = read("components/saatyar-shell.tsx");
  assert.doesNotMatch(shell, /\[&_svg\]:h-\[18px\]/);
  assert.match(shell, /\[&_svg\.lucide\]:h-\[18px\]/);
});

test("today progress arc keeps an independent responsive layout box", () => {
  const source = read("components/pages/today/today-progress-arc.tsx");
  assert.match(source, /aspect-square w-full max-w-\[320px\]/);
  assert.match(source, /data-dashboard-visual="progress-arc"/);
  assert.match(source, /className="absolute inset-0 block h-full w-full overflow-visible"/);
});

test("static favicon SVG uses a tight viewBox without the oversized halo", () => {
  for (const path of ["app/icon.svg", "public/favicon.svg"]) {
    const source = read(path);
    assert.match(source, /viewBox="560 480 960 960"/);
    assert.doesNotMatch(source, /<circle class="saatyar-halo"/);
  }
});

test("dynamic favicon applies the same tight crop and remains theme-aware", () => {
  const source = read("components/theme/theme-runtime.tsx");
  assert.match(source, /viewBox=\"560 480 960 960\"/);
  assert.match(source, /fill=\"\$\{accent\}\"/);
  assert.match(source, /fill=\"\$\{strong\}\"/);
  assert.match(source, /setAttribute\("sizes", "any"\)/);
});

test("phase 104 regression test is part of the main quality command", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts.test, /phase104-dashboard-svg-favicon-regression\.test\.ts/);
});
