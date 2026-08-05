import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path: string) { return readFile(path, "utf8"); }

test("today and month use shared themed surfaces", async () => {
  const files = [
    "components/pages/today/today-focus-card.tsx",
    "components/pages/today/today-metrics.tsx",
    "components/pages/today/today-smart-summary.tsx",
    "components/pages/month/month-page.tsx",
  ];
  for (const file of files) {
    const value = await source(file);
    assert.match(value, /SurfaceCard|MetricCard|PageHeading/);
  }
});

test("storage key remains exported for the IndexedDB adapter", async () => {
  const value = await source("lib/data/version.ts");
  assert.match(value, /APP_DATA_STORAGE_KEY/);
});

test("repository architecture assertion avoids invalid undefined predicate", async () => {
  const value = await source("tests/repository-architecture.test.ts");
  assert.doesNotMatch(value, /assert\.rejects\([\s\S]*?undefined,/);
});
