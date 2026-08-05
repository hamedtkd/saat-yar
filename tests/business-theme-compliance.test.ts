import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const roots = [
  "components/pages/clients",
  "components/pages/projects",
  "components/pages/invoices",
  "components/ui/input.tsx",
  "components/ui/select.tsx",
];

async function collect(path: string): Promise<string[]> {
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => collect(join(path, entry.name))))).flat();
}

test("business pages use semantic theme tokens", async () => {
  const files = (await Promise.all(roots.map(collect))).flat();
  const forbidden = /(?:bg|text|border)-(?:white|black|red|amber)-|#[0-9a-fA-F]{6}/;
  const violations = files.filter((file) => forbidden.test(readFileSync(file, "utf8")));
  assert.deepEqual(violations, [], `Fixed colors found in: ${violations.join(", ")}`);
});

test("shared form controls follow theme tokens", () => {
  for (const file of ["components/ui/input.tsx", "components/ui/select.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /var\(--surface-2\)/);
    assert.match(source, /var\(--text\)/);
    assert.match(source, /var\(--border\)/);
    assert.match(source, /var\(--accent/);
  }
});

test("business finance views reuse shared privacy and progress primitives", () => {
  const projects = readFileSync("components/pages/projects/project-list.tsx", "utf8") + readFileSync("components/pages/projects/detail/project-summary.tsx", "utf8");
  const invoices = readFileSync("components/pages/invoices/table/invoice-row.tsx", "utf8");
  assert.match(projects, /ProgressBar/);
  assert.match(projects, /PrivateMoney/);
  assert.match(invoices, /PrivateMoney/);
});
