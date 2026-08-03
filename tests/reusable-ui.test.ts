import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("shared financial display is centralized", () => {
  const source = read("components/common/private-money.tsx");
  assert.match(source, /aria-label=/);
  assert.match(source, /money\(value\)/);
  assert.match(source, /••••••/);
});

test("metric card accepts reusable React content", () => {
  const source = read("components/common/metric-card.tsx");
  assert.match(source, /value: ReactNode/);
});

test("shared surface and alert primitives stay focused", () => {
  for (const path of [
    "components/common/surface-card.tsx",
    "components/common/alert-banner.tsx",
    "components/common/private-money.tsx",
  ]) {
    assert.ok(read(path).split("\n").length <= 100, `${path} is too large`);
  }
});
