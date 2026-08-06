import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("employee report chart uses Persian day labels and tap-friendly details", async () => {
  const utils = await read("components/pages/reports/charts/chart-utils.ts");
  const data = await read("components/pages/reports/charts/use-employee-chart-data.ts");
  const chart = await read("components/pages/reports/charts/employee-daily-chart.tsx");
  assert.match(utils, /formatPersianDayNumber/);
  assert.match(data, /day: formatPersianDayNumber\(date\)/);
  assert.match(chart, /روی ستون بزن/);
  assert.match(chart, /min-w-\[620px\]/);
  assert.doesNotMatch(chart, /<Legend/);
});

test("report charts use shared legends and explicit empty states", async () => {
  const employee = await read("components/pages/reports/charts/employee-daily-chart.tsx");
  const freelancer = await read("components/pages/reports/charts/freelancer-weekly-chart.tsx");
  const donut = await read("components/pages/reports/charts/donut-summary.tsx");
  assert.match(employee, /ChartLegend/);
  assert.match(freelancer, /ChartLegend/);
  assert.match(employee, /ChartEmptyState/);
  assert.match(freelancer, /ChartEmptyState/);
  assert.match(donut, /total > 0/);
  assert.match(donut, /داده کافی وجود ندارد/);
});

test("chart grid remains responsive and excluded from print", async () => {
  const shell = await read("components/pages/reports/charts/chart-shell.tsx");
  assert.match(shell, /report-charts/);
  assert.match(shell, /print:hidden/);
  assert.match(shell, /grid-cols-\[minmax\(0,1\.3fr\)_minmax\(300px,0\.7fr\)\]/);
});
