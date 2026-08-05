import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const roots = ["components/pages/month", "components/pickers", "components/layout/navigation", "components/common"];
const banned = [/bg-white(?:\b|\/)/, /bg-black(?:\b|\/)/, /text-white\b/, /text-black\b/];

function files(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? files(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test("audited responsive modules use semantic theme surfaces", () => {
  const violations = roots.flatMap(files).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    return banned.filter((pattern) => pattern.test(source)).map((pattern) => `${path}: ${pattern}`);
  });
  assert.deepEqual(violations, []);
});

test("modal overlays and chart colors use shared tokens", () => {
  const dateDialog = readFileSync("components/pickers/jalali-date-picker/date-picker-dialog.tsx", "utf8");
  const timeDialog = readFileSync("components/pickers/time-picker/time-picker-dialog.tsx", "utf8");
  const chart = readFileSync("components/pages/month/weekly-chart/weekly-chart-visual.tsx", "utf8");
  assert.match(dateDialog, /var\(--overlay\)/);
  assert.match(timeDialog, /var\(--overlay\)/);
  assert.match(chart, /MONTH_CHART_THEME/);
});

test("project alerts allow title-only messages", () => {
  const banner = readFileSync("components/common/alert-banner.tsx", "utf8");
  assert.match(banner, /children\?: ReactNode/);
});
