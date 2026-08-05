import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const TARGETS = [
  "components/pages/reports",
  "components/pages/leave",
  "components/common",
  "components/ui/button.tsx",
];
const EXTENSIONS = new Set([".ts", ".tsx"]);
const FORBIDDEN = [
  /\bbg-(?:white|black)(?:\b|\/)/,
  /\btext-(?:white|black)\b/,
  /\bborder-(?:white|black)\b/,
  /#[0-9a-fA-F]{6}/,
];
const ALLOWED_HEX_FILES = new Set<string>();

async function collect(target: string): Promise<string[]> {
  const absolute = path.join(ROOT, target);
  if (EXTENSIONS.has(path.extname(target))) return [target];
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const relative = path.join(target, entry.name);
    if (entry.isDirectory()) return collect(relative);
    return EXTENSIONS.has(path.extname(entry.name)) ? [relative] : [];
  }));
  return nested.flat();
}

test("reports, leave and shared primitives use semantic theme tokens", async () => {
  const files = (await Promise.all(TARGETS.map(collect))).flat();
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(path.join(ROOT, file), "utf8");
    for (const pattern of FORBIDDEN) {
      if (pattern.test(source) && !(pattern.source.startsWith("#") && ALLOWED_HEX_FILES.has(file))) {
        violations.push(`${file}: ${pattern}`);
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Replace fixed visual colors with semantic theme tokens:\n${violations.join("\n")}`,
  );
});

test("chart colors are driven by CSS variables", async () => {
  const source = await readFile(path.join(ROOT, "components/pages/reports/charts/chart-utils.ts"), "utf8");
  assert.match(source, /var\(--accent\)/);
  assert.match(source, /var\(--chart-secondary\)/);
  assert.match(source, /var\(--danger\)/);
  assert.doesNotMatch(source, /#[0-9a-fA-F]{6}/);
});
