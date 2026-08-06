import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("daily record reset keeps a temporary snapshot and exposes undo", async () => {
  const source = await read("hooks/controller/use-attendance-actions.ts");
  assert.match(source, /setResetUndo\(\{ date: selectedDate, record: snapshot \}\)/);
  assert.match(source, /window\.setTimeout\(\(\) => setResetUndo\(undefined\), 10_000\)/);
  assert.match(source, /function undoResetRecord\(\)/);
  assert.match(source, /\[resetUndo\.date\]: restored/);
});

test("today page renders an accessible undo action after reset", async () => {
  const page = await read("components/pages/today/today-page.tsx");
  const banner = await read("components/pages/today/record-reset-undo.tsx");
  assert.match(page, /<RecordResetUndo date=\{props\.resetUndoDate\}/);
  assert.match(banner, /role="status" aria-live="polite"/);
  assert.match(banner, /بازگردانی رکورد/);
});
